import React from 'react';

export default function ConnectorsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Tool Connectors & Integrations</h1>
        <p className="text-sm text-slate-400 mt-1">
          Connect agents to external webhooks, CRM tools, databases, and custom functions.
        </p>
      </div>

      <div className="p-8 rounded-xl border border-slate-800 bg-slate-900/30">
        <p className="text-slate-300">Tool connectors and integration marketplace.</p>
      </div>
    </div>
  );
}
