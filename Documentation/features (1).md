# VoCall — Features Document
**Version:** 1.0 | **Date:** April 2026 | **Author:** Priyanshu Kumar

> Every feature below states: what it does, which provider/tool implements it, and why that provider was chosen.

---

## 1. Agent Builder

### 1.1 Prompt-First Agent Creation
**What:** Free-text box as the primary way to create an agent — no rigid form-filling required.
**How:** Textarea → stored as `agents.system_prompt` in Supabase Postgres.
**Provider:** N/A (pure UI + DB write)

### 1.2 Enhance Prompt
**What:** One click rewrites the user's rough prompt into a clearer, better-structured system prompt.
**How:** POST `/api/agents/{id}/enhance-prompt` → Groq `llama-3.3-70b-versatile` with instruction: "Improve this voice agent prompt for clarity and structure, keep the same intent."
**Provider:** Groq (free tier)
**Why Groq:** Already the primary LLM in the stack, fast enough (~400ms) for interactive UI use, zero extra integration cost.

### 1.3 Use Case Chips
**What:** Clickable chips (Customer Support, Sales, Appointment Booking, HR, Collections, Healthcare, Debt Recovery, Lead Qualification) that append relevant context to the prompt.
**How:** Static templates stored in frontend, appended as text to the prompt textarea on click.
**Provider:** N/A

### 1.4 UI / Code Toggle
**What:** Switches between the form view and a raw JSON view of the agent's full config object.
**How:** Renders `agents.config` (JSONB column) as a formatted, syntax-highlighted code block.
**Provider:** N/A

### 1.5 Domain Import
**What:** Paste a website URL → auto-fills agent/org name and description.
**How:** `/api/import-domain` fetches the URL, scrapes `<title>` and meta description.
**Provider:** N/A (native fetch/scrape)

---

## 2. Voice Profile — STT & TTS

### 2.1 Speech-to-Text (Understanding the Caller)
**What:** Converts the caller's spoken audio into text for the LLM to process.

| Language | Provider | Model | Latency | Why This Provider |
|---|---|---|---|---|
| English | **Groq** | Whisper large-v3 | ~150ms | OpenAI Whisper accuracy but ~10x faster because Groq runs it on custom LPU hardware. Free tier. |
| Hindi / Hinglish | **Sarvam AI** | Saarika v2 | ~200ms | The only STT model natively trained on Hinglish code-switching. Whisper forces speech into one language and breaks natural Hindi-English mixing. Free developer tier. |

**Routing logic:** `agent.language == "en"` → Groq Whisper. `agent.language in ["hi", "hinglish"]` → Sarvam Saarika.

**Alternatives considered and rejected:** OpenAI Whisper direct (too slow, ~800ms), AssemblyAI (paid, no Hinglish), Deepgram Nova-2 (paid, no Hindi), Azure/AWS Speech (paid, robotic Hinglish handling).

### 2.2 Text-to-Speech (Agent's Voice)
**What:** Converts the LLM's text response into spoken audio played back to the caller.

| Language / Mode | Provider | Model | Latency (TTFAB) | Why This Provider |
|---|---|---|---|---|
| English (standard) | **Cartesia** | Sonic-2 | ~80ms | Fastest English TTS available. ElevenLabs sounds better but is 3–5x slower and paid — for real-time telephony, low latency beats marginal quality gains. Free tier. |
| Hindi / Hinglish | **Sarvam AI** | Bulbul v2 | ~150ms | Only TTS producing genuinely natural (non-robotic) Hindi/Hinglish speech. Google/Azure TTS sound robotic in Hindi. Free developer tier. |
| Emotional / adaptive | **Hume AI** | Octave 2 | ~75ms | Voice tone is conditioned on the caller's detected emotion — a frustrated caller gets a softer, slower agent voice; a happy caller gets a warmer tone. No other TTS provider does emotion-conditioned generation. Free tier: 10,000 characters/month. |

**Routing logic:** English + emotion mode off → Cartesia. Hindi/Hinglish → Sarvam Bulbul. Emotion mode on → Hume Octave 2 (passes `emotion_state` as a generation parameter).

**Alternatives considered and rejected:** ElevenLabs (best quality but ~400ms latency + paid), OpenAI TTS (slow, no Hindi), Google/Azure TTS (robotic Hindi), Play.ht (discontinued).

### 2.3 Voice Selection UI
**What:** Card-based voice picker — name, gender badge, language tags (EN/HI/MA/Hinglish), provider badge, cost bar, latency bar, preview button.
**How:** Hardcoded voice list (7 voices) mapped to Cartesia/Sarvam voice IDs; play button fetches a preview clip.
**Provider:** Cartesia + Sarvam AI (same as above)

---

## 3. Emotion System (VoCall-Exclusive)

### 3.1 Real-Time Text Emotion Signal
**What:** After every caller speech turn, extracts `{valence, arousal, dominant, confidence}` from the transcript.
**How:** Groq `llama-3.3-70b` in JSON mode with a structured extraction prompt, run on every turn (~120ms).
**Provider:** Groq (free)
**Why:** Already in the stack, fast, free, handles Hinglish text natively since it's the same LLM used for conversation.

### 3.2 Real-Time Audio Emotion Signal
**What:** Analyzes paralinguistic features (pitch, energy, speech rate) directly from the caller's raw voice — catches emotional cues that text alone misses (e.g. "I'm fine" said in an angry tone).
**How:** Raw audio chunk sent to Hume AI's Expression Measurement API, returns emotion probabilities mapped to VoCall's schema.
**Provider:** Hume AI EVI (Empathic Voice Interface)
**Why Hume:** Best-in-class audio emotion model, research-backed (Hume's founder published the foundational 27-emotion taxonomy paper in Nature). Free tier: 5 EVI minutes/month per account; VoCall's dev team pools multiple free accounts for testing, uses a fresh account on demo day.
**Alternatives rejected:** AWS Comprehend / Azure Cognitive (text-only, paid), SpeechBrain / Wav2Vec (open-source but require GPU hosting, not viable for a free-tier deployment).

### 3.3 Emotion Fusion
**What:** Combines text + audio signals into one unified emotion state.
**How:** `valence = 0.6 × audio.valence + 0.4 × text.valence` (audio weighted higher since it captures tone text can't); falls back to text-only if no Hume key configured.
**Provider:** Custom logic (no external API)

### 3.4 Tone Adaptation
**What:** When the caller sounds frustrated (`valence < -0.4`), an instruction is injected into the LLM's system prompt for that turn only — "Be extremely empathetic, slow down, acknowledge frustration before responding."
**How:** Conditional prompt injection based on `emotion_state.valence` thresholds.
**Provider:** Groq (same LLM call, no extra service)

### 3.5 Emotion-Conditioned Voice Generation
**What:** Beyond adapting *what* the agent says, the agent's *voice tone itself* adapts — softer/slower when the caller is upset, warmer when the caller is happy.
**How:** `emotion_state` is passed as a parameter into the Hume Octave 2 TTS generation call.
**Provider:** Hume AI Octave 2
**Why this matters:** No competitor (Unpod, OmniDim, Vapi, Retell) does emotion-conditioned voice generation. This is a genuinely novel capability.

### 3.6 Frustration Threshold Connector Trigger
**What:** If frustration exceeds a configurable threshold (default 0.7), a connector automatically fires (e.g. human handoff).
**How:** Threshold check in the emotion fusion loop, fires the configured connector async.
**Provider:** N/A (internal logic) + whichever connector is configured

### 3.7 Emotion Arc Chart
**What:** Per-call visualization of valence over time — shows the emotional trajectory of the conversation.
**How:** `emotion_events` time-series table queried and rendered with Recharts.
**Provider:** N/A (Supabase Postgres + frontend charting)

---

## 4. Memory System (VoCall-Exclusive, 4-Tier)

### 4.1 Short-Term Memory
**What:** Live transcript + emotion buffer for the duration of the active call.
**How:** Redis key `stm:{call_id}`, TTL = call duration + 5 min buffer, cleared after the post-call pipeline completes.
**Provider:** Upstash Redis (serverless, free tier)
**Why Upstash:** REST API means no persistent connection needed from serverless functions — fits FastAPI on Railway perfectly.

### 4.2 Long-Term Memory (Semantic)
**What:** Per-contact facts and preferences retrieved by semantic similarity — "what do we know about this caller that's relevant right now."
**How:** Facts embedded (1536-dim vector) and stored in `memory_long_term`; at call start, top-5 most similar facts retrieved via cosine similarity.
**Provider:** Supabase pgvector
**Why:** Same database as everything else — no extra service, free tier covers vector storage + ivfflat indexing.

### 4.3 Episodic Memory
**What:** Structured post-call summaries — "what happened in the last N conversations with this contact."
**How:** After each call, Groq generates a 2–3 sentence summary + 3–5 key facts in JSON mode; stored in `memory_episodic`; last 3 episodes retrieved at each new call start.
**Provider:** Groq (summary generation) + Supabase Postgres (storage)

### 4.4 Knowledge Graph Memory
**What:** Entity-relationship graph per contact — captures connections a flat vector/summary approach can't: "this complaint in January led to this escalation in February which was resolved in March," or "this contact is consistently frustrated about billing across 4 separate calls."
**How:** Post-call, Groq extracts named entities and topics from the transcript. These become graph nodes; relationships (`MENTIONED`, `FRUSTRATED_ABOUT`, `OCCURRED_IN`, `LEADS_TO`) become edges. At call start, a Cypher query retrieves relevant entities, frustration patterns, and resolution chains for the contact.
**Provider:** FalkorDB
**Why FalkorDB:** Redis-compatible (fits alongside the existing Redis short-term memory), free tier, fastest graph traversal for small per-contact graphs, Cypher query language (same as Neo4j, meaning every AI coding assistant already knows the syntax).
**Alternatives rejected:** Neo4j (heavier, no generous free self-host path for this use case), Memgraph (similar tradeoffs), Mem0/Zep (managed memory layers that would replace the whole custom system rather than complement it — good v3+ option, not chosen for this build).

### 4.5 Memory Injection at Call Start
**What:** All 4 memory tiers are retrieved in parallel and formatted into a context block injected into the agent's system prompt before the call begins.
**How:** `retrieve_all_memory()` fans out to Redis (resume check), pgvector (top-5 facts), Postgres (last 3 episodes), and FalkorDB (entity/frustration graph context) simultaneously; results merged into one prompt block.
**Provider:** All four memory providers above, orchestrated by FastAPI.

### 4.6 Emotion-Tagged Memory Writes
**What:** Every memory write (long-term fact, episodic summary, graph edge) is tagged with the `emotion_state` active at the moment it was captured.
**How:** `emotion_state` JSONB column on `memory_long_term` and `memory_episodic`; `FRUSTRATED_ABOUT` edges in FalkorDB carry emotion metadata.
**Provider:** N/A (schema design decision across existing providers)

### 4.7 DPDP "Forget Me" Compliance
**What:** One-click deletion of all memory for a contact across all 4 tiers, satisfying India's Digital Personal Data Protection Act 2023.
**How:** `DELETE /api/contacts/{id}/memory` cascades deletes across Redis, pgvector, Postgres, and FalkorDB.
**Provider:** All four memory providers.

---

## 5. LLM & Inference

### 5.1 Primary LLM
**What:** Generates the agent's conversational responses.
**Provider:** Groq, model `llama-3.3-70b-versatile`
**Why:** Free tier, ~400ms first-token latency (fastest available for a 70B-class model due to Groq's custom LPU chips), OpenAI-compatible API format.

### 5.2 Fallback LLM
**What:** Automatically takes over when Groq rate-limits (HTTP 429).
**Provider:** Cerebras AI, model `llama-3.3-70b`
**Why:** Free tier of 1M tokens/day, also OpenAI-compatible — the fallback is a 10-line `base_url` swap, zero additional code complexity. Cerebras uses wafer-scale chips claiming up to 20x throughput vs GPU-based providers.

---

## 6. Telephony

### 6.1 Development & Demo Calling
**What:** Inbound and outbound phone calls for building and demoing the product.
**Provider:** Twilio
**Why:** $15 free trial credit + 1 free phone number with no credit card required at signup. Direct, well-documented integration path with Hume AI (Twilio can stream call audio straight into Hume's pipeline). Largest ecosystem of Pipecat telephony examples, which matters heavily for AI-assisted ("vibe coding") development. Trial limits (10-min calls, calls only to verified numbers, 5 concurrent) are more than sufficient for a college major-project demo.

### 6.2 Production India Telephony (BYOK)
**What:** Cheaper, India-compliant calling for real deployments after the demo.
**Provider:** Plivo or Exotel (user brings their own API keys)
**Why:** Exotel is 30–40% cheaper per minute than Twilio for India calling and bills in INR (no forex risk), plus full TRAI/KYC compliance built in. Plivo offers a cleaner developer API with Twilio-compatible webhooks as a middle option.

### 6.3 Inbound Call Handling
**What:** Receives a call, connects it to the real-time voice pipeline.
**How:** Twilio webhook → FastAPI returns TwiML `<Stream>` pointing to a WebSocket URL → Twilio streams raw audio → Pipecat picks it up → LiveKit room created for media routing.

### 6.4 Outbound Call Handling
**What:** VoCall initiates a call to a contact (e.g. "Call Now" button, or scheduled follow-up).
**How:** FastAPI calls the Twilio REST API (`POST /Calls`) with the target number; when answered, the same WebSocket/Pipecat pipeline starts, with the agent speaking first.

### 6.5 Calling Hours
**What:** Restrict automatic outbound calling to defined days/time windows.
**How:** Day-chip selector (Mon–Sun) + time range pickers + "Add Range" for multiple windows, stored in `agents.config`.
**Provider:** N/A (scheduling logic in FastAPI before dialing)

### 6.6 KYC Compliance
**What:** Document upload required to activate an Indian phone number.
**How:** Drag-and-drop upload (Aadhaar/PAN/GST/Company Registration) to Supabase Storage; status tracked as pending/submitted/approved.
**Provider:** Supabase Storage

---

## 7. Voice Pipeline Orchestration

### 7.1 Real-Time Pipeline Framework
**What:** Orchestrates the STT → Emotion → LLM → TTS loop in real time for the duration of a call.
**Provider:** Pipecat (open-source framework)
**Why:** Purpose-built for exactly this kind of multi-stage real-time voice pipeline, has native support for streaming each stage so audio starts playing before the full response is generated.

### 7.2 Media Server / WebRTC
**What:** Handles the actual audio transport between the caller (via Twilio) and the pipeline.
**Provider:** LiveKit (self-hosted or LiveKit Cloud free tier)
**Why:** Industry-standard WebRTC media server, integrates natively with Pipecat, handles room creation/token generation/cleanup per call.

---

## 8. Connectors

### 8.1 During-Call Connectors
**What:** Actions the agent can take mid-conversation via LLM function calling — book an appointment, log a lead, query a database, hit a custom webhook.
**How:** Registered as tools in the Groq function-calling schema; when the LLM decides to call one, the result is fetched and read back to the caller in the same turn.
**Providers:** Google Calendar API (appointments), HubSpot API (CRM), Supabase/Postgres (arbitrary DB queries), generic Webhook (anything else).

### 8.2 Post-Call Connectors
**What:** Actions fired asynchronously after the call ends — WhatsApp summary, CRM update, team notification.
**How:** Fired from the Trigger.dev post-call pipeline with automatic retry (3 attempts).
**Providers:** Plivo/Twilio WhatsApp API, HubSpot, generic Webhook.

---

## 9. Analysis (Per-Call Intelligence)

### 9.1 Call Summary
**What:** 2–3 sentence auto-generated summary of the call, using a user-customizable prompt.
**Provider:** Groq

### 9.2 Success Evaluation
**What:** LLM-judged pass/fail (or rubric-scored) evaluation of whether the call achieved its goal.
**Provider:** Groq, with a configurable rubric dropdown (Goal Achieved / Appointment Booked / Lead Qualified / Issue Resolved / Custom).

### 9.3 Structured Data Extraction
**What:** Pulls specific data points out of the call transcript into a JSON schema the user defines ("Add Property" — property name + extraction instruction).
**Provider:** Groq (JSON mode). `emotion_state` is always auto-included in the output without the user needing to define it.

---

## 10. Background Jobs & Post-Call Pipeline

### 10.1 Post-Call Orchestration
**What:** Everything that must happen after a call ends — generate episode, extract entities, update the knowledge graph, run analysis, fire connectors, send emails, clear short-term memory.
**Provider:** Trigger.dev
**Why:** Vercel serverless functions have a 10-second execution limit; the full post-call pipeline (multiple sequential Groq calls + DB writes + connector calls) routinely takes 5–15 seconds and would silently fail on a plain asyncio background task. Trigger.dev runs with no such timeout and gives automatic retries + a dashboard of every job run.

---

## 11. Transactional Email

### 11.1 Email Notifications
**What:** Welcome email, agent-published confirmation, call-failed alert, KYC-submitted confirmation, password reset, monthly usage invoice.
**Provider:** Resend
**Why:** Developer-friendly API, generous free tier, clean React-Email-style templating.

---

## 12. Observability

### 12.1 Product Analytics, Feature Flags, Session Replay
**What:** Tracks key events (agent published, call completed, memory recalled, connector fired), gates rollout of new features (e.g. graph memory UI), and records session replays for debugging the dashboard.
**Provider:** PostHog
**Why:** One SDK replaces three separate tools (analytics + feature flags + error tracking) — 1M events, 5K replays, 100K error events all free per month.

### 12.2 Uptime Monitoring, Logs, Status Page
**What:** Monitors API and voice pipeline health, ships structured logs, and provides a public status page (useful credibility during a mentor demo).
**Provider:** Better Stack
**Why:** Free uptime monitoring + status page + log ingestion, alerts within 2 minutes of downtime.

---

## 13. Payments (v2 — Future)

### 13.1 Paid Cloud Tier
**What:** When VoCall adds a hosted paid plan beyond the self-hosted/BYOK model.
**Provider:** Polar.sh
**Why:** Merchant-of-Record (handles global tax/VAT/GST automatically), open-source itself, no monthly fee (4% + $0.40 per transaction only), GitHub-native integrations fit an open-source project well.

---

## 14. Platform Infrastructure

### 14.1 Authentication & Multi-Org Structure
**Provider:** Supabase Auth (email/password, JWT sessions, role-based access: owner/admin/member)

### 14.2 Database
**Provider:** Supabase Postgres (relational data + pgvector for embeddings + Realtime for live call status updates)

### 14.3 File Storage
**Provider:** Supabase Storage (logos, KYC documents — private buckets with RLS)

### 14.4 Frontend Hosting
**Provider:** Vercel (Next.js 14 App Router)

### 14.5 Backend Hosting
**Provider:** Railway (FastAPI + Pipecat runner)

---

*End of Features Document v1.0*
