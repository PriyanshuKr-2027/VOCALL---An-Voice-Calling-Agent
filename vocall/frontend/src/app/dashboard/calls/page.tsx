'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  PhoneCall,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  Calendar,
  Clock,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export interface CallRecord {
  id: string;
  direction: 'inbound' | 'outbound';
  from_number: string;
  to_number: string;
  started_at: string;
  duration_seconds: number;
  status: 'completed' | 'failed' | 'in-progress';
  is_test_call: boolean;
  agent_name?: string;
  contact_name?: string;
  emotion_score?: string;
  analysis?: {
    summary?: string;
    success_eval?: string;
    rubric?: string;
    structured_data?: any;
  };

  transcript?: {
    speaker: 'agent' | 'caller';
    text: string;
    timestamp: string;
  }[];
}

export default function CallsListPage() {
  const supabase = createClient();

  const [filterType, setFilterType] = useState<'All' | 'Inbound' | 'Outbound' | 'Test Calls'>('All');
  const [dateRange, setDateRange] = useState<'7 Days' | '30 Days' | 'All Time'>('30 Days');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [calls, setCalls] = useState<CallRecord[]>([]);

  // Mock initial calls fallback
  const mockCalls: CallRecord[] = [
    {
      id: 'c101',
      direction: 'inbound',
      from_number: '+1 (415) 892-0192',
      to_number: '+1 (800) 555-0199',
      started_at: '2026-07-22T12:45:00Z',
      duration_seconds: 142,
      status: 'completed',
      is_test_call: false,
      agent_name: 'Inbound Customer Support',
      contact_name: 'Alex Johnson',
      emotion_score: '—',
      analysis: {
        summary: 'Caller requested assistance with subscription billing and invoice download. Issue resolved promptly.',
        success_eval: 'YES - Billing instructions provided.',
        rubric: 'Goal Achieved',
        structured_data: { intent: 'Billing Inquiry', resolved: true },
      },
      transcript: [
        { speaker: 'agent', text: 'Hello! Thank you for calling VoCall Support. How may I assist you today?', timestamp: '00:02' },
        { speaker: 'caller', text: 'Hi, I need help downloading my latest monthly subscription invoice.', timestamp: '00:08' },
        { speaker: 'agent', text: 'I can certainly help with that. Please verify your email address.', timestamp: '00:14' },
        { speaker: 'caller', text: 'It is alex@example.com.', timestamp: '00:20' },
        { speaker: 'agent', text: 'Thank you Alex! I have sent the PDF invoice directly to your inbox.', timestamp: '00:32' },
      ],
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
      agent_name: 'Outbound Sales SDR',
      contact_name: 'Priya Sharma',
      emotion_score: '—',
      analysis: {
        summary: 'Outbound qualification call. Lead confirmed interest in voice automation demo for next Tuesday.',
        success_eval: 'YES - Demo scheduled.',
        rubric: 'Lead Qualified',
        structured_data: { lead_intent: 'High', demo_date: '2026-07-28' },
      },
      transcript: [
        { speaker: 'agent', text: 'Hi Priya! This is VoCall AI reaching out regarding your voice agent inquiry.', timestamp: '00:03' },
        { speaker: 'caller', text: 'Oh hello! Yes, we are evaluating voice platforms for our support team.', timestamp: '00:10' },
        { speaker: 'agent', text: 'Great! Would you be open to a 15-minute live demo session next Tuesday?', timestamp: '00:18' },
        { speaker: 'caller', text: 'Sure, 2 PM Tuesday works for me.', timestamp: '00:26' },
      ],
    },
    {
      id: 'c103',
      direction: 'inbound',
      from_number: '+1 (555) 234-5678',
      to_number: '+1 (800) 555-0199',
      started_at: '2026-07-22T10:05:00Z',
      duration_seconds: 35,
      status: 'failed',
      is_test_call: false,
      agent_name: 'Inbound Customer Support',
      contact_name: 'Unknown Caller',
      emotion_score: '—',
      analysis: {
        summary: 'Call disconnected before identity verification completed.',
        success_eval: 'NO - Disconnected early.',
        rubric: 'Issue Unresolved',
        structured_data: { drop_reason: 'Caller disconnect' },
      },
      transcript: [
        { speaker: 'agent', text: 'Thank you for calling VoCall Support. What is your account number?', timestamp: '00:02' },
        { speaker: 'caller', text: 'Hold on a second... [call dropped]', timestamp: '00:15' },
      ],
    },
  ];

  useEffect(() => {
    async function loadCalls() {
      setLoading(true);
      try {
        const { data: dbCalls } = await supabase.from('calls').select('*').order('created_at', { ascending: false });
        const dbCallsList = dbCalls as any[];
        if (dbCallsList && dbCallsList.length > 0) {
          const mapped: CallRecord[] = dbCallsList.map((c) => ({
            id: c.id,
            direction: c.direction || 'inbound',
            from_number: c.from_number || '+1 (555) 000-0000',
            to_number: c.to_number || '+1 (800) 555-0199',
            started_at: c.started_at || c.created_at || new Date().toISOString(),
            duration_seconds: c.duration_seconds || 0,
            status: c.status || 'completed',
            is_test_call: !!c.is_test_call,
            agent_name: c.agent_name || 'VoCall Support Agent',
            contact_name: c.contact_name || 'Caller',
            emotion_score: '—',
            analysis: c.analysis || { summary: '—', success_eval: '—', rubric: '—' },
          }));
          setCalls(mapped);
        } else {
          setCalls(mockCalls);
        }
      } catch {
        setCalls(mockCalls);
      } finally {
        setLoading(false);
      }
    }
    loadCalls();
  }, []);

  // Filtered Calls Logic
  const filteredCalls = calls.filter((c) => {
    if (filterType === 'Inbound' && c.direction !== 'inbound') return false;
    if (filterType === 'Outbound' && c.direction !== 'outbound') return false;
    if (filterType === 'Test Calls' && !c.is_test_call) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchFrom = c.from_number.toLowerCase().includes(q);
      const matchTo = c.to_number.toLowerCase().includes(q);
      const matchAgent = c.agent_name?.toLowerCase().includes(q);
      const matchContact = c.contact_name?.toLowerCase().includes(q);
      if (!matchFrom && !matchTo && !matchAgent && !matchContact) return false;
    }
    return true;
  });

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <PhoneCall className="w-8 h-8 text-[#A78BFA]" />
            Call Logs & Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review detailed conversation logs, audio transcripts, post-call analysis, and metrics.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Direction Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['All', 'Inbound', 'Outbound', 'Test Calls'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterType === type
                    ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search + Date Picker */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <Input
                placeholder="Search phone or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-slate-950 border-slate-800"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-[#A78BFA]" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="7 Days">Last 7 Days</option>
                <option value="30 Days">Last 30 Days</option>
                <option value="All Time">All Time</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Calls Table Card */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardContent className="p-0">
          {loading ? (
            /* Skeleton Loader */
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} className="h-12 bg-slate-800/40 rounded-xl animate-pulse flex items-center justify-between px-4">
                  <div className="w-16 h-5 bg-slate-700/50 rounded" />
                  <div className="w-28 h-4 bg-slate-700/50 rounded" />
                  <div className="w-28 h-4 bg-slate-700/50 rounded" />
                  <div className="w-20 h-4 bg-slate-700/50 rounded" />
                  <div className="w-12 h-4 bg-slate-700/50 rounded" />
                  <div className="w-16 h-5 bg-slate-700/50 rounded" />
                </div>
              ))}
            </div>
          ) : (
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
                  {filteredCalls.map((call) => (
                    <tr key={call.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Direction Badge */}
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
                            {call.direction === 'inbound' ? 'IN' : 'OUT'}
                          </span>

                          {call.is_test_call && (
                            <span className="bg-[#7C3AED]/20 text-[#A78BFA] px-2 py-0.5 rounded text-[10px] font-bold border border-[#7C3AED]/40">
                              TEST
                            </span>
                          )}
                        </div>
                      </td>

                      {/* From */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs text-white">{call.from_number}</div>
                        <div className="text-[11px] text-slate-400">{call.contact_name || 'Caller'}</div>
                      </td>

                      {/* To */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs text-slate-300">{call.to_number}</div>
                        <div className="text-[11px] text-slate-400">{call.agent_name || 'Voice Agent'}</div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {new Date(call.started_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                        {formatDuration(call.duration_seconds)}
                      </td>

                      {/* Status Badge */}
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

                      {/* Emotion Score */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-500 text-xs">
                        {call.emotion_score || '—'}
                      </td>

                      {/* Actions */}
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

                  {filteredCalls.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500 text-sm">
                        No call logs match the selected filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
