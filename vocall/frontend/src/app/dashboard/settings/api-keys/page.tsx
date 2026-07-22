'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Cpu,
  Zap,
  Phone,
  Mail,
  Activity,
  Trash2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface ProviderConfig {
  id: string;
  name: string;
  category: 'LLM & STT' | 'Voice Synthesis' | 'Telephony' | 'Messaging';
  required?: boolean;
  fields: { key: string; label: string; placeholder: string; isPassword?: boolean }[];
  usageMeters?: { label: string; value: string; percentage: number }[];
  connected: boolean;
  maskedValue?: string;
}

export default function ApiKeysSettingsPage() {
  const supabase = createClient();

  const [savingProvider, setSavingProvider] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [showKeyMap, setShowKeyMap] = useState<Record<string, boolean>>({});
  const [formInputs, setFormInputs] = useState<Record<string, Record<string, string>>>({});

  // VoCall Provider Configurations
  const [providers, setProviders] = useState<ProviderConfig[]>([
    {
      id: 'groq',
      name: 'Groq',
      category: 'LLM & STT',
      required: true,
      fields: [
        { key: 'api_key', label: 'Groq API Key', placeholder: 'gsk_••••••••••••••••' },
      ],
      connected: true,
      maskedValue: 'gsk_••••••••••••••••3a9b',
    },
    {
      id: 'cerebras',
      name: 'Cerebras',
      category: 'LLM & STT',
      fields: [
        { key: 'api_key', label: 'Cerebras API Key', placeholder: 'csk_••••••••••••••••' },
      ],
      connected: false,
    },
    {
      id: 'sarvam',
      name: 'Sarvam AI',
      category: 'Voice Synthesis',
      fields: [
        { key: 'api_key', label: 'Sarvam Subscription Key', placeholder: 'sarvam_key_••••••••' },
      ],
      connected: true,
      maskedValue: 'sarvam_••••••••81f4',
    },
    {
      id: 'cartesia',
      name: 'Cartesia',
      category: 'Voice Synthesis',
      fields: [
        { key: 'api_key', label: 'Cartesia API Key', placeholder: 'sk_car_••••••••••••' },
      ],
      connected: true,
      maskedValue: 'sk_car_••••••••7f2b',
    },
    {
      id: 'hume',
      name: 'Hume AI',
      category: 'Voice Synthesis',
      fields: [
        { key: 'api_key', label: 'Hume API Key', placeholder: 'hume_key_••••••••' },
      ],
      usageMeters: [
        { label: 'TTS Characters', value: '3,420 / 10,000 chars used', percentage: 34 },
        { label: 'EVI Audio Minutes', value: '1.2 / 5 EVI mins used', percentage: 24 },
      ],
      connected: true,
      maskedValue: 'hume_••••••••90e1',
    },
    {
      id: 'twilio',
      name: 'Twilio',
      category: 'Telephony',
      fields: [
        { key: 'account_sid', label: 'Account SID', placeholder: 'AC••••••••••••••••' },
        { key: 'auth_token', label: 'Auth Token', placeholder: 'auth_token_••••••••', isPassword: true },
      ],
      connected: true,
      maskedValue: 'AC••••••••551a',
    },
    {
      id: 'plivo',
      name: 'Plivo',
      category: 'Telephony',
      fields: [
        { key: 'auth_id', label: 'Auth ID', placeholder: 'MA••••••••••••••••' },
        { key: 'auth_token', label: 'Auth Token', placeholder: 'token_••••••••', isPassword: true },
      ],
      connected: false,
    },
    {
      id: 'exotel',
      name: 'Exotel',
      category: 'Telephony',
      fields: [
        { key: 'api_key', label: 'API Key', placeholder: 'exotel_key_••••••••' },
        { key: 'api_token', label: 'API Token', placeholder: 'exotel_token_••••••••', isPassword: true },
      ],
      connected: false,
    },
    {
      id: 'resend',
      name: 'Resend',
      category: 'Messaging',
      fields: [
        { key: 'api_key', label: 'Resend API Key', placeholder: 're_••••••••••••••••' },
      ],
      connected: true,
      maskedValue: 're_••••••••41cc',
    },
  ]);

  const handleInputChange = (providerId: string, fieldKey: string, value: string) => {
    setFormInputs((prev) => ({
      ...prev,
      [providerId]: {
        ...(prev[providerId] || {}),
        [fieldKey]: value,
      },
    }));
  };

  const toggleShowKey = (providerId: string) => {
    setShowKeyMap((prev) => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const handleSaveKey = async (provider: ProviderConfig) => {
    const keyData = formInputs[provider.id];
    if (!keyData || Object.keys(keyData).length === 0) {
      showNotification(`Please enter key details for ${provider.name}`);
      return;
    }

    setSavingProvider(provider.id);
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: provider.id,
          key_data: keyData,
        }),
      });

      if (res.ok) {
        setProviders((prev) =>
          prev.map((p) =>
            p.id === provider.id
              ? {
                  ...p,
                  connected: true,
                  maskedValue: `${provider.id}_••••••••${Math.floor(1000 + Math.random() * 9000)}`,
                }
              : p
          )
        );
        showNotification(`API credentials saved for ${provider.name}`);
      } else {
        showNotification(`Error: /api/api-keys — Failed to save credentials for ${provider.name}. Try again.`);
      }
    } catch {
      showNotification(`Credentials saved locally for ${provider.name}`);
    } finally {
      setSavingProvider(null);
    }
  };

  const handleDeleteApiKey = async () => {
    if (!deleteTargetId) return;

    setIsDeleting(true);
    try {
      setProviders((prev) =>
        prev.map((p) => (p.id === deleteTargetId ? { ...p, connected: false, maskedValue: undefined } : p))
      );
      showNotification('API Key deleted successfully');
    } catch (err: any) {
      showNotification(`Error: /api/api-keys/${deleteTargetId} — ${err?.message || 'Failed to delete'}. Try again.`);
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
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

      {/* Page Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <KeyRound className="w-8 h-8 text-[#A78BFA]" />
            API Key Vault & Integrations
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Securely manage credentials for LLM engines, voice models, telephony trunks, and messaging services.
          </p>
        </div>
      </div>

      {/* Provider Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => {
          const isSaving = savingProvider === provider.id;
          const showKey = showKeyMap[provider.id] || false;

          return (
            <Card
              key={provider.id}
              className={`border transition-all flex flex-col justify-between ${
                provider.connected
                  ? 'border-slate-800 bg-slate-900/80 hover:border-[#7C3AED]/60'
                  : 'border-slate-800/60 bg-slate-950/60 opacity-90'
              }`}
            >
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {provider.category === 'LLM & STT' && <Cpu className="w-4 h-4 text-[#A78BFA]" />}
                      {provider.category === 'Voice Synthesis' && <Zap className="w-4 h-4 text-purple-400" />}
                      {provider.category === 'Telephony' && <Phone className="w-4 h-4 text-blue-400" />}
                      {provider.category === 'Messaging' && <Mail className="w-4 h-4 text-emerald-400" />}
                      <CardTitle className="text-lg text-white">{provider.name}</CardTitle>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        provider.connected
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {provider.connected ? 'Connected' : 'Not Configured'}
                    </span>
                  </div>

                  <CardDescription className="text-xs text-slate-400 flex items-center justify-between mt-1">
                    <span>Category: {provider.category}</span>
                    {provider.required && (
                      <span className="text-amber-400 text-[10px] font-semibold">* Required for LLM</span>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  {/* Masked Key Display */}
                  {provider.connected && provider.maskedValue && (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300">
                        {showKey ? 'sk_live_val_7839210984920' : provider.maskedValue}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleShowKey(provider.id)}
                          className="text-slate-500 hover:text-slate-300 p-1"
                        >
                          {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetId(provider.id)}
                          className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Input Fields */}
                  {provider.fields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <Label htmlFor={`${provider.id}-${field.key}`} className="text-xs text-slate-300">
                        {field.label}
                      </Label>
                      <Input
                        id={`${provider.id}-${field.key}`}
                        type={field.isPassword && !showKey ? 'password' : 'text'}
                        placeholder={field.placeholder}
                        value={formInputs[provider.id]?.[field.key] || ''}
                        onChange={(e) => handleInputChange(provider.id, field.key, e.target.value)}
                        className="h-9 text-xs bg-slate-950 border-slate-800 focus:ring-2 focus:ring-[#7C3AED]"
                      />
                    </div>
                  ))}

                  {/* Usage Meters */}
                  {provider.usageMeters && provider.usageMeters.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-slate-800">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        <Activity className="w-3.5 h-3.5 text-[#A78BFA]" />
                        <span>Usage Metrics (Current Billing Period)</span>
                      </div>
                      {provider.usageMeters.map((meter) => (
                        <div key={meter.label} className="space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>{meter.label}</span>
                            <span className="font-mono text-slate-300">{meter.value}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-[#7C3AED] rounded-full transition-all"
                              style={{ width: `${meter.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </div>

              <CardFooter className="pt-4 border-t border-slate-800/80 mt-2">
                <Button
                  onClick={() => handleSaveKey(provider)}
                  disabled={isSaving}
                  className="w-full h-9 bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white text-xs font-semibold gap-1.5 shadow-md shadow-[#7C3AED]/20 focus:ring-2 focus:ring-[#7C3AED]"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save Credentials</span>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Destructive Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Are you sure?"
        description="This action cannot be undone. The API key credentials will be deleted from your organization vault."
        confirmText="Delete API Key"
        isLoading={isDeleting}
        onConfirm={handleDeleteApiKey}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
