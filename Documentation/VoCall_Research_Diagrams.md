# VoCall — Research Paper: Diagrams, Tables & Supporting Material

---

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph CLIENT["CLIENT LAYER — Next.js 14 (Vercel)"]
        UI["Dashboard / Agent Builder / Contacts / Calls / Analytics"]
        SDK["PostHog SDK (Analytics + Replay + Feature Flags)"]
    end

    subgraph API["API LAYER — FastAPI (Railway)"]
        AUTH["Auth Router"]
        AGENTS["Agents Router"]
        CALLS["Calls Router"]
        MEM["Memory Router"]
        EMO["Emotion Router"]
        CONN["Connectors Router"]
        WEBHOOKS["Webhooks Router"]
    end

    subgraph STORAGE["STORAGE LAYER"]
        SUPA["Supabase Postgres\n(Organizations, Agents,\nContacts, Calls)"]
        VEC["Supabase pgvector\n(Long-Term Memory\nEmbeddings)"]
        REDIS["Upstash Redis\n(Short-Term\nCall Buffer)"]
        GRAPH["FalkorDB\n(Knowledge Graph\nMemory)"]
        STOR["Supabase Storage\n(KYC Docs, Logos)"]
    end

    subgraph VOICE["VOICE PIPELINE — Pipecat + LiveKit"]
        STT["STT\nGroq Whisper (EN)\nSarvam Saarika (HI)"]
        LLM["LLM\nGroq llama-3.3-70b\n(Cerebras fallback)"]
        TTS["TTS\nCartesia (EN)\nSarvam Bulbul (HI)\nHume Octave (Emotion)"]
        EMO2["Emotion Engine\nText: Groq NLP\nAudio: Hume AI\nFusion Layer"]
    end

    subgraph BG["BACKGROUND — Trigger.dev"]
        PIPELINE["Post-Call Pipeline\n11-Step Orchestration\n(No timeout limits)"]
    end

    subgraph TELE["TELEPHONY"]
        TWILIO["Twilio (Dev/Demo)"]
        PLIVO["Plivo / Exotel\n(India Production)"]
    end

    CLIENT -->|REST + WebSocket| API
    API --> STORAGE
    API --> VOICE
    API --> TELE
    TELE -->|Webhook| WEBHOOKS
    WEBHOOKS --> VOICE
    VOICE --> REDIS
    VOICE --> EMO2
    PIPELINE --> SUPA
    PIPELINE --> VEC
    PIPELINE --> GRAPH
    PIPELINE --> REDIS
    API -->|Trigger| PIPELINE
```

---

## 2. Inbound Call — Full End-to-End Sequence

```mermaid
sequenceDiagram
    participant C as Caller
    participant T as Twilio
    participant F as FastAPI
    participant M as Memory (4 Tiers)
    participant LK as LiveKit
    participant PP as Pipecat Pipeline
    participant G as Groq (LLM/STT/NLP)
    participant H as Hume AI
    participant SA as Sarvam AI
    participant CA as Cartesia
    participant TR as Trigger.dev

    C->>T: Dials VoCall number
    T->>F: POST /webhooks/twilio/inbound
    F->>F: Lookup agent by phone number
    F->>F: Lookup / create contact by caller ID
    F->>F: Create calls row (status: initiated)

    par Memory Retrieval (parallel)
        F->>M: Redis — resume check
        F->>M: pgvector — top-5 relevant facts (cosine similarity)
        F->>M: Postgres — last 3 episodic summaries
        F->>M: FalkorDB — entity graph, frustration patterns
    end

    F->>F: Build system prompt (base + memory_block + language_instruction)
    F->>T: Return TwiML <Stream> → WebSocket URL
    T->>LK: Open WebSocket, stream raw audio
    LK->>PP: Audio stream begins, Pipecat pipeline starts

    loop Real-Time Loop (every caller turn)
        PP->>SA: Audio → Sarvam Saarika (HI/Hinglish)
        PP->>G: Audio → Groq Whisper (EN)
        Note over PP: Transcript chunk produced

        par Emotion Analysis (parallel)
            PP->>G: Transcript → Groq NLP JSON mode → {valence, arousal, dominant}
            PP->>H: Raw audio → Hume Expression API → paralinguistic features
        end

        PP->>PP: Fusion: 0.6×audio + 0.4×text emotion
        PP->>PP: Write emotion_state to Redis + emotion_events table

        alt valence < -0.4 (frustrated)
            PP->>PP: Inject tone_instruction into LLM prompt
        end

        PP->>G: Full prompt + context → Groq llama-3.3-70b (streaming)
        G-->>PP: Response tokens (streaming)

        alt Emotion-Conditioned Voice ON
            PP->>H: Text + emotion_state → Hume Octave 2
            H-->>T: Adaptive audio stream
        else Standard Voice
            PP->>CA: Text → Cartesia Sonic-2 (EN)
            PP->>SA: Text → Sarvam Bulbul (HI)
            CA-->>T: Audio stream
        end

        PP->>F: Write turn to Redis short-term buffer
    end

    T->>F: POST /webhooks/twilio/status (call ended)
    F->>F: Update calls.status = completed
    F->>TR: Fire postCallPipeline job (async)

    TR->>TR: Step 1: Fetch transcript + emotion_events from Redis
    TR->>G: Step 2: Generate episodic summary (JSON mode)
    TR->>G: Step 3: Extract entities + topics
    TR->>M: Step 4: Embed facts → upsert pgvector (emotion-tagged)
    TR->>M: Step 5: Write memory_episodic row
    TR->>M: Step 6: Update FalkorDB graph (entities, edges, episodes)
    TR->>G: Step 7: Run Analysis (Summary + Success Eval + Structured Data)
    TR->>TR: Step 8: Fire post-call connectors (WhatsApp, HubSpot, Webhook)
    TR->>TR: Step 9: Send Resend email (if configured)
    TR->>M: Step 10: Update calls row (emotion_score, analysis, transcript)
    TR->>M: Step 11: Clear Redis key stm:{call_id}
```

---

## 3. 4-Tier Memory Architecture

```mermaid
graph LR
    subgraph CALL["At Call Start — Parallel Retrieval"]
        R1["Tier 1\nUpstash Redis\nShort-Term\nLive call buffer\nTTL: call + 5min"]
        R2["Tier 2\nSupabase pgvector\nLong-Term Semantic\ntop-5 cosine similarity\nfacts + preferences"]
        R3["Tier 3\nSupabase Postgres\nEpisodic\nLast 3 summaries\nchronological"]
        R4["Tier 4\nFalkorDB\nKnowledge Graph\nEntities, topics\nFrustration patterns"]
    end

    subgraph INJECT["Memory Injection Block"]
        BLOCK["[CONTACT MEMORY]\n• Episode 1 summary (emotion: calm)\n• Episode 2 summary (emotion: upset)\n\nKnown facts:\n• fact_1 (tagged: satisfied)\n• fact_2 (tagged: frustrated)\n\nGraph context:\n• Mentioned: loan, EMI\n• Frustrated about: billing\n• Resolution: claim #1234 (March 15)"]
    end

    subgraph PROMPT["Final System Prompt"]
        BASE["Base agent prompt"] --> FINAL["Final Prompt\n(sent to LLM)"]
        BLOCK --> FINAL
        TONE["Tone instruction\n(if valence < -0.4)"] --> FINAL
    end

    R1 & R2 & R3 & R4 -->|Merged| BLOCK
```

---

## 4. Emotion System Pipeline

```mermaid
flowchart TD
    AUDIO["Raw Caller Audio"] --> STT["STT\nTranscript chunk"]
    AUDIO --> HUME["Hume AI\nExpression API\n(optional BYOK)"]
    STT --> NLP["Groq NLP\nJSON mode\n{valence, arousal,\ndominant, confidence}"]
    HUME --> AUDIO_EMO["Audio Emotion\n{valence, arousal,\ndominant, confidence}"]

    NLP --> FUSE["Fusion Layer"]
    AUDIO_EMO --> FUSE

    FUSE -->|"60% audio + 40% text\n(text-only if no Hume key)"| UNIFIED["Unified emotion_state\n{valence, arousal,\ndominant, confidence,\ntimestamp}"]

    UNIFIED --> B1{"valence < -0.4?"}
    UNIFIED --> B2{"valence > 0.6?"}
    UNIFIED --> B3{"frustration > threshold?"}
    UNIFIED --> PERSIST["Write to Redis\n+ emotion_events table"]
    UNIFIED --> VOICE_COND["Emotion-Conditioned\nTTS (Hume Octave 2)\nif enabled"]

    B1 -->|YES| TONE_NEG["Inject into LLM prompt:\n'Be extra empathetic,\nslow down, acknowledge\nfrustration'"]
    B2 -->|YES| TONE_POS["Inject into LLM prompt:\n'Be warm and\nconversational'"]
    B3 -->|YES| TRIGGER["Fire configured\nconnector async\n(e.g. human handoff)"]
```

---

## 5. Knowledge Graph Memory — Node/Edge Schema

```mermaid
graph LR
    CONTACT["Contact\n{id, name, phone}"]
    ENTITY1["Entity\n'loan'"]
    ENTITY2["Entity\n'EMI'"]
    ENTITY3["Entity\n'billing'"]
    TOPIC1["Topic\n'payment issues'"]
    EP1["Episode\n{id, date, summary}\nCall #1 — Jan 15"]
    EP2["Episode\n{id, date, summary}\nCall #2 — Feb 10"]
    EP3["Episode\n{id, date, summary}\nCall #3 — Mar 22"]

    CONTACT -->|MENTIONED| ENTITY1
    CONTACT -->|MENTIONED| ENTITY2
    CONTACT -->|FRUSTRATED_ABOUT| ENTITY3
    CONTACT -->|FRUSTRATED_ABOUT| TOPIC1
    ENTITY1 -->|OCCURRED_IN| EP1
    ENTITY2 -->|OCCURRED_IN| EP1
    ENTITY3 -->|OCCURRED_IN| EP2
    EP1 -->|LEADS_TO| EP2
    EP2 -->|LEADS_TO| EP3
    ENTITY3 -->|OCCURRED_IN| EP3
```

---

## 6. Hinglish Language Pipeline

```mermaid
flowchart LR
    AUDIO["Incoming Audio\n(Hindi / English / Hinglish mix)"]
    AUDIO --> DETECT["Language Detection\nSarvam AI auto-detect\nOR agent.language config"]
    DETECT -->|HI / Hinglish| SARVAM_STT["Sarvam Saarika v2\n(Native Hinglish STT)\nPreserves code-switching"]
    DETECT -->|EN| GROQ_STT["Groq Whisper\nlarge-v3"]

    SARVAM_STT --> LLM["Groq llama-3.3-70b\nSystem prompt appended:\n'Respond in same language mix\nthe caller uses'"]
    GROQ_STT --> LLM

    LLM -->|Hindi/Hinglish output| SARVAM_TTS["Sarvam Bulbul v2\n(Natural Indian TTS)"]
    LLM -->|English output| CART_TTS["Cartesia Sonic-2\n(Low-latency EN TTS)"]
    LLM -->|Emotion-conditioned| HUME_TTS["Hume Octave 2\n(Adaptive TTS)"]

    SARVAM_TTS & CART_TTS & HUME_TTS --> OUTPUT["Audio Output\nto Caller"]
```

---

## 7. Post-Call Pipeline — Trigger.dev Job Flow

```mermaid
flowchart TD
    START["Call Ended\nTwilio status webhook"] --> FIRE["Trigger.dev\npostCallPipeline job"]
    
    FIRE --> S1["Step 1\nFetch transcript +\nemotion_events from Redis"]
    S1 --> S2["Step 2\nGroq → Episodic summary\n(JSON mode, 2-3 sentences)"]
    S2 --> S3["Step 3\nGroq → Extract entities\n+ topics (JSON mode)"]
    S3 --> S4["Step 4\nEmbed facts → upsert pgvector\n(emotion-tagged writes)"]
    S4 --> S5["Step 5\nWrite memory_episodic row\n(Postgres)"]
    S5 --> S6["Step 6\nUpdate FalkorDB graph\n(Entity nodes, Episode node,\nFRUSTRATED_ABOUT edges,\nLEADS_TO chains)"]
    S6 --> S7["Step 7\nRun Analysis\n(Summary + Success Eval +\nStructured Data via Groq)"]
    S7 --> S8["Step 8\nFire post-call connectors\n(WhatsApp / HubSpot / Webhook)\nRetry: max 3 attempts"]
    S8 --> S9["Step 9\nSend Resend email\n(if configured)"]
    S9 --> S10["Step 10\nUpdate calls row\n(emotion_score, analysis,\ntranscript)"]
    S10 --> S11["Step 11\nClear Redis key\nstm:{call_id}"]
    S11 --> DONE["Pipeline Complete\nAll steps logged to\nTrigger.dev dashboard\n+ Better Stack"]

    style S6 fill:#7C3AED,color:#fff
    style S4 fill:#7C3AED,color:#fff
    style S7 fill:#7C3AED,color:#fff
```

---

## 8. Agent Builder Tab Structure

```mermaid
graph LR
    AGENT["Agent Page\n/dashboard/agents/{id}"]
    T1["1. Identity\nName, avatar,\ndescription,\ndomain import"]
    T2["2. Persona\nSystem prompt,\nEnhance Prompt,\nuse case chips,\nUI/Code toggle"]
    T3["3. Voice Profile\nVoice cards,\nSTT/TTS selection,\nemotion-conditioned\nvoice toggle"]
    T4["4. Telephony\nProvider (Twilio/\nPlivo/Exotel),\nassigned number,\ninbound/outbound"]
    T5["5. Memory ★\n4-tier toggles,\nmax-facts sliders,\ninjection preview,\ngraph visualization"]
    T6["6. Emotion ★\nSignal config,\ntone adaptation,\nthreshold slider,\narc preview"]
    T7["7. Advanced\nStop Speaking Plan,\nCalling Hours,\nAuto Reachout,\nHandover Number"]
    T8["8. Analysis\nSummary prompt,\nSuccess Eval rubric,\nStructured Data\nschema builder"]
    T9["9. Integrations\nConnector grid\n(During/Post Call),\nconfigure modals"]
    T10["10. Recent Calls\nCall log table,\nemotion scores,\nlink to detail view"]

    AGENT --> T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10

    style T5 fill:#7C3AED,color:#fff
    style T6 fill:#7C3AED,color:#fff
```

---

## TABLE 1 — Comparative Analysis of Existing Voice Agent Platforms

| Feature | **VoCall** | **Vapi** | **Retell AI** | **OmniDim** | **Unpod** |
|---|---|---|---|---|---|
| **Persistent memory across calls** | ✅ 4-tier (Redis + pgvector + Postgres + FalkorDB) | ❌ No memory | ❌ No memory | ❌ No memory | ⚠️ Toggle only (no depth) |
| **Short-term call memory** | ✅ Upstash Redis, TTL-based | ❌ | ❌ | ❌ | ❌ |
| **Long-term semantic memory** | ✅ pgvector cosine similarity | ❌ | ❌ | ❌ | ❌ |
| **Episodic memory (post-call summaries)** | ✅ Groq-generated, Postgres stored | ❌ | ❌ | ❌ | ❌ |
| **Knowledge graph memory** | ✅ FalkorDB (entities, edges, Cypher) | ❌ | ❌ | ❌ | ❌ |
| **Real-time text emotion detection** | ✅ Groq NLP, every turn | ❌ | ❌ | ⚠️ Post-call only | ❌ |
| **Real-time audio emotion detection** | ✅ Hume AI Expression API | ❌ | ❌ | ❌ | ❌ |
| **Dual-signal emotion fusion** | ✅ 60% audio + 40% text | ❌ | ❌ | ❌ | ❌ |
| **Tone adaptation (prompt injection)** | ✅ Per-turn, threshold-based | ❌ | ❌ | ❌ | ❌ |
| **Emotion-conditioned voice generation** | ✅ Hume Octave 2 | ❌ | ❌ | ❌ | ❌ |
| **Emotion-tagged memory writes** | ✅ Every write carries emotion_state | ❌ | ❌ | ❌ | ❌ |
| **Hinglish STT** | ✅ Sarvam Saarika v2 | ❌ | ❌ | ❌ | ❌ |
| **Indian language TTS** | ✅ Sarvam Bulbul v2 | ❌ | ❌ | ❌ | ❌ |
| **India telephony (Plivo/Exotel)** | ✅ BYOK | ⚠️ Twilio only | ⚠️ Twilio only | ❌ | ✅ |
| **KYC compliance (TRAI)** | ✅ Document upload + status tracking | ❌ | ❌ | ❌ | ✅ |
| **DPDP Act 2023 forget-me** | ✅ Cross-tier cascade delete | ❌ | ❌ | ❌ | ❌ |
| **Open-source + self-hostable** | ✅ MIT | ❌ Closed | ❌ Closed | ❌ Closed | ✅ MIT |
| **BYOK (Bring Your Own Key)** | ✅ 9 providers | ❌ | ❌ | ❌ | ❌ |
| **INR pricing** | ✅ | ❌ USD only | ❌ USD only | ❌ USD only | ✅ |
| **Post-call structured data extraction** | ✅ Groq JSON mode + custom schema | ✅ | ✅ | ⚠️ Limited | ✅ |
| **Success evaluation rubric** | ✅ Configurable rubric | ✅ | ✅ | ⚠️ | ✅ |
| **During-call connectors (function calling)** | ✅ Google Cal, HubSpot, Webhook, Supabase | ✅ | ✅ | ⚠️ | ✅ |
| **Emotion arc visualization** | ✅ Per-call Recharts chart | ❌ | ❌ | ⚠️ Post-call | ❌ |
| **Frustration threshold auto-trigger** | ✅ Configurable slider → connector | ❌ | ❌ | ❌ | ❌ |
| **Background job orchestration** | ✅ Trigger.dev (no timeout) | Managed | Managed | Managed | ❌ |

**Legend:** ✅ = Full support | ⚠️ = Partial / limited | ❌ = Not supported

---

## TABLE 2 — STT Provider Comparison (for Research Paper)

| Provider | Model | Language Support | Latency | Hinglish Accuracy | Pricing | Selected For |
|---|---|---|---|---|---|---|
| **Groq Whisper** | Whisper large-v3 | 57 languages (EN primary) | ~150ms | Poor (forces one language) | Free tier | VoCall EN STT |
| **Sarvam AI Saarika** | Saarika v2 | Hindi, Hinglish, 10 Indian languages | ~200ms | Excellent (natively trained) | Free developer tier | VoCall HI/Hinglish STT |
| OpenAI Whisper (API) | Whisper large-v3 | 57 languages | ~800ms | Poor | Paid ($0.006/min) | Rejected (latency) |
| AssemblyAI | Universal-2 | EN + limited others | ~250ms | No support | Paid | Rejected (no Hinglish) |
| Deepgram Nova-2 | Nova-2 | EN + 36 languages | ~120ms | No support | Paid | Rejected (no Hindi) |
| Azure Speech | Neural | 100+ languages | ~300ms | Limited, robotic | Paid | Rejected (quality) |
| AWS Transcribe | — | 100+ languages | ~400ms | Limited | Paid | Rejected (latency + cost) |

---

## TABLE 3 — TTS Provider Comparison (for Research Paper)

| Provider | Model | Language | TTFAB | Hinglish | Emotion-Conditioned | Pricing | Selected For |
|---|---|---|---|---|---|---|---|
| **Cartesia** | Sonic-2 | EN | ~80ms | ❌ | ❌ | Free tier | VoCall EN TTS |
| **Sarvam AI** | Bulbul v2 | HI/Hinglish/10 Indian | ~150ms | ✅ Natural | ❌ | Free developer tier | VoCall HI TTS |
| **Hume AI** | Octave 2 | EN | ~75ms | ❌ | ✅ (unique) | Free: 10K chars/mo | VoCall Emotion TTS |
| ElevenLabs | v2.5 | EN + 32 languages | ~400ms | ❌ | ❌ | Paid ($0.18/1K chars) | Rejected (latency+cost) |
| OpenAI TTS | TTS-1-HD | EN + limited | ~500ms | ❌ | ❌ | Paid ($15/1M chars) | Rejected (slow) |
| Google TTS | WaveNet | 50+ languages | ~300ms | ⚠️ Robotic | ❌ | Paid | Rejected (quality) |
| Azure TTS | Neural | 140 languages | ~250ms | ⚠️ Robotic | ❌ | Paid | Rejected (quality) |

---

## TABLE 4 — LLM Provider Comparison (for Research Paper)

| Provider | Model | Context Window | First-Token Latency | Free Tier | Hinglish | Fallback Role |
|---|---|---|---|---|---|---|
| **Groq** | llama-3.3-70b-versatile | 128K tokens | ~400ms | ✅ (generous RPM) | ✅ Native | Primary LLM |
| **Cerebras** | llama-3.3-70b | 128K tokens | ~200ms | ✅ 1M tokens/day | ✅ Native | Fallback (on 429) |
| OpenAI | GPT-4o | 128K tokens | ~800ms | ❌ Paid | ✅ | Rejected (cost) |
| Anthropic | Claude 3.5 Sonnet | 200K tokens | ~600ms | ❌ Paid | ✅ | Rejected (cost) |
| Google | Gemini 1.5 Flash | 1M tokens | ~500ms | ⚠️ Limited | ✅ | Considered for v2 |
| Together AI | Various | Varies | ~350ms | ⚠️ | ✅ | Considered for v2 |

---

## TABLE 5 — Memory System Comparison: VoCall vs Existing Work

| Dimension | **VoCall (Proposed)** | **Mem0** | **Zep** | **MemGPT** | **Vapi/Retell (baseline)** |
|---|---|---|---|---|---|
| **Architecture** | 4-tier (Redis + pgvector + Postgres + FalkorDB) | Unified vector store | Vector + entity store | Virtual context manager | None |
| **Short-term (within call)** | ✅ Redis, TTL-based | ❌ | ❌ | ⚠️ Context window only | ❌ |
| **Long-term semantic** | ✅ pgvector, cosine similarity | ✅ | ✅ | ✅ | ❌ |
| **Episodic (per-session summaries)** | ✅ LLM-generated, structured JSON | ⚠️ Partial | ✅ | ✅ | ❌ |
| **Knowledge graph** | ✅ FalkorDB, Cypher, entity-relationship | ❌ | ⚠️ Partial | ❌ | ❌ |
| **Emotion-tagged writes** | ✅ emotion_state on every write | ❌ | ❌ | ❌ | ❌ |
| **Emotion-conditioned retrieval** | ✅ Retrieval weighted by emotional context | ❌ | ❌ | ❌ | ❌ |
| **Real-time injection** | ✅ < 200ms at call start | ✅ (async) | ✅ (async) | ⚠️ Slow | ❌ |
| **DPDP/GDPR forget-me** | ✅ Cross-tier cascade | ⚠️ Partial | ✅ | ❌ | ❌ |
| **India deployment (free tier)** | ✅ All free tiers | ❌ Paid SaaS | ❌ Paid SaaS | Self-hosted (GPU) | N/A |
| **Self-hostable** | ✅ | ❌ | ✅ | ✅ (complex) | N/A |

---

## TABLE 6 — Emotion Detection Approach Comparison

| Approach | Signal Type | Latency | Accuracy | Real-Time Capable | Used In Prior Systems |
|---|---|---|---|---|---|
| **VoCall Text NLP (Groq)** | Text transcript | ~120ms | Moderate | ✅ Per-turn | Rare in voice agents |
| **VoCall Audio (Hume AI)** | Raw audio paralinguistic | ~180ms | High | ✅ Streaming | ❌ Not in voice agent platforms |
| **VoCall Fusion (proposed)** | Text + Audio weighted | ~200ms | High | ✅ Per-turn | ❌ Novel contribution |
| Sentiment analysis (VADER/BERT) | Text only | ~50ms | Low-Moderate | ✅ | ⚠️ Some platforms |
| AWS Comprehend | Text only | ~300ms + cost | Moderate | ⚠️ Latency concern | Rare |
| Manual supervisor monitoring | Human observation | Minutes | High | ❌ Not scalable | Legacy call centers |
| Post-call audio analysis | Audio (batch) | Minutes | High | ❌ Not real-time | OmniDim (partial) |
| Keyword spotting | Text (rules) | ~10ms | Low | ✅ | ⚠️ Crude approaches |

---

## TABLE 7 — Performance Requirements vs Targets (System Design Table)

| Component | Metric | VoCall Target | Industry Baseline | Notes |
|---|---|---|---|---|
| **Full pipeline (TTFAB)** | Time to first audio byte | < 800ms | 1200–2000ms | Groq LPU advantage |
| **STT (English)** | Transcription latency | < 150ms | 300–500ms | Groq Whisper on LPU |
| **STT (Hinglish)** | Transcription latency | < 200ms | N/A (no baseline) | Novel: Sarvam Saarika |
| **LLM first token** | Time to first token | < 400ms | 600–1500ms | Groq llama-3.3-70b |
| **TTS (English)** | Audio start latency | < 80ms | 200–400ms | Cartesia Sonic-2 |
| **TTS (Hinglish)** | Audio start latency | < 150ms | N/A | Sarvam Bulbul v2 |
| **TTS (Emotion)** | Audio start latency | < 75ms | N/A | Hume Octave 2 |
| **Memory retrieval** | All 4 tiers at call start | < 200ms | N/A | Parallel fan-out |
| **Emotion NLP** | Per-turn text analysis | < 120ms | N/A | Groq JSON mode |
| **Emotion audio** | Per-turn audio analysis | < 180ms | N/A | Hume Expression API |
| **Emotion fusion** | Combined output | < 200ms | N/A | Custom logic |
| **Post-call pipeline** | Full 11-step job | < 10s | N/A | Trigger.dev async |
| **API responses** | Non-voice endpoints | < 500ms | < 1000ms | FastAPI on Railway |

---

## TABLE 8 — Research Contributions Mapping

| # | Novel Contribution | System Component | Research Claim | Evaluation Method |
|---|---|---|---|---|
| **C1** | 4-tier persistent memory for voice agents | Redis + pgvector + Postgres + FalkorDB | First voice agent platform implementing 4-tier memory hierarchy | A/B test: memory vs no-memory baseline — context relevance score, caller recall |
| **C2** | Dual-signal real-time emotion detection | Groq NLP + Hume AI + Fusion Layer | Fusion of text NLP + audio paralinguistic signals > either signal alone for real-time accuracy | Agreement rate vs ground truth labels; ablation study (text-only vs audio-only vs fused) |
| **C3** | Emotion-conditioned memory retrieval | retriever.py + emotion_state tags | Emotion context improves memory relevance for returning callers | Relevance score comparison: tagged vs untagged retrieval |
| **C4** | Hinglish-native voice agent pipeline | Sarvam Saarika + Bulbul + LLM instruction | First end-to-end voice agent platform with Hinglish code-switching STT/TTS | WER on Hinglish test set; naturalness MOS score; code-switching preservation rate |
| **C5** | Knowledge graph memory for voice agents | FalkorDB + Cypher queries | Graph-structured contact memory captures cross-session entity relationships that flat vector stores cannot | Precision/recall of entity relationship retrieval; frustration pattern detection accuracy |
| **Bonus** | Emotion-conditioned voice generation | Hume Octave 2 integration | Dynamic TTS tone adaptation based on detected caller emotion reduces call escalation rate | Caller satisfaction survey; escalation rate comparison (adaptive vs static TTS) |

---

## TABLE 9 — Open-Source Voice Agent Platform Comparison (Deployment Model)

| Platform | License | Self-Hostable | BYOK | Free Tier | India-First | Memory | Emotion |
|---|---|---|---|---|---|---|---|
| **VoCall** | MIT | ✅ Docker Compose | ✅ 9 providers | ✅ All free tiers | ✅ | ✅ 4-tier | ✅ Dual-signal |
| Unpod | MIT | ✅ | ❌ | ✅ | ⚠️ Partial | ⚠️ Toggle only | ❌ |
| Pipecat (framework) | BSD-2 | ✅ | ✅ | ✅ | ❌ | ❌ (framework only) | ❌ |
| Livekit Agents | Apache 2.0 | ✅ | ✅ | ✅ | ❌ | ❌ (framework only) | ❌ |
| Vapi | Proprietary | ❌ | ❌ | ⚠️ Trial only | ❌ | ❌ | ❌ |
| Retell AI | Proprietary | ❌ | ❌ | ⚠️ Trial only | ❌ | ❌ | ❌ |
| OmniDim | Proprietary | ❌ | ❌ | ⚠️ Trial only | ❌ | ❌ | ⚠️ Post-call only |

---

## TABLE 10 — Technology Stack Summary (for Paper Section 3: System Design)

| Layer | Component | Technology | Version | Justification |
|---|---|---|---|---|
| **Frontend** | Web app | Next.js | 14 (App Router) | SSR, file-based routing, Vercel deploy |
| **Backend** | API server | FastAPI | Latest | Async Python, Pipecat-compatible, fast |
| **Primary DB** | Relational store | Supabase Postgres | — | RLS, Realtime, free tier |
| **Vector DB** | Semantic memory | Supabase pgvector | — | Co-located, no extra service |
| **Short-term memory** | Call buffer | Upstash Redis | — | Serverless, TTL, REST API |
| **Graph memory** | Entity relationships | FalkorDB | — | Redis-compatible, Cypher, free |
| **Auth** | Identity | Supabase Auth | — | JWT, social login, free |
| **File storage** | KYC/media | Supabase Storage | — | RLS-protected buckets |
| **Primary LLM** | Conversation | Groq llama-3.3-70b-versatile | — | ~400ms first token, free tier, LPU hardware |
| **Fallback LLM** | Rate-limit fallback | Cerebras llama-3.3-70b | — | 1M tokens/day free, wafer-scale chips |
| **STT (English)** | Speech recognition | Groq Whisper large-v3 | — | ~150ms, LPU-accelerated |
| **STT (Hinglish)** | Hindi/code-switch STT | Sarvam AI Saarika v2 | — | Only natively trained Hinglish STT |
| **TTS (English)** | Voice synthesis | Cartesia Sonic-2 | — | ~80ms TTFAB, free tier |
| **TTS (Hindi)** | Voice synthesis | Sarvam AI Bulbul v2 | — | Natural Indian voices |
| **TTS (Emotion)** | Adaptive synthesis | Hume Octave 2 | — | Only emotion-conditioned TTS available |
| **Voice pipeline** | Real-time orchestration | Pipecat | Latest | Open-source, streaming stages |
| **Media server** | WebRTC | LiveKit | Cloud/self-hosted | Native Pipecat integration |
| **Audio emotion** | Paralinguistic analysis | Hume AI Expression API | — | Research-backed 27-emotion taxonomy |
| **Text emotion** | NLP sentiment | Groq llama-3.3-70b | JSON mode | Already in stack, free |
| **Telephony (dev)** | Call routing | Twilio | — | Free trial, Pipecat examples |
| **Telephony (prod)** | India calling | Plivo / Exotel | BYOK | INR billing, TRAI compliance |
| **Background jobs** | Post-call pipeline | Trigger.dev | v3 | No timeout limits, retry dashboard |
| **Email** | Transactional | Resend | — | Developer-friendly, free tier |
| **Analytics** | Product events | PostHog | — | 1M events/mo free, session replay |
| **Monitoring** | Uptime + logs | Better Stack | — | Free monitoring + status page |
| **Deployment (FE)** | Frontend hosting | Vercel | — | Next.js native, free tier |
| **Deployment (BE)** | Backend hosting | Railway | — | FastAPI + Pipecat, free tier |

---

## Figure Captions (for IEEE/ACM paper)

- **Fig. 1** — VoCall system architecture: five-layer design separating client, API, storage, voice pipeline, and background job concerns.
- **Fig. 2** — Inbound call sequence diagram: full interaction from dial-in to post-call pipeline completion.
- **Fig. 3** — 4-tier memory architecture: tier roles, retrieval methods, and unified injection template.
- **Fig. 4** — Dual-signal emotion pipeline: text NLP + audio paralinguistic fusion with downstream behavioral triggers.
- **Fig. 5** — Knowledge graph schema: FalkorDB node types and edge relationships for per-contact episodic memory.
- **Fig. 6** — Hinglish pipeline: language-conditional STT/TTS routing with LLM code-switching instruction.
- **Fig. 7** — Post-call pipeline (Trigger.dev): 11-step orchestration job with retry semantics and storage targets.

---

*Document generated for VoCall B.Tech Major Project — GNIOT, 2026–27*
*Author: Priyanshu Kumar*
