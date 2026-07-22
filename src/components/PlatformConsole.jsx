import React, { useState } from 'react';
import { Check, Mic, Play, MessageSquare, Phone, Send, Sparkles } from 'lucide-react';

const VOICES = [
  { n: 'Nora — Warm EN', p: 'Cartesia', sel: true, sample: 'Hello, I am Nora from Northwind support. How can I help you today?' },
  { n: 'Aditi — Hinglish', p: 'Sarvam AI', sel: false, sample: 'Namaste! Aapka password reset instruction email pe bhej diya gaya hai.' },
  { n: 'Octave — Emotive', p: 'Hume AI', sel: false, sample: 'I understand this billing discrepancy has been frustrating. Let me credit your account right away.' }
];

const TABS = ['Identity', 'Persona', 'Voice', 'Telephony', 'Memory', 'Emotion', 'Analysis'];

export function PlatformConsole() {
  const [activeTab, setActiveTab] = useState(1); // Persona default
  const [voices, setVoices] = useState(VOICES);
  const [selectedTag, setSelectedTag] = useState(0);
  const [playingVoice, setPlayingVoice] = useState(null);
  const [systemPrompt, setSystemPrompt] = useState(
    'You are Nora, the Support Lead at Northwind. Speak in warm, plain English. If the caller sounds frustrated, slow down, acknowledge the feeling, and offer a concrete next step within one sentence.'
  );

  const handleSelectVoice = (voiceName) => {
    setVoices(voices.map(v => ({ ...v, sel: v.n === voiceName })));
  };

  const handlePlayVoiceSample = (e, voice) => {
    e.stopPropagation();
    if (playingVoice === voice.n) {
      window.speechSynthesis?.cancel();
      setPlayingVoice(null);
    } else {
      setPlayingVoice(voice.n);
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(voice.sample);
        u.onend = () => setPlayingVoice(null);
        u.onerror = () => setPlayingVoice(null);
        window.speechSynthesis.speak(u);
      } else {
        setTimeout(() => setPlayingVoice(null), 3000);
      }
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] shadow-[var(--shadow-card)]">
      {/* Console Top Header */}
      <div className="flex items-center justify-between border-b border-[color:var(--border)] px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[color:var(--muted)] font-display text-[13px] font-semibold text-[color:var(--foreground)]">
            S
          </div>
          <div>
            <div className="text-[13px] font-medium text-[color:var(--foreground)]">Support Lead</div>
            <div className="text-[11px] text-[color:var(--muted-foreground)]">en · hi · Hinglish · Live</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-full border border-[color:var(--border)] px-3 py-1 text-[11.5px] text-[color:var(--foreground)] hover:bg-[color:var(--surface)] transition">
            Chat
          </button>
          <button className="rounded-full border border-[color:var(--border)] px-3 py-1 text-[11.5px] text-[color:var(--foreground)] hover:bg-[color:var(--surface)] transition">
            Web call
          </button>
          <button className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-[11.5px] font-medium text-white hover:opacity-90 transition">
            Publish
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 overflow-x-auto border-b border-[color:var(--border)] px-5 py-2 text-[12px] text-[color:var(--muted-foreground)]">
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveTab(idx)}
            className={`whitespace-nowrap py-1 transition ${
              idx === activeTab
                ? 'border-b-2 border-[color:var(--foreground)] font-medium text-[color:var(--foreground)]'
                : 'hover:text-[color:var(--foreground)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Tab Panel Content */}
      <div className="grid grid-cols-5 gap-4 p-5">
        {/* System Prompt & Tag Selector */}
        <div className="col-span-5 md:col-span-3">
          <div className="text-[11px] uppercase tracking-wider text-[color:var(--muted-foreground)] font-mono">
            System prompt
          </div>
          <div className="mt-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-[13px] leading-relaxed text-[color:var(--foreground)] font-mono relative">
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full bg-transparent resize-none outline-none font-sans text-[13px] leading-relaxed"
              rows={4}
            />
            <span className="inline-block h-4 w-[1.5px] translate-y-[3px] bg-[color:var(--foreground)] animate-pulse" />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {['Customer Support', 'Sales', 'Appointment', 'Collections', 'Healthcare'].map((tag, idx) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(idx)}
                className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                  idx === selectedTag
                    ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)] font-medium'
                    : 'border-[color:var(--border)] text-[color:var(--muted-foreground)] hover:border-[color:var(--foreground)]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Selection Panel */}
        <div className="col-span-5 md:col-span-2">
          <div className="text-[11px] uppercase tracking-wider text-[color:var(--muted-foreground)] font-mono">
            Voice
          </div>
          <div className="mt-2 space-y-2">
            {voices.map((v) => (
              <div
                key={v.n}
                onClick={() => handleSelectVoice(v.n)}
                className={`flex items-center justify-between rounded-xl border p-3 text-[12.5px] cursor-pointer transition ${
                  v.sel
                    ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/6'
                    : 'border-[color:var(--border)] bg-[color:var(--surface)] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handlePlayVoiceSample(e, v)}
                    className={`grid h-7 w-7 place-items-center rounded-full transition ${
                      v.sel ? 'bg-[color:var(--accent)] text-white' : 'bg-[color:var(--muted)] text-[color:var(--foreground)] hover:bg-[color:var(--accent)] hover:text-white'
                    }`}
                  >
                    {playingVoice === v.n ? <span className="h-2 w-2 rounded-sm bg-current animate-spin" /> : <Play className="h-3 w-3 fill-current ml-0.5" />}
                  </button>
                  <div>
                    <div className="font-medium text-[color:var(--foreground)]">{v.n}</div>
                    <div className="text-[10.5px] text-[color:var(--muted-foreground)]">{v.p}</div>
                  </div>
                </div>
                {v.sel && <Check className="h-4 w-4 text-[color:var(--accent)]" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
