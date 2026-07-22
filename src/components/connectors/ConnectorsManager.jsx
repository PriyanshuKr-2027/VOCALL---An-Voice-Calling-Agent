import React, { useState } from 'react';
import { Plug, Zap, Check, Plus, Settings } from 'lucide-react';

const CONNECTORS = [
  { name: 'Google Calendar', type: 'During Call', desc: 'Checks slot availability and books calendar events live.' },
  { name: 'HubSpot', type: 'Post Call', desc: 'Syncs call summaries, tags, and contacts to CRM.' },
  { name: 'Salesforce', type: 'Post Call', desc: 'Creates pipeline tasks and logs call disposition.' },
  { name: 'Supabase', type: 'During Call', desc: 'Vector database lookup for live customer memory.' },
  { name: 'Postgres', type: 'Post Call', desc: 'Exports structured JSON telemetry logs.' },
  { name: 'Slack', type: 'During Call', desc: 'Instant alerts on high-frustration call escalations.' },
  { name: 'WhatsApp', type: 'Post Call', desc: 'Dispatches instant booking confirmations.' },
  { name: 'Zapier', type: 'Post Call', desc: 'Triggers 5,000+ business workflow automations.' },
  { name: 'Custom Webhook', type: 'During Call', desc: 'Executes custom HTTP callbacks during conversation turns.' }
];

export function ConnectorsManager() {
  const [activeTab, setActiveTab] = useState('All');

  const filteredConnectors = CONNECTORS.filter(c =>
    activeTab === 'All' || c.type === activeTab
  );

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-7xl mx-auto pb-24">
      <div>
        <h1 className="font-display text-[28px] font-semibold text-[color:var(--foreground)] tracking-tight">
          Organization Connectors & Integrations
        </h1>
        <p className="mt-1 text-[13.5px] text-[color:var(--muted-foreground)]">
          Manage during-call tools and post-call automation webhooks org-wide.
        </p>
      </div>

      <div className="flex gap-2 border-b border-[color:var(--border)] pb-2 text-[13px] font-medium text-[color:var(--muted-foreground)]">
        {['All', 'During Call', 'Post Call'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg transition ${
              activeTab === tab
                ? 'bg-[color:var(--foreground)] text-white font-medium'
                : 'hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {filteredConnectors.map((c) => (
          <div key={c.name} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold ${
                c.type === 'During Call' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {c.type}
              </span>
              <span className="h-2 w-2 rounded-full bg-[color:var(--accent)]" />
            </div>
            <div className="font-display text-[16px] font-semibold text-[color:var(--foreground)]">{c.name}</div>
            <p className="text-[12.5px] leading-relaxed text-[color:var(--muted-foreground)]">{c.desc}</p>
            <button className="w-full mt-2 rounded-xl border border-[color:var(--border)] py-1.5 text-[12px] font-medium text-[color:var(--foreground)] hover:bg-[color:var(--surface)]">
              Configure Webhook Settings
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
