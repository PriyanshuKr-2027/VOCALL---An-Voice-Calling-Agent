import React, { useState } from 'react';
import { WaveformChart } from './WaveformChart';
import { Bot, Play, Square, Activity, Database, BrainCircuit, Sliders } from 'lucide-react';

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
      { speaker: 'Caller', text: "I've been trying to reset my password for an hour." },
      { speaker: 'Agent', text: "I hear you — that's frustrating. I'm pulling up your account now." },
      { speaker: 'Caller', text: "It just keeps looping back to the login screen." },
      { speaker: 'Agent', text: "Got it. I'm sending a magic link to nora@studio.co — should arrive in 5 seconds." }
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
      { speaker: 'Caller', text: "We need 50 seats with HIPAA compliance by next week." },
      { speaker: 'Agent', text: "We support instant HIPAA VPC deployments. Let me book a direct architect demo for you." }
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

      <div className="grid grid-cols-12">
        <aside className="col-span-1 hidden flex-col items-center gap-4 border-r border-[color:var(--border)] py-5 md:flex">
          {[Bot, Activity, BrainCircuit, Database, Sliders].map((Icon, idx) => (
            <span
              key={idx}
              className={`grid h-8 w-8 place-items-center rounded-lg ${
                idx === 0 ? 'bg-[color:var(--foreground)] text-[color:var(--surface)]' : 'text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)]'
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
          ))}
        </aside>

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

        <div className="col-span-12 p-6 md:col-span-7 lg:col-span-8">
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

          <div className="mt-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <div className="flex items-center justify-between">
              <div className="text-[12px] font-medium text-[color:var(--foreground)]">
                Call volume & emotion arc
              </div>
            </div>
            <WaveformChart />
          </div>
        </div>
      </div>
    </div>
  );
}
