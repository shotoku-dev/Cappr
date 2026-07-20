  # Nudge

*A headless React component library for human-in-the-loop moments — reviewing, approving, or interrupting anything that acts on your behalf.*

---

## 1. The concept

Every product that lets something autonomous act — an AI agent, a background job, an automation, a bot — eventually needs the same primitive: **a moment where a human looks at a proposed action and decides what happens next.** Approve it, deny it, adjust it, or just watch it happen.

Right now, everyone building this rebuilds it from scratch, badly. It's usually a table, or a Slack message, or a raw JSON blob in a dashboard nobody wants to look at. There's no equivalent of what Radix did for menus/dialogs or what TanStack did for tables — a well-designed, unstyled, composable primitive for **review-and-decide interactions.**

Nudge is that primitive. It doesn't know or care what's asking for approval — an AI agent, a CI pipeline, a teammate's PR, a scheduled job. It just knows: something is *requesting*, something has a *value* and a *constraint*, and a human needs to *decide*.

### Naming philosophy

Keep the vocabulary generic on purpose — this is what makes it reusable beyond any one use case (agent spend, infra changes, content moderation, workflow approvals, whatever comes next):

| Generic term | Example in an agent-spend context | Example in a different context |
|---|---|---|
| `Requester` | An AI agent (`ops-agent`) | A CI pipeline, a teammate |
| `Request` | "Spend €49.99 on AWS EMEA" | "Merge this PR," "Delete these files" |
| `Constraint` | A policy rule (`maxAmount: 30`) | A rate limit, a permission scope |
| `Decision` | approved / denied / pending | same, universally |
| `Resolver` | The human clicking Approve | same, universally |

The component library never says "agent" or "policy" in its core API. Those are Shotoku's words, not Nudge's. Nudge is the primitive; specific products are the vocabulary layer on top.

### Distribution philosophy: shadcn-style, not npm-black-box

Nudge ships the way shadcn/ui ships: a CLI copies component source directly into the consumer's repo. No opaque compiled package, no fighting a design system that isn't yours. You own the code the moment you install it. This matters because approval UIs are exactly the kind of thing every team wants to restyle to match their own product — a black-box library would fight that on day one.

Two layers, always kept separate:

- **Headless hooks** — all state machine logic (`useApprovalQueue`), zero JSX, zero styling opinions. This is the part someone could theoretically use without ever touching the provided components.
- **Styled components** — a default, opinionated visual layer (hairline borders, spring animations, dark-first) built *on top of* the hooks, shipped as copy-paste source. Good enough to use as-is, easy to override because it's just code in your repo.

---

## 2. Why ApprovalQueue first

It's the most universal pattern in this family (audit trails, budget meters, policy builders, permission grants — all come later, see §6) and it's the one you've already prototyped the interaction design for. Building it first also forces you to get the headless/styled split right early, before there's a second component to accidentally couple to the first one's assumptions.

### What ApprovalQueue needs to do, in generic terms

- Show one request in full detail (the "active" one) and the rest collapsed in a stack.
- Let the resolver approve, deny, or modify the active request.
- Modifying should re-validate against the request's constraint before allowing approval.
- Resolving a request should transition it out of the queue and promote the next one automatically.
- Any aggregate value tied to the queue (a budget, a count, a rate) should update reactively as requests resolve.
- Clicking a collapsed item should promote it to active, demoting the current active item back into the stack.

None of this mentions money, agents, or AWS. Those are just the demo data you'll use while building it.

---

## 3. Package structure (target shape)

You won't build all of this on day one — this is the shape to grow into, not the starting scaffold. Start with just `packages/react`.

```
nudge/
├── packages/
│   └── react/
│       ├── src/
│       │   ├── hooks/
│       │   │   └── useApprovalQueue.ts
│       │   ├── components/
│       │   │   └── approval-queue/
│       │   │       ├── ApprovalQueue.tsx
│       │   │       ├── QueueItem.tsx
│       │   │       ├── QueueItemExpanded.tsx
│       │   │       ├── QueueItemCollapsed.tsx
│       │   │       └── index.ts
│       │   ├── types.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── apps/
│   └── playground/          — local Vite app, just for you to see it render
├── package.json              — workspace root (pnpm/turborepo later, not needed yet)
└── README.md
```

For right now, ignore the monorepo tooling entirely. Build inside a single Vite app. Split into `packages/` only once the component is stable enough that "publishing it" is a real next step.

---

## 4. Scaffold it locally, step by step

```bash
# 1. Scaffold a Vite + React + TypeScript app — this is your playground,
#    not the final package structure yet.
npm create vite@latest nudge -- --template react-ts
cd nudge
npm install

# 2. Animation + icons — same stack as the Shotoku prototype
npm install framer-motion lucide-react

# 3. Tailwind, for the default styled layer
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

`tailwind.config.js` — scan the right paths:

```js
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

Folder to create inside `src/`:

```
src/
├── hooks/
│   └── useApprovalQueue.ts
├── components/
│   └── approval-queue/
│       ├── ApprovalQueue.tsx
│       ├── QueueItemExpanded.tsx
│       ├── QueueItemCollapsed.tsx
│       └── StatusOverlay.tsx
├── types.ts
└── App.tsx          — playground page, renders <ApprovalQueue /> with fake data
```

---

## 5. Core types and hook shape (the contract to design against)

Sketch this before writing any JSX — it's the part that has to be right, since the styled components are just a rendering of this shape.

```ts
// types.ts

export type DecisionStatus = "pending" | "approved" | "denied";

export interface NudgeRequest {
  id: string;
  requester: string;        // "ops-agent", "ci-pipeline", a teammate's name
  summary: string;          // "€49.99 to AWS EMEA"
  detail?: string;          // longer description / note
  value?: number;           // optional — not every request has a numeric value
  constraint?: {
    label: string;          // "max_per_tx"
    limit: number;
  };
  requestedAt: string;      // ISO timestamp
}

export interface UseApprovalQueueOptions {
  requests: NudgeRequest[];
  onApprove: (id: string, value?: number) => void | Promise<void>;
  onDeny: (id: string) => void | Promise<void>;
  onModify?: (id: string, newValue: number) => void | Promise<void>;
  resolveDelayMs?: number;   // default ~750, time the status overlay lingers
}

export interface UseApprovalQueueReturn {
  items: NudgeRequest[];
  activeId: string | null;
  setActiveId: (id: string) => void;
  statuses: Record<string, DecisionStatus>;
  approve: (id: string) => void;
  deny: (id: string) => void;
  modify: (id: string, newValue: number) => void;
}
```

The hook (`useApprovalQueue.ts`) is the piece to port directly from the interactive prototype already built — `activeId` state, the `statuses` map, the `setTimeout`-based resolve-then-remove flow, auto-promoting the next item. Strip out anything that mentioned budget/agent/policy by name; those become optional, generic fields (`value`, `constraint`) instead.

Note the one real gap from the prototype worth fixing here: **`modify` should validate `newValue` against `constraint.limit` inside the hook**, and refuse (or return a validation result) rather than blindly approving whatever number was typed. That check belongs in the headless layer, not the component — anyone consuming the hook directly should get the same guarantee.

---

## 6. Roadmap after ApprovalQueue ships

Not for now — just so the generic vocabulary above is designed with these in mind from day one:

- **`AuditTrail`** — a resolved-history list/timeline view. Natural pair to the queue.
- **`IntegrityBadge`** — visual proof of an unbroken (or broken) record chain.
- **`ConstraintMeter`** — the generic version of a budget bar; any consumable limit.
- **`ConstraintBuilder`** — form-based editor for defining constraints, with a generated-config preview (YAML, JSON, whatever the consumer wants).
- **`ConfirmSingle`** — lighter single-action variant of the queue, for one high-stakes decision rather than a stack.
- **`ActivityFeed`** — ambient, non-decision stream of everything a requester has done, resolved or not.

Each of these should be buildable against the same `Requester` / `Request` / `Constraint` / `Decision` vocabulary from §1 without inventing new concepts.

---

## 7. What "done" looks like for v0

A minimal but real v0, before any docs site or publishing:

- [ ] `useApprovalQueue` hook, fully generic, typed, with the modify-revalidation fix
- [ ] `ApprovalQueue` styled component consuming the hook — default theme, hairline/dark aesthetic
- [ ] A `playground` app rendering it with fake generic data (not agent/money-specific) to prove genericness
- [ ] A second playground page rendering it with agent-spend-flavored data (proving Shotoku-style consumption still works cleanly through the same generic API)
- [ ] `README.md` in `packages/react` documenting the hook's props/return shape

Only once that's solid does it make sense to think about the shadcn-style CLI, a docs site, or a Shotoku adapter package — all deliberately out of scope for v0.