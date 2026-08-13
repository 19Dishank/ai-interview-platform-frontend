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

// ─── Audio Helpers ────────────────────────────────────────────────────────────

/**
 * Resamples Float32 mic channel data to 16kHz PCM Int16Array.
 * Handles all native browser AudioContext sample rates (44.1k, 48k, etc).
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

/**
 * Decodes a raw 24kHz 16-bit mono PCM base64 string into a Web Audio AudioBuffer.
 * Used exclusively for Gemini Live mode audio-chunk playback.
 */
function _decodePCMChunk(
  ctx: AudioContext,
  base64Data: string
): AudioBuffer | null {
  try {
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const numSamples = Math.floor(bytes.length / 2);
    if (numSamples === 0) return null;

    const audioBuffer = ctx.createBuffer(1, numSamples, 24000);
    const channelData = audioBuffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      // 16-bit signed little-endian → float32
      const raw = (bytes[i * 2] | (bytes[i * 2 + 1] << 8)) << 16 >> 16;
      channelData[i] = raw / 32768;
    }

    return audioBuffer;
  } catch (e) {
    console.warn("[Live Audio] PCM decode error:", e);
    return null;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAIInterview() {
  const [status, setStatus] = useState<InterviewStatus>("IDLE");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<
    Array<{ role: "AI" | "CANDIDATE"; text: string }>
  >([]);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  /** True when the backend session uses Gemini Live native audio mode */
  const [isLiveMode, setIsLiveMode] = useState(false);
  /** True while Gemini Live is actively streaming audio to the speaker */
  const [alexSpeaking, setAlexSpeaking] = useState(false);

  // ── Media refs ────────────────────────────────────────────────────────────
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /** AudioContext for *mic capture* (16kHz input) */
  const micAudioCtxRef = useRef<AudioContext | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);

  /**
   * AudioContext for *Gemini Live playback* (24kHz output).
   * Kept strictly separate from the mic context to avoid sample-rate conflicts.
   */
  const playbackAudioCtxRef = useRef<AudioContext | null>(null);
  /** Tracks scheduled end time for gapless chunk queuing */
  const nextPlaybackTimeRef = useRef<number>(0);

  // ── Control refs ──────────────────────────────────────────────────────────
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const isManualEndRef = useRef<boolean>(false);
  const currentSessionRef = useRef<{ sessionId: string; token: string } | null>(null);
  const isLiveModeRef = useRef<boolean>(false);

  const MAX_RECONNECT_ATTEMPTS = 5;

  // ── Heartbeat ─────────────────────────────────────────────────────────────

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

  // ── Gemini Live Audio Playback ────────────────────────────────────────────

  /**
   * Returns (or creates) a 24kHz AudioContext for Gemini Live playback.
   * Must be called after a user gesture to satisfy browser autoplay policy.
   */
  const _getPlaybackContext = useCallback((): AudioContext | null => {
    try {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return null;

      if (
        !playbackAudioCtxRef.current ||
        playbackAudioCtxRef.current.state === "closed"
      ) {
        playbackAudioCtxRef.current = new AudioCtx({ sampleRate: 24000 });
        nextPlaybackTimeRef.current = playbackAudioCtxRef.current.currentTime;
      }

      return playbackAudioCtxRef.current;
    } catch (e) {
      console.warn("[Live Audio] Failed to create playback AudioContext:", e);
      return null;
    }
  }, []);

  /**
   * Schedules a base64 PCM chunk for gapless playback via Web Audio API.
   * Chunks are queued in order using `nextPlaybackTimeRef` so there are no
   * gaps or overlaps between streamed Gemini audio frames.
   */
  const _playLiveAudioChunk = useCallback(
    async (base64Data: string) => {
      const ctx = _getPlaybackContext();
      if (!ctx) return;

      if (ctx.state === "suspended") {
        try {
          await ctx.resume();
        } catch {}
      }

      const audioBuffer = _decodePCMChunk(ctx, base64Data);
      if (!audioBuffer) return;

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      // Clamp to current time so we never schedule in the past
      const startTime = Math.max(ctx.currentTime, nextPlaybackTimeRef.current);
      source.start(startTime);
      nextPlaybackTimeRef.current = startTime + audioBuffer.duration;
    },
    [_getPlaybackContext]
  );

  // ── Legacy Audio Playback (fallback / non-live mode) ──────────────────────

  const _playBinaryAudio = useCallback(async (buffer: ArrayBuffer) => {
    try {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (
        !playbackAudioCtxRef.current ||
        playbackAudioCtxRef.current.state === "closed"
      ) {
        playbackAudioCtxRef.current = new AudioCtx();
      }
      const ctx = playbackAudioCtxRef.current;
      if (ctx.state === "suspended") await ctx.resume();

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
    // In Gemini Live mode audio is played via Web Audio API — skip TTS
    if (isLiveModeRef.current) return;
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

  // ── Transcript ────────────────────────────────────────────────────────────

  const _appendTurn = useCallback(
    (role: "AI" | "CANDIDATE", text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      setTranscript((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === role && last.text === trimmed) return prev;
        return [...prev, { role, text: trimmed }];
      });

      if (role === "AI") _speakAIText(trimmed);
    },
    [_speakAIText]
  );

  // ── Media Teardown ────────────────────────────────────────────────────────

  const _stopAllMedia = useCallback(() => {
    _stopHeartbeat();
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }

    if (audioProcessorRef.current) {
      try { audioProcessorRef.current.disconnect(); } catch {}
      audioProcessorRef.current = null;
    }

    if (micAudioCtxRef.current && micAudioCtxRef.current.state !== "closed") {
      try { micAudioCtxRef.current.close(); } catch {}
      micAudioCtxRef.current = null;
    }

    // Close playback context — resets gapless scheduler
    if (playbackAudioCtxRef.current && playbackAudioCtxRef.current.state !== "closed") {
      try { playbackAudioCtxRef.current.close(); } catch {}
      playbackAudioCtxRef.current = null;
    }
    nextPlaybackTimeRef.current = 0;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch {}
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setMediaStream(null);
    }

    setAlexSpeaking(false);
  }, [_stopHeartbeat]);

  // ── Mic Streaming (16kHz PCM → WS with 0x01 prefix) ──────────────────────

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

      // Tear down any existing mic pipeline
      if (audioProcessorRef.current) {
        try { audioProcessorRef.current.disconnect(); } catch {}
        audioProcessorRef.current = null;
      }
      if (micAudioCtxRef.current && micAudioCtxRef.current.state !== "closed") {
        try { micAudioCtxRef.current.close(); } catch {}
      }

      // Use native sample rate for widest hardware compatibility; downsample in SW
      const audioContext = new AudioCtx();
      micAudioCtxRef.current = audioContext;

      if (audioContext.state === "suspended") await audioContext.resume();

      const nativeSampleRate = audioContext.sampleRate;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      audioProcessorRef.current = processor;

      source.connect(processor);
      processor.connect(audioContext.destination);

      let logCounter = 0;

      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        // Backpressure: drop mic frame if send buffer is saturated (> 1 MB)
        if (ws.bufferedAmount > 1048576) {
          console.warn("⚠️ [WS BACKPRESSURE] Dropping mic frame");
          return;
        }

        const inputData = e.inputBuffer.getChannelData(0);
        let maxPeak = 0;
        for (let i = 0; i < inputData.length; i++) {
          const abs = Math.abs(inputData[i]);
          if (abs > maxPeak) maxPeak = abs;
        }

        const pcm16 = _downsampleTo16kHz(inputData, nativeSampleRate);
        const packet = new Uint8Array(pcm16.buffer.byteLength + 1);
        packet[0] = 0x01; // Audio prefix byte (16kHz PCM)
        packet.set(new Uint8Array(pcm16.buffer), 1);
        ws.send(packet.buffer);

        logCounter++;
        if (logCounter % 20 === 0 || maxPeak > 0.05) {
          console.log(
            `🎙️ [WS MIC → 0x01] ${packet.length} bytes | Peak: ${(maxPeak * 100).toFixed(1)}%`
          );
        }
      };

      console.log(
        `🎙️ [Mic Streaming] Native ${nativeSampleRate}Hz → 16kHz PCM (Gemini Live: ${isLiveModeRef.current})`
      );
    } catch (err) {
      console.error("Mic audio streaming setup error:", err);
    }
  };

  // ── Video Recording (WebM chunks → WS with 0x02 prefix) ──────────────────

  const _startVideoRecording = (ws: WebSocket, stream: MediaStream) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch {}
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
          // Backpressure: drop video frame if buffer > 2 MB
          if (ws.bufferedAmount > 2097152) {
            console.warn("⚠️ [WS BACKPRESSURE] Dropping video frame");
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

  // ── WebSocket Connection ──────────────────────────────────────────────────

  const _connectSocket = useCallback(
    async (targetSessionId: string, token: string, stream: MediaStream) => {
      _stopHeartbeat();

      // Null out old socket handlers before closing to prevent stale callbacks
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
      const wsUrl = `${wsEndpoint}?token=${encodeURIComponent(token)}&sessionId=${encodeURIComponent(targetSessionId)}`;

      const ws = new WebSocket(wsUrl);
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("🔌 [WebSocket Connected] Session:", targetSessionId);
        reconnectAttemptsRef.current = 0;
        setStatus("CONNECTED");
        _startHeartbeat(ws);
        _startVideoRecording(ws, stream);
        _startAudioStreaming(ws, stream);
      };

      ws.onmessage = async (event) => {
        try {
          // ── Binary frames (legacy binary audio or video ack) ──────────────
          if (event.data instanceof ArrayBuffer) {
            const byteLength = event.data.byteLength;
            if (byteLength > 0 && !isLiveModeRef.current) {
              console.log("🔊 [WS BINARY AUDIO]", byteLength, "bytes");
              _playBinaryAudio(event.data);
            }
            return;
          }

          // ── JSON frames ───────────────────────────────────────────────────
          const msg = JSON.parse(event.data as string);

          // Silently swallow keepalive ping/pong frames
          if (msg.event === "pong" || msg.event === "ping") return;

          console.log("📩 [WS MSG]", msg.event ?? msg);

          switch (msg.event) {
            // ── Session Ready ─────────────────────────────────────────────
            case "session-ready": {
              const live = msg.mode === "live-audio";
              isLiveModeRef.current = live;
              setIsLiveMode(live);
              setStatus("CONNECTED");

              console.log(`🎙️ [Session Mode] ${live ? "Gemini Live Audio" : "Legacy TTS"}`);

              // In live mode the AI will speak via audio-chunk events.
              // In legacy mode, render the greeting text and speak via TTS.
              if (!live) {
                const greeting =
                  msg.message ||
                  msg.text ||
                  "Hello! Welcome to your Verquo AI interview. I am Alex, your AI interviewer. Whenever you are ready, please introduce yourself or answer the first question.";
                _appendTurn("AI", greeting);
              }
              break;
            }

            // ── Gemini Live: streamed audio chunk ─────────────────────────
            case "audio-chunk": {
              if (!msg.data) break;
              setAlexSpeaking(true);
              await _playLiveAudioChunk(msg.data);
              break;
            }

            // ── Gemini Live: AI finished speaking this turn ───────────────
            case "ai-speaking-end": {
              console.log("🔔 [Alex] Finished speaking turn");
              setAlexSpeaking(false);
              break;
            }

            // ── Transcript turn (both modes) ──────────────────────────────
            case "transcript-turn":
            case "ai-turn":
            case "question":
            case "ai-speak": {
              const textContent = msg.text || msg.message;
              if (textContent) {
                const role: "AI" | "CANDIDATE" =
                  msg.role === "CANDIDATE" ? "CANDIDATE" : "AI";
                console.log(`💬 [Transcript] ${role}: "${textContent}"`);
                _appendTurn(role, textContent);
              }
              break;
            }

            // ── Transcript saved ACK ──────────────────────────────────────
            case "transcript-saved":
              console.log("✅ [WS ACK] Transcript turn saved:", msg);
              break;

            // ── Legacy: backend sends base64 audio blob ───────────────────
            default: {
              // Catch-all for legacy servers that send audio/text without events
              if (msg.audio) {
                console.log("🔊 [WS BASE64 AUDIO]");
                _playBase64Audio(msg.audio);
              }
              if ((msg.role || msg.text || msg.message) && msg.event !== "session-ready") {
                const textContent = msg.text || msg.message;
                if (textContent) {
                  const role: "AI" | "CANDIDATE" =
                    msg.role === "CANDIDATE" ? "CANDIDATE" : "AI";
                  _appendTurn(role, textContent);
                }
              }
              if (msg.event === "interview-complete") {
                console.log("🏁 [WS] Interview complete");
                isManualEndRef.current = true;
                setStatus("ENDED");
                setAlexSpeaking(false);
                _stopHeartbeat();
                _stopAllMedia();

                try {
                  const evalData = await fetchInterviewEvaluation(targetSessionId);
                  setEvaluation(evalData);
                } catch (evalErr) {
                  console.error("Evaluation fetch failed:", evalErr);
                }

                setStatus("COMPLETED");
              }
              break;
            }
          }

          // Also handle interview-complete from the switch default block
          if (msg.event === "interview-complete" && !isManualEndRef.current) {
            console.log("🏁 [WS] Interview complete");
            isManualEndRef.current = true;
            setStatus("ENDED");
            setAlexSpeaking(false);
            _stopHeartbeat();
            _stopAllMedia();

            try {
              const evalData = await fetchInterviewEvaluation(targetSessionId);
              setEvaluation(evalData);
            } catch (evalErr) {
              console.error("Evaluation fetch failed:", evalErr);
            }

            setStatus("COMPLETED");
          }
        } catch (e) {
          console.error("Error handling WebSocket message:", e);
        }
      };

      const handleDisconnect = () => {
        _stopHeartbeat();
        if (isManualEndRef.current) return;

        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 16000);
          console.warn(
            `⚠️ [WS] Dropped — reconnect #${reconnectAttemptsRef.current} in ${delay}ms`
          );
          setStatus("RECONNECTING");
          setAlexSpeaking(false);

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
          console.error("❌ [WS] Max reconnect attempts reached. Resetting.");
          setStatus("IDLE");
          setAlexSpeaking(false);
          _stopAllMedia();
        }
      };

      ws.onerror = (err) => {
        console.error("❌ [WS ERROR]", err);
      };

      ws.onclose = (event) => {
        console.log(`🔌 [WS CLOSED] code=${event.code} reason="${event.reason}"`);
        handleDisconnect();
      };
    },
    [
      _stopHeartbeat,
      _startHeartbeat,
      _playBinaryAudio,
      _playBase64Audio,
      _playLiveAudioChunk,
      _appendTurn,
      _stopAllMedia,
    ]
  );

  // ── Public API ────────────────────────────────────────────────────────────

  const startInterview = useCallback(
    async (form: StartInterviewForm) => {
      try {
        isManualEndRef.current = false;
        isLiveModeRef.current = false;
        reconnectAttemptsRef.current = 0;
        setIsLiveMode(false);
        setAlexSpeaking(false);
        setStatus("CONNECTING");

        // 1. Create session via BFF
        const session = await startInterviewSession(form);
        setSessionId(session.sessionId);

        // 2. Retrieve access token via BFF
        const tokenRes = await fetch("/api/interview/ws-token");
        if (!tokenRes.ok) throw new Error("Failed to retrieve WebSocket auth token");
        const tokenJson = await tokenRes.json();
        const token = tokenJson.data?.token;
        if (!token) throw new Error("No candidate token found");

        currentSessionRef.current = { sessionId: session.sessionId, token };

        // 3. Acquire camera + mic (resume any suspended playback context on user gesture)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        streamRef.current = stream;
        setMediaStream(stream);

        // Resume playback context if it exists (satisfies autoplay policy)
        if (
          playbackAudioCtxRef.current &&
          playbackAudioCtxRef.current.state === "suspended"
        ) {
          try { await playbackAudioCtxRef.current.resume(); } catch {}
        }

        // 4. Open WebSocket
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
        const payload = { event: "transcript-turn", role: "CANDIDATE", text };
        console.log("📤 [WS → CANDIDATE ANSWER]", payload);
        wsRef.current.send(JSON.stringify(payload));
        _appendTurn("CANDIDATE", text);
      }
    },
    [_appendTurn]
  );

  const endInterview = useCallback(async () => {
    isManualEndRef.current = true;
    setStatus("ENDED");
    setAlexSpeaking(false);

    _stopHeartbeat();
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        console.log("🛑 [WS → end-interview]");
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isManualEndRef.current = true;
      _stopAllMedia();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
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
    /** True when the backend is running in Gemini Live native audio mode */
    isLiveMode,
    /** True while Gemini Live is actively streaming audio chunks */
    alexSpeaking,
    startInterview,
    sendAnswer,
    endInterview,
  };
}
