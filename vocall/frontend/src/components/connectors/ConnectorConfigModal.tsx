"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, KeyRound, X } from "lucide-react";

export interface ConnectorConfigModalProps {
  connector_type: string;
  initial_config: Record<string, any> | null;
  is_open: boolean;
  on_close: () => void;
  on_save: (config: Record<string, any>) => Promise<void>;
}

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST +5:30)" },
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST/PDT)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST +4:00)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT +8:00)" },
];

export const ConnectorConfigModal: React.FC<ConnectorConfigModalProps> = ({
  connector_type,
  initial_config,
  is_open,
  on_close,
  on_save,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [updateMode, setUpdateMode] = useState<Record<string, boolean>>({});
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (is_open) {
      const initial = initial_config || {};
      setFormData(initial);
      setTestResult(null);

      // Identify secret fields that have existing values
      const initialUpdateState: Record<string, boolean> = {};
      Object.keys(initial).forEach((key) => {
        if (
          [
            "access_token",
            "client_secret",
            "refresh_token",
            "anon_key",
            "connection_string",
            "bot_token",
            "credentials_json",
          ].includes(key) &&
          initial[key]
        ) {
          initialUpdateState[key] = false; // Requires clicking "Update Key" to edit
        } else {
          initialUpdateState[key] = true;
        }
      });
      setUpdateMode(initialUpdateState);
    }
  }, [is_open, initial_config, connector_type]);

  if (!is_open) return null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const enableFieldUpdate = (field: string) => {
    setUpdateMode((prev) => ({ ...prev, [field]: true }));
    setFormData((prev) => ({ ...prev, [field]: "" }));
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/connectors/${connector_type}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || "Connected successfully!",
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || data.message || "Connection failed",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Network error while testing connection",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await on_save(formData);
      on_close();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Failed to save connector configuration",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderSecretInput = (
    field: string,
    label: string,
    placeholder = "••••••••",
    isTextarea = false
  ) => {
    const isEditing = updateMode[field] !== false;
    const isVisible = showPassword[field];

    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-200">{label}</label>
        {!isEditing ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value="••••••••••••••••"
              className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-400 font-mono focus:outline-none"
            />
            <button
              type="button"
              onClick={() => enableFieldUpdate(field)}
              className="inline-flex items-center space-x-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
            >
              <KeyRound className="h-3.5 w-3.5 text-purple-400" />
              <span>Update Key</span>
            </button>
          </div>
        ) : isTextarea ? (
          <div className="relative">
            <textarea
              rows={4}
              value={formData[field] || ""}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-mono text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        ) : (
          <div className="relative flex items-center">
            <input
              type={isVisible ? "text" : "password"}
              value={formData[field] || ""}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility(field)}
              className="absolute right-3 text-slate-400 hover:text-slate-200 focus:outline-none"
            >
              {isVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderFormFields = () => {
    switch (connector_type) {
      case "google_calendar":
        return (
          <>
            {renderSecretInput(
              "credentials_json",
              "Service Account JSON",
              '{\n  "type": "service_account",\n  "project_id": "...",\n  "private_key": "..."\n}',
              true
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">
                Calendar ID
              </label>
              <input
                type="text"
                value={formData.calendar_id ?? "primary"}
                onChange={(e) => handleChange("calendar_id", e.target.value)}
                placeholder="primary"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">
                Timezone
              </label>
              <select
                value={formData.timezone || "Asia/Kolkata"}
                onChange={(e) => handleChange("timezone", e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        );

      case "hubspot":
        return (
          <>
            {renderSecretInput("access_token", "Access Token")}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">
                Pipeline ID
              </label>
              <input
                type="text"
                value={formData.pipeline_id || ""}
                onChange={(e) => handleChange("pipeline_id", e.target.value)}
                placeholder="default"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">
                Default Deal Stage ID
              </label>
              <input
                type="text"
                value={formData.deal_stage_id || ""}
                onChange={(e) => handleChange("deal_stage_id", e.target.value)}
                placeholder="appointmentscheduled"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </>
        );

      case "salesforce":
        return (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">
                Client ID
              </label>
              <input
                type="text"
                value={formData.client_id || ""}
                onChange={(e) => handleChange("client_id", e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            {renderSecretInput("client_secret", "Client Secret")}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">
                Instance URL
              </label>
              <input
                type="text"
                value={formData.instance_url || ""}
                onChange={(e) => handleChange("instance_url", e.target.value)}
                placeholder="https://yourorg.salesforce.com"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            {renderSecretInput(
              "refresh_token",
              "Refresh Token",
              "Enter refresh token...",
              true
            )}
          </>
        );

      case "supabase":
        return (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">
                Supabase URL
              </label>
              <input
                type="text"
                value={formData.url || ""}
                onChange={(e) => handleChange("url", e.target.value)}
                placeholder="https://xxx.supabase.co"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            {renderSecretInput("anon_key", "Anon Key")}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">
                Table Name
              </label>
              <input
                type="text"
                value={formData.table_name || ""}
                onChange={(e) => handleChange("table_name", e.target.value)}
                placeholder="contacts"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">
                Query Column
              </label>
              <input
                type="text"
                value={formData.query_column || ""}
                onChange={(e) => handleChange("query_column", e.target.value)}
                placeholder="phone"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <p className="text-xs text-slate-400">
                Column to match against the caller&apos;s phone number
              </p>
            </div>
          </>
        );

      case "postgres":
        return (
          <>
            {renderSecretInput(
              "connection_string",
              "Connection String",
              "postgresql://user:pass@host:5432/db"
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">
                Query Template
              </label>
              <textarea
                rows={3}
                value={formData.query_template || ""}
                onChange={(e) => handleChange("query_template", e.target.value)}
                placeholder="SELECT * FROM customers WHERE phone = '{contact_phone}' LIMIT 5"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-mono text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <p className="text-xs text-slate-400">
                Use &#123;contact_phone&#125; as a placeholder. e.g. SELECT *
                FROM customers WHERE phone = &apos;&#123;contact_phone&#125;&apos;
                LIMIT 5
              </p>
            </div>
          </>
        );

      case "slack":
        return (
          <>
            {renderSecretInput("bot_token", "Bot Token", "xoxb-...")}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">
                Channel ID
              </label>
              <input
                type="text"
                value={formData.channel_id || ""}
                onChange={(e) => handleChange("channel_id", e.target.value)}
                placeholder="C0123456789"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">
                Notify On
              </label>
              <div className="flex items-center space-x-4 pt-1">
                {[
                  { id: "frustration", label: "On Frustration" },
                  { id: "call_end", label: "On Call End" },
                  { id: "both", label: "Both" },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="notify_on"
                      value={opt.id}
                      checked={(formData.notify_on || "frustration") === opt.id}
                      onChange={(e) => handleChange("notify_on", e.target.value)}
                      className="accent-purple-600 focus:ring-purple-500"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        );

      case "whatsapp":
        return (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">
                Provider
              </label>
              <div className="flex items-center space-x-6 pt-1">
                {[
                  { id: "twilio", label: "Twilio" },
                  { id: "plivo", label: "Plivo" },
                ].map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="provider"
                      value={p.id}
                      checked={(formData.provider || "twilio") === p.id}
                      onChange={(e) => handleChange("provider", e.target.value)}
                      className="accent-purple-600 focus:ring-purple-500"
                    />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">
                From Number
              </label>
              <input
                type="text"
                value={formData.from_number || ""}
                onChange={(e) => handleChange("from_number", e.target.value)}
                placeholder="+14155238886"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">
                Message Template
              </label>
              <textarea
                rows={3}
                value={formData.message_template || ""}
                onChange={(e) =>
                  handleChange("message_template", e.target.value)
                }
                placeholder="Hi {contact_name}, thanks for speaking with {agent_name}. {call_summary}"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <p className="text-xs text-slate-400">
                Available variables: &#123;contact_name&#125;,
                &#123;agent_name&#125;, &#123;call_summary&#125;,
                &#123;emotion_label&#125;
              </p>
            </div>
          </>
        );

      case "zapier":
        return (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">
                Zapier Webhook URL
              </label>
              <input
                type="text"
                value={formData.webhook_url || ""}
                onChange={(e) => handleChange("webhook_url", e.target.value)}
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-medium text-slate-200">
                Include full transcript
              </span>
              <input
                type="checkbox"
                checked={formData.include_transcript ?? true}
                onChange={(e) =>
                  handleChange("include_transcript", e.target.checked)
                }
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500 accent-purple-600"
              />
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-medium text-slate-200">
                Include emotion data
              </span>
              <input
                type="checkbox"
                checked={formData.include_emotion ?? true}
                onChange={(e) =>
                  handleChange("include_emotion", e.target.checked)
                }
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500 accent-purple-600"
              />
            </div>
          </>
        );

      case "custom_webhook":
        return (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">
                Webhook URL
              </label>
              <input
                type="text"
                value={formData.url || ""}
                onChange={(e) => handleChange("url", e.target.value)}
                placeholder="https://api.yourdomain.com/webhooks/vocall"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">Method</label>
              <select
                value={formData.method || "POST"}
                onChange={(e) => handleChange("method", e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">
                Custom Headers (JSON, optional)
              </label>
              <textarea
                rows={2}
                value={
                  typeof formData.headers === "object"
                    ? JSON.stringify(formData.headers, null, 2)
                    : formData.headers || ""
                }
                onChange={(e) => handleChange("headers", e.target.value)}
                placeholder='{\n  "Authorization": "Bearer token"\n}'
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-mono text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-200">
                Payload Template (JSON, optional)
              </label>
              <textarea
                rows={3}
                value={formData.payload_template || ""}
                onChange={(e) =>
                  handleChange("payload_template", e.target.value)
                }
                placeholder='{\n  "event": "call_ended",\n  "phone": "{contact_phone}"\n}'
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-mono text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <p className="text-xs text-slate-400">
                Available variables: &#123;call_id&#125;,
                &#123;contact_phone&#125;, &#123;contact_name&#125;,
                &#123;agent_name&#125;, &#123;call_summary&#125;,
                &#123;emotion_score&#125;, &#123;duration_seconds&#125;
              </p>
            </div>
          </>
        );

      default:
        return (
          <div className="text-sm text-slate-400">
            Unknown connector type: {connector_type}
          </div>
        );
    }
  };

  const formatTitle = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-6 text-slate-100 space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              Configure {formatTitle(connector_type)}
            </h2>
            <p className="text-xs text-slate-400">
              Set up API credentials and integration settings.
            </p>
          </div>
          <button
            onClick={on_close}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-4">
          {renderFormFields()}

          {/* Test Connection Banner */}
          {testResult && (
            <div
              className={`flex items-start space-x-2 rounded-md p-3 text-xs font-medium border ${
                testResult.success
                  ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-300"
                  : "border-rose-500/30 bg-rose-950/40 text-rose-300"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{testResult.message}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-6">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || isSaving}
              className="inline-flex items-center space-x-2 rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 focus:outline-none disabled:opacity-50 transition"
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
              ) : null}
              <span>Test Connection</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={on_close}
                disabled={isSaving}
                className="rounded-md px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || isTesting}
                className="inline-flex items-center space-x-2 rounded-md bg-[#7C3AED] hover:bg-[#6D28D9] px-5 py-2 text-sm font-medium text-white shadow-lg focus:outline-none disabled:opacity-50 transition"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : null}
                <span>Save</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectorConfigModal;
