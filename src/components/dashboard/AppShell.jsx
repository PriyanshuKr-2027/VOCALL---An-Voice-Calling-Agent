import React, { useState } from 'react';
import { LogoIcon } from '../UIPrimitives';
import { 
  LayoutGrid, 
  Bot, 
  Layers, 
  Users, 
  Phone, 
  BarChart3, 
  Plug, 
  Settings, 
  Key, 
  Plus, 
  Search, 
  ChevronDown, 
  User, 
  LogOut, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export function AppShell({ activeRoute, onNavigate, children, spaces, activeSpace, onSelectSpace, agents, contacts, calls }) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [spaceDropdownOpen, setSpaceDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'agents', label: 'Agents', icon: Bot },
    { id: 'spaces', label: 'Spaces', icon: Layers },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'calls', label: 'Calls', icon: Phone },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'connectors', label: 'Connectors', icon: Plug },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'api-keys', label: 'API Keys', icon: Key }
  ];

  const handleNewAction = () => {
    if (activeRoute.startsWith('agent')) {
      onNavigate('agent-builder', { agentId: 'new' });
    } else if (activeRoute.startsWith('contact')) {
      onNavigate('contacts', { openAddModal: true });
    } else {
      onNavigate('agent-builder', { agentId: 'new' });
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[color:var(--background)] text-[color:var(--foreground)] selection:bg-[color:var(--accent)]/20">
      {/* PANEL 1: Leftmost Sidebar (60px) */}
      <aside className="flex h-full w-[60px] flex-col items-center justify-between border-r border-[color:var(--border)] bg-[color:var(--surface)] py-4 z-20">
        {/* Top Logo */}
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={() => onNavigate('landing')}
            title="Return to VoCall Homepage"
            className="grid h-10 w-10 place-items-center rounded-xl transition hover:scale-105"
          >
            <LogoIcon className="h-7 w-7 shadow-xs" />
          </button>

          {/* Navigation Icons List */}
          <nav className="flex flex-col items-center gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = activeRoute.startsWith(item.id);
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={item.label}
                  className={`group relative grid h-10 w-10 place-items-center rounded-xl transition ${
                    isActive
                      ? 'bg-[color:var(--foreground)] text-[color:var(--surface)] shadow-sm'
                      : 'text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)] hover:text-[color:var(--foreground)]'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {/* Tooltip */}
                  <span className="absolute left-14 hidden rounded-md bg-black px-2 py-1 text-[11px] font-medium text-white group-hover:block z-50 whitespace-nowrap shadow-md">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--accent)] text-white font-display text-[13px] font-semibold shadow-sm transition hover:opacity-90"
            title="Priyanshu Kumar (Owner)"
          >
            PK
          </button>

          {userDropdownOpen && (
            <div className="absolute bottom-12 left-2 z-50 w-48 rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-1.5 shadow-xl animate-in fade-in zoom-in-95">
              <div className="border-b border-[color:var(--border)] px-3 py-2 text-[12px]">
                <div className="font-semibold text-[color:var(--foreground)]">Priyanshu Kumar</div>
                <div className="text-[10.5px] text-[color:var(--muted-foreground)]">priyanshu@vocall.io</div>
              </div>
              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  onNavigate('settings');
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[12.5px] text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
              >
                <User className="h-3.5 w-3.5" /> Org Profile
              </button>
              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  onNavigate('landing');
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[12.5px] text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-3.5 w-3.5" /> Log out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* PANEL 2: Second Contextual Panel (240px) */}
      <aside className="hidden h-full w-[240px] flex-col border-r border-[color:var(--border)] bg-[color:var(--surface)] p-4 md:flex z-10">
        {/* Space Switcher */}
        <div className="relative">
          <button
            onClick={() => setSpaceDropdownOpen(!spaceDropdownOpen)}
            className="flex w-full items-center justify-between rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2 text-[13px] font-medium text-[color:var(--foreground)] shadow-xs transition hover:border-[color:var(--accent)]"
          >
            <span className="flex items-center gap-2 truncate">
              <span className="h-2 w-2 rounded-full bg-[color:var(--accent)]"></span>
              {activeSpace || 'General Space'}
            </span>
            <ChevronDown className="h-4 w-4 text-[color:var(--muted-foreground)]" />
          </button>

          {spaceDropdownOpen && (
            <div className="absolute left-0 top-11 z-50 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] p-1.5 shadow-lg">
              {(spaces || ['General Space', 'Production Support', 'Sales Pipeline']).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onSelectSpace(s);
                    setSpaceDropdownOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[12.5px] text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
                >
                  {s}
                  {s === activeSpace && <span className="text-[10px] text-[color:var(--accent)] font-semibold">Active</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search & New Button */}
        <div className="mt-4 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[color:var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search space..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] py-1.5 pl-8 pr-3 text-[12px] text-[color:var(--foreground)] outline-none focus:border-[color:var(--accent)]"
            />
          </div>

          <button
            onClick={handleNewAction}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[color:var(--foreground)] py-2 text-[12.5px] font-medium text-[color:var(--surface)] transition hover:opacity-90 shadow-xs"
          >
            <Plus className="h-4 w-4" /> + New Item
          </button>
        </div>

        {/* Contextual Navigation List */}
        <div className="mt-6 flex-1 overflow-y-auto space-y-1">
          <div className="px-2 text-[10.5px] font-semibold uppercase tracking-wider text-[color:var(--muted-foreground)] font-mono">
            {activeRoute.startsWith('agent') ? 'Agents' : activeRoute.startsWith('contact') ? 'Contacts' : activeRoute.startsWith('call') ? 'Calls' : 'Workspace'}
          </div>

          {activeRoute.startsWith('agent') && agents?.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onNavigate('agent-builder', { agentId: agent.id })}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[12.5px] transition ${
                activeRoute.includes(agent.id)
                  ? 'bg-[color:var(--muted)] font-medium text-[color:var(--foreground)]'
                  : 'text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)]/50'
              }`}
            >
              <span className="truncate">{agent.name}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]"></span>
            </button>
          ))}

          {activeRoute.startsWith('contact') && contacts?.map((c) => (
            <button
              key={c.id}
              onClick={() => onNavigate('contact-detail', { contactId: c.id })}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[12.5px] text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)]/50"
            >
              <span className="truncate">{c.name}</span>
              <span className="text-[10px] text-[color:var(--muted-foreground)] font-mono">{c.phone.slice(-4)}</span>
            </button>
          ))}

          {(!activeRoute.startsWith('agent') && !activeRoute.startsWith('contact')) && (
            <div className="pt-2 space-y-1 text-[12.5px]">
              <button onClick={() => onNavigate('dashboard')} className="w-full text-left px-3 py-1.5 rounded-lg text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)]/50">
                Dashboard Overview
              </button>
              <button onClick={() => onNavigate('analytics')} className="w-full text-left px-3 py-1.5 rounded-lg text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)]/50">
                Analytics Reports
              </button>
              <button onClick={() => onNavigate('api-keys')} className="w-full text-left px-3 py-1.5 rounded-lg text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)]/50">
                API Key Credentials
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* PANEL 3: Main Panel */}
      <main className="flex-1 h-full overflow-y-auto bg-[color:var(--background)]">
        {children}
      </main>
    </div>
  );
}
