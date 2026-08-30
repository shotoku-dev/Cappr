// Small presentational atoms shared by the Agents table (AgentsCard) and the
// per-agent detail drawer (AgentDetailPanel): the tier dot-grid badge, the
// status pill, and the segmented usage bar. Keeping them here means the two
// surfaces render an agent identically.

import {
  TIER_DOTS,
  STATUS_META,
  USAGE_SEGMENTS,
  usageColor,
  fmtPct,
  type TierLevel,
  type AgentStatus,
} from "./agents";

// Longest status label — every pill is pinned to this width so a column of them
// lines up whichever status each row shows.
const STATUS_LABEL_CH = Math.max(...Object.values(STATUS_META).map((s) => s.label.length));

/**
 * Tier badge — "T{n}" beside a 2×2 dot grid. Dots fill cumulatively (T1 → first
 * dot, T2 → first two, …) read left-to-right then top-to-bottom, the rest faded.
 */
export function TierBadge({ tier, size = "sm" }: { tier: TierLevel; size?: "sm" | "md" }) {
  const dot = size === "md" ? 6 : 5;
  const fontSize = size === "md" ? 13 : 12;
  return (
    <span className="flex items-center" style={{ gap: "var(--spacing-space-3)" }}>
      <span
        style={{
          fontSize,
          fontWeight: 500,
          lineHeight: 1, // trim the line box so the digit centres on the dots
          color: "var(--color-text-secondary)",
        }}
      >
        T{tier}
      </span>
      <span
        aria-hidden
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(2, ${dot}px)`, // fills TL, TR, then BL, BR
          gap: 2,
        }}
      >
        {TIER_DOTS.map((n) => (
          <span
            key={n}
            style={{
              width: dot,
              height: dot,
              borderRadius: "var(--radius-full)",
              background: "var(--color-text-primary)",
              opacity: n <= tier ? 1 : 0.22, // filled up to the tier level
            }}
          />
        ))}
      </span>
    </span>
  );
}

/**
 * Status pill — coloured dot + label in a faint neutral pill. The label is
 * pinned to the longest status so a column of pills lines up.
 */
export function StatusPill({ status, pinWidth = true }: { status: AgentStatus; pinWidth?: boolean }) {
  const meta = STATUS_META[status];
  return (
    <span
      style={{
        justifySelf: "start",
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--spacing-space-2)",
        // 2 top/bottom, 6 left, 4 right — snugger past the centred label.
        padding: "2px var(--spacing-space-2) 2px var(--spacing-space-3)",
        borderRadius: "var(--radius-full)",
        background: "color-mix(in oklch, var(--color-text-primary) 4%, transparent)",
        color: meta.color,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: "var(--radius-full)",
          background: meta.color,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          minWidth: pinWidth ? `${STATUS_LABEL_CH}ch` : undefined,
          textAlign: pinWidth ? "center" : undefined,
        }}
      >
        {meta.label}
      </span>
    </span>
  );
}

/**
 * Usage bar — a row of vertical pills filled left-to-right in proportion to
 * usage, plus the percentage, escalating in colour as it nears/crosses budget.
 */
export function UsageBar({ usage, showPct = true }: { usage: number; showPct?: boolean }) {
  const color = usageColor(usage);
  const filledCount = Math.max(usage > 0 ? 1 : 0, Math.round(Math.min(usage, 1) * USAGE_SEGMENTS));
  return (
    <span className="flex items-center" style={{ gap: "var(--spacing-space-3)" }}>
      <span aria-hidden className="flex items-center" style={{ gap: 2 }}>
        {Array.from({ length: USAGE_SEGMENTS }, (_, idx) => (
          <span
            key={idx}
            style={{
              width: 3,
              height: 12,
              borderRadius: "var(--radius-full)",
              background: idx < filledCount ? color : "var(--color-surface-panel-elevated)",
            }}
          />
        ))}
      </span>
      {showPct && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {fmtPct(usage)}
        </span>
      )}
    </span>
  );
}
