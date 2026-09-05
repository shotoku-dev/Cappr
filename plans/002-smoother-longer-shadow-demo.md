# 002 — Longer, smoother Shadow log before the eye

- **Status**: DONE
- **Commit**: `32a7368`
- **Severity**: MEDIUM
- **Category**: Missed opportunities / easing & duration (marketing polish)
- **Estimated scope**: 2 files (`EnforcementTierIllustration.tsx`, `LandingEnforcementSection.tsx`), ~40–60 LOC

## Problem

The Shadow progressive demo reaches the eye too fast and with too little setup. From mount to eye is only **1040ms** with a single preamble line, so the “caught by policy” moment doesn’t earn its beat. Enter motion is also slightly off the transitions.dev usage grid (snappy / zoomy rather than smooth).

Current timing + lines — `client/src/landing/EnforcementTierIllustration.tsx:28-46`:

```ts
const META_ENTER_DUR = 0.2;
const LINE_ENTER_DUR = 0.22;
const BEACON_ENTER_DUR = 0.2;

const DEMO = {
  meta: 0,
  line0: 280,
  line1: 780,
  eye: 1040,
  stamp: 1280,
  line2: 1780,
} as const;

const AGENT_LINES = [
  { time: "14:02", text: "Retry embeddings batch #46 — rate limit cleared", watched: false },
  { time: "14:02", text: `Dispatch ${ACTION}`, watched: true },
  { time: "14:02", text: `Provider ack · ${AMOUNT}`, watched: false },
] as const;
```

Eye pre-scale is `0.92` (below the ~0.9 “zoom” floor for UI chrome) — `EnforcementTierIllustration.tsx:192`:

```tsx
initial={{ opacity: 0, transform: "scale(0.92)" }}
```

Observe dwell is still `5200` — `LandingEnforcementSection.tsx:35` — too short once preamble grows.

## Target

### Copy — five log rows (two new preamble beats before Dispatch)

Replace `AGENT_LINES` with:

```ts
const AGENT_LINES = [
  {
    time: "13:58",
    text: "Policy check · daily budget €2,000 remaining",
    watched: false,
  },
  {
    time: "14:00",
    text: "Queued embeddings batch #47 · estimate €512",
    watched: false,
  },
  {
    time: "14:02",
    text: "Retry embeddings batch #46 — rate limit cleared",
    watched: false,
  },
  {
    time: "14:02",
    text: `Dispatch ${ACTION}`,
    watched: true,
  },
  {
    time: "14:02",
    text: `Provider ack · ${AMOUNT}`,
    watched: false,
  },
] as const;
```

Only the Dispatch row stays `watched: true` (eye mounts there).

### Beat sheet (ms from observe mount)

Intentional story delays (not list stagger). Keep ≥~400ms between line mounts so each row is readable.

| t (ms) | Event |
| --- | --- |
| 0 | Meta (pill + `running`) |
| 320 | Line 0 — policy check |
| 760 | Line 1 — queued batch |
| 1200 | Line 2 — retry / rate limit |
| 1640 | Line 3 — Dispatch (watched) |
| **1980** | **Eye** on Dispatch |
| 2300 | Stamp |
| 2780 | Line 4 — Provider ack |
| hold | Until dwell |

### Motion tokens (literal values — project has no `_root.css` yet)

Match **usage**, not nearest current number. Keep Framer `ease: [0.22, 1, 0.36, 1]` (`--ease-smooth-out` / existing `--resize-ease`).

| Motion | Current | Target (token → literal) |
| --- | --- | --- |
| Meta / line enter duration | 200–220ms | **250ms** (`--duration-fast` — surface open / soft reveal) |
| Eye / stamp enter duration | 200 / 240ms | **250ms** (`--duration-fast`) |
| Line / meta travel | `translateY(6px)` | keep **6px** (`--distance-small`) |
| Stamp travel | `translateY(8px)` | keep **8px** (`--distance-base`) |
| Eye pre-scale | `0.92` | **`0.96`** (`--scale-large` — soft pop, no zoom) |
| Stamp pre-scale | `0.96` | keep **0.96** (`--scale-large`) |
| Stamp exit | `translateY(6px) scale(0.98)` | keep; exit quieter than enter |

Constants to set:

```ts
const STORY_EASE = [0.22, 1, 0.36, 1] as const;
const META_ENTER_DUR = 0.25;
const LINE_ENTER_DUR = 0.25;
const BEACON_ENTER_DUR = 0.25;

const DEMO = {
  meta: 0,
  line0: 320,
  line1: 760,
  line2: 1200,
  line3: 1640, // Dispatch (watched)
  eye: 1980,
  stamp: 2300,
  line4: 2780, // Provider ack
} as const;
```

In `LandingEnforcementSection.tsx`:

```ts
const OBSERVE_DWELL_MS = 7200; // ~4.4s hold after ack lands
const STAMP_ENTER_DUR = 0.25;
```

### Timer wiring

Update the `useEffect` timer list to five line reveals:

```ts
const timers: number[] = [
  window.setTimeout(() => setShowMeta(true), DEMO.meta),
  window.setTimeout(() => setVisibleLineCount(1), DEMO.line0),
  window.setTimeout(() => setVisibleLineCount(2), DEMO.line1),
  window.setTimeout(() => setVisibleLineCount(3), DEMO.line2),
  window.setTimeout(() => setVisibleLineCount(4), DEMO.line3),
  window.setTimeout(() => setShowEye(true), DEMO.eye),
  window.setTimeout(() => onStampVisibleChange?.(true), DEMO.stamp),
  window.setTimeout(() => setVisibleLineCount(5), DEMO.line4),
];
```

Reduced motion: `setVisibleLineCount(AGENT_LINES.length)` (not hardcoded `3`).

Eye enter:

```tsx
initial={{ opacity: 0, transform: "scale(0.96)" }}
animate={{ opacity: 1, transform: "scale(1)" }}
transition={{ duration: BEACON_ENTER_DUR, ease: STORY_EASE }}
```

## Repo conventions to follow

- Easing already matches `--resize-ease` / `--landing-ease-out` (`cubic-bezier(0.22, 1, 0.36, 1)` in `client/src/index.css`).
- Full `transform` strings + `opacity` only (no Framer `x`/`y`/`scale` shorthands).
- Stamp remains sibling of the motion panel with `enforcement-tier-illus__stamp-motion` for BorderBeam stacking.
- Exemplar: current ObserveView sequencing in `EnforcementTierIllustration.tsx` (extend, don’t rewrite architecture).

## Steps

1. In `EnforcementTierIllustration.tsx`, replace `AGENT_LINES`, `DEMO`, and enter duration constants with the Target values above.
2. Update the observe `useEffect` timers and reduced-motion `visibleLineCount` to `AGENT_LINES.length`.
3. Change eye `scale(0.92)` → `scale(0.96)`; set beacon/line/meta durations to `0.25`.
4. In `LandingEnforcementSection.tsx`, set `OBSERVE_DWELL_MS = 7200` and `STAMP_ENTER_DUR = 0.25`.
5. Visually confirm five lines fit the 16:9 observe card without clipping. If the last line or stamp clips: reduce `.enforcement-tier-illus__observe-log` gap from `var(--spacing-space-3)` to `var(--spacing-space-2)` **only under** `.enforcement-tier-illus--observe` — do not change other tiers.

## Boundaries

- Do NOT change ladder copy, BorderBeam props, or nudge/approve/block illustrations.
- Do NOT add `_root.css` / CSS variables in this pass (literals only; optional follow-up to tokenize).
- Do NOT use `scale(0)` or Framer scale/x/y shorthands.
- Do NOT shorten the delay before the eye — the point of this plan is a longer preamble.
- If layout clips after five lines and gap tweak isn’t enough, STOP and report rather than shrinking type below 11px/12px.

## Verification

- **Mechanical**: `cd client && npx tsc --noEmit -p tsconfig.json` passes.
- **Feel check**:
  1. Enter Shadow: three setup lines with rising timestamps land **before** Dispatch; eye only after Dispatch; then stamp; then ack.
  2. Animations panel @ 10%: line enters feel softer (~250ms); eye starts at **0.96**, not 0.92.
  3. Full sequence completes with ≥1.5s hold before auto-advance to Nudge (`OBSERVE_DWELL_MS = 7200`).
  4. `prefers-reduced-motion: reduce`: all five lines + eye + stamp immediate.
  5. No clipping of stamp or last log line inside the card.
- **Done when**: eye appears no earlier than ~2s after mount; two distinct preamble rows exist before the old retry line; motion uses 250ms / 0.96 scale targets above.
