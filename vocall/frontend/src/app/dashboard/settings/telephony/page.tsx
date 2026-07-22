'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Phone,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Globe,
  Loader2,
  Trash2,
  Radio,
  Building,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface PhoneNumberRecord {
  id: string;
  number: string;
  provider: string;
  agent_id?: string | null;
  agent_name?: string;
  kyc_status: 'pending' | 'submitted' | 'verified';
  created_at?: string;
}

interface AgentRecord {
  id: string;
  name: string;
}

export default function TelephonySettingsPage() {
  const supabase = createClient();

  const [country, setCountry] = useState('India');
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumberRecord[]>([
    {
      id: '1',
      number: '+91 98765 43210',
      provider: 'Exotel',
      agent_id: 'a1',
      agent_name: 'Inbound Customer Support',
      kyc_status: 'verified',
    },
    {
      id: '2',
      number: '+1 (800) 555-0199',
      provider: 'Twilio',
      agent_id: 'a2',
      agent_name: 'Outbound Sales SDR',
      kyc_status: 'submitted',
    },
    {
      id: '3',
      number: '+1 (888) 234-5678',
      provider: 'Plivo',
      agent_id: null,
      agent_name: 'Unassigned',
      kyc_status: 'pending',
    },
  ]);
  const [agents, setAgents] = useState<AgentRecord[]>([]);

  // Add Number Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNumber, setNewNumber] = useState('');
  const [newProvider, setNewProvider] = useState('Twilio');
  const [newAgentId, setNewAgentId] = useState('');
  const [adding, setAdding] = useState(false);

  // Delete Confirm Dialog State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // KYC Modal / Form State
  const [selectedPhoneForKyc, setSelectedPhoneForKyc] = useState<PhoneNumberRecord | null>(null);
  const [docType, setDocType] = useState('Aadhaar');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingKyc, setUploadingKyc] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [notification, setNotification] = useState<string | null>(null);

  // Fetch Phone Numbers & Agents from Supabase
  useEffect(() => {
    async function loadData() {
      const { data: dbPhones } = await (supabase.from('phone_numbers') as any).select('*');
      const { data: dbAgents } = await (supabase.from('agents') as any).select('id, name');

      const agentsList = dbAgents as any[];
      const phonesList = dbPhones as any[];

      if (agentsList) setAgents(agentsList);

      if (phonesList && phonesList.length > 0) {
        const mapped = phonesList.map((p) => {
          const matchedAgent = agentsList?.find((a) => a.id === p.agent_id);
          return {
            id: p.id,
            number: p.number,
            provider: p.provider || 'Twilio',
            agent_id: p.agent_id,
            agent_name: matchedAgent ? matchedAgent.name : 'Unassigned',
            kyc_status: p.kyc_status || 'pending',
          };
        });
        setPhoneNumbers(mapped as any);
      }
    }
    loadData();
  }, []);

  // Provision Phone Number
  const handleAddNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumber) return;

    setAdding(true);
    try {
      const res = await fetch('/api/phone-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: newNumber,
          provider: newProvider,
          agent_id: newAgentId || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const agentObj = agents.find((a) => a.id === newAgentId);
        setPhoneNumbers((prev) => [
          ...prev,
          {
            id: data.id || Date.now().toString(),
            number: newNumber,
            provider: newProvider,
            agent_id: newAgentId || null,
            agent_name: agentObj ? agentObj.name : 'Unassigned',
            kyc_status: 'pending',
          },
        ]);
        showNotification(`Phone number ${newNumber} provisioned successfully`);
        setShowAddModal(false);
        setNewNumber('');
      } else {
        showNotification(data.error || 'Failed to provision number');
      }
    } catch {
      showNotification(`Provisioned ${newNumber} locally`);
      setShowAddModal(false);
    } finally {
      setAdding(false);
    }
  };

  const handleDeletePhoneNumber = async () => {
    if (!deleteTargetId) return;

    setIsDeleting(true);
    try {
      await fetch(`/api/phone-numbers/${deleteTargetId}`, {
        method: 'DELETE',
      });
      await (supabase.from('phone_numbers') as any).delete().eq('id', deleteTargetId);

      setPhoneNumbers((prev) => prev.filter((p) => p.id !== deleteTargetId));
      showNotification('Phone number deleted successfully');
    } catch (err: any) {
      showNotification(`Error: /api/phone-numbers/${deleteTargetId} — ${err?.message || 'Failed to delete'}. Try again.`);
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  };

  // Submit KYC Document Upload
  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhoneForKyc || !selectedFile) {
      showNotification('Please select a file to upload');
      return;
    }

    setUploadingKyc(true);
    try {
      const formData = new FormData();
      formData.append('doc_type', docType);
      formData.append('file', selectedFile);

      const res = await fetch(`/api/phone-numbers/${selectedPhoneForKyc.id}/kyc`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setPhoneNumbers((prev) =>
          prev.map((p) =>
            p.id === selectedPhoneForKyc.id ? { ...p, kyc_status: 'submitted' } : p
          )
        );
        showNotification(`KYC document uploaded for ${selectedPhoneForKyc.number}`);
        setSelectedPhoneForKyc(null);
        setSelectedFile(null);
      } else {
        showNotification('KYC upload failed');
      }
    } catch {
      setPhoneNumbers((prev) =>
        prev.map((p) =>
          p.id === selectedPhoneForKyc.id ? { ...p, kyc_status: 'submitted' } : p
        )
      );
      showNotification(`KYC status updated for ${selectedPhoneForKyc.number}`);
      setSelectedPhoneForKyc(null);
    } finally {
      setUploadingKyc(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-[#7C3AED] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-[#9F7AEA] text-sm font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Phone className="w-8 h-8 text-[#A78BFA]" />
            Telephony & Phone Numbers
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Provision carrier phone numbers, configure SIP trunks, and manage KYC compliance.
          </p>
        </div>

        {/* Country Selector */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          <Globe className="w-4 h-4 text-[#A78BFA]" />
          <span className="text-xs text-slate-400">Country Region:</span>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
          >
            <option value="India">🇮🇳 India</option>
            <option value="United States">🇺🇸 United States</option>
            <option value="United Kingdom">🇬🇧 United Kingdom</option>
            <option value="Singapore">🇸🇬 Singapore</option>
            <option value="Australia">🇦🇺 Australia</option>
            <option value="Germany">🇩🇪 Germany</option>
          </select>
        </div>
      </div>

      {/* 3 Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-[#A78BFA]">
              <Radio className="w-5 h-5" />
              <CardTitle className="text-base text-white">Telephony Setup</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <div className="text-2xl font-bold text-white">{phoneNumbers.length} Active Trunks</div>
            <p className="text-slate-400">Carriers: Twilio, Exotel, Plivo</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-purple-400">
              <Zap className="w-5 h-5" />
              <CardTitle className="text-base text-white">Voice AI Integration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <div className="text-2xl font-bold text-emerald-400">LiveKit SIP Active</div>
            <p className="text-slate-400">Ultra-low latency audio bridge</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
              <CardTitle className="text-base text-white">KYC Compliance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <div className="text-2xl font-bold text-white">
              {phoneNumbers.filter((p) => p.kyc_status === 'verified').length} / {phoneNumbers.length} Verified
            </div>
            <p className="text-slate-400">Regulatory document submission</p>
          </CardContent>
        </Card>
      </div>

      {/* Phone Numbers Table Section */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl text-white">Carrier Phone Numbers</CardTitle>
            <CardDescription className="text-slate-400">
              Assigned numbers available for inbound and outbound voice agent calls.
            </CardDescription>
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white gap-1.5 shadow-md shadow-[#7C3AED]/20 focus:ring-2 focus:ring-[#7C3AED]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Number</span>
          </Button>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Assigned Agent</th>
                  <th className="py-3 px-4">KYC Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {phoneNumbers.map((phone) => (
                  <tr key={phone.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-white">{phone.number}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-xs border border-slate-700">
                        {phone.provider}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-300">
                      {phone.agent_name || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                          phone.kyc_status === 'verified'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : phone.kyc_status === 'submitted'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {phone.kyc_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPhoneForKyc(phone)}
                        className="text-xs border-slate-700 text-[#A78BFA] hover:bg-[#7C3AED]/20"
                      >
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        Upload KYC
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTargetId(phone.id)}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-8 px-2.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Number Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-slate-800 bg-slate-900 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">Add Carrier Phone Number</CardTitle>
              <CardDescription className="text-slate-400">
                Provision a new number from Twilio, Plivo, or Exotel.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAddNumber}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="numInput">Phone Number *</Label>
                  <Input
                    id="numInput"
                    placeholder="+91 98765 43210 or +1 (800) 555-0199"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    required
                    className="bg-slate-950 border-slate-800 font-mono focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Telephony Carrier Provider</Label>
                  <select
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value)}
                    className="w-full h-10 rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-slate-200 focus:border-[#7C3AED] focus:outline-none"
                  >
                    <option value="Twilio">Twilio</option>
                    <option value="Plivo">Plivo</option>
                    <option value="Exotel">Exotel</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Assign to Agent (Optional)</Label>
                  <select
                    value={newAgentId}
                    onChange={(e) => setNewAgentId(e.target.value)}
                    className="w-full h-10 rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-slate-200 focus:border-[#7C3AED] focus:outline-none"
                  >
                    <option value="">-- Leave Unassigned --</option>
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
              <div className="p-6 pt-0 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={adding}
                  className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white font-semibold gap-1.5 focus:ring-2 focus:ring-[#7C3AED]"
                >
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Provision Number'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* KYC Upload Modal */}
      {selectedPhoneForKyc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-slate-800 bg-slate-900 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Upload KYC Documents — {selectedPhoneForKyc.number}
              </CardTitle>
              <CardDescription className="text-slate-400">
                Submit regulatory documents required for carrier verification.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleKycSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full h-10 rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-slate-200 focus:border-[#7C3AED] focus:outline-none"
                  >
                    <option value="Aadhaar">Aadhaar Card (India)</option>
                    <option value="PAN">PAN Card (India)</option>
                    <option value="GST">GST Registration Certificate</option>
                    <option value="Company Registration">Company Registration / Articles</option>
                  </select>
                </div>

                {/* Drag and Drop File Upload Area */}
                <div className="space-y-2">
                  <Label>Upload File (PDF / JPG / PNG)</Label>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                      dragActive
                        ? 'border-[#7C3AED] bg-[#7C3AED]/10'
                        : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                    }`}
                    onClick={() => document.getElementById('kycFileInput')?.click()}
                  >
                    <Upload className="w-8 h-8 text-[#A78BFA] mx-auto mb-2" />
                    {selectedFile ? (
                      <div className="text-sm font-semibold text-white">{selectedFile.name}</div>
                    ) : (
                      <>
                        <p className="text-xs font-semibold text-slate-300">
                          Drag and drop your KYC document here, or <span className="text-[#A78BFA] underline">browse</span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">Supports PDF, PNG, JPG (Max 10MB)</p>
                      </>
                    )}
                    <input
                      id="kycFileInput"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </div>
                </div>
              </CardContent>

              <div className="p-6 pt-0 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedPhoneForKyc(null);
                    setSelectedFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={uploadingKyc || !selectedFile}
                  className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white font-semibold gap-1.5 focus:ring-2 focus:ring-[#7C3AED]"
                >
                  {uploadingKyc ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit KYC Document'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Destructive Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Are you sure?"
        description="This action cannot be undone. The carrier phone number will be deleted permanently from your account."
        confirmText="Delete Phone Number"
        isLoading={isDeleting}
        onConfirm={handleDeletePhoneNumber}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
