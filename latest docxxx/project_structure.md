# VoCall — Comprehensive Project Structure & Directory Reference

**Document Version:** 2.0  
**Last Updated:** July 2026  
**Status:** Complete  

---

## 1. Monorepo Overview

VoCall is structured as an enterprise-grade monorepo combining real-time audio pipelines, multi-tier memory services, intent/emotion engines, a Next.js dashboard, a Vite landing page, and Supabase database migrations.

```text
VOCALL 19 JULY/
├── app/                      # Main FastAPI Backend Service (Python)
├── vocall/                   # Full Monorepo Application Package
│   ├── frontend/             # Next.js 14 Dashboard & Agent Studio (TypeScript + Tailwind)
│   ├── backend/              # Alternative / Co-located FastAPI Backend
│   └── docs/                 # UI Requirements & Change Specs
├── src/                      # Public Landing Page (Vite + React + Tailwind v4)
├── supabase/                 # Supabase SQL Migrations & Database Setup Queries
├── trigger/                  # Trigger.dev Asynchronous Background Job Pipelines
├── tests/                    # Backend Pytest Test Suite
├── latest docxxx/            # System Architecture, PRD, TRD, Feature Specifications, & Research
└── docker-compose.yml        # Docker Multi-Container Local Stack Orchestration
```

---

## 2. Exhaustive Directory & File Tree

```text
.
├── app/                                  # Main FastAPI Backend Application
│   ├── core/
│   │   └── config.py                     # Environment variables, Pydantic settings, API keys
│   ├── models/                           # SQLModel / Pydantic data models & request/response schemas
│   ├── routers/                          # API Route Handlers
│   │   ├── agents.py                     # Agent CRUD, prompt enhancer (/enhance-prompt), domain import
│   │   ├── api_keys.py                   # Encrypted API key management
│   │   ├── auth.py                       # Supabase JWT validation & auth endpoints
│   │   ├── calls.py                      # Call session controls & LiveKit token generation (/token)
│   │   ├── connectors.py                 # Connector configs & third-party integration routes
│   │   ├── contacts.py                   # Contact management & DPDP "Forget Me" memory clearance
│   │   ├── emotion.py                    # Real-time emotion score polling & stream endpoints
│   │   ├── intent.py                     # Intent detection & slot resolution routes (/detect, /resolve)
│   │   ├── memory.py                     # Direct memory queries across Redis, pgvector & FalkorDB
│   │   ├── phone_numbers.py              # Telephony number purchasing & agent assignment
│   │   └── webhooks.py                   # Inbound telephony & third-party webhook handlers
│   ├── services/                         # Core Business Logic & Engine Services
│   │   ├── connectors/                   # Integrations (HubSpot, Google Calendar, Webhooks)
│   │   ├── emotion/                      # Dual-Signal Emotion Fusion Engine
│   │   │   ├── audio_signal.py           # Hume EVI paralinguistic tone score processing
│   │   │   ├── text_signal.py            # Groq Llama-3.3-70b NLP turn sentiment analyzer
│   │   │   ├── fusion.py                 # Fused valence/arousal state calculator (0.6*Audio + 0.4*Text)
│   │   │   └── tone_adapter.py           # System prompt modifier & Hume Octave TTS pitch tuner
│   │   ├── intent/                       # Intent Engine & VA-ICECoT Framework
│   │   │   ├── detector.py               # Zero-shot intent classifier
│   │   │   ├── slot_manager.py           # Dynamic slot parameter tracker & prompt builder
│   │   │   ├── resolver.py               # 100% slot resolution connector trigger engine
│   │   │   └── combined_rules.py         # Emotion × Intent combined escalation rule matrix
│   │   ├── memory/                       # 4-Tier Hybrid Memory Architecture
│   │   │   ├── short_term.py             # Tier 1: Upstash Redis live turn & transcript buffer
│   │   │   ├── long_term.py              # Tier 2: Supabase pgvector semantic fact embeddings
│   │   │   ├── episodic.py               # Tier 3: Supabase Postgres post-call summaries
│   │   │   ├── graph.py                  # Tier 4: FalkorDB Cypher knowledge graph manager
│   │   │   └── retriever.py              # Unified memory context retrieval engine
│   │   ├── voice/                        # Pipecat & LiveKit voice transport frames
│   │   ├── email.py                      # Email notification service
│   │   ├── livekit_service.py            # LiveKit server SDK room & token lifecycle manager
│   │   ├── llm.py                        # Groq & Cerebras LLM completion wrappers
│   │   ├── post_call.py                  # Post-call analysis & memory creation triggering
│   │   ├── redis_client.py               # Upstash Redis REST connection client
│   │   ├── stt.py                        # Groq (Whisper-large-v3) & Sarvam AI (Saarika v2) STT router
│   │   ├── supabase_client.py            # Supabase service-role client helper
│   │   ├── telephony.py                  # Twilio, Exotel, & Plivo telephony adapters
│   │   ├── tts.py                        # Cartesia (Sonic-2), Sarvam (Bulbul v2), Hume (Octave) TTS router
│   │   ├── voice_pipeline.py             # Main Pipecat real-time audio pipeline builder
│   │   └── webcall_pipeline.py           # In-browser WebRTC voice test stream pipeline
│   └── main.py                           # FastAPI application entry point & CORS configuration
│
├── vocall/                               # Dashboard Web App & Secondary Backend Package
│   ├── frontend/                         # Next.js 14 Dashboard Application
│   │   ├── src/
│   │   │   ├── app/                      # Next.js App Router Pages
│   │   │   │   ├── (auth)/               # Login & Registration authentication routes
│   │   │   │   ├── onboarding/           # Initial organization & space setup wizard
│   │   │   │   ├── dashboard/            # Core Management Dashboard
│   │   │   │   │   ├── agents/           # Agent Builder Studio, Prompt Enhancer, Config Editor
│   │   │   │   │   ├── analytics/        # Recharts call metrics, latency, & sentiment charts
│   │   │   │   │   ├── calls/            # Call history logs, recording player, transcript inspection
│   │   │   │   │   ├── connectors/       # Integration configuration (HubSpot, Calendar, Webhooks)
│   │   │   │   │   ├── contacts/         # Contact directory & DPDP "Forget Me" memory control
│   │   │   │   │   ├── settings/         # Organization settings, API keys, team members
│   │   │   │   │   ├── spaces/           # Workspace & agent grouping management
│   │   │   │   │   ├── layout.tsx        # Dashboard sidebar, header, & global layout frame
│   │   │   │   │   └── page.tsx          # Dashboard overview & real-time metrics summary
│   │   │   │   ├── globals.css           # Tailwind CSS base styles & dark theme tokens
│   │   │   │   └── layout.tsx            # Root Next.js layout provider
│   │   │   ├── components/               # React Components
│   │   │   │   ├── agent/                # Agent Builder, Prompt Editor, & Voice Selector
│   │   │   │   ├── connectors/           # Connector config forms & API key inputs
│   │   │   │   ├── memory/               # Memory visualization tabs & FalkorDB graph view
│   │   │   │   └── ui/                   # UI components & WebCallModal (In-browser testing studio)
│   │   │   ├── lib/                      # Supabase client, utils, & API fetchers
│   │   │   ├── types/                    # TypeScript interfaces & API response definitions
│   │   │   └── middleware.ts             # Authentication session protection middleware
│   │   ├── package.json                  # Next.js dependencies manifest
│   │   └── tailwind.config.ts            # Tailwind CSS theme configuration
│   └── backend/                          # Alternative FastAPI Layout Mirror
│
├── src/                                  # Public Showcase Landing Page (Vite + React)
│   ├── components/                       # Hero section, feature grids, interactive audio demo
│   ├── App.tsx                           # Landing page container
│   ├── index.css                         # Tailwind CSS v4 styling rules
│   └── main.tsx                          # React DOM entry point
│
├── supabase/                             # Database Schemas & Migrations
│   ├── queries/
│   │   ├── 01_complete_schema_setup.sql # Complete 15-table SQL schema with pgvector & RLS
│   │   ├── 02_seed_data.sql              # Initial demonstration data (Organization, Space, Agent, Contact)
│   │   └── README.md                     # Database setup instructions
│   └── migrations/                       # Supabase CLI versioned migration files
│
├── trigger/                              # Asynchronous Background Execution Tasks
│   └── post_call_pipeline.py             # Trigger.dev post-call summarization, memory indexing, & alerts
│
├── tests/                                # Backend Pytest Suite
│   ├── test_agents.py                    # Agent CRUD unit tests
│   ├── test_calls.py                     # Call token & session tests
│   ├── test_emotion.py                   # Emotion fusion engine unit tests
│   ├── test_intent.py                    # Intent detector & slot resolution tests
│   └── test_memory.py                    # 4-tier memory retrieval tests
│
├── latest docxxx/                        # Technical Documentation & Specifications
│   ├── apis.md                           # Comprehensive REST & WebSocket API specification
│   ├── architecture.md                   # System design, data flow, & component interaction
│   ├── design.md                         # UI/UX design tokens, components, & WebCallModal spec
│   ├── features.md                       # Complete feature matrix & specifications
│   ├── PRD.md                            # Product Requirements Document
│   ├── TRD.md                            # Technical Requirements Document
│   ├── VoCall_Research_Diagrams.md       # Competitive matrix & research architecture diagrams
│   └── project_structure.md              # THIS DOCUMENT — Project directory reference
│
├── docker-compose.yml                    # Multi-container orchestration (FastAPI, Redis, FalkorDB, Frontends)
├── package.json                          # Root Vite landing page dependencies
├── README.md                             # Primary repository README & quickstart guide
└── .env.example                          # Template environment variables for API keys & database credentials
```

---

## 3. Core Component Responsibilities

### 3.1 Backend Service (`app/`)
- **`app/main.py`**: Initializes the FastAPI application, mounts CORS middleware, registers routers, and sets up WebSocket endpoints for real-time audio streams.
- **`app/routers/`**: Handles HTTP endpoints for Agent management, Calls, Intent resolution, Emotion polling, Contacts memory clearance, Connectors, and Webhooks.
- **`app/services/intent/`**: Implements the **VA-ICECoT Framework**:
  - `detector.py`: Classifies turn intent via zero-shot LLM inference.
  - `slot_manager.py`: Extracts parameter slots and validates missing fields.
  - `resolver.py`: Triggers backend connectors automatically upon 100% slot completion.
  - `combined_rules.py`: Evaluates Emotion × Intent escalation matrices.
- **`app/services/emotion/`**: Fuses acoustic paralinguistic tone (Hume EVI) with text NLP sentiment (Groq Llama-3.3-70b) to drive prompt adaptations and voice pitch modulation.
- **`app/services/memory/`**: Manages the 4-tier memory stack:
  1. *Short-Term:* Upstash Redis live turn buffer.
  2. *Long-Term:* Supabase pgvector cosine similarity search.
  3. *Episodic:* Postgres post-call summaries.
  4. *Knowledge Graph:* FalkorDB Cypher relationship queries.

### 3.2 Dashboard Web App (`vocall/frontend/`)
- Built with **Next.js 14 (App Router)** and **Tailwind CSS**.
- Provides a prompt-first **Agent Builder Studio** (`/dashboard/agents`) with one-click **AI Prompt Enhancer**, **Web Domain Importer**, pre-built templates, and raw JSON editor mode.
- Includes **In-Browser Web Voice Studio (`WebCallModal`)** for testing LiveKit WebRTC agent sessions directly from the dashboard.
- Displays **FalkorDB Knowledge Graph visualizer**, contact details, call history transcripts, and Recharts-based latency analytics.

### 3.3 Database & Migrations (`supabase/`)
- Managed via Supabase CLI and raw SQL scripts (`supabase/queries/01_complete_schema_setup.sql`).
- Defines core tables: `organizations`, `profiles`, `spaces`, `agents`, `contacts`, `calls`, `connectors`, `connector_configs`, `memory_long_term` (pgvector), `memory_episodic`, `emotion_events`, `intent_events`, and `compliance_log`.
- Enables PostgreSQL extensions (`pgvector`, `uuid-ossp`, `pgcrypto`, `moddatetime`) and Row-Level Security (RLS).

### 3.4 Background Job Engine (`trigger/`)
- Powered by **Trigger.dev**.
- Executes long-running post-call pipelines (`post_call_pipeline.py`) asynchronously without delaying real-time call teardown:
  1. Generates post-call summaries using Groq.
  2. Embeds semantic facts into Supabase `memory_long_term`.
  3. Updates entity-relationship graphs in FalkorDB.
  4. Dispatches post-call WhatsApp/Email alerts and CRM webhook updates.

---

Maintained by VoCall Engineering Team.
