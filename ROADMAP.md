# ROADMAP — Nudge

Living document. **Update it whenever something is built or fixed** — add a dated
entry to the [Build log](#build-log) and flip the relevant module/task status.
Keep it honest: status reflects what actually works, not what's planned.

For product context (what each module *is* and why), see [`docs/PRODUCT.md`](docs/PRODUCT.md).
For the repo layout, see [`README.md`](README.md).

Status legend: 🔴 Not started · 🟡 In progress · 🟢 Done · ⏸️ Parked

---

## North star

Nudge is the dashboard application on top of **Shotoku**, an open-source
spend-control and audit layer for AI agents. *"Give your agents a budget, not
your card."* We are building the frontend first, against mock data, with the API
contract pinned to `@nudge/shared` once it settles.

**Engineering bar (non-negotiable):** everything stays **organized, modular,
type-safe, and scalable.** Concretely:
- One responsibility per module/file; features are self-contained and composable.
- No `any`; domain types live in `@nudge/shared` and flow end-to-end.
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
| 4 | Wire to real API (`server/` FastAPI) via `@nudge/shared` contract | 🔴 Not started |

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

### 2026-08-26
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
  (Vite React dashboard), `shared/` (`@nudge/shared` — domain types + audit
  hash-chain), `server/` (Python/FastAPI placeholder). Blanked the UI to a
  clean screen; preserved the approval-queue / audit-trail / integrity-badge /
  policy-editor components for reuse. Rewrote README for the new positioning.
  Untracked local agent skills. Build / typecheck / lint green.
