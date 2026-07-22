import React, { useState } from 'react';
import { Search, Filter, PhoneCall, ArrowUpRight, ArrowDownLeft, Eye } from 'lucide-react';

export function CallsList({ calls, onSelectCall }) {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCalls = calls.filter(call => {
    const matchesFilter =
      filter === 'All' ||
      (filter === 'Inbound' && call.direction === 'IN') ||
      (filter === 'Outbound' && call.direction === 'OUT') ||
      (filter === 'Test Calls' && call.testTag);
    const matchesSearch =
      call.from.includes(searchTerm) ||
      call.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.agentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display text-[28px] font-semibold text-[color:var(--foreground)] tracking-tight">
          Call Records & Telemetry Logs
        </h1>
        <p className="mt-1 text-[13.5px] text-[color:var(--muted-foreground)]">
          Inspect real-time voice call transcripts, emotion arcs, and structured data outputs.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {['All', 'Inbound', 'Outbound', 'Test Calls'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-[12.5px] font-medium transition ${
                filter === f
                  ? 'bg-[color:var(--foreground)] text-white shadow-xs'
                  : 'border border-[color:var(--border)] bg-white text-[color:var(--muted-foreground)] hover:border-[color:var(--foreground)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs">
          <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-[color:var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search calls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[color:var(--border)] bg-white py-2 pl-9 pr-3 text-[12.5px] outline-none focus:border-[color:var(--accent)]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-xs">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-[color:var(--border)] bg-[color:var(--surface)] text-[11px] font-mono uppercase text-[color:var(--muted-foreground)]">
            <tr>
              <th className="px-5 py-3">Direction</th>
              <th className="px-5 py-3">From</th>
              <th className="px-5 py-3">To / Agent</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Duration</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Emotion Score</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border)]">
            {filteredCalls.map((c) => (
              <tr key={c.id} className="transition hover:bg-[color:var(--surface)]/60 cursor-pointer" onClick={() => onSelectCall(c.id)}>
                <td className="px-5 py-4 font-mono font-semibold">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] ${
                    c.direction === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {c.direction === 'IN' ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                    {c.direction}
                  </span>
                </td>
                <td className="px-5 py-4 font-mono text-[12.5px]">{c.from}</td>
                <td className="px-5 py-4 font-medium text-[color:var(--foreground)]">{c.to}</td>
                <td className="px-5 py-4 text-[12px] text-[color:var(--muted-foreground)] font-mono">{c.date}</td>
                <td className="px-5 py-4 font-mono text-[12.5px]">{c.duration}</td>
                <td className="px-5 py-4">
                  <span className="inline-block rounded-full bg-[color:var(--accent)]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[color:var(--accent)]">
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-4 font-semibold text-[color:var(--accent)]">{c.emotionScore}</td>
                <td className="px-5 py-4 text-right">
                  <button className="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] px-3 py-1 text-[11.5px] font-medium hover:bg-white">
                    <Eye className="h-3.5 w-3.5" /> View Log
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
