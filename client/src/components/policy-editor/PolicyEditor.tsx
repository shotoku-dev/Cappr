import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Policy, AgentPolicy, AuditEntry } from "@cappr/shared";

const PAD_X = 20;
const COLLAPSED_HEIGHT = 44;

function fmt(value: number): string {
  return value.toFixed(2);
}

function fmtCompact(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value % 1 === 0 ? String(value) : fmt(value);
}

// ─── Numeric field ────────────────────────────────────────────────────────────

function NumericField({
  value,
  prefix,
  fontSize = "inherit",
  onChange,
}: {
  value: number;
  prefix?: string;
  fontSize?: string | number;
  onChange: (v: number) => void;
}) {
  const [raw, setRaw] = useState(fmt(value));
  const [focused, setFocused] = useState(false);

  function commit() {
    setRaw(fmt(value));
    setFocused(false);
  }

  function handleChange(s: string) {
    if (s !== "" && !/^-?\d*\.?\d*$/.test(s)) return;
    setRaw(s);
    const n = parseFloat(s);
    if (!isNaN(n) && n >= 0) onChange(n);
  }

  const displayVal = focused ? raw : fmt(value);
  const displayLen = Math.min(Math.max(displayVal.length, 3), 12);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "flex-end",
        fontSize,
        background: focused ? "var(--color-surface-panel-elevated)" : "transparent",
        borderRadius: 4,
        padding: "1px 4px",
        transition: "background 150ms ease",
        maxWidth: 110,
      }}
    >
      {prefix && (
        <span style={{ color: "var(--color-text-muted)", lineHeight: 1, flexShrink: 0 }}>
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="decimal"
        value={displayVal}
        onFocus={() => { setRaw(fmt(value)); setFocused(true); }}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        style={{
          width: `${displayLen}ch`,
          background: "none",
          border: "none",
          outline: "none",
          font: "inherit",
          color: "var(--color-text-primary)",
          padding: 0,
          textAlign: "right",
          caretColor: "var(--color-accent-500)",
        }}
      />
    </span>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onChange(!enabled); }}
      style={{
        width: 28,
        height: 16,
        borderRadius: 999,
        background: enabled ? "var(--color-accent-500)" : "var(--color-surface-active)",
        border: "none",
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
        transition: "background 200ms ease",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: enabled ? 14 : 2,
          width: 12,
          height: 12,
          borderRadius: 999,
          background: "white",
          transition: "left 200ms ease",
        }}
      />
    </button>
  );
}

// ─── Budget card ──────────────────────────────────────────────────────────────

function BudgetCard({
  current,
  limit,
  prefix,
  onChange,
}: {
  current: number;
  limit: number;
  prefix: string;
  onChange: (v: number) => void;
}) {
  const pct = Math.min(current / limit, 1);
  const barColor =
    pct >= 0.9 ? "var(--color-red-500)"
    : pct >= 0.7 ? "var(--color-amber-500)"
    : "var(--color-accent-500)";

  return (
    <div
      className="bg-surface-app"
      style={{
        width: 300,
        border: "0.5px solid var(--color-border-subtle)",
        borderRadius: 16,
        overflow: "hidden",
        padding: `10px ${PAD_X}px 14px`,
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <span className="text-xs text-text-muted">Monthly budget cap</span>
        <NumericField value={limit} prefix={prefix} fontSize={14} onChange={onChange} />
      </div>
      <div style={{ height: 6, borderRadius: 999, background: "var(--color-surface-input)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct * 100}%`,
            background: barColor,
            borderRadius: 999,
            transition: "width 400ms cubic-bezier(0.22, 1, 0.36, 1), background 300ms ease",
          }}
        />
      </div>
      <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
        <span className="text-[10px] tabular-nums text-text-muted">{prefix}{fmtCompact(current)} spent</span>
        <span className="text-[10px] tabular-nums text-text-muted">{prefix}{fmtCompact(limit - current)} left</span>
      </div>
    </div>
  );
}

// ─── Agent card ───────────────────────────────────────────────────────────────

const openSpring  = { type: "spring", duration: 0.5, bounce: 0 } as const;
const closeSpring = { type: "spring", duration: 0.4, bounce: 0 } as const;
const collapseTransition = { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] };

function AgentCard({
  policy,
  prefix,
  requests,
  isActive,
  onClick,
  onChange,
}: {
  policy: AgentPolicy;
  prefix: string;
  requests: number;
  isActive: boolean;
  onClick: () => void;
  onChange: (updated: AgentPolicy) => void;
}) {
  return (
    <motion.div
      className="bg-surface-app relative"
      style={{
        width: 300,
        border: "0.5px solid var(--color-border-subtle)",
        overflow: "hidden",
        cursor: isActive ? "default" : "pointer",
      }}
      animate={{
        height: isActive ? "auto" : COLLAPSED_HEIGHT,
        borderRadius: isActive ? 16 : 12,
      }}
      transition={isActive ? openSpring : closeSpring}
      onClick={isActive ? undefined : onClick}
    >
      {/* Collapsed overlay — name + auto-approve status */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: PAD_X,
          paddingRight: PAD_X,
          pointerEvents: "none",
        }}
        animate={{ opacity: isActive ? 0 : 1 }}
        transition={isActive ? { duration: 0 } : { duration: 0.2, delay: 0.1 }}
      >
        <div className="flex items-center" style={{ gap: 6 }}>
          <span className="text-sm font-normal text-text-primary">{policy.agent}</span>
          {requests > 0 && (
            <span className="text-[10px] tabular-nums text-text-disabled">{requests} req</span>
          )}
        </div>
        <span
          className="text-[10px]"
          style={{ color: policy.autoApproveEnabled ? "var(--color-accent-500)" : "var(--color-text-disabled)" }}
        >
          {policy.autoApproveEnabled ? "auto" : "manual"}
        </span>
      </motion.div>

      {/* Expanded content */}
      <motion.div
        style={{ padding: `12px ${PAD_X}px 12px`, pointerEvents: isActive ? "auto" : "none" }}
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: isActive ? 0 : 0.08 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center" style={{ gap: 6 }}>
            <span className="text-sm font-medium text-text-primary">{policy.agent}</span>
            {requests > 0 && (
              <span className="text-[10px] tabular-nums text-text-disabled">{requests} req</span>
            )}
          </div>
          <div className="flex items-center" style={{ gap: 8 }}>
            <span className="text-[10px] text-text-muted">Auto-approve</span>
            <Toggle
              enabled={policy.autoApproveEnabled}
              onChange={(v) => onChange({ ...policy, autoApproveEnabled: v })}
            />
          </div>
        </div>

        <motion.div
          animate={{
            height: policy.autoApproveEnabled ? "auto" : 0,
            opacity: policy.autoApproveEnabled ? 1 : 0,
          }}
          transition={collapseTransition}
          style={{ overflow: "hidden" }}
        >
          <div className="flex flex-col" style={{ gap: 5, marginTop: 10 }}>
            {[
              { label: "Below (auto)",  key: "autoApproveBelow"    as const },
              { label: "Above (block)", key: "requireApprovalAbove" as const },
            ].map(({ label, key }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs text-text-muted">{label}</span>
                <NumericField
                  value={policy[key]}
                  prefix={prefix}
                  fontSize={13}
                  onChange={(v) => onChange({ ...policy, [key]: v })}
                />
              </div>
            ))}
          </div>
        </motion.div>

        <div
          className="flex items-center justify-between"
          style={{ marginTop: 10, paddingTop: 10, borderTop: "0.5px solid var(--color-border-subtle)" }}
        >
          <span className="text-xs text-text-muted">Lock audit records</span>
          <Toggle
            enabled={policy.auditLocked}
            onChange={(v) => onChange({ ...policy, auditLocked: v })}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── PolicyEditor ─────────────────────────────────────────────────────────────

interface Props {
  policy: Policy;
  onChange: (updated: Policy) => void;
  currentSpend?: number;
  auditEntries?: AuditEntry[];
  isActive?: boolean;
}

export function PolicyEditor({ policy, onChange, currentSpend = 0, auditEntries = [], isActive = true }: Props) {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  function updateAgent(index: number, updated: AgentPolicy) {
    onChange({ ...policy, agents: policy.agents.map((a, i) => (i === index ? updated : a)) });
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!isActive || e.target instanceof HTMLInputElement) return;
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      const agents = policy.agents;
      const idx = agents.findIndex((a) => a.agent === activeAgent);
      const nextIdx =
        e.key === "ArrowDown"
          ? Math.min(idx + 1, agents.length - 1)
          : Math.max(idx - 1, 0);
      const target = agents[nextIdx];
      if (target && target.agent !== activeAgent) setActiveAgent(target.agent);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isActive, activeAgent, policy.agents]);

  return (
    <div data-cappr="policy-editor" className="flex flex-col" style={{ gap: 8 }}>
      <BudgetCard
        current={currentSpend}
        limit={policy.budgetLimit}
        prefix={policy.budgetPrefix}
        onChange={(v) => onChange({ ...policy, budgetLimit: v })}
      />

      {/* Dotted separator between budget and agent cards */}
      <div style={{ borderTop: "1.5px dashed var(--color-border-subtle)", width: 300 }} />

      {policy.agents.map((agent, i) => (
        <AgentCard
          key={agent.agent}
          policy={agent}
          prefix={policy.budgetPrefix}
          requests={auditEntries.filter((e) => e.request.requester === agent.agent).length}
          isActive={activeAgent === agent.agent}
          onClick={() => setActiveAgent(prev => prev === agent.agent ? null : agent.agent)}
          onChange={(updated) => updateAgent(i, updated)}
        />
      ))}
    </div>
  );
}
