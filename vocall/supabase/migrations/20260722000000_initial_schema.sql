-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT,
    logo_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    role TEXT DEFAULT 'member',
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. SPACES
CREATE TABLE IF NOT EXISTS public.spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. AGENTS
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID REFERENCES public.spaces(id) ON DELETE SET NULL,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    system_prompt TEXT,
    voice_id TEXT,
    voice_provider TEXT,
    language VARCHAR(20) DEFAULT 'en',
    config JSONB DEFAULT '{}'::jsonb,
    published BOOLEAN DEFAULT false,
    -- VoCall additions
    enable_memory BOOLEAN DEFAULT false,
    enable_emotion BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. API_KEYS
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    encrypted_key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. PHONE_NUMBERS
CREATE TABLE IF NOT EXISTS public.phone_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
    number TEXT NOT NULL,
    provider TEXT,
    kyc_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. CONTACTS
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT,
    phone TEXT,
    email TEXT,
    tags TEXT[] DEFAULT '{}'::text[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. CONNECTORS
CREATE TABLE IF NOT EXISTS public.connectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    trigger_type TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. CALLS
CREATE TABLE IF NOT EXISTS public.calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    direction VARCHAR(10),
    from_number TEXT,
    to_number TEXT,
    status VARCHAR(20),
    duration_seconds INTEGER,
    transcript TEXT,
    is_test BOOLEAN DEFAULT false,
    -- VoCall additions
    emotion_score DOUBLE PRECISION,
    analysis JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. MEMORY_LONG_TERM (VoCall-original)
CREATE TABLE IF NOT EXISTS public.memory_long_term (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(1536),
    emotion_state JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vector Cosine Index for Long Term Memory
CREATE INDEX IF NOT EXISTS memory_long_term_embedding_idx 
    ON public.memory_long_term 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- 11. MEMORY_EPISODIC (VoCall-original)
CREATE TABLE IF NOT EXISTS public.memory_episodic (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    call_id UUID REFERENCES public.calls(id) ON DELETE SET NULL,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    summary TEXT,
    key_facts JSONB DEFAULT '{}'::jsonb,
    emotion_arc JSONB DEFAULT '{}'::jsonb,
    entities JSONB DEFAULT '{}'::jsonb,
    topics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. EMOTION_EVENTS (VoCall-original)
CREATE TABLE IF NOT EXISTS public.emotion_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES public.calls(id) ON DELETE CASCADE,
    timestamp_ms BIGINT,
    valence DOUBLE PRECISION,
    arousal DOUBLE PRECISION,
    dominant VARCHAR(50),
    confidence DOUBLE PRECISION,
    signal_source VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_long_term ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_episodic ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_events ENABLE ROW LEVEL SECURITY;

-- Helper function to check org membership
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID AS $$
    SELECT org_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Organizations Policies
CREATE POLICY "Users can view their organization" ON public.organizations
    FOR SELECT USING (id = public.get_user_org_id());

CREATE POLICY "Users can update their organization" ON public.organizations
    FOR UPDATE USING (id = public.get_user_org_id());

-- Profiles Policies
CREATE POLICY "Users can view profiles in their organization" ON public.profiles
    FOR SELECT USING (id = auth.uid() OR org_id = public.get_user_org_id());

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

-- Spaces Policies
CREATE POLICY "Org members can view spaces" ON public.spaces
    FOR SELECT USING (org_id = public.get_user_org_id());
CREATE POLICY "Org members can manage spaces" ON public.spaces
    FOR ALL USING (org_id = public.get_user_org_id());

-- Agents Policies
CREATE POLICY "Org members can view agents" ON public.agents
    FOR SELECT USING (org_id = public.get_user_org_id());
CREATE POLICY "Org members can manage agents" ON public.agents
    FOR ALL USING (org_id = public.get_user_org_id());

-- API Keys Policies
CREATE POLICY "Org members can view api_keys" ON public.api_keys
    FOR SELECT USING (org_id = public.get_user_org_id());
CREATE POLICY "Org members can manage api_keys" ON public.api_keys
    FOR ALL USING (org_id = public.get_user_org_id());

-- Phone Numbers Policies
CREATE POLICY "Org members can view phone_numbers" ON public.phone_numbers
    FOR SELECT USING (org_id = public.get_user_org_id());
CREATE POLICY "Org members can manage phone_numbers" ON public.phone_numbers
    FOR ALL USING (org_id = public.get_user_org_id());

-- Contacts Policies
CREATE POLICY "Org members can view contacts" ON public.contacts
    FOR SELECT USING (org_id = public.get_user_org_id());
CREATE POLICY "Org members can manage contacts" ON public.contacts
    FOR ALL USING (org_id = public.get_user_org_id());

-- Connectors Policies
CREATE POLICY "Org members can view connectors" ON public.connectors
    FOR SELECT USING (org_id = public.get_user_org_id());
CREATE POLICY "Org members can manage connectors" ON public.connectors
    FOR ALL USING (org_id = public.get_user_org_id());

-- Calls Policies
CREATE POLICY "Org members can view calls" ON public.calls
    FOR SELECT USING (org_id = public.get_user_org_id());
CREATE POLICY "Org members can manage calls" ON public.calls
    FOR ALL USING (org_id = public.get_user_org_id());

-- Memory Long Term Policies
CREATE POLICY "Org members can view long term memory" ON public.memory_long_term
    FOR SELECT USING (org_id = public.get_user_org_id());
CREATE POLICY "Org members can manage long term memory" ON public.memory_long_term
    FOR ALL USING (org_id = public.get_user_org_id());

-- Memory Episodic Policies
CREATE POLICY "Org members can view episodic memory" ON public.memory_episodic
    FOR SELECT USING (org_id = public.get_user_org_id());
CREATE POLICY "Org members can manage episodic memory" ON public.memory_episodic
    FOR ALL USING (org_id = public.get_user_org_id());

-- Emotion Events Policies
CREATE POLICY "Org members can view emotion events" ON public.emotion_events
    FOR SELECT USING (
        call_id IN (SELECT id FROM public.calls WHERE org_id = public.get_user_org_id())
    );
CREATE POLICY "Org members can manage emotion events" ON public.emotion_events
    FOR ALL USING (
        call_id IN (SELECT id FROM public.calls WHERE org_id = public.get_user_org_id())
    );
