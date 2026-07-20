# Design System

## Token Architecture

Tokens are defined in `src/index.css` using Tailwind v4's `@theme` block. They follow a two-layer model: **primitives** define the raw values, **semantics** assign meaning to them. Components should always reference semantic tokens — primitives are the source of truth beneath them.

```
primitives → semantics → components
```

---

## Spacing

Tailwind utilities: `p-space-{n}`, `m-space-{n}`, `gap-space-{n}`, `w-space-{n}`, etc.

| Token | Value |
|---|---|
| `space-0` | 0px |
| `space-1` | 2px |
| `space-2` | 4px |
| `space-3` | 6px |
| `space-4` | 8px |
| `space-5` | 12px |
| `space-6` | 16px |
| `space-7` | 20px |
| `space-8` | 24px |
| `space-9` | 32px |
| `space-10` | 40px |

---

## Border Radius

Tailwind utilities: `rounded-{name}`

| Token | Value |
|---|---|
| `none` | 0px |
| `xs` | 2px |
| `sm` | 4px |
| `md` | 6px |
| `lg` | 8px |
| `xl` | 12px |
| `full` | 999px |

---

## Color Primitives

Raw color values. Do not use these directly in components — reference semantic tokens instead.

### Neutral

| Token | Value |
|---|---|
| `neutral-950` | `#0a0a0b` |
| `neutral-900` | `#17171a` |
| `neutral-800` | `#232326` |
| `neutral-700` | `#2e2e33` |
| `neutral-600` | `#454550` |
| `neutral-500` | `#6b6b76` |
| `neutral-400` | `#91919c` |
| `neutral-300` | `#b4b4bd` |

### Accent

| Token | Value |
|---|---|
| `accent-600` | `#00557e` |
| `accent-500` | `#008ad3` |
| `accent-400` | `#a6d2ff` |

### Red

| Token | Value |
|---|---|
| `red-700` | `#6b2623` |
| `red-500` | `#df4746` |
| `red-300` | `#ffb1a9` |

### Green

| Token | Value |
|---|---|
| `green-700` | `#104616` |
| `green-500` | `#27a138` |
| `green-300` | `#8fda92` |

### Amber

| Token | Value |
|---|---|
| `amber-700` | `#672f00` |
| `amber-500` | `#e76d00` |
| `amber-300` | `#ffba7c` |

---

## Semantic Tokens

These are the tokens components use. Each maps to a primitive above.

### Surface

Controls background fills for layered UI surfaces.

| Token | Primitive | Tailwind utility |
|---|---|---|
| `surface-app` | `neutral-950` | `bg-surface-app` |
| `surface-panel` | `neutral-900` | `bg-surface-panel` |
| `surface-panel-elevated` | `neutral-800` | `bg-surface-panel-elevated` |
| `surface-canvas` | `neutral-950` | `bg-surface-canvas` |
| `surface-input` | `neutral-900` | `bg-surface-input` |
| `surface-hover` | `neutral-800` | `bg-surface-hover` |
| `surface-active` | `neutral-700` | `bg-surface-active` |

Surface elevation increases with each step: `app` → `panel` → `panel-elevated`.

### Text

| Token | Primitive | Tailwind utility |
|---|---|---|
| `text-primary` | `neutral-300` | `text-text-primary` |
| `text-secondary` | `neutral-400` | `text-text-secondary` |
| `text-muted` | `neutral-500` | `text-text-muted` |
| `text-disabled` | `neutral-600` | `text-text-disabled` |
| `text-inverse` | `neutral-950` | `text-text-inverse` |

### Border

| Token | Primitive | Tailwind utility |
|---|---|---|
| `border-subtle` | `neutral-800` | `border-border-subtle` |
| `border-default` | `neutral-700` | `border-border-default` |
| `border-strong` | `neutral-600` | `border-border-strong` |
| `border-focus` | `accent-500` | `border-border-focus` |

### Status

| Token | Primitive | Tailwind utility |
|---|---|---|
| `status-warning` | `amber-500` | `bg-status-warning` / `text-status-warning` |
| `status-success` | `green-500` | `bg-status-success` / `text-status-success` |
| `status-danger` | `red-500` | `bg-status-danger` / `text-status-danger` |
| `status-info` | `accent-500` | `bg-status-info` / `text-status-info` |

---

## Usage

```tsx
// Correct — semantic tokens
<div className="bg-surface-panel border border-border-default rounded-lg p-space-6">
  <p className="text-text-primary">Primary content</p>
  <p className="text-text-muted">Supporting detail</p>
</div>

// Avoid — raw primitives in components
<div className="bg-neutral-900 border-neutral-700">...</div>
```
