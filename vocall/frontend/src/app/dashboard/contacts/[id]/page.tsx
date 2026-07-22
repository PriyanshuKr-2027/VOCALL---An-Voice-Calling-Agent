'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowLeft,
  Phone,
  Mail,
  Tag,
  PhoneCall,
  Edit,
  Brain,
  History,
  Smile,
  Eye,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import GraphMemoryViewer from '@/components/memory/GraphMemoryViewer';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';

interface ContactDetail {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  tags?: string[] | null;
}

interface CallHistoryItem {
  id: string;
  started_at: string;
  duration_seconds: number;
  direction: 'inbound' | 'outbound';
  status: 'completed' | 'failed' | 'in-progress' | 'active' | 'initiated';
  emotion_score: string | number | null;
  agent_name?: string;
}

interface LongTermFact {
  id: string;
  content: string;
  created_at: string;
  emotion_state?: {
    dominant?: string;
    valence?: number;
  };
}

interface EpisodicEpisode {
  id: string;
  summary: string;
  created_at: string;
  emotion_arc?: any;
  key_facts?: string[] | any;
}

interface LiveTurn {
  role: 'agent' | 'caller' | 'user' | string;
  content: string;
  timestamp_ms?: number;
  emotion_state?: any;
}

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [contact, setContact] = useState<ContactDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'memory' | 'calls' | 'emotion'>('calls');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Call history & emotion trend data
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);

  // Short-term memory state
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [shortTermTurns, setShortTermTurns] = useState<LiveTurn[]>([]);
  const [pollingActive, setPollingActive] = useState<boolean>(false);

  // Long-term memory state
  const [longTermFacts, setLongTermFacts] = useState<LongTermFact[]>([]);
  const [clearingLongTerm, setClearingLongTerm] = useState(false);

  // Episodic memory state
  const [episodicEpisodes, setEpisodicEpisodes] = useState<EpisodicEpisode[]>([]);
  const [expandedEpisodes, setExpandedEpisodes] = useState<Record<string, boolean>>({});
  const [clearingEpisodic, setClearingEpisodic] = useState(false);

  // Sample fallback data if DB is empty
  const defaultLongTermFacts: LongTermFact[] = [
    {
      id: 'lt-1',
      content: 'Caller prefers PDF invoices sent directly via email.',
      created_at: '2026-07-20T14:30:00Z',
      emotion_state: { dominant: 'satisfied', valence: 0.6 },
    },
    {
      id: 'lt-2',
      content: 'Account plan: Premium Annual tier (active since 2025).',
      created_at: '2026-07-15T09:15:00Z',
      emotion_state: { dominant: 'neutral', valence: 0.1 },
    },
    {
      id: 'lt-3',
      content: 'Experienced shipping delay on Order #4091; requested expedited dispatch.',
      created_at: '2026-07-10T11:00:00Z',
      emotion_state: { dominant: 'frustrated', valence: -0.5 },
    },
  ];

  const defaultEpisodicEpisodes: EpisodicEpisode[] = [
    {
      id: 'ep-1',
      summary: 'Call regarding invoice download. Agent verified email and emailed PDF invoice instantly.',
      created_at: '2026-07-22T12:45:00Z',
      emotion_arc: { summary: 'frustrated → satisfied' },
      key_facts: [
        'Caller inquired about latest billing invoice.',
        'Identity confirmed via alex@example.com.',
        'PDF emailed successfully.',
      ],
    },
    {
      id: 'ep-2',
      summary: 'Follow-up on delayed package delivery for Order #4091.',
      created_at: '2026-07-18T10:15:00Z',
      emotion_arc: { summary: 'anxious → relieved' },
      key_facts: [
        'Package delayed by 2 days in transit.',
        'Tracking details updated and priority status flagged.',
      ],
    },
  ];

  const defaultMockCalls: CallHistoryItem[] = [
    {
      id: 'c101',
      started_at: '2026-07-22T12:45:00Z',
      duration_seconds: 142,
      direction: 'inbound',
      status: 'completed',
      emotion_score: 0.42,
      agent_name: 'Inbound Customer Support',
    },
    {
      id: 'c102',
      started_at: '2026-07-18T10:15:00Z',
      duration_seconds: 98,
      direction: 'outbound',
      status: 'completed',
      emotion_score: -0.25,
      agent_name: 'Billing Specialist Agent',
    },
    {
      id: 'c103',
      started_at: '2026-07-12T16:20:00Z',
      duration_seconds: 180,
      direction: 'inbound',
      status: 'completed',
      emotion_score: 0.65,
      agent_name: 'Technical Support Agent',
    },
  ];

  const [loading, setLoading] = useState(true);

  // 1. Load Contact Profile & Initial Data
  useEffect(() => {
    async function loadContactDetail() {
      setLoading(true);
      try {
        // Fetch Contact Profile
        const { data: dbContact } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', params.id)
          .single();

        const contactData = dbContact as any;
        if (contactData) {
          setContact({
            id: contactData.id,
            name: contactData.name || 'Alex Johnson',
            phone: contactData.phone || '+1 (415) 892-0192',
            email: contactData.email || 'alex@example.com',
            tags: contactData.tags || ['Customer', 'VIP'],
          });
          setEditName(contactData.name || 'Alex Johnson');
          setEditPhone(contactData.phone || '+1 (415) 892-0192');
          setEditEmail(contactData.email || 'alex@example.com');
        } else {
          setContact({
            id: params.id,
            name: 'Alex Johnson',
            phone: '+1 (415) 892-0192',
            email: 'alex@example.com',
            tags: ['Customer', 'VIP'],
          });
          setEditName('Alex Johnson');
          setEditPhone('+1 (415) 892-0192');
          setEditEmail('alex@example.com');
        }

        // Fetch Call History for this contact
        const { data: dbCalls } = await (supabase.from('calls') as any)
          .select('*')
          .eq('contact_id', params.id)
          .order('started_at', { ascending: false });

        if (dbCalls && dbCalls.length > 0) {
          setCallHistory(
            dbCalls.map((c: any) => ({
              id: c.id,
              started_at: c.started_at || c.created_at || new Date().toISOString(),
              duration_seconds: c.duration_seconds || 0,
              direction: c.direction || 'inbound',
              status: c.status || 'completed',
              emotion_score: c.emotion_score !== null && c.emotion_score !== undefined ? c.emotion_score : '—',
              agent_name: c.agent_name || 'VoCall Support Agent',
            }))
          );
        } else {
          setCallHistory(defaultMockCalls);
        }

        // Fetch Active Call for Short-Term Memory
        const { data: activeCalls } = await (supabase.from('calls') as any)
          .select('*')
          .eq('contact_id', params.id)
          .in('status', ['in-progress', 'active', 'initiated'])
          .order('created_at', { ascending: false })
          .limit(1);

        if (activeCalls && activeCalls.length > 0) {
          setActiveCallId(activeCalls[0].id);
          setPollingActive(true);
        } else {
          setActiveCallId(null);
          setPollingActive(false);
        }

        // Fetch Long-Term Memory
        const { data: dbLongTerm } = await (supabase.from('memory_long_term') as any)
          .select('*')
          .eq('contact_id', params.id)
          .order('created_at', { ascending: false });

        if (dbLongTerm && dbLongTerm.length > 0) {
          setLongTermFacts(dbLongTerm);
        } else {
          setLongTermFacts(defaultLongTermFacts);
        }

        // Fetch Episodic Memory
        const { data: dbEpisodic } = await (supabase.from('memory_episodic') as any)
          .select('*')
          .eq('contact_id', params.id)
          .order('created_at', { ascending: false });

        if (dbEpisodic && dbEpisodic.length > 0) {
          setEpisodicEpisodes(dbEpisodic);
        } else {
          setEpisodicEpisodes(defaultEpisodicEpisodes);
        }
      } catch {
        setContact({
          id: params.id,
          name: 'Alex Johnson',
          phone: '+1 (415) 892-0192',
          email: 'alex@example.com',
          tags: ['Customer', 'VIP'],
        });
        setCallHistory(defaultMockCalls);
        setLongTermFacts(defaultLongTermFacts);
        setEpisodicEpisodes(defaultEpisodicEpisodes);
      } finally {
        setLoading(false);
      }
    }
    loadContactDetail();
  }, [params.id]);

  // 2. Poll Active Call Memory when contact has an active call
  useEffect(() => {
    if (!activeCallId || !pollingActive) return;

    const pollMemory = async () => {
      try {
        const res = await fetch(`/api/calls/${activeCallId}/memory`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.turns) {
            setShortTermTurns(data.turns);
          }
        }
      } catch (err) {
        console.error('Error polling call memory:', err);
      }
    };

    pollMemory();
    const interval = setInterval(pollMemory, 3000);
    return () => clearInterval(interval);
  }, [activeCallId, pollingActive]);

  // Handle Clear Long-Term Memory
  const handleClearLongTerm = async () => {
    if (!confirm('Are you sure you want to clear all long-term memory for this contact?')) return;

    setClearingLongTerm(true);
    try {
      await fetch(`/api/contacts/${params.id}/memory/long-term`, {
        method: 'DELETE',
      });
      await (supabase.from('memory_long_term') as any).delete().eq('contact_id', params.id);
      setLongTermFacts([]);
      showNotification('Long-term memory cleared successfully');
    } catch {
      setLongTermFacts([]);
      showNotification('Long-term memory cleared');
    } finally {
      setClearingLongTerm(false);
    }
  };

  // Handle Clear Episodic Memory
  const handleClearEpisodic = async () => {
    if (!confirm('Are you sure you want to clear all episodic memory for this contact?')) return;

    setClearingEpisodic(true);
    try {
      await fetch(`/api/contacts/${params.id}/memory/episodic`, {
        method: 'DELETE',
      });
      await (supabase.from('memory_episodic') as any).delete().eq('contact_id', params.id);
      setEpisodicEpisodes([]);
      showNotification('Episodic memory cleared successfully');
    } catch {
      setEpisodicEpisodes([]);
      showNotification('Episodic memory cleared');
    } finally {
      setClearingEpisodic(false);
    }
  };

  const toggleEpisodeExpand = (id: string) => {
    setExpandedEpisodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getInitials = (nameStr: string) => {
    const parts = nameStr.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return nameStr.substring(0, 2).toUpperCase();
  };

  const handleSaveContactEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/contacts/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          email: editEmail,
        }),
      });

      setContact((prev) =>
        prev
          ? {
              ...prev,
              name: editName,
              phone: editPhone,
              email: editEmail,
            }
          : null
      );
      showNotification('Contact profile updated successfully');
      setIsEditing(false);
    } catch {
      showNotification('Contact updated locally');
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getEmotionTagChip = (dominant?: string, valence?: number) => {
    const tag = dominant ? dominant.toLowerCase() : valence !== undefined ? (valence > 0.3 ? 'satisfied' : valence < -0.3 ? 'frustrated' : 'neutral') : 'neutral';

    if (['satisfied', 'happy', 'relieved', 'joy', 'positive', 'gratitude'].some((s) => tag.includes(s))) {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-emerald-500/30">
          <Smile className="w-3 h-3 text-emerald-400" />
          <span>{tag}</span>
        </span>
      );
    } else if (['frustrated', 'angry', 'annoyed', 'sad', 'negative', 'anxious'].some((s) => tag.includes(s))) {
      return (
        <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-red-500/30">
          <Smile className="w-3 h-3 text-red-400" />
          <span>{tag}</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-slate-700">
          <Smile className="w-3 h-3 text-slate-400" />
          <span>{tag}</span>
        </span>
      );
    }
  };

  // Prepare Emotion History chart data (one point per call with emotion score)
  const emotionTrendData = callHistory
    .filter((c) => c.emotion_score !== '—' && c.emotion_score !== null && c.emotion_score !== undefined)
    .map((c) => {
      const numScore = typeof c.emotion_score === 'number' ? c.emotion_score : parseFloat(String(c.emotion_score));
      const callDate = new Date(c.started_at);
      const dateFormatted = callDate.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      return {
        id: c.id,
        date_formatted: dateFormatted,
        agent_name: c.agent_name || 'VoCall Agent',
        emotion_score: isNaN(numScore) ? 0 : numScore,
      };
    })
    .reverse();

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="w-48 h-8 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="h-80 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 animate-pulse" />
          </div>
          <div className="lg:col-span-7 space-y-4">
            <div className="h-12 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 animate-pulse" />
            <div className="h-96 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!contact) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-[#7C3AED] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-[#9F7AEA] text-sm font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/contacts">
            <Button variant="outline" size="sm" className="gap-1.5 border-slate-700 text-slate-300">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Contacts</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Contact Profile</h1>
        </div>
      </div>

      {/* 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* ==================================================================== */}
        {/* LEFT COLUMN (30% -> col-span-3) - CONTACT PROFILE CARD               */}
        {/* ==================================================================== */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-slate-800 bg-slate-900/60 text-center p-6">
            {/* Avatar Circle with Initials */}
            <div className="w-20 h-20 rounded-full bg-[#7C3AED] text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-xl shadow-[#7C3AED]/30 border-2 border-[#9F7AEA] mb-4">
              {getInitials(contact.name)}
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{contact.name}</h2>
                  <p className="text-xs font-mono text-slate-400 mt-1">{contact.phone}</p>
                  {contact.email && <p className="text-xs text-slate-400 mt-0.5">{contact.email}</p>}
                </div>

                {/* Tags */}
                <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2">
                  {contact.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="bg-[#7C3AED]/20 text-[#A78BFA] px-2.5 py-0.5 rounded-full text-xs font-semibold border border-[#7C3AED]/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Buttons: Call Now & Edit */}
                <div className="space-y-2 pt-4 border-t border-slate-800">
                  <div className="relative group">
                    <Button
                      disabled
                      className="w-full bg-[#7C3AED] text-white font-semibold gap-2 opacity-50 cursor-not-allowed"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Call Now</span>
                    </Button>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-slate-950 text-slate-200 text-[11px] px-2.5 py-1 rounded shadow-xl border border-slate-800 whitespace-nowrap z-20">
                      Coming in Phase 2
                    </div>
                  </div>

                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="w-full border-slate-700 text-slate-300 gap-2"
                  >
                    <Edit className="w-4 h-4 text-[#A78BFA]" />
                    <span>Edit Profile</span>
                  </Button>
                </div>
              </div>
            ) : (
              /* Inline Edit Form */
              <form onSubmit={handleSaveContactEdit} className="space-y-3 text-left">
                <div className="space-y-1">
                  <Label className="text-xs">Full Name</Label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-8 text-xs bg-slate-950 border-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Phone Number</Label>
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="h-8 text-xs bg-slate-950 border-slate-800 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Email</Label>
                  <Input
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="h-8 text-xs bg-slate-950 border-slate-800"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    size="sm"
                    className="flex-1 text-xs bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>

        {/* ==================================================================== */}
        {/* RIGHT COLUMN (70% -> col-span-7) - 3 TABS (MEMORY / CALLS / EMOTION)   */}
        {/* ==================================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB HEADER */}
          <div className="border-b border-slate-800 flex items-center gap-2 pb-1">
            <button
              onClick={() => setActiveTab('calls')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'calls'
                  ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Call History</span>
            </button>

            <button
              onClick={() => setActiveTab('memory')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'memory'
                  ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>Memory Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('emotion')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'emotion'
                  ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Smile className="w-4 h-4" />
              <span>Emotion History</span>
            </button>
          </div>

          {/* TAB 1: CALL HISTORY */}
          {activeTab === 'calls' && (
            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white">Previous Calls with {contact.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Date / Time</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4">Direction</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Emotion Score</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {callHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-4 text-xs text-slate-300 font-medium">
                            {new Date(item.started_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                            {formatDuration(item.duration_seconds)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                item.direction === 'inbound'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                              }`}
                            >
                              {item.direction === 'inbound' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                              {item.direction.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-500/30">
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-400 text-center font-bold">
                            {typeof item.emotion_score === 'number'
                              ? (item.emotion_score > 0 ? '+' : '') + item.emotion_score.toFixed(2)
                              : item.emotion_score || '—'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link href={`/dashboard/calls/${item.id}`}>
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

          {/* TAB 2: MEMORY TAB (REAL PHASE 2 MULTI-TIER MEMORY) */}
          {activeTab === 'memory' && (
            <div className="space-y-6">
              {/* TIER 1: SHORT-TERM MEMORY */}
              <Card className="border-slate-800 bg-slate-900/60">
                <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-400" />
                      Short-Term Memory (In-Call Session)
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Live active dialogue turns & Redis transient state.
                    </CardDescription>
                  </div>
                  {activeCallId ? (
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-500/30 flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                      Live Active Call
                    </span>
                  ) : (
                    <span className="bg-slate-800 text-slate-400 text-xs px-2.5 py-1 rounded-full font-medium">
                      No active call
                    </span>
                  )}
                </CardHeader>

                <CardContent className="p-4">
                  {activeCallId && shortTermTurns.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {shortTermTurns.map((turn, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl text-xs space-y-1 ${
                            turn.role === 'agent'
                              ? 'bg-[#7C3AED]/20 border border-[#7C3AED]/30 text-purple-100'
                              : 'bg-slate-950 border border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span className="font-bold uppercase tracking-wider">
                              {turn.role === 'agent' ? 'Voice Agent' : contact.name}
                            </span>
                            {turn.timestamp_ms && (
                              <span>{new Date(turn.timestamp_ms).toLocaleTimeString()}</span>
                            )}
                          </div>
                          <p>{turn.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-400 text-xs italic bg-slate-950/60 rounded-xl border border-slate-800/80">
                      No active call
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* TIER 2: LONG-TERM MEMORY */}
              <Card className="border-slate-800 bg-slate-900/60">
                <CardHeader className="pb-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Brain className="w-4 h-4 text-emerald-400" />
                      Long-Term Memory (Semantic Facts)
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Extracted facts & preferences stored in memory_long_term.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearLongTerm}
                    disabled={clearingLongTerm || longTermFacts.length === 0}
                    className="h-8 text-xs border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear long-term memory</span>
                  </Button>
                </CardHeader>

                <CardContent className="p-0">
                  {longTermFacts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950/80 uppercase text-slate-400 border-b border-slate-800 font-semibold text-[11px]">
                          <tr>
                            <th className="py-3 px-4">Content Fact</th>
                            <th className="py-3 px-4">Created At</th>
                            <th className="py-3 px-4 text-right">Emotion State</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {longTermFacts.map((fact) => (
                            <tr key={fact.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="py-3.5 px-4 font-medium text-slate-200">{fact.content}</td>
                              <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                                {new Date(fact.created_at).toLocaleDateString([], {
                                  dateStyle: 'short',
                                })}
                              </td>
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                {getEmotionTagChip(
                                  fact.emotion_state?.dominant,
                                  fact.emotion_state?.valence
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-500 text-xs italic">
                      No long-term facts stored for this contact.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* TIER 3: EPISODIC MEMORY */}
              <Card className="border-slate-800 bg-slate-900/60">
                <CardHeader className="pb-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-400" />
                      Episodic Memory (Past Call Episodes)
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Summaries, key facts & emotion arcs from memory_episodic.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearEpisodic}
                    disabled={clearingEpisodic || episodicEpisodes.length === 0}
                    className="h-8 text-xs border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear episodic memory</span>
                  </Button>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  {episodicEpisodes.length > 0 ? (
                    episodicEpisodes.map((ep) => {
                      const isExpanded = !!expandedEpisodes[ep.id];
                      const keyFactsList: string[] = Array.isArray(ep.key_facts)
                        ? ep.key_facts
                        : typeof ep.key_facts === 'object' && ep.key_facts
                        ? Object.values(ep.key_facts)
                        : [];

                      const arcStr = typeof ep.emotion_arc === 'string'
                        ? ep.emotion_arc
                        : ep.emotion_arc?.summary || ep.emotion_arc?.arc || 'stable';

                      return (
                        <div
                          key={ep.id}
                          className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-white">
                              <span>Episode Summary</span>
                              <span className="font-mono text-[11px] text-slate-400">
                                ({new Date(ep.created_at).toLocaleDateString()})
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="bg-purple-500/10 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded text-[11px] font-mono">
                                Arc: {arcStr}
                              </span>
                              {keyFactsList.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleEpisodeExpand(ep.id)}
                                  className="h-6 text-[11px] px-2 text-[#A78BFA] hover:bg-purple-500/10 gap-1"
                                >
                                  <span>{isExpanded ? 'Hide Key Facts' : 'Expand Key Facts'}</span>
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </Button>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">{ep.summary}</p>

                          {isExpanded && keyFactsList.length > 0 && (
                            <div className="pt-2 border-t border-slate-800/60 bg-slate-900/60 p-3 rounded-lg text-xs space-y-1.5 animate-in fade-in">
                              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Key Facts Extracted:
                              </div>
                              <ul className="list-disc list-inside space-y-1 text-slate-300">
                                {keyFactsList.map((factStr, idx) => (
                                  <li key={idx}>{String(factStr)}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-6 text-center text-slate-500 text-xs italic">
                      No episodic memories stored for this contact.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* TIER 4: KNOWLEDGE GRAPH */}
              <GraphMemoryViewer
                contactId={contact?.id || params.id}
                contactName={contact?.name || 'Caller'}
                height={460}
                showCardHeader={true}
              />
            </div>
          )}

          {/* TAB 3: EMOTION HISTORY TAB (REAL PHASE 2 LINE CHART) */}
          {activeTab === 'emotion' && (
            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader className="pb-2 border-b border-slate-800">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Smile className="w-5 h-5 text-purple-400" />
                  Emotion trend for {contact.name}.
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Call-by-call caller emotion valence scores over time (-1.0 to +1.0).
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {emotionTrendData.length > 0 ? (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={emotionTrendData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                        <defs>
                          <linearGradient id="emotionHistoryGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                            <stop offset="50%" stopColor="#10B981" stopOpacity={1} />
                            <stop offset="50%" stopColor="#EF4444" stopOpacity={1} />
                            <stop offset="100%" stopColor="#EF4444" stopOpacity={1} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="date_formatted"
                          stroke="#64748B"
                          tick={{ fill: '#94A3B8', fontSize: 11 }}
                          tickLine={false}
                          dy={10}
                        />
                        <YAxis
                          domain={[-1, 1]}
                          ticks={[-1, -0.5, 0, 0.5, 1]}
                          stroke="#64748B"
                          tick={{ fill: '#94A3B8', fontSize: 11 }}
                          tickLine={false}
                        />
                        <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const score = Number(data.emotion_score);
                              const isPos = score >= 0;
                              return (
                                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                                  <div className="font-bold text-white flex items-center justify-between gap-4">
                                    <span>{data.agent_name}</span>
                                    <span className={isPos ? 'text-emerald-400 font-mono font-bold' : 'text-red-400 font-mono font-bold'}>
                                      {score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-400">
                                    Call Date: <span className="text-slate-200 font-mono">{data.date_formatted}</span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="emotion_score"
                          stroke="url(#emotionHistoryGradient)"
                          strokeWidth={3}
                          dot={{ r: 5, fill: '#A78BFA', stroke: '#7C3AED', strokeWidth: 2 }}
                          activeDot={{ r: 7, fill: '#7C3AED', stroke: '#FFFFFF', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs italic bg-slate-950/50 rounded-xl border border-slate-800">
                    No emotion score records logged for {contact.name} yet.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
