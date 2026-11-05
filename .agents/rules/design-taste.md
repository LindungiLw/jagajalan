# UI/UX & Visual Design Rules: High-End Editorial & Anti-AI-Slop

## 1. Absolute Zero Directive (Strict Anti-Patterns)
- **NO Banned Borders & Nested Boxes**: Never place a card inside a card with repetitive 1px solid gray borders (`border-slate-200`). Avoid the "card-in-card" syndrome.
- **NO Rainbow Badges / Pill Overload**: Do not plaster every column or card with pastel-colored rounded pills (green, blue, purple, orange, red). Use typographic contrast, subtle status dots, or quiet neutral tones.
- **NO Harsh Shadows**: Never use heavy drop shadows (`shadow-md`, dark rgba). Use soft ambient diffusion (`shadow-2xs`, `shadow-xs`) or borderless hairline dividers.
- **NO Cluttered Micro-Stats**: Avoid squeezing numbers and labels into tight boxes. Give data generous breathing room.
- **NO Generic Icons**: Icons must be ultra-light, purposeful, and never purely decorative noise.

## 2. Aesthetic Archetype: Soft Structuralism & Editorial Authority
JagaJalan is a high-stakes public transparency, civic audit, and governance watchdog platform. It must look like an authoritative $150k+ agency/investigative journalism build (e.g., Stripe Press, Gov.uk, Linear, Bloomberg Terminal meets Vercel Editorial).
- **Color Discipline (Single Accent Rule)**: The interface is dominated by calm porcelain, off-white, deep slate (`text-slate-900`), and quiet neutrals. Vibrant orange (`#c2410c`) and crimson (`rose-600`) are reserved strictly for actionable CTAs and critical investigative anomalies/delays.
- **Typographic Scale & Hierarchy**: Differentiate sections using crisp, deliberate size and weight contrast (large bold numerals with small muted tabular labels) rather than colorful backgrounds.
- **Hairline Dividers**: Use subtle hairline borders (`divide-slate-100`, `border-slate-100` or `border-slate-200/60`) instead of heavy boxed framing.

## 3. Component Architecture & Micro-Aesthetics
- **Double-Bezel Container**: When a container is necessary, use a subtle outer tray (`bg-slate-50/70 p-1.5 rounded-2xl`) and an inner white core (`bg-white rounded-[calc(1rem-0.25rem)] shadow-2xs`).
- **Button-in-Button CTA**: Primary interactive buttons use a refined pill or squircle structure, with trailing arrows or icons nested in their own subtle circular sub-container (`w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center`).
- **Fluid Micro-Interactions**: Use physical spring transitions (`transition-all duration-200 active:scale-[0.98]`) and hover states that feel tactile.

## 4. Data Tables
- **Fit 100% Without Horizontal Scroll**: On standard desktop and tablet screens, tables must never require horizontal scrolling. Use proportional layout (`table-fixed`), concise two-tier cell stacks (main label on top, muted metadata underneath), and hidden non-critical columns on mobile (`hidden sm:table-cell`).
- **Tabular Numerals**: Always use `tabular-nums` for monetary amounts, percentages, and dates for perfect vertical alignment.

