import React, { useState } from 'react';
import { PhoneCall, CheckCircle2, XCircle, HeartHandshake, Filter, Calendar } from 'lucide-react';
import { WaveformChart } from '../WaveformChart';

export function AnalyticsDashboard({ agents }) {
  const [selectedAgent, setSelectedAgent] = useState('All Agents');

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto pb-24">
      {/* Header & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-semibold text-[color:var(--foreground)] tracking-tight">
            Voice Telemetry Analytics
          </h1>
          <p className="mt-1 text-[13.5px] text-[color:var(--muted-foreground)]">
            Analyze call completion metrics, status breakdown, and acoustic emotion trends over time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2 text-[13px] font-medium outline-none focus:border-[color:var(--accent)]"
          >
            <option>All Agents</option>
            {agents.map(a => <option key={a.id}>{a.name}</option>)}
          </select>
        </div>
      </div>

      {/* 4 Top Stat Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-xs">
          <div className="text-[12px] text-[color:var(--muted-foreground)]">Total Calls</div>
          <div className="mt-3 font-display text-[26px] font-semibold text-[color:var(--foreground)]">32,164</div>
          <div className="mt-1 text-[11px] text-[color:var(--accent)] font-medium">+18% this month</div>
        </div>

        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-xs">
          <div className="text-[12px] text-[color:var(--muted-foreground)]">Interested Calls</div>
          <div className="mt-3 font-display text-[26px] font-semibold text-[color:var(--foreground)]">24,810</div>
          <div className="mt-1 text-[11px] text-[color:var(--accent)] font-medium">77.1% Conversion</div>
        </div>

        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-xs">
          <div className="text-[12px] text-[color:var(--muted-foreground)]">Not Connected</div>
          <div className="mt-3 font-display text-[26px] font-semibold text-[color:var(--foreground)]">1,410</div>
          <div className="mt-1 text-[11px] text-red-500 font-medium">4.3% Unreachable</div>
        </div>

        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-xs">
          <div className="text-[12px] text-[color:var(--muted-foreground)]">Avg. Success Score</div>
          <div className="mt-3 font-display text-[26px] font-semibold text-[color:var(--foreground)]">88.4%</div>
          <div className="mt-1 text-[11px] text-[color:var(--accent)] font-medium">Goal Achieved</div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Status Breakdown */}
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 space-y-4">
          <div className="font-display text-[16px] font-semibold">Status Breakdown</div>
          <div className="space-y-3">
            {[
              { label: 'Completed & Goal Achieved', val: 78, color: '#4f7a65' },
              { label: 'Transferred to Agent', val: 14, color: '#202124' },
              { label: 'Customer Disconnected Early', val: 5, color: '#d1a24a' },
              { label: 'Telephony Carrier Drop', val: 3, color: '#c26a5a' }
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-[12.5px] mb-1">
                  <span>{item.label}</span>
                  <span className="font-mono font-semibold">{item.val}%</span>
                </div>
                <div className="h-2 rounded-full bg-[color:var(--muted)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${item.val}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emotion Trend Line Chart */}
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 space-y-4">
          <div className="font-display text-[16px] font-semibold">Vocal Emotion Arc Trend over Time</div>
          <WaveformChart />
          <div className="flex justify-between text-[11.5px] font-mono text-[color:var(--muted-foreground)] pt-2 border-t border-[color:var(--border)]">
            <span>Week 1 (0.58)</span>
            <span>Week 2 (0.64)</span>
            <span>Week 3 (0.71)</span>
            <span>Week 4 (0.78)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
