# VoCall — System & API Setup Requirements (`requirement.md`)

This document outlines **all external APIs, databases, keys, credentials, and infrastructure services** required to completely set up and run the VoCall AI Voice Agent Platform, with special emphasis on the **Core Research Pillars**: **FalkorDB Knowledge Graph Memory** and **Hume AI Multimodal Emotion Detection**.

---

## Quick Summary Table

| Service / API | Category / Purpose | Status | Where to Get Key / Setup |
|---|---|---|---|
| **FalkorDB** | **Knowledge Graph Memory Tier** (Entity & Frustration Causal Graph) | **MUST HAVE (RESEARCH CORE)** | Local Docker or [falkordb.com](https://falkordb.com) |
| **Hume AI** | **Real-Time Acoustic & Prosody Emotion Detection** | **MUST HAVE (RESEARCH CORE)** | [hume.ai](https://hume.ai) |
| **Supabase** | Primary Postgres DB, Auth & Vector Fact Storage (`pgvector`) | **MUST HAVE** | [supabase.com](https://supabase.com) |
| **Groq API** | LLaMA-3.3-70b LLM Inference & Text Emotion Signal Fusion | **MUST HAVE** | [console.groq.com](https://console.groq.com) |
| **Upstash Redis** | Short-Term In-Call Memory (`stm:{id}`) & SSE Real-time Events | **MUST HAVE** | [upstash.com](https://upstash.com) |
| **LiveKit** | Real-time WebRTC Audio Infrastructure for Web Calls | **MUST HAVE** | [livekit.io](https://livekit.io) |
| **Cartesia AI** | Ultra-low Latency Neural Voice Synthesis (TTS) | **MUST HAVE** | [cartesia.ai](https://cartesia.ai) |
| **Twilio** | Inbound/Outbound Telephony Phone Numbers & SIP Media Streams | **OPTIONAL** (Phone Calls) | [twilio.com](https://twilio.com) |
| **Sarvam AI** | Hindi & Hinglish Speech-to-Text / Text-to-Speech | **OPTIONAL** (Indian Languages) | [sarvam.ai](https://sarvam.ai) |
| **Resend** | Post-Call Summary Email Dispatch | **OPTIONAL** | [resend.com](https://resend.com) |
| **Trigger.dev** | Async Background Workflow Tasks | **OPTIONAL** | [trigger.dev](https://trigger.dev) |
| **Cerebras AI** | Sub-second LLM Fallback Provider | **OPTIONAL** | [cerebras.ai](https://cerebras.ai) |

---

## 1. Core Research Pillars & Mandatory Infrastructure

> [!IMPORTANT]  
> **Contact-Level Memory & Real-Time Emotion Fusion** form the primary novel architecture for the VoCall research paper. Both **FalkorDB** and **Hume AI** are **mandatory** for contact-level memory graph traversal and acoustic emotion conditioning.

### A. FalkorDB (Knowledge Graph Memory Tier) — MUST HAVE
Stores persistent entity relationship chains, causal frustration paths, and contact interaction graphs across call episodes.
- **Role in Research**: Enables Graph RAG context retrieval (`get_contact_graph_context`) to provide the LLM with entity relationship chains and recurring frustration topics.
- **Environment Variables**:
  ```env
  FALKORDB_HOST=127.0.0.1
  FALKORDB_PORT=6379
  ```
- **Setup Options**:
  - **Option 1 (Local Docker - Recommended)**:
    ```bash
    docker run -p 6379:6379 -it --rm falkordb/falkordb:latest
    ```
  - **Option 2 (FalkorDB Cloud)**: Register at [falkordb.com](https://falkordb.com) and update `FALKORDB_HOST` & `FALKORDB_PORT`.

---

### B. Hume AI (Real-Time Audio Emotion & Prosody Detection) — MUST HAVE
Analyzes acoustic speech waveforms for continuous emotional signals (valence, arousal, prosody, frustration score).
- **Role in Research**: Fused with Groq text-based emotion analysis to produce real-time `fused_emotion`, triggering adaptive tone instructions, frustration connectors (Slack/Webhook alerts), and emotion-conditioned voice synthesis.
- **Environment Variable**:
  ```env
  HUME_API_KEY=your_hume_api_key_here
  ```
- **Setup Steps**:
  1. Sign up at [hume.ai](https://hume.ai).
  2. Navigate to **API Keys** and generate a key.
  3. Add `HUME_API_KEY` to `.env` and save in org API keys for emotion-conditioned voice support.

---

### C. Supabase (Database, Vector Search & Auth) — MUST HAVE
Provides PostgreSQL database storage, auth management, and `pgvector` for semantic long-term memory facts.
- **Environment Variables**:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
  ```
- **Setup Steps**:
  1. Create a project at [supabase.com](https://supabase.com).
  2. Execute migration SQL files in `supabase/migrations` (enabling `pgvector`).

---

### D. Groq API (LLM Engine & Text Emotion Analysis) — MUST HAVE
Provides high-throughput LLaMA-3.3-70b inference and text-based emotion analysis.
- **Environment Variable**:
  ```env
  GROQ_API_KEY=gsk_...
  ```
- **Setup Steps**: Sign up at [consolegroq.com](https://console.groq.com) and create an API Key.

---

### E. Upstash Redis (Short-Term Memory & WebCall SSE Events) — MUST HAVE
Stores ephemeral dialogue turns (`stm:{call_id}`) and streams real-time SSE transcript events (`webcall:{call_id}:events`).
- **Environment Variables**:
  ```env
  UPSTASH_REDIS_REST_URL=https://<your-redis-name>.upstash.io
  UPSTASH_REDIS_REST_TOKEN=AX...
  ```
- **Setup Steps**: Create a free Redis database at [upstash.com](https://upstash.com).

---

### F. LiveKit (WebRTC Audio Infrastructure) — MUST HAVE
Powers browser-to-agent real-time Web Calls (audio streaming, room creation, tokens).
- **Environment Variables**:
  ```env
  LIVEKIT_URL=wss://<your-livekit-domain>.livekit.cloud
  LIVEKIT_API_KEY=API...
  LIVEKIT_API_SECRET=Secret...
  ```
- **Setup Steps**: Create a free project at [LiveKit Cloud](https://cloud.livekit.io).

---

### G. Cartesia AI (Neural Voice Synthesis / TTS) — MUST HAVE
Synthesizes speech in real-time with sub-200ms latency for natural agent voice responses.
- **Environment Variable**:
  ```env
  CARTESIA_API_KEY=...
  ```
- **Setup Steps**: Obtain API Key from [cartesia.ai](https://cartesia.ai).

---

## 2. Telephony & Multilingual Infrastructure (Optional)

### A. Twilio (Telephony & SIP Media Streams)
- **Environment Variables**:
  ```env
  TWILIO_ACCOUNT_SID=AC...
  TWILIO_AUTH_TOKEN=...
  BACKEND_PUBLIC_URL=https://<your-domain-or-ngrok>.com
  ```

### B. Sarvam AI (Indian Languages & Hinglish)
- **Environment Variable**:
  ```env
  SARVAM_API_KEY=...
  ```

---

## 3. Workflows & Background Services (Optional)

- **Resend**: `RESEND_API_KEY=re_...` (Email notification dispatch)
- **Trigger.dev**: `TRIGGER_SECRET_KEY=tr_dev_...` (Async background jobs)
- **Cerebras AI**: `CEREBRAS_API_KEY=...` (Sub-second LLM fallback)

---

## 4. Complete `.env` Master Template (with Research Core)

Save this file as `.env` in the root of your project:

```env
# Environment & Public URL
ENVIRONMENT=development
BACKEND_PUBLIC_URL=http://localhost:8000

# ---------------------------------------------------------------------------
# RESEARCH CORE MUST-HAVES (Emotion Detection & Knowledge Graph Memory)
# ---------------------------------------------------------------------------
HUME_API_KEY=your-hume-api-key
FALKORDB_HOST=127.0.0.1
FALKORDB_PORT=6379

# ---------------------------------------------------------------------------
# PLATFORM CORE MUST-HAVES (Supabase, Groq, Upstash, LiveKit, Cartesia)
# ---------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

GROQ_API_KEY=gsk_your-groq-api-key

UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

LIVEKIT_URL=wss://your-domain.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret

CARTESIA_API_KEY=your-cartesia-api-key

# ---------------------------------------------------------------------------
# OPTIONAL EXTENSIONS (Twilio, Sarvam, Resend, Trigger.dev, Cerebras)
# ---------------------------------------------------------------------------
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
SARVAM_API_KEY=
RESEND_API_KEY=
TRIGGER_SECRET_KEY=
CEREBRAS_API_KEY=
```
