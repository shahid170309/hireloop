---
name: HireLoop Adaptive Track
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464554'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777586'
  outline-variant: '#c7c4d7'
  surface-tint: '#5148d7'
  primary: '#2a14b4'
  on-primary: '#ffffff'
  primary-container: '#4338ca'
  on-primary-container: '#c1beff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#553300'
  on-tertiary: '#ffffff'
  tertiary-container: '#744800'
  on-tertiary-container: '#ffb759'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#100069'
  on-primary-fixed-variant: '#372abf'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 42px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
  code-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1rem
  margin-tablet: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
The design system establishes an intelligent, reassuring, and impeccably organized mobile-first environment for modern career mobility. Bridging the rigorous accountability of job tracking with the empathetic guidance of an AI interview coach, the aesthetic pairs hyper-clean SaaS utility with refined, tactile finish.

The style blends **Modern Minimalism** and **Subtle Structural Depth**:
- **Clarity over clutter:** Uncompromising typographic cadence and intentional negative space prevent dashboard cognitive overload.
- **Micro-elevation & Precision:** Surfaces layer with light slate borders, crisp card surfaces, and multi-stage ambient shadows to impart real-world tactile stability.
- **Emotional reassurance:** Career transitions provoke stress; interaction patterns, soft corner treatments, and color-coded status chips communicate progression, clarity, and structural confidence.

## Colors
The color architecture prioritizes legibility, context awareness, and semantic hierarchy. Grounded in a clinical yet warm slate substrate, functional accents immediately communicate pipeline state changes.

### Palette Architecture
- **Primary (`#4338CA` / `#4F46E5`):** Deep, decisive indigo. Anchors high-priority actions, primary buttons, bottom-navigation selection, and active AI interview feedback prompts.
- **Secondary / Success (`#10B981`):** Precision emerald green. Applied strictly to positive pipeline milestones: "Offer Received", accepted status, score improvements, and audio waveform completion.
- **Tertiary / Warning (`#F59E0B`):** Warm amber. Dictates pending events: upcoming interview rounds, urgent follow-ups, and in-progress prep items.
- **Informational Sky (`#0284C7`):** Focused blue designated for the "Applied" stage and resume/version history tracking tokens.
- **Neutral Canvas & Borders:** Canvas background sits on `#F8FAFC`, card elements utilize `#FFFFFF`, and structural delimiters lean on `#E2E8F0` with text spanning `#0F172A` (heading) down to `#64748B` (metadata labels).

## Typography
The system employs a dual-typeface strategy engineered for scannability and structural authority.

- **Plus Jakarta Sans (Headlines & Display):** Modern geometric apertures and friendly proportions lend an approachable yet polished executive tone to candidate dashboards, mock interview summaries, and company profile headers.
- **Inter (Body, Badges, Metrics & UI Labels):** Exceptional neutral legibility at small sizes, optimal for dense compensation ranges, stage timeline metadata, and conversational AI transcripts.

### Hierarchy Rules
- Maintain tight vertical metric balance; line-heights are intentionally proportional to compact mobile display requirements.
- Use `headline-xl-mobile` as the primary screen header on viewports below 640px.
- Use uppercase with widened letter-spacing (`label-sm`) exclusively for system tags, pipeline status codes, and badge tokens.

## Layout & Spacing
A fluid 4-column layout governs mobile screens, reflowing smoothly into an 8-column layout on tablet viewports.

### Rhythm & Alignment
- **Root Unit:** Strict 4px/8px incremental grid.
- **Horizontal Screen Padding:** 16px (`1rem`) on handheld devices, expanding to 24px (`1.5rem`) on tablets.
- **Component Breathing Space:** Job application cards stack with `space-sm` (8px) or `space-md` (16px) separation depending on density mode. Nested details (badges, salary tags, interview counters) utilize `space-xs` and `space-sm` for unified grouping.

## Elevation & Depth
Depth separates transient interactive states from foundational board views without visual noise.

- **Level 0 (Canvas Base):** Plain `#F8FAFC`, no elevation, pure context.
- **Level 1 (Cards & Form Containers):** Surface `#FFFFFF`, border `1px solid #E2E8F0`, and ambient shadow: `0px 1px 3px rgba(15, 23, 42, 0.04), 0px 4px 8px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Active Stage / Floating Cards / Modals):** Surface `#FFFFFF`, border `1px solid #CBD5E1`, shadow: `0px 4px 6px -1px rgba(67, 56, 202, 0.05), 0px 10px 15px -3px rgba(15, 23, 42, 0.08)`.
- **Level 3 (AI Coaching Session Overlays & Menus):** Surface `#FFFFFF` with glassmorphic backdrop filter (`backdrop-blur-md` on base scrim), shadow: `0px 20px 25px -5px rgba(15, 23, 42, 0.12), 0px 8px 10px -6px rgba(15, 23, 42, 0.06)`.

## Shapes
The system uses rounded geometry with distinct shape hierarchies to contrast content blocks with interactive tags.

- **Primary Cards & Containers:** Standardized at `rounded-2xl` (16px / `1rem`) to create smooth surfaces on mobile touchscreens.
- **Inner Modules & Form Controls:** Set at `rounded-xl` (12px / `0.75rem`) for text fields, audio wave players, and nested feedback boxes.
- **Status Pills & Chips:** Styled at 9999px (full pill) to distinguish metadata tokens (salary bands, interview stages, resume tags) from interactive rectangular containers.

## Components

### Buttons
- **Primary:** Background `#4338CA`, hover/active `#3730A3`, text `#FFFFFF`, height 48px, radius `rounded-xl`, font `label-md`. Includes soft inset highlight for tactile clarity.
- **Secondary / Ghost:** Transparent background, `1px solid #E2E8F0`, text `#0F172A`, active state `#F1F5F9`.
- **AI Coach Action:** Linear gradient `#4338CA` to `#4F46E5`, paired with an indigo glow shadow `0px 4px 14px rgba(79, 70, 229, 0.35)`.

### Chips & Pill Badges
- **Applied Badge:** Light sky background `#E0F2FE`, text `#0284C7`, `1px solid #BAE6FD`.
- **Interview Badge:** Light amber background `#FEF3C7`, text `#D97706`, `1px solid #FDE68A`.
- **Offer Badge:** Light emerald background `#D1FAE5`, text `#059669`, `1px solid #A7F3D0`.
- **Metadata Token (Salary / Resume V2):** Neutral background `#F1F5F9`, text `#475569`, border `1px solid #E2E8F0`, padding `2px 8px`, `label-sm`.

### Job Application Cards
- Surface `#FFFFFF`, padding `16px`, `rounded-2xl`, border `1px solid #E2E8F0`.
- Top row: Company icon (40x40px, `rounded-xl`), title/company stack, and stage status pill.
- Middle row: Salary range chip and location tag.
- Bottom row: Interview timeline indicator or next-action prompt with a subtle `#F8FAFC` background separator.

### Inputs & Text Areas
- Background `#FFFFFF`, border `1px solid #CBD5E1`, text `#0F172A`, placeholder `#94A3B8`, height 44px, `rounded-xl`.
- Focused state: Border `#4338CA` with an external focus ring: `0 0 0 3px rgba(67, 56, 202, 0.15)`.

### AI Audio Coach Waveform Bar
- Active listening container with `#0F172A` deep background or pure white `#FFFFFF` elevation level 2.
- Dynamic vertical sound bars transitioning between `#4F46E5` and `#10B981` during positive speech velocity metrics.