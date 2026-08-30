# ROADMAP — Cappr

Living document. **Update it whenever something is built or fixed** — add a dated
entry to the [Build log](#build-log) and flip the relevant module/task status.
Keep it honest: status reflects what actually works, not what's planned.

For product context (what each module *is* and why), see [`docs/PRODUCT.md`](docs/PRODUCT.md).
For the repo layout, see [`README.md`](README.md).

Status legend: 🔴 Not started · 🟡 In progress · 🟢 Done · ⏸️ Parked

---

## North star

Cappr is the dashboard application on top of **Shotoku**, an open-source
spend-control and audit layer for AI agents. *"Give your agents a budget, not
your card."* We are building the frontend first, against mock data, with the API
contract pinned to `@cappr/shared` once it settles.

**Engineering bar (non-negotiable):** everything stays **organized, modular,
type-safe, and scalable.** Concretely:
- One responsibility per module/file; features are self-contained and composable.
- No `any`; domain types live in `@cappr/shared` and flow end-to-end.
- Structure that survives growth — new modules slot in without refactoring old ones.

---

## Current status

**Phase 1 — Dashboard shell.** Monorepo is scaffolded; the UI renders a blank
screen. Next: build the dashboard app shell (layout, navigation, routing) and
the first functional module.

---

## Key decisions

- **Vite SPA (not Next.js)** for the dashboard. The backend is Python/FastAPI
  (the dashboard's API) plus a Rust enforcement proxy (agent-traffic data plane)
  — neither is Node, so Next's server layer adds no value. The app also targets
  Tauri, which bundles a *static* SPA (Next's SSR/RSC/API routes don't run there).
  A clean Vite SPA keeps one codebase for web + desktop and makes the future
  Tauri move nearly free. Framework-level capability comes from the router +
  TanStack Query, not the bundler.
- **Web first, Tauri desktop later** — ship the web dashboard, add the Tauri
  desktop shell once there's traction/feedback.

---

## Milestones

| Phase | Goal | Status |
|---|---|---|
| 0 | Monorepo scaffold — `client` / `shared` / `server`, tokens, tooling | 🟢 Done |
| 1 | Dashboard shell — layout, navigation, routing, module skeletons | 🟡 In progress |
| 2 | First functional module (mock data) | 🔴 Not started |
| 3 | Remaining modules on mock data | 🔴 Not started |
| 4 | Wire to real API (`server/` FastAPI) via `@cappr/shared` contract | 🔴 Not started |

---

## Modules

The dashboard's functional surface (see `docs/PRODUCT.md` §3.1). Reusable
components preserved from the old library are noted.

| Module | What it is | Reuses | Status |
|---|---|---|---|
| **Fleet Overview** | Rollup of every governed agent: spend, burn rate, anomalies | — | 🔴 Not started |
| **Ledger** | Per-agent transaction history / audit trail; compliance export | `audit-trail`, `integrity-badge` (dormant) | 🔴 Not started |
| **Firewall** | Graduated enforcement UI (observe / nudge / approve / block) | — | 🔴 Not started |
| **Studio** | Policy authoring — YAML + plain-English + dry-run | `policy-editor` (dormant) | 🔴 Not started |
| **Inbox** | Queue of actions awaiting a human approve/deny decision | `approval-queue` (dormant) | 🔴 Not started |
| **Score** | Agent trust tiering — earn/lose autonomy over time | — | 🔴 Not started |
| **Wallet** | Scoped spending instruments per agent | — | 🔴 Not started |

> Dormant components live in `client/src/components/*`, compile-clean but not yet
> wired into the app. They'll be adapted into their modules rather than dropped in as-is.

---

## Build log

Newest first. One entry per build/fix.

### 2026-08-27
- **Overview → per-agent detail drawer.** Clicking a row in the Agents table now
  opens a right-side slide-over (`client/src/components/agent-detail/` —
  `AgentDetailPanel.tsx` + `BreachChart.tsx` + barrel). Selection is lifted into
  `Overview.tsx` (`selected` state); `AgentsCard` takes `selectedName`/`onSelect`,
  rows are `role="button"` + keyboard-activatable with a hover/selected wash
  (inset box-shadow so it spans the padded gutter without disturbing the subgrid
  tracks). The drawer (framer-motion: scrim fade + spring slide from the right,
  Escape/scrim-click to close) scrolls through seven sections: **header**
  (agent glyph, name, tier badge, status pill, owner, and Freeze/Unfreeze ·
  Adjust budget · Edit policy · overflow-menu actions — overflow holds "View full
  page"/"Export ledger"); **Spend snapshot** (`€spend of €budget`, usage bar + %,
  daily-avg burn, plain-English breach projection, and a per-agent `BreachChart` —
  a solid actual line + dotted projection to month-end + dashed budget line with a
  danger breach marker where they cross; anomaly agents get a red callout with the
  reason); **Policy** (plain-English summary, enforcement chip Observe/Nudge/
  Approve/Block, animated View-YAML toggle, an explicit Shadow-mode explainer,
  Edit-in-Studio link); **Ledger** (scoped rows: time · action · amount · policy
  outcome, `id="agent-ledger"` for the future Shadow-search deep-link, View-full-
  ledger link); **Tier history** (chronological promotions/demotions with
  direction glyph + reason); **Wallet** (masked card / limit / scope, or a dashed
  empty state with an Issue-wallet CTA); and **Pending approvals** (only rendered
  when non-empty, so it never duplicates the global Inbox's empty job). Backed by
  a new `agents.ts` data module (extended `AgentRow` with policy/enforcement/tier-
  history/wallet/approvals narrative + a deterministic name-seeded generator for
  the spend curve, burn, breach projection, and scoped ledger) and shared
  `agent-visuals.tsx` atoms (`TierBadge`, `StatusPill`, `UsageBar`) now used by
  both the table and the drawer.
- **Agent detail drawer — polish pass.** Breadcrumb now uses the Topbar's
  `Arrow Right Icon` (not a chevron) and drops its bottom divider. Header
  restructured: the boxed agent glyph is gone — a larger `Single Agent` glyph sits
  inline next to the name, everything left-aligned, and the status pill reverts to
  the table's pinned-width styling (trailing padding). Table row hover and the
  open/selected row now share one neutral gray wash (clicking no longer flips to
  blue). Section headings are sentence-case (not all-caps); section + ledger-row
  dividers are dotted. Wallet section removed. Tier-history de-duped — the row now
  shows one generated headline (e.g. "Promoted T3 → T2") + date + a short
  justification (`reason` fields trimmed to "10 days clean", "Baseline placement",
  etc.) instead of repeating the promotion text.
- **Overview → Agents table alignment fix.** Header and body rows now share one
  grid via CSS `subgrid` (`grid-column: 1 / -1`) instead of each row being its own
  grid, so the `max-content` (Status) and `1fr` (Agent) tracks resolve once and
  every column header sits directly over its content. All columns are left-aligned
  (Spend/Budget were previously right-aligned).

### 2026-08-26
- **Topbar breadcrumb — directional tab swap.** The current-module segment
  (label + icon) now swaps with a directional vertical slide when the selected
  tab changes: navigating to a tab lower in the rail slides the old segment down
  and the new one in from above; a higher tab does the reverse. Built with
  framer-motion `AnimatePresence` (`mode="popLayout"`, keyed by `activeId`) over a
  clipped window; `dir` is the sign of the new vs. previous `NAV_ITEMS` index
  (tracked via a ref). Respects `prefers-reduced-motion` (collapses to a
  crossfade). Spring transition, 0.35s, no bounce.
- **Overview → Month to Date card.** First Overview card in
  `client/src/app/overview/` (`Overview.tsx` module host + `MonthToDateCard.tsx`,
  barrel `index.ts`); mounted in `App` when Overview is active. Elevated surface
  (`surface-panel-elevated`, 8 radius, 16 padding), sized to its content
  (`alignSelf: flex-start`) so it reads as a card, not a full-width band. Card
  body is `surface-panel`; a small Calendar glyph (16px, text-disabled, stroke →
  currentColor) sits in a lighter `surface-panel-elevated` tab (6 padding) notched
  flush into the top-left corner (outer corner shares the card's 8 radius, inner
  corner rounded 8); then — indented 24 and dropped below the tab — the month's spend `€5,547.30` (32px,
  medium, text-secondary) with `of €7,470.00 fleet budget` (13px, text-muted)
  trailing on the same baseline. Under the headline, two nested metrics each hang
  off a text-disabled Indent (subdirectory) arrow: `5,214 transactions` and
  `€231.14/day avg` (13px, text-muted). Below that, `SpendSparkline.tsx` — a
  gridless, dependency-free inline-SVG sparkline of cumulative spend vs. a
  constant-pace budget: solid accent line for actual spend (day 1 → today, day
  26), a dotted accent projection from today to month-end at the current daily
  avg, and a subtle text-disabled diagonal for the constant-pace budget (0 → full
  budget). Normalized viewBox stretched via `preserveAspectRatio="none"` with
  `non-scaling-stroke` so lines stay crisp at any width. A small top-left legend
  labels the two reference lines (solid swatch → "Budget pace", dotted accent
  swatch → "Projected"). On hover the accent marker snaps to the nearest day and
  glides there (resting on today when idle); a bottom-right readout shows the
  inspected date + cumulative spend (e.g. `Aug 12 2026 - €2,340.00`). Hovering
  right of the "Actual" dot inspects the projection — the marker rides the dotted
  line and the readout appends `· Projected`, which on the final day (Aug 31)
  becomes `· 95.9% of budget`. Projection lands at €7,165 (95.9% of the €7,470
  budget).
- **Overview → Agents table.** Second Overview card (`AgentsCard.tsx`, exported
  via the barrel; on the right of the Overview row). Same shell as the
  Month-to-Date card — `surface-panel`, 8 radius, `16 20 20 16` padding — but
  grows to fill the remaining width (`flex: 1 1 0`, `minWidth: 0`) with the agent
  column flexing (`minmax(180px, 1fr)`) to absorb the slack; `alignSelf:
  flex-start` keeps it at natural height so the table sets the row height. The Agent
  grid glyph (`Agent Icon.svg`, 16px, text-muted) sits in the same lighter
  `surface-panel-elevated` corner tab, and content positioned like the
  Month-to-Date headline (24 down, 6 indent). The table sits in its own inset
  panel — a rounded (`radius-sm`, concentric-smaller than the card) borderless div
  on the darker `surface-app`, clipping its row borders to the corners. Body is a
  7-column layout (agent / tier / owner / spend / budget / usage / status) with a
  shared `gridTemplateColumns` track + 16 column gap so header and rows align;
  headers are 11px text-muted at 0.7 opacity (sentence case, no divider) aligned
  to their column — right over the right-aligned Spend/Budget euros, left
  otherwise; rows separated by `border-subtle` bottoms.
  Cells: agent = `Single Agent Icon.svg` (18px) beside the name (13px, medium,
  text-secondary); tier = "T{n}" + a 2×2 dot grid filled cumulatively (T1 → first
  dot … T4 → all, read L-R then top-bottom), unfilled dots text-primary @ 0.22;
  owner = a coloured initial-avatar + "First L." matching the org-switcher roster
  (Julius/Yusuf/Ines/Tomas); spend (text-secondary) and budget (text-muted) are
  right-aligned tabular euros; usage = a row of 10 vertical pills filling L-R in
  proportion, plus a % (escalates accent → warning ≥85% → danger ≥100%); status =
  a coloured dot + label in a neutral pill (same 22% text-primary tone as the
  unfilled tier dots), the label pinned to the longest status (`STATUS_LABEL_CH`)
  so pills line up. Statuses: Healthy → success, Warning → warning, Anomaly →
  danger, Frozen → info (paused/on ice), Shadow → muted (running silently).
  Seeded with ten mock agents.
- **Overview → Activity feed.** Third Overview card (`ActivityCard.tsx`). Layout
  in `Overview.tsx` is a `flex flex-1 min-h-0` row (the module fills the content
  column down to the sidebar's bottom): a left `flex-col` stacks the Month-to-Date
  card with the activity feed directly beneath it (both narrow), and the wide
  Agents table fills the rest. Same shell as the sibling cards (`surface-panel`, 8
  radius, `16 20 20 16` padding) but `alignSelf: stretch` so the feed matches the
  Month-to-Date card's width and `flex: 1 1 auto` so it grows down to fill the
  column to the sidebar's bottom, with a new pulse glyph (`Activity Icon.svg`,
  16px) in the `surface-panel-elevated` corner tab. Content drops 24 / indents 6,
  then a vertical timeline sitting directly on the card surface. A single rounded
  capsule (`radius-lg`, 28px-wide `border-subtle` box) wraps the whole icon rail —
  its top/height are
  measured via `useLayoutEffect` + `ResizeObserver` to hug the first/last icons
  (titles can wrap, so the extent isn't computed) with 10px padding. Each `<li>`
  is a `28px / 1fr` grid: a rail column threading a `border-subtle` connector line
  down the capsule centre with a coloured 14px Tabler glyph centred at 50% of the
  row (line stops `LINE_INSET` = 13px short of each icon so it never touches one),
  then the title (13px) over its 11.5px muted timestamp, centred against the icon.
  Glyph colour reuses the Agents table's status palette so an event matches the
  status it relates to; icon per kind: budget → warning `IconAlertTriangle`,
  anomaly → danger `IconAlertHexagon`, verified/activated → success
  (`IconShieldCheck` / `IconRocket`), frozen → info `IconSnowflake`, wallet →
  muted `IconCreditCard` (the Shadow tone), approval → info `IconGavel` (no table
  status — borrows the info blue as an "awaiting action" cue). Seeded with eight
  mock events.
- **Topbar breadcrumb.** Added `client/src/app/Topbar.tsx`: a surface-panel bar
  beside the sidebar (8 radius — optically matches the tall rail; 4 padding, 8 left). Renders a
  breadcrumb — org switcher (`OrganizationSwitcher.tsx`: `Acme Labs` + chevron
  that opens a popup with the selected org (overlapping member-avatar stack) and a
  "+ New organization" action, a dotted divider, then a "Members" roster listing
  each member with avatar + role tag (Owner/Approver/Viewer) and a muted footnote
  about Inbox permissions; the current user's avatar gets a dotted ring like the
  topbar, the chevron lightens on hover, and the popup left-aligns to the chevron
  via measured offset and sits below the topbar with margin) → Arrow Right (muted) →
  current module label + its sidebar icon (16px, hugging the label). The
  current segment reads from `NAV_ITEMS` by `activeId`, so it tracks selection
  from the single nav source. Right cluster holds the command palette, an active
  shadow-agent pill (elevated surface, 20 radius, Shadow icon + "Shadow:
  atlas-researcher", text-secondary, wrapped in a subtle `border-beam` accent
  glow — `ocean` variant, `strength 0.5`), a round elevated stop button (red
  Cross icon), and a dotted-ring blue-accent user avatar ("J"). The palette
  (`app/command-menu/`, `cmdk`) is an elevated trigger button (6 radius, Search icon,
  "Search or jump to…" label, ⌘/K keycaps) that — along with a global ⌘K/Ctrl+K
  shortcut — opens a `cmdk` dialog. `CommandPalette.tsx` renders the shell
  (input, list, footer); the list shows every module (from `NAV_ITEMS`) as a
  standalone, keyboard-navigable item; selecting one calls `onNavigate` (threaded
  App → Topbar → CommandMenu) to jump to that module and close the palette. Styled
  from tokens in `command-menu.css`, dividers dropped for a flat look. A footer shows keyboard hints (↑↓ Navigate · ⏎ Submit · esc Exit)
  using a shared `Kbd` keycap reused by the trigger button; the footer sits on an
  elevated surface so it reads apart from the list without a rule. The trigger's
  keycaps light up live while their key is held (⌘/Ctrl and K tracked on
  keydown/keyup, reset on blur) via a `Kbd active` state that brightens the cap
  text only (surface stays put). Sidebar rail icons set to 18px with a tighter
  8px gap between them, plus Shift+1…N shortcuts (matched on `code`/Digit so a
  shifted "!" still counts) that jump straight to the Nth module. `App` lays out sidebar + a flex
  content column (topbar on top), concentric 6 gaps throughout.
- **Sidebar hover animation.** The highlight pill now follows the hovered tab
  (Framer `layoutId` spring) and returns to the active tab when the pointer
  leaves the rail; clicking a tab makes it active. Icon color is decoupled from
  the pill: the selected tab keeps `text-secondary` while hovering elsewhere and
  only demotes on a new selection. Selection state lifted to `App` (router-ready).
  Confirmed the pill is concentric with the sidebar (6/12).
- **Shell spacing/radius polish.** Added 6 (`space-3`) padding around the app so
  the sidebar floats off the edges (stretches to full height via flex). Narrowed
  the rail (item padding 8→6) and rounded the sidebar more (`radius-lg`→`radius-xl`,
  12) while keeping it concentric with the 6-radius active item (12 = 6 gap + 6).
- **Sidebar (static).** Built the dashboard sidebar shell in `client/src/app/`:
  a type-safe `navigation.ts` (7 modules → `ModuleId`, single source of truth)
  and `Sidebar.tsx`, rendered with Overview active. Surface-panel rail hugging
  24px icons, all spacing/radius/color from semantic tokens. Renamed the 7 tab
  icons to kebab-case and mapped their stroke to `currentColor` (svgr) so
  active/inactive color is token-driven. Set the site background to
  `surface/app` (sidebar stays `surface/panel`); both follow the light-mode
  token overrides, so we're dark-first but light-compatible. Router not wired yet.
- **Pivot to fullstack monorepo.** Restructured to npm workspaces: `client/`
  (Vite React dashboard), `shared/` (`@cappr/shared` — domain types + audit
  hash-chain), `server/` (Python/FastAPI placeholder). Blanked the UI to a
  clean screen; preserved the approval-queue / audit-trail / integrity-badge /
  policy-editor components for reuse. Rewrote README for the new positioning.
  Untracked local agent skills. Build / typecheck / lint green.
