import React, { useState } from 'react';
import { WaveformChart } from './WaveformChart';
import { 
  Bot, 
  Play, 
  Square, 
  Volume2, 
  Sparkles, 
  Activity, 
  Database, 
  Layers, 
  Search, 
  BrainCircuit, 
  BarChart3, 
  PhoneCall, 
  Zap, 
  Sliders
} from 'lucide-react';

const AGENTS = [
  { 
    name: 'Support Lead', 
    tag: 'Live', 
    active: true,
    calls: '18,204', 
    callsDiff: '+12.4%', 
    duration: '3m 42s', 
    durationDiff: '+8s',
    success: '84.6%', 
    successDiff: '+3.1%', 
    emotion: '0.71', 
    emotionTag: 'positive',
    transcript: [
      { speaker: 'Caller', text: "I've been trying to reset my password for an hour.", tone: 'frustrated' },
      { speaker: 'Agent', text: "I hear you — that's frustrating. I'm pulling up your account now.", tone: 'empathic' },
      { speaker: 'Caller', text: "It just keeps looping back to the login screen.", tone: 'annoyed' },
      { speaker: 'Agent', text: "Got it. I'm sending a magic link to nora@studio.co — should arrive in 5 seconds.", tone: 'reassuring' }
    ]
  },
  { 
    name: 'Sales Qualifier', 
    tag: 'Draft', 
    active: false,
    calls: '4,120', 
    callsDiff: '+5.2%', 
    duration: '5m 10s', 
    durationDiff: '-12s',
    success: '78.2%', 
    successDiff: '+1.8%', 
    emotion: '0.84', 
    emotionTag: 'high intent',
    transcript: [
      { speaker: 'Caller', text: "We need 50 seats with HIPAA compliance by next week.", tone: 'urgent' },
      { speaker: 'Agent', text: "We support instant HIPAA VPC deployments. Let me book a direct architect demo for you.", tone: 'confident' }
    ]
  },
  { 
    name: 'Appointment Bot', 
    tag: 'Live', 
    active: false,
    calls: '9,840', 
    callsDiff: '+18.0%', 
    duration: '2m 15s', 
    durationDiff: '-4s',
    success: '92.4%', 
    successDiff: '+4.5%', 
    emotion: '0.68', 
    emotionTag: 'satisfied',
    transcript: [
      { speaker: 'Caller', text: "Can I reschedule my appointment to Thursday at 3 PM?", tone: 'neutral' },
      { speaker: 'Agent', text: "Thursday at 3 PM is open! I've moved your appointment and sent a calendar invite.", tone: 'cheerful' }
    ]
  },
  { 
    name: 'Collections Agent', 
    tag: 'Live', 
    active: false,
    calls: '6,310', 
    callsDiff: '+2.1%', 
    duration: '4m 05s', 
    durationDiff: '+14s',
    success: '68.9%', 
    successDiff: '+0.9%', 
    emotion: '0.45', 
    emotionTag: 'de-escalated',
    transcript: [
      { speaker: 'Caller', text: "I received a notice about an unpaid invoice, but I paid yesterday.", tone: 'concerned' },
      { speaker: 'Agent', text: "Let me check the ledger immediately. Ah yes, payment posted at 4 PM yesterday. You are all set!", tone: 'calming' }
    ]
  },
  { 
    name: 'Healthcare Intake', 
    tag: 'Draft', 
    active: false,
    calls: '1,450', 
    callsDiff: '+8.7%', 
    duration: '6m 20s', 
    durationDiff: '+30s',
    success: '91.0%', 
    successDiff: '+2.4%', 
    emotion: '0.79', 
    emotionTag: 'caring',
    transcript: [
      { speaker: 'Caller', text: "I need to register as a new patient for Dr. Aris.", tone: 'neutral' },
      { speaker: 'Agent', text: "Welcome! I can collect your insurance details securely over the phone right now.", tone: 'warm' }
    ]
  }
];

export function HeroConsole() {
  const [selectedAgentIndex, setSelectedAgentIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const currentAgent = AGENTS[selectedAgentIndex];

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      if ('speechSynthesis' in window) {
        const textToSay = currentAgent.transcript.map(t => `${t.speaker}: ${t.text}`).join('. ');
        const utterance = new SpeechSynthesisUtterance(textToSay);
        utterance.rate = 1.0;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setIsPlayingAudio(false), 4000);
      }
    }
  };

  return (
    <div id="product" className="relative overflow-hidden rounded-[24px] border border-[color:var(--border)] bg-[color:var(--card)] shadow-[0_1px_2px_rgba(32,33,36,0.05),0_30px_80px_-30px_rgba(32,33,36,0.25)]">
      {/* Window Topbar */}
      <div className="flex items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#e6e4df]"></span>
          <span className="h-2.5 w-2.5 rounded-full bg-[#e6e4df]"></span>
          <span className="h-2.5 w-2.5 rounded-full bg-[#e6e4df]"></span>
        </div>
        <div className="rounded-md border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-1 font-mono text-[11px] text-[color:var(--muted-foreground)]">
          app.vocall.io / agents / {currentAgent.name.toLowerCase().replace(' ', '-')}
        </div>
        <div className="w-12 text-right">
          <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--accent)] animate-pulse" title="Live Server Connected"></span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12">
        {/* Far Left Icon Nav Bar */}
        <aside className="col-span-1 hidden flex-col items-center gap-4 border-r border-[color:var(--border)] py-5 md:flex">
          {[
            { icon: Bot, active: true },
            { icon: Activity, active: false },
            { icon: BrainCircuit, active: false },
            { icon: Database, active: false },
            { icon: Sliders, active: false }
          ].map((item, idx) => (
            <span
              key={idx}
              className={`grid h-8 w-8 place-items-center rounded-lg cursor-pointer transition ${
                item.active
                  ? 'bg-[color:var(--foreground)] text-[color:var(--surface)]'
                  : 'text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)]'
              }`}
            >
              <item.icon className="h-4 w-4" />
            </span>
          ))}
        </aside>

        {/* Left Agent List */}
        <div className="col-span-4 hidden border-r border-[color:var(--border)] p-5 md:block lg:col-span-3">
          <div className="flex items-center justify-between">
            <div className="text-[12px] font-medium text-[color:var(--foreground)]">General workspace</div>
            <span className="rounded border border-[color:var(--border)] bg-[color:var(--surface)] px-1.5 py-0.5 text-[10px] text-[color:var(--muted-foreground)] font-mono">⌘K</span>
          </div>

          <div className="mt-4 space-y-1.5">
            {AGENTS.map((agent, idx) => (
              <button
                key={agent.name}
                onClick={() => setSelectedAgentIndex(idx)}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-[12.5px] transition ${
                  idx === selectedAgentIndex
                    ? 'bg-[color:var(--muted)] font-medium text-[color:var(--foreground)]'
                    : 'text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)]/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-md border border-[color:var(--border)] bg-white text-[10px] font-semibold text-[color:var(--foreground)]">
                    {agent.name[0]}
                  </span>
                  {agent.name}
                </span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9.5px] font-medium ${
                    agent.tag === 'Live'
                      ? 'bg-[#4f7a65]/12 text-[color:var(--accent)]'
                      : 'bg-[color:var(--muted)] text-[color:var(--muted-foreground)]'
                  }`}
                >
                  {agent.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Dashboard Content Area */}
        <div className="col-span-12 p-6 md:col-span-7 lg:col-span-8">
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-[color:var(--muted-foreground)] font-mono">
                Agent · {currentAgent.name}
              </div>
              <div className="mt-1 font-display text-[22px] font-semibold tracking-tight text-[color:var(--foreground)]">
                Live performance
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-2.5 py-1 text-[11px] text-[color:var(--muted-foreground)] hidden sm:inline-block">
                Last 7 days
              </span>
              <button
                onClick={handleToggleAudio}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition ${
                  isPlayingAudio
                    ? 'bg-amber-600 text-white animate-pulse'
                    : 'bg-[color:var(--accent)] text-white hover:opacity-90'
                }`}
              >
                {isPlayingAudio ? <Square className="h-3 w-3 fill-current" /> : <Play className="h-3 w-3 fill-current" />}
                {isPlayingAudio ? 'Stop Audio' : 'Test Call Voice'}
              </button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { k: 'Total calls', v: currentAgent.calls, d: currentAgent.callsDiff },
              { k: 'Avg. duration', v: currentAgent.duration, d: currentAgent.durationDiff },
              { k: 'Success rate', v: currentAgent.success, d: currentAgent.successDiff },
              { k: 'Emotion score', v: currentAgent.emotion, d: currentAgent.emotionTag }
            ].map((metric) => (
              <div key={metric.k} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3">
                <div className="text-[11px] text-[color:var(--muted-foreground)]">{metric.k}</div>
                <div className="mt-1 font-display text-[20px] font-semibold tracking-tight text-[color:var(--foreground)]">
                  {metric.v}
                </div>
                <div className="mt-0.5 text-[10.5px] text-[color:var(--accent)] font-medium">{metric.d}</div>
              </div>
            ))}
          </div>

          {/* Animated SVG Chart Card */}
          <div className="mt-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <div className="flex items-center justify-between">
              <div className="text-[12px] font-medium text-[color:var(--foreground)]">
                Call volume & emotion arc
              </div>
              <div className="flex items-center gap-3 text-[10.5px] text-[color:var(--muted-foreground)]">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-3 rounded-full bg-[color:var(--foreground)]"></span> Calls
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-3 rounded-full bg-[color:var(--accent)]"></span> Emotion
                </span>
              </div>
            </div>
            <WaveformChart />
          </div>

          {/* Bottom Split Grid: Live Transcript & Memory Injected */}
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {/* Live Transcript Box */}
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
              <div className="mb-3 flex items-center justify-between text-[11px] text-[color:var(--muted-foreground)]">
                <span>Live transcript · +1 415 · 02:14</span>
                <span className="flex items-center gap-1 text-[color:var(--accent)] font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] animate-pulse"></span>
                  Recording
                </span>
              </div>
              <div className="space-y-2.5 text-[12.5px] leading-relaxed">
                {currentAgent.transcript.map((line, i) => (
                  <div key={i}>
                    <span className={line.speaker === 'Agent' ? 'text-[color:var(--accent)] font-medium' : 'text-[color:var(--muted-foreground)] font-medium'}>
                      {line.speaker} ·{' '}
                    </span>
                    <span className="text-[color:var(--foreground)]">{line.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Memory Injected Box */}
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
              <div className="mb-3 text-[11px] text-[color:var(--muted-foreground)]">
                Memory injected
              </div>
              <div className="space-y-2 text-[12px]">
                {[
                  { t: 'Long-term', v: 'Prefers email over SMS', tone: 'neutral' },
                  { t: 'Episodic', v: 'Last call: billing dispute, resolved', tone: 'positive' },
                  { t: 'Graph', v: 'Frustrated_about → password reset (x3)', tone: 'negative' },
                  { t: 'Short-term', v: "Mentioned 'urgent' twice this call", tone: 'warn' }
                ].map((mem) => (
                  <div
                    key={mem.t}
                    className="flex items-start justify-between rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2"
                  >
                    <div>
                      <div className="text-[10.5px] uppercase tracking-wider text-[color:var(--muted-foreground)] font-mono">
                        {mem.t}
                      </div>
                      <div className="mt-0.5 text-[color:var(--foreground)]">{mem.v}</div>
                    </div>
                    <span
                      className={`mt-0.5 h-2 w-2 rounded-full ${
                        mem.tone === 'positive'
                          ? 'bg-[color:var(--accent)]'
                          : mem.tone === 'negative'
                          ? 'bg-[#c26a5a]'
                          : mem.tone === 'warn'
                          ? 'bg-[#d1a24a]'
                          : 'bg-[color:var(--muted-foreground)]'
                      }`}
                    ></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
