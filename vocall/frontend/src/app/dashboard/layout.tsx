'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Bot,
  FolderKanban,
  Users,
  PhoneCall,
  BarChart3,
  Workflow,
  KeyRound,
  Settings,
  Plus,
  Search,
  ChevronDown,
  LogOut,
  User,
  Phone,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Space {
  id: string;
  name: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>('User');
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [spaceDropdownOpen, setSpaceDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Spaces state
  const [spaces, setSpaces] = useState<Space[]>([
    { id: '1', name: 'General' },
    { id: '2', name: 'Sales Voice AI' },
    { id: '3', name: 'Support Hotline' },
  ]);
  const [currentSpace, setCurrentSpace] = useState<Space>(spaces[0]);

  useEffect(() => {
    async function loadUserData() {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        setUserEmail(authData.user.email || null);
        setUserName(
          authData.user.user_metadata?.full_name ||
            authData.user.email?.split('@')[0] ||
            'User'
        );

        // Fetch user profile & spaces from Supabase DB
        const { data: profile } = await (supabase.from('profiles') as any)
          .select('org_id, name')
          .eq('id', authData.user.id)
          .single();

        const profileData = profile as any;
        if (profileData?.org_id) {
          const { data: dbSpaces } = await (supabase.from('spaces') as any)
            .select('id, name')
            .eq('org_id', profileData.org_id);

          const spacesList = dbSpaces as any[];
          if (spacesList && spacesList.length > 0) {
            setSpaces(spacesList);
            setCurrentSpace(spacesList[0]);
          }
        }
      }
    }
    loadUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Nav item definition
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Agents', href: '/dashboard/agents', icon: Bot },
    { name: 'Spaces', href: '/dashboard/spaces', icon: FolderKanban },
    { name: 'Contacts', href: '/dashboard/contacts', icon: Users },
    { name: 'Calls', href: '/dashboard/calls', icon: PhoneCall },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Connectors', href: '/dashboard/connectors', icon: Workflow },
    { name: 'API Keys', href: '/dashboard/settings/api-keys', icon: KeyRound },
    { name: 'Settings', href: '/dashboard/settings/telephony', icon: Settings },
  ];

  // Helper for active link checking
  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  // Contextual secondary panel list renderer
  const renderSecondaryPanelContent = () => {
    if (pathname.startsWith('/dashboard/agents')) {
      return (
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
            Active Agents
          </div>
          {[
            { id: '1', name: 'Inbound Customer Support', status: 'Live' },
            { id: '2', name: 'Outbound Sales SDR', status: 'Draft' },
            { id: '3', name: 'Appointment Scheduler', status: 'Live' },
          ]
            .filter((item) =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((agent) => (
              <Link
                key={agent.id}
                href={`/dashboard/agents/${agent.id}`}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === `/dashboard/agents/${agent.id}`
                    ? 'bg-[#7C3AED]/20 text-[#A78BFA] font-medium border border-[#7C3AED]/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{agent.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      agent.status === 'Live'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>
              </Link>
            ))}
        </div>
      );
    }

    if (pathname.startsWith('/dashboard/contacts')) {
      return (
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
            Recent Contacts
          </div>
          {[
            { id: '1', name: 'Alex Johnson', phone: '+1 555-0192' },
            { id: '2', name: 'Sarah Miller', phone: '+1 555-0143' },
            { id: '3', name: 'David Smith', phone: '+1 555-0188' },
          ]
            .filter((item) =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((contact) => (
              <Link
                key={contact.id}
                href={`/dashboard/contacts/${contact.id}`}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === `/dashboard/contacts/${contact.id}`
                    ? 'bg-[#7C3AED]/20 text-[#A78BFA] font-medium border border-[#7C3AED]/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="font-medium truncate">{contact.name}</div>
                <div className="text-xs text-slate-500 truncate">{contact.phone}</div>
              </Link>
            ))}
        </div>
      );
    }

    if (pathname.startsWith('/dashboard/calls')) {
      return (
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
            Call History
          </div>
          {[
            { id: '1', caller: 'Alex Johnson', duration: '2m 45s', status: 'Completed' },
            { id: '2', caller: 'Unknown (+1 555-0143)', duration: '0m 12s', status: 'Missed' },
            { id: '3', caller: 'Sarah Miller', duration: '5m 10s', status: 'Completed' },
          ]
            .filter((item) =>
              item.caller.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((call) => (
              <Link
                key={call.id}
                href={`/dashboard/calls/${call.id}`}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === `/dashboard/calls/${call.id}`
                    ? 'bg-[#7C3AED]/20 text-[#A78BFA] font-medium border border-[#7C3AED]/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="truncate text-slate-200">{call.caller}</span>
                  <span className="text-slate-500">{call.duration}</span>
                </div>
              </Link>
            ))}
        </div>
      );
    }

    if (pathname.startsWith('/dashboard/spaces')) {
      return (
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
            Workspace Spaces
          </div>
          {spaces.map((sp) => (
            <button
              key={sp.id}
              onClick={() => setCurrentSpace(sp)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                currentSpace.id === sp.id
                  ? 'bg-[#7C3AED]/20 text-[#A78BFA] font-medium border border-[#7C3AED]/30'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <FolderKanban className="w-4 h-4 text-slate-400" />
              <span className="truncate">{sp.name}</span>
            </button>
          ))}
        </div>
      );
    }

    if (pathname.startsWith('/dashboard/settings')) {
      return (
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
            Settings Menu
          </div>
          <Link
            href="/dashboard/settings/api-keys"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === '/dashboard/settings/api-keys'
                ? 'bg-[#7C3AED]/20 text-[#A78BFA] font-medium border border-[#7C3AED]/30'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>API Keys</span>
          </Link>
          <Link
            href="/dashboard/settings/telephony"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === '/dashboard/settings/telephony'
                ? 'bg-[#7C3AED]/20 text-[#A78BFA] font-medium border border-[#7C3AED]/30'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Telephony & Twilio</span>
          </Link>
        </div>
      );
    }

    // Default overview list
    return (
      <div className="space-y-3 px-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Quick Access
        </div>
        <Link
          href="/dashboard/agents"
          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 transition-colors border border-slate-800"
        >
          <span className="text-xs font-medium text-slate-300">Voice Agents</span>
          <span className="text-xs bg-[#7C3AED]/30 text-[#A78BFA] px-2 py-0.5 rounded-full font-semibold">
            3 Active
          </span>
        </Link>
        <Link
          href="/dashboard/calls"
          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 transition-colors border border-slate-800"
        >
          <span className="text-xs font-medium text-slate-300">Total Calls</span>
          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
            128
          </span>
        </Link>
      </div>
    );
  };

  // Button label based on section
  const getNewButtonText = () => {
    if (pathname.startsWith('/dashboard/agents')) return '+ New Agent';
    if (pathname.startsWith('/dashboard/contacts')) return '+ New Contact';
    if (pathname.startsWith('/dashboard/spaces')) return '+ New Space';
    if (pathname.startsWith('/dashboard/connectors')) return '+ New Connector';
    return '+ New Agent';
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* ==================================================================== */}
      {/* 1. LEFT SIDEBAR (60px, ICON ONLY, TOOLTIPS ON HOVER)                  */}
      {/* ==================================================================== */}
      <aside className="w-[60px] flex-shrink-0 bg-slate-950 border-r border-slate-800/80 flex flex-col items-center justify-between py-4 z-20">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* App Logo Icon */}
          <Link href="/dashboard" className="group relative flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED] flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-[#7C3AED]/30 group-hover:scale-105 transition-transform">
              V
            </div>
            <span className="absolute left-14 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap z-50">
              VoCall Home
            </span>
          </Link>

          {/* Navigation Icons */}
          <nav className="flex flex-col items-center gap-2 w-full px-2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group relative flex items-center justify-center w-full"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      active
                        ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/40'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>

                  {/* Hover Tooltip */}
                  <span className="absolute left-14 hidden group-hover:block bg-slate-900 border border-slate-700 text-white text-xs px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap z-50">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Avatar Dropdown at Bottom */}
        <div className="relative group w-full flex justify-center">
          <button
            onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
            className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-[#A78BFA] hover:border-[#7C3AED] transition-colors"
          >
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </button>

          {/* Dropdown Menu */}
          {avatarDropdownOpen && (
            <div className="absolute bottom-12 left-12 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 space-y-1">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-semibold text-white truncate">{userName}</p>
                <p className="text-[10px] text-slate-400 truncate">{userEmail || 'user@vocall.ai'}</p>
              </div>

              <Link
                href="/dashboard/settings/telephony"
                onClick={() => setAvatarDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile & Settings</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* 2. SECOND PANEL (240px, SPACE SWITCHER + SEARCH + CONTEXT LIST)       */}
      {/* ==================================================================== */}
      <div className="w-[240px] flex-shrink-0 bg-slate-900/60 border-r border-slate-800/80 flex flex-col py-4 px-3 gap-4 z-10">
        {/* Space Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSpaceDropdownOpen(!spaceDropdownOpen)}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-200 border border-slate-800 text-sm font-medium transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <Building className="w-4 h-4 text-[#A78BFA]" />
              <span className="truncate">{currentSpace.name}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </button>

          {spaceDropdownOpen && (
            <div className="absolute top-11 left-0 w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-50 space-y-0.5">
              <div className="text-[10px] font-semibold text-slate-500 px-3 py-1 uppercase">
                Switch Space
              </div>
              {spaces.map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => {
                    setCurrentSpace(sp);
                    setSpaceDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors ${
                    currentSpace.id === sp.id
                      ? 'bg-[#7C3AED]/20 text-[#A78BFA] font-medium'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{sp.name}</span>
                </button>
              ))}
              <Link
                href="/dashboard/spaces"
                onClick={() => setSpaceDropdownOpen(false)}
                className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#A78BFA] hover:bg-slate-800 flex items-center gap-2 border-t border-slate-800 mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manage Spaces</span>
              </Link>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-xs bg-slate-950/60 border-slate-800"
          />
        </div>

        {/* Action Button */}
        <Button
          onClick={() => {
            if (pathname.startsWith('/dashboard/agents')) router.push('/dashboard/agents');
            else if (pathname.startsWith('/dashboard/contacts')) router.push('/dashboard/contacts');
            else if (pathname.startsWith('/dashboard/spaces')) router.push('/dashboard/spaces');
          }}
          className="w-full h-9 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-md shadow-[#7C3AED]/20 flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{getNewButtonText()}</span>
        </Button>

        {/* Contextual Secondary Panel Section */}
        <div className="flex-1 overflow-y-auto pr-1 text-xs space-y-2 mt-2">
          {renderSecondaryPanelContent()}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. MAIN PANEL (FILLS REMAINING WIDTH)                                 */}
      {/* ==================================================================== */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
        {children}
      </main>
    </div>
  );
}
