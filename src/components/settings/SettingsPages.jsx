import React, { useState } from 'react';
import { Key, Phone, ShieldCheck, Upload, Trash2, Plus, CheckCircle2, UserCheck, Layers, Building } from 'lucide-react';

export function SettingsPages({ subroute = 'org', apiKeys, numbers, spaces, onNavigate }) {
  const [keysList, setKeysList] = useState(apiKeys);
  const [numbersList, setNumbersList] = useState(numbers);
  const [spacesList, setSpacesList] = useState(spaces || ['General Space', 'Production Support', 'Sales Pipeline']);
  const [kycStatus, setKycStatus] = useState('Submitted (Under Verification)');
  const [kycDoc, setKycDoc] = useState(null);

  const handleSaveKey = (provider, newKey) => {
    setKeysList(keysList.map(k => k.provider === provider ? { ...k, key: newKey, status: newKey ? 'Connected' : 'Not Configured' } : k));
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto pb-24">
      {/* Settings Sub-Nav Tabs */}
      <div className="flex gap-2 border-b border-[color:var(--border)] pb-2 text-[13px] font-medium text-[color:var(--muted-foreground)]">
        {[
          { id: 'org', label: 'Organization Settings' },
          { id: 'api-keys', label: 'API Key Credentials' },
          { id: 'telephony', label: 'Telephony & KYC' },
          { id: 'spaces', label: 'Spaces' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id === 'org' ? 'settings' : tab.id === 'api-keys' ? 'api-keys' : tab.id === 'telephony' ? 'settings-telephony' : 'spaces')}
            className={`px-4 py-1.5 rounded-lg transition ${
              (subroute === tab.id || (subroute === 'telephony' && tab.id === 'telephony'))
                ? 'bg-[color:var(--foreground)] text-white font-medium shadow-xs'
                : 'hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUBROUTE 1: API Key Credentials */}
      {subroute === 'api-keys' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-[22px] font-semibold">BYOK Model & Telephony Credentials</h2>
            <p className="mt-1 text-[13px] text-[color:var(--muted-foreground)]">VoCall never marks up model or carrier costs. Supply your API keys below.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {keysList.map((item) => (
              <div key={item.provider} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="font-display text-[15px] font-semibold text-[color:var(--foreground)]">{item.provider}</div>
                  <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold ${
                    item.status === 'Connected' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-[12px] text-[color:var(--muted-foreground)]">{item.desc}</p>

                {/* Meter for Hume AI */}
                {item.provider === 'Hume AI' && (
                  <div className="space-y-1 text-[11px] font-mono border-t border-[color:var(--border)] pt-2 text-[color:var(--muted-foreground)]">
                    <div>Chars: {item.charsUsed} / {item.charsLimit}</div>
                    <div>EVI Mins: {item.minutesUsed} / {item.minutesLimit}</div>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="password"
                    defaultValue={item.key}
                    placeholder="Enter API key..."
                    onChange={(e) => handleSaveKey(item.provider, e.target.value)}
                    className="flex-1 rounded-xl border border-[color:var(--border)] bg-white px-3 py-1.5 font-mono text-[12px] outline-none focus:border-[color:var(--accent)]"
                  />
                  <button className="rounded-xl bg-[color:var(--foreground)] px-3 py-1.5 text-[12px] font-medium text-white">Save</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBROUTE 2: Telephony & KYC */}
      {subroute === 'telephony' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-[22px] font-semibold">Telephony Numbers & KYC Compliance</h2>
            <p className="mt-1 text-[13px] text-[color:var(--muted-foreground)]">Configure SIP trunks, phone numbers, and upload KYC verification documents for Indian carrier compliance.</p>
          </div>

          {/* Numbers Table */}
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-display text-[15px] font-semibold">Configured Phone Numbers</div>
              <button className="rounded-full bg-[color:var(--foreground)] px-4 py-1.5 text-[12px] font-medium text-white">+ Add Number</button>
            </div>

            <table className="w-full text-left text-[12.5px]">
              <thead className="border-b border-[color:var(--border)] text-[11px] font-mono uppercase text-[color:var(--muted-foreground)]">
                <tr>
                  <th className="py-2">Number</th>
                  <th>Carrier</th>
                  <th>Assigned Agent</th>
                  <th>KYC Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {numbersList.map(n => (
                  <tr key={n.number}>
                    <td className="py-3 font-mono font-medium">{n.number}</td>
                    <td>{n.provider}</td>
                    <td>{n.agent}</td>
                    <td><span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10.5px] font-semibold text-emerald-800">{n.kycStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* KYC Document Upload Container */}
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display text-[16px] font-semibold">Indian Carrier KYC Document Verification</div>
                <div className="text-[12px] text-[color:var(--muted-foreground)] font-mono">Status: {kycStatus}</div>
              </div>
              <ShieldCheck className="h-6 w-6 text-[color:var(--accent)]" />
            </div>

            <div className="border-2 border-dashed border-[color:var(--border)] rounded-2xl bg-white p-8 text-center space-y-2 cursor-pointer hover:border-[color:var(--accent)] transition">
              <Upload className="mx-auto h-8 w-8 text-[color:var(--accent)]" />
              <div className="text-[13.5px] font-semibold">Drag & Drop KYC Document (PDF / JPG / PNG)</div>
              <div className="text-[11.5px] text-[color:var(--muted-foreground)]">Accepts Aadhaar, PAN Card, GSTIN, or Company Incorporation Certificate</div>
            </div>
          </div>
        </div>
      )}

      {/* SUBROUTE 3: Organization Settings */}
      {subroute === 'org' && (
        <div className="space-y-6 max-w-3xl">
          <div>
            <h2 className="font-display text-[22px] font-semibold">Organization Profile & Team Members</h2>
            <p className="mt-1 text-[13px] text-[color:var(--muted-foreground)]">Manage organization metadata and team roles.</p>
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[color:var(--muted-foreground)] mb-1">Organization Name</label>
              <input type="text" defaultValue="Northwind Studio" className="w-full rounded-xl border border-[color:var(--border)] p-2.5 text-[13px]" />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[color:var(--muted-foreground)] mb-1">Team Members</label>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between items-center rounded-xl border border-[color:var(--border)] p-3">
                  <div>
                    <div className="font-semibold">Priyanshu Kumar</div>
                    <div className="text-[11px] text-[color:var(--muted-foreground)]">priyanshu@vocall.io</div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-mono text-[10.5px] font-semibold text-emerald-800">Owner</span>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 space-y-2">
            <div className="font-display text-[15px] font-semibold text-red-700">Danger Zone</div>
            <p className="text-[12px] text-red-600">Deleting an organization permanently purges all agents, contacts, and graph memories.</p>
            <button className="rounded-full bg-red-600 px-4 py-1.5 text-[12px] font-medium text-white">Delete Organization</button>
          </div>
        </div>
      )}

      {/* SUBROUTE 4: Spaces */}
      {subroute === 'spaces' && (
        <div className="space-y-6 max-w-3xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-display text-[22px] font-semibold">Workspace Spaces</h2>
              <p className="mt-1 text-[13px] text-[color:var(--muted-foreground)]">Group agents, contacts, and logs into distinct isolated workspaces.</p>
            </div>
            <button className="rounded-full bg-[color:var(--foreground)] px-4 py-2 text-[12.5px] font-medium text-white">+ New Space</button>
          </div>

          <div className="space-y-3">
            {spacesList.map((s, idx) => (
              <div key={s} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-[color:var(--accent)]" />
                  <div>
                    <div className="font-display text-[15px] font-semibold">{s}</div>
                    <div className="text-[11.5px] text-[color:var(--muted-foreground)]">1 Agent · 12 Contacts · Active</div>
                  </div>
                </div>
                <button className="rounded-full border border-[color:var(--border)] px-3 py-1 text-[11.5px]">Manage</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
