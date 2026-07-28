# VoCall — System Architecture Document

**Document Version:** 2.0  
**Last Updated:** July 2026  
**Author:** Lead AI Systems Architect  
**Status:** Approved Specification  

---

## 1. High-Level Architecture Overview

VoCall utilizes a five-tier microservices architecture separating real-time voice streaming from data storage and asynchronous background evaluation tasks:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                     CLIENT LAYER                                        │
│   Next.js 14 Frontend (Vercel)                                                          │
│   Dashboard | Agent Studio | Contacts & 4-Tier Memory | WebCallModal ("Ananya UI")      │
└────────────────────────────┬────────────────────────────────────────────────────────────┘
                             │ REST (HTTPS) + WebRTC (SRTP) / WebSockets (WSS)
┌────────────────────────────▼────────────────────────────────────────────────────────────┐
│                                      API LAYER                                          │
│   FastAPI Backend Service (Railway / Docker)                                            │
│   Auth | Agent Router | Call Controller | 4-Tier Memory RAG | Emotion Fusion Engine     │
│   Intent & Compliance Router | VA-ICECoT Engine (Intent/Slot Classifier & Combined Rules) │
└────┬──────────────┬──────────────┬──────────────┬──────────────┬────────────────────────┘
     │              │              │              │              │
┌────▼────┐   ┌─────▼────┐   ┌─────▼────┐   ┌─────▼────┐   ┌─────▼────────────────────────┐
│Supabase │   │Upstash   │   │FalkorDB  │   │Voice     │   │External Provider APIs        │
│Postgres │   │Redis     │   │(Cypher   │   │Pipeline  │   │Groq LPU (LLM 70B / Whisper)  │
│pgvector │   │(Short-   │   │ Knowledge│   │Pipecat + │   │Cerebras AI (Fallback LLM)    │
│Auth &   │   │ Term     │   │ Graph)   │   │LiveKit   │   │Sarvam AI (Hinglish STT/TTS)  │
│Storage  │   │ Memory)  │   └──────────┘   └──────────┘   │Cartesia (Sonic-2 TTS)        │
└─────────┘   └──────────┘                                 │Hume AI (EVI Emotion & TTS)   │
┌──────────────────────────────────────────────────────────┤Twilio / Exotel / Plivo (BYOK) │
│   Async Background Layer (Trigger.dev Engine)            └──────────────────────────────┘
│   Post-call summary, fact extraction, graph updating     
└──────────────────────────────────────────────────────────┘
```

---

## 2. Real-Time Media & Voice Pipeline (Pipecat + LiveKit)

```text
Caller Phone / Web Browser ("Ananya UI")
         │
         ├── [WebCall] WebRTC SRTP Stream  --> LiveKit Room (LiveKit Cloud)
         └── [Telephony] SIP WebSocket     --> Twilio / Exotel / Plivo
                                                    │
                                                    ▼
                                         FastAPI Pipecat Engine
                                                    │
     ┌──────────────────────────────────────────────┴──────────────────────────────────────────────┐
     │ REAL-TIME VOICE TURN LOOP                                                                   │
     │                                                                                             │
     │  1. Ingest Audio Packet -> Resample to 16kHz PCM                                           │
     │  2. STT Engine: Groq Whisper Large-v3 (English) OR Sarvam Saarika (Hinglish)               │
     │  3. Dual Emotion Engine (Parallel):                                                         │
     │     - Audio Signal: Hume AI Expression API                                                  │
     │     - Text Signal: Groq LLaMA 3.3 70B JSON sentiment                                       │
     │     - Fused Valence = 0.6 * Audio + 0.4 * Text                                             │
     │  4. VA-ICECoT Engine & Intent Resolution:                                                   │
     │     - Intent Classification & Slot Extraction (`detector.py` / `slot_manager.py`)          │
     │     - Emotion x Intent Combined Rules Evaluation (`combined_rules.py`)                     │
     │     - Auto-fire Resolution Chain Connectors on 100% Slot Completion (`resolver.py`)        │
     │  5. LLM Generation: Groq LLaMA 3.3 70B (Streaming, TTFT ~150ms)                             │
     │     - If Valence < -0.40 OR Combined Rule Fired: Inject Adaptive Tone Instruction           │
     │  6. TTS Synthesis: Cartesia Sonic-2 (sub-80ms) OR Sarvam Bulbul / Hume Octave 2            │
     │  7. Push Audio Frame to WebRTC Output Track & Append turn to Upstash Redis stm:{call_id}    │
     └─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 4-Tier Parallel Memory RAG Engine

```text
                                  INBOUND CALL START
                                          │
                        FastAPI Parallel Memory Fanout (`retrieve_all_memory`)
                                          │
       ┌──────────────────┬───────────────┴───────────────┬──────────────────┐
       │                  │                               │                  │
┌──────▼──────┐    ┌──────▼──────┐                 ┌──────▼──────┐    ┌──────▼──────┐
│ Upstash     │    │ Supabase    │                 │ Supabase    │    │ FalkorDB    │
│ Redis       │    │ pgvector    │                 │ Postgres    │    │ Graph       │
├─────────────┤    ├─────────────┤                 ├─────────────┤    ├─────────────┤
│ Check active│    │ Cosine      │                 │ Last 3      │    │ Cypher      │
│ call state /│    │ similarity  │                 │ episodic    │    │ entity      │
│ resume key  │    │ top-5 facts │                 │ call        │    │ frustration │
│             │    │             │                 │ summaries   │    │ paths       │
└──────┬──────┘    └──────┬──────┘                 └──────┬──────┘    └──────┬──────┘
       │                  │                               │                  │
       └──────────────────┴───────────────┬───────────────┴──────────────────┘
                                          │
                                          ▼
                      System Prompt Dynamic Context Injection:
                      ┌───────────────────────────────────────────────┐
                      │ [RECALLED CONTACT CONTEXT]                    │
                      │ - Last Call Summary: {episode_summary}        │
                      │ - Relevant Facts: {pgvector_top5_facts}       │
                      │ - Known Frustrations: {falkordb_graph_nodes}  │
                      └───────────────────────────────────────────────┘
```

---

## 4. Post-Call Async Pipeline Architecture (Trigger.dev)

```text
                                      CALL ENDED EVENT
                                              │
                              Trigger.dev Task Fired (No Timeout)
                                              │
  ┌───────────────────────────────────────────┴───────────────────────────────────────────┐
  │ POST-CALL PIPELINE EXECUTION                                                          │
  │                                                                                       │
  │  Step 1: Pull complete transcript and emotion buffer from Upstash Redis               │
  │  Step 2: Generate 2-3 sentence episode summary + key extracted facts via Groq 70B     │
  │  Step 3: Generate 1536d vector embeddings of new facts and upsert to pgvector         │
  │  Step 4: Persist episode row in Supabase Postgres                                     │
  │  Step 5: Extract entities/topics & execute Cypher queries in FalkorDB Knowledge Graph │
  │  Step 6: Evaluate call CSAT score and task completion status                          │
  │  Step 7: Dispatch post-call connectors (WhatsApp summary, HubSpot CRM, Resend email)  │
  │  Step 8: Flush ephemeral Redis short-term key stm:{call_id}                           │
  └───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Hinglish Code-Switching Pipeline

```text
Caller Audio (Hindi / English / Hinglish Mix)
        │
   Language Router (Sarvam AI auto-detects or agent configuration)
        │
   STT: Sarvam Saarika v2 -> Preserves exact phonetic Hinglish code-switching
        │
   LLM: Groq LLaMA 3.3 70B + System Prompt Instruction:
        "Respond in natural Hinglish matching the caller's language ratio. Do not force pure English."
        │
   TTS: Sarvam Bulbul v2 (Hindi/Hinglish) OR Cartesia Sonic-2 (English)
```

---

## 6. Security, Authentication & DPDP Compliance Topology

- **Data Encryption:** BYOK API credentials encrypted at rest using AES-256-GCM.
- **Tenant Isolation:** Supabase Row-Level Security (RLS) enforcing organization boundary checks (`auth.uid() -> org_id`).
- **DPDP Act Compliance:** API endpoint `DELETE /api/contacts/{id}/memory` triggers an atomic cascading delete across Redis, pgvector, Postgres, and FalkorDB graph nodes.

---

## 7. Deployment Topology

### 7.1 Serverless Cloud Deployment (Recommended)

- **Frontend App:** Vercel (Next.js 14 App Router).
- **Backend API:** Railway Container / AWS ECS (FastAPI + Pipecat).
- **Databases:** Supabase Cloud (Postgres + pgvector), Upstash Redis Cloud, FalkorDB Cloud.
- **Media Server:** LiveKit Cloud.
- **Background Jobs:** Trigger.dev Cloud.

### 7.2 Self-Hosted Docker Compose (`docker-compose.yml`)

- Single or multi-node container orchestration for isolated enterprise environments:
  - `next-frontend` (Port 3000)
  - `fastapi-backend` (Port 8000)
  - `livekit-server` (Port 7880)
  - `postgres-pgvector` (Port 5432)
  - `upstash-redis` (Port 6379)
  - `falkordb` (Port 6379 / 6380)

---

Approved and Maintained by VoCall Architecture Team.
