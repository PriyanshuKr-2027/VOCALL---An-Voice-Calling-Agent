import { Phone } from 'lucide-react';
import type { Agent, PhoneNumber } from '../../types';

export interface AgentTelephonyTabProps {
  agent: Agent;
  onUpdateAgent: (id: string, updatedFields: Partial<Agent>) => void;
  telephonyNumbers: PhoneNumber[];
  onNavigateToSection: (section: string) => void;
}

export default function AgentTelephonyTab({
  agent,
  onUpdateAgent,
  telephonyNumbers,
  onNavigateToSection,
}: AgentTelephonyTabProps) {
  const currentProvider = agent.telephony?.provider || 'Twilio';
  const availableNumbers = telephonyNumbers.filter((n) => n.provider === currentProvider);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Telephony &amp; Carrier Trunking
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Configure SIP trunks, assigned DID phone numbers, and inbound routing settings.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Trunk Provider</label>
          <select
            value={currentProvider}
            onChange={(e) => onUpdateAgent(agent.id, { telephony: { ...agent.telephony, provider: e.target.value } })}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--surface-color)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          >
            <option value="Twilio">Twilio (US/Global)</option>
            <option value="Plivo">Plivo (India/Int)</option>
            <option value="Exotel">Exotel (India Corporate)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>Assigned Phone Number</label>
          <select
            value={agent.telephony?.phoneNumber || availableNumbers[0]?.number || ''}
            onChange={(e) => onUpdateAgent(agent.id, { telephony: { ...agent.telephony, phoneNumber: e.target.value } })}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--surface-color)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          >
            {availableNumbers.map((n) => (
              <option key={n.id} value={n.number}>
                {n.number} ({n.agentName || 'Unassigned'})
              </option>
            ))}
            {availableNumbers.length === 0 && (
              <option value="">No registered numbers for this provider. Go to settings.</option>
            )}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px', backgroundColor: 'var(--surface-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontWeight: 600, display: 'block', fontSize: '0.9rem' }}>Inbound Routing Enabled</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Allow clients to call this number directly to trigger this agent.</span>
          </div>
          <input
            type="checkbox"
            checked={agent.telephony?.inboundRouting ?? true}
            onChange={(e) =>
              onUpdateAgent(agent.id, {
                telephony: { ...agent.telephony, inboundRouting: e.target.checked },
              })
            }
            style={{ accentColor: 'var(--accent-color)', width: '18px', height: '18px', cursor: 'pointer' }}
          />
        </div>
        
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontWeight: 600, display: 'block', fontSize: '0.9rem' }}>Outbound Caller ID Masking</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Show verified corporate name header on outbound calls.</span>
          </div>
          <input
            type="checkbox"
            checked={agent.telephony?.outboundCallerIdMasking ?? true}
            onChange={(e) =>
              onUpdateAgent(agent.id, {
                telephony: { ...agent.telephony, outboundCallerIdMasking: e.target.checked },
              })
            }
            style={{ accentColor: 'var(--accent-color)', width: '18px', height: '18px', cursor: 'pointer' }}
          />
        </div>
      </div>

      <button
        type="button"
        className="btn btn-secondary"
        style={{ alignSelf: 'flex-start', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        onClick={() => onNavigateToSection('telephony')}
      >
        <Phone size={14} />
        Configure Telephony Numbers &amp; DLT Settings
      </button>
    </div>
  );
}
