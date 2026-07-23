'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  MessageSquare,
  Mic,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  Code,
  Globe,
  Radio,
  Brain,
  Smile,
  Shield,
  BarChart,
  Plug,
  History,
  Loader2,
  Edit2,
  Play,
  Pause,
  AlertCircle,
  Zap,
  ExternalLink,
  Plus,
  Trash2,
  Clock,
  FileText,
  CheckSquare,
  Database,
  Calendar,
  Layers,
  Send,
  Sliders,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import GraphMemoryViewer from '@/components/memory/GraphMemoryViewer';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useRouter } from 'next/navigation';
import WebCallModal from '@/components/agent/WebCallModal';

// Prompt templates
const USE_CASE_TEMPLATES: Record<string, string> = {
  'Customer Support':
    '\n\n[TEMPLATE: CUSTOMER SUPPORT]\n- Greet the caller warmly and ask for their account or order number.\n- Listen patiently to caller issues, offer troubleshooting steps, and escalate complex requests.',
  Sales:
    '\n\n[TEMPLATE: SALES SDR]\n- Introduce yourself as a sales representative and state the value proposition.\n- Ask qualifying questions regarding budget, authority, need, and timeline (BANT).',
  'Appointment Booking':
    '\n\n[TEMPLATE: APPOINTMENT BOOKING]\n- Collect caller preferred date and time for booking.\n- Confirm contact details and verify calendar slot availability.',
  HR:
    '\n\n[TEMPLATE: HR RECRUITER]\n- Conduct an initial candidate screening interview.\n- Inquire about key technical background, experience, and compensation expectations.',
  Collections:
    '\n\n[TEMPLATE: COLLECTIONS]\n- Verify debtor identity securely before disclosing account balance details.\n- Discuss payment arrangement options politely and record commitment to pay.',
  Healthcare:
    '\n\n[TEMPLATE: HEALTHCARE PATIENT INTAKE]\n- Collect patient full name, date of birth, and primary symptoms.\n- Remind patient that this voice assistant does not replace emergency care.',
  'Debt Recovery':
    '\n\n[TEMPLATE: DEBT RECOVERY]\n- Remind customer of outstanding invoice payment due date.\n- Facilitate immediate payment or arrange structured settlement plan.',
  'Lead Qualification':
    '\n\n[TEMPLATE: LEAD QUALIFICATION]\n- Assess lead interest score based on company size and software needs.\n- Transfer high-intent leads to senior account executive.',
};

// Voice Catalog
interface VoiceOption {
  id: string;
  name: string;
  provider: 'Cartesia' | 'Sarvam AI' | 'Hume AI';
  gender: 'Male' | 'Female' | 'Neutral';
  languages: string[];
  latency: 'Ultra Low' | 'Low' | 'Standard';
  cost: 'Free' | 'Paid';
  audioSampleUrl: string;
  requiresEmotionAudio?: boolean;
}

const VOICE_CATALOG: VoiceOption[] = [
  {
    id: 'cartesia-sonic-2',
    name: 'Cartesia Sonic-2',
    provider: 'Cartesia',
    gender: 'Female',
    languages: ['EN'],
    latency: 'Low',
    cost: 'Free',
    audioSampleUrl: 'https://cdn.soundoftext.com/static/samples/en.mp3',
  },
  {
    id: 'sarvam-bulbul-arjun',
    name: 'Sarvam Bulbul-Arjun',
    provider: 'Sarvam AI',
    gender: 'Male',
    languages: ['HI', 'Hinglish'],
    latency: 'Low',
    cost: 'Free',
    audioSampleUrl: 'https://cdn.soundoftext.com/static/samples/hi.mp3',
  },
  {
    id: 'sarvam-bulbul-priya',
    name: 'Sarvam Bulbul-Priya',
    provider: 'Sarvam AI',
    gender: 'Female',
    languages: ['HI', 'Hinglish'],
    latency: 'Low',
    cost: 'Free',
    audioSampleUrl: 'https://cdn.soundoftext.com/static/samples/hi.mp3',
  },
  {
    id: 'hume-octave',
    name: 'Hume Octave',
    provider: 'Hume AI',
    gender: 'Neutral',
    languages: ['EN'],
    latency: 'Ultra Low',
    cost: 'Paid',
    audioSampleUrl: 'https://cdn.soundoftext.com/static/samples/en.mp3',
    requiresEmotionAudio: true,
  },
  {
    id: 'cartesia-sonic-british',
    name: 'Cartesia Sonic-British',
    provider: 'Cartesia',
    gender: 'Male',
    languages: ['EN'],
    latency: 'Low',
    cost: 'Paid',
    audioSampleUrl: 'https://cdn.soundoftext.com/static/samples/en.mp3',
  },
  {
    id: 'cartesia-sonic-aussie',
    name: 'Cartesia Sonic-Aussie',
    provider: 'Cartesia',
    gender: 'Female',
    languages: ['EN'],
    latency: 'Low',
    cost: 'Paid',
    audioSampleUrl: 'https://cdn.soundoftext.com/static/samples/en.mp3',
  },
  {
    id: 'cartesia-sonic-casual',
    name: 'Cartesia Sonic-Casual',
    provider: 'Cartesia',
    gender: 'Neutral',
    languages: ['EN'],
    latency: 'Low',
    cost: 'Free',
    audioSampleUrl: 'https://cdn.soundoftext.com/static/samples/en.mp3',
  },
];

interface TimeWindow {
  id: string;
  startTime: string;
  endTime: string;
}

interface StructuredProperty {
  id: string;
  name: string;
  prompt: string;
}

interface ConnectorCard {
  id: string;
  name: string;
  icon: any;
  triggerType: 'During Call' | 'Post Call' | 'During & Post Call';
  section: 'During Call' | 'Post Call';
  configured: boolean;
  fields: { key: string; label: string; placeholder: string; isTextarea?: boolean }[];
  configValues: Record<string, string>;
}

interface AgentCallRecord {
  id: string;
  direction: 'inbound' | 'outbound';
  from_number: string;
  to_number: string;
  started_at: string;
  duration_seconds: number;
  status: 'completed' | 'failed' | 'in-progress';
  is_test_call: boolean;
  contact_name: string;
}

export default function AgentStudioPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  // Agent State
  const [agentName, setAgentName] = useState('Inbound Support Agent');
  const [isEditingName, setIsEditingName] = useState(false);
  const [published, setPublished] = useState(false);
  const [activeTab, setActiveTab] = useState('persona');
  const [viewMode, setViewMode] = useState<'ui' | 'code'>('ui');

  // Identity Tab State
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
  const [description, setDescription] = useState('AI voice assistant for handling customer inquiries and support tickets.');
  const [domainInput, setDomainInput] = useState('');
  const [domainImporting, setDomainImporting] = useState(false);

  // Persona Tab State
  const [systemPrompt, setSystemPrompt] = useState(
    'You are VoCall AI, a professional voice agent. Assist callers with customer support inquiries accurately and concisely.'
  );
  const [enhancing, setEnhancing] = useState(false);

  // Voice Tab State
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICE_CATALOG[0]);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0.0);

  // Telephony Tab State
  const [telephonyProvider, setTelephonyProvider] = useState<'Twilio' | 'Plivo' | 'Exotel'>('Twilio');
  const [assignedNumber, setAssignedNumber] = useState('+1 (800) 555-0199');
  const [inboundEnabled, setInboundEnabled] = useState(true);
  const [outboundCallerId, setOutboundCallerId] = useState('+1 (800) 555-0199');
  const [availablePhoneNumbers, setAvailablePhoneNumbers] = useState([
    { id: '1', number: '+1 (800) 555-0199', provider: 'Twilio' },
    { id: '2', number: '+91 98765 43210', provider: 'Exotel' },
    { id: '3', number: '+1 (888) 234-5678', provider: 'Plivo' },
  ]);

  // Advanced Tab State
  const [numWords, setNumWords] = useState(4);
  const [voiceSeconds, setVoiceSeconds] = useState(0.2);
  const [backOffSeconds, setBackOffSeconds] = useState(1.0);
  const [enableFollowup, setEnableFollowup] = useState(false);
  const [instantRedial, setInstantRedial] = useState(false);
  const [notifyViaSms, setNotifyViaSms] = useState(false);
  const [handoverNumber, setHandoverNumber] = useState('+1 (555) 019-9821');
  const [selectedDays, setSelectedDays] = useState<string[]>([
    'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',
  ]);
  const [timeWindows, setTimeWindows] = useState<TimeWindow[]>([
    { id: '1', startTime: '08:00', endTime: '20:00' },
  ]);

  // Analysis Tab State
  const [summaryPrompt, setSummaryPrompt] = useState(
    'Summarize this call in 2-3 sentences. Focus on: what the caller wanted, what was resolved, and any follow-up needed.'
  );
  const [minMessagesTrigger, setMinMessagesTrigger] = useState(2);
  const [successEvalPrompt, setSuccessEvalPrompt] = useState(
    'Did this call achieve its goal? Answer YES/NO with a one-sentence justification.'
  );
  const [successRubric, setSuccessRubric] = useState('Goal Achieved');
  const [structuredDataPrompt, setStructuredDataPrompt] = useState(
    'Extract the following structured information from this call.'
  );
  const [analysisTimeout, setAnalysisTimeout] = useState(10);
  const [schemaProperties, setSchemaProperties] = useState<StructuredProperty[]>([
    { id: 'p1', name: 'caller_intent', prompt: 'Primary purpose or intent expressed by caller' },
    { id: 'p2', name: 'resolution_status', prompt: 'Was caller issue fully resolved? (Resolved/Pending/Escalated)' },
  ]);

  // Integrations Tab State
  const [connectorList, setConnectorList] = useState<ConnectorCard[]>([
    {
      id: 'gcal',
      name: 'Google Calendar',
      icon: Calendar,
      triggerType: 'During Call',
      section: 'During Call',
      configured: true,
      fields: [
        { key: 'oauth_token', label: 'OAuth Access Token', placeholder: 'ya29.a0A...' },
        { key: 'calendar_id', label: 'Calendar ID', placeholder: 'primary or support@company.com' },
        { key: 'event_title_template', label: 'Event Title Template', placeholder: 'VoCall Booking - {caller_name}' },
      ],
      configValues: {
        oauth_token: 'ya29.a0A_mock_token_38921',
        calendar_id: 'primary',
        event_title_template: 'VoCall Support Call - {caller_name}',
      },
    },
    {
      id: 'postgres',
      name: 'Supabase / Postgres DB',
      icon: Database,
      triggerType: 'During Call',
      section: 'During Call',
      configured: true,
      fields: [
        { key: 'connection_string', label: 'Postgres Connection String', placeholder: 'postgresql://user:pass@ep-host.supabase.co:5432/postgres' },
        { key: 'query', label: 'SQL Query / Stored Proc', placeholder: 'SELECT * FROM users WHERE phone = $1', isTextarea: true },
      ],
      configValues: {
        connection_string: 'postgresql://postgres.vocall:pass@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
        query: 'INSERT INTO call_logs (call_id, summary) VALUES ($1, $2)',
      },
    },
    {
      id: 'webhook',
      name: 'Custom Webhook',
      icon: Send,
      triggerType: 'During & Post Call',
      section: 'Post Call',
      configured: true,
      fields: [
        { key: 'url', label: 'Target Webhook Endpoint URL', placeholder: 'https://api.yourdomain.com/webhooks/vocall' },
        { key: 'method', label: 'HTTP Method (POST/GET)', placeholder: 'POST' },
        { key: 'headers', label: 'Custom HTTP Headers (JSON)', placeholder: '{"Authorization": "Bearer token123"}', isTextarea: true },
      ],
      configValues: {
        url: 'https://webhook.site/demo-vocall-endpoint',
        method: 'POST',
        headers: '{"Content-Type": "application/json"}',
      },
    },
  ]);

  // Recent Calls Tab State
  const [agentCalls, setAgentCalls] = useState<AgentCallRecord[]>([
    {
      id: 'c101',
      direction: 'inbound',
      from_number: '+1 (415) 892-0192',
      to_number: '+1 (800) 555-0199',
      started_at: '2026-07-22T12:45:00Z',
      duration_seconds: 142,
      status: 'completed',
      is_test_call: false,
      contact_name: 'Alex Johnson',
    },
    {
      id: 'c102',
      direction: 'outbound',
      from_number: '+1 (800) 555-0199',
      to_number: '+91 98765 43210',
      started_at: '2026-07-22T11:20:00Z',
      duration_seconds: 98,
      status: 'completed',
      is_test_call: true,
      contact_name: 'Priya Sharma',
    },
  ]);

  // Emotion Tab State
  const [enableEmotion, setEnableEmotion] = useState(false);
  const [audioSignalEnabled, setAudioSignalEnabled] = useState(false);
  const [toneAdaptation, setToneAdaptation] = useState(true);
  const [emotionConditionedVoice, setEmotionConditionedVoice] = useState(false);
  const [frustrationThreshold, setFrustrationThreshold] = useState(0.7);
  const [onFrustrationConnector, setOnFrustrationConnector] = useState('');

  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleteAgentModalOpen, setDeleteAgentModalOpen] = useState(false);
  const [isDeletingAgent, setIsDeletingAgent] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Web Call state
  const [isWebCallOpen, setIsWebCallOpen] = useState(false);
  const [orgId, setOrgId] = useState<string>('');

  const handleDeleteAgent = async () => {
    setIsDeletingAgent(true);
    try {
      await (supabase.from('agents') as any).delete().eq('id', params.id);
      showNotification('Agent deleted successfully');
      router.push('/dashboard/agents');
    } catch (err: any) {
      showNotification(`Error: /api/agents/${params.id} — ${err?.message || 'Failed to delete agent'}. Try again.`);
    } finally {
      setIsDeletingAgent(false);
      setDeleteAgentModalOpen(false);
    }
  };

  // Fetch Agent data & scoped calls
  useEffect(() => {
    async function loadAgentData() {
      const { data: agent } = await supabase
        .from('agents')
        .select('*')
        .eq('id', params.id)
        .single();

      const agentData = agent as any;
      if (agentData) {
        setAgentName(agentData.name);
        if (agentData.org_id) setOrgId(agentData.org_id);
        if (agentData.system_prompt) setSystemPrompt(agentData.system_prompt);
        if (agentData.published !== undefined) setPublished(agentData.published);
        if (agentData.enable_emotion !== undefined) setEnableEmotion(agentData.enable_emotion);

        const em = agentData.config?.emotion;
        if (em) {
          if (em.enabled !== undefined) setEnableEmotion(em.enabled);
          setAudioSignalEnabled(em.audio_signal ?? false);
          setToneAdaptation(em.tone_adaptation ?? true);
          setEmotionConditionedVoice(em.emotion_conditioned_voice ?? false);
          setFrustrationThreshold(em.frustration_threshold ?? 0.7);
          setOnFrustrationConnector(em.on_frustration_connector ?? '');
        }
      }

      // Fetch calls scoped to this agent
      const { data: dbCalls } = await supabase
        .from('calls')
        .select('*')
        .eq('agent_id', params.id)
        .order('created_at', { ascending: false });

      const callsList = dbCalls as any[];
      if (callsList && callsList.length > 0) {
        const mapped: AgentCallRecord[] = callsList.map((c) => ({
          id: c.id,
          direction: c.direction || 'inbound',
          from_number: c.from_number || '+1 (555) 000-0000',
          to_number: c.to_number || '+1 (800) 555-0199',
          started_at: c.started_at || c.created_at || new Date().toISOString(),
          duration_seconds: c.duration_seconds || 0,
          status: c.status || 'completed',
          is_test_call: !!c.is_test_call,
          contact_name: c.contact_name || 'Caller',
        }));
        setAgentCalls(mapped);
      }
    }
    loadAgentData();
  }, [params.id]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const saveEmotionConfig = async (overrides?: Record<string, any>) => {
    try {
      const isEnabled = overrides?.enable_emotion !== undefined ? overrides.enable_emotion : enableEmotion;
      const emotionConfig = {
        enabled: isEnabled,
        text_signal: true,
        audio_signal: overrides?.audio_signal !== undefined ? overrides.audio_signal : audioSignalEnabled,
        tone_adaptation: overrides?.tone_adaptation !== undefined ? overrides.tone_adaptation : toneAdaptation,
        emotion_conditioned_voice: overrides?.emotion_conditioned_voice !== undefined ? overrides.emotion_conditioned_voice : emotionConditionedVoice,
        frustration_threshold: overrides?.frustration_threshold !== undefined ? overrides.frustration_threshold : frustrationThreshold,
        on_frustration_connector: overrides?.on_frustration_connector !== undefined ? overrides.on_frustration_connector : onFrustrationConnector,
      };

      const { data: currentAgent } = await (supabase.from('agents') as any)
        .select('config')
        .eq('id', params.id)
        .single();

      const updatedConfig = {
        ...((currentAgent as any)?.config || {}),
        emotion: emotionConfig,
      };

      await (supabase.from('agents') as any)
        .update({
          enable_emotion: isEnabled,
          config: updatedConfig,
        })
        .eq('id', params.id);
    } catch (err) {
      console.error('Failed to save emotion config:', err);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      const { data: currentAgent } = await (supabase.from('agents') as any)
        .select('config')
        .eq('id', params.id)
        .single();

      const emotionConfig = {
        enabled: enableEmotion,
        text_signal: true,
        audio_signal: audioSignalEnabled,
        tone_adaptation: toneAdaptation,
        emotion_conditioned_voice: audioSignalEnabled ? emotionConditionedVoice : false,
        frustration_threshold: frustrationThreshold,
        on_frustration_connector: onFrustrationConnector,
      };

      const updatedConfig = {
        ...((currentAgent as any)?.config || {}),
        emotion: emotionConfig,
      };

      await (supabase.from('agents') as any)
        .update({
          name: agentName,
          system_prompt: systemPrompt,
          voice_provider: selectedVoice.provider,
          voice_id: selectedVoice.id,
          published: true,
          enable_emotion: enableEmotion,
          config: updatedConfig,
        })
        .eq('id', params.id);

      setPublished(true);
      showNotification('Agent published!');
    } catch {
      showNotification('Configuration saved');
    } finally {
      setSaving(false);
    }
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const tabs = [
    { id: 'identity', label: 'Identity', icon: Globe },
    { id: 'persona', label: 'Persona', icon: Sparkles },
    { id: 'voice', label: 'Voice Profile', icon: Mic },
    { id: 'telephony', label: 'Telephony', icon: Radio },
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'emotion', label: 'Emotion', icon: Smile },
    { id: 'advanced', label: 'Advanced', icon: Shield },
    { id: 'analysis', label: 'Analysis', icon: BarChart },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'recent-calls', label: 'Recent Calls', icon: History },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-[#7C3AED] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-[#9F7AEA] text-sm font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl}
            alt={agentName}
            className="w-12 h-12 rounded-full object-cover border-2 border-[#7C3AED] shadow-md shadow-[#7C3AED]/20"
          />
          <div>
            {isEditingName ? (
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                autoFocus
                className="bg-slate-950 border border-[#7C3AED] rounded px-2 py-1 text-xl font-bold text-white focus:outline-none"
              />
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">{agentName}</h1>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-slate-500">ID: {params.id}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  published
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {published ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-1.5 border-slate-700 text-slate-300">
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </Button>

          <Button variant="outline" size="sm" className="gap-1.5 border-slate-700 text-slate-300">
            <Mic className="w-4 h-4" />
            <span>Voice</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsWebCallOpen(true)}
            className="gap-1.5 border-[#7C3AED]/50 text-[#A78BFA] hover:bg-[#7C3AED]/20 hover:border-[#7C3AED] transition"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Talk To Agent</span>
          </Button>

          <Button
            onClick={() => setDeleteAgentModalOpen(true)}
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          <Button
            onClick={handlePublish}
            disabled={saving}
            className="gap-1.5 bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white font-semibold shadow-lg shadow-[#7C3AED]/30 focus:ring-2 focus:ring-[#7C3AED]"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Publish</span>
          </Button>
        </div>
      </header>

      {/* TAB BAR */}
      <div className="border-b border-slate-800 overflow-x-auto flex items-center justify-between gap-1 pb-1 scrollbar-none">
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. MEMORY TAB */}
      {activeTab === 'memory' && (
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#A78BFA]" />
              <h3 className="text-lg font-semibold text-white">4-Tier Memory & Knowledge Graph Context</h3>
            </div>
            <p className="text-xs text-slate-400">
              Preview of knowledge graph entities, topics, and causal episode links stored for this agent's contacts.
            </p>
          </Card>

          <GraphMemoryViewer
            contactId="sample-agent-preview"
            contactName={agentName || 'Caller'}
            height={440}
          />
        </div>
      )}

      {/* 6. EMOTION TAB */}
      {activeTab === 'emotion' && (
        <div className="space-y-6">
          {/* Master Toggle Card */}
          <Card className="border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Smile className="w-5 h-5 text-[#A78BFA]" />
                  <h3 className="text-lg font-semibold text-white">Enable Emotion Detection</h3>
                </div>
                <p className="text-sm text-slate-400">
                  Real-time emotion signal extraction and tone adaptation during calls.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableEmotion}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setEnableEmotion(val);
                    saveEmotionConfig({ enable_emotion: val });
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7C3AED]"></div>
              </label>
            </div>
          </Card>

          {enableEmotion && (
            <>
              {/* Signal Source Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 1: Text Signal */}
                <Card className="border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#A78BFA]" />
                        Text Signal
                      </h4>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Free • Always On
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Groq NLP extracts valence, arousal, and dominant emotion from each transcript turn (~120ms latency).
                    </p>
                  </div>
                </Card>

                {/* Card 2: Audio Signal */}
                <Card className="border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-[#A78BFA]" />
                        <h4 className="font-semibold text-white">Audio Signal</h4>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          BYOK • Optional
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={audioSignalEnabled}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setAudioSignalEnabled(val);
                            saveEmotionConfig({ audio_signal: val });
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7C3AED]"></div>
                      </label>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Requires Hume AI API key in Settings → API Keys. Analyzes paralinguistic features directly from the caller's voice.
                    </p>
                  </div>
                </Card>
              </div>

              {/* Behavior Config */}
              <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-6">
                <h4 className="font-semibold text-white flex items-center gap-2 text-base">
                  <Sliders className="w-4 h-4 text-[#A78BFA]" />
                  Behavior Config
                </h4>

                <div className="space-y-5">
                  {/* Tone Adaptation Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div>
                      <Label className="text-sm font-medium text-white">Tone Adaptation</Label>
                      <p className="text-xs text-slate-400">Dynamically adjust prompt tone based on detected emotion.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={toneAdaptation}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setToneAdaptation(val);
                          saveEmotionConfig({ tone_adaptation: val });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7C3AED]"></div>
                    </label>
                  </div>

                  {/* Emotion-Conditioned Voice (Hume Octave TTS) - ONLY shown when Audio Signal is on */}
                  {audioSignalEnabled && (
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                      <div>
                        <Label className="text-sm font-medium text-white">Emotion-Conditioned Voice (Hume Octave TTS)</Label>
                        <p className="text-xs text-slate-400">Synthesize response audio matching caller emotional trajectory.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emotionConditionedVoice}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setEmotionConditionedVoice(val);
                            saveEmotionConfig({ emotion_conditioned_voice: val });
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7C3AED]"></div>
                      </label>
                    </div>
                  )}

                  {/* Frustration Threshold Slider */}
                  <div className="space-y-2 pt-4 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-white">Frustration Threshold</Label>
                      <span className="font-mono text-xs text-[#A78BFA] bg-[#7C3AED]/20 px-2 py-0.5 rounded border border-[#7C3AED]/30">
                        {frustrationThreshold.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={frustrationThreshold}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setFrustrationThreshold(val);
                        saveEmotionConfig({ frustration_threshold: val });
                      }}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#7C3AED]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>0.00 (Sensitive)</span>
                      <span>0.70 (Default)</span>
                      <span>1.00 (Strict)</span>
                    </div>
                  </div>

                  {/* Dropdown: On Frustration */}
                  <div className="space-y-2 pt-4 border-t border-slate-800/80">
                    <Label className="text-sm font-medium text-white">On Frustration</Label>
                    <p className="text-xs text-slate-400">Select a configured connector to trigger when frustration threshold is exceeded.</p>
                    <select
                      value={onFrustrationConnector}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOnFrustrationConnector(val);
                        saveEmotionConfig({ on_frustration_connector: val });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7C3AED]"
                    >
                      <option value="">Select a configured connector...</option>
                      {connectorList.map((conn) => (
                        <option key={conn.id} value={conn.id}>
                          {conn.name} ({conn.triggerType})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Card>

              {/* Emotion Arc Preview Placeholder */}
              <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-3 text-center">
                <h4 className="font-semibold text-white text-sm">Emotion Arc Preview</h4>
                <p className="text-xs text-slate-400 font-mono italic">
                  Emotion arc will appear here after the first call completes.
                </p>
              </Card>
            </>
          )}
        </div>
      )}

      {/* 9. ANALYSIS TAB */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {/* Header */}
          <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-2">
            <div className="flex items-center gap-2">
              <BarChart className="w-5 h-5 text-[#A78BFA]" />
              <h3 className="text-lg font-semibold text-white">Post-Call Analysis</h3>
            </div>
            <p className="text-xs text-slate-400">
              Configure how VoCall analyzes completed calls — summaries, structured data extraction,
              and success evaluation are all generated automatically after each call.
            </p>
          </Card>

          {/* emotion_state Auto-Injection Notice */}
          <Card className="border-emerald-500/30 bg-emerald-500/5 p-5">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-400 shrink-0 shadow-sm shadow-emerald-400/50" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-emerald-300">emotion_state — Live</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <code className="text-emerald-400 font-mono">emotion_state</code> is automatically
                  included in every structured data output. You do not need to define it as a property.
                </p>
              </div>
            </div>
          </Card>

          {/* Call Summary */}
          <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#A78BFA]" />
              Call Summary
            </h4>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Summary Prompt</label>
              <textarea
                value={summaryPrompt}
                onChange={(e) => setSummaryPrompt(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 resize-none focus:outline-none focus:border-[#7C3AED] placeholder-slate-600"
              />
              <p className="text-[11px] text-slate-500">
                Instruction sent to the LLM to summarize each completed call into 2–4 sentences.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Min. Messages to Trigger</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={minMessagesTrigger}
                  onChange={(e) => setMinMessagesTrigger(Number(e.target.value))}
                  className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7C3AED]"
                />
                <span className="text-xs text-slate-500">turns before analysis runs</span>
              </div>
            </div>
          </Card>

          {/* Success Evaluation */}
          <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#A78BFA]" />
              Success Evaluation
            </h4>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Evaluation Prompt</label>
              <textarea
                value={successEvalPrompt}
                onChange={(e) => setSuccessEvalPrompt(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 resize-none focus:outline-none focus:border-[#7C3AED]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Success Rubric</label>
              <input
                type="text"
                value={successRubric}
                onChange={(e) => setSuccessRubric(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7C3AED]"
                placeholder="e.g. Goal Achieved"
              />
            </div>
          </Card>

          {/* Structured Data Schema */}
          <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-[#A78BFA]" />
                Structured Data Schema
              </h4>
              <button
                onClick={() =>
                  setSchemaProperties((prev) => [
                    ...prev,
                    { id: `p${Date.now()}`, name: '', prompt: '' },
                  ])
                }
                className="text-xs font-semibold text-[#A78BFA] hover:text-white border border-[#7C3AED]/40 hover:border-[#7C3AED] px-3 py-1.5 rounded-lg transition-all"
              >
                + Add Property
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Extraction Prompt</label>
              <textarea
                value={structuredDataPrompt}
                onChange={(e) => setStructuredDataPrompt(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 resize-none focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            {/* Auto-injected emotion_state row */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-emerald-300 font-semibold">emotion_state</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Auto-Injected
                </span>
              </div>
              <span className="text-[11px] text-slate-500 italic">Always present — valence, arousal, dominant, confidence</span>
            </div>

            {/* User-defined properties */}
            <div className="space-y-3">
              {schemaProperties.map((prop, idx) => (
                <div key={prop.id} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-start">
                  <input
                    type="text"
                    value={prop.name}
                    onChange={(e) => {
                      const updated = [...schemaProperties];
                      updated[idx] = { ...updated[idx], name: e.target.value };
                      setSchemaProperties(updated);
                    }}
                    placeholder="property_name"
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                  <input
                    type="text"
                    value={prop.prompt}
                    onChange={(e) => {
                      const updated = [...schemaProperties];
                      updated[idx] = { ...updated[idx], prompt: e.target.value };
                      setSchemaProperties(updated);
                    }}
                    placeholder="Extraction instruction for this field"
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#7C3AED]"
                  />
                  <button
                    onClick={() => setSchemaProperties((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-slate-600 hover:text-red-400 p-2 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {schemaProperties.length === 0 && (
              <p className="text-xs text-slate-600 italic text-center py-2">
                No custom properties defined. Add properties above to extract structured data from calls.
              </p>
            )}
          </Card>

          {/* Analysis Timeout */}
          <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-3">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#A78BFA]" />
              Analysis Timeout
            </h4>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={5}
                max={120}
                value={analysisTimeout}
                onChange={(e) => setAnalysisTimeout(Number(e.target.value))}
                className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7C3AED]"
              />
              <span className="text-xs text-slate-500">seconds before analysis is skipped</span>
            </div>
          </Card>
        </div>
      )}

      {/* 10. RECENT CALLS TAB */}
      {activeTab === 'recent-calls' && (
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <CardTitle className="text-xl text-white">Recent Calls for {agentName}</CardTitle>
            <CardDescription className="text-slate-400">
              Voice interactions and call logs scoped specifically to this AI agent.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Direction</th>
                    <th className="py-3.5 px-4">From</th>
                    <th className="py-3.5 px-4">To</th>
                    <th className="py-3.5 px-4">Date / Time</th>
                    <th className="py-3.5 px-4">Duration</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Emotion Score</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {agentCalls.map((call) => (
                    <tr key={call.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                              call.direction === 'inbound'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            }`}
                          >
                            {call.direction === 'inbound' ? (
                              <ArrowDownLeft className="w-3 h-3" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3" />
                            )}
                            {call.direction.toUpperCase()}
                          </span>

                          {call.is_test_call && (
                            <span className="bg-[#7C3AED]/20 text-[#A78BFA] px-2 py-0.5 rounded text-[10px] font-bold border border-[#7C3AED]/40">
                              TEST
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs text-white">{call.from_number}</div>
                        <div className="text-[11px] text-slate-400">{call.contact_name}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs text-slate-300">{call.to_number}</div>
                        <div className="text-[11px] text-slate-400">{agentName}</div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {new Date(call.started_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                        {formatDuration(call.duration_seconds)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                            call.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : call.status === 'failed'
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {call.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono text-slate-500 text-xs">
                        —
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/dashboard/calls/${call.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs border-slate-700 text-[#A78BFA] hover:bg-[#7C3AED]/20 gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {agentCalls.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500 text-sm">
                        No recent calls recorded for this agent yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Destructive Delete Agent Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteAgentModalOpen}
        title="Are you sure?"
        description="This action cannot be undone. This voice agent, its persona, and system prompt configurations will be deleted permanently."
        confirmText="Delete Agent"
        isLoading={isDeletingAgent}
        onConfirm={handleDeleteAgent}
        onCancel={() => setDeleteAgentModalOpen(false)}
      />

      {/* Web Call Modal */}
      <WebCallModal
        isOpen={isWebCallOpen}
        onClose={() => setIsWebCallOpen(false)}
        agentId={params.id}
        agentName={agentName}
        orgId={orgId}
      />
    </div>
  );
}
