import React, { useState } from 'react';
import { Search, Plus, PhoneCall, User, ShieldCheck } from 'lucide-react';

export function ContactsList({ contacts, onSelectContact, onOpenAddContact }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-semibold text-[color:var(--foreground)] tracking-tight">
            Contacts & Customer Memory
          </h1>
          <p className="mt-1 text-[13.5px] text-[color:var(--muted-foreground)]">
            Manage contact profiles and inspect 4-tier FalkorDB knowledge graph memory.
          </p>
        </div>

        <button
          onClick={onOpenAddContact}
          className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--foreground)] px-5 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90 shadow-xs"
        >
          <Plus className="h-4 w-4" /> Add Contact
        </button>
      </div>

      {/* Filter Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-[color:var(--muted-foreground)]" />
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-[color:var(--border)] bg-white py-2.5 pl-10 pr-4 text-[13px] outline-none focus:border-[color:var(--accent)]"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-xs">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-[color:var(--border)] bg-[color:var(--surface)] text-[11px] font-mono uppercase text-[color:var(--muted-foreground)]">
            <tr>
              <th className="px-5 py-3">Contact Name</th>
              <th className="px-5 py-3">Phone</th>
              <th className="px-5 py-3">Tags</th>
              <th className="px-5 py-3">Last Call</th>
              <th className="px-5 py-3">Emotion Score</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border)]">
            {filteredContacts.map((c) => (
              <tr key={c.id} className="transition hover:bg-[color:var(--surface)]/60 cursor-pointer" onClick={() => onSelectContact(c.id)}>
                <td className="px-5 py-4 font-medium text-[color:var(--foreground)]">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--accent)]/12 font-display text-[12px] font-semibold text-[color:var(--accent)]">
                      {c.name.split(' ').map(n=>n[0]).join('')}
                    </span>
                    <div>
                      <div>{c.name}</div>
                      <div className="text-[11px] text-[color:var(--muted-foreground)]">{c.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 font-mono text-[12px]">{c.phone}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {c.tags.map(t => (
                      <span key={t} className="rounded-full bg-[color:var(--muted)] px-2 py-0.5 text-[10.5px] text-[color:var(--muted-foreground)]">
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4 text-[12px] text-[color:var(--muted-foreground)]">{c.lastCall}</td>
                <td className="px-5 py-4 font-semibold text-[color:var(--accent)]">{c.emotionScore}</td>
                <td className="px-5 py-4 text-right">
                  <button className="rounded-full border border-[color:var(--border)] px-3 py-1 text-[11.5px] font-medium hover:bg-white">
                    Inspect Memory
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
