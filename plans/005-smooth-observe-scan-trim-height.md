# 005 — Smoother observe scan highlight + trim card height

- **Status**: DONE
- **Commit**: `32a7368`
- **Severity**: HIGH (scan jank) · MEDIUM (card too tall)
- **Category**: Easing & duration · Physicality & origin · Cohesion & tokens
- **Estimated scope**: 2 files, ~45 lines changed

## Problem

Two related issues on the observe (card 1) enforcement illustration:

### A. Scan background feels abrupt, not smooth

The sliding grey/blue “focus” on log lines uses Framer `layoutId` on `.enforcement-tier-illus__log-scan`, but **two background layers fight each other**:

1. The scan pill (`motion.div.enforcement-tier-illus__log-scan`) animates position via shared layout.
2. The `<li>` simultaneously toggles `.enforcement-tier-illus__log-line--highlighted`, which applies an **instant** background on the row:

```css
/* enforcement-tier-illus.css:109–111 — current */
.enforcement-tier-illus__log-line--highlighted {
  background: color-mix(in oklch, var(--color-text-primary) 3.5%, transparent);
}
```

When `highlightIndex` changes, the old row loses `--highlighted` immediately (background vanishes) while the scan element is still animating away — producing a **flash / double-layer** effect instead of one continuous sliding tint.

The layout move itself is also tuned for a snappy UI entrance (`SCAN_MOVE_DUR = 0.6`, `STORY_EASE`), but AUDIT.md §2 prescribes **`ease-in-out`** for elements **moving on screen** (morphing between rows), not `ease-out`:

```ts
// EnforcementTierIllustration.tsx:36–37, 365–368 — current
const SCAN_MOVE_DUR = 0.6;
// ...
transition={
  reduceMotion
    ? { duration: 0 }
    : { duration: SCAN_MOVE_DUR, ease: STORY_EASE }
}
```

Cycle pacing leaves ~500ms dwell between 600ms moves (`CYCLE.scan1 - CYCLE.scan0 = 1100ms`), which is fine; the jerkiness is visual layering + easing, not interval timing.

### B. Observe card shell is too tall

Observe uses `ILLUS_ASPECT_OBSERVE = 5 / 6` (~**1.2×** the height of other tiers at `4/3`). That was added to fit six log lines + stamp, but reads as excessively long.

```ts
// LandingEnforcementSection.tsx:36–38 — current
const ILLUS_ASPECT = 4 / 3;
const ILLUS_ASPECT_OBSERVE = 5 / 6;
```

Observe rows also add extra vertical space:

```css
/* enforcement-tier-illus.css:87–91 — current */
.enforcement-tier-illus__log--observe .enforcement-tier-illus__log-line {
  min-height: 34px;
  padding: 6px var(--spacing-space-2) 6px calc(var(--spacing-space-3) + 2px);
}
```

## Target

### Scan highlight

- **One** moving background: only `.enforcement-tier-illus__log-scan` paints the row tint during the demo.
- Observe rows keep **text color** changes on `--highlighted` / `--watched-active`, but **no row-level background** on observe lines.
- Layout move: longer and smoother — **`0.78s`** duration, **`cubic-bezier(0.77, 0, 0.175, 1)`** (AUDIT.md strong ease-in-out for on-screen movement).
- Blue flash on watched row: keep existing 280ms CSS transition on `.enforcement-tier-illus__log-scan--active`; no change to `CYCLE` timestamps.
- Reduced motion: `duration: 0` on layout transition (unchanged behavior).

### Card height

- Observe aspect: **`9 / 8`** (width:height = 1.125 → height ≈ **0.89× width**, ~19% taller than `4/3`, clearly shorter than current `5/6`).
- Observe row `min-height`: **`30px`** (from 34px).
- Observe row vertical padding: **`5px`** top/bottom (from 6px).
- Keep reserved stamp row (`enforcement-tier-illus__tier--with-stamp`) — no stamp-driven resize.
- Tier swap resize gating from plan 004 stays: only animate aspect when `illusAspect` changes.

## Repo conventions to follow

- Landing story easing token: `STORY_EASE = [0.22, 1, 0.36, 1]` — keep for stamp, eye, meta, tier crossfade.
- On-screen morphs may use AUDIT ease-in-out `[0.77, 0, 0.175, 1]` even when other motion uses `STORY_EASE` (different job: sliding between rows vs entering UI).
- `useReducedMotion()` branches to `{ duration: 0 }`.
- `layoutId={`observe-scan-${playKey}`}` pattern stays — do not replace with keyframe height animation.

Exemplar for gated aspect resize: `LandingEnforcementSection.tsx` `prevAspectRef` / `aspectIsChanging` block from plan 004.

## Steps

### 1. Single-layer scan background on observe rows

**File:** `client/src/landing/enforcement-tier-illus.css`

Scope the instant row background **off** observe lines — text emphasis only:

```css
/* Add after .enforcement-tier-illus__log-line--highlighted block */
.enforcement-tier-illus__log--observe .enforcement-tier-illus__log-line--highlighted {
  background: transparent;
}

.enforcement-tier-illus__log--observe
  .enforcement-tier-illus__log-line--highlighted.enforcement-tier-illus__log-line--watched-active {
  background: transparent;
}
```

Keep `.enforcement-tier-illus__log-line--highlighted` rules for non-observe tiers unchanged (if any use them later). Text color rules under `--highlighted` stay as-is.

### 2. Smoother layout transition on the scan pill

**File:** `client/src/landing/EnforcementTierIllustration.tsx`

Update constants near top:

```ts
const SCAN_MOVE_DUR = 0.78;
const SCAN_MOVE_EASE = [0.77, 0, 0.175, 1] as const;
```

On the `motion.div` with `layoutId={`observe-scan-${playKey}`}` inside `ObserveView`, change transition to:

```tsx
transition={
  reduceMotion
    ? { duration: 0 }
    : { duration: SCAN_MOVE_DUR, ease: SCAN_MOVE_EASE }
}
```

Do **not** change `CYCLE` scan timestamps in this plan — feel-check first; only adjust intervals in a follow-up if the longer move feels late.

### 3. Trim observe card height

**File:** `client/src/landing/LandingEnforcementSection.tsx`

```ts
/** Observe log + stamp — slightly taller than 4/3, shorter than 5/6. */
const ILLUS_ASPECT_OBSERVE = 9 / 8;
```

Leave `ILLUS_ASPECT = 4 / 3` and existing `prevAspectRef` / `aspectIsChanging` / `ILLUS_RESIZE_DUR = 0.4` logic untouched.

### 4. Tighten observe row vertical metrics

**File:** `client/src/landing/enforcement-tier-illus.css`

In `.enforcement-tier-illus__log--observe .enforcement-tier-illus__log-line`:

```css
min-height: 30px;
padding: 5px var(--spacing-space-2) 5px calc(var(--spacing-space-3) + 2px);
```

Keep horizontal inset (`margin-left`, etc.) unchanged from current observe rules.

## Boundaries

- Do NOT change `CYCLE` timing, demo sequence, or `onDemoComplete` behavior.
- Do NOT change tier crossfade (plan 004 overlay pattern).
- Do NOT change nudge/approve/block illustrations.
- Do NOT add dependencies.
- Do NOT animate `aspect-ratio` on same-ratio tier swaps.

## Verification

### Mechanical

```bash
cd client && npm run build
```

Expect exit code 0.

### Feel check

1. Open enforcement section → observe tier.
2. **Scan smoothness:** Watch the grey highlight slide down all six lines.
   - One continuous pill — no flash where the previous row’s background disappears before the pill arrives.
   - Motion should feel **gliding**, not snappy/stepped.
   - At 10% playback (DevTools Animations): confirm only `.enforcement-tier-illus__log-scan` moves; `<li>` background stays transparent on observe rows.
3. **Blue beat:** On watched “Dispatch” row, scan turns blue smoothly (280ms), eye + stamp appear — unchanged timing.
4. **Card height:** Observe card should be noticeably **shorter** than current `5/6` but still fit six lines + stamp without clipping.
5. **Observe → nudge:** Shell shrinks from `9/8` → `4/3` once over ~400ms; no empty-frame flash (plan 004).
6. **`prefers-reduced-motion`:** Scan jumps row-to-row instantly; aspect snaps.

### Done when

- Scan highlight reads as one smooth sliding tint with no row-level background flash.
- Observe card height is between `4/3` and previous `5/6`, with no clipped log or stamp content.
- Build passes.
