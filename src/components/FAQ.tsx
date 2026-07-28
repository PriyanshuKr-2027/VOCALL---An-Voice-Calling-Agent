import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'How does VoCall achieve sub-120ms voice-loop latency?',
    answer: 'We route raw audio streams directly over WebRTC sockets from regional telephony carrier trunks directly to high-throughput inference machines. By bypassing standard HTTP API hops and utilizing hardware accelerators, we reduce average response latency to 65ms–110ms, making conversations feel completely natural and human-like.'
  },
  {
    question: 'What are the benefits of the 4-Tier Cognitive Memory Engine?',
    answer: 'Traditional voice bots treat every call as a blank slate. VoCall utilizes Redis for active call-socket memory, Supabase pgvector for matching past topics, Postgres for event timelines, and FalkorDB for building entity-relationship graphs (e.g. mapping that a caller prefers SMS alerts). This ensures details are never forgotten, regardless of connection drops.'
  },
  {
    question: 'Can I bring my own API keys (BYOK) for voice providers?',
    answer: 'Yes. Our Growth and Enterprise plans support BYOK configurations. You can plug in your own developer keys for Cartesia, Hume AI, Sarvam AI, Cerebras, or Groq. This gives you direct access to volume contract discounts with these providers while paying VoCall only for platform orchestration.'
  },
  {
    question: 'How does VoCall handle Indian carrier regulations and KYC compliance?',
    answer: 'We have a built-in compliance wizard that automates regulatory submissions. You can drag and drop Aadhaar, PAN, GST, or Company Registration certificates directly into the dashboard settings. We automatically compile and file these documents to clear KYC with Twilio, Plivo, or Exotel, securing approved commercial DLT headers.'
  },
  {
    question: 'Which telephony providers are supported out-of-the-box?',
    answer: 'We support Twilio (for global reach and developer sandboxes), Plivo (for cost-effective international and Indian trunking), and Exotel (for large-scale Indian enterprise telephony and dedicated call center compliance).'
  }
];

export default function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {faqData.map((item, idx) => {
        const isExpanded = expandedIndex === idx;
        return (
          <div
            key={idx}
            className="premium-card"
            style={{
              backgroundColor: 'var(--card-color)',
              border: isExpanded ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
            onClick={() => toggleFAQ(idx)}
          >
            {/* Question Bar */}
            <div
              style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <HelpCircle size={16} style={{ color: isExpanded ? 'var(--accent-color)' : 'var(--text-secondary)' }} />
                <span style={{ fontWeight: 600, fontSize: '0.975rem', color: 'var(--text-primary)' }}>
                  {item.question}
                </span>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}
              >
                <ChevronDown size={18} />
              </motion.div>
            </div>

            {/* Answer Drawer */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div
                    style={{
                      padding: '0 24px 24px 52px',
                      fontSize: '0.925rem',
                      lineHeight: '1.6',
                      color: 'var(--text-secondary)',
                      borderTop: '1px solid rgba(0,0,0,0.02)',
                    }}
                  >
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
