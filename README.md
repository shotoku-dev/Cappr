# Cappr

The dashboard application for **Shotoku** — an open-source spend-control and audit layer for AI agents.

> *"Give your agents a budget, not your card."*

---

## What it is

AI agents call APIs, use tools, and spend money on a company's behalf — usually with no enforced limit. Shotoku sits between an agent and its spend: every call is routed through an enforcement gateway, evaluated against a policy, and logged to a tamper-evident audit trail.

**Cappr is the application layer on top of Shotoku** — the dashboard, ledger, and policy interface a human actually uses. It is the commercial product in an open-core model (the Shotoku SDK, proxy, and policy engine are open source).

Cappr began life as **Nudge**, a standalone headless component library; those components (`ApprovalQueue`, `AuditTrail`) now live on as internal screens of the app rather than as the deliverable. See [`docs/PRODUCT.md`](docs/PRODUCT.md) for the full product context.

---

## Repository layout

This is an npm-workspaces monorepo.

```
cappr/
├── client/     @cappr/client — React 19 + TS + Tailwind v4 web dashboard (Vite)
├── shared/     @cappr/shared — domain types + audit hash-chain, shared across frontends
├── server/     Python/FastAPI backend (placeholder — separate toolchain, not in the JS workspace)
└── docs/       PRODUCT.md, DESIGN_SYSTEM.md
```

- **`client/`** is the current focus: the web dashboard. Its modules map to the product areas in `docs/PRODUCT.md` (Fleet Overview, Ledger, Firewall, Studio, Inbox, Score, Wallet).
- **`shared/`** holds the domain model and the audit hash-chain (`hashEntry` / `verifyChain`), imported by the client as `@cappr/shared`. It's the seam that the future Tauri desktop app will also build on.
- **`server/`** is a Python/FastAPI service (with a separate Rust proxy/policy engine); it is intentionally excluded from the JS workspace and is owned by the backend track.

The React UI currently renders a blank screen — the pivot is in progress. The approval-queue / audit-trail / integrity-badge / policy-editor components are preserved under `client/src/components` for reuse but are not yet wired into the app.

---

## Getting started

```bash
npm install          # installs all workspaces

npm run dev          # start the client dev server
npm run build        # typecheck + build the client
npm run typecheck    # check shared, then build client
npm run lint         # oxlint across the repo
```

All scripts run from the repository root and delegate to `@cappr/client`.

---

## Design system

Token architecture and naming conventions are documented in [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).
