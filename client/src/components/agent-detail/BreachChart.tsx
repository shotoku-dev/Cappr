// Per-agent cumulative-spend projection — the one place a single-line chart
// earns its keep, since only one agent is in view. Solid line: actual spend day
// 1 → today. Dotted line: projection to month-end at the recent daily burn.
// A dashed horizontal marks the budget; if the projection crosses it this month,
// a marker pins the projected breach day.
//
// Pure inline SVG (no chart dep), mirroring SpendSparkline: a normalized viewBox
// stretched via preserveAspectRatio="none", with non-scaling strokes so lines
// stay crisp and overlaid dots stay round.

import { DAYS_IN_MONTH, TODAY_DAY, MONTH_LABEL, fmtEUR } from "../../app/overview/agents";

const VIEW_W = 100;
const VIEW_H = 64;
const PAD_Y = 8;

interface Props {
  /** Cumulative spend, day 1 → TODAY_DAY. */
  series: number[];
  budget: number;
  projectedEnd: number;
  projectedBreachDay: number | null;
  /** Line colour — the usage-escalation colour for this agent. */
  color: string;
}

export function BreachChart({ series, budget, projectedEnd, projectedBreachDay, color }: Props) {
  const spend = series[series.length - 1] ?? 0;
  const yMax = Math.max(budget, projectedEnd, spend) * 1.08;

  const x = (day: number) => (day / DAYS_IN_MONTH) * VIEW_W;
  const y = (v: number) => PAD_Y + (1 - v / yMax) * (VIEW_H - 2 * PAD_Y);

  const leftPct = (day: number) => (x(day) / VIEW_W) * 100;
  const topPct = (v: number) => (y(v) / VIEW_H) * 100;

  const spendPath = [
    `M${x(0)} ${y(0).toFixed(2)}`,
    ...series.map((v, i) => `L${x(i + 1).toFixed(2)} ${y(v).toFixed(2)}`),
  ].join(" ");

  const projectionPath = `M${x(TODAY_DAY).toFixed(2)} ${y(spend).toFixed(2)} L${x(DAYS_IN_MONTH).toFixed(2)} ${y(projectedEnd).toFixed(2)}`;
  const budgetPath = `M${x(0)} ${y(budget).toFixed(2)} L${x(DAYS_IN_MONTH)} ${y(budget).toFixed(2)}`;

  const breaches = projectedBreachDay !== null;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ position: "relative", width: "100%", height: VIEW_H }}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Cumulative spend with a projection to month-end against the budget line"
        style={{ display: "block", width: "100%", height: VIEW_H }}
      >
        {/* Budget line — dashed horizontal reference. */}
        <path
          d={budgetPath}
          fill="none"
          stroke="var(--color-text-disabled)"
          strokeWidth={1}
          strokeDasharray="2 3"
          vectorEffect="non-scaling-stroke"
        />

        {/* Projection today → month-end. */}
        <path
          d={projectionPath}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeDasharray="0.5 4"
          opacity={0.5}
          vectorEffect="non-scaling-stroke"
        />

        {/* Actual cumulative spend. */}
        <path
          d={spendPath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Today marker — sits on the actual line's tip. */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: `${leftPct(TODAY_DAY)}%`,
          top: `${topPct(spend)}%`,
          width: 6,
          height: 6,
          transform: "translate(-50%, -50%)",
          borderRadius: "var(--radius-full)",
          background: color,
        }}
      />

      {/* Breach marker — where the projection crosses the budget line. */}
      {breaches && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: `${leftPct(projectedBreachDay)}%`,
            top: `${topPct(budget)}%`,
            width: 7,
            height: 7,
            transform: "translate(-50%, -50%)",
            borderRadius: "var(--radius-full)",
            background: "var(--color-status-danger)",
            boxShadow: "0 0 0 3px color-mix(in oklch, var(--color-status-danger) 22%, transparent)",
          }}
        />
      )}

      </div>

      {/* Readout — projected month-end, on its own line beneath the plot so it
          never overlaps a flat (zero-spend) line. */}
      <div
        style={{
          marginTop: "var(--spacing-space-4)",
          textAlign: "right",
          fontSize: 10,
          color: "var(--color-text-muted)",
          whiteSpace: "nowrap",
        }}
      >
        {MONTH_LABEL} {DAYS_IN_MONTH} proj.{" "}
        <span style={{ fontWeight: 500, color: "var(--color-text-secondary)" }}>
          {fmtEUR.format(projectedEnd)}
        </span>
      </div>
    </div>
  );
}
