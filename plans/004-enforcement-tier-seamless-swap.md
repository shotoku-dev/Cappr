# 004 — Seamless enforcement tier card swaps (no collapse)

- **Status**: DONE
- **Commit**: `32a7368`
- **Severity**: HIGH
- **Category**: Purpose & frequency · Physicality & origin · Performance
- **Estimated scope**: 2 files, ~80 lines changed

## Problem

When the enforcement ladder auto-advances or the user clicks between tiers, the illustration card **visually collapses and re-opens** even when the outgoing and incoming cards share the same dimensions (nudge ↔ approve ↔ block, or observe-with-stamp → nudge — all **4:3**).

Three mechanisms stack to produce the “empty shell” feeling:

### 1. Opacity dip from simultaneous enter + exit (`LandingEnforcementSection.tsx:54–65`)

`TierIllusPanel` wraps each tier in `AnimatePresence` with `key={tier}`. On tier change the old panel exits to `opacity: 0` while the new panel enters from `opacity: 0`. Both panels are `position: absolute; inset: 0` (`.landing-enforcement__illus-panel` in `landing.css:837–842`). Mid-crossfade combined opacity drops below 1, so the fixed-size shell looks like it **empties** before refilling.

```tsx
// LandingEnforcementSection.tsx:54–65 — current
<AnimatePresence initial={false}>
  <motion.div
    key={tier}
    className="landing-enforcement__illus-panel"
    initial={reduceMotion ? false : { opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={reduceMotion ? undefined : { opacity: 0 }}
    transition={{ duration: 0.28, ease: STORY_EASE }}
  >
```

### 2. Aspect-ratio animation runs even when the ratio is unchanged (`LandingEnforcementSection.tsx:113–133`)

The outer shell is a `motion.div` that always passes `animate={{ aspectRatio: illusAspect }}` with `duration: ILLUS_RESIZE_DUR` (0.4s). Framer Motion may re-run the transition on sibling remounts. More importantly, **`aspect-ratio` is a layout property** — animating it triggers layout on every frame (AUDIT.md §5). When nudge → approve both resolve to `4/3`, the shell should **not** resize at all; any layout animation reads as collapse/expand.

```tsx
// LandingEnforcementSection.tsx:113–133 — current
const illusAspect =
  isObserve && !showObserveStamp
    ? ILLUS_ASPECT_OBSERVE_COMPACT
    : ILLUS_ASPECT_OBSERVE_EXPANDED;

animate={{ aspectRatio: illusAspect }}
transition={
  reduceMotion
    ? { duration: 0 }
    : { duration: ILLUS_RESIZE_DUR, ease: STORY_EASE }
}
```

### 3. BorderBeam conditional remounts the entire card tree (`LandingEnforcementSection.tsx:173–187`)

Observe is wrapped in `<BorderBeam>…</BorderBeam>`; other tiers render `illus` directly. Toggling `isObserve` **destroys and recreates** the `motion.div` shell (and its Framer state), which can flash or re-animate layout even when aspect ratio is unchanged.

```tsx
// LandingEnforcementSection.tsx:173–187 — current
{isObserve ? (
  <BorderBeam …>{illus}</BorderBeam>
) : (
  illus
)}
```

### 4. Duplicate aspect-ratio sources (CSS + motion)

CSS modifier classes still set static aspect ratios:

```css
/* landing.css:816–822 */
.landing-enforcement__illus--observe-compact { aspect-ratio: 3 / 2; }
.landing-enforcement__illus--observe-expanded { aspect-ratio: 4 / 3; }
```

while Framer also drives `aspectRatio`. Two sources fighting can cause a one-frame snap or spurious transition.

## Target

**Same-ratio tier swaps** (nudge ↔ approve ↔ block, and observe-expanded → nudge): the card shell **never changes size** and **never appears empty**. Only the inner content crossfades. The outgoing panel stays fully opaque underneath while the incoming panel fades in on top (overlay crossfade — no combined-opacity dip).

**Different-ratio swaps** (observe compact 3:2 ↔ expanded 4:3): the shell **may** resize, but only when `illusAspect` actually changes, with a single 400ms ease-out on `aspect-ratio` only.

Exact motion values (match existing landing convention):

| Token | Value |
| --- | --- |
| Content crossfade duration | `0.28` s |
| Content crossfade easing | `cubic-bezier(0.22, 1, 0.36, 1)` — already `STORY_EASE` in file |
| Shell resize duration | `0.4` s — already `ILLUS_RESIZE_DUR` |
| Shell resize easing | same `STORY_EASE` |
| Compact aspect | `3 / 2` (`ILLUS_ASPECT_OBSERVE_COMPACT`) |
| Expanded / default aspect | `4 / 3` (`ILLUS_ASPECT_OBSERVE_EXPANDED`) |

Reduced motion: crossfade duration `0`; aspect resize duration `0` (already partially handled).

## Repo conventions to follow

- Easing: `STORY_EASE = [0.22, 1, 0.36, 1]` — used across `LandingEnforcementSection.tsx`, `LandingIncidentStory.tsx`, `EnforcementTierIllustration.tsx`.
- Reduced motion: `useReducedMotion()` from Framer, branch to `{ duration: 0 }` or `initial={false}` — see `LandingEnforcementSection.tsx:70`.
- `AnimatePresence initial={false}` on first paint — keep it.
- Do not add dependencies.

Exemplar for **overlay crossfade** (incoming fades over outgoing, outgoing does not fade out):

```tsx
// target pattern inside TierIllusPanel
<AnimatePresence initial={false}>
  <motion.div
    key={tier}
    className="landing-enforcement__illus-panel"
    initial={reduceMotion ? false : { opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 1, transition: { duration: 0 } }} // stay visible until removed
    transition={{ duration: 0.28, ease: STORY_EASE }}
    style={{ zIndex: 1 }} // incoming stacks above exiting sibling during sync
  >
```

Ensure exiting sibling keeps `zIndex: 0` (default). Framer `AnimatePresence` default `mode` (`"sync"`) keeps both in DOM during overlap — correct for this pattern.

## Steps

### 1. Overlay crossfade — stop exiting panel from fading to transparent

**File:** `client/src/landing/LandingEnforcementSection.tsx`

In `TierIllusPanel`, change exit so the outgoing tier **does not** animate to `opacity: 0`:

```tsx
exit={
  reduceMotion
    ? undefined
    : { opacity: 1, transition: { duration: 0 } }
}
```

Keep `initial={{ opacity: 0 }}` and `animate={{ opacity: 1 }}` on the entering panel only.

Add inline `style={{ zIndex: 1 }}` on the `motion.div` so the entering panel paints above the exiting one during the overlap window.

### 2. Gate aspect-ratio animation to actual ratio changes

**File:** `client/src/landing/LandingEnforcementSection.tsx`

Import `useRef` and `useEffect` (already imported).

Track previous aspect:

```tsx
const illusAspect =
  isObserve && !showObserveStamp
    ? ILLUS_ASPECT_OBSERVE_COMPACT
    : ILLUS_ASPECT_OBSERVE_EXPANDED;

const prevAspectRef = useRef(illusAspect);
const aspectIsChanging = prevAspectRef.current !== illusAspect;
useEffect(() => {
  prevAspectRef.current = illusAspect;
}, [illusAspect]);
```

Pass conditional transition on the shell `motion.div`:

```tsx
transition={
  reduceMotion || !aspectIsChanging
    ? { duration: 0 }
    : { duration: ILLUS_RESIZE_DUR, ease: STORY_EASE }
}
```

When `illusAspect` is unchanged (nudge → approve), Framer must **not** run a 400ms layout animation.

### 3. Stabilize the card shell — BorderBeam must not remount `illus`

**File:** `client/src/landing/LandingEnforcementSection.tsx`

Always render `BorderBeam` around the shell. Toggle beam visibility with props instead of conditional JSX:

```tsx
<BorderBeam
  className="landing-enforcement__illus-beam"
  size="pulse-inner"
  colorVariant="ocean"
  theme="auto"
  strength={isObserve ? 0.65 : 0}
  borderRadius={ILLUS_RADIUS}
>
  {illus}
</BorderBeam>
```

If `strength={0}` still renders visible artifacts, wrap with a class and set `opacity: 0; pointer-events: none` via CSS when not observe — but try `strength={0}` first without extra CSS.

Remove the `{isObserve ? … : illus}` branch entirely so `motion.div` identity persists across observe ↔ nudge.

### 4. Single source of truth for aspect ratio

**File:** `client/src/landing/landing.css`

Remove static aspect-ratio from modifier classes (keep them only as semantic hooks if still referenced):

```css
/* REMOVE aspect-ratio from these — motion.div owns the value */
.landing-enforcement__illus--observe-compact { /* no aspect-ratio */ }
.landing-enforcement__illus--observe-expanded { /* no aspect-ratio */ }
```

Keep base `.landing-enforcement__illus { aspect-ratio: 4 / 3; }` as SSR/first-paint fallback before hydration; Framer will override via inline style when mounted.

Optionally delete the `--observe-compact` / `--observe-expanded` class names from JSX if they no longer do anything — only if nothing else references them.

### 5. (Optional polish) Skip content crossfade when reduced motion

Already handled if `initial={false}` and `exit` undefined under reduced motion. Confirm entering panel mounts at full opacity with no transition.

## Boundaries

- Do NOT change tier illustration content (`EnforcementTierIllustration.tsx`) or log/stamp copy.
- Do NOT change observe demo timing or `onDemoComplete` behavior.
- Do NOT change ladder button motion or auto-advance interval (`CYCLE_MS`).
- Do NOT add new dependencies.
- If `BorderBeam` with `strength={0}` causes layout shift or visible border, STOP and report — do not hack around with duplicate wrappers.

## Verification

### Mechanical

```bash
cd client && npm run build
```

Expect exit code 0, no TypeScript errors.

### Feel check

1. Open landing page → enforcement ladder section.
2. **Same-ratio swap:** Click nudge → approve → block rapidly.
   - Card **height and width stay locked** — no vertical squeeze or expand.
   - Content crossfades; you should **not** see an empty dashed wrapper or blank background flash.
3. **Observe → nudge auto-advance:** Let observe demo finish (stamp visible, 4:3) → nudge.
   - No shell collapse; only inner content swaps.
4. **Observe compact → expanded:** Restart observe; watch stamp appear.
   - Shell **should** grow smoothly 3:2 → 4:3 over ~400ms — this is the only intentional resize.
5. DevTools → Animations → set playback to **10%**.
   - On nudge → approve: confirm **no** `aspect-ratio` keyframes on `.landing-enforcement__illus`.
   - Confirm exiting panel opacity stays at 1 until removed; incoming fades 0 → 1 on top.
6. Rendering → `prefers-reduced-motion: reduce`: tier clicks swap instantly, no aspect animation.

### Done when

- Same-aspect tier transitions show zero shell resize and zero empty-frame flash.
- Aspect animation runs **only** on observe compact ↔ expanded.
- `BorderBeam` no longer causes shell remount when leaving observe.
- Build passes.
