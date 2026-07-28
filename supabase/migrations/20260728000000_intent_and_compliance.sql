-- Migration: 20260728000000_intent_and_compliance.sql
-- Description: Adds intent_events and compliance_log tables for VoCall Intent Engine & DPDP Compliance

CREATE TABLE IF NOT EXISTS public.intent_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES public.calls(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    turn_index INT DEFAULT 0,
    intent TEXT NOT NULL,
    confidence FLOAT DEFAULT 0.0,
    entities TEXT[] DEFAULT '{}',
    slot_data JSONB DEFAULT '{}'::jsonb,
    connector_used TEXT,
    connector_result JSONB DEFAULT '{}'::jsonb,
    emotion_state_at_detection JSONB DEFAULT '{}'::jsonb,
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.compliance_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    contact_id UUID NOT NULL,
    tiers_cleared TEXT[] DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intent_events_call ON public.intent_events(call_id);
CREATE INDEX IF NOT EXISTS idx_intent_events_contact ON public.intent_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_compliance_log_contact ON public.compliance_log(contact_id);

ALTER TABLE public.intent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view intent events" ON public.intent_events
    FOR SELECT USING (
        call_id IN (SELECT id FROM public.calls WHERE org_id = public.get_user_org_id())
    );

CREATE POLICY "Org members can manage intent events" ON public.intent_events
    FOR ALL USING (
        call_id IN (SELECT id FROM public.calls WHERE org_id = public.get_user_org_id())
    );

CREATE POLICY "Org members can view compliance logs" ON public.compliance_log
    FOR SELECT USING (true);

CREATE POLICY "Org members can insert compliance logs" ON public.compliance_log
    FOR INSERT WITH CHECK (true);
