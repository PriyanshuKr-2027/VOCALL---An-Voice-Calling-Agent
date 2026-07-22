import React, { useState } from 'react';
import { LogoIcon } from '../UIPrimitives';
import { ArrowRight, Lock, Mail, User, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function AuthPages({ mode = 'login', onNavigate }) {
  const [authMode, setAuthMode] = useState(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'reset') {
      setResetSent(true);
    } else if (authMode === 'signup') {
      onNavigate('onboarding');
    } else {
      onNavigate('dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--background)] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-xl">
        {/* Logo Header */}
        <div className="text-center">
          <button onClick={() => onNavigate('landing')} className="inline-flex items-center gap-2 mb-4">
            <LogoIcon className="h-9 w-9 shadow-xs" />
          </button>
          <h2 className="font-display text-[26px] font-semibold text-[color:var(--foreground)] tracking-tight">
            {authMode === 'login' && 'Log in to VoCall'}
            {authMode === 'signup' && 'Create your VoCall account'}
            {authMode === 'reset' && 'Reset your password'}
          </h2>
          <p className="mt-1.5 text-[13.5px] text-[color:var(--muted-foreground)]">
            {authMode === 'login' && 'Enterprise Voice AI Platform with Memory & Emotion'}
            {authMode === 'signup' && 'First 100 minutes free · No credit card required'}
            {authMode === 'reset' && 'Enter your work email to receive a password reset link'}
          </p>
        </div>

        {/* Form Body */}
        {!resetSent ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-[13px]">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[color:var(--muted-foreground)] mb-1 font-mono">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[color:var(--muted-foreground)]" />
                <input
                  type="email"
                  required
                  placeholder="alex@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[color:var(--border)] bg-white py-2.5 pl-10 pr-4 text-[13px] outline-none focus:border-[color:var(--accent)]"
                />
              </div>
            </div>

            {authMode !== 'reset' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-[color:var(--muted-foreground)] font-mono">
                    Password
                  </label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setAuthMode('reset')}
                      className="text-[11.5px] text-[color:var(--accent)] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[color:var(--muted-foreground)]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-[color:var(--border)] bg-white py-2.5 pl-10 pr-4 text-[13px] outline-none focus:border-[color:var(--accent)]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--foreground)] text-white text-[14px] font-medium transition hover:opacity-90 shadow-md"
            >
              {authMode === 'login' && 'Log In'}
              {authMode === 'signup' && 'Sign Up & Continue'}
              {authMode === 'reset' && 'Send Reset Link'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <div className="mt-6 py-6 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-[color:var(--accent)] mb-3" />
            <h3 className="font-display text-[18px] font-semibold">Password Reset Sent</h3>
            <p className="mt-2 text-[13px] text-[color:var(--muted-foreground)]">
              Check <span className="font-medium text-[color:var(--foreground)]">{email}</span> for instructions.
            </p>
            <button
              onClick={() => {
                setResetSent(false);
                setAuthMode('login');
              }}
              className="mt-6 inline-flex h-9 items-center justify-center rounded-full bg-[color:var(--foreground)] px-6 text-[13px] font-medium text-white"
            >
              Return to Login
            </button>
          </div>
        )}

        {/* Footer Toggle */}
        <div className="mt-6 border-t border-[color:var(--border)] pt-4 text-center text-[12.5px] text-[color:var(--muted-foreground)]">
          {authMode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button onClick={() => setAuthMode('signup')} className="font-medium text-[color:var(--accent)] hover:underline">
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button onClick={() => setAuthMode('login')} className="font-medium text-[color:var(--accent)] hover:underline">
                Log in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
