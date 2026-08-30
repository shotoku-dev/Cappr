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

---

---

# Naming Conventions

## Core Principle

Use a strict convention from day one. Consistent naming directly affects handoff quality and design file usability. Names should describe **what something IS**, not what it looks like.

---

## Figma File Structure

### Format: `NN — [Page Name]`

Two-digit prefix for sort order, followed by a descriptive name.

```
00 — Cover / File Guide
01 — Brand Foundations
02 — Design Tokens
03 — Core Primitives
04 — Cappr Components
05 — Patterns / Layouts
06 — Product Screens
07 — Prototype Flows
08 — States / Edge Cases
09 — Engineering Handoff
99 — Archive / Exploration
```

**Rules:**
- Always use two-digit prefix (00, 01 — not 0 or 1)
- Use `/` for hierarchical separation when appropriate
- Max ~30 characters for readability
- No special characters except `/` and spaces

---

## Components

### Format: `Category/Sub/Variant`

Three-level hierarchy using forward slashes. No spaces around `/`.

#### Primitives

```
Primitive/Button
Primitive/Button/Primary
Primitive/Button/Secondary
Primitive/Button/Ghost
Primitive/Button/Danger

Primitive/Input
Primitive/Input/Text
Primitive/Input/Number

Primitive/Badge
Primitive/Badge/Default
Primitive/Badge/Success
Primitive/Badge/Warning
Primitive/Badge/Danger

Primitive/Modal
Primitive/Panel
Primitive/Divider
Primitive/Tooltip
Primitive/Popover
```

#### Cappr Components

```
Cappr/ApprovalQueue
Cappr/ApprovalQueue/Default
Cappr/ApprovalQueue/Empty

Cappr/QueueItem
Cappr/QueueItem/Expanded
Cappr/QueueItem/Collapsed

Cappr/StatusOverlay
Cappr/StatusOverlay/Approved
Cappr/StatusOverlay/Denied

Cappr/ValueConstraint
Cappr/ValueConstraint/Default
Cappr/ValueConstraint/Edit
Cappr/ValueConstraint/Error

Cappr/ActionBar
Cappr/ActionBar/Default
Cappr/ActionBar/Resolved
```

#### Patterns

```
Pattern/RequesterBadge
Pattern/TimestampLabel
Pattern/ConstraintRow
Pattern/ValidationError
Pattern/EmptyState/NoRequests
Pattern/EmptyState/AllResolved
```

**Rules:**
- PascalCase for each segment
- Three levels maximum — use component properties for deeper variants
- No spaces around `/`
- No special characters, no version numbers

**Avoid:**
```
QueueItem_Expanded_Pending   ❌ underscore, not hierarchical
cappr/queue-item/expanded    ❌ lowercase, wrong separator
Cappr / Queue Item / Expanded  ❌ spaces around slashes
QueueItemExpandedWithValuePending  ❌ flat, unreadable
```

---

## Frames (Artboards / Mockups)

### Format: `[Component or Screen] / [State]`

#### ApprovalQueue

```
ApprovalQueue / Default
ApprovalQueue / Empty
ApprovalQueue / Single Item
ApprovalQueue / Value Exceeded
ApprovalQueue / All Resolved
```

#### Queue Item States

```
Queue Item / Expanded — Default
Queue Item / Expanded — Edit Mode
Queue Item / Expanded — Validation Error
Queue Item / Expanded — Approved
Queue Item / Expanded — Denied
Queue Item / Collapsed — Default
Queue Item / Collapsed — Hover
```

#### Patterns

```
Requester Badge / Default
Value Constraint / Default
Value Constraint / Edit Active
Value Constraint / Limit Exceeded
Action Bar / Pending
Action Bar / Resolved
```

**Rules:**
- State describes the visual condition, not the data
- Use `/` as the separator, `—` for sub-states
- No version numbers or dates
- Keep state names to 2–4 words

**Avoid:**
```
QueueItem_Populated   ❌ underscore
queue-item-expanded   ❌ kebab-case
Queue Item (v2)       ❌ version number
Queue Item - expanded ❌ wrong separator
```

---

## Layers (Within Frames)

### Format: Semantic Name

Name what the element **is**, not what it looks like.

#### Good

```
Panel Header
Requester Badge
Summary Text
Timestamp Label
Detail Body
Value Display
Edit Input
Constraint Row
Constraint Label
Constraint Limit
Validation Error
Action Bar
Deny Button
Approve Button
Status Overlay
Empty State
```

#### Bad

```
Frame 192        ❌ meaningless
Rectangle 33     ❌ shape name
Group 104        ❌ generic
bg-dark          ❌ CSS, not semantics
RedBox           ❌ color, not function
Text 1           ❌ meaningless
```

**Rules:**
- PascalCase for multi-word names
- Spell out full words — no `Btn`, `Txt`, `Img`
- Be specific: not `Button` but `Approve Button`
- Groups should name their contents, not be `Group`

---

## Component Properties

### Format

Property names use PascalCase. Values use lowercase.

```
Component: Queue Item

Properties:
- Variant: expanded | collapsed
- Status: pending | approved | denied
- Has Detail: true | false
- Has Value: true | false
- Has Constraint: true | false
- Edit Mode: true | false
```

```
Component: Button

Properties:
- Variant: primary | secondary | ghost | danger
- Size: sm | md | lg
- State: default | hover | pressed | disabled | loading
```

**Rules:**
- Values are lowercase, no spaces
- Boolean properties use `true | false`, not `yes | no` or `on | off`
- Don't encode state in the component name — use properties

---

## Token Names

### Format: `Category / Group / Variant`

Three-level hierarchy. Semantic names describe USE, not color value.

#### Color

```
Color / Surface / App
Color / Surface / Panel
Color / Surface / Panel Elevated
Color / Surface / Input
Color / Surface / Hover
Color / Surface / Active

Color / Text / Primary
Color / Text / Secondary
Color / Text / Muted
Color / Text / Disabled
Color / Text / Inverse

Color / Border / Subtle
Color / Border / Default
Color / Border / Strong
Color / Border / Focus

Color / Status / Success
Color / Status / Warning
Color / Status / Danger
Color / Status / Info
```

#### Spacing

```
Spacing / 0   (0px)
Spacing / 1   (2px)
Spacing / 2   (4px)
Spacing / 3   (6px)
Spacing / 4   (8px)
Spacing / 5   (12px)
Spacing / 6   (16px)
Spacing / 7   (20px)
Spacing / 8   (24px)
Spacing / 9   (32px)
Spacing / 10  (40px)
```

#### Radius

```
Radius / None
Radius / XS
Radius / SM
Radius / MD
Radius / LG
Radius / XL
Radius / Full
```

**Rules:**
- PascalCase per segment
- Semantic over literal — `Color/Surface/Panel` not `Color/Dark/Gray900`
- Three levels max

---

## Naming Audit Checklist

Before handing off design:

- [ ] All pages follow `NN — Name` format
- [ ] All components use `Category/Sub/Variant` hierarchy
- [ ] All frames use `Feature / State` naming
- [ ] All layers have semantic names (not `Frame 192`)
- [ ] No orphaned or misnamed components
- [ ] Properties use consistent lowercase values
- [ ] Token names are semantic, not color-based
- [ ] No duplicate or near-duplicate components
- [ ] Related items grouped logically

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| `Button-Primary` vs `Button/Primary` | Always use `/`, never `-` or `_` in component names |
| `Primitive/Button/Primary/Large/Icon/Hover` | Max 3 levels — use component properties for variants |
| `Group`, `Container`, `Box` | Name what it IS: `Action Bar`, `Constraint Row` |
| `Btn`, `Txt`, `Img` | Spell out full words |
| `DarkGray`, `BlueButton` | Use semantic names: `Surface/Panel`, `Button/Primary` |
| State baked into component name (`Button Hover`) | Use Figma variants — hover is a state, not a component |

---

## Maintaining Naming Over Time

**When adding new components:**
1. Check existing patterns before creating a new category
2. Follow the established hierarchy
3. If a new category is needed, document it here

**When iterating:**
1. Don't rename existing components — it breaks code references
2. Create a new variant instead
3. Only rename if the current name is actively misleading; communicate the change to engineering

**When archiving:**
1. Move to `99 — Archive / Exploration`
2. Keep the original name — add a `Deprecated` label if useful
3. Note the replacement component
4. Don't delete — preserve history
