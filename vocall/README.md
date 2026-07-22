# VoCall — Open-Source Voice Agent Platform

VoCall is an open-source voice agent platform designed for building, orchestrating, and deploying low-latency real-time voice AI agents.

> **Attribution:** UI patterns adapted from Unpod ([github.com/unpod-ai/unpod](https://github.com/unpod-ai/unpod)), MIT License.

---

## Monorepo Architecture

VoCall uses a streamlined two-folder layout:

```text
vocall/
├── frontend/             # Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
├── backend/              # FastAPI (Python), single unified backend service
├── docs/                 # Project documentation (PRD, Architecture, Features, Design, Build Strategy)
├── docker-compose.yml    # Development container orchestration
├── .env.example          # Template environment variable configurations
└── README.md             # Project documentation & setup instructions
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
