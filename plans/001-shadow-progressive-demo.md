# 001 — Progressive Shadow observe demo (log → eye → stamp)

- **Status**: DONE
- **Commit**: `32a7368`
- **Severity**: MEDIUM
- **Category**: Missed opportunities (explanatory / rare marketing delight) + Accessibility
- **Estimated scope**: 3 files (`LandingEnforcementSection.tsx`, `EnforcementTierIllustration.tsx`, optional CSS tweak in `enforcement-tier-illus.css`), ~80–120 LOC

## Problem

The Shadow (observe) illustration currently dumps the full story in one frame. When the ladder lands on observe, all three log lines, the eye beacon, and the outcome stamp mount immediately — so the beat “policy would have required approval, but shadow let it through” never plays out.

Current static render — `client/src/landing/EnforcementTierIllustration.tsx:72-99`:

```tsx
function ObserveView() {
  return (
    <div className="enforcement-tier-illus__observe">
      <div className="enforcement-tier-illus__observe-stage">
        <div className="enforcement-tier-illus__observe-meta">
          <AgentPill />
          <span className="enforcement-tier-illus__observe-status">running</span>
        </div>
        <ul className="enforcement-tier-illus__observe-log">
          {AGENT_LINES.map((line) => (
            <li /* … */>
              {/* … */}
              {line.watched ? <ShadowEyeBeacon /> : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

Stamp mounts instantly with no enter motion — `client/src/landing/LandingEnforcementSection.tsx:85-89`:

```tsx
const illus = (
  <div className="landing-enforcement__illus">
    <TierIllusPanel tier={activeTier.id} reduceMotion={reduceMotion} />
    {isObserve ? <ObserveStamp /> : null}
  </div>
);
```

Tier auto-advance is a flat `3800ms` for every rung (`CYCLE_MS`), which is too short for a readable progressive beat if observe keeps the same dwell.

## Target

When the section enters **observe** (auto-cycle or click), play a one-shot progressive demo. Exact beat sheet (clock starts after the panel enter, i.e. when observe content mounts):

| t (ms) | What appears | Motion |
| --- | --- | --- |
| 0 | Agent meta (pill + `running`) | opacity 0→1, `transform: translateY(6px)` → `translateY(0)`, **200ms**, ease `cubic-bezier(0.22, 1, 0.36, 1)` |
| 280 | Log line 0 (retry / rate limit) | same enter, **220ms** |
| 780 | Log line 1 (`Dispatch embeddings batch #47`, watched) | same enter, **220ms** |
| 1040 | Eye beacon on line 1 | opacity 0→1 + `transform: scale(0.92)` → `scale(1)` (never `scale(0)`), **200ms**, same ease; `transform-origin: center` |
| 1280 | Outcome stamp (bottom-right) | opacity 0→1 + `transform: translateY(8px) scale(0.96)` → `translateY(0) scale(1)`, **240ms** (`--landing-reveal-dur`), same ease; `transform-origin: 100% 100%` (grows from its corner) |
| 1780 | Log line 2 (`Provider ack · €512.00`) | same line enter, **220ms** — proves the call was allowed |
| hold | Full frame held until tier cycle advances | — |

**Dwell**: observe uses `OBSERVE_DWELL_MS = 5200` so the sequence finishes with ~2s of hold. Other tiers keep `CYCLE_MS = 3800`.

**Reduced motion** (`useReducedMotion() === true`): skip the sequence — mount meta + all lines + eye + stamp immediately with no transform motion (opacity-only crossfade of the panel may remain as today).

**Re-entry**: every time `activeTier.id` becomes `"observe"` (including cycling back), reset and replay from t=0. Leaving observe cancels pending timers and unmounts eye/stamp with the panel exit (no special exit choreography required).

**Pause**: section `onMouseEnter` already pauses the tier interval. Do **not** pause mid-demo timers — keep the sequence short and deterministic so it always completes once started. (If the user leaves observe mid-demo via click, cancel timers.)

**Stacking**: keep `ObserveStamp` as a **sibling** of `TierIllusPanel` inside `.landing-enforcement__illus` (needed so `z-index: 5` sits above BorderBeam overlays at z-index 1–3). Drive stamp visibility with a `showStamp` boolean from the demo controller, not by always mounting when `isObserve`.

## Repo conventions to follow

- Easing: Framer array matching `--resize-ease` / `--landing-ease-out`:

  ```ts
  const STORY_EASE = [0.22, 1, 0.36, 1] as const; // already in LandingEnforcementSection.tsx:33
  ```

  CSS token source: `client/src/index.css` `--resize-ease: cubic-bezier(0.22, 1, 0.36, 1);`

- Durations: prefer landing tokens where CSS applies (`--landing-reveal-dur: 240ms` for the stamp). JS Framer durations in seconds: `0.2`, `0.22`, `0.24`.

- Animate **full `transform` strings + `opacity` only** (no Framer `x`/`y`/`scale` shorthands — those run on the main thread per project audit rules). Keep blur on the *panel* swap only; do **not** add `filter: blur()` on log lines / stamp (Safari cost).

- Exemplar for staged landing storytelling: `client/src/landing/LandingIncidentStory.tsx` (step interval + `AnimatePresence` + `STORY_EASE` + `useReducedMotion`). Exemplar for panel enter values already in this section: `TierIllusPanel` in `LandingEnforcementSection.tsx:38-60`.

- Stamp must remain outside the motion panel (sibling) — established intentionally for BorderBeam stacking; do not move it back inside `ObserveView` DOM without re-solving z-index.

## Steps

1. **Add demo phase types and timing constants** in `client/src/landing/EnforcementTierIllustration.tsx` (or a tiny colocated helper in the same file):

   ```ts
   const STORY_EASE = [0.22, 1, 0.36, 1] as const;
   const LINE_ENTER_DUR = 0.22;
   const BEACON_ENTER_DUR = 0.2;
   const STAMP_ENTER_DUR = 0.24;

   /** Delays from observe-mount (ms). */
   const DEMO = {
     meta: 0,
     line0: 280,
     line1: 780,
     eye: 1040,
     stamp: 1280,
     line2: 1780,
   } as const;
   ```

2. **Introduce a controlled `ObserveView`** that accepts:

   ```ts
   type ObserveDemoProps = {
     reduceMotion: boolean;
     /** Bump / change when observe becomes active to restart the sequence. */
     playKey: string | number;
     onStampVisibleChange?: (visible: boolean) => void;
   };
   ```

   Internal state (or derived from a single `phase` number advanced by `setTimeout` chain / one `useEffect` with cleanup):

   - `showMeta: boolean`
   - `visibleLineCount: 0 | 1 | 2 | 3`
   - `showEye: boolean`

   On `playKey` change:
   - If `reduceMotion`: set all true / count = 3, call `onStampVisibleChange(true)`, return.
   - Else: reset all false / 0, call `onStampVisibleChange(false)`, schedule the DEMO table with `window.setTimeout`, store ids, clear on cleanup.

3. **Animate each reveal with `motion`**, using full transform strings:

   Meta / line enter:

   ```tsx
   initial={{ opacity: 0, transform: "translateY(6px)" }}
   animate={{ opacity: 1, transform: "translateY(0px)" }}
   transition={{ duration: LINE_ENTER_DUR, ease: STORY_EASE }}
   ```

   Eye beacon (only mount when `showEye`; wrap `ShadowEyeBeacon`):

   ```tsx
   <motion.span
     initial={{ opacity: 0, transform: "scale(0.92)" }}
     animate={{ opacity: 1, transform: "scale(1)" }}
     transition={{ duration: BEACON_ENTER_DUR, ease: STORY_EASE }}
     style={{ display: "inline-flex", transformOrigin: "center", lineHeight: 0 }}
   >
     <ShadowEyeBeacon />
   </motion.span>
   ```

   Lines that are not yet visible: do not render them (or render with `visibility`/`aria-hidden` but prefer not rendering so layout grows naturally — the 16/9 card has room; confirm no jump that clips. If growing layout feels jumpy inside the fixed card, keep all three `<li>` mounted but opacity/transform gated — prefer **mount-as-revealed** so the log reads top-down).

4. **Wire stamp visibility in `LandingEnforcementSection.tsx`**:

   - Add `const [showObserveStamp, setShowObserveStamp] = useState(false)`.
   - Pass `reduceMotion`, `playKey={activeIndex}` (or `"observe-" + activeIndex`), and `onStampVisibleChange={setShowObserveStamp}` into the illustration path. Cleanest: change `EnforcementTierIllustration` to accept optional `observeDemo` props and forward only when `tier === "observe"`.
   - Replace `{isObserve ? <ObserveStamp /> : null}` with animated stamp:

   ```tsx
   <AnimatePresence>
     {isObserve && showObserveStamp ? (
       <motion.div
         key="observe-stamp"
         initial={
           reduceMotion
             ? false
             : { opacity: 0, transform: "translateY(8px) scale(0.96)" }
         }
         animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
         exit={
           reduceMotion
             ? undefined
             : { opacity: 0, transform: "translateY(6px) scale(0.98)" }
         }
         transition={{ duration: 0.24, ease: STORY_EASE }}
         style={{ transformOrigin: "100% 100%" }}
         className="enforcement-tier-illus__stamp-motion" /* position absolute fill-none; child keeps stamp styles */
       >
         <ObserveStamp />
       </motion.div>
     ) : null}
   </AnimatePresence>
   ```

   Ensure `.enforcement-tier-illus__stamp` (or the motion wrapper) remains `position: absolute; right/bottom: var(--spacing-space-5); z-index: 5`. If the motion wrapper is new, move positioning to the wrapper and keep the stamp as `position: static` / relative inside — **one** positioned box only.

5. **Extend observe dwell** in `LandingEnforcementSection.tsx`:

   ```ts
   const CYCLE_MS = 3800;
   const OBSERVE_DWELL_MS = 5200;
   ```

   In the interval effect, use:

   ```ts
   const dwell = TIERS[activeIndex].id === "observe" ? OBSERVE_DWELL_MS : CYCLE_MS;
   const id = window.setInterval(() => {
     setActiveIndex((index) => (index + 1) % TIERS.length);
   }, dwell);
   ```

   Keep `activeIndex` in the dependency array so the dwell resets when the active tier changes (already the pattern).

6. **Reset stamp when leaving observe**:

   ```ts
   useEffect(() => {
     if (!isObserve) setShowObserveStamp(false);
   }, [isObserve]);
   ```

7. **A11y**: keep the illustration `aria-label` describing the full outcome (already in `ARIA_LABELS.observe`). Do not announce each log line via `aria-live` during the demo (the wrap already has `aria-live="polite"` — avoid flooding; if the stamp mount causes a noisy announcement, set `aria-hidden` on the decorative stamp and rely on the parent `role="img"` label). Decorative eye: already `aria-hidden` on the icon.

8. **CSS** (`enforcement-tier-illus.css`): only if the motion wrapper needs it — e.g.

   ```css
   .enforcement-tier-illus__stamp-motion {
     position: absolute;
     right: var(--spacing-space-5);
     bottom: var(--spacing-space-5);
     z-index: 5;
     line-height: 0;
   }
   .enforcement-tier-illus__stamp-motion .enforcement-tier-illus__stamp {
     position: static;
     right: auto;
     bottom: auto;
     z-index: auto;
   }
   ```

## Boundaries

- Do NOT change ladder copy, section header copy, or other tier illustrations (nudge / approve / block).
- Do NOT change BorderBeam props on the card or eye (`ocean`, `0.65`, `pulse-inner` / `sm`).
- Do NOT add new dependencies.
- Do NOT animate `width`/`height`/`top`/`left`/`filter` on the stamp or lines.
- Do NOT use `scale(0)` or Framer `scale`/`x`/`y` shorthands.
- Do NOT move the stamp back inside the Framer panel that uses `transform` for tier swaps without a stacking re-check against BorderBeam.
- If file:line references drifted past commit `32a7368`, STOP and report — do not invent a second choreography.

## Verification

- **Mechanical**: from repo root, `npm run typecheck` (or the client package equivalent used in this monorepo) and confirm the landing module compiles. No new lint on the touched files.
- **Feel check** (landing `/`, enforcement section):
  1. On load / cycle into Shadow: meta → line1 → line2 → **eye pops on the Dispatch line** → **stamp eases in from the bottom-right** → ack line. Each beat should be readable; eye should feel like a “caught it” ping, stamp like a soft outcome chip — not a flash.
  2. DevTools Animations panel at **10%**: confirm eye starts at ~0.92 scale (not 0), stamp at ~0.96 + slight Y, both ease-out (fast start).
  3. Hover the section mid-demo: demo may finish; tier must not advance while hovered. After leave, cycle continues with observe dwell.
  4. Click Nudge mid-demo: timers cancel, stamp gone, nudge panel shows.
  5. Cycle back to Shadow: sequence **replays** from the start.
  6. Toggle `prefers-reduced-motion: reduce`: full frame visible immediately; no staggered transforms; stamp present without pop.
  7. Confirm stamp still paints **above** the card BorderBeam at the bottom-right corner.
- **Done when**: observe entry always plays the progressive beat (or reduced-motion full frame); eye and stamp never appear before the watched Dispatch line; observe dwell is long enough that the ack line is visible for ≥1s before auto-advance; stacking and reduced-motion checks pass.
