// Central mock state store for VoCall Enterprise Platform

export const INITIAL_AGENTS = [
  {
    id: 'agent-1',
    name: 'Support Lead',
    avatar: 'S',
    description: 'Handles tier-1 support, billing inquiries, and password reset loops.',
    status: 'Live',
    language: 'en · hi · Hinglish',
    prompt: 'You are Nora, the Support Lead at Northwind. Speak in warm, plain English. If the caller sounds frustrated, slow down, acknowledge the feeling, and offer a concrete next step within one sentence.',
    tags: ['Customer Support', 'Billing'],
    voice: { name: 'Nora — Warm EN', provider: 'Cartesia', gender: 'Female', latency: '140ms', cost: 'Low' },
    telephony: { provider: 'Exotel', number: '+1 (415) 555-0142', inbound: true, outboundCallerId: '+14155550142' },
    memory: { enabled: true, shortTerm: true, longTerm: true, maxFacts: 5, episodic: true, maxEpisodes: 3, graph: true },
    emotion: { enabled: true, textSignal: true, audioSignal: true, toneAdaptation: true, frustrationThreshold: 0.7, triggerAction: 'Slack Escalation' },
    stats: { calls: 18204, duration: '3m 42s', success: '84.6%', emotionScore: 0.71, totalCostInr: '₹ 14,250', totalCostUsd: '$ 172.50' }
  },
  {
    id: 'agent-2',
    name: 'Sales Qualifier',
    avatar: 'Q',
    description: 'Qualifies inbound inbound leads, verifies enterprise budget, and books demo slots.',
    status: 'Draft',
    language: 'English (US)',
    prompt: 'You are Alex, Senior Sales Executive at VoCall. Your goal is to qualify lead budget, authority, need, and timeline (BANT) within 4 minutes.',
    tags: ['Sales', 'Qualification'],
    voice: { name: 'Aditi — Hinglish', provider: 'Sarvam AI', gender: 'Female', latency: '190ms', cost: 'Low' },
    telephony: { provider: 'Twilio', number: '+1 (800) 412-9876', inbound: true, outboundCallerId: '+18004129876' },
    memory: { enabled: true, shortTerm: true, longTerm: true, maxFacts: 3, episodic: true, maxEpisodes: 2, graph: false },
    emotion: { enabled: true, textSignal: true, audioSignal: false, toneAdaptation: true, frustrationThreshold: 0.8, triggerAction: 'None' },
    stats: { calls: 4120, duration: '5m 10s', success: '78.2%', emotionScore: 0.84, totalCostInr: '₹ 4,800', totalCostUsd: '$ 58.00' }
  },
  {
    id: 'agent-3',
    name: 'Appointment Bot',
    avatar: 'A',
    description: 'Reschedules appointments and sends Google Calendar invites.',
    status: 'Live',
    language: 'English / Hindi',
    prompt: 'You are the automated booking assistant. Confirm date, time, and timezone before dispatching invites.',
    tags: ['Appointment Booking'],
    voice: { name: 'Octave — Emotive', provider: 'Hume AI', gender: 'Male', latency: '210ms', cost: 'Medium' },
    telephony: { provider: 'Plivo', number: '+91 98765 43210', inbound: true, outboundCallerId: '+919876543210' },
    memory: { enabled: true, shortTerm: true, longTerm: true, maxFacts: 5, episodic: true, maxEpisodes: 5, graph: true },
    emotion: { enabled: true, textSignal: true, audioSignal: true, toneAdaptation: true, frustrationThreshold: 0.65, triggerAction: 'Send SMS' },
    stats: { calls: 9840, duration: '2m 15s', success: '92.4%', emotionScore: 0.68, totalCostInr: '₹ 8,100', totalCostUsd: '$ 98.00' }
  }
];

export const INITIAL_CONTACTS = [
  {
    id: 'c-1',
    name: 'Nora Aris',
    phone: '+1 415 555 0142',
    email: 'nora@studio.co',
    tags: ['VIP Client', 'Frequent Caller'],
    lastCall: 'Apr 18, 2026',
    emotionScore: 0.72,
    memory: {
      shortTerm: 'Active call ended 2 hours ago. Mentioned password reset loop.',
      longTerm: [
        { fact: 'Prefers email confirmation over SMS', date: 'Apr 10', emotion: 'neutral' },
        { fact: 'Account Tier: Enterprise Team Plan (50 seats)', date: 'Mar 28', emotion: 'positive' },
        { fact: 'Primary Stack: Supabase + Next.js', date: 'Mar 15', emotion: 'neutral' }
      ],
      episodic: [
        { summary: 'Caller reported stuck password reset loop. Magic link dispatched.', date: 'Apr 18', emotion: '+0.55', keyFacts: ['Password loop', 'Magic link sent'] },
        { summary: 'Inquired about HIPAA compliance VPC deployment timeline.', date: 'Apr 12', emotion: '+0.80', keyFacts: ['HIPAA VPC', 'Signed NDA'] }
      ],
      graph: {
        nodes: [
          { id: 'Nora Aris', type: 'Entity', color: '#4f7a65' },
          { id: 'Password Loop', type: 'Topic', color: '#c26a5a' },
          { id: 'Magic Link', type: 'Action', color: '#202124' },
          { id: 'Enterprise Plan', type: 'Topic', color: '#6b6b6b' },
          { id: 'HIPAA VPC', type: 'Topic', color: '#4f7a65' }
        ],
        links: [
          { source: 'Nora Aris', target: 'Password Loop', label: 'FRUSTRATED_ABOUT' },
          { source: 'Nora Aris', target: 'Enterprise Plan', label: 'SUBSCRIBED_TO' },
          { source: 'Password Loop', target: 'Magic Link', label: 'RESOLVED_BY' },
          { source: 'Nora Aris', target: 'HIPAA VPC', label: 'INQUIRED_ABOUT' }
        ]
      }
    }
  },
  {
    id: 'c-2',
    name: 'Devon Vance',
    phone: '+1 650 312 9081',
    email: 'devon@vance.io',
    tags: ['Sales Lead', 'Evaluation'],
    lastCall: 'Apr 17, 2026',
    emotionScore: 0.45,
    memory: {
      shortTerm: 'No active call.',
      longTerm: [
        { fact: 'Evaluating VoCall against Vapi for 100k mins/mo', date: 'Apr 17', emotion: 'warn' },
        { fact: 'Requires Sarvam AI Hinglish TTS for regional India rollout', date: 'Apr 17', emotion: 'positive' }
      ],
      episodic: [
        { summary: 'Sales qualification call. Requested Sarvam AI benchmark comparison.', date: 'Apr 17', emotion: '0.45', keyFacts: ['100k mins/mo', 'Sarvam AI'] }
      ],
      graph: {
        nodes: [
          { id: 'Devon Vance', type: 'Entity', color: '#4f7a65' },
          { id: '100k Mins Volume', type: 'Topic', color: '#202124' },
          { id: 'Sarvam AI', type: 'Topic', color: '#4f7a65' }
        ],
        links: [
          { source: 'Devon Vance', target: '100k Mins Volume', label: 'REQUIRES' },
          { source: 'Devon Vance', target: 'Sarvam AI', label: 'EVALUATING' }
        ]
      }
    }
  }
];

export const INITIAL_CALLS = [
  {
    id: 'call-101',
    direction: 'IN',
    from: '+1 415 555 0142',
    to: 'Support Lead',
    date: 'Apr 18, 2026 · 04:12',
    duration: '04:12',
    status: 'Completed',
    emotionScore: 0.72,
    testTag: false,
    agentName: 'Support Lead',
    contactName: 'Nora Aris',
    transcript: [
      { speaker: 'Caller', text: "I've been trying to reset my password all morning.", time: '00:04' },
      { speaker: 'Agent', text: "I hear you — I'm on it. Pulling your account up now.", time: '00:08' },
      { speaker: 'Caller', text: "It keeps looping back to the login screen.", time: '00:15' },
      { speaker: 'Agent', text: "Sending a magic link to nora@studio.co, arriving in 5 seconds.", time: '00:22' },
      { speaker: 'Caller', text: "Got it, thank you!", time: '00:30' }
    ],
    analysis: {
      summary: 'Caller reported stuck password reset loop. Agent verified account, dispatched magic link, confirmed receipt. Frustration resolved by turn 4.',
      success: 'Resolved (Rubric: Issue Resolved)',
      emotionDelta: '-0.32 → +0.55',
      structuredData: {
        issue: 'password_reset',
        channel: 'email',
        resolved: true,
        emotion_state: 'recovered'
      },
      memoryRecalled: [
        'Short-term: Active password reset loop',
        'Long-term: Prefers email over SMS',
        'Episodic: Billing dispute resolved on Apr 10',
        'Graph: Frustrated_about → Password Loop (x3)'
      ],
      graphContextUsed: [
        'Nora Aris -[FRUSTRATED_ABOUT]-> Password Loop',
        'Password Loop -[RESOLVED_BY]-> Magic Link'
      ]
    }
  },
  {
    id: 'call-102',
    direction: 'OUT',
    from: 'Sales Qualifier',
    to: '+1 650 312 9081',
    date: 'Apr 17, 2026 · 02:45',
    duration: '02:45',
    status: 'Completed',
    emotionScore: 0.45,
    testTag: true,
    agentName: 'Sales Qualifier',
    contactName: 'Devon Vance',
    transcript: [
      { speaker: 'Agent', text: "Hi Devon, calling from VoCall regarding your enterprise inquiry.", time: '00:02' },
      { speaker: 'Caller', text: "Yes, we need to handle 100k minutes per month with Sarvam AI voice models.", time: '00:10' },
      { speaker: 'Agent', text: "We support Sarvam AI natively with BYOK pricing. Let's get an architect assigned.", time: '00:18' }
    ],
    analysis: {
      summary: 'Outbound sales qualification call. Prospect confirmed 100k mins/mo volume with Sarvam AI requirement.',
      success: 'Qualified (Rubric: Enterprise BANT)',
      emotionDelta: '+0.10 → +0.45',
      structuredData: {
        budget_verified: true,
        volume_mins: 100000,
        provider: 'Sarvam AI'
      },
      memoryRecalled: [
        'Long-term: Evaluating VoCall against Vapi'
      ],
      graphContextUsed: [
        'Devon Vance -[EVALUATING]-> Sarvam AI'
      ]
    }
  }
];

export const INITIAL_API_KEYS = [
  { provider: 'Groq', desc: 'LLM, STT, Emotion NLP', required: true, key: 'gsk_98a72b...3f81', status: 'Connected' },
  { provider: 'Sarvam AI', desc: 'Hinglish STT + TTS (Hindi, Marathi)', required: false, key: 'srv_45a11...8892', status: 'Connected' },
  { provider: 'Cartesia', desc: 'Sub-200ms English TTS', required: false, key: 'crt_0921...4412', status: 'Connected' },
  { provider: 'Hume AI', desc: 'Audio Emotion + Emotional TTS (EVI)', required: false, key: 'hume_771a...9910', status: 'Connected', charsUsed: 4200, charsLimit: 10000, minutesUsed: 2.1, minutesLimit: 5.0 },
  { provider: 'Cerebras', desc: 'Ultra-fast LLM fallback', required: false, key: '', status: 'Not Configured' },
  { provider: 'Twilio', desc: 'Telephony Account SID & Auth Token', required: false, key: 'AC9821...8831', status: 'Connected' },
  { provider: 'Plivo', desc: 'India & International Telephony', required: false, key: 'PLI_8820...1129', status: 'Connected' },
  { provider: 'Exotel', desc: 'Indian carrier SIP trunking', required: false, key: 'EXO_1029...7712', status: 'Connected' },
  { provider: 'Resend', desc: 'Transactional email during/post call', required: false, key: 're_1298...3341', status: 'Connected' }
];

export const INITIAL_NUMBERS = [
  { number: '+1 (415) 555-0142', provider: 'Exotel', agent: 'Support Lead', kycStatus: 'Approved' },
  { number: '+1 (800) 412-9876', provider: 'Twilio', agent: 'Sales Qualifier', kycStatus: 'Approved' },
  { number: '+91 98765 43210', provider: 'Plivo', agent: 'Appointment Bot', kycStatus: 'Pending Verification' }
];
