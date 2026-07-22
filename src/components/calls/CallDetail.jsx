import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, Activity, BrainCircuit, Code, Play } from 'lucide-react';
import { WaveformChart } from '../WaveformChart';

export function CallDetail({ callId, calls, onBack }) {
  const call = calls.find(c => c.id === callId) || calls[0];
  const [jsonExpanded, setJsonExpanded] = useState(true);

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Top Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Calls List
      </button>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-[22px] font-semibold text-[color:var(--foreground)]">Call Record #{call.id}</span>
            {call.testTag && <span className="rounded-full bg-purple-100 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-purple-800">Test Call</span>}
          </div>
          <div className="text-[12.5px] text-[color:var(--muted-foreground)] font-mono">{call.date} · {call.duration}</div>
        </div>

        <button className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-[12.5px] font-medium text-[color:var(--foreground)] hover:bg-[color:var(--surface)]">
          Export Call Telemetry
        </button>
      </div>

      {/* 3-Column Inspection Layout (30% / 40% / 30%) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left (30%) — Metadata */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 space-y-4">
            <div className="text-[11px] font-mono uppercase text-[color:var(--muted-foreground)]">Call Metadata</div>

            <div className="space-y-3 text-[13px]">
              <div>
                <div className="text-[11px] text-[color:var(--muted-foreground)]">Agent Handler</div>
                <div className="font-semibold text-[color:var(--foreground)]">{call.agentName}</div>
              </div>

              <div>
                <div className="text-[11px] text-[color:var(--muted-foreground)]">Caller Contact</div>
                <div className="font-semibold text-[color:var(--foreground)]">{call.contactName}</div>
                <div className="font-mono text-[11.5px] text-[color:var(--muted-foreground)]">{call.from}</div>
              </div>

              <div>
                <div className="text-[11px] text-[color:var(--muted-foreground)]">Status Verdict</div>
                <div className="font-semibold text-[color:var(--accent)]">{call.status}</div>
              </div>

              <div className="border-t border-[color:var(--border)] pt-3">
                <div className="text-[11px] text-[color:var(--muted-foreground)] mb-1">Emotion Score</div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-[26px] font-bold text-[color:var(--foreground)]">{call.emotionScore}</span>
                  <span className="rounded-full bg-[color:var(--accent)]/15 px-2.5 py-0.5 text-[10.5px] font-semibold text-[color:var(--accent)]">
                    Positive Arc
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle (40%) — Transcript */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 space-y-4">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[color:var(--muted-foreground)]">
              <span>Turn-by-Turn Transcript</span>
              <span className="text-[color:var(--accent)] font-semibold">Verified Audio STT</span>
            </div>

            <div className="space-y-3.5 text-[13px] leading-relaxed max-h-[460px] overflow-y-auto pr-1">
              {call.transcript.map((msg, idx) => (
                <div key={idx} className={msg.speaker === 'Agent' ? '' : 'text-right'}>
                  <div className="text-[10px] font-mono text-[color:var(--muted-foreground)] mb-0.5">
                    {msg.speaker} · {msg.time}
                  </div>
                  <div
                    className={`inline-block max-w-[90%] rounded-2xl px-3.5 py-2.5 ${
                      msg.speaker === 'Agent'
                        ? 'bg-[color:var(--accent)]/12 text-[color:var(--foreground)]'
                        : 'bg-[color:var(--muted)] text-[color:var(--foreground)]'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right (30%) — Analysis */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Emotion Arc */}
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 space-y-2">
            <div className="text-[11px] font-mono uppercase text-[color:var(--muted-foreground)]">Acoustic Emotion Arc</div>
            <WaveformChart />
            <div className="text-[11px] font-mono text-[color:var(--accent)]">Valence Shift: {call.analysis.emotionDelta}</div>
          </div>

          {/* Call Summary */}
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 space-y-2">
            <div className="text-[11px] font-mono uppercase text-[color:var(--muted-foreground)]">Call Summary</div>
            <p className="text-[13px] leading-relaxed text-[color:var(--foreground)]">{call.analysis.summary}</p>
          </div>

          {/* Structured Data JSON */}
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[color:var(--muted-foreground)]">
              <span>Structured Data JSON</span>
              <button onClick={() => setJsonExpanded(!jsonExpanded)} className="text-[10.5px] text-[color:var(--accent)]">
                {jsonExpanded ? 'Collapse' : 'Expand'}
              </button>
            </div>
            {jsonExpanded && (
              <pre className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3 font-mono text-[11.5px] leading-relaxed text-[color:var(--foreground)] overflow-x-auto">
{JSON.stringify(call.analysis.structuredData, null, 2)}
              </pre>
            )}
          </div>

          {/* Memory Recalled */}
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 space-y-2">
            <div className="text-[11px] font-mono uppercase text-[color:var(--muted-foreground)]">Memory Recalled At Call Start</div>
            <div className="space-y-1.5">
              {call.analysis.memoryRecalled.map((mem, i) => (
                <div key={i} className="text-[12px] text-[color:var(--foreground)] bg-[color:var(--surface)] px-2.5 py-1.5 rounded-lg border border-[color:var(--border)] font-mono">
                  {mem}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
