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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

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
  emotion_score: string;
  analysis: {
    summary?: string;
    success_eval?: string;
    rubric?: string;
    structured_data?: any;
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
    emotion_score: '—',
    analysis: {
      summary: 'Caller requested assistance downloading monthly billing invoices. Agent confirmed identity and emailed PDF directly.',
      success_eval: 'YES - Billing invoice delivered.',
      rubric: 'Goal Achieved',
      structured_data: {
        caller_intent: 'Billing Inquiry',
        resolution_status: 'Resolved',
        email_sent: true,
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

  useEffect(() => {
    async function loadCallDetail() {
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
            emotion_score: '—',
            analysis: callData.analysis || mockCallDetail.analysis,
            transcript: callData.transcript || mockCallDetail.transcript,
          });
        } else {
          setCall(mockCallDetail);
        }
      } catch {
        setCall(mockCallDetail);
      }
    }
    loadCallDetail();
  }, [params.id]);

  if (!call) return null;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
              <div className="pt-2 border-t border-slate-800 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
                <div className="text-slate-400 text-xs font-semibold flex items-center justify-center gap-1">
                  <Smile className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span>Emotion Score</span>
                </div>
                <div className="text-3xl font-extrabold text-slate-500 font-mono">{call.emotion_score}</div>
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
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-purple-400">
                <Smile className="w-4 h-4" />
                <CardTitle className="text-sm text-white">Emotion Arc</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-slate-500 p-4 pt-0">
              <p className="italic bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                "Emotion arc will appear here after Phase 2."
              </p>
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
            <CardContent className="text-xs text-slate-500 p-4 pt-0">
              <p className="italic bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                "Will show memory injected at call start after Phase 2."
              </p>
            </CardContent>
          </Card>

          {/* Graph Context Panel */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-amber-400">
                <GitMerge className="w-4 h-4" />
                <CardTitle className="text-sm text-white">Graph Context</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-slate-500 p-4 pt-0">
              <p className="italic bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                "Will show FalkorDB entities used after Phase 2."
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
