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
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import GraphMemoryViewer from '@/components/memory/GraphMemoryViewer';

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
  status: 'completed' | 'failed' | 'in-progress';
  emotion_score: string;
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

  // Mock Call History
  const mockCallHistory: CallHistoryItem[] = [
    {
      id: 'c101',
      started_at: '2026-07-22T12:45:00Z',
      duration_seconds: 142,
      direction: 'inbound',
      status: 'completed',
      emotion_score: '—',
    },
    {
      id: 'c102',
      started_at: '2026-07-18T10:15:00Z',
      duration_seconds: 98,
      direction: 'outbound',
      status: 'completed',
      emotion_score: '—',
    },
  ];

  useEffect(() => {
    async function loadContactDetail() {
      try {
        const { data: dbContact } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', params.id)
          .single();

        const contactData = dbContact as any;
        if (contactData) {
          setContact({
            id: contactData.id,
            name: contactData.name,
            phone: contactData.phone,
            email: contactData.email,
            tags: contactData.tags || ['Customer'],
          });
          setEditName(contactData.name);
          setEditPhone(contactData.phone);
          setEditEmail(contactData.email || '');
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
      } catch {
        setContact({
          id: params.id,
          name: 'Alex Johnson',
          phone: '+1 (415) 892-0192',
          email: 'alex@example.com',
          tags: ['Customer', 'VIP'],
        });
      }
    }
    loadContactDetail();
  }, [params.id]);

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
                      {mockCallHistory.map((item) => (
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
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-500 text-center">
                            {item.emotion_score}
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

          {/* TAB 2: MEMORY TAB */}
          {activeTab === 'memory' && (
            <div className="space-y-6">
              <GraphMemoryViewer
                contactId={contact?.id || params.id}
                contactName={contact?.name || 'Caller'}
                height={460}
              />
            </div>
          )}

          {/* TAB 3: EMOTION HISTORY TAB PLACEHOLDER */}
          {activeTab === 'emotion' && (
            <Card className="border-[#7C3AED]/30 bg-slate-900/40 p-12 text-center space-y-4">
              <Smile className="w-16 h-16 text-purple-400 mx-auto animate-pulse" />
              <h2 className="text-xl font-bold text-white">Emotion Trend Analytics</h2>
              <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed italic bg-slate-950 p-4 rounded-xl border border-slate-800">
                "Emotion trend chart coming in Phase 2."
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
