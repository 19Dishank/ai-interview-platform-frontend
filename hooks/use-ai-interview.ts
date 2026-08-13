"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  startInterviewSession,
  fetchInterviewEvaluation,
} from "@/services/interview/interview.services";
import type {
  StartInterviewForm,
  InterviewStatus,
  InterviewEvaluation,
} from "@/types/interview.types";

const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "wss://w2r81bm2-3000.inc1.devtunnels.ms";

/**
 * Resamples Float32 audio channel data down to 16kHz PCM Int16Array safely
 * across all browser native AudioContext sample rates (e.g. 48kHz, 44.1kHz).
 */
function _downsampleTo16kHz(inputData: Float32Array, sampleRate: number): Int16Array {
  if (sampleRate === 16000) {
    const output = new Int16Array(inputData.length);
    for (let i = 0; i < inputData.length; i++) {
      const s = Math.max(-1, Math.min(1, inputData[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return output;
  }
  const ratio = sampleRate / 16000;
  const newLength = Math.round(inputData.length / ratio);
  const output = new Int16Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const originIndex = Math.floor(i * ratio);
    const s = Math.max(-1, Math.min(1, inputData[originIndex] ?? 0));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return output;
}

export function useAIInterview() {
  const [status, setStatus] = useState<InterviewStatus>("IDLE");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<
    Array<{ role: "AI" | "CANDIDATE"; text: string }>
  >([]);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const isManualEndRef = useRef<boolean>(false);
  const currentSessionRef = useRef<{ sessionId: string; token: string } | null>(null);

  const MAX_RECONNECT_ATTEMPTS = 5;

  const _stopHeartbeat = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  const _startHeartbeat = useCallback(
    (ws: WebSocket) => {
      _stopHeartbeat();
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify({ event: "ping" }));
          } catch (e) {
            console.warn("Heartbeat ping send note:", e);
          }
        }
      }, 15000);
    },
    [_stopHeartbeat]
  );

  const _playBinaryAudio = useCallback(async (buffer: ArrayBuffer) => {
    try {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current || audioContextRef.current.state === "closed") {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const audioBuffer = await ctx.decodeAudioData(buffer.slice(0));
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch (e) {
      console.warn("Binary audio playback note:", e);
    }
  }, []);

  const _playBase64Audio = useCallback(async (base64OrUrl: string) => {
    try {
      const audio = new Audio(
        base64OrUrl.startsWith("http") || base64OrUrl.startsWith("data:")
          ? base64OrUrl
          : `data:audio/mp3;base64,${base64OrUrl}`
      );
      await audio.play();
    } catch (e) {
      console.warn("Base64 audio playback note:", e);
    }
  }, []);

  const _speakAIText = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const englishVoice =
        voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Google") ||
              v.name.includes("Natural") ||
              v.name.includes("Alex") ||
              v.name.includes("US"))
        ) || voices.find((v) => v.lang.startsWith("en"));
      if (englishVoice) utterance.voice = englishVoice;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis note:", e);
    }
  }, []);

  const _appendTurn = useCallback(
    (role: "AI" | "CANDIDATE", text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      setTranscript((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === role && last.text === trimmed) {
          return prev;
        }
        return [...prev, { role, text: trimmed }];
      });

      if (role === "AI") {
        _speakAIText(trimmed);
      }
    },
    [_speakAIText]
  );

  const _stopAllMedia = useCallback(() => {
    _stopHeartbeat();
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    if (audioProcessorRef.current) {
      try {
        audioProcessorRef.current.disconnect();
      } catch {}
      audioProcessorRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setMediaStream(null);
    }
  }, [_stopHeartbeat]);

  const _startAudioStreaming = async (ws: WebSocket, stream: MediaStream) => {
    try {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0 || !audioTracks[0].enabled) {
        console.warn("⚠️ No active audio tracks found in media stream");
        return;
      }

      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (audioProcessorRef.current) {
        try {
          audioProcessorRef.current.disconnect();
        } catch {}
        audioProcessorRef.current = null;
      }

      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        try {
          audioContextRef.current.close();
        } catch {}
      }

      // Instantiate AudioContext using native system options for maximum compatibility
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      const nativeSampleRate = audioContext.sampleRate;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      audioProcessorRef.current = processor;

      source.connect(processor);
      processor.connect(audioContext.destination);

      let logCounter = 0;

      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return;

        // Backpressure Check: drop audio frame if socket send buffer exceeds 1MB
        if (ws.bufferedAmount > 1048576) {
          console.warn("⚠️ [WS BACKPRESSURE] High socket buffer load, dropping mic frame");
          return;
        }

        const inputData = e.inputBuffer.getChannelData(0);
        let maxPeak = 0;
        for (let i = 0; i < inputData.length; i++) {
          const absVal = Math.abs(inputData[i]);
          if (absVal > maxPeak) maxPeak = absVal;
        }

        const pcm16 = _downsampleTo16kHz(inputData, nativeSampleRate);
        const packet = new Uint8Array(pcm16.buffer.byteLength + 1);
        packet[0] = 0x01; // Audio prefix byte (16kHz PCM)
        packet.set(new Uint8Array(pcm16.buffer), 1);
        ws.send(packet.buffer);

        logCounter++;
        if (logCounter % 20 === 0 || maxPeak > 0.05) {
          console.log(
            `🎙️ [WS OUTGOING MIC AUDIO (0x01)] Sent ${packet.length} bytes | Mic Volume Peak: ${(
              maxPeak * 100
            ).toFixed(1)}%`
          );
        }
      };
      console.log(
        `🎙️ [Mic Streaming Initialized] Native ${nativeSampleRate}Hz resampled to 16kHz PCM`
      );
    } catch (err) {
      console.error("Mic audio streaming setup error:", err);
    }
  };

  const _startVideoRecording = (ws: WebSocket, stream: MediaStream) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    let options: MediaRecorderOptions = {};
    if (typeof MediaRecorder !== "undefined") {
      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
        options = { mimeType: "video/webm;codecs=vp8,opus" };
      } else if (MediaRecorder.isTypeSupported("video/webm")) {
        options = { mimeType: "video/webm" };
      }
    }

    try {
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (e) => {
        if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          if (ws.bufferedAmount > 2097152) {
            console.warn("⚠️ [WS BACKPRESSURE] Dropping video frame due to socket backpressure");
            return;
          }
          const buffer = await e.data.arrayBuffer();
          const chunk = new Uint8Array(buffer);
          const packet = new Uint8Array(chunk.length + 1);
          packet[0] = 0x02; // Video prefix byte
          packet.set(chunk, 1);
          ws.send(packet.buffer);
        }
      };

      mediaRecorder.start(5000);
    } catch (err) {
      console.error("Error starting MediaRecorder:", err);
    }
  };

  const _connectSocket = useCallback(
    async (targetSessionId: string, token: string, stream: MediaStream) => {
      _stopHeartbeat();
      if (wsRef.current) {
        try {
          wsRef.current.onopen = null;
          wsRef.current.onmessage = null;
          wsRef.current.onerror = null;
          wsRef.current.onclose = null;
          wsRef.current.close();
        } catch {}
        wsRef.current = null;
      }

      const cleanBase = WS_BASE_URL.replace(/\/$/, "");
      const wsEndpoint = cleanBase.endsWith("/ws/interview")
        ? cleanBase
        : `${cleanBase}/ws/interview`;
      const wsUrl = `${wsEndpoint}?token=${encodeURIComponent(
        token
      )}&sessionId=${encodeURIComponent(targetSessionId)}`;

      const ws = new WebSocket(wsUrl);
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("🔌 [WebSocket Connected] Session ID:", targetSessionId);
        reconnectAttemptsRef.current = 0;
        setStatus("CONNECTED");
        _startHeartbeat(ws);

        _startVideoRecording(ws, stream);
        _startAudioStreaming(ws, stream);
      };

      ws.onmessage = async (event) => {
        try {
          if (event.data instanceof ArrayBuffer) {
            const byteLength = event.data.byteLength;
            if (byteLength > 0) {
              console.log("🔊 [WS INCOMING BINARY AUDIO]", byteLength, "bytes");
              _playBinaryAudio(event.data);
            }
            return;
          }

          const msg = JSON.parse(event.data as string);
          if (msg.event === "pong" || msg.event === "ping") return;

          console.log("📩 [WS INCOMING JSON MESSAGE]", msg);

          if (msg.audio) {
            console.log("🔊 [WS INCOMING BASE64 AUDIO PLAYBACK]");
            _playBase64Audio(msg.audio);
          }

          if (msg.event === "session-ready") {
            setStatus("CONNECTED");
            const initialMessage =
              msg.message ||
              msg.text ||
              "Hello! Welcome to your Verquo AI interview. I am Alex, your AI interviewer. Whenever you are ready, please introduce yourself or answer the first question.";

            _appendTurn("AI", initialMessage);
          } else if (msg.event === "transcript-saved") {
            console.log("✅ [WS ACKNOWLEDGMENT] Turn saved on backend:", msg);
            return;
          } else if (
            msg.event === "transcript-turn" ||
            msg.event === "ai-turn" ||
            msg.event === "question" ||
            msg.event === "ai-speak" ||
            msg.role ||
            msg.text ||
            msg.message
          ) {
            const textContent = msg.text || msg.message;
            if (textContent && msg.event !== "session-ready") {
              const role = msg.role === "CANDIDATE" ? "CANDIDATE" : "AI";
              console.log(`💬 [WS CHAT TURN] Role: ${role} | Text: "${textContent}"`);
              _appendTurn(role, textContent);
            }
          } else if (msg.event === "interview-complete") {
            console.log("🏁 [WS INTERVIEW COMPLETE]", msg);
            isManualEndRef.current = true;
            setStatus("ENDED");
            _stopHeartbeat();
            _stopAllMedia();

            try {
              const evalData = await fetchInterviewEvaluation(targetSessionId);
              setEvaluation(evalData);
            } catch (evalErr) {
              console.error("Failed to fetch interview evaluation:", evalErr);
            }

            setStatus("COMPLETED");
          }
        } catch (e) {
          console.error("Error parsing WebSocket message:", e);
        }
      };

      const handleDisconnect = () => {
        _stopHeartbeat();
        if (isManualEndRef.current) return;

        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current - 1),
            16000
          );
          console.warn(
            `⚠️ [WS DISCONNECTED] Connection dropped. Attempting reconnect #${reconnectAttemptsRef.current} in ${delay}ms...`
          );
          setStatus("RECONNECTING");

          if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = setTimeout(async () => {
            if (!currentSessionRef.current || !streamRef.current) return;
            try {
              let activeToken = currentSessionRef.current.token;
              try {
                const tokenRes = await fetch("/api/interview/ws-token");
                if (tokenRes.ok) {
                  const tokenJson = await tokenRes.json();
                  if (tokenJson.data?.token) {
                    activeToken = tokenJson.data.token;
                    currentSessionRef.current.token = activeToken;
                  }
                }
              } catch {}

              await _connectSocket(
                currentSessionRef.current.sessionId,
                activeToken,
                streamRef.current
              );
            } catch (err) {
              console.error("Reconnect attempt failed:", err);
            }
          }, delay);
        } else {
          console.error(
            "❌ [WS FATAL] Max reconnect attempts reached. Resetting interview session."
          );
          setStatus("IDLE");
          _stopAllMedia();
        }
      };

      ws.onerror = (err) => {
        console.error("❌ [WS ERROR]", err);
      };

      ws.onclose = (event) => {
        console.log(`🔌 [WS DISCONNECTED] Code: ${event.code}, Reason: ${event.reason}`);
        handleDisconnect();
      };
    },
    [
      _stopHeartbeat,
      _startHeartbeat,
      _playBinaryAudio,
      _playBase64Audio,
      _appendTurn,
      _stopAllMedia,
    ]
  );

  const startInterview = useCallback(
    async (form: StartInterviewForm) => {
      try {
        isManualEndRef.current = false;
        reconnectAttemptsRef.current = 0;
        setStatus("CONNECTING");

        // 1. Create session via BFF
        const session = await startInterviewSession(form);
        setSessionId(session.sessionId);

        // 2. Retrieve access token via BFF
        const tokenRes = await fetch("/api/interview/ws-token");
        if (!tokenRes.ok) {
          throw new Error("Failed to retrieve WebSocket auth token");
        }
        const tokenJson = await tokenRes.json();
        const token = tokenJson.data?.token;

        if (!token) {
          throw new Error("No candidate token found");
        }

        currentSessionRef.current = { sessionId: session.sessionId, token };

        // 3. Acquire camera + mic
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        streamRef.current = stream;
        setMediaStream(stream);

        // 4. Open WebSocket connection
        await _connectSocket(session.sessionId, token, stream);
      } catch (err) {
        console.error("Failed to start interview:", err);
        setStatus("IDLE");
        _stopAllMedia();
      }
    },
    [_connectSocket, _stopAllMedia]
  );

  const sendAnswer = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const payload = {
          event: "transcript-turn",
          role: "CANDIDATE",
          text,
        };
        console.log("📤 [WS OUTGOING CANDIDATE ANSWER]", payload);
        wsRef.current.send(JSON.stringify(payload));
        _appendTurn("CANDIDATE", text);
      }
    },
    [_appendTurn]
  );

  const endInterview = useCallback(async () => {
    isManualEndRef.current = true;
    setStatus("ENDED");

    _stopHeartbeat();
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        console.log("🛑 [WS OUTGOING END INTERVIEW]");
        wsRef.current.send(JSON.stringify({ event: "end-interview" }));
      } catch (e) {
        console.warn("WS send error on end-interview:", e);
      }
    }

    _stopAllMedia();

    if (sessionId) {
      try {
        const evalData = await fetchInterviewEvaluation(sessionId);
        setEvaluation(evalData);
      } catch (evalErr) {
        console.warn("Evaluation fetch note:", evalErr);
      }
    }

    setStatus("COMPLETED");
  }, [sessionId, _stopHeartbeat, _stopAllMedia]);

  useEffect(() => {
    return () => {
      isManualEndRef.current = true;
      _stopAllMedia();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [_stopAllMedia]);

  return {
    status,
    sessionId,
    transcript,
    evaluation,
    stream: mediaStream,
    streamRef,
    startInterview,
    sendAnswer,
    endInterview,
  };
}
