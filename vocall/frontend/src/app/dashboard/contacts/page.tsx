'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Users,
  Plus,
  Search,
  Eye,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  Tag,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export interface ContactRecord {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  tags?: string[] | null;
  last_call_at?: string | null;
  emotion_score?: string | null;
  created_at?: string;
}

export default function ContactsListPage() {
  const supabase = createClient();

  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Contact Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [tagsInput, setTagsInput] = useState('VIP, Lead');
  const [adding, setAdding] = useState(false);

  const [notification, setNotification] = useState<string | null>(null);

  // Mock Fallback Contacts
  const mockContacts: ContactRecord[] = [
    {
      id: 'ct1',
      name: 'Alex Johnson',
      phone: '+1 (415) 892-0192',
      email: 'alex@example.com',
      tags: ['Customer', 'VIP'],
      last_call_at: '2026-07-22T12:45:00Z',
      emotion_score: '—',
    },
    {
      id: 'ct2',
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
      email: 'priya@techfirm.in',
      tags: ['Lead', 'High Intent'],
      last_call_at: '2026-07-22T11:20:00Z',
      emotion_score: '—',
    },
    {
      id: 'ct3',
      name: 'David Miller',
      phone: '+1 (555) 234-5678',
      email: 'david.miller@corp.org',
      tags: ['Support', 'Enterprise'],
      last_call_at: '2026-07-20T16:10:00Z',
      emotion_score: '—',
    },
  ];

  useEffect(() => {
    async function loadContacts() {
      setLoading(true);
      try {
        const { data: dbContacts } = await supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: false });

        const dbContactsList = dbContacts as any[];
        if (dbContactsList && dbContactsList.length > 0) {
          setContacts(dbContactsList);
        } else {
          setContacts(mockContacts);
        }
      } catch {
        setContacts(mockContacts);
      } finally {
        setLoading(false);
      }
    }
    loadContacts();
  }, []);

  const handleAddContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setAdding(true);
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          tags: parsedTags,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setContacts((prev) => [data, ...prev]);
        showNotification(`Contact ${name} created successfully`);
        setShowAddModal(false);
        resetForm();
      } else {
        showNotification(data.error || 'Failed to create contact');
      }
    } catch {
      const newContact: ContactRecord = {
        id: `ct_${Date.now()}`,
        name,
        phone,
        email,
        tags: parsedTags,
        last_call_at: null,
        emotion_score: '—',
      };
      setContacts((prev) => [newContact, ...prev]);
      showNotification(`Created contact ${name} locally`);
      setShowAddModal(false);
      resetForm();
    } finally {
      setAdding(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setTagsInput('VIP, Lead');
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredContacts = contacts.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-[#7C3AED] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-[#9F7AEA] text-sm font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-[#A78BFA]" />
            Contacts Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage caller contacts, conversation history, and CRM memory profiles.
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white gap-1.5 shadow-md shadow-[#7C3AED]/20"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Contact</span>
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="border-slate-800 bg-slate-900/60 p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <Input
            placeholder="Search contacts by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-slate-950 border-slate-800"
          />
        </div>
      </Card>

      {/* Contacts Table Card */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardContent className="p-0">
          {loading ? (
            /* Skeleton Loader */
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="h-12 bg-slate-800/40 rounded-xl animate-pulse flex items-center justify-between px-4">
                  <div className="w-32 h-4 bg-slate-700/50 rounded" />
                  <div className="w-28 h-4 bg-slate-700/50 rounded" />
                  <div className="w-24 h-4 bg-slate-700/50 rounded" />
                  <div className="w-20 h-4 bg-slate-700/50 rounded" />
                  <div className="w-12 h-4 bg-slate-700/50 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Name & Email</th>
                    <th className="py-3.5 px-4">Phone Number</th>
                    <th className="py-3.5 px-4">Tags</th>
                    <th className="py-3.5 px-4">Last Call Date</th>
                    <th className="py-3.5 px-4">Emotion Score</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{contact.name}</div>
                        <div className="text-xs text-slate-400">{contact.email || 'No email attached'}</div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-200">
                        {contact.phone}
                      </td>

                      {/* Tags */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {contact.tags && contact.tags.length > 0 ? (
                            contact.tags.map((tag) => (
                              <span
                                key={tag}
                                className="bg-[#7C3AED]/20 text-[#A78BFA] px-2 py-0.5 rounded text-[10px] font-semibold border border-[#7C3AED]/30"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-xs">—</span>
                          )}
                        </div>
                      </td>

                      {/* Last Call Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {contact.last_call_at
                          ? new Date(contact.last_call_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                          : 'Never called'}
                      </td>

                      {/* Emotion Score */}
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-500">
                        {contact.emotion_score || '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/dashboard/contacts/${contact.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs border-slate-700 text-[#A78BFA] hover:bg-[#7C3AED]/20 gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Profile</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {filteredContacts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 text-sm">
                        No contacts found matching search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL: ADD CONTACT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-slate-800 bg-slate-900 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">Add New Contact</CardTitle>
              <CardDescription className="text-slate-400">
                Create a contact record to track call logs and memory profiles.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAddContactSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cname">Full Name *</Label>
                  <Input
                    id="cname"
                    placeholder="Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-slate-950 border-slate-800"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cphone">Phone Number *</Label>
                  <Input
                    id="cphone"
                    placeholder="+1 (415) 892-0192"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="bg-slate-950 border-slate-800 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cemail">Email Address</Label>
                  <Input
                    id="cemail"
                    type="email"
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-950 border-slate-800"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ctags">Tags (Comma Separated)</Label>
                  <Input
                    id="ctags"
                    placeholder="VIP, Lead, Support"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="bg-slate-950 border-slate-800"
                  />
                </div>
              </CardContent>

              <div className="p-6 pt-0 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={adding}
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                >
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Contact'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
