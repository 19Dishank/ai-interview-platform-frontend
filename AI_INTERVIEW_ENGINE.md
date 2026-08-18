# Verquo — AI Interview Engine Integration Guide

> **Frontend Developer Reference** — REST API & WebSocket Streaming for the AI Interview Engine.
> All implementations must follow the Verquo [BFF Architecture](./ARCHITECTURE.md) and the conventions defined in [AGENTS.md](./AGENTS.md).

---

## 📋 Table of Contents

1. [Base URLs & Authentication](#1-base-urls--authentication)
2. [Integration Lifecycle Overview](#2-integration-lifecycle-overview)
3. [REST API Reference](#3-rest-api-reference)
4. [WebSocket Streaming Protocol](#4-websocket-streaming-protocol)
5. [BFF Implementation Guide](#5-bff-implementation-guide)
6. [React Hook Reference](#6-react-hook-reference)
7. [File & Naming Conventions](#7-file--naming-conventions)
8. [Environment Variables](#8-environment-variables)

---

## 1. Base URLs & Authentication

| Environment | REST Base URL | WebSocket Base URL |
| :--- | :--- | :--- |
| **Local Dev** | `http://localhost:3000/api/v1` | `ws://localhost:3000/ws/interview` |
| **Dev Tunnel** | `https://w2r81bm2-3000.inc1.devtunnels.ms/api/v1` | `wss://w2r81bm2-3000.inc1.devtunnels.ms/ws/interview` |

> **BFF Rule**: The raw backend URLs above are for reference only. Client components **must never** call these directly. All REST requests from the browser must hit the Next.js BFF at `/api/interview/...`.

### Authentication Header (Backend)
All direct backend requests (made inside Next.js BFF route handlers via `serverApi`) require:

```http
Authorization: Bearer <CANDIDATE_ACCESS_TOKEN>
```

`serverApi` injects this header automatically by reading the `candidate_token` cookie. No manual header management is needed inside route handlers.

---

## 2. Integration Lifecycle Overview

```
STEP 1 — Start Session (REST)
  Client -> POST /api/interview/start (Next.js BFF)
  BFF    -> POST /api/v1/interview/start (Backend)
  Response: { sessionId, wsUrl }

STEP 2 — Connect WebSocket & Capture Media
  ws = new WebSocket(`${wsBaseUrl}/ws/interview?token=...&sessionId=...`)
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  Receive "session-ready" event -> Interview begins

STEP 3 — Live Interview Streaming
  Mic Audio  -> 16kHz PCM -> Binary WS packet (prefix byte 0x01)
  Camera     -> MediaRecorder (5s chunks) -> Binary WS packet (prefix 0x02)
  Text turns -> JSON WS message { event: "transcript-turn", ... }
  Receive: AI voice audio / transcript events from server

STEP 4 — End Interview & Fetch Results (REST)
  Send WS: { event: "end-interview" }
  Receive: "interview-complete" event
  Fetch: GET /api/interview/:id/evaluation
  Fetch: GET /api/interview/:id/recording
  Fetch: GET /api/interview/:id/transcript
```

---

## 3. REST API Reference

> All endpoints below are the **raw backend routes**. For the corresponding Next.js BFF routes that the client calls, see Section 5.

### 3.1 Start an Interview Session

**Backend**: `POST /api/v1/interview/start`
**BFF Route**: `POST /api/interview/start`

#### Request Body
```json
{
  "type": "TECHNICAL",
  "difficulty": "ADAPTIVE",
  "targetRole": "Senior Full Stack Engineer"
}
```

| Field | Required | Allowed Values |
| :--- | :---: | :--- |
| `type` | Yes | `TECHNICAL` \| `BEHAVIORAL` \| `SYSTEM_DESIGN` \| `FULL_STACK` \| `DSA` |
| `difficulty` | No | `EASY` \| `MEDIUM` \| `HARD` \| `ADAPTIVE` (default) |
| `targetRole` | No | e.g. `"Backend Developer"` |

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Interview session created. Connect via WebSocket to start.",
  "data": {
    "sessionId": "b3e945c1-9a72-4d56-829b-0123456789ab",
    "wsUrl": "/ws/interview"
  }
}
```

---

### 3.2 Fetch Interview History

**Backend**: `GET /api/v1/interview/history?limit=20&offset=0`
**BFF Route**: `GET /api/interview/history`

#### Query Parameters
| Param | Default | Description |
| :--- | :--- | :--- |
| `limit` | `20` | Max results to return |
| `offset` | `0` | Pagination offset |

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "b3e945c1-9a72-4d56-829b-0123456789ab",
      "type": "TECHNICAL",
      "difficulty": "ADAPTIVE",
      "targetRole": "Senior Full Stack Engineer",
      "status": "COMPLETED",
      "startedAt": "2026-08-13T10:00:00.000Z",
      "endedAt": "2026-08-13T10:15:30.000Z",
      "durationSecs": 930,
      "overallScore": 88.5,
      "technicalScore": 90.0,
      "communicationScore": 85.0,
      "problemSolvingScore": 90.0,
      "hiringRecommendation": "STRONG_YES"
    }
  ]
}
```

---

### 3.3 Get Conversation Transcript

**Backend**: `GET /api/v1/interview/:id/transcript`
**BFF Route**: `GET /api/interview/:id/transcript`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": "b3e945c1-9a72-4d56-829b-0123456789ab",
    "status": "COMPLETED",
    "turns": [
      { "id": "t1", "turnNumber": 1, "role": "AI", "text": "Hi, I am Alex. Welcome!", "timestamp": "2026-08-13T10:00:05.000Z" },
      { "id": "t2", "turnNumber": 2, "role": "CANDIDATE", "text": "Yes, I am ready.", "timestamp": "2026-08-13T10:00:10.000Z" }
    ]
  }
}
```

---

### 3.4 Get Evaluation Report

**Backend**: `GET /api/v1/interview/:id/evaluation`
**BFF Route**: `GET /api/interview/:id/evaluation`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "sessionId": "b3e945c1-9a72-4d56-829b-0123456789ab",
    "type": "TECHNICAL",
    "status": "COMPLETED",
    "overallScore": 88.5,
    "technicalScore": 90.0,
    "communicationScore": 85.0,
    "problemSolvingScore": 90.0,
    "evaluationSummary": "The candidate demonstrated strong knowledge...",
    "strengths": ["Deep understanding of async node processing"],
    "weaknesses": ["Could improve explanation of database indexing"],
    "hiringRecommendation": "STRONG_YES"
  }
}
```

#### `hiringRecommendation` Values
| Value | Meaning |
| :--- | :--- |
| `STRONG_YES` | Highly recommended for hire |
| `YES` | Recommended |
| `MAYBE` | Further evaluation advised |
| `NO` | Not recommended |
| `STRONG_NO` | Strongly not recommended |

---

### 3.5 Get Video Recording Playback URL

**Backend**: `GET /api/v1/interview/:id/recording`
**BFF Route**: `GET /api/interview/:id/recording`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "sessionId": "b3e945c1-9a72-4d56-829b-0123456789ab",
    "videoKey": "interviews/b3e945c1.../recording.webm",
    "downloadUrl": "https://s3.amazonaws.com/interviews/b3e945c1.../recording.webm?AWSAccessKeyId=...&Expires=..."
  }
}
```

> **Note**: `downloadUrl` is a pre-signed S3 URL and is time-limited. Do not cache it persistently.

---

## 4. WebSocket Streaming Protocol

### 4.1 Connection Setup

The WebSocket connection is opened **directly from the client** (WebSockets cannot be proxied through Next.js API routes). The candidate access token must be passed as a query parameter.

```typescript
const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/interview?token=${accessToken}&sessionId=${sessionId}`;
const ws = new WebSocket(wsUrl);
```

> **Security**: Tokens are short-lived. Ensure token expiry aligns with max interview duration.

---

### 4.2 Binary Packet Format (Client to Server)

The **first byte** of every binary frame specifies the data type:

| Prefix | Stream Type | Format |
| :---: | :--- | :--- |
| `0x01` | Microphone Audio | 16kHz, 16-bit PCM |
| `0x02` | Camera Video Chunk | WebM blob via `MediaRecorder` (5s chunks) |

```typescript
// Prefix a video chunk with 0x02
const buffer = await blob.arrayBuffer();
const chunk = new Uint8Array(buffer);
const packet = new Uint8Array(chunk.length + 1);
packet[0] = 0x02;       // Video prefix
packet.set(chunk, 1);   // Append video data
ws.send(packet.buffer);
```

---

### 4.3 JSON Control Messages (Client to Server)

#### Send Candidate Answer
```json
{ "event": "transcript-turn", "role": "CANDIDATE", "text": "I used BullMQ with Redis..." }
```

#### End Interview
```json
{ "event": "end-interview" }
```

---

### 4.4 Server Events (Server to Client)

| Event | When Emitted |
| :--- | :--- |
| `session-ready` | WebSocket + AI session established |
| `transcript-saved` | Backend confirms a transcript turn was saved |
| `interview-complete` | Session ended & S3 video upload complete |

```json
{ "event": "session-ready", "sessionId": "b3e945c1...", "message": "Connected. Speak when ready." }
{ "event": "transcript-saved", "turnNumber": 2, "role": "CANDIDATE" }
{ "event": "interview-complete", "sessionId": "b3e945c1...", "message": "Evaluation is processing." }
```

---

## 5. BFF Implementation Guide

### Files to Create

```
lib/validations/interview.ts
types/interview.types.ts
services/interview/interview.services.ts
hooks/use-ai-interview.ts
app/api/interview/start/route.ts
app/api/interview/history/route.ts
app/api/interview/ws-token/route.ts
app/api/interview/[id]/transcript/route.ts
app/api/interview/[id]/evaluation/route.ts
app/api/interview/[id]/recording/route.ts
```

---

### Step 1: Zod Validation — `lib/validations/interview.ts`

```typescript
import { z } from "zod";

export const startInterviewSchema = z.object({
  type: z.enum(["TECHNICAL", "BEHAVIORAL", "SYSTEM_DESIGN", "FULL_STACK", "DSA"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "ADAPTIVE"]).optional().default("ADAPTIVE"),
  targetRole: z.string().optional(),
});
```

---

### Step 2: TypeScript Types — `types/interview.types.ts`

```typescript
import { z } from "zod";
import { startInterviewSchema } from "@/lib/validations/interview";

export type StartInterviewForm = z.infer<typeof startInterviewSchema>;
export type InterviewStatus = "IDLE" | "CONNECTING" | "CONNECTED" | "ENDED" | "COMPLETED";
export type HiringRecommendation = "STRONG_YES" | "YES" | "MAYBE" | "NO" | "STRONG_NO";

export interface InterviewSession {
  sessionId: string;
  wsUrl: string;
}

export interface InterviewHistoryItem {
  id: string;
  candidateId: string;
  type: string;
  difficulty: string;
  targetRole: string;
  status: string;
  startedAt: string;
  endedAt: string;
  durationSecs: number;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  evaluationSummary: string;
  hiringRecommendation: HiringRecommendation;
}

export interface InterviewEvaluation {
  sessionId: string;
  type: string;
  difficulty: string;
  targetRole: string;
  status: string;
  startedAt: string;
  endedAt: string;
  durationSecs: number;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  evaluationSummary: string;
  strengths: string[];
  weaknesses: string[];
  hiringRecommendation: HiringRecommendation;
}

export interface InterviewTranscript {
  id: string;
  status: string;
  turns: Array<{
    id: string;
    turnNumber: number;
    role: "AI" | "CANDIDATE";
    text: string;
    timestamp: string;
  }>;
}

export interface InterviewRecording {
  sessionId: string;
  videoKey: string;
  downloadUrl: string;
}
```

---

### Step 3: Client Service Layer — `services/interview/interview.services.ts`

```typescript
import { clientApi } from "@/services/api/client-axios";
import { StartInterviewForm } from "@/types/interview.types";

export const startInterviewSession = async (payload: StartInterviewForm) => {
  const response = await clientApi.post("/interview/start", payload);
  return response.data.data;
};

export const fetchInterviewHistory = async (limit = 20, offset = 0) => {
  const response = await clientApi.get(`/interview/history?limit=${limit}&offset=${offset}`);
  return response.data.data;
};

export const fetchInterviewTranscript = async (id: string) => {
  const response = await clientApi.get(`/interview/${id}/transcript`);
  return response.data.data;
};

export const fetchInterviewEvaluation = async (id: string) => {
  const response = await clientApi.get(`/interview/${id}/evaluation`);
  return response.data.data;
};

export const fetchInterviewRecording = async (id: string) => {
  const response = await clientApi.get(`/interview/${id}/recording`);
  return response.data.data;
};
```

---

### Step 4: BFF Route Handlers

#### `app/api/interview/start/route.ts`
```typescript
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";

export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json();
  const response = await serverApi.post("/interview/start", body);
  return NextResponse.json({ success: response.data.success, message: response.data.message, data: response.data.data });
});
```

#### `app/api/interview/history/route.ts`
```typescript
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";

export const GET = withErrorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit") ?? "20";
  const offset = searchParams.get("offset") ?? "0";
  const response = await serverApi.get(`/interview/history?limit=${limit}&offset=${offset}`);
  return NextResponse.json({ success: response.data.success, message: response.data.message, data: response.data.data });
});
```

#### `app/api/interview/[id]/evaluation/route.ts`
```typescript
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";

export const GET = withErrorHandler(
  async (_req: Request, { params }: { params: { id: string } }) => {
    const response = await serverApi.get(`/interview/${params.id}/evaluation`);
    return NextResponse.json({ success: response.data.success, message: response.data.message, data: response.data.data });
  }
);
```

> Apply the same pattern for `/transcript` and `/recording` dynamic route handlers.

---

### Step 5: WebSocket Token Endpoint — `app/api/interview/ws-token/route.ts`

Since WebSocket connections are browser-direct, expose the access token via a dedicated BFF endpoint:

```typescript
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/services/api/handle-route";
import { cookies } from "next/headers";

export const GET = withErrorHandler(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("candidate_token")?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ success: true, data: { token } });
});
```

---

## 6. React Hook Reference

**`hooks/use-ai-interview.ts`**

```tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { startInterviewSession, fetchInterviewEvaluation } from "@/services/interview/interview.services";
import type { StartInterviewForm, InterviewStatus, InterviewEvaluation } from "@/types/interview.types";

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL ?? "wss://w2r81bm2-3000.inc1.devtunnels.ms";

export function useAIInterview() {
  const [status, setStatus] = useState<InterviewStatus>("IDLE");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Array<{ role: "AI" | "CANDIDATE"; text: string }>>([]);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startInterview = useCallback(async (form: StartInterviewForm) => {
    setStatus("CONNECTING");

    // 1. Create session via BFF
    const session = await startInterviewSession(form);
    setSessionId(session.sessionId);

    // 2. Retrieve access token via BFF (reads cookie server-side)
    const tokenRes = await fetch("/api/interview/ws-token");
    const { data } = await tokenRes.json();

    // 3. Acquire camera + mic
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    streamRef.current = stream;

    // 4. Open WebSocket
    const ws = new WebSocket(`${WS_BASE_URL}/ws/interview?token=${data.token}&sessionId=${session.sessionId}`);
    wsRef.current = ws;

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data as string);

      if (msg.event === "session-ready") {
        setStatus("CONNECTED");
        _startVideoRecording(ws, stream);
      }

      if (msg.event === "interview-complete") {
        setStatus("ENDED");
        _stopAllMedia();
        const eval_ = await fetchInterviewEvaluation(session.sessionId);
        setEvaluation(eval_);
        setStatus("COMPLETED");
      }
    };

    ws.onerror = () => setStatus("IDLE");
  }, []);

  const sendAnswer = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event: "transcript-turn", role: "CANDIDATE", text }));
      setTranscript((prev) => [...prev, { role: "CANDIDATE", text }]);
    }
  }, []);

  const endInterview = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event: "end-interview" }));
    }
    mediaRecorderRef.current?.stop();
  }, []);

  function _startVideoRecording(ws: WebSocket, stream: MediaStream) {
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = async (e) => {
      if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
        const buffer = await e.data.arrayBuffer();
        const chunk = new Uint8Array(buffer);
        const packet = new Uint8Array(chunk.length + 1);
        packet[0] = 0x02;
        packet.set(chunk, 1);
        ws.send(packet.buffer);
      }
    };
    mediaRecorder.start(5000);
  }

  function _stopAllMedia() {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  return { status, sessionId, transcript, evaluation, startInterview, sendAnswer, endInterview };
}
```

---

## 7. File & Naming Conventions

| Purpose | Path |
| :--- | :--- |
| Zod schemas | `lib/validations/interview.ts` |
| TypeScript types | `types/interview.types.ts` |
| Client service layer | `services/interview/interview.services.ts` |
| React hook | `hooks/use-ai-interview.ts` |
| BFF: Start session | `app/api/interview/start/route.ts` |
| BFF: History | `app/api/interview/history/route.ts` |
| BFF: WS Token | `app/api/interview/ws-token/route.ts` |
| BFF: Transcript | `app/api/interview/[id]/transcript/route.ts` |
| BFF: Evaluation | `app/api/interview/[id]/evaluation/route.ts` |
| BFF: Recording | `app/api/interview/[id]/recording/route.ts` |
| Interview page | `app/(portals)/candidate/(portal)/interview/page.tsx` |
| Evaluation page | `app/(portals)/candidate/(portal)/interview/[id]/evaluation/page.tsx` |

---

## 8. Environment Variables

Add to `.env.local` (and update `.env.sample`):

```env
# Backend REST base URL (used by server-axios internally)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000/api/v1

# WebSocket base URL (used directly by the browser client)
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

For the dev tunnel:
```env
NEXT_PUBLIC_BACKEND_URL=https://w2r81bm2-3000.inc1.devtunnels.ms/api/v1
NEXT_PUBLIC_WS_URL=wss://w2r81bm2-3000.inc1.devtunnels.ms
```

---

## Related Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) — BFF architecture, API workflow, and project structure
- [AGENTS.md](./AGENTS.md) — AI agent coding rules and integration conventions
- [PROMPT_GUIDE.md](./PROMPT_GUIDE.md) — Prompt templates for AI-assisted development
- [README.md](./README.md) — Project overview and getting started guide
