// Agent domain model + mock data for the Overview.
// Shared by the Agents table (AgentsCard) and the per-agent detail drawer
// (AgentDetailPanel) so both read from one source of truth.

// ── Enums ────────────────────────────────────────────────────────────────────

export type AgentStatus = "healthy" | "warning" | "anomaly" | "frozen" | "shadow";

/** Priority tier, T1 (highest) → T4. Also the 1-based count of filled tier dots. */
export type TierLevel = 1 | 2 | 3 | 4;
export const TIER_DOTS: TierLevel[] = [1, 2, 3, 4];

/** How hard the active policy bites, softest → hardest. */
export type EnforcementTier = "observe" | "nudge" | "approve" | "block";

/** What the policy engine did with a ledger transaction. */
export type PolicyOutcome = "allowed" | "nudged" | "approved" | "blocked";

// ── Sub-models ───────────────────────────────────────────────────────────────

/** An org member, shown with the same coloured initial-avatar as the topbar's
 *  organization switcher roster. */
export type Owner = { name: string; color: string };

/** A single scoped ledger transaction for one agent. */
export interface LedgerEntry {
  id: string;
  /** ISO timestamp. */
  at: string;
  action: string;
  /** Euros. */
  amount: number;
  outcome: PolicyOutcome;
}

/** A promotion / demotion / initial placement on the trust ladder. */
export interface TierChange {
  /** ISO timestamp. */
  at: string;
  /** 0 = agent onboarding (no prior tier). */
  from: TierLevel | 0;
  to: TierLevel;
  reason: string;
}

/** A spending instrument issued to an agent. */
export interface Wallet {
  /** Last four of the (masked) card number. */
  last4: string;
  /** ISO date. */
  issuedAt: string;
  /** Per-transaction cap, euros. */
  limit: number;
  scope: string;
}

/** A decision awaiting a human, scoped to one agent (mini-Inbox). */
export interface PendingApproval {
  id: string;
  summary: string;
  amount: number;
  /** ISO timestamp. */
  requestedAt: string;
}

/** Hand-authored narrative + governance fields per agent. */
export interface AgentNarrative {
  /** Plain-English gloss of the active policy (not raw YAML). */
  policySummary: string;
  enforcement: EnforcementTier;
  /** The raw policy, revealed behind the "View YAML" toggle. */
  policyYaml: string;
  /** Present only for `anomaly` agents — why the status fired. */
  anomalyReason?: string;
  tierHistory: TierChange[];
  wallet: Wallet | null;
  approvals: PendingApproval[];
}

export interface AgentRow extends AgentNarrative {
  name: string;
  tier: TierLevel;
  owner: Owner;
  /** Month-to-date spend, euros. */
  spend: number;
  /** Monthly budget cap, euros. */
  budget: number;
  status: AgentStatus;
}

// ── Calendar context (mirrors the fleet Month-to-Date view) ──────────────────

export const DAYS_IN_MONTH = 31;
export const TODAY_DAY = 26; // day-of-month spent through
export const MONTH_LABEL = "Aug";
export const YEAR = 2026;

// ── Owners (mirror the org-switcher roster — same names + avatar colours) ─────

const JULIUS: Owner = { name: "Julius Peschard", color: "var(--color-accent-500)" };
const YUSUF: Owner = { name: "Yusuf Adeyemi", color: "var(--color-green-500)" };
const INES: Owner = { name: "Ines Ferrand", color: "var(--color-amber-500)" };
const TOMAS: Owner = { name: "Tomas Weiss", color: "var(--color-red-500)" };

// ── Status palette (shared with the table + pills) ───────────────────────────

export const STATUS_META: Record<AgentStatus, { label: string; color: string }> = {
  healthy: { label: "Healthy", color: "var(--color-status-success)" },
  warning: { label: "Warning", color: "var(--color-status-warning)" },
  anomaly: { label: "Anomaly", color: "var(--color-status-danger)" },
  // Frozen — paused/on ice: a cool, calm blue. Shadow — running silently in the
  // background: a dim, muted neutral so it recedes next to the active statuses.
  frozen: { label: "Frozen", color: "var(--color-status-info)" },
  shadow: { label: "Shadow", color: "var(--color-text-muted)" },
};

export const ENFORCEMENT_META: Record<EnforcementTier, { label: string; hint: string }> = {
  observe: { label: "Observe", hint: "Log only — never intervene" },
  nudge: { label: "Nudge", hint: "Warn, but let it through" },
  approve: { label: "Approve", hint: "Hold for a human above threshold" },
  block: { label: "Block", hint: "Hard-stop over the limit" },
};

export const OUTCOME_META: Record<PolicyOutcome, { label: string; color: string }> = {
  allowed: { label: "Allowed", color: "var(--color-status-success)" },
  nudged: { label: "Nudged", color: "var(--color-status-warning)" },
  approved: { label: "Approved", color: "var(--color-status-info)" },
  blocked: { label: "Blocked", color: "var(--color-status-danger)" },
};

// ── Formatters + shared helpers ──────────────────────────────────────────────

export const fmtEUR = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
export const fmtPct = (ratio: number) => `${(ratio * 100).toFixed(1)}%`;

// "Yusuf Adeyemi" → "Yusuf A." — first name, last-name initial.
export const shortName = (name: string) => {
  const [first, ...rest] = name.split(" ");
  const last = rest.at(-1);
  return last ? `${first} ${last[0]}.` : first;
};

// Usage renders as this many vertical pills; a proportional run fills from the left.
export const USAGE_SEGMENTS = 10;

// Usage crossing budget reads danger; nearing it reads warning; otherwise the
// calm accent — the same escalation the Month-to-Date "% used" figure implies.
export const usageColor = (ratio: number) =>
  ratio >= 1
    ? "var(--color-status-danger)"
    : ratio >= 0.85
      ? "var(--color-status-warning)"
      : "var(--color-accent-500)";

// ── Mock roster ──────────────────────────────────────────────────────────────

/** A short ISO helper for authored timestamps (Europe, this month). */
const ts = (day: number, hour = 12, min = 0) =>
  new Date(Date.UTC(YEAR, 7 /* Aug */, day, hour, min)).toISOString();

export const AGENTS: AgentRow[] = [
  {
    name: "atlas-researcher",
    tier: 2,
    owner: YUSUF,
    spend: 1842.1,
    budget: 2100,
    status: "healthy",
    enforcement: "nudge",
    policySummary:
      "Auto-approves spend under €120. Anything larger warns the owner but still runs; nothing is hard-blocked.",
    policyYaml:
      "agent: atlas-researcher\nenforcement: nudge\nauto_approve_below: 120.00\nrequire_approval_above: 500.00\ncurrency: EUR",
    tierHistory: [
      { at: ts(2), from: 0, to: 3, reason: "Baseline placement" },
      { at: ts(12), from: 3, to: 2, reason: "10 days clean" },
    ],
    wallet: { last4: "4417", issuedAt: ts(2), limit: 300, scope: "Research vendors only" },
    approvals: [],
  },
  {
    name: "ledger-reconciler",
    tier: 1,
    owner: JULIUS,
    spend: 3187.4,
    budget: 3500,
    status: "warning",
    enforcement: "approve",
    policySummary:
      "Trusted tier-1 agent. Auto-approves under €400; anything above routes to Julius for sign-off before it runs.",
    policyYaml:
      "agent: ledger-reconciler\nenforcement: approve\nauto_approve_below: 400.00\nrequire_approval_above: 400.00\napprover: julius.peschard\ncurrency: EUR",
    tierHistory: [
      { at: ts(1), from: 0, to: 2, reason: "Baseline placement" },
      { at: ts(9), from: 2, to: 1, reason: "30 days clean" },
    ],
    wallet: { last4: "2211", issuedAt: ts(1), limit: 800, scope: "Settlement rails" },
    approvals: [
      { id: "apr-lr-1", summary: "Quarter-end reconciliation top-up", amount: 420, requestedAt: ts(26, 9, 14) },
    ],
  },
  {
    name: "inbox-triage",
    tier: 3,
    owner: INES,
    spend: 1578.9,
    budget: 1500,
    status: "anomaly",
    enforcement: "approve",
    policySummary:
      "Auto-approves under €60. Because it has crossed budget, everything now routes to Ines for approval.",
    policyYaml:
      "agent: inbox-triage\nenforcement: approve\nauto_approve_below: 60.00\nrequire_approval_above: 60.00\napprover: ines.ferrand\ncurrency: EUR",
    anomalyReason: "Burning 3.1× baseline since 14:02 — 214 enrichment calls in 40 min vs. a ~70/hr norm.",
    tierHistory: [
      { at: ts(3), from: 0, to: 3, reason: "Baseline placement" },
      { at: ts(26, 14, 6), from: 3, to: 3, reason: "Anomaly detected — demotion pending review" },
    ],
    wallet: { last4: "7788", issuedAt: ts(3), limit: 150, scope: "Enrichment APIs" },
    approvals: [
      { id: "apr-it-1", summary: "Bulk contact enrichment · 1,200 records", amount: 96, requestedAt: ts(26, 14, 8) },
      { id: "apr-it-2", summary: "Overage: mailbox scan credits", amount: 42.5, requestedAt: ts(26, 13, 51) },
    ],
  },
  {
    name: "firewall-sentinel",
    tier: 1,
    owner: TOMAS,
    spend: 612.05,
    budget: 2200,
    status: "healthy",
    enforcement: "block",
    policySummary:
      "Security-critical tier-1 agent. Auto-approves under €200; anything above the per-transaction cap is hard-blocked, no exceptions.",
    policyYaml:
      "agent: firewall-sentinel\nenforcement: block\nauto_approve_below: 200.00\nhard_limit: 500.00\ncurrency: EUR",
    tierHistory: [
      { at: ts(1), from: 0, to: 2, reason: "Baseline placement" },
      { at: ts(6), from: 2, to: 1, reason: "Security review passed" },
    ],
    wallet: { last4: "9021", issuedAt: ts(1), limit: 500, scope: "Threat-intel feeds" },
    approvals: [],
  },
  {
    name: "studio-render",
    tier: 4,
    owner: YUSUF,
    spend: 894.6,
    budget: 1300,
    status: "healthy",
    enforcement: "nudge",
    policySummary: "Auto-approves under €80. Larger render jobs warn the owner but proceed.",
    policyYaml:
      "agent: studio-render\nenforcement: nudge\nauto_approve_below: 80.00\nrequire_approval_above: 300.00\ncurrency: EUR",
    tierHistory: [{ at: ts(5), from: 0, to: 4, reason: "Baseline placement" }],
    wallet: { last4: "3355", issuedAt: ts(5), limit: 250, scope: "GPU compute" },
    approvals: [],
  },
  {
    name: "market-scanner",
    tier: 2,
    owner: INES,
    spend: 2450.0,
    budget: 2600,
    status: "warning",
    enforcement: "approve",
    policySummary:
      "Auto-approves under €150; above that routes to Ines. Nearing its monthly cap, so approvals are tightening.",
    policyYaml:
      "agent: market-scanner\nenforcement: approve\nauto_approve_below: 150.00\nrequire_approval_above: 150.00\napprover: ines.ferrand\ncurrency: EUR",
    tierHistory: [
      { at: ts(2), from: 0, to: 3, reason: "Baseline placement" },
      { at: ts(15), from: 3, to: 2, reason: "12 days clean" },
    ],
    wallet: { last4: "6642", issuedAt: ts(2), limit: 400, scope: "Market-data vendors" },
    approvals: [
      { id: "apr-ms-1", summary: "Premium feed renewal · Q3", amount: 180, requestedAt: ts(26, 10, 2) },
    ],
  },
  {
    name: "payroll-runner",
    tier: 1,
    owner: JULIUS,
    spend: 0,
    budget: 1800,
    status: "frozen",
    enforcement: "block",
    policySummary:
      "Paused. While frozen, every transaction is hard-blocked regardless of amount — no spend can occur until it is unfrozen.",
    policyYaml:
      "agent: payroll-runner\nenforcement: block\nstate: frozen\nauto_approve_below: 0.00\ncurrency: EUR",
    tierHistory: [
      { at: ts(1), from: 0, to: 1, reason: "Payroll-critical onboarding" },
      { at: ts(20), from: 1, to: 1, reason: "Frozen for payroll-cycle window" },
    ],
    wallet: { last4: "1180", issuedAt: ts(1), limit: 1000, scope: "Payroll disbursement" },
    approvals: [],
  },
  {
    name: "compliance-audit",
    tier: 3,
    owner: TOMAS,
    spend: 320.75,
    budget: 1200,
    status: "frozen",
    enforcement: "approve",
    policySummary:
      "Paused mid-audit. While frozen, transactions are held; on resume, spend over €90 routes to Tomas.",
    policyYaml:
      "agent: compliance-audit\nenforcement: approve\nstate: frozen\nauto_approve_below: 90.00\napprover: tomas.weiss\ncurrency: EUR",
    tierHistory: [{ at: ts(4), from: 0, to: 3, reason: "Baseline placement" }],
    wallet: null,
    approvals: [],
  },
  {
    name: "pricing-experiment",
    tier: 4,
    owner: YUSUF,
    spend: 458.2,
    budget: 900,
    status: "shadow",
    enforcement: "observe",
    policySummary:
      "Running in shadow mode. Policy decisions are computed and logged, but nothing is enforced — spend is observed, not gated.",
    policyYaml:
      "agent: pricing-experiment\nenforcement: observe\nshadow: true\nauto_approve_below: 100.00\ncurrency: EUR",
    tierHistory: [{ at: ts(8), from: 0, to: 4, reason: "Shadow-mode placement" }],
    wallet: null,
    approvals: [],
  },
  {
    name: "route-optimizer",
    tier: 2,
    owner: INES,
    spend: 1105.4,
    budget: 1600,
    status: "shadow",
    enforcement: "observe",
    policySummary:
      "Running in shadow mode. Decisions are logged for calibration but not enforced; a nudge policy is staged for promotion.",
    policyYaml:
      "agent: route-optimizer\nenforcement: observe\nshadow: true\nstaged_enforcement: nudge\nauto_approve_below: 130.00\ncurrency: EUR",
    tierHistory: [
      { at: ts(3), from: 0, to: 3, reason: "Shadow-mode placement" },
      { at: ts(18), from: 3, to: 2, reason: "Shadow metrics clean" },
    ],
    wallet: { last4: "5290", issuedAt: ts(3), limit: 300, scope: "Logistics APIs" },
    approvals: [],
  },
];

// ── Deterministic detail generation (ledger + spend curve) ───────────────────
// Series and ledger are generated from a name-seeded PRNG so they are stable
// across renders without bloating the hand-authored roster above.

function seedFrom(name: string): number {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LEDGER_ACTIONS = [
  "OpenAI API · GPT-4o",
  "Anthropic API · Claude",
  "Vector search · Pinecone",
  "Compute · A100 GPU-hr",
  "Dataset license",
  "Web search · SerpAPI",
  "Vendor payment",
  "Object storage egress",
];

export interface AgentComputed {
  usage: number;
  /** €/day, averaged over the elapsed month. */
  dailyBurn: number;
  /** Cumulative spend, day 1 → TODAY_DAY (length TODAY_DAY). */
  series: number[];
  /** Projected day-of-month the budget is crossed at current burn; null if not this month. */
  projectedBreachDay: number | null;
  /** Projected month-end spend at the current daily average. */
  projectedEnd: number;
  ledger: LedgerEntry[];
}

/** Derive the spend curve, burn rate, breach projection, and scoped ledger for
 *  an agent. Deterministic per agent name. */
export function computeAgentDetail(agent: AgentRow): AgentComputed {
  const usage = agent.budget > 0 ? agent.spend / agent.budget : 0;
  const rand = mulberry32(seedFrom(agent.name));

  // Organic daily weights that sum to the month-to-date spend.
  const weights = Array.from({ length: TODAY_DAY }, (_, i) => 0.6 + rand() + 0.3 * Math.sin(i * 1.1));
  let acc = 0;
  const cumulativeRaw = weights.map((w) => (acc += Math.max(w, 0.1)));
  const total = cumulativeRaw[cumulativeRaw.length - 1] || 1;
  const series = cumulativeRaw.map((v) => (v / total) * agent.spend);

  const dailyBurn = agent.spend / TODAY_DAY;
  // Recent burn (last 5 days) drives the forward projection so anomalies bend up.
  const recentSpan = series[TODAY_DAY - 1] - series[Math.max(TODAY_DAY - 6, 0)];
  const recentBurn = recentSpan / 5 || dailyBurn;
  const projectedEnd = agent.spend + recentBurn * (DAYS_IN_MONTH - TODAY_DAY);

  let projectedBreachDay: number | null = null;
  if (agent.spend >= agent.budget) {
    projectedBreachDay = TODAY_DAY; // already over
  } else if (recentBurn > 0) {
    const day = TODAY_DAY + (agent.budget - agent.spend) / recentBurn;
    projectedBreachDay = day <= DAYS_IN_MONTH ? Math.round(day) : null;
  }

  // Scoped ledger — most-recent first.
  const count = 7;
  const ledger: LedgerEntry[] = Array.from({ length: count }, (_, i) => {
    const minutesAgo = Math.round((i + 1) * (35 + rand() * 90));
    const amount = Number((3 + rand() * 120).toFixed(2));
    const action = LEDGER_ACTIONS[Math.floor(rand() * LEDGER_ACTIONS.length)];
    return {
      id: `${agent.name}-led-${i}`,
      at: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
      action,
      amount,
      outcome: outcomeFor(agent, amount, i, rand),
    };
  });

  return { usage, dailyBurn, series, projectedBreachDay, projectedEnd, ledger };
}

/** Map a transaction to a policy outcome consistent with the agent's status. */
function outcomeFor(agent: AgentRow, amount: number, index: number, rand: () => number): PolicyOutcome {
  if (agent.status === "frozen") return "blocked";
  // Shadow logs what would have happened; keep it mostly "allowed".
  if (agent.status === "shadow") return amount > 90 && rand() > 0.6 ? "nudged" : "allowed";
  if (agent.status === "anomaly" && index < 2) return rand() > 0.5 ? "blocked" : "approved";
  if (amount > 90) return agent.enforcement === "block" ? "blocked" : agent.enforcement === "approve" ? "approved" : "nudged";
  if (amount > 60) return "nudged";
  return "allowed";
}
