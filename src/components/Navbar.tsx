import { useState, useEffect } from 'react';
import { Phone, ArrowRight, Menu, X, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  onNavClick: (sectionId: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSignInClick: () => void;
}

export default function Navbar({ onNavClick, theme, onToggleTheme, onSignInClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', id: 'features' },
    { label: 'Overview', id: 'overview' },
    { label: 'Analytics', id: 'analytics' },
    { label: 'Integrations', id: 'integrations' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'FAQ', id: 'faq' },
  ];

  const handleLinkClick = (id: string) => {
    setMobileMenuOpen(false);
    onNavClick(id);
  };

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: scrolled ? 'rgba(252, 251, 248, 0.8)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent',
        transition: 'var(--transition-smooth)',
        padding: scrolled ? '16px 0' : '24px 0',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('hero');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '1.25rem',
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}
          >
            <Phone size={16} strokeWidth={2.5} />
          </div>
          VoCall
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-color)',
              alignSelf: 'flex-end',
              marginBottom: '6px',
            }}
          />
        </a>

        {/* Desktop Links */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '32px',
          }}
          className="desktop-only-flex"
        >
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(link.id);
              }}
              style={{
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '12px',
          }}
          className="desktop-only-flex"
        >
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="btn btn-secondary"
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button className="btn btn-text" style={{ fontSize: '0.9rem' }} onClick={onSignInClick}>
            Sign In
          </button>
          <button
            className="btn btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            onClick={() => handleLinkClick('contact')}
          >
            Request Demo
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-only"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-primary)',
          }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            backgroundColor: 'var(--surface-color)',
            borderBottom: '1px solid var(--border-color)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: 'var(--shadow-premium)',
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(link.id);
              }}
              style={{
                fontSize: '1rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                paddingBottom: '8px',
                borderBottom: '1px solid rgba(0,0,0,0.02)',
              }}
            >
              {link.label}
            </a>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            {/* Theme Toggle Button (Mobile) */}
            <button
              className="btn btn-secondary"
              style={{ width: '100%', gap: '8px' }}
              onClick={onToggleTheme}
            >
              {theme === 'light' ? (
                <>
                  <Moon size={16} />
                  Dark Mode
                </>
              ) : (
                <>
                  <Sun size={16} />
                  Light Mode
                </>
              )}
            </button>

            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={onSignInClick}>
              Sign In
            </button>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => handleLinkClick('contact')}
            >
              Request Demo
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Embedded CSS for media queries in vanilla React */}
      <style>{`
        @media (min-width: 769px) {
          .desktop-only-flex {
            display: flex !important;
          }
          .mobile-only {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .desktop-only-flex {
            display: none !important;
          }
          .mobile-only {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}
