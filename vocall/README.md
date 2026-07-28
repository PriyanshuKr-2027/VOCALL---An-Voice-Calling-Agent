# VoCall — Open-Source Voice Agent Platform

VoCall is an enterprise-grade, open-source voice agent platform designed for building, orchestrating, and deploying low-latency real-time voice AI agents. It features a **VA-ICECoT Intent Engine**, a **Dual-Signal Emotion Analysis Engine**, and a **4-Tier Hybrid Memory Architecture**.

---

## Key Highlights

- **🎯 VA-ICECoT Intent Engine:** Real-time intent classification, dynamic slot extraction & validation, 100% slot resolution connector triggers, and Emotion × Intent escalation rules.
- **🧠 4-Tier Memory System:** Short-term (Upstash Redis), Long-term semantic (Supabase pgvector), Episodic post-call summaries (Postgres), and Knowledge Graph (FalkorDB) with DPDP "Forget Me" compliance.
- **🎭 Dual-Signal Emotion Engine:** Paralinguistic audio analysis (Hume EVI) + text NLP (Groq LLaMA 3.3 70B) fused into real-time valence/arousal scoring for prompt and voice pitch adaptation.
- **🎙️ Language & Voice AI:** Auto-routed STT (Groq Whisper-large-v3 for English, Sarvam Saarika v2 for Hindi/Hinglish) and TTS (Cartesia Sonic-2, Sarvam Bulbul v2, Hume Octave 2).
- **🛠️ Agent Studio:** Prompt-first builder, AI Prompt Enhancer (`/api/agents/{id}/enhance-prompt`), domain metadata web scraper, pre-built templates, and visual/code JSON editors.
- **📞 Web & Telephony Integrations:** LiveKit WebCall studio (`WebCallModal`), Twilio PSTN, and BYOK Exotel/Plivo TRAI-compliant telephony.

---

## Monorepo Architecture

VoCall uses a streamlined layout:

```text
vocall/
├── frontend/             # Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui Dashboard
├── backend/              # FastAPI (Python), unified backend service with Intent Engine & Emotion Fusion
├── docs/                 # Project documentation (PRD, TRD, Architecture, Features, Design, APIs)
├── docker-compose.yml    # Container orchestration for local deployment
├── .env.example          # Template environment variable configuration
└── README.md             # Sub-directory README
```

---

## Quickstart Setup

### 1. Environment Configuration

Copy the example environment file and populate the credentials:

```bash
cp .env.example .env
```

### 2. Frontend Development

```bash
cd frontend
npm install
npm run dev
```

The frontend will run locally at `http://localhost:3000`.

### 3. Backend Development

```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The FastAPI backend will be available at `http://localhost:8000` with interactive API docs at `http://localhost:8000/docs`.

### 4. Docker Compose Setup

Run both frontend and backend services simultaneously via Docker Compose:

```bash
docker-compose up -d --build
```

---

## License

This project is licensed under the MIT License.
