"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  startInterviewSession,
  fetchInterviewEvaluation,
  fetchInterviewRecordingUploadUrl,
  completeInterviewRecordingUpload,
} from "@/services/interview/interview.services";
import type {
  StartInterviewForm,
  InterviewStatus,
  InterviewEvaluation,
} from "@/types/interview.types";

function _getDynamicWsUrl(token: string, sessionId: string): string {
  let wsBase = process.env.NEXT_PUBLIC_WS_URL || "";

  if (typeof window !== "undefined") {
    const isHttps = window.location.protocol === "https:";
    const wsProto = isHttps ? "wss:" : "ws:";
    const hostname = window.location.hostname;

    // 1. Explicit NEXT_PUBLIC_WS_URL
    if (wsBase && !wsBase.includes("localhost") && !wsBase.includes("127.0.0.1")) {
      if (isHttps && wsBase.startsWith("ws://")) {
        wsBase = wsBase.replace(/^ws:\/\//, "wss://");
      }
    } else if (hostname.includes("devtunnels.ms")) {
      // 2. Map frontend tunnel (e.g. w2r81bm2-5173.inc1.devtunnels.ms) -> backend tunnel (w2r81bm2-3000.inc1.devtunnels.ms)
      const backendTunnelHost = hostname.replace(/-\d+\./, "-3000.");
      wsBase = `${wsProto}//${backendTunnelHost}`;
    } else {
      // 3. Localhost development -> direct to backend port 3000
      wsBase = `${wsProto}//${hostname}:3000`;
    }
  }

  if (!wsBase) {
    wsBase = "ws://localhost:3000";
  }

  const cleanBase = wsBase.replace(/\/$/, "");
  const wsEndpoint = cleanBase.endsWith("/ws/interview")
    ? cleanBase
    : `${cleanBase}/ws/interview`;

  const finalUrl = `${wsEndpoint}?token=${encodeURIComponent(token)}&sessionId=${encodeURIComponent(sessionId)}`;
  return finalUrl;
}

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
  const recordedBlobsRef = useRef<Blob[]>([]);

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

  const speechRecRef = useRef<unknown>(null);

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
      utterance.rate = 1.2;
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
      const notifyEnd = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          try {
            wsRef.current.send(JSON.stringify({ event: "ai-speaking-end" }));
          } catch {}
        }
      };
      utterance.onend = notifyEnd;
      utterance.onerror = notifyEnd;

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

    if (speechRecRef.current) {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      try { (speechRecRef.current as any).stop(); } catch {}
      speechRecRef.current = null;
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
      const muteGain = audioContext.createGain();
      muteGain.gain.value = 0;
      processor.connect(muteGain);
      muteGain.connect(audioContext.destination);

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

        // Filter out absolute silence to prevent WebSocket tunnel congestion
        if (maxPeak > 0.02 || isLiveModeRef.current) {
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
        }
      };

      console.log(
        `🎙️ [Mic Streaming] Native ${nativeSampleRate}Hz → 16kHz PCM (Gemini Live: ${isLiveModeRef.current})`
      );
    } catch (err) {
      console.error("Mic audio streaming setup error:", err);
    }
  };

  // ── Video Recording (Local WebM Buffering → S3 Presigned Upload) ─────────

  const _startVideoRecording = (_ws: WebSocket, stream: MediaStream) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch {}
    }

    let options: MediaRecorderOptions = {};
    if (typeof MediaRecorder !== "undefined") {
      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
        options = { mimeType: "video/webm;codecs=vp9,opus" };
      } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
        options = { mimeType: "video/webm;codecs=vp8,opus" };
      } else if (MediaRecorder.isTypeSupported("video/webm;codecs=h264,opus")) {
        options = { mimeType: "video/webm;codecs=h264,opus" };
      } else if (MediaRecorder.isTypeSupported("video/webm")) {
        options = { mimeType: "video/webm" };
      } else if (MediaRecorder.isTypeSupported("video/mp4")) {
        options = { mimeType: "video/mp4" };
      }
    }

    try {
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      recordedBlobsRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedBlobsRef.current.push(e.data);
        }
      };

      mediaRecorder.start(1000);
      console.log("🎥 [MediaRecorder] Video recording started with mimeType:", mediaRecorder.mimeType || options.mimeType);
    } catch (err) {
      console.error("Error starting MediaRecorder:", err);
    }
  };

  // ── Real-Time Web Speech STT (0ms Local Latency) ──────────────────────────

  const _startSpeechRecognition = useCallback(
    (ws: WebSocket) => {
      if (typeof window === "undefined") return;
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRec) return;

      try {
        if (speechRecRef.current) {
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          try { (speechRecRef.current as any).stop(); } catch {}
        }

        const recognition = new SpeechRec();
        speechRecRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        let lastSentText = "";

        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        recognition.onresult = (e: any) => {
          let currentFinal = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const transcriptPart = e.results[i][0].transcript;
            if (e.results[i].isFinal) {
              currentFinal += transcriptPart + " ";
            }
          }

          const trimmed = currentFinal.trim();
          if (trimmed && trimmed !== lastSentText && trimmed.length > 1) {
            lastSentText = trimmed;
            console.log("⚡ [0ms WebSpeech STT] Final:", trimmed);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(
                JSON.stringify({
                  event: "transcript-turn",
                  role: "CANDIDATE",
                  text: trimmed,
                })
              );
              _appendTurn("CANDIDATE", trimmed);
            }
          }
        };

        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        recognition.onerror = (e: any) => {
          if (e.error !== "no-speech") {
            console.warn("WebSpeech recognition note:", e.error);
          }
        };

        recognition.onend = () => {
          if (!isManualEndRef.current && ws.readyState === WebSocket.OPEN) {
            try { recognition.start(); } catch {}
          }
        };

        recognition.start();
        console.log("⚡ [0ms WebSpeech STT Engine] Active for Instant Turn-Taking");
      } catch (err) {
        console.warn("WebSpeech start note:", err);
      }
    },
    [_appendTurn]
  );

  // ── Finalize Interview & Direct S3 Video Upload ───────────────────────────

  const _finalizeInterview = useCallback(
    async (targetSessionId: string) => {
      // 1. Cleanly flush and stop MediaRecorder to guarantee complete WebM headers & duration
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        await new Promise<void>((resolve) => {
          if (!mediaRecorderRef.current) return resolve();
          mediaRecorderRef.current.onstop = () => resolve();
          try {
            mediaRecorderRef.current.requestData();
            mediaRecorderRef.current.stop();
          } catch {
            resolve();
          }
        });
      }

      // 2. Upload full video recording blob to S3 via pre-signed URL
      if (targetSessionId && recordedBlobsRef.current.length > 0) {
        try {
          const rawMimeType = mediaRecorderRef.current?.mimeType || "video/webm";
          const contentType = rawMimeType.split(";")[0] || "video/webm";
          const fullBlob = new Blob(recordedBlobsRef.current, { type: contentType });
          if (fullBlob.size > 500) {
            console.log(`🎥 [S3 Upload] Uploading ${fullBlob.size} bytes (${contentType}) video recording via pre-signed URL...`);
            const uploadRes = await fetchInterviewRecordingUploadUrl(targetSessionId, contentType);
            if (uploadRes?.uploadUrl) {
              await fetch(uploadRes.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": contentType },
                body: fullBlob,
              });
              await completeInterviewRecordingUpload(targetSessionId, uploadRes.key);
              console.log("🎥 [S3 Upload] Full interview recording uploaded successfully to S3.");
            }
          }
        } catch (uploadErr) {
          console.warn("Direct S3 recording upload note:", uploadErr);
        }
      }

      _stopAllMedia();

      // 3. Fetch or trigger on-demand evaluation
      if (targetSessionId) {
        try {
          const evalData = await fetchInterviewEvaluation(targetSessionId);
          setEvaluation(evalData);
        } catch (evalErr) {
          console.warn("Evaluation fetch note:", evalErr);
        }
      }

      setStatus("COMPLETED");
    },
    [_stopAllMedia]
  );

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

      const wsUrl = _getDynamicWsUrl(token, targetSessionId);
      console.log("🔌 [WebSocket Connecting] URL:", wsUrl);

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
        _startSpeechRecognition(ws);
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
              if (msg.event === "interview-complete" && !isManualEndRef.current) {
                console.log("🏁 [WS] Interview complete");
                isManualEndRef.current = true;
                setStatus("ENDED");
                setAlexSpeaking(false);
                _stopHeartbeat();
                await _finalizeInterview(targetSessionId);
              }
              break;
            }
          }

          if (msg.event === "interview-complete" && !isManualEndRef.current) {
            console.log("🏁 [WS] Interview complete");
            isManualEndRef.current = true;
            setStatus("ENDED");
            setAlexSpeaking(false);
            _stopHeartbeat();
            await _finalizeInterview(targetSessionId);
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
      _finalizeInterview,
    ]
  );

  const [mediaWarning, setMediaWarning] = useState<string | null>(null);

  // ── Resilient Media Acquisition (Handles NotReadableError & hardware locks) ──

  const _acquireMediaStream = useCallback(async (): Promise<MediaStream> => {
    // 1. Ensure any stale tracks from previous sessions are cleanly stopped
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        try { t.stop(); } catch {}
      });
      streamRef.current = null;
    }

    setMediaWarning(null);

    // 2. Try primary high-quality camera + mic acquisition
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 24, max: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (primaryErr: any) {
      console.warn("Primary camera/mic constraints failed, retrying basic constraints:", primaryErr);

      // 3. Try basic video + audio
      try {
        return await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (basicErr: any) {
        console.warn("Basic video+audio getUserMedia failed (NotReadableError or locked):", basicErr);

        // 4. Fallback to audio-only if video is locked by another process (e.g. Teams, Zoom, Meet, browser lock)
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

          // Create fallback video track from canvas so MediaRecorder & video elements stay valid
          if (typeof document !== "undefined") {
            const canvas = document.createElement("canvas");
            canvas.width = 640;
            canvas.height = 480;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.fillStyle = "#090d16";
              ctx.fillRect(0, 0, 640, 480);
              ctx.fillStyle = "#64748b";
              ctx.font = "bold 18px sans-serif";
              ctx.textAlign = "center";
              ctx.fillText("Camera in use by another app", 320, 230);
              ctx.font = "14px sans-serif";
              ctx.fillStyle = "#475569";
              ctx.fillText("Audio Mode Active — Speak naturally", 320, 260);
            }
            const canvasStream = (canvas as any).captureStream ? (canvas as any).captureStream(5) : null;
            const dummyVideoTrack = canvasStream?.getVideoTracks()?.[0];
            if (dummyVideoTrack) {
              audioStream.addTrack(dummyVideoTrack);
            }
          }

          setMediaWarning(
            basicErr?.name === "NotReadableError"
              ? "Your webcam is currently locked by another application. Switched to Audio Mode."
              : "Camera unavailable. Switched to Audio Mode."
          );

          return audioStream;
        } catch (audioOnlyErr: any) {
          throw new Error(
            basicErr?.name === "NotReadableError"
              ? "Your camera or microphone is locked by another application (e.g. Teams, Zoom, Meet). Please close other apps and try again."
              : basicErr?.message || "Could not access microphone or camera."
          );
        }
      }
    }
  }, []);

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

        // 3. Acquire camera + mic with resilient NotReadableError fallback
        const stream = await _acquireMediaStream();
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
      } catch (err: any) {
        console.error("Failed to start interview:", err);
        alert(err?.message || "Failed to start interview. Please check your camera and microphone permissions.");
        setStatus("IDLE");
        _stopAllMedia();
      }
    },
    [_connectSocket, _acquireMediaStream, _stopAllMedia]
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

  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);

  const toggleScreenShare = useCallback(async () => {
    if (!streamRef.current) return;

    if (!isScreenSharing) {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        const screenTrack = displayStream.getVideoTracks()[0];
        if (!screenTrack) return;

        const currentVideoTrack = streamRef.current.getVideoTracks()[0];
        if (currentVideoTrack) {
          cameraTrackRef.current = currentVideoTrack;
          streamRef.current.removeTrack(currentVideoTrack);
        }

        streamRef.current.addTrack(screenTrack);
        setMediaStream(new MediaStream(streamRef.current.getTracks()));
        setIsScreenSharing(true);

        screenTrack.onended = () => {
          if (cameraTrackRef.current && streamRef.current) {
            streamRef.current.removeTrack(screenTrack);
            streamRef.current.addTrack(cameraTrackRef.current);
            setMediaStream(new MediaStream(streamRef.current.getTracks()));
            setIsScreenSharing(false);
          }
        };
      } catch (err) {
        console.warn("Screen share cancel or error:", err);
      }
    } else {
      const currentScreenTrack = streamRef.current.getVideoTracks()[0];
      if (currentScreenTrack) {
        currentScreenTrack.stop();
        streamRef.current.removeTrack(currentScreenTrack);
      }
      if (cameraTrackRef.current) {
        streamRef.current.addTrack(cameraTrackRef.current);
      }
      setMediaStream(new MediaStream(streamRef.current.getTracks()));
      setIsScreenSharing(false);
    }
  }, [isScreenSharing]);

  const endInterview = useCallback(async () => {
    if (isManualEndRef.current) return;
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

    const currentId = sessionId || currentSessionRef.current?.sessionId;
    if (currentId) {
      await _finalizeInterview(currentId);
    } else {
      _stopAllMedia();
      setStatus("COMPLETED");
    }
  }, [sessionId, _stopHeartbeat, _finalizeInterview, _stopAllMedia]);

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
    mediaWarning,
    isScreenSharing,
    toggleScreenShare,
    /** True when the backend is running in Gemini Live native audio mode */
    isLiveMode,
    /** True while Gemini Live is actively streaming audio chunks */
    alexSpeaking,
    startInterview,
    sendAnswer,
    endInterview,
  };
}
