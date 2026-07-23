# UI & Design System Specifications for `design.md` (`changesui.md`)

This document outlines all new UI components, interactive states, design system tokens, and UX flows added for **Web Call Testing** and **Agent Studio** that need to be incorporated into your updated `design.md` design file.

---

## 1. Web Call Trigger & Header Integration

### Location: `/dashboard/agents/[id]` (Agent Studio Top Bar)

- **Button Component**: `"Talk To Agent"`
  - **Style**: Secondary Outline Button with subtle violet accent borders (`border-[#7C3AED]/50`, text `#A78BFA`, hover `bg-[#7C3AED]/20`).
  - **Icon**: `PhoneCall` (Lucide icon).
  - **Position**: Mounted in top-right action bar next to *Voice Catalog*, *Save*, and *Publish* buttons.
  - **Behavior**: Clicking opens the full-screen modal overlay `WebCallModal`.

---

## 2. Web Call Modal (`WebCallModal.tsx`) Component Architecture

### Overlay & Layout Specs
- **Backdrop**: Full viewport backdrop with dark frosted glass effect (`bg-black/70 backdrop-blur-sm`).
- **Modal Container**:
  - Max width: `max-w-3xl` (~768px).
  - Surface: `bg-slate-900`, border `border-slate-700`, rounded `rounded-2xl`, shadow `shadow-2xl`.
  - Max height constraint: `max-h-[90vh]` with vertical flex layout for header, main body, and footer/controls.

---

## 3. Web Call Lifecycle States & UI Specifications

### Phase 1: Pre-Call Setup (`idle` / `requesting_mic`)
- **Customer Contact Input**:
  - Field label: `YOUR NAME` (Mono, uppercase, muted).
  - Input field: Text input with `User` icon prefix. Required to start call.
  - Design Purpose: Links the test session to Supabase `contacts` table to trigger 4-tier memory retrieval (Short-term, Long-term facts, Episodic summaries, Knowledge graph).
- **Voice Orb (Idle State)**:
  - Static 96px orb with `PhoneCall` icon, neutral dark slate border.
- **Mic Permission Badge**:
  - Shows browser microphone permission status (`Mic` icon with purple text, or red warning if permission denied).
- **Primary CTA**: `"Start Web Call"`
  - Violet pill button (`bg-[#7C3AED] hover:bg-[#7C3AED]/90 rounded-full shadow-lg shadow-[#7C3AED]/30`).
  - Disabled state: `opacity-40` until name is entered and mic is requested.

---

### Phase 2: Connecting (`connecting`)
- **Voice Orb (Pulsing State)**:
  - 96px orb with animated pulse glow (`bg-[#7C3AED]/30 border-2 border-[#7C3AED]/60 animate-pulse`).
  - Loading spinner (`Loader2` rotating icon).
- **Status Subtext**: Monospace pulsing text: `"Connecting to [Agent Name]…"`.

---

### Phase 3: Active Call (`active`)
- **Top Header Bar**:
  - **Live Indicator**: Red blinking pulse dot + `LIVE` text (`text-red-400 font-mono text-xs`).
  - **Call Timer**: Monospace timer formatted `M:SS` (`text-slate-400 font-mono`).
  - **Close Button**: Top-right `X` icon button triggering call end.

- **Split View Body**:
  - **Left Section (Audio Visualizer & Orb — Width 256px)**:
    - **Dynamic Voice Orb**:
      - **Agent Speaking State**: Enlarged orb (112px), solid purple `bg-[#7C3AED]`, multi-layered expanding ping animation (`bg-[#7C3AED]/20 animate-ping`), label `"Agent speaking…"`.
      - **User Speaking State**: Green orb (104px), solid emerald `bg-emerald-600`, green ping pulse (`bg-emerald-500/20`), label `"You are speaking…"`.
      - **Idle/Listening State**: Medium purple orb (96px) with soft glow, label `"Listening…"`.
    - **End Call Action**: Red outline pill button (`bg-red-600/20 border-red-500/40 text-red-400 hover:bg-red-600/30`), `PhoneOff` icon.

  - **Right Section (Real-Time Live Transcript)**:
    - **Header**: Live transcript label with green status indicator.
    - **Scroll Container**: Flex-1 auto-scrolling container with thin custom scrollbar.
    - **Message Bubbles**:
      - **Agent Turns**: Left-aligned, dark slate bubble (`bg-slate-800 text-slate-200 rounded-2xl rounded-tl-sm`), Bot avatar badge (`bg-[#7C3AED]/30 text-[#A78BFA]`).
      - **User Turns**: Right-aligned, purple-tinted bubble (`bg-[#7C3AED]/20 border border-[#7C3AED]/30 text-slate-200 rounded-2xl rounded-tr-sm`), User avatar badge (`bg-emerald-500/20 text-emerald-400`).

---

### Phase 4: Post-Call Decision Prompt (`ended`)
- **Header**: `CheckCircle2` success icon inside glowing purple circle.
- **Summary**: Total call duration (`Duration: M:SS`).
- **Transcript Preview Card**: Scrollable compact preview showing the last 4 dialogue turns.
- **Save vs. Discard Decision Card**:
  - Card Heading: *"Save this test call for review?"*
  - Explanation Text: *"Saved calls include the full transcript, emotion arc, and post-call analysis — viewable from your calls dashboard."*
  - **Action 1 — Discard**: Secondary outline button (`Trash2` icon, `border-slate-600 text-slate-300 hover:bg-slate-700`). Deletes test record.
  - **Action 2 — Save & View**: Primary CTA button (`ExternalLink` icon, `bg-[#7C3AED] hover:bg-[#7C3AED]/90`). Saves session and navigates directly to `/dashboard/calls/[callId]`.

---

## 4. Color Palette & Design Tokens (To Be Filled From Custom Design)

> [!NOTE]
> The color tokens below are template slots. Replace the values in this table with the exact color codes from your custom design.

| Token Name | Custom Hex / Variable | UI Component Mapping | Notes / Guidelines |
|---|---|---|---|
| `brand-primary` | `[ TO BE FILLED ]` | Primary CTAs, active agent orb glow, main brand accents | Main action color |
| `brand-accent` | `[ TO BE FILLED ]` | Secondary highlights, agent badges, sub-icons | Complementary accent |
| `status-live` | `[ TO BE FILLED ]` | Live recording indicator, pulse ring | Live call status |
| `user-speaking` | `[ TO BE FILLED ]` | User speaking orb state, user transcript badge | User audio indicator |
| `surface-bg` | `[ TO BE FILLED ]` | Fullscreen modal background, page backdrop | Base dark surface |
| `surface-card` | `[ TO BE FILLED ]` | Modal inner panels, transcript container, input fields | Elevated card surface |
| `border-subtle` | `[ TO BE FILLED ]` | Modal borders, card outlines, divider lines | Subtle structural borders |
| `text-primary` | `[ TO BE FILLED ]` | Headings, primary button text, main dialogue text | High-contrast text |
| `text-muted` | `[ TO BE FILLED ]` | Timers, status labels, placeholder text | Secondary text |
| `font-sans` | `[ TO BE FILLED ]` | Main interface typography | UI & transcript font |
| `font-mono` | `[ TO BE FILLED ]` | Timers, LIVE badges, technical metadata | Monospace font |

---

## 5. Next Steps for Updating `design.md`

1. **Figma / UI Design Sync**: Use the specs above to create mockups for:
   - `WebCallModal` (Pre-call, Active call with Orb, and Post-call Save/Discard states).
   - Agent Studio Top Bar header actions.
2. **Component Library Extensions**:
   - Add `VoiceOrb` to shared component design specs.
   - Add `TranscriptStream` chat bubble specifications.
   - Add `DecisionModalCard` pattern for test vs. production resource saving.
