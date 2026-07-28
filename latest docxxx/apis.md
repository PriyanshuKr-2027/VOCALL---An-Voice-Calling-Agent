# VoCall API Keys & Environment Configuration

This document lists all the API keys, credentials, and environment variables required to run **VoCall** (AI Voice Calling Agent). You can copy the code snippet below into a `.env` file in your root directory and backend/frontend directories.

---

## 📋 `.env.example` Quick Copy

Create a `.env` file in your project root with the following variables:

```env
# ==========================================
# 🌐 General & Application Environment
# ==========================================
ENVIRONMENT=development
PROJECT_NAME="VoCall API"
BACKEND_PUBLIC_URL=http://localhost:8000
VOCALL_BASE_URL=http://localhost:3000
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# ==========================================
# 🗄️ Supabase (Database & Authentication)
# ==========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# ==========================================
# 🧠 LLM Providers (Intelligence Engines)
# ==========================================
# Primary LLM Engine (Required - Llama 3.3 70B Versatile)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Sub-second LLM Fallback (Optional)
CEREBRAS_API_KEY=your_cerebras_api_key_here

# ==========================================
# ⚡ Memory & Knowledge Graph Engines
# ==========================================
# Upstash Redis REST API (Short-term Live Call Memory)
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here

# FalkorDB Knowledge Graph (Long-term Episodic & Entity Memory)
FALKORDB_HOST=127.0.0.1
FALKORDB_PORT=6379

# ==========================================
# 🎙️ WebRTC & Telephony Engine
# ==========================================
# LiveKit Cloud or Self-Hosted WebRTC
LIVEKIT_URL=wss://your-domain.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key_here
LIVEKIT_API_SECRET=your_livekit_api_secret_here

# Twilio (PSTN Inbound/Outbound Phone Calling)
TWILIO_ACCOUNT_SID=ACyour_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here

# ==========================================
# 🗣️ Voice, Speech & Emotion AI Providers
# ==========================================
# Sarvam AI (Indian Languages STT & TTS - Hindi, etc.)
SARVAM_API_KEY=your_sarvam_api_key_here

# Cartesia (Sonic-2 Ultra-Low Latency English TTS)
CARTESIA_API_KEY=your_cartesia_api_key_here

# Hume AI (Empathic Voice Interface & Emotion Detection)
HUME_API_KEY=your_hume_api_key_here

# ==========================================
# ⚙️ Background Workflows & Email Services
# ==========================================
# Trigger.dev (Async Background Tasks & Jobs)
TRIGGER_SECRET_KEY=tr_dev_your_trigger_secret_key_here

# Resend (Transactional Email Dispatch)
RESEND_API_KEY=re_your_resend_api_key_here
```

---

## 🔑 Comprehensive API Key Reference

Below is the detailed list of every API key and environment variable, explaining its purpose, required status, format, and where to obtain it.

### 1. 🗄️ Supabase (Database, Auth, & Storage)

| Variable | Required | Description | Where to Get |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Project API URL for Supabase database and authentication. | [Supabase Dashboard](https://database.new) → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Client-safe public anonymous API key for client-side Auth and queries. | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Secret admin service key for backend operations. Keep safe! | Supabase Dashboard → Settings → API |

---

### 2. 🧠 LLM Providers (Large Language Models)

| Variable | Required | Description | Where to Get |
| :--- | :---: | :--- | :--- |
| `GROQ_API_KEY` | **Yes** | Groq Cloud API Key (`gsk_...`). Powers primary real-time agent reasoning via `llama-3.3-70b-versatile`. | [Groq Console](https://console.groq.com/keys) |
| `CEREBRAS_API_KEY` | Optional | Cerebras Cloud API Key. Used for sub-second LLM fallback during high load. | [Cerebras Cloud](https://cloud.cerebras.ai) |

---

### 3. ⚡ Memory & Knowledge Graph Databases

| Variable | Required | Description | Where to Get |
| :--- | :---: | :--- | :--- |
| `UPSTASH_REDIS_REST_URL` | **Yes** | Upstash Redis REST endpoint for storing live conversation state and short-term memory. | [Upstash Console](https://console.upstash.com) → Redis Database |
| `UPSTASH_REDIS_REST_TOKEN` | **Yes** | Upstash Redis REST bearer authorization token. | Upstash Console → Redis Database |
| `FALKORDB_HOST` | **Yes** | Host address of FalkorDB graph database (Default: `127.0.0.1` for local Docker). | Self-hosted via Docker (`falkordb/falkordb`) |
| `FALKORDB_PORT` | **Yes** | Port number of FalkorDB graph database (Default: `6379`). | Self-hosted via Docker |

---

### 4. 🎙️ WebRTC & Telephony Engine

| Variable | Required | Description | Where to Get |
| :--- | :---: | :--- | :--- |
| `LIVEKIT_URL` | **Yes** | WebSocket connection URL for LiveKit WebRTC media server (`wss://...`). | [LiveKit Cloud](https://cloud.livekit.io) |
| `LIVEKIT_API_KEY` | **Yes** | LiveKit API Key used for WebRTC room token generation. | LiveKit Cloud → Project Settings → Keys |
| `LIVEKIT_API_SECRET` | **Yes** | LiveKit API Secret used to sign WebRTC tokens. | LiveKit Cloud → Project Settings → Keys |
| `TWILIO_ACCOUNT_SID` | **Yes** | Twilio Account SID (`AC...`) for inbound/outbound PSTN voice calls and SIP trunks. | [Twilio Console](https://console.twilio.com) |
| `TWILIO_AUTH_TOKEN` | **Yes** | Twilio Auth Token for authenticating telephony API calls and webhook validation. | Twilio Console |

---

### 5. 🗣️ Speech, Voice Synthesis (TTS/STT) & Emotion AI

| Variable | Required | Description | Where to Get |
| :--- | :---: | :--- | :--- |
| `SARVAM_API_KEY` | Optional | Sarvam AI API key for Indian language Speech-to-Text and Text-to-Speech (Hindi, Hinglish, etc.). | [Sarvam AI Dashboard](https://dashboard.sarvam.ai) |
| `CARTESIA_API_KEY` | Optional | Cartesia API Key for Sonic-2 ultra-fast, natural English voice generation. | [Cartesia Cloud](https://play.cartesia.ai) |
| `HUME_API_KEY` | Optional | Hume AI API Key for emotional voice modulation and real-time caller mood tracking. | [Hume AI Portal](https://dev.hume.ai) |

---

### 6. ⚙️ Background Workflows & Email Services

| Variable | Required | Description | Where to Get |
| :--- | :---: | :--- | :--- |
| `TRIGGER_SECRET_KEY` | **Yes** | Trigger.dev Secret API Key (`tr_dev_...`) for background call indexing & workflows. | [Trigger.dev Dashboard](https://trigger.dev) |
| `RESEND_API_KEY` | Optional | Resend API key (`re_...`) for sending transactional emails (call summary alerts, notifications). | [Resend Dashboard](https://resend.com) |

---

### 7. 🔐 Security & Core Settings

| Variable | Required | Description | Notes |
| :--- | :---: | :--- | :--- |
| `ENCRYPTION_KEY` | **Yes** | 64-character hex string (32 bytes) used for AES-256-GCM encryption of stored user integration tokens. | Generate using `openssl rand -hex 32` |
| `ENVIRONMENT` | **Yes** | Deployment environment (`development`, `staging`, `production`). | Default: `development` |
| `BACKEND_PUBLIC_URL` | **Yes** | Public URL where FastAPI backend is accessible (e.g. `http://localhost:8000` or ngrok URL). | Required for Twilio Webhooks |
| `VOCALL_BASE_URL` | **Yes** | Public URL where Web UI app is accessible (e.g. `http://localhost:3000`). | Used in Slack & Email notifications |

---

## 🚀 Setup Instructions

1. Copy the contents of the `.env.example` section above.
2. Create a file named `.env` in the project root directory.
3. Paste the contents and replace placeholder values with your actual API keys.
4. If deploying the frontend and backend separately, copy `.env` into both `backend/` and `frontend/` folders if required.
