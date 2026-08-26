# PRODUCT.md — Nudge by Shotoku

This document explains what we are building, why, and how the pieces fit together. It is written for context-loading (e.g. feeding to an LLM assistant) — not as a design spec. No visual/UI design decisions are covered here; this is functionality only.

---

## 1. Origin story: why we pivoted from a component library

Shotoku started as **Nudge**, a headless React component library for AI-agent spend/approval UIs. It shipped two components:

- **ApprovalQueue** — a headless component for surfacing pending agent actions to a human for approve/deny
- **AuditTrail** — a headless component for rendering a log of agent transactions/actions

As an open-source component library, Nudge solved a UI problem (how do you render an approval queue or an audit trail) but not the underlying problem (how do you actually **know** what an agent is spending, and how do you **stop** it from overspending). Any company using the components still had to build:

- Their own enforcement mechanism (something that actually intercepts and can block agent actions)
- Their own policy definition system (what counts as "too much," and for which agent)
- Their own audit/logging backend (the components could render a trail, but something had to generate one)

In other words: we were building the display layer for a much bigger, unsolved backend problem. The insight was that **the real product isn't the components — it's the governance layer underneath them.** That governance layer is Shotoku. Nudge is being rebuilt as the application that sits on top of Shotoku, reusing the original components (ApprovalQueue, AuditTrail) as two of its internal screens rather than as the standalone product.

**The pivot in one sentence:** we went from "here are some React components you can use to build your own agent-spend UI" to "here is the full system — enforcement, policy, audit, and the UI — that gives you agent spend control out of the box."

---

## 2. What Shotoku is

Shotoku is an **open-source spend-control and audit layer for AI agents**.

Tagline: *"Give your agents a budget, not your card."*

**The problem it solves:** AI agents (autonomous systems that call APIs, use tools, or spend money on a company's behalf) currently operate with no enforced spending limits. Companies either give agents unrestricted API keys/cards, or they build ad hoc, one-off guardrails per agent. There is no standard layer that sits between an agent and its spend and enforces a policy.

**Core architecture:**
- Agents make calls (to LLM providers, tools, APIs, or payment rails) **through** Shotoku rather than directly.
- Shotoku evaluates each call against a defined policy (a budget, a rate limit, a rule) before allowing it to proceed.
- Every call is logged, producing a complete audit trail.

**Current enforcement model and its limitation:**
The original architecture is SDK-based: agents voluntarily call an `authorize()` function before spending. This is an **honor-system** model — it depends on the agent's code cooperating. It does not physically prevent an uncooperative, compromised, or misconfigured agent from spending outside the SDK. This has been identified as the primary blocker to enterprise credibility.

**The fix, and current top product priority:**
An **HTTP proxy enforcement gateway**. Instead of agents opting in to calling `authorize()`, all traffic is routed through a proxy that Shotoku controls. This moves enforcement from "the agent chooses to ask permission" to "the agent physically cannot get through without permission." This is the single most important infrastructure piece being built right now, because it's what makes the audit trail and policy engine trustworthy rather than advisory.

**Compliance angle:**
The EU AI Act (Article 50, with an enforcement deadline that passed August 2, 2026) requires transparency and documentation for certain AI systems. Shotoku's audit trail is designed to double as compliance evidence — a byproduct of normal operation rather than a separate reporting exercise.

**Licensing model:** Open-core. The Shotoku SDK, proxy, and core policy engine are open-source. Nudge (the hosted/self-hosted dashboard application built on top) is the commercial product — likely tiered as a hosted cloud offering plus a self-hosted enterprise license for companies (especially in Europe) that need to keep agent financial/audit data on their own infrastructure.

---

## 3. What Nudge is

Nudge is the **application layer** built on top of Shotoku. If Shotoku is the meter and the enforcement gateway, Nudge is the dashboard, ledger, and policy interface a human actually uses.

**Who it's for:** Companies and startups running multiple AI agents in production, who need visibility into what those agents are spending and a way to set/enforce limits without every policy change requiring an engineer.

### 3.1 Functional modules

**Fleet Overview**
A single view of every agent currently governed by Shotoku: current spend, budget consumption, burn rate, spend broken down by provider/workflow, and anomaly flags (e.g. an agent stuck in a retry loop and burning spend abnormally fast).

**Ledger (built from the AuditTrail component)**
A complete, per-agent transaction history: every call the agent made, which policy rule evaluated it, and the outcome (allowed/blocked/flagged). This is the audit trail — the same data structure is what gets exported for compliance purposes.

**Firewall (the enforcement/policy runtime, surfaced in the UI)**
The interface for the proxy enforcement gateway. Enforcement is **graduated**, not binary. Each policy specifies an intervention level:
1. **Observe** — log only, take no action. Used for onboarding a new agent/policy without risk of breaking anything.
2. **Nudge** — warn the agent and/or its owner, but allow the action to proceed.
3. **Approve** — pause the action and require a human decision before it proceeds.
4. **Block** — the action is prevented outright.

This graduated model exists specifically to solve the adoption problem: companies are afraid to turn on hard spend limits in production because they fear breaking a workflow. Starting a new agent/policy in "observe" mode lets a company see what *would have happened* for a period before ratcheting up to enforcement.

**Studio (policy authoring)**
The interface for creating and editing policies. Two authoring modes, kept in sync:
- A **YAML editor** for developers who want direct, precise control.
- A **plain-English input** for non-developers (e.g. a finance or ops person), where an AI model compiles the natural-language description into the same validated YAML policy schema. The compiled YAML and the English description stay linked/round-trippable — editing one should be reflected in the other, so no one has to blindly trust an opaque translation.
- **Dry-run**: before a policy is saved/activated, it can be simulated against historical traffic (e.g. the last 7–30 days of real agent activity) to show what it *would* have done — how many transactions it would have blocked, flagged, or let through. This is what makes the plain-English compiler trustworthy rather than a novelty: a non-dev can see the concrete effect of their policy before it goes live.
- Policies are validated against a constrained schema (not freeform YAML) so the AI compiler cannot produce an invalid or ambiguous policy.

**Inbox (built from the ApprovalQueue component)**
The queue of pending actions that hit an "Approve" tier policy and are waiting on a human decision. A human can approve or deny directly from here (and, per the plan, from Slack/email as well).

**Score (agent trust / autonomy tiering)**
A mechanism for letting agents earn more autonomy over time rather than requiring every agent to be manually tuned. An agent that behaves consistently within policy over time can be automatically promoted to a higher autonomy tier (e.g. from "everything requires approval" to "can spend up to X unattended"); anomalous behavior can automatically demote it. This is intended to solve the scaling problem — manually tuning policy per agent doesn't work once a company is running many agents.

**Wallet**
The mechanism for actually issuing scoped spending instruments per agent (e.g. virtual cards or capped payment credentials), rather than every agent sharing one company card/API key. This is what makes "give your agents a budget, not your card" literal rather than metaphorical — the company issues a bounded instrument per agent instead of handing out a real card or unrestricted key.

### 3.2 How the modules relate to each other

- The **Firewall** (proxy) is the enforcement point everything else depends on — without it, the Ledger is just a log of an honor system, and the Inbox/Score have nothing real to act on.
- The **Studio** is how policies get defined; the **Firewall** is what executes them; the **Ledger** is the record of what happened; the **Inbox** is where a human steps in when a policy says to; the **Score** feeds back into the Studio/Firewall by adjusting how much autonomy a given agent has by default; the **Wallet** is the actual spending instrument the policy is ultimately constraining.
- **Fleet Overview** is the rollup view across all of the above.

---

## 4. Technical stack (functional/architectural, not visual)

- **Desktop app shell:** Tauri (Rust-based)
- **UI:** React + TypeScript, shared between the web dashboard and the desktop app
- **Hosted backend service:** Python (FastAPI) — not bundled into the desktop app; the desktop app talks to it as a service
- **Core proxy / policy engine:** Rust — this is the actual enforcement gateway described in section 2
- **Launch platform sequencing:** Web dashboard + Mac desktop app first; Windows/Linux desktop support added later based on demand

**Team split:**
- Design, UI/UX, and frontend implementation (React/TS)
- Backend and LLM/policy-compilation work — technical co-founder

---

## 5. What this is not

- Not a payment rail or card issuer — it is a policy/control layer that can sit in front of payment rails, LLM providers, and tool/API calls, not a replacement for any of them.
- Not a general AI observability/tracing tool — the focus is spend enforcement and audit, not debugging model behavior.
- Not (any longer) just a component library — the components are now internal building blocks of the app (Ledger = AuditTrail, Inbox = ApprovalQueue), not the standalone deliverable.

---

## 6. Open questions / not yet finalized

- Exact pricing/tiering split between the open-source core, hosted Nudge, and self-hosted enterprise license.
- Final naming: whether "Nudge" refers to the company/product suite as a whole or specifically the dashboard app (currently used both ways internally).
- Whether "enforcement tier" (observe/nudge/approve/block) is final terminology for the product itself, or an internal name only.