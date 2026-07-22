'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  PhoneCall,
  Eye,
  ArrowDownLeft,
  ArrowUpRight,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  Smile,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface CallListItem {
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
  emotion_score?: number | string | null;
}

export default function CallsPage() {
  const supabase = createClient();

  const [calls, setCalls] = useState<CallListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    async function loadCalls() {
      setLoading(true);
      try {
        const { data } = await (supabase.from('calls') as any)
          .select('*')
          .order('started_at', { ascending: false });

        if (data && data.length > 0) {
          setCalls(
            data.map((c: any) => ({
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
              emotion_score: c.emotion_score !== null && c.emotion_score !== undefined ? c.emotion_score : '—',
            }))
          );
        } else {
          setCalls([]);
        }
      } catch (err: any) {
        showNotification(`Error: /api/calls — ${err?.message || 'Failed to fetch call logs'}. Try again.`);
      } finally {
        setLoading(false);
      }
    }
    loadCalls();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-[#7C3AED] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-[#9F7AEA] text-sm font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Heading */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <PhoneCall className="w-7 h-7 text-[#A78BFA]" />
            <span>Call Logs & Transcripts</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time audio transcripts, dual-signal emotion arcs, and 4-tier memory extractions.
          </p>
        </div>

        <Link href="/dashboard/agents">
          <Button className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white font-semibold gap-2 shadow-lg shadow-[#7C3AED]/30 focus:ring-2 focus:ring-[#7C3AED]">
            <Bot className="w-4 h-4" />
            <span>Go to Agents</span>
          </Button>
        </Link>
      </div>

      {/* CALLS TABLE / SKELETON / EMPTY STATE */}
      {loading ? (
        <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <Skeleton className="w-48 h-6 rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="w-full h-14 rounded-xl" />
            ))}
          </div>
        </Card>
      ) : calls.length === 0 ? (
        /* Empty State */
        <Card className="border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
          <PhoneCall className="w-16 h-16 text-slate-600 mx-auto animate-pulse" />
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">
              No calls yet. Publish an agent and make a test call.
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Once your agents begin making or receiving calls, complete transcript logs and emotion analysis will populate here.
            </p>
          </div>
          <Link href="/dashboard/agents">
            <Button className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white font-semibold gap-2 mt-2 shadow-lg shadow-[#7C3AED]/30 focus:ring-2 focus:ring-[#7C3AED]">
              <Bot className="w-4 h-4" />
              <span>Go to Agents</span>
            </Button>
          </Link>
        </Card>
      ) : (
        /* Calls Table */
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white">Call History ({calls.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Direction</th>
                    <th className="py-3.5 px-4">From Caller</th>
                    <th className="py-3.5 px-4">To Agent</th>
                    <th className="py-3.5 px-4">Date / Time</th>
                    <th className="py-3.5 px-4">Duration</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Emotion Score</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {calls.map((call) => (
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
                            {call.direction === 'inbound' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
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
                        <div className="text-[11px] text-slate-400">{call.agent_name}</div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {new Date(call.started_at).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
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

                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400 text-center font-bold">
                        {typeof call.emotion_score === 'number'
                          ? (call.emotion_score > 0 ? '+' : '') + call.emotion_score.toFixed(2)
                          : call.emotion_score || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/dashboard/calls/${call.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs border-slate-700 text-[#A78BFA] hover:bg-[#7C3AED]/20 gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Log</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
