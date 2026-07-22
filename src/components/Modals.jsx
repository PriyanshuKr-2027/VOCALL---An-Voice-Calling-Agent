import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight, Play, Sparkles, Lock, Bot, UserPlus } from 'lucide-react';
import { LogoIcon } from './UIPrimitives';

export function DemoModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    minutes: '10k - 50k mins/mo',
    useCase: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 md:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)] transition"
        >
          <X className="h-4 w-4" />
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center gap-2">
              <LogoIcon />
              <span className="font-display text-[15px] font-semibold text-[color:var(--foreground)]">VoCall Enterprise</span>
            </div>
            <h3 className="mt-4 font-display text-[22px] font-semibold text-[color:var(--foreground)] tracking-tight">
              Book a 1-on-1 Product Demo
            </h3>
            <p className="mt-1.5 text-[13.5px] text-[color:var(--muted-foreground)]">
              See how VoCall's 4-tier memory & emotion detection works on your telephony volume.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-[13px]">
              <div>
                <label className="block text-[11.5px] font-mono uppercase text-[color:var(--muted-foreground)] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nora Aris"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2.5 outline-none focus:border-[color:var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-mono uppercase text-[color:var(--muted-foreground)] mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="nora@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2.5 outline-none focus:border-[color:var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] font-mono uppercase text-[color:var(--muted-foreground)] mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Northwind Inc."
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2.5 outline-none focus:border-[color:var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-mono uppercase text-[color:var(--muted-foreground)] mb-1">
                    Expected Volume
                  </label>
                  <select
                    value={formData.minutes}
                    onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                    className="w-full rounded-xl border border-[color:var(--border)] bg-white px-3 py-2.5 outline-none focus:border-[color:var(--accent)]"
                  >
                    <option>&lt; 10k mins/mo</option>
                    <option>10k - 50k mins/mo</option>
                    <option>50k - 250k mins/mo</option>
                    <option>250k+ mins/mo</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--foreground)] text-white text-[14px] font-medium hover:opacity-90 transition shadow-md"
              >
                Confirm Demo Reservation
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="py-6 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-[color:var(--accent)] mb-3" />
            <h3 className="font-display text-[22px] font-semibold text-[color:var(--foreground)]">Demo Confirmed!</h3>
            <p className="mt-2 text-[14px] text-[color:var(--muted-foreground)]">
              We've dispatched sandbox keys to <span className="font-semibold">{formData.email}</span>.
            </p>
            <button onClick={onClose} className="mt-6 rounded-full bg-[color:var(--foreground)] px-6 py-2 text-[13px] text-white">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 md:p-8 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-[color:var(--muted-foreground)]"><X className="h-4 w-4" /></button>
        <div className="text-center">
          <LogoIcon className="mx-auto h-9 w-9 mb-3" />
          <h3 className="font-display text-[22px] font-semibold text-[color:var(--foreground)]">Sign in to VoCall</h3>
          <p className="mt-1 text-[13px] text-[color:var(--muted-foreground)]">First 100 free minutes included.</p>

          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="mt-6 space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[color:var(--muted-foreground)] mb-1">Work Email</label>
              <input
                type="email"
                required
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2.5 text-[13px] outline-none"
              />
            </div>
            <button type="submit" className="w-full h-11 rounded-full bg-[color:var(--foreground)] text-white text-[14px] font-medium">Continue</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function TourModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-[color:var(--muted-foreground)]"><X className="h-4 w-4" /></button>
        <h3 className="font-display text-[22px] font-semibold">VoCall Enterprise Architecture</h3>
        <p className="mt-2 text-[13.5px] text-[color:var(--muted-foreground)]">
          Combines low-latency TTS (Cartesia/Sarvam) with FalkorDB Knowledge Graph memory & Hume AI acoustic emotion detection.
        </p>
        <button onClick={onClose} className="mt-6 w-full rounded-full bg-[color:var(--foreground)] py-2.5 text-[13px] font-medium text-white">Close Tour</button>
      </div>
    </div>
  );
}

export function AddContactModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      id: `c-${Date.now()}`,
      name,
      phone,
      email,
      tags: ['New Contact'],
      lastCall: 'Just now',
      emotionScore: 0.80,
      memory: {
        shortTerm: 'New contact created.',
        longTerm: [],
        episodic: [],
        graph: { nodes: [{ id: name, type: 'Entity', color: '#4f7a65' }], links: [] }
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-[color:var(--muted-foreground)]"><X className="h-4 w-4" /></button>
        <h3 className="font-display text-[20px] font-semibold text-[color:var(--foreground)]">Add New Contact</h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-[13px]">
          <div>
            <label className="block text-[11px] font-mono uppercase text-[color:var(--muted-foreground)] mb-1">Full Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Aarav Sharma" className="w-full rounded-xl border border-[color:var(--border)] bg-white p-2.5" />
          </div>
          <div>
            <label className="block text-[11px] font-mono uppercase text-[color:var(--muted-foreground)] mb-1">Phone Number</label>
            <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 12345" className="w-full rounded-xl border border-[color:var(--border)] bg-white p-2.5 font-mono" />
          </div>
          <div>
            <label className="block text-[11px] font-mono uppercase text-[color:var(--muted-foreground)] mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aarav@company.com" className="w-full rounded-xl border border-[color:var(--border)] bg-white p-2.5" />
          </div>
          <button type="submit" className="w-full mt-2 rounded-full bg-[color:var(--foreground)] py-2.5 text-[13px] font-medium text-white">Save Contact</button>
        </form>
      </div>
    </div>
  );
}
