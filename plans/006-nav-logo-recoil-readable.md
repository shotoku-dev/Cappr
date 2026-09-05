# 006 — Make nav logo recoil readable before clockwise spin

- **Status**: DONE
- **Commit**: `32a7368`
- **Severity**: MEDIUM
- **Category**: Easing & duration / Physicality
- **Estimated scope**: 1 file (`client/src/landing/landing.css`), ~25 lines

## Problem

The navbar Cappr mark is meant to wind up counter-clockwise, then spin forward clockwise on hover. Right now the wind-up is almost invisible.

`client/src/landing/landing.css:162-177` — current:

```css
.landing-nav__logo:hover .landing-nav__logo-mark,
.landing-nav__logo:focus-visible .landing-nav__logo-mark {
  animation: landing-nav-logo-spin 700ms cubic-bezier(0.22, 1.05, 0.36, 1) both;
}

@keyframes landing-nav-logo-spin {
  0% {
    transform: rotate(0deg);
  }
  16% {
    transform: rotate(-14deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
```

Why it fails:

1. Recoil peaks at **16% of 700ms ≈ 112ms** — too short to read.
2. A single strong ease-out on the whole animation rushes the early frames, so the counter-clockwise phase is skipped visually.
3. **−14deg** is a mild wind-up for a thick-stroke mark; it does not telegraph “recoil” clearly before the long clockwise arc.

This is occasional marketing delight on the landing nav (not a high-frequency UI control), so a longer, more readable wind-up is appropriate.

## Target

Replace the hover/focus animation and keyframes with a three-phase timeline: **slow wind-up → brief hold → smooth clockwise full turn**. Keep `transform` only. Keep the existing reduced-motion kill switch; also gate pointer hover so touch does not false-fire.

Exact values (from improve-animations AUDIT.md):

- On-screen morphing curve (wind-up): `--ease-in-out` equivalent `cubic-bezier(0.77, 0, 0.175, 1)`
- Forward response curve (spin): `--ease-out` equivalent `cubic-bezier(0.23, 1, 0.32, 1)`
- Total duration: **950ms** (marketing / delight — allowed longer than the 300ms UI budget)
- Recoil angle: **−20deg**
- Recoil occupies ~0–32% (~300ms), hold ~32–40%, spin 40–100%

```css
/* target — client/src/landing/landing.css */

.landing-nav__logo-mark {
  display: block;
  width: 42px;
  height: 42px;
  transform-origin: center;
}

@media (hover: hover) and (pointer: fine) {
  .landing-nav__logo:hover .landing-nav__logo-mark {
    animation: landing-nav-logo-spin 950ms both;
  }
}

.landing-nav__logo:focus-visible .landing-nav__logo-mark {
  animation: landing-nav-logo-spin 950ms both;
}

@keyframes landing-nav-logo-spin {
  0% {
    transform: rotate(0deg);
    animation-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
  }
  32% {
    transform: rotate(-20deg);
    animation-timing-function: linear;
  }
  40% {
    transform: rotate(-20deg);
    animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .landing-nav__logo:hover .landing-nav__logo-mark,
  .landing-nav__logo:focus-visible .landing-nav__logo-mark {
    animation: none;
  }
}
```

## Repo conventions to follow

- Landing motion lives in plain CSS next to the component styles (`client/src/landing/landing.css`), not a shared token file — keep the curves inlined on these keyframes (matching the existing local `@keyframes landing-nav-logo-spin` pattern).
- Prefer `transform` / `opacity` only (already true here).
- Reduced-motion pattern already present at `landing.css:179-184` — preserve it; do not delete movement feedback for other landing elements.
- Exemplar of local landing keyframes + reduced-motion: the block currently at `client/src/landing/landing.css:162-184`.

## Steps

1. Open `client/src/landing/landing.css`.
2. Delete the combined hover/focus-visible rule at lines 162–165 that sets `animation: landing-nav-logo-spin 700ms cubic-bezier(0.22, 1.05, 0.36, 1) both`.
3. Insert the two separate triggers from **Target**:
   - Hover only inside `@media (hover: hover) and (pointer: fine)`
   - `:focus-visible` outside that media query (keyboard still gets the spin)
4. Replace `@keyframes landing-nav-logo-spin` with the four-stop keyframes from **Target** (0% / 32% / 40% / 100%, −20deg hold, per-stop `animation-timing-function` values exactly as written).
5. Leave `.landing-nav__logo-mark` size (`42px`) and `transform-origin: center` unchanged.
6. Leave the existing `@media (prefers-reduced-motion: reduce)` block in place (same selectors, `animation: none`). If the hover selector is now nested under the fine-pointer media query, keep the reduced-motion rule listing both `.landing-nav__logo:hover .landing-nav__logo-mark` and `.landing-nav__logo:focus-visible .landing-nav__logo-mark` so either trigger is cancelled.
7. Do not change footer logo hover opacity, `RouteTrafficIllustration`, or any SVG assets.

## Boundaries

- Do NOT touch `LandingFooter.tsx`, `footer.css`, `RouteTrafficIllustration.tsx`, or brand SVGs.
- Do NOT change logo size, color, or markup in `LandingNav.tsx`.
- Do NOT add Framer Motion / JS for this — CSS keyframes only.
- Do NOT introduce shared motion tokens unless they already exist in the repo (they do not for landing CSS).
- If the keyframes block has moved since commit `32a7368`, STOP and report instead of guessing.

## Verification

- **Mechanical**: no new TypeScript; CSS-only. Optional: load the landing page and confirm no console errors.
- **Feel check**:
  - Hover the nav logo on a fine pointer device. You should clearly see a **slow counter-clockwise wind-up** to about −20°, a brief pause, then a **smooth clockwise** full rotation back to upright.
  - In DevTools Animations panel, set playback to **10%**. Confirm: (1) first ~300ms travel only negative rotation; (2) angle holds near −20°; (3) remaining time goes −20° → 360° without jumping.
  - Unhover mid-spin: animation stops (CSS keyframe limitation — acceptable for this rare delight). Re-hover should restart from 0°.
  - Keyboard focus the logo link: same spin plays once via `:focus-visible`.
  - Toggle `prefers-reduced-motion: reduce` (Rendering panel): no rotation.
  - On a coarse pointer / touch emulation: hover must not spin (fine-pointer media query).
- **Done when**: at normal speed, a human can narrate “wind back… then spin forward” without slowing the timeline; reduced-motion and touch gates still hold.
