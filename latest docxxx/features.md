# VoCall — Comprehensive Feature Matrix & Specifications

**Document Version:** 2.0  
**Last Updated:** July 2026  
**Status:** Complete  

---

## 1. Agent Studio & Builder Suite

### 1.1 Prompt-First Agent Creation
- **Capability:** Free-text system instruction box serving as the primary agent configuration interface.
- **Provider & Implementation:** Supabase Postgres (`agents.system_prompt`).
- **Rationale:** Reduces onboarding friction compared to multi-step wizard forms.

### 1.2 AI Prompt Enhancer
- **Capability:** One-click enhancement that restructures and optimizes rough prompt drafts into high-performing voice agent prompts.
- **Provider & Implementation:** Groq LPU (`llama-3.3-70b-versatile`) via endpoint `POST /api/agents/{id}/enhance-prompt`.
- **Rationale:** ~400ms latency ensures instant UI response without interrupting developer flow.

### 1.3 Pre-Built Use Case Templates
- **Capability:** One-click template chips (Customer Support, Sales Qualification, Appointment Booking, Healthcare Triage, Debt Recovery, HR Screening).
- **Provider & Implementation:** Frontend preset registry appending domain-specific guidelines into prompt.

### 1.4 Dual UI / Code View Editor
- **Capability:** Toggle between structured visual form controls and a syntax-highlighted raw JSON config editor (`agents.config`).
- **Provider & Implementation:** Next.js frontend state renderer + Monaco/JSON syntax view.

### 1.5 Web Domain Metadata Scraper
- **Capability:** Paste company website URL to automatically extract business name, service description, and brand voice guidelines.
- **Provider & Implementation:** FastAPI Scraper (`/api/import-domain`) parsing OpenGraph and meta tags.

---

## 2. Voice Catalog, STT & TTS Routing

### 2.1 Speech-to-Text (STT) Routing

| Language Target | Provider | Model | Latency | Key Rationale |
|---|---|---|---|---|
| **English** | Groq | Whisper Large-v3 | ~150ms | Ultra-fast LPU inference, high word accuracy rate |
| **Hindi / Hinglish** | Sarvam AI | Saarika v2 | ~200ms | Native code-switching training; handles natural mixed Hindi-English speech |

### 2.2 Text-to-Speech (TTS) Routing

| Mode / Language | Provider | Model | TTFAB Latency | Key Rationale |
|---|---|---|---|---|
| **English (Standard)** | Cartesia | Sonic-2 | ~80ms | Lowest latency English synthesis available |
| **Hindi / Hinglish** | Sarvam AI | Bulbul v2 | ~150ms | Natural Indian accent & language cadence |
| **Emotion-Conditioned** | Hume AI | Octave 2 | ~75ms | Modulates pitch, warmth, and speed based on caller emotion score |

---

## 3. Dual-Signal Emotion Engine

### 3.1 Acoustic Emotion Signal (Audio)
- **Capability:** Extracts paralinguistic tone features (pitch, cadence, stress) from raw speech audio.
- **Provider:** Hume AI Expression Measurement API.

### 3.2 NLP Emotion Signal (Text)
- **Capability:** Real-time sentiment and intent analysis on caller speech transcripts per turn.
- **Provider:** Groq LLaMA 3.3 70B (JSON Mode).

### 3.3 Multimodal Emotion Fusion
- **Capability:** Computes unified valence and arousal state ($Valence_{fused} = 0.6 \cdot Audio + 0.4 \cdot Text$).
- **Provider:** Custom FastAPI Fusion Engine.

### 3.4 Adaptive Voice & Prompt Behaviors
- **Empathetic Prompt Injection:** Automatically injects tone-softening guidelines into the system prompt when caller valence drops below -0.4.
- **Voice Pitch Adaptation:** Modulates Hume Octave TTS voice warmth and speed based on caller emotion.
- **Automated Escalation Triggers:** Fires connectors (human agent handoff or priority webhook) when frustration score exceeds 0.7.

---

## 4. 4-Tier Hybrid Memory Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                4-TIER HYBRID MEMORY MATRIX                              │
├─────────────────┬───────────────────┬───────────────────┬───────────────────────────────┤
│ Tier            │ Storage Engine    │ Scope             │ Primary Function              │
├─────────────────┼───────────────────┼───────────────────┼───────────────────────────────┤
│ 1. Short-Term   │ Upstash Redis     │ Active Call       │ Live transcript & turn buffer │
│ 2. Long-Term    │ Supabase pgvector │ Contact Semantic  │ Top-5 vector fact retrieval   │
│ 3. Episodic     │ Supabase Postgres │ Contact History   │ Last 3 post-call summaries    │
│ 4. Knowledge    │ FalkorDB          │ Contact Relational│ Cypher entity relationship    │
└─────────────────┴───────────────────┴───────────────────┴───────────────────────────────┘
```

- **DPDP Act Compliance ("Forget Me"):** Single API call `DELETE /api/contacts/{id}/memory` cascades deletion across Redis, pgvector, Postgres, and FalkorDB graph.

---

## 5. Web Call Testing Studio (Ananya UI / `WebCallModal`)

- **Contact Linking Input:** Pre-call text field to bind browser test sessions to Supabase `contacts` for memory testing.
- **Visual Voice Orb:** Dynamic status ring:
  - *Idle:* Static slate ring.
  - *Connecting:* Pulsing purple glow (`bg-[#7C3AED]/30`).
  - *Agent Speaking:* 112px purple orb with animated ping wave (`bg-[#7C3AED]`).
  - *User Speaking:* 104px emerald green orb (`bg-emerald-600`).
- **Live Stream & Post-Call Review:** Auto-scrolling transcript stream during call, followed by post-call decision screen allowing instant review or discard.

---

## 6. Telephony & Compliance Features

- **Twilio PSTN Integration:** Standard inbound/outbound telephony with WebSocket streaming.
- **BYOK Indian Telephony (Exotel/Plivo):** Low-cost India calling with TRAI DLT header support and KYC document verification portal.
- **Calling Hours & Schedules:** Configurable time-window restrictions for automated dialing campaigns.

---

## 7. Post-Call Async Workflows & Connectors

- **During-Call Tools:** LLM function calling for Google Calendar, HubSpot, Supabase DB queries, and Webhooks.
- **Post-Call Pipeline (Trigger.dev):** Asynchronous evaluation, summary generation, fact embedding, graph updating, and WhatsApp/Email dispatching.

---
*Updated and Maintained by VoCall Engineering*
