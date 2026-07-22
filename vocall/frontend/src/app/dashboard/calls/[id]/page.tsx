'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowLeft,
  PhoneCall,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  User,
  Bot,
  Brain,
  Smile,
  CheckCircle2,
  FileText,
  Database,
  ChevronDown,
  ChevronRight,
  Code,
  Sparkles,
  GitMerge,
  Layers,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';

export interface EmotionEvent {
  id?: string;
  call_id?: string;
  timestamp_ms: number;
  valence: number;
  arousal?: number;
  dominant?: string;
  confidence?: number;
  signal_source?: string;
  seconds?: number;
}

interface CallDetail {
  id: string;
  direction: 'inbound' | 'outbound';
  from_number: string;
  to_number: string;
  started_at: string;
  duration_seconds: number;
  status: 'completed' | 'failed' | 'in-progress';
  is_test_call: boolean;
  agent_name: string;
  contact_name: string;
  emotion_score?: number | string | null;
  analysis: {
    summary?: string;
    success_eval?: string;
    rubric?: string;
    structured_data?: any;
    memory_recalled?: any;
    graph_context?: any;
  };
  transcript: {
    speaker: 'agent' | 'caller';
    text: string;
    timestamp: string;
  }[];
}

export default function CallDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [call, setCall] = useState<CallDetail | null>(null);
  const [emotionEvents, setEmotionEvents] = useState<EmotionEvent[]>([]);
  const [jsonExpanded, setJsonExpanded] = useState(true);

  // Mock Fallback Data
  const mockCallDetail: CallDetail = {
    id: params.id,
    direction: 'inbound',
    from_number: '+1 (415) 892-0192',
    to_number: '+1 (800) 555-0199',
    started_at: new Date().toISOString(),
    duration_seconds: 142,
    status: 'completed',
    is_test_call: true,
    agent_name: 'Inbound Customer Support',
    contact_name: 'Alex Johnson',
    emotion_score: 0.42,
    analysis: {
      summary: 'Caller requested assistance downloading monthly billing invoices. Agent confirmed identity and emailed PDF directly.',
      success_eval: 'YES - Billing invoice delivered.',
      rubric: 'Goal Achieved',
      structured_data: {
        caller_intent: 'Billing Inquiry',
        resolution_status: 'Resolved',
        email_sent: true,
      },
      memory_recalled: {
        short_term: 'Active session initialized with contact ID alex-johnson-101 (caller verified).',
        long_term: [
          'Caller prefers PDF invoices sent via email.',
          'Account plan: Premium Annual tier (active).',
        ],
        episodic: [
          'Call #c100 (2026-07-15): Resolved subscription billing inquiry regarding auto-renewal date.',
        ],
        graph: [
          'Mentioned Entities: Billing Dept, Subscription Invoice PDF',
          'Frustration Topic: Delayed Invoice (-0.4)',
        ],
      },
      graph_context: {
        entities: [
          { name: 'Billing Department', type: 'Department' },
          { name: 'Invoice PDF', type: 'Document' },
          { name: 'Alex Johnson', type: 'Contact' },
        ],
        frustration_topics: [
          { topic: 'Invoice Delivery Delay', count: 2, severity: 'medium' },
        ],
      },
    },
    transcript: [
      { speaker: 'agent', text: 'Hello! Thank you for calling VoCall Support. How may I assist you today?', timestamp: '00:02' },
      { speaker: 'caller', text: 'Hi, I need help downloading my latest monthly subscription invoice.', timestamp: '00:08' },
      { speaker: 'agent', text: 'I can certainly help with that. Please verify your email address.', timestamp: '00:14' },
      { speaker: 'caller', text: 'It is alex@example.com.', timestamp: '00:20' },
      { speaker: 'agent', text: 'Thank you Alex! I have sent the PDF invoice directly to your inbox.', timestamp: '00:32' },
      { speaker: 'caller', text: 'That was super fast! Thanks so much.', timestamp: '00:41' },
      { speaker: 'agent', text: 'You are welcome! Have a wonderful rest of your day.', timestamp: '00:46' },
    ],
  };

  const defaultMockEmotionEvents: EmotionEvent[] = [
    { timestamp_ms: 0, seconds: 0, valence: 0.1, dominant: 'Neutral', confidence: 0.85 },
    { timestamp_ms: 8000, seconds: 8, valence: -0.45, dominant: 'Frustration', confidence: 0.88 },
    { timestamp_ms: 15000, seconds: 15, valence: -0.15, dominant: 'Uncertainty', confidence: 0.76 },
    { timestamp_ms: 24000, seconds: 24, valence: 0.35, dominant: 'Relief', confidence: 0.92 },
    { timestamp_ms: 36000, seconds: 36, valence: 0.65, dominant: 'Satisfaction', confidence: 0.95 },
    { timestamp_ms: 46000, seconds: 46, valence: 0.8, dominant: 'Gratitude', confidence: 0.98 },
  ];

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCallDetail() {
      setLoading(true);
      try {
        const { data: dbCall } = await supabase
          .from('calls')
          .select('*')
          .eq('id', params.id)
          .single();

        const callData = dbCall as any;
        if (callData) {
          setCall({
            id: callData.id,
            direction: callData.direction || 'inbound',
            from_number: callData.from_number || '+1 (555) 000-0000',
            to_number: callData.to_number || '+1 (800) 555-0199',
            started_at: callData.started_at || new Date().toISOString(),
            duration_seconds: callData.duration_seconds || 0,
            status: callData.status || 'completed',
            is_test_call: !!callData.is_test_call,
            agent_name: callData.agent_name || 'VoCall Support Agent',
            contact_name: callData.contact_name || 'Caller',
            emotion_score: callData.emotion_score !== null && callData.emotion_score !== undefined ? callData.emotion_score : mockCallDetail.emotion_score,
            analysis: callData.analysis || mockCallDetail.analysis,
            transcript: callData.transcript || mockCallDetail.transcript,
          });
        } else {
          setCall(mockCallDetail);
        }

        // Fetch emotion_events for this call from Supabase
        const { data: dbEvents } = await supabase
          .from('emotion_events')
          .select('*')
          .eq('call_id', params.id)
          .order('timestamp_ms', { ascending: true });

        if (dbEvents && dbEvents.length > 0) {
          const mappedEvents: EmotionEvent[] = dbEvents.map((evt: any) => ({
            id: evt.id,
            call_id: evt.call_id,
            timestamp_ms: Number(evt.timestamp_ms || 0),
            seconds: Math.round(Number(evt.timestamp_ms || 0) / 1000),
            valence: typeof evt.valence === 'number' ? evt.valence : 0.0,
            arousal: evt.arousal,
            dominant: evt.dominant || 'Neutral',
            confidence: typeof evt.confidence === 'number' ? evt.confidence : 0.85,
            signal_source: evt.signal_source || 'fused',
          }));
          setEmotionEvents(mappedEvents);
        } else {
          setEmotionEvents(defaultMockEmotionEvents);
        }
      } catch {
        setCall(mockCallDetail);
        setEmotionEvents(defaultMockEmotionEvents);
      } finally {
        setLoading(false);
      }
    }
    loadCallDetail();
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="w-48 h-8 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="h-96 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 animate-pulse" />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <div className="h-[700px] bg-slate-900/60 border border-slate-800 rounded-2xl p-6 animate-pulse" />
          </div>
          <div className="lg:col-span-3 space-y-4">
            <div className="h-48 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 animate-pulse" />
            <div className="h-64 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!call) return null;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const renderEmotionScoreBadge = (score: number | string | null | undefined) => {
    if (score === null || score === undefined || score === '—' || isNaN(Number(score))) {
      return <div className="text-3xl font-extrabold text-slate-500 font-mono">—</div>;
    }
    const num = typeof score === 'number' ? score : parseFloat(score);
    const formatted = (num > 0 ? '+' : '') + num.toFixed(2);

    if (num > 0.3) {
      return (
        <div className="inline-flex items-center px-4 py-1.5 rounded-full text-2xl font-extrabold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/10">
          {formatted}
        </div>
      );
    } else if (num >= -0.3) {
      return (
        <div className="inline-flex items-center px-4 py-1.5 rounded-full text-2xl font-extrabold font-mono bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm shadow-amber-500/10">
          {formatted}
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center px-4 py-1.5 rounded-full text-2xl font-extrabold font-mono bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm shadow-red-500/10">
          {formatted}
        </div>
      );
    }
  };

  // Helper to render Memory Recalled sections per tier
  const renderMemoryRecalledTiers = () => {
    const memData = call.analysis?.memory_recalled || mockCallDetail.analysis.memory_recalled;

    // String form handling (e.g. from build_memory_prompt)
    if (typeof memData === 'string') {
      return (
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
          {memData}
        </div>
      );
    }

    // Structured dict form handling
    const shortTerm = memData?.short_term || 'Active session initialized.';
    const longTerm = Array.isArray(memData?.long_term) ? memData.long_term : [memData?.long_term].filter(Boolean);
    const episodic = Array.isArray(memData?.episodic) ? memData.episodic : [memData?.episodic].filter(Boolean);
    const graphCtx = Array.isArray(memData?.graph) ? memData.graph : [memData?.graph].filter(Boolean);

    return (
      <div className="space-y-3 text-xs">
        {/* Tier 1: Short-Term Memory */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-blue-400 uppercase tracking-wider">
            <span>Tier 1 • Short-Term Memory</span>
            <span className="text-[10px] text-slate-500 font-normal">Redis</span>
          </div>
          <p className="text-slate-300 text-xs">{typeof shortTerm === 'string' ? shortTerm : JSON.stringify(shortTerm)}</p>
        </div>

        {/* Tier 2: Long-Term Memory */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
            <span>Tier 2 • Long-Term Memory</span>
            <span className="text-[10px] text-slate-500 font-normal">pgvector</span>
          </div>
          {longTerm.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              {longTerm.map((fact: any, idx: number) => (
                <li key={idx} className="leading-snug">{typeof fact === 'string' ? fact : JSON.stringify(fact)}</li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 italic">No semantic facts recalled.</p>
          )}
        </div>

        {/* Tier 3: Episodic Memory */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-purple-400 uppercase tracking-wider">
            <span>Tier 3 • Episodic Memory</span>
            <span className="text-[10px] text-slate-500 font-normal">Past Calls</span>
          </div>
          {episodic.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              {episodic.map((ep: any, idx: number) => (
                <li key={idx} className="leading-snug">{typeof ep === 'string' ? ep : JSON.stringify(ep)}</li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 italic">No past call episodes linked.</p>
          )}
        </div>

        {/* Tier 4: Knowledge Graph Context */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            <span>Tier 4 • Graph Context</span>
            <span className="text-[10px] text-slate-500 font-normal">FalkorDB</span>
          </div>
          {graphCtx.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              {graphCtx.map((item: any, idx: number) => (
                <li key={idx} className="leading-snug">{typeof item === 'string' ? item : JSON.stringify(item)}</li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 italic">No FalkorDB graph nodes active.</p>
          )}
        </div>
      </div>
    );
  };

  // Helper to render Graph Context Used Panel
  const renderGraphContextPanel = () => {
    const gCtx = call.analysis?.graph_context || mockCallDetail.analysis.graph_context;
    const entities = gCtx?.entities || [];
    const frustrationTopics = gCtx?.frustration_topics || [];

    return (
      <div className="space-y-3 text-xs">
        {/* Entities Section */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
            <Tag className="w-3 h-3 text-purple-400" />
            <span>Entities Surfaced ({entities.length})</span>
          </div>
          {entities.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {entities.map((e: any, idx: number) => {
                const name = typeof e === 'string' ? e : e.name || e.label || JSON.stringify(e);
                const type = typeof e === 'object' ? e.type || e.category : null;
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-lg font-medium text-[11px]"
                  >
                    <span>{name}</span>
                    {type && <span className="text-[9px] text-purple-400 opacity-80">({type})</span>}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 italic text-[11px]">No entity nodes surfaced.</p>
          )}
        </div>

        {/* Frustration Topics Section */}
        <div className="pt-2 border-t border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>Frustration Topics ({frustrationTopics.length})</span>
          </div>
          {frustrationTopics.length > 0 ? (
            <div className="space-y-1.5">
              {frustrationTopics.map((item: any, idx: number) => {
                const topic = typeof item === 'string' ? item : item.topic || item.name;
                const count = typeof item === 'object' ? item.count || item.frequency : null;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg text-xs"
                  >
                    <span className="font-medium">{topic}</span>
                    {count && (
                      <span className="bg-amber-500/20 text-amber-400 font-mono text-[10px] px-2 py-0.5 rounded border border-amber-500/40">
                        {count}x surfaced
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 italic text-[11px]">No frustration topics linked in FalkorDB.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Back Button & Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/calls">
            <Button variant="outline" size="sm" className="gap-1.5 border-slate-700 text-slate-300">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Calls</span>
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-white tracking-tight">Call Detail Inspection</h1>
          <span className="text-xs font-mono text-slate-500">ID: {call.id}</span>
        </div>

        {call.is_test_call && (
          <span className="bg-[#7C3AED]/20 text-[#A78BFA] px-3 py-1 rounded-full text-xs font-bold border border-[#7C3AED]/40">
            TEST CALL
          </span>
        )}
      </div>

      {/* 3-COLUMN LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* ==================================================================== */}
        {/* LEFT COLUMN (30% -> col-span-3) - METADATA & PARTICIPANTS            */}
        {/* ==================================================================== */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white">Call Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {/* Direction & Status */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold border ${
                    call.direction === 'inbound'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}
                >
                  {call.direction === 'inbound' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                  {call.direction.toUpperCase()}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-full font-semibold border ${
                    call.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : call.status === 'failed'
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {call.status}
                </span>
              </div>

              {/* From / To */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500">From Caller:</span>
                  <div className="font-mono text-sm font-semibold text-white">{call.from_number}</div>
                  <div className="text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-[#A78BFA]" />
                    <span>{call.contact_name}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500">To Agent:</span>
                  <div className="font-mono text-sm font-semibold text-slate-300">{call.to_number}</div>
                  <div className="text-slate-400 flex items-center gap-1">
                    <Bot className="w-3 h-3 text-purple-400" />
                    <span>{call.agent_name}</span>
                  </div>
                </div>
              </div>

              {/* Date & Duration */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-slate-400">
                <div className="flex justify-between">
                  <span>Started At:</span>
                  <span className="font-mono text-slate-200">
                    {new Date(call.started_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-mono text-slate-200">{formatDuration(call.duration_seconds)}</span>
                </div>
              </div>

              {/* Emotion Score Card */}
              <div className="pt-2 border-t border-slate-800 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
                <div className="text-slate-400 text-xs font-semibold flex items-center justify-center gap-1">
                  <Smile className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span>Emotion Score</span>
                </div>
                <div className="flex justify-center">
                  {renderEmotionScoreBadge(call.emotion_score)}
                </div>
                <div className="text-[10px] text-slate-500">Dual-signal NLP + Audio (Phase 2)</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ==================================================================== */}
        {/* MIDDLE COLUMN (40% -> col-span-4) - SCROLLABLE TRANSCRIPT            */}
        {/* ==================================================================== */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-slate-800 bg-slate-900/60 flex flex-col h-[700px]">
            <CardHeader className="pb-3 border-b border-slate-800 flex-shrink-0">
              <CardTitle className="text-base text-white flex items-center justify-between">
                <span>Audio Transcript</span>
                <span className="text-xs text-slate-400 font-normal">{call.transcript.length} turns</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
              {call.transcript.map((turn, idx) => {
                const isAgent = turn.speaker === 'agent';
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-500 font-mono">
                      <span>{isAgent ? call.agent_name : call.contact_name}</span>
                      <span>•</span>
                      <span>{turn.timestamp}</span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                        isAgent
                          ? 'bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-slate-100 rounded-tl-none shadow-md shadow-[#7C3AED]/10'
                          : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tr-none'
                      }`}
                    >
                      {turn.text}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* ==================================================================== */}
        {/* RIGHT COLUMN (30% -> col-span-3) - ANALYSIS & MEMORY PANELS           */}
        {/* ==================================================================== */}
        <div className="lg:col-span-3 space-y-6">
          {/* Emotion Arc Panel */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400">
                <Smile className="w-4 h-4" />
                <CardTitle className="text-sm text-white">Emotion Arc</CardTitle>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Valence (-1 to +1)</span>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={emotionEvents} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="emotionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                        <stop offset="50%" stopColor="#10B981" stopOpacity={1} />
                        <stop offset="50%" stopColor="#EF4444" stopOpacity={1} />
                        <stop offset="100%" stopColor="#EF4444" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="seconds"
                      unit="s"
                      stroke="#64748B"
                      tick={{ fill: '#94A3B8', fontSize: 10 }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[-1, 1]}
                      ticks={[-1, -0.5, 0, 0.5, 1]}
                      stroke="#64748B"
                      tick={{ fill: '#94A3B8', fontSize: 10 }}
                      tickLine={false}
                    />
                    <ReferenceLine y={0} stroke="#64748B" strokeDasharray="3 3" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as EmotionEvent;
                          const isPos = data.valence >= 0;
                          return (
                            <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                              <div className="font-semibold text-white flex items-center justify-between gap-3">
                                <span>{data.dominant || 'Emotion'}</span>
                                <span className={isPos ? 'text-emerald-400' : 'text-red-400'}>
                                  {data.valence > 0 ? `+${data.valence.toFixed(2)}` : data.valence.toFixed(2)}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Time: <span className="font-mono text-slate-200">{data.seconds}s</span> | Confidence:{' '}
                                <span className="font-mono text-slate-200">
                                  {data.confidence ? `${Math.round(data.confidence * 100)}%` : 'N/A'}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="valence"
                      stroke="url(#emotionGradient)"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#A78BFA' }}
                      activeDot={{ r: 5, fill: '#7C3AED' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Call Summary */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-[#A78BFA]">
                <FileText className="w-4 h-4" />
                <CardTitle className="text-sm text-white">Call Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-slate-300 leading-relaxed">
              {call.analysis?.summary || '—'}
            </CardContent>
          </Card>

          {/* Success Evaluation */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <CardTitle className="text-sm text-white">Success Evaluation</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5 text-xs">
              <div className="font-semibold text-white">{call.analysis?.success_eval || '—'}</div>
              <div className="text-slate-400">Rubric: <span className="text-emerald-400 font-medium">{call.analysis?.rubric || '—'}</span></div>
            </CardContent>
          </Card>

          {/* Structured Data */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-2">
              <button
                type="button"
                onClick={() => setJsonExpanded(!jsonExpanded)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2 text-blue-400">
                  <Database className="w-4 h-4" />
                  <CardTitle className="text-sm text-white">Structured Data</CardTitle>
                </div>
                {jsonExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>
            </CardHeader>
            {jsonExpanded && (
              <CardContent className="pt-0">
                <pre className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto">
                  {JSON.stringify(call.analysis?.structured_data || {}, null, 2)}
                </pre>
              </CardContent>
            )}
          </Card>

          {/* Memory Recalled Panel */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-indigo-400">
                <Brain className="w-4 h-4" />
                <CardTitle className="text-sm text-white">Memory Recalled</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              {renderMemoryRecalledTiers()}
            </CardContent>
          </Card>

          {/* Graph Context Panel */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-amber-400">
                <GitMerge className="w-4 h-4" />
                <CardTitle className="text-sm text-white">Graph Context Used</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              {renderGraphContextPanel()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
