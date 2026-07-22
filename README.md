# Nudge

A headless React component library for human-in-the-loop approval moments in AI and automated systems.

---

## What it is

Nudge provides the UI layer for moments where an AI agent or automated process needs a human decision before proceeding. Instead of building approval flows from scratch every time, you drop in a Nudge component, wire it to your request queue, and own the styling entirely.

Think of it as the checkout counter between your agent and the real world.

---

## Why it exists

AI agents act fast. They schedule infra changes, move money, merge code, send emails. Most of the time that's fine — but sometimes you want a human in the loop before something consequential happens.

The tooling for that moment is either missing or bespoke. Nudge fills that gap: a focused, composable set of components for approval queues, confirmation dialogs, and other human-gating patterns.

---

## Distribution model

Nudge follows the [shadcn/ui](https://ui.shadcn.com) model: **you copy the component source into your project and own it**. No locked-in abstraction, no style conflicts. The components ship unstyled hooks + logic; you bring the design tokens.

```
src/
  components/
    approval-queue/       ← copy this into your project
      ApprovalQueue.tsx
      QueueItemExpanded.tsx
      QueueItemCollapsed.tsx
      StatusOverlay.tsx
      index.ts
  hooks/
    useApprovalQueue.ts   ← the stateful logic, separate from UI
```

---

## v0 — ApprovalQueue

The first and current component. Renders a live queue of pending requests with expand/collapse, approve/deny/modify actions, constraint validation, and resolved-state transitions.

### Usage

```tsx
import { ApprovalQueue } from "@/components/approval-queue";

<ApprovalQueue
  requests={pendingRequests}
  onApprove={(id, value) => agent.approve(id, value)}
  onDeny={(id) => agent.deny(id)}
  onModify={(id, newValue) => agent.propose(id, newValue)}
/>
```

### Request shape

```ts
interface NudgeRequest {
  id: string;
  requester: string;        // e.g. "ops-agent", "ci-pipeline"
  summary: string;          // one-line description of the action
  detail?: string;          // longer context shown in expanded view
  value?: number;           // proposed value (spend amount, replica count, etc.)
  constraint?: {
    label: string;          // e.g. "max_per_tx"
    limit: number;          // value must not exceed this
  };
  requestedAt: string;      // ISO 8601 timestamp
}
```

### Props

| Prop | Type | Description |
|---|---|---|
| `requests` | `NudgeRequest[]` | Live list of pending requests |
| `onApprove` | `(id, value?) => void \| Promise` | Called when operator approves |
| `onDeny` | `(id) => void \| Promise` | Called when operator denies |
| `onModify?` | `(id, newValue) => void \| Promise` | Called when operator edits the value |
| `resolveDelayMs?` | `number` | How long to show resolved state before removing (default 750ms) |

---

## Design system

Token architecture and naming conventions are documented in [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).

---

## Running locally

```bash
npm install
npm run dev
```
