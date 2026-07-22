import React from 'react';

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Voice Agents</h1>
        <p className="text-sm text-slate-400 mt-1">
          Orchestrate real-time STT, LLM, TTS, and memory pipelines for your AI agents.
        </p>
      </div>

      <div className="p-8 rounded-xl border border-slate-800 bg-slate-900/30 text-center space-y-3">
        <p className="text-slate-300">Voice agent management and builder interface.</p>
      </div>
    </div>
  );
}
