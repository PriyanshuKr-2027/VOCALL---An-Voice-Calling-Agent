import React from 'react';

export default function SpacesPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Workspace Spaces</h1>
        <p className="text-sm text-slate-400 mt-1">
          Organize agents, call logs, and team members into isolated spaces.
        </p>
      </div>

      <div className="p-8 rounded-xl border border-slate-800 bg-slate-900/30">
        <p className="text-slate-300">Space management overview.</p>
      </div>
    </div>
  );
}
