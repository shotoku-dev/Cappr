# 003 — Observe meta spacing, green status pill, watched-line hierarchy

- **Status**: DONE
- **Commit**: `32a7368`
- **Severity**: MEDIUM
- **Category**: Missed opportunities (explanatory hierarchy) + cohesion
- **Estimated scope**: 2 files (`EnforcementTierIllustration.tsx`, `enforcement-tier-illus.css`), ~40 LOC

## Problem

Three readability gaps in the Shadow observe card:

1. **Tight meta → log spacing** — `.enforcement-tier-illus__observe-stage` uses `gap: var(--spacing-space-4)` for everything; the agent row sits too close to the first log line.
2. **“running” is plain muted text** — `EnforcementTierIllustration.tsx:193` — doesn’t read as a live status.
3. **Watched Dispatch line is barely distinct** — only slightly stronger text color + eye slot. The policy-hit row should be obviously different *before and as* the eye appears, without relying on the icon alone.

Current meta + status — `client/src/landing/EnforcementTierIllustration.tsx:191-194`:

```tsx
<div className="enforcement-tier-illus__observe-meta">
  <AgentPill />
  <span className="enforcement-tier-illus__observe-status">running</span>
</div>
```

Current watched differentiation — `client/src/landing/enforcement-tier-illus.css:275-298`:

```css
.enforcement-tier-illus__observe-line--watched {
  grid-template-columns: 36px max-content 22px;
  column-gap: 6px;
}

.enforcement-tier-illus__observe-line--watched .enforcement-tier-illus__observe-text {
  color: var(--color-text-secondary);
}
```

Stage gap — `enforcement-tier-illus.css:206-212`:

```css
.enforcement-tier-illus__observe-stage {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-space-4);
}
```

## Target

### 1. More space under the agent row

Keep stage as a column flex, but give the meta row its own bottom margin so log separation is larger than line-to-line gaps:

```css
.enforcement-tier-illus__observe-stage {
  gap: var(--spacing-space-3); /* tighten default; meta owns the larger separation */
}

.enforcement-tier-illus__observe-meta {
  margin-bottom: var(--spacing-space-3); /* + existing stage gap → visibly more air under atlas-researcher */
}
```

If that still feels tight in the 16:9 card, bump meta `margin-bottom` to `var(--spacing-space-4)` only — do not exceed `space-5`.

### 2. Replace “running” with a small green status pill

Markup:

```tsx
<span className="enforcement-tier-illus__status-pill">
  <span className="enforcement-tier-illus__status-pill-dot" aria-hidden />
  Running
</span>
```

Styles (match product greens; keep compact like the agent pill height ~20px):

```css
.enforcement-tier-illus__status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  box-sizing: border-box;
  height: 20px;
  padding: 0 8px 0 7px;
  border-radius: var(--radius-full);
  background: color-mix(in oklch, var(--color-status-success) 14%, transparent);
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  color: var(--color-status-success); /* --color-status-success: oklch(0.622 0.178 145.0) in index.css */
  text-transform: none; /* title case "Running", not lowercase */
}

.enforcement-tier-illus__status-pill-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-status-success);
  flex-shrink: 0;
}
```

Delete unused `.enforcement-tier-illus__observe-status` rules.

Reduced motion: no pulse on the dot (static is fine for a marketing still).

### 3. Make the watched (eye) line clearly different

**Hierarchy recipe** (crisp dashboard personality — no heavy glow):

When the watched line mounts, it already has `--watched`. When the eye appears (`showEye === true`), add `--watched-active` so the “caught” beat lands with the eye+stamp:

```tsx
className={[
  "enforcement-tier-illus__observe-line",
  line.watched && "enforcement-tier-illus__observe-line--watched",
  line.watched && showEye && "enforcement-tier-illus__observe-line--watched-active",
]
  .filter(Boolean)
  .join(" ")}
```

CSS:

```css
/* Always-on for the Dispatch row — readable even before the eye */
.enforcement-tier-illus__observe-line--watched {
  grid-template-columns: 36px minmax(0, 1fr) 22px;
  column-gap: 6px;
  margin-inline: calc(-1 * var(--spacing-space-2));
  padding: 5px var(--spacing-space-2);
  border-radius: var(--radius-sm);
  background: color-mix(in oklch, var(--color-text-primary) 3.5%, transparent);
}

.enforcement-tier-illus__observe-line--watched .enforcement-tier-illus__observe-time {
  color: var(--color-text-secondary);
}

.enforcement-tier-illus__observe-line--watched .enforcement-tier-illus__observe-text {
  color: var(--color-text-primary);
  font-weight: 500;
}

/* Soft lift when eye + stamp fire — opacity/color only via transition */
.enforcement-tier-illus__observe-line--watched-active {
  background: color-mix(in oklch, var(--color-accent-500) 8%, transparent);
}

.enforcement-tier-illus__observe-line--watched {
  transition:
    background-color 280ms cubic-bezier(0.22, 1, 0.36, 1);
}
```

Motion notes (AUDIT.md):
- Purpose: **state indication** — this row is the policy hit; rare marketing demo → delight budget OK.
- Do **not** animate layout (`padding`/`margin`) on activate — only `background-color` (and existing eye scale/opacity).
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (existing `STORY_EASE` / `--resize-ease`).
- Duration: **280ms** (between `--duration-fast` 250ms and medium; soft surface tint).
- `prefers-reduced-motion`: still apply the final `--watched` / `--watched-active` styles immediately; skip the 280ms transition:

```css
@media (prefers-reduced-motion: reduce) {
  .enforcement-tier-illus__observe-line--watched {
    transition: none;
  }
}
```

Non-watched lines stay muted (`--color-text-muted`) so the contrast gap is obvious.

## Repo conventions to follow

- Semantic greens: `var(--color-status-success)` / `var(--color-green-500)` from `client/src/index.css`.
- Radius / spacing tokens: `var(--radius-full)`, `var(--radius-sm)`, `var(--spacing-space-*)`.
- Observe agent pill already uses a quiet tinted chip — status pill should feel like a sibling, not a louder dashboard badge.
- Do not change DEMO timing, eye/stamp sync, or BorderBeam props.

## Steps

1. In `EnforcementTierIllustration.tsx`, replace the `running` span with the green status pill markup above.
2. In `enforcement-tier-illus.css`, add status-pill styles; remove `.enforcement-tier-illus__observe-status`.
3. Adjust `.enforcement-tier-illus__observe-stage` / `__observe-meta` spacing per Target §1.
4. Expand `--watched` styles and add `--watched-active` toggled when `showEye` is true; add reduced-motion transition kill.
5. Confirm five log lines + full-width stamp still fit the 16:9 card. If clipped, reduce watched vertical padding to `4px` before cutting log copy.

## Boundaries

- Do NOT change ladder copy, DEMO delays, or nudge/approve/block views.
- Do NOT add a pulsing/keyframed green dot.
- Do NOT use purple/glow aesthetics; keep green = status-success only.
- Do NOT animate width/height/margin on the watched activate beat.
- Do NOT move the stamp or eye slot structure.

## Verification

- **Mechanical**: `cd client && npx tsc --noEmit -p tsconfig.json`.
- **Feel check**:
  1. Clear air under `atlas-researcher` before the first log line.
  2. Top-right shows a small green **Running** pill (dot + label), not muted “running” text.
  3. Dispatch row has a quiet tint + stronger type **as soon as it appears**; when eye+stamp land, tint shifts slightly toward accent (280ms) without shoving layout.
  4. Other log lines stay muted by comparison.
  5. Reduced motion: final styles on, no background transition.
- **Done when**: a glance at the card makes the policy-hit line obvious even before noticing the eye icon; meta spacing and green pill match the targets above.
