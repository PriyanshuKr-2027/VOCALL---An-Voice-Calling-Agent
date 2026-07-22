import React from 'react';
import { Bot, Users, Phone, BrainCircuit, Plug, Plus } from 'lucide-react';

export function EmptyState({ type = 'agents', onAction }) {
  const configs = {
    agents: {
      icon: Bot,
      title: 'No agents created yet',
      desc: 'Create your first voice AI agent with 4-tier memory and acoustic emotion tuning.',
      btn: '+ Create First Agent'
    },
    contacts: {
      icon: Users,
      title: 'No contacts added yet',
      desc: 'Add contacts to start tracking long-term customer memory and FalkorDB knowledge graph links.',
      btn: '+ Add First Contact'
    },
    calls: {
      icon: Phone,
      title: 'No call telemetry logs yet',
      desc: 'Publish an agent and make your first test call to observe real-time transcripts and emotion arcs.',
      btn: 'Make Test Web Call'
    },
    connectors: {
      icon: Plug,
      title: 'No connectors configured',
      desc: 'Connect Google Calendar, HubSpot, or custom webhooks during and after calls.',
      btn: '+ Add Connector'
    }
  };

  const curr = configs[type] || configs.agents;
  const Icon = curr.icon;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] my-6">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[color:var(--accent)]/12 text-[color:var(--accent)] mb-4">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="font-display text-[18px] font-semibold text-[color:var(--foreground)]">{curr.title}</h3>
      <p className="mt-1 max-w-sm text-[13px] text-[color:var(--muted-foreground)] leading-relaxed">{curr.desc}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--foreground)] px-5 py-2 text-[13px] font-medium text-white transition hover:opacity-90 shadow-xs"
        >
          <Plus className="h-4 w-4" /> {curr.btn}
        </button>
      )}
    </div>
  );
}
