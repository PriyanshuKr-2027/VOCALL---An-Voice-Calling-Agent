-- Created By: Ananya Gupta
-- =============================================================================
-- VOCALL OPTIONAL SEED DATA SCRIPT
-- Run this after 01_complete_schema_setup.sql if you want sample test data.
-- =============================================================================

DO $$
DECLARE
    demo_org_id UUID;
    demo_space_id UUID;
    demo_agent_id UUID;
    demo_contact_id UUID;
BEGIN
    -- 1. Create Demo Organization
    INSERT INTO public.organizations (id, name, domain, description)
    VALUES (
        '00000000-0000-0000-0000-000000000001',
        'VoCall Tech Solutions',
        'vocall.ai',
        'Primary organization for AI Voice Calling Agent demo'
    )
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO demo_org_id;

    -- 2. Create Default Space
    INSERT INTO public.spaces (id, org_id, name)
    VALUES (
        '00000000-0000-0000-0000-000000000002',
        demo_org_id,
        'Main Calling Space'
    )
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO demo_space_id;

    -- 3. Create Sample Voice Agent
    INSERT INTO public.agents (
        id,
        space_id,
        org_id,
        name,
        system_prompt,
        voice_id,
        voice_provider,
        language,
        published,
        enable_memory,
        enable_emotion
    )
    VALUES (
        '00000000-0000-0000-0000-000000000003',
        demo_space_id,
        demo_org_id,
        'Aria - Customer Support Representative',
        'You are Aria, a friendly and professional customer support voice agent for VoCall. Speak clearly, concisely, and empathetically.',
        '21m00Tcm4TlvDq8ikWAM',
        'elevenlabs',
        'en',
        true,
        true,
        true
    )
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

    -- 4. Create Sample Contact
    INSERT INTO public.contacts (
        id,
        org_id,
        name,
        phone,
        email,
        tags
    )
    VALUES (
        '00000000-0000-0000-0000-000000000004',
        demo_org_id,
        'Jane Doe',
        '+15551234567',
        'jane.doe@example.com',
        ARRAY['vip', 'demo-lead']
    )
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

    RAISE NOTICE 'Demo seed data successfully inserted!';
END $$;
