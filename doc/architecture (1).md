# VoCall — Architecture Document
**Version:** 1.0 | **Date:** April 2026 | **Author:** Priyanshu Kumar

---

## 1. High-Level Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                 │
│   Next.js 14 Frontend (Vercel)                                        │
│   Dashboard | Agent Builder | Contacts | Calls | Analytics            │
│   PostHog SDK (analytics + session replay + feature flags)            │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ REST + WebSocket
┌───────────────────────────▼─────────────────────────────────────────┐
│                           API LAYER                                   │
│   FastAPI Backend (Railway)                                           │
│   Auth | Agents | Calls | Memory | Emotion | Connectors | Webhooks    │
│   Better Stack logs shipped from here                                 │
└───┬──────────┬──────────┬──────────┬──────────┬─────────────────────┘
    │          │          │          │          │
┌───▼───┐ ┌───▼───┐ ┌────▼─────┐ ┌──▼───────┐ ┌─▼─────────────────────┐
│Supabase│ │Upstash│ │FalkorDB │ │Voice     │ │External Services      │
│Postgres│ │Redis  │ │(Graph   │ │Pipeline  │ │Groq (LLM/STT/emotion) │
│pgvector│ │(STM)  │ │ Memory) │ │Pipecat + │ │Cerebras (fallback)    │
│Auth    │ └───────┘ └─────────┘ │LiveKit   │ │Sarvam AI (HI/Hinglish)│
│Storage │                       └──────────┘ │Cartesia (EN TTS)      │
│Realtime│                                    │Hume AI (emotion+TTS)  │
└────────┘                                    │Twilio/Plivo/Exotel    │
                                              │Resend (email)          │
┌──────────────────────────────────────────────┤PostHog / Better Stack │
│   Background Layer (Trigger.dev)             │Polar.sh (payments)    │
│   Post-call pipeline — no timeout limits      └────────────────────┘
└───────────────────────────────────────────────┘
```

**Five storage/compute layers, each doing one job:**
- **Supabase** — the system of record (orgs, agents, contacts, calls, long-term + episodic memory)
- **Upstash Redis** — ephemeral per-call state
- **FalkorDB** — per-contact relationship graph
- **Voice Pipeline (Pipecat + LiveKit)** — the only layer that runs in real time, during a live call
- **Trigger.dev** — the only layer that runs after a call ends, with no timeout constraint

---

## 2. Frontend Structure (Next.js App Router)

```
app/
├── (auth)/
│   ├── login/
│   └── signup/
├── onboarding/                    # Org → Space → Agent → Telephony → Deploy
├── (dashboard)/
│   ├── page.tsx                   # Dashboard home
│   ├── agents/
│   │   ├── page.tsx                # Agent list
│   │   └── [id]/page.tsx           # Agent builder (10 tabs)
│   ├── spaces/
│   ├── contacts/
│   │   └── [id]/page.tsx           # Contact profile + 4-tier memory viewer
│   ├── calls/
│   │   └── [id]/page.tsx           # Call detail (transcript + emotion arc)
│   ├── analytics/
│   ├── connectors/
│   └── settings/
│       ├── api-keys/               # BYOK: Groq, Sarvam, Cartesia, Hume, Twilio, Plivo, Exotel, Resend
│       └── telephony/              # Phone numbers, KYC, calling hours
└── components/
    ├── agent/
    ├── memory/
    │   ├── MemoryTierPanel.tsx     # Renders all 4 tiers
    │   ├── GraphMemoryViewer.tsx   # FalkorDB entity graph visualization
    │   └── MemoryInjectionPreview.tsx
    ├── emotion/
    │   ├── EmotionArcChart.tsx
    │   └── EmotionSignalConfig.tsx
    └── voice/
        └── VoiceCard.tsx
```

---

## 3. Backend Structure (FastAPI)

```
app/
├── main.py                          # App entry, CORS, router registration
├── routers/
│   ├── auth.py | agents.py | calls.py | contacts.py
│   ├── memory.py | emotion.py | connectors.py
│   ├── phone_numbers.py | api_keys.py | webhooks.py
├── services/
│   ├── voice_pipeline.py            # Pipecat orchestration — the real-time loop
│   ├── memory/
│   │   ├── short_term.py            # Redis
│   │   ├── long_term.py             # pgvector
│   │   ├── episodic.py              # Postgres summaries
│   │   ├── graph.py                 # FalkorDB — entities, edges, Cypher queries
│   │   └── retriever.py             # Fans out to all 4 tiers in parallel
│   ├── emotion/
│   │   ├── text_signal.py           # Groq
│   │   ├── audio_signal.py          # Hume AI Expression API
│   │   ├── fusion.py                # Weighted merge
│   │   └── tone_adapter.py          # Prompt injection logic
│   ├── llm.py                       # Groq primary + Cerebras fallback routing
│   ├── stt.py                       # Groq Whisper + Sarvam Saarika routing
│   ├── tts.py                       # Cartesia + Sarvam Bulbul + Hume Octave routing
│   ├── telephony.py                 # Twilio / Plivo / Exotel abstraction
│   ├── connectors/
│   │   ├── google_cal.py | hubspot.py | webhook.py | whatsapp.py | supabase_conn.py
│   ├── post_call.py                 # Orchestrator called by Trigger.dev
│   └── email.py                     # Resend
├── models/                          # Pydantic schemas
└── db/
    ├── supabase.py | redis.py | falkordb.py
```

---

## 4. Inbound Call — Full Sequence

```
 1. Caller dials the VoCall-assigned number
          │
 2. Twilio receives the call → POST /webhooks/twilio/inbound
          │
 3. FastAPI:
      - Looks up the agent by phone number
      - Looks up (or creates) the contact by caller ID
      - Creates a `calls` row (status: initiated)
          │
 4. Memory Retrieval — 4 tiers, fetched in parallel:
      ├─ Redis        → resume check (empty for a fresh call)
      ├─ pgvector      → top-5 semantically relevant long-term facts
      ├─ Postgres      → last 3 episodic summaries
      └─ FalkorDB      → entity graph: recent topics, frustration patterns,
                          resolution chains for this contact
          │
 5. Build system prompt:
      base_prompt + memory_block (all 4 tiers) + language_instruction
          │
 6. FastAPI returns TwiML <Stream> → Twilio opens WebSocket
          │
 7. LiveKit room created → Pipecat pipeline starts
          │
 8. REAL-TIME LOOP (repeats every caller turn):
      ┌─────────────────────────────────────────────────────┐
      │ a. STT   → Groq Whisper (EN) / Sarvam Saarika (HI)  │
      │ b. Emotion (parallel):                              │
      │      Text  → Groq NLP JSON mode                    │
      │      Audio → Hume AI Expression API                 │
      │      Fusion → unified emotion_state                 │
      │      → written to Redis + emotion_events table       │
      │ c. If valence < -0.4 → tone_instruction injected     │
      │ d. LLM  → Groq (fallback: Cerebras) — streaming     │
      │ e. TTS  → Cartesia / Sarvam Bulbul / Hume Octave     │
      │      (Hume Octave used if emotion-conditioned mode)  │
      │ f. Turn written to Redis short-term buffer            │
      └─────────────────────────────────────────────────────┘
          │
 9. Call ends → Twilio POST /webhooks/twilio/status
          │
10. FastAPI updates `calls.status = completed`
          │
11. Trigger.dev job `postCallPipeline` fired (async, no timeout) — see Section 5
```

---

## 5. Post-Call Pipeline (Trigger.dev) — Full Sequence

```
Trigger.dev picks up the job (retries up to 3x on failure, never blocks the caller)

Step 1  → Fetch full transcript + emotion_events from Redis
Step 2  → Groq generates episodic summary (2–3 sentences + key facts, JSON mode)
Step 3  → Groq extracts entities + topics from the transcript (JSON mode)
Step 4  → Embed key facts → upsert into pgvector (memory_long_term), tagged with emotion_state
Step 5  → Write new row to memory_episodic (Postgres)
Step 6  → Update FalkorDB graph:
             - Create/merge Entity nodes for new entities mentioned
             - Create Episode node linked to this call
             - Create FRUSTRATED_ABOUT edges if frustration events occurred this call
             - Create LEADS_TO edges between causally related entities
Step 7  → Run Analysis: Summary + Success Evaluation + Structured Data (Groq, using
           agent's configured prompts + rubric); emotion_state auto-included in output
Step 8  → Fire post-call connectors (WhatsApp, HubSpot, Webhook) with retry
Step 9  → Send Resend email if configured (e.g. call-failed alert)
Step 10 → Update `calls` row: emotion_score (avg valence), analysis JSON, transcript
Step 11 → Clear Redis key `stm:{call_id}`

All steps logged to Trigger.dev dashboard + Better Stack.
```

---

## 6. Memory Architecture — 4-Tier Detail

```
┌─────────────────────────────────────────────────────────────────┐
│  TIER 1 — Short-Term (Upstash Redis)                            │
│  Scope: single call                                               │
│  Lifetime: call duration + 5 min                                  │
│  Contains: live transcript, emotion buffer, connector results     │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│  TIER 2 — Long-Term (Supabase pgvector)                          │
│  Scope: per contact, semantic                                     │
│  Lifetime: persistent until deleted                               │
│  Contains: embedded facts + preferences, emotion-tagged            │
│  Query: cosine similarity, top-5 at call start                    │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│  TIER 3 — Episodic (Supabase Postgres)                            │
│  Scope: per contact, chronological                                │
│  Lifetime: persistent until deleted                               │
│  Contains: post-call summaries, key facts, emotion arc             │
│  Query: last 3 by recency at call start                           │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│  TIER 4 — Knowledge Graph (FalkorDB)                              │
│  Scope: per contact, relational                                   │
│  Lifetime: persistent until deleted                               │
│  Contains: entities, topics, episodes, and the relationships       │
│            between them (MENTIONED, FRUSTRATED_ABOUT,              │
│            OCCURRED_IN, LEADS_TO)                                  │
│  Query: Cypher graph traversal at call start                      │
└─────────────────────────────────────────────────────────────────┘

Injection into system prompt (all 4 merged):
┌─────────────────────────────────────────┐
│ [CONTACT MEMORY]                        │
│ Previous conversations:                 │
│  • {episode_1_summary} (emotion: calm)  │
│  • {episode_2_summary} (emotion: upset) │
│                                          │
│ Known facts:                            │
│  • {long_term_fact_1}                   │
│  • {long_term_fact_2}                   │
│                                          │
│ Relationship context (graph):           │
│  • Previously mentioned: loan, EMI      │
│  • Historically frustrated about:       │
│    billing, wait times                  │
│  • Known resolution: claim #1234        │
│    resolved March 15                    │
└─────────────────────────────────────────┘
```

**Why 4 tiers instead of 1:** Each tier answers a different question. Redis answers "what's happening right now." pgvector answers "what facts are relevant to this topic." Postgres answers "what happened recently." FalkorDB answers "how are this contact's issues connected across time" — a question none of the other three tiers can answer.

---

## 7. Emotion System Architecture

```
Every caller turn:
     │
     ├─ Audio path:  raw audio → Hume AI Expression API → {valence, arousal, dominant, confidence}
     ├─ Text path:   transcript → Groq NLP (JSON mode)  → {valence, arousal, dominant, confidence}
     │
     ▼
  Fusion:
     if audio available: valence = 0.6·audio + 0.4·text  (audio weighted higher)
     else:                use text only
     dominant = audio.dominant if audio.confidence > 0.6 else text.dominant
     │
     ▼
  Behaviors fired from fused emotion_state:
     ├─ Tone adaptation      → instruction injected into LLM prompt (this turn only)
     ├─ Voice adaptation     → emotion_state passed to Hume Octave TTS generation
     ├─ Persistence          → written to Redis buffer + emotion_events table
     └─ Threshold trigger    → if frustration > configured threshold, fire connector
```

---

## 8. Hinglish Pipeline

```
Incoming audio (Hindi / English / Hinglish mix)
        │
   Language detection (Sarvam AI auto-detects, or agent.language config)
        │
   STT: Sarvam Saarika v2
        → transcript preserves natural Hindi-English code-switching as spoken
        │
   LLM: Groq llama-3.3-70b
        System prompt appended: "Respond in the same language mix the caller
        uses — Hindi, English, or Hinglish. Do not force English."
        │
   TTS: Sarvam Bulbul v2 (Hindi/Hinglish response)
        OR Cartesia Sonic-2 (if response is pure English)
        auto-selected based on the LLM's output language
```

---

## 9. Connector Architecture

```
DURING CALL                              POST CALL
Trigger: LLM tool call or emotion         Trigger: post-call pipeline (Step 8)
threshold                                 Execution: async, fire-and-forget with
Execution: synchronous — result           retry (max 3 attempts)
returned to LLM in the same turn          Examples:
Examples:                                   "Send summary" → WhatsApp
  "Book appointment" → Google Calendar       "Update CRM" → HubSpot
  "Log lead" → HubSpot                       "Notify team" → Webhook
  "Query DB" → Supabase/Postgres
  Custom → Webhook POST
```

---

## 10. Deployment Topology

```
Development / Demo (Free Tier):
├── Vercel          → Next.js frontend
├── Railway         → FastAPI backend + Pipecat runner
├── Supabase        → Postgres + pgvector + Auth + Storage + Realtime (free)
├── Upstash         → Redis (free, 500K commands/mo)
├── FalkorDB        → graph memory (free tier)
├── LiveKit Cloud   → WebRTC media server (free tier)
├── Trigger.dev     → post-call background jobs (5K runs/mo free)
├── Twilio          → telephony ($15 trial credit + 1 free number)
├── PostHog         → analytics (1M events/mo free)
└── Better Stack    → uptime + logs + status page (free)

Production (India, BYOK):
├── Same as above, EXCEPT:
├── Plivo / Exotel  → telephony (replaces Twilio, cheaper for India)
└── Polar.sh        → payments (if/when a paid tier is added)

Self-Hosted (fully independent):
└── docker-compose.prod.yml
    ├── nginx (SSL termination)
    ├── next-frontend
    ├── fastapi-backend
    ├── livekit-server
    ├── postgres + pgvector extension
    ├── redis
    └── falkordb
```

---

## 11. Security & Compliance Architecture

```
- All BYOK API keys encrypted at rest (AES-256) in Supabase
- Supabase Row-Level Security on every table — org-scoped access only
- JWT authentication enforced on all FastAPI endpoints
- HTTPS enforced everywhere; Twilio webhook signature validation
  (X-Twilio-Signature header) on every inbound webhook
- KYC documents stored in a private Supabase Storage bucket
- DPDP Act 2023 compliance:
    per-contact memory expiry + a single "forget me" endpoint that
    cascades deletion across all 4 memory tiers (Redis, pgvector,
    Postgres, FalkorDB)
- Rate limiting on voice pipeline and public API endpoints
```

---

*End of Architecture Document v1.0*
