import { useState } from 'react';
import {
  ShieldCheck,
  Upload,
  Trash2,
  Clock
} from 'lucide-react';

interface SettingsManagerProps {
  section: string;
  orgName: string;
  onUpdateOrgName: (name: string) => void;
  apiKeys: any;
  onUpdateApiKeys: (keys: any) => void;
  telephonyNumbers: any[];
  onAddTelephonyNumber: (num: any) => void;
  onRemoveTelephonyNumber: (id: string) => void;
}

export default function SettingsManager({
  section,
  orgName,
  onUpdateOrgName,
  apiKeys,
  onUpdateApiKeys,
  telephonyNumbers,
  onAddTelephonyNumber,
  onRemoveTelephonyNumber
}: SettingsManagerProps) {
  
  // API Keys state
  const [keys, setKeys] = useState(apiKeys);
  
  // KYC files state
  const [kycFile, setKycFile] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<'none' | 'uploading' | 'review' | 'verified'>('none');
  
  // New number form state
  const [newNum, setNewNum] = useState('');
  const [newProv, setNewProv] = useState<'Twilio' | 'Plivo' | 'Exotel'>('Twilio');

  const handleSaveKeys = () => {
    onUpdateApiKeys(keys);
    alert('API keys saved successfully!');
  };

  const handleKycUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKycFile(file.name);
      setKycStatus('uploading');
      setTimeout(() => {
        setKycStatus('review');
      }, 1500);
    }
  };

  const handleAddNumber = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNum) {
      onAddTelephonyNumber({
        id: Math.random().toString(36).substr(2, 9),
        number: newNum,
        provider: newProv,
        agentName: null
      });
      setNewNum('');
    }
  };

  return (
    <div style={{ padding: '32px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* SECTION HEADER */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '4px' }}>
          {section === 'settings' && 'Organization Settings'}
          {section === 'api-keys' && 'API Credentials'}
          {section === 'telephony' && 'KYC Telephony Trunks'}
          {section === 'connectors' && 'Integrations Grid'}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {section === 'settings' && 'Manage default spaces, workspaces, team roles, and details.'}
          {section === 'api-keys' && 'Configure custom credentials for TTS synthesis and LLM processing.'}
          {section === 'telephony' && 'Register carrier channels and submit government compliance certificates.'}
          {section === 'connectors' && 'Sync active pipelines during calls or route summaries post-call.'}
        </p>
      </div>

      {/* RENDER VIEW: ORG SETTINGS */}
      {section === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '640px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Organization Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => onUpdateOrgName(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--surface-color)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Default Workspace Space</label>
            <input
              type="text"
              defaultValue="General Sandbox"
              style={{
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--surface-color)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--red-accent)', marginBottom: '6px' }}>Danger Zone</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Deleting your organization wipes out all configured agents, pgvector facts, and calls.
            </p>
            <button className="btn" style={{ backgroundColor: 'var(--red-soft)', color: 'var(--red-accent)', border: '1px solid var(--red-accent)', padding: '10px 16px', fontSize: '0.8rem' }}>
              Delete Organization
            </button>
          </div>
        </div>
      )}

      {/* RENDER VIEW: API KEYS */}
      {section === 'api-keys' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { id: 'groq', label: 'Groq API Key (Llama-3 model)', placeholder: 'gsk_••••••••••••••••••••' },
              { id: 'sarvam', label: 'Sarvam AI Token (Hinglish synthesizer)', placeholder: 'sarvam_••••••••••••••••' },
              { id: 'cartesia', label: 'Cartesia Voice Secret (Ultra low-latency)', placeholder: 'cartesia_••••••••••••••' },
              { id: 'hume', label: 'Hume AI Secret Key (EVI adaptive model)', placeholder: 'hume_••••••••••••••••••' },
              { id: 'cerebras', label: 'Cerebras API Key (Instant response model)', placeholder: 'csk_••••••••••••••••••••' },
              { id: 'twilio', label: 'Twilio Auth Token', placeholder: 'tw_•••••••••••••••••••••' }
            ].map((k) => (
              <div key={k.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>{k.label}</label>
                  {keys[k.id] && <span style={{ fontSize: '0.7rem', color: 'var(--green-accent)', fontWeight: 600 }}>SAVED</span>}
                </div>
                <input
                  type="password"
                  placeholder={k.placeholder}
                  value={keys[k.id] || ''}
                  onChange={(e) => setKeys({ ...keys, [k.id]: e.target.value })}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--surface-color)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem'
                  }}
                />
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSaveKeys}
            style={{ alignSelf: 'flex-start', padding: '10px 20px', fontSize: '0.85rem' }}
          >
            Save Credentials
          </button>
        </div>
      )}

      {/* RENDER VIEW: KYC & TELEPHONY */}
      {section === 'telephony' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }} className="telephony-grid">
          
          {/* Numbers list & Add Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Registered Phone Numbers</h3>
            
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '10px 12px' }}>Number</th>
                    <th style={{ padding: '10px 12px' }}>Provider</th>
                    <th style={{ padding: '10px 12px' }}>Assigned Agent</th>
                    <th style={{ padding: '10px 12px', width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {telephonyNumbers.map((num) => (
                    <tr key={num.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{num.number}</td>
                      <td style={{ padding: '10px 12px' }}>{num.provider}</td>
                      <td style={{ padding: '10px 12px', color: num.agentName ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                        {num.agentName || 'Unassigned'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <button
                          onClick={() => onRemoveTelephonyNumber(num.id)}
                          style={{ border: 'none', background: 'none', color: 'var(--red-accent)', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {telephonyNumbers.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No phone numbers added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Add Number Form */}
            <form onSubmit={handleAddNumber} style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '16px', backgroundColor: 'var(--surface-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Link New Number</span>
              
              <div style={{ display: 'flex', gap: '10px' }} className="phone-add-row">
                <input
                  type="text"
                  placeholder="+91 99999 88888"
                  value={newNum}
                  onChange={(e) => setNewNum(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--card-color)',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)'
                  }}
                />
                
                <select
                  value={newProv}
                  onChange={(e) => setNewProv(e.target.value as any)}
                  style={{
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--card-color)',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="Twilio">Twilio</option>
                  <option value="Plivo">Plivo</option>
                  <option value="Exotel">Exotel</option>
                </select>

                <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                  Register
                </button>
              </div>
            </form>
          </div>

          {/* DLT compliance government upload */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Government Compliance (KYC)</h3>
            
            <div
              className="premium-card"
              style={{
                padding: '24px',
                backgroundColor: 'var(--card-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)' }}>
                <ShieldCheck size={20} />
                <span style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>DLT Verification</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Under India TRAI regulations, Exotel SIP routing requires Aadhaar, PAN, and corporate address documents.
              </p>

              {/* Drag Drop Area */}
              <div
                style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: '6px',
                  padding: '28px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'var(--surface-color)'
                }}
                onClick={() => document.getElementById('kyc-file-upload')?.click()}
              >
                <Upload size={24} style={{ color: 'var(--text-tertiary)', marginBottom: '8px' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block' }}>Upload PAN/Aadhaar PDF</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Max size 5MB. Must be scanned PDF.</span>
                <input
                  type="file"
                  id="kyc-file-upload"
                  accept="application/pdf"
                  onChange={handleKycUpload}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Upload Status Card */}
              {kycStatus !== 'none' && (
                <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem' }}>
                  {kycStatus === 'uploading' && (
                    <>
                      <Clock size={14} className="animate-spin" style={{ color: 'var(--accent-color)' }} />
                      <span>Uploading `{kycFile}` to Supabase storage...</span>
                    </>
                  )}
                  {kycStatus === 'review' && (
                    <>
                      <Clock size={14} style={{ color: 'var(--yellow-accent)' }} />
                      <span>Uploaded `{kycFile}`. Verification status: <strong>Under Review</strong> (ETA 10m).</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* RENDER VIEW: CONNECTORS GRID */}
      {section === 'connectors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {[
              { name: 'HubSpot CRM', type: 'During Call', desc: 'Auto-logs call outcomes, transcripts, and sentiment scores directly under contacts timeline.', active: true },
              { name: 'Google Calendar API', type: 'During Call', desc: 'Allows AI agents to check availability and book user meetings natively during voice calls.', active: true },
              { name: 'Supabase SQL', type: 'Post Call', desc: 'Automatically write structured variables and transcript JSON objects to target Postgres tables.', active: false },
              { name: 'WhatsApp Webhook', type: 'Post Call', desc: 'Trigger WhatsApp summary messages and callback links once call session terminates.', active: false },
              { name: 'Custom REST Webhook', type: 'Post Call', desc: 'Posts standard payload objects to your designated corporate API endpoints.', active: false }
            ].map((con) => (
              <div
                key={con.name}
                className="premium-card"
                style={{ padding: '24px', backgroundColor: 'var(--card-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '180px' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{con.name}</span>
                    <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: con.type === 'During Call' ? 'var(--accent-light)' : 'var(--border-color)', color: con.type === 'During Call' ? 'var(--accent-color)' : 'var(--text-secondary)', fontWeight: 600 }}>
                      {con.type}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{con.desc}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '16px' }}>
                  <span style={{ fontSize: '0.725rem', color: con.active ? 'var(--green-accent)' : 'var(--text-tertiary)', fontWeight: 600 }}>
                    {con.active ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.725rem' }}>
                    Configure
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .telephony-grid {
            grid-template-columns: 1fr !important;
          }
          .phone-add-row {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
}
