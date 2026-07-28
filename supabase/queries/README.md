# 🗄️ Supabase SQL Queries & Database Setup

This folder contains all the SQL queries and migration scripts required to set up the **VoCall Voice Calling Agent** database in Supabase.

---

## 📂 File Structure

| File | Purpose | Description |
| :--- | :--- | :--- |
| **`01_complete_schema_setup.sql`** | ⚡ **Main Setup Query** | Complete idempotent SQL script that enables all PostgreSQL extensions (`pgvector`, `uuid-ossp`, `pgcrypto`, `moddatetime`), creates all 15 core database tables, triggers, helper functions, indexes, and configures Row-Level Security (RLS) policies. |
| **`02_seed_data.sql`** | 🌱 **Demo Seed Query** | Inserts initial demonstration data (sample organization, space, AI agent, and contact). |

---

## 🚀 How to Run Queries in Supabase

### Option 1: Via Supabase Dashboard SQL Editor (Recommended)

1. Open your project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** from the left-hand navigation bar.
3. Click **New query**.
4. Copy the entire contents of [`01_complete_schema_setup.sql`](file:///c:/Users/10pri/Downloads/VOCALL%2019%20JULY/supabase/queries/01_complete_schema_setup.sql) and paste it into the editor.
5. Click **Run** (or press `Ctrl` + `Enter`).
6. *(Optional)* Create another query, copy [`02_seed_data.sql`](file:///c:/Users/10pri/Downloads/VOCALL%2019%20JULY/supabase/queries/02_seed_data.sql), and run it to populate demo data.

---

### Option 2: Via Supabase CLI

If your project is linked locally via CLI (`npx supabase link --project-ref <your-project-ref>`):

```bash
npx supabase db push
```

---

## 📋 Database Tables Included

1. `public.organizations` – Organization accounts and metadata
2. `public.profiles` – User profiles linked to `auth.users`
3. `public.spaces` – Workspaces within organizations
4. `public.agents` – Voice agents (LLM system prompt, voice ID, config)
5. `public.api_keys` – Encrypted third-party API keys
6. `public.phone_numbers` – Phone numbers linked to agents/orgs
7. `public.contacts` – Contact directory and lead management
8. `public.connectors` – External webhooks & CRM triggers
9. `public.connector_configs` – Organization & agent level connector configurations (HubSpot, Salesforce, Slack, etc.)
10. `public.calls` – Call logs, duration, transcripts, and analysis
11. `public.memory_long_term` – Long-term semantic memory with `vector(1536)` cosine similarity search index
12. `public.memory_episodic` – Episodic call memory summaries, key facts, and entity extraction
13. `public.emotion_events` – Real-time acoustic/text emotion telemetry events
14. `public.intent_events` – Intent engine detection events & slot filling
15. `public.compliance_log` – DPDP Act 2023 compliance audit log (Forget-Me data clearance)
