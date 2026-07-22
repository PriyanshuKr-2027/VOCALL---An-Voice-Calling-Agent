-- Migration: Create connector_configs table
-- Created at: 2026-07-22

-- Enable moddatetime extension if not already enabled
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- Create connector_configs table
CREATE TABLE IF NOT EXISTS public.connector_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE, -- null = org-level config
    connector_type TEXT NOT NULL CHECK (
        connector_type IN (
            'google_calendar',
            'hubspot',
            'salesforce',
            'supabase',
            'postgres',
            'slack',
            'whatsapp',
            'zapier',
            'custom_webhook'
        )
    ),
    is_enabled BOOLEAN DEFAULT false,
    config JSONB NOT NULL DEFAULT '{}'::jsonb, -- stores API keys, URLs, field mappings per connector type
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Unique constraint on (org_id, agent_id, connector_type)
    CONSTRAINT connector_configs_org_agent_connector_type_key UNIQUE NULLS NOT DISTINCT (org_id, agent_id, connector_type)
);

-- Index for fast queries by org_id and agent_id
CREATE INDEX IF NOT EXISTS connector_configs_org_id_idx ON public.connector_configs(org_id);
CREATE INDEX IF NOT EXISTS connector_configs_agent_id_idx ON public.connector_configs(agent_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.connector_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Org members can only read/write rows where org_id matches their JWT org claim
CREATE POLICY "Org members can access their connector_configs"
    ON public.connector_configs
    FOR ALL
    USING (
        org_id = (auth.jwt() ->> 'org_id')::uuid
        OR org_id = public.get_user_org_id()
    )
    WITH CHECK (
        org_id = (auth.jwt() ->> 'org_id')::uuid
        OR org_id = public.get_user_org_id()
    );

-- Add updated_at trigger using standard moddatetime extension
CREATE TRIGGER handle_connector_configs_updated_at
    BEFORE UPDATE ON public.connector_configs
    FOR EACH ROW
    EXECUTE PROCEDURE extensions.moddatetime(updated_at);
