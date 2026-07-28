import { useState } from 'react';
import {
  LayoutGrid,
  Bot,
  Columns3,
  Users,
  Phone,
  BarChart3,
  Plug,
  Settings,
  Search,
  Plus,
  LogOut,
  Moon,
  Sun,
  User,
  ChevronDown
} from 'lucide-react';

interface DashboardShellProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  orgName: string;
  logoUrl: string | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
  children: React.ReactNode;
  
  // Lists for Context Panel 2
  agentsList: any[];
  onSelectAgent: (id: string) => void;
  selectedAgentId: string | null;
  onNewAgentClick: () => void;

  contactsList: any[];
  onSelectContact: (id: string) => void;
  selectedContactId: string | null;
  onNewContactClick: () => void;

  callsList: any[];
  onSelectCall: (id: string) => void;
  selectedCallId: string | null;
}

export default function DashboardShell({
  activeSection,
  onSectionChange,
  orgName,
  logoUrl,
  theme,
  onToggleTheme,
  onLogout,
  children,
  agentsList,
  onSelectAgent,
  selectedAgentId,
  onNewAgentClick,
  contactsList,
  onSelectContact,
  selectedContactId,
  onNewContactClick,
  callsList,
  onSelectCall,
  selectedCallId
}: DashboardShellProps) {
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [spaceDropdownOpen, setSpaceDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sidebarItems = [
    { id: 'home', icon: LayoutGrid, label: 'Dashboard' },
    { id: 'agents', icon: Bot, label: 'Agents' },
    { id: 'spaces', icon: Columns3, label: 'Spaces' },
    { id: 'contacts', icon: Users, label: 'Contacts' },
    { id: 'calls', icon: Phone, label: 'Calls' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'connectors', icon: Plug, label: 'Connectors' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
        transition: 'background-color 0.3s ease',
      }}
    >
      
      {/* PANEL 1: Left Sidebar (60px) */}
      <aside
        style={{
          width: '60px',
          backgroundColor: 'var(--surface-color)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px 0',
          justifyContent: 'space-between',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
          {/* Brand Logo / Onboarding Logo */}
          <div
            onClick={() => onSectionChange('home')}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
              overflow: 'hidden',
            }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Phone size={16} />
            )}
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center' }}>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? 'var(--accent-light)' : 'transparent',
                    color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'var(--transition-fast)',
                  }}
                  title={item.label}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions (Theme toggle, User Avatar dropdown) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '100%', position: 'relative' }}>
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* User Avatar Circular preview */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent-color)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              U
            </button>

            {avatarDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '12px',
                  marginBottom: '8px',
                  width: '160px',
                  backgroundColor: 'var(--card-color)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-premium)',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 100,
                }}
              >
                <div style={{ padding: '6px 8px', fontSize: '0.75rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  Signed in as <strong>Admin</strong>
                </div>
                <button
                  onClick={() => {
                    setAvatarDropdownOpen(false);
                    onSectionChange('settings');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-color)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <User size={14} />
                  Org Profile
                </button>
                <button
                  onClick={() => {
                    setAvatarDropdownOpen(false);
                    onLogout();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--red-accent)',
                    textAlign: 'left',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--red-soft)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOut size={14} />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* PANEL 2: Context List (240px) */}
      <aside
        style={{
          width: '240px',
          backgroundColor: 'var(--surface-color)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 5,
        }}
      >
        {/* Space Name switcher header */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
          <button
            onClick={() => setSpaceDropdownOpen(!spaceDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              padding: '4px 0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Columns3 size={16} style={{ color: 'var(--accent-color)' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                {orgName}
              </span>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
          </button>

          {spaceDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '16px',
                right: '16px',
                backgroundColor: 'var(--card-color)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-premium)',
                padding: '6px',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              {['General Workspace', 'Prod Sandbox', 'Sales Dev Trunks'].map((space) => (
                <button
                  key={space}
                  onClick={() => setSpaceDropdownOpen(false)}
                  style={{
                    padding: '8px 10px',
                    fontSize: '0.78rem',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    width: '100%',
                    cursor: 'pointer',
                    borderRadius: '4px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-color)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {space}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Context Content List */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          
          {/* SEARCH BAR (Used on Agents, Contacts, Calls settings) */}
          {(activeSection === 'agents' || activeSection === 'contacts' || activeSection === 'calls') && (
            <div style={{ padding: '12px 16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--card-color)',
                  border: '1px solid var(--border-color)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  placeholder={`Search ${activeSection}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    width: '100%',
                    fontSize: '0.78rem',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>
          )}

          {/* LISTS */}
          <div style={{ flex: 1, padding: '8px' }}>
            
            {/* AGENTS LIST */}
            {activeSection === 'agents' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {agentsList
                  .filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((agent) => {
                    const isSelected = selectedAgentId === agent.id;
                    return (
                      <button
                        key={agent.id}
                        onClick={() => onSelectAgent(agent.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          border: isSelected ? '1px solid var(--accent-color)' : '1px solid transparent',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isSelected ? 'var(--accent-light)' : 'transparent',
                          color: isSelected ? 'var(--accent-color)' : 'var(--text-primary)',
                          fontWeight: isSelected ? 600 : 500,
                          textAlign: 'left',
                          width: '100%',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: agent.status === 'active' ? 'var(--green-accent)' : 'var(--text-tertiary)', flexShrink: 0 }}></span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</span>
                        </div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{agent.voice}</span>
                      </button>
                    );
                  })}
                <button
                  onClick={onNewAgentClick}
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '10px', fontSize: '0.75rem', gap: '6px', marginTop: '12px' }}
                >
                  <Plus size={14} />
                  New Agent
                </button>
              </div>
            )}

            {/* CONTACTS LIST */}
            {activeSection === 'contacts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {contactsList
                  .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((contact) => {
                    const isSelected = selectedContactId === contact.id;
                    return (
                      <button
                        key={contact.id}
                        onClick={() => onSelectContact(contact.id)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          padding: '10px 12px',
                          border: isSelected ? '1px solid var(--accent-color)' : '1px solid transparent',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isSelected ? 'var(--accent-light)' : 'transparent',
                          color: 'var(--text-primary)',
                          textAlign: 'left',
                          width: '100%',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontWeight: isSelected ? 600 : 500, color: isSelected ? 'var(--accent-color)' : 'var(--text-primary)' }}>
                          {contact.name}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                          {contact.phone}
                        </span>
                      </button>
                    );
                  })}
                <button
                  onClick={onNewContactClick}
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '10px', fontSize: '0.75rem', gap: '6px', marginTop: '12px' }}
                >
                  <Plus size={14} />
                  Add Contact
                </button>
              </div>
            )}

            {/* CALLS LIST */}
            {activeSection === 'calls' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {callsList
                  .filter((c) => c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) || c.agentName.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((call) => {
                    const isSelected = selectedCallId === call.id;
                    const dateObj = new Date(call.date);
                    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return (
                      <button
                        key={call.id}
                        onClick={() => onSelectCall(call.id)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          padding: '10px 12px',
                          border: isSelected ? '1px solid var(--accent-color)' : '1px solid transparent',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isSelected ? 'var(--accent-light)' : 'transparent',
                          color: 'var(--text-primary)',
                          textAlign: 'left',
                          width: '100%',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <span style={{ fontWeight: isSelected ? 600 : 500, color: isSelected ? 'var(--accent-color)' : 'var(--text-primary)' }}>
                            {call.contactName}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{formattedDate}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                          <span>{call.agentName}</span>
                          <span style={{ color: call.status === 'completed' ? 'var(--green-accent)' : 'var(--red-accent)' }}>
                            {call.duration}
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}

            {/* STATIC SUB-ROUTER FOLDERS FOR SETTINGS */}
            {activeSection === 'settings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '6px 12px', textTransform: 'uppercase' }}>
                  Admin Categories
                </div>
                {[
                  { id: 'settings', label: 'Org Settings' },
                  { id: 'api-keys', label: 'API Credentials' },
                  { id: 'telephony', label: 'KYC Telephony' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onSectionChange(s.id)}
                    style={{
                      padding: '8px 12px',
                      fontSize: '0.8rem',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                      width: '100%',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-color)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {/* DEFAULT OTHER SECTIONS */}
            {(activeSection === 'home' || activeSection === 'spaces' || activeSection === 'analytics' || activeSection === 'connectors' || activeSection === 'api-keys' || activeSection === 'telephony') && (
              <div style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.75rem', textAlign: 'center' }}>
                Quick view items are listed in the main workspace panel.
              </div>
            )}

          </div>

        </div>
      </aside>

      {/* PANEL 3: Main Working Panel Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--card-color)' }}>
        {children}
      </main>

    </div>
  );
}
