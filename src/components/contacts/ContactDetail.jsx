import React, { useState } from 'react';
import { PhoneCall, Edit, Trash2, ArrowLeft, BrainCircuit, Share2, Sparkles, CheckCircle2 } from 'lucide-react';

export function ContactDetail({ contactId, contacts, onBack, onInitiateCall }) {
  const contact = contacts.find(c => c.id === contactId) || contacts[0];
  const [activeTab, setActiveTab] = useState('memory');
  const [isCalling, setIsCalling] = useState(false);

  const handleCall = () => {
    setIsCalling(true);
    setTimeout(() => {
      setIsCalling(false);
      onInitiateCall(contact);
    }, 1000);
  };

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Top Back Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Contacts List
      </button>

      {/* Main 2-Column Grid (30% / 70%) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column (30%) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-xs text-center">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[color:var(--accent)]/15 font-display text-[26px] font-bold text-[color:var(--accent)] mb-4">
              {contact.name.split(' ').map(n=>n[0]).join('')}
            </span>
            <h2 className="font-display text-[22px] font-semibold text-[color:var(--foreground)]">{contact.name}</h2>
            <div className="mt-1 font-mono text-[13px] text-[color:var(--muted-foreground)]">{contact.phone}</div>
            <div className="text-[12.5px] text-[color:var(--muted-foreground)]">{contact.email}</div>

            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {contact.tags.map(t => (
                <span key={t} className="rounded-full bg-[color:var(--muted)] px-2.5 py-0.5 text-[11px] text-[color:var(--muted-foreground)] font-medium">
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-6 flex gap-2 justify-center">
              <button
                onClick={handleCall}
                disabled={isCalling}
                className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--accent)] text-white text-[13.5px] font-medium transition hover:opacity-90 shadow-xs"
              >
                {isCalling ? <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" /> : <PhoneCall className="h-4 w-4" />}
                Call Now
              </button>
              <button className="grid h-11 w-11 place-items-center rounded-full border border-[color:var(--border)] bg-white text-[color:var(--foreground)] hover:bg-[color:var(--surface)]">
                <Edit className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (70%) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Tab Selection */}
          <div className="flex gap-3 border-b border-[color:var(--border)] pb-2 text-[13.5px] font-medium text-[color:var(--muted-foreground)]">
            {['memory', 'calls', 'emotion'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`capitalize px-4 py-1.5 rounded-lg transition ${
                  activeTab === tab
                    ? 'bg-[color:var(--foreground)] text-[color:var(--surface)] font-medium'
                    : 'hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)]'
                }`}
              >
                {tab === 'memory' ? '4-Tier Memory & Graph' : tab === 'calls' ? 'Call History' : 'Emotion Trend'}
              </button>
            ))}
          </div>

          {/* TAB 1: 4-Tier Memory & Knowledge Graph */}
          {activeTab === 'memory' && (
            <div className="space-y-6">
              {/* Short-Term Memory */}
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
                <div className="flex items-center justify-between">
                  <div className="font-display text-[15px] font-semibold text-[color:var(--foreground)]">1. Short-Term Memory</div>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-blue-700">Live during calls only</span>
                </div>
                <div className="mt-3 text-[13px] leading-relaxed text-[color:var(--foreground)] font-mono bg-[color:var(--surface)] p-3 rounded-xl border border-[color:var(--border)]">
                  {contact.memory.shortTerm}
                </div>
              </div>

              {/* Long-Term Memory */}
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
                <div className="flex items-center justify-between">
                  <div className="font-display text-[15px] font-semibold text-[color:var(--foreground)]">2. Long-Term Memory (Supabase pgvector)</div>
                  <button className="text-[11.5px] text-red-600 hover:underline">Clear long-term memory</button>
                </div>
                <div className="mt-3 space-y-2">
                  {contact.memory.longTerm.map((fact, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3 text-[13px]">
                      <span>{fact.fact}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10.5px] text-[color:var(--muted-foreground)] font-mono">{fact.date}</span>
                        <span className={`h-2 w-2 rounded-full ${fact.emotion === 'warn' ? 'bg-amber-500' : 'bg-[color:var(--accent)]'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Episodic Memory */}
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
                <div className="flex items-center justify-between">
                  <div className="font-display text-[15px] font-semibold text-[color:var(--foreground)]">3. Episodic Memory (Past Call Summaries)</div>
                  <button className="text-[11.5px] text-red-600 hover:underline">Clear episodic memory</button>
                </div>
                <div className="mt-3 space-y-3">
                  {contact.memory.episodic.map((ep, idx) => (
                    <div key={idx} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3.5 text-[13px]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[color:var(--foreground)]">{ep.summary}</span>
                        <span className="font-mono text-[11px] text-[color:var(--accent)]">{ep.emotion}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {ep.keyFacts.map(k => (
                          <span key={k} className="rounded bg-white px-2 py-0.5 text-[10.5px] font-mono border border-[color:var(--border)]">{k}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Knowledge Graph Section (FalkorDB Visualizer) */}
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display text-[15px] font-semibold text-[color:var(--foreground)]">4. Knowledge Graph (FalkorDB Visualizer)</div>
                    <div className="text-[12px] text-[color:var(--muted-foreground)]">Node-link representation of customer entities & frustration relationships</div>
                  </div>
                  <button className="text-[11.5px] text-red-600 hover:underline">Clear graph memory</button>
                </div>

                {/* SVG Node-Link Graph */}
                <div className="mt-4 relative overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 min-h-[260px] flex items-center justify-center">
                  <svg viewBox="0 0 500 220" className="w-full h-56">
                    {/* Link Lines */}
                    {contact.memory.graph.links.map((link, idx) => {
                      const positions = {
                        'Nora Aris': { x: 250, y: 110 },
                        'Password Loop': { x: 100, y: 50 },
                        'Enterprise Plan': { x: 400, y: 50 },
                        'Magic Link': { x: 100, y: 170 },
                        'HIPAA VPC': { x: 400, y: 170 }
                      };
                      const start = positions[link.source] || { x: 250, y: 110 };
                      const end = positions[link.target] || { x: 100, y: 50 };

                      return (
                        <g key={idx}>
                          <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#e6e4df" strokeWidth="2" strokeDasharray="3 3" />
                          <text x={(start.x + end.x) / 2} y={(start.y + end.y) / 2} fill="#6b6b6b" fontSize="9" textAnchor="middle" className="font-mono">
                            {link.label}
                          </text>
                        </g>
                      );
                    })}

                    {/* Nodes */}
                    {[
                      { name: 'Nora Aris', x: 250, y: 110, fill: '#4f7a65' },
                      { name: 'Password Loop', x: 100, y: 50, fill: '#c26a5a' },
                      { name: 'Enterprise Plan', x: 400, y: 50, fill: '#202124' },
                      { name: 'Magic Link', x: 100, y: 170, fill: '#6b6b6b' },
                      { name: 'HIPAA VPC', x: 400, y: 170, fill: '#4f7a65' }
                    ].map((node) => (
                      <g key={node.name} className="cursor-pointer transition hover:opacity-80">
                        <circle cx={node.x} cy={node.y} r="18" fill={node.fill} />
                        <text x={node.x} y={node.y + 30} fill="#202124" fontSize="11" fontWeight="600" textAnchor="middle">
                          {node.name}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Call History */}
          {activeTab === 'calls' && (
            <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5">
              <table className="w-full text-left text-[12.5px]">
                <thead className="border-b border-[color:var(--border)] text-[11px] font-mono uppercase text-[color:var(--muted-foreground)]">
                  <tr>
                    <th className="py-2">Date</th>
                    <th>Duration</th>
                    <th>Direction</th>
                    <th>Status</th>
                    <th>Emotion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--border)]">
                  <tr>
                    <td className="py-3 font-medium">Apr 18, 2026</td>
                    <td>04:12</td>
                    <td><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">IN</span></td>
                    <td className="text-[color:var(--accent)] font-medium">Completed</td>
                    <td>0.72</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: Emotion History */}
          {activeTab === 'emotion' && (
            <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5">
              <div className="font-display text-[15px] font-semibold">Historical Emotion Valence Curve</div>
              <div className="mt-4 h-48 border border-[color:var(--border)] rounded-xl bg-[color:var(--surface)] flex items-center justify-center font-mono text-[12px] text-[color:var(--muted-foreground)]">
                [ Emotion Scores over time: Apr 12 (+0.80) → Apr 18 (+0.72) ]
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
