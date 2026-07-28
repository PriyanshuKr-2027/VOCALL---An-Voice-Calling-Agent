import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowLeft, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AuthPagesProps {
  initialView: 'login' | 'signup' | 'reset-password';
  onBackToHome: () => void;
  onLoginSuccess?: () => void;
}

export default function AuthPages({ initialView, onBackToHome, onLoginSuccess }: AuthPagesProps) {
  const [view, setView] = useState<'login' | 'signup' | 'reset'>(
    initialView === 'reset-password' ? 'reset' : initialView
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || password.length < 6) {
      setAuthStatus('error');
      setErrorMessage('Please enter a valid email and a password with at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setAuthStatus('idle');

    // Simulate network latency
    setTimeout(() => {
      setIsLoading(false);
      setAuthStatus('success');
      if (view === 'login') {
        setSuccessMessage('Successfully authenticated. Redirecting to workspace...');
        if (onLoginSuccess) {
          setTimeout(onLoginSuccess, 1000);
        }
      } else if (view === 'signup') {
        setSuccessMessage('Account created successfully. Please verify your email.');
      } else {
        setSuccessMessage('Password reset link dispatched. Please check your inbox.');
      }
    }, 1500);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setAuthStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setAuthStatus('idle');

    setTimeout(() => {
      setIsLoading(false);
      setAuthStatus('success');
      setSuccessMessage('A password reset link has been dispatched to your inbox.');
    }, 1500);
  };

  const switchView = (newView: 'login' | 'signup' | 'reset') => {
    setView(newView);
    setAuthStatus('idle');
    setErrorMessage('');
    setSuccessMessage('');
    setEmail('');
    setPassword('');
  };

  const fadeVariant = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
    transition: { duration: 0.3 }
  };

  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-primary)',
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* Back to Home Button */}
      <button
        onClick={onBackToHome}
        style={{
          position: 'absolute',
          top: '32px',
          left: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: 500,
          color: 'var(--text-secondary)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          transition: 'var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.backgroundColor = 'var(--surface-color)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <ArrowLeft size={16} />
        Back to Home
      </button>

      {/* Main Container */}
      <div style={{ width: '100%', maxWidth: '420px' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--accent-color)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              marginBottom: '16px',
            }}
          >
            <Phone size={20} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '6px' }}>VoCall</h1>
          <p style={{ fontSize: '0.875rem' }}>Enterprise AI Voice Agent Platform</p>
        </div>

        {/* Card Body */}
        <div
          className="premium-card"
          style={{
            padding: '36px',
            backgroundColor: 'var(--card-color)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-premium)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <AnimatePresence mode="wait">
            
            {/* LOGIN VIEW */}
            {view === 'login' && (
              <motion.div key="login" {...fadeVariant}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px' }}>Sign in to your account</h2>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Email address</label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--surface-color)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontSize: '0.9rem',
                        transition: 'var(--transition-fast)',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--accent-color)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Password</label>
                      <button
                        type="button"
                        onClick={() => switchView('reset')}
                        style={{ background: 'none', border: 'none', fontSize: '0.78rem', color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 500 }}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--surface-color)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontSize: '0.9rem',
                        transition: 'var(--transition-fast)',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--accent-color)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || authStatus === 'success'}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '8px', padding: '12px', fontSize: '0.9rem', gap: '8px' }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    Don't have an account?{' '}
                    <button
                      onClick={() => switchView('signup')}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      Sign up
                    </button>
                  </span>
                </div>
              </motion.div>
            )}

            {/* SIGNUP VIEW */}
            {view === 'signup' && (
              <motion.div key="signup" {...fadeVariant}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px' }}>Create your organization</h2>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Email address</label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--surface-color)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontSize: '0.9rem',
                        transition: 'var(--transition-fast)',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--accent-color)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Password (min. 6 characters)</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--surface-color)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontSize: '0.9rem',
                        transition: 'var(--transition-fast)',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--accent-color)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || authStatus === 'success'}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '8px', padding: '12px', fontSize: '0.9rem', gap: '8px' }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Sign Up'
                    )}
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <button
                      onClick={() => switchView('login')}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      Log in
                    </button>
                  </span>
                </div>
              </motion.div>
            )}

            {/* PASSWORD RESET VIEW */}
            {view === 'reset' && (
              <motion.div key="reset" {...fadeVariant}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px' }}>Reset your password</h2>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  Provide your account email address. We will dispatch a secure link to reset your password credentials.
                </p>
                
                <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Email address</label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--surface-color)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontSize: '0.9rem',
                        transition: 'var(--transition-fast)',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--accent-color)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || authStatus === 'success'}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '8px', padding: '12px', fontSize: '0.9rem', gap: '8px' }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending link...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <button
                    onClick={() => switchView('login')}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontWeight: 600, cursor: 'pointer', fontSize: '0.825rem' }}
                  >
                    Back to Log In
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Validation & Feedback Banners */}
          <AnimatePresence>
            {authStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  backgroundColor: 'var(--green-soft)',
                  color: 'var(--green-accent)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(45, 157, 120, 0.15)',
                  fontSize: '0.8rem',
                  overflow: 'hidden',
                }}
              >
                <CheckCircle2 size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{successMessage}</span>
              </motion.div>
            )}

            {authStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  backgroundColor: 'var(--red-soft)',
                  color: 'var(--red-accent)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(201, 76, 76, 0.15)',
                  fontSize: '0.8rem',
                  overflow: 'hidden',
                }}
              >
                <ShieldAlert size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
