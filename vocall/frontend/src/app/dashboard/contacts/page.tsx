'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Users,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface ContactItem {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  tags?: string[] | null;
  created_at?: string;
}

export default function ContactsPage() {
  const supabase = createClient();

  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Contact Dialog State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);

  // Delete Confirm Dialog State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    async function loadContacts() {
      setLoading(true);
      try {
        const { data } = await (supabase.from('contacts') as any)
          .select('*')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          setContacts(data);
        } else {
          setContacts([]);
        }
      } catch (err: any) {
        showNotification(`Error: /api/contacts — ${err?.message || 'Failed to fetch contacts'}. Try again.`);
      } finally {
        setLoading(false);
      }
    }
    loadContacts();
  }, []);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    setAdding(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          phone: newPhone,
          email: newEmail || null,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const created = await res.json();
      setContacts((prev) => [created, ...prev]);
      showNotification('Contact added successfully');
      setShowAddModal(false);
      setNewName('');
      setNewPhone('');
      setNewEmail('');
    } catch (err: any) {
      showNotification(`Error: /api/contacts — ${err?.message || 'Failed to add contact'}. Try again.`);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!deleteTargetId) return;

    setIsDeleting(true);
    try {
      await fetch(`/api/contacts/${deleteTargetId}`, {
        method: 'DELETE',
      });
      await (supabase.from('contacts') as any).delete().eq('id', deleteTargetId);

      setContacts((prev) => prev.filter((c) => c.id !== deleteTargetId));
      showNotification('Contact deleted successfully');
    } catch (err: any) {
      showNotification(`Error: /api/contacts/${deleteTargetId} — ${err?.message || 'Failed to delete contact'}. Try again.`);
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
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

      {/* Heading & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-[#A78BFA]" />
            <span>Contacts & Memory Profiles</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage caller identities, 4-tier memory banks, and emotion histories.
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white font-semibold gap-2 shadow-lg shadow-[#7C3AED]/30 focus:ring-2 focus:ring-[#7C3AED]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </Button>
      </div>

      {/* CONTACTS LIST / SKELETON / EMPTY STATE */}
      {loading ? (
        <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <Skeleton className="w-48 h-6 rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-full h-14 rounded-xl" />
            ))}
          </div>
        </Card>
      ) : contacts.length === 0 ? (
        /* Empty State */
        <Card className="border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
          <Users className="w-16 h-16 text-slate-600 mx-auto animate-pulse" />
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">No contacts yet.</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Add your first contact to track caller memory profiles and historical sentiment trends.
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white font-semibold gap-2 mt-2 shadow-lg shadow-[#7C3AED]/30 focus:ring-2 focus:ring-[#7C3AED]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </Button>
        </Card>
      ) : (
        /* Contacts Table */
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white">All Contacts ({contacts.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Contact Name</th>
                    <th className="py-3.5 px-4">Phone Number</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Tags</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <Link
                          href={`/dashboard/contacts/${contact.id}`}
                          className="hover:text-[#A78BFA] transition-colors"
                        >
                          {contact.name}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-300">{contact.phone}</td>
                      <td className="py-3.5 px-4 text-slate-400 text-xs">{contact.email || '—'}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {(contact.tags || ['Customer']).map((tag) => (
                            <span
                              key={tag}
                              className="bg-[#7C3AED]/20 text-[#A78BFA] px-2 py-0.5 rounded-full text-[10px] font-semibold border border-[#7C3AED]/30"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteTargetId(contact.id)}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-8 px-2.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#A78BFA]" />
              <span>Add New Contact</span>
            </h3>

            <form onSubmit={handleAddContact} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">Full Name</Label>
                <Input
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="bg-slate-950 border-slate-800 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">Phone Number</Label>
                <Input
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. +1 (415) 892-0192"
                  className="bg-slate-950 border-slate-800 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">Email Address (Optional)</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. alex@example.com"
                  className="bg-slate-950 border-slate-800 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 text-xs border-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={adding}
                  size="sm"
                  className="flex-1 text-xs bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white font-semibold gap-1.5 focus:ring-2 focus:ring-[#7C3AED]"
                >
                  {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Contact'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Destructive Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Are you sure?"
        description="This action cannot be undone. The contact profile and all associated memory tiers will be permanently removed."
        confirmText="Delete Contact"
        isLoading={isDeleting}
        onConfirm={handleDeleteContact}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
