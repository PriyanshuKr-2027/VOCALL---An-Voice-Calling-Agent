import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Play, 
  Check, 
  Code, 
  Sliders, 
  Globe, 
  Phone, 
  BrainCircuit, 
  Activity, 
  Plug, 
  Plus, 
  Trash2,
  Volume2,
  Square,
  MessageSquare
} from 'lucide-react';

const TABS = [
  'Identity',
  'Persona',
  'Voice Profile',
  'Telephony',
  'Memory',
  'Emotion',
  'Advanced',
  'Analysis',
  'Integrations',
  'Recent Calls'
];

export function AgentBuilder({ agentId, agents, onSaveAgent, onNavigate }) {
  const existingAgent = agents.find(a => a.id === agentId) || agents[0];
  const [activeTab, setActiveTab] = useState(0);

  // Agent State
  const [agentName, setAgentName] = useState(existingAgent?.name || 'Support Lead');
  const [prompt, setPrompt] = useState(existingAgent?.prompt || 'You are Nora, Support Lead at Northwind.');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [codeMode, setCodeMode] = useState(false);
  const [voice, setVoice] = useState(existingAgent?.voice?.name || 'Nora — Warm EN');
  const [telephonyProvider, setTelephonyProvider] = useState(existingAgent?.telephony?.provider || 'Exotel');
  const [assignedNumber, setAssignedNumber] = useState(existingAgent?.telephony?.number || '+1 (415) 555-0142');
  
  // Memory State
  const [memoryEnabled, setMemoryEnabled] = useState(existingAgent?.memory?.enabled ?? true);
  const [maxFacts, setMaxFacts] = useState(existingAgent?.memory?.maxFacts || 5);
  const [maxEpisodes, setMaxEpisodes] = useState(existingAgent?.memory?.maxEpisodes || 3);
  const [graphEnabled, setGraphEnabled] = useState(existingAgent?.memory?.graph ?? true);

  // Emotion State
  const [emotionEnabled, setEmotionEnabled] = useState(existingAgent?.emotion?.enabled ?? true);
  const [audioSignal, setAudioSignal] = useState(existingAgent?.emotion?.audioSignal ?? true);
  const [frustrationThreshold, setFrustrationThreshold] = useState(existingAgent?.emotion?.frustrationThreshold || 0.7);

  // Structured Data Properties
  const [properties, setProperties] = useState([
    { name: 'issue', prompt: 'Core customer issue' },
    { name: 'channel', prompt: 'Channel reported' }
  ]);

  const handleEnhancePrompt = () => {
    setIsEnhancing(true);
    setTimeout(() => {
      setPrompt(prompt + '\n\n[ENHANCED]: Maintain warm tone, acknowledge emotion immediately, offer magic links when loops occur.');
      setIsEnhancing(false);
    }, 1000);
  };

  const handleAddProperty = () => {
    setProperties([...properties, { name: 'custom_field', prompt: 'Extraction prompt' }]);
  };

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-[color:var(--border)] pb-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--muted)] font-display text-[16px] font-semibold text-[color:var(--foreground)]">
            {agentName[0]}
          </span>
          <div>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="font-display text-[24px] font-semibold text-[color:var(--foreground)] bg-transparent outline-none border-b border-transparent hover:border-[color:var(--border)] focus:border-[color:var(--accent)]"
            />
            <div className="text-[12px] text-[color:var(--muted-foreground)]">ID: {agentId} · {existingAgent?.status}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-[12.5px] font-medium text-[color:var(--foreground)] hover:bg-[color:var(--surface)] transition">
            Chat
          </button>
          <button className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-[12.5px] font-medium text-[color:var(--foreground)] hover:bg-[color:var(--surface)] transition">
            Web call
          </button>
          <button className="rounded-full bg-[color:var(--accent)] px-5 py-2 text-[12.5px] font-medium text-white hover:opacity-90 transition shadow-xs">
            Publish Agent
          </button>
        </div>
      </div>

      {/* 10 Tab Navigation Bar */}
      <div className="flex gap-2 overflow-x-auto border-b border-[color:var(--border)] pb-2 text-[13px] text-[color:var(--muted-foreground)] font-medium">
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveTab(idx)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg transition ${
              idx === activeTab
                ? 'bg-[color:var(--foreground)] text-[color:var(--surface)] font-medium shadow-xs'
                : 'hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 0: Identity */}
      {activeTab === 0 && (
        <div className="space-y-6 max-w-3xl">
          <div>
            <label className="block text-[11px] font-mono uppercase text-[color:var(--muted-foreground)] mb-1">Agent Name</label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-[color:var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono uppercase text-[color:var(--muted-foreground)] mb-1">Description</label>
            <textarea
              rows={3}
              value={existingAgent.description}
              className="w-full rounded-xl border border-[color:var(--border)] bg-white p-3 text-[13px] outline-none focus:border-[color:var(--accent)]"
            />
          </div>
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
            <div className="text-[13px] font-medium">Quick Import from Website</div>
            <div className="mt-2 flex gap-2">
              <input
                type="url"
                placeholder="https://company.com"
                className="flex-1 rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-[12.5px]"
              />
              <button className="rounded-xl border border-[color:var(--border)] bg-[color:var(--muted)] px-4 text-[12.5px] font-medium text-[color:var(--foreground)] hover:bg-white">
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Persona */}
      {activeTab === 1 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-medium">System Instructions</div>
            <button
              onClick={() => setCodeMode(!codeMode)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--border)] bg-white px-3 py-1 text-[11.5px] font-medium text-[color:var(--foreground)]"
            >
              <Code className="h-3.5 w-3.5" /> {codeMode ? 'UI Mode' : 'Code Mode (Raw JSON)'}
            </button>
          </div>

          {!codeMode ? (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  rows={8}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full rounded-2xl border border-[color:var(--border)] bg-white p-4 font-mono text-[13px] leading-relaxed outline-none focus:border-[color:var(--accent)] shadow-xs"
                />
              </div>

              <button
                onClick={handleEnhancePrompt}
                disabled={isEnhancing}
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-5 py-2 text-[13px] font-medium text-white hover:opacity-90 shadow-xs"
              >
                {isEnhancing ? <span className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" /> : <Sparkles className="h-4 w-4" />}
                Enhance Prompt
              </button>

              <div className="mt-4">
                <div className="text-[11px] font-mono uppercase text-[color:var(--muted-foreground)] mb-2">Append Use Case Prompt Chips</div>
                <div className="flex flex-wrap gap-2">
                  {['Customer Support', 'Sales', 'Appointment Booking', 'HR', 'Collections', 'Healthcare', 'Debt Recovery'].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setPrompt(prompt + `\n- Follow standard ${chip} protocol.`)}
                      className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1 text-[11.5px] text-[color:var(--foreground)] hover:border-[color:var(--accent)] font-medium"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <pre className="rounded-2xl border border-[color:var(--border)] bg-black p-4 font-mono text-[12px] text-emerald-400 overflow-x-auto">
{JSON.stringify(existingAgent, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* TAB 2: Voice Profile */}
      {activeTab === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { n: 'Nora — Warm EN', p: 'Cartesia', g: 'Female', lat: '140ms', cost: 'Low' },
              { n: 'Aditi — Hinglish', p: 'Sarvam AI', g: 'Female', lat: '190ms', cost: 'Low' },
              { n: 'Octave — Emotive', p: 'Hume AI', g: 'Male', lat: '210ms', cost: 'Medium' }
            ].map((v) => (
              <div
                key={v.n}
                onClick={() => setVoice(v.n)}
                className={`rounded-2xl border p-5 cursor-pointer transition ${
                  voice === v.n ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/6 shadow-sm' : 'border-[color:var(--border)] bg-white hover:bg-[color:var(--surface)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-display text-[15px] font-semibold">{v.n}</div>
                  {voice === v.n && <Check className="h-4 w-4 text-[color:var(--accent)]" />}
                </div>
                <div className="mt-1 text-[12px] text-[color:var(--muted-foreground)]">{v.p} · {v.g}</div>
                <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-[color:var(--muted-foreground)] border-t border-[color:var(--border)] pt-3">
                  <span>Latency: {v.lat}</span>
                  <span>Cost: {v.cost}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 flex items-center justify-between">
            <div>
              <div className="font-medium text-[13.5px]">Use Hume AI Octave for Emotion-Adaptive Tone</div>
              <div className="text-[12px] text-[color:var(--muted-foreground)] font-mono">Requires Audio Emotion Signal enabled in Emotion tab</div>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-[color:var(--accent)]" />
          </div>
        </div>
      )}

      {/* TAB 3: Telephony */}
      {activeTab === 3 && (
        <div className="space-y-6 max-w-3xl">
          <div>
            <label className="block text-[11px] font-mono uppercase text-[color:var(--muted-foreground)] mb-2">Carrier Provider</label>
            <div className="grid grid-cols-3 gap-3">
              {['Twilio', 'Plivo', 'Exotel'].map((prov) => (
                <button
                  key={prov}
                  onClick={() => setTelephonyProvider(prov)}
                  className={`rounded-xl border p-3 font-display text-[14px] font-semibold ${
                    telephonyProvider === prov ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]' : 'border-[color:var(--border)] bg-white'
                  }`}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-[color:var(--muted-foreground)] mb-1">Assigned Phone Number</label>
            <select
              value={assignedNumber}
              onChange={(e) => setAssignedNumber(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--border)] bg-white p-3 text-[13px]"
            >
              <option>+1 (415) 555-0142 (Exotel)</option>
              <option>+1 (800) 412-9876 (Twilio)</option>
              <option>+91 98765 43210 (Plivo)</option>
            </select>
          </div>
        </div>
      )}

      {/* TAB 4: Memory (VoCall Exclusive) */}
      {activeTab === 4 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-2xl border border-[color:var(--border)] bg-white p-5">
            <div>
              <div className="font-display text-[16px] font-semibold">Enable Memory Engine</div>
              <div className="text-[12px] text-[color:var(--muted-foreground)]">Inject customer context across all 4 tiers automatically</div>
            </div>
            <input
              type="checkbox"
              checked={memoryEnabled}
              onChange={(e) => setMemoryEnabled(e.target.checked)}
              className="h-5 w-5 accent-[color:var(--accent)]"
            />
          </div>

          {memoryEnabled && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-blue-700">Upstash Redis</span>
                <div className="mt-3 font-display text-[15px] font-semibold">1. Short-Term Memory</div>
                <p className="mt-1 text-[12px] text-[color:var(--muted-foreground)]">Maintains turn-by-turn context during live calls.</p>
              </div>

              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-700">Supabase pgvector</span>
                <div className="mt-3 font-display text-[15px] font-semibold">2. Long-Term Memory</div>
                <div className="mt-3 flex items-center justify-between text-[12px]">
                  <span>Max Facts: {maxFacts}</span>
                  <input type="range" min={1} max={10} value={maxFacts} onChange={(e) => setMaxFacts(e.target.value)} className="accent-[color:var(--accent)]" />
                </div>
              </div>

              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-amber-700">Supabase Postgres</span>
                <div className="mt-3 font-display text-[15px] font-semibold">3. Episodic Memory</div>
                <div className="mt-3 flex items-center justify-between text-[12px]">
                  <span>Episodes: {maxEpisodes}</span>
                  <input type="range" min={1} max={5} value={maxEpisodes} onChange={(e) => setMaxEpisodes(e.target.value)} className="accent-[color:var(--accent)]" />
                </div>
              </div>

              <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-purple-700">FalkorDB Graph</span>
                <div className="mt-3 font-display text-[15px] font-semibold">4. Knowledge Graph</div>
                <p className="mt-1 text-[12px] text-[color:var(--muted-foreground)]">Tracks entity links and customer frustration loops.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Emotion */}
      {activeTab === 5 && (
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center justify-between rounded-2xl border border-[color:var(--border)] bg-white p-5">
            <div>
              <div className="font-display text-[16px] font-semibold">Enable Acoustic Emotion Signals</div>
              <div className="text-[12px] text-[color:var(--muted-foreground)]">Adapts agent tone dynamically during call turns</div>
            </div>
            <input type="checkbox" checked={emotionEnabled} onChange={(e) => setEmotionEnabled(e.target.checked)} className="h-5 w-5 accent-[color:var(--accent)]" />
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
            <div className="text-[13px] font-medium">Frustration Handoff Threshold ({frustrationThreshold})</div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={frustrationThreshold}
              onChange={(e) => setFrustrationThreshold(e.target.value)}
              className="w-full mt-3 accent-[color:var(--accent)]"
            />
          </div>
        </div>
      )}

      {/* TAB 6: Advanced */}
      {activeTab === 6 && (
        <div className="space-y-6 max-w-3xl">
          <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5 space-y-3">
            <div className="font-display text-[15px] font-semibold">Stop Speaking Plan</div>
            <div className="flex items-center justify-between text-[12.5px]">
              <span>Number of words: 4</span>
              <span>Backoff: 1s</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: Analysis */}
      {activeTab === 7 && (
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center justify-between">
            <div className="font-display text-[16px] font-semibold">Structured Extraction Schema</div>
            <button onClick={handleAddProperty} className="rounded-full bg-[color:var(--foreground)] px-4 py-1.5 text-[12px] font-medium text-white">
              + Add Property
            </button>
          </div>
          {properties.map((p, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input type="text" value={p.name} className="rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-[12.5px]" />
              <input type="text" value={p.prompt} className="flex-1 rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-[12.5px]" />
            </div>
          ))}
        </div>
      )}

      {/* TAB 8: Integrations */}
      {activeTab === 8 && (
        <div className="space-y-6">
          <div className="text-[12px] font-mono uppercase text-[color:var(--muted-foreground)]">During Call vs Post Call Connectors</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {['Google Calendar', 'HubSpot', 'Custom Webhook', 'Supabase', 'WhatsApp'].map((conn) => (
              <div key={conn} className="rounded-2xl border border-[color:var(--border)] bg-white p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium text-[13px]">{conn}</div>
                  <div className="text-[10.5px] text-[color:var(--accent)]">Configured</div>
                </div>
                <button className="rounded-full border border-[color:var(--border)] px-3 py-1 text-[11px]">Configure</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: Recent Calls */}
      {activeTab === 9 && (
        <div className="rounded-2xl border border-[color:var(--border)] bg-white p-4">
          <table className="w-full text-left text-[12.5px]">
            <thead className="border-b border-[color:var(--border)] text-[11px] font-mono uppercase text-[color:var(--muted-foreground)]">
              <tr>
                <th className="py-2">Caller</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Emotion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border)]">
              <tr>
                <td className="py-3 font-medium">+1 (415) 555-0142</td>
                <td>04:12</td>
                <td className="text-[color:var(--accent)] font-medium">Completed</td>
                <td>0.72 (Positive)</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
