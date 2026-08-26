// Cumulative spend vs. a constant-pace budget, drawn as a gridless sparkline:
//   • solid line  — actual cumulative spend, day 1 → today
//   • dotted line — projection from today to month-end at the current daily avg
//   • diagonal    — the constant-pace budget (0 → full budget over the month)
//
// Pure inline SVG (no chart dep). The viewBox is normalized and stretched to the
// container via preserveAspectRatio="none"; `vector-effect: non-scaling-stroke`
// keeps every stroke crisp regardless of the horizontal stretch.

import { useRef, useState } from "react";

const VIEW_W = 100;
const VIEW_H = 96;
const PAD_Y = 8; // vertical breathing room so lines don't kiss the edges

const DAYS_IN_MONTH = 31;
const TODAY = 26; // day-of-month we've spent through
const MONTH_LABEL = "Aug"; // this month-to-date view is August 2026
const YEAR = 2026;
const BUDGET_TOTAL = 7470;
const SPENT_TOTAL = 5547.3;

// Where today's pace lands us by month-end, and the share of budget that is.
const PROJECTED_END = 7165;
const PROJECTED_LABEL = `${((PROJECTED_END / BUDGET_TOTAL) * 100).toFixed(1)}% of budget`;
// Headroom above the budget so its end-point doesn't clip the top edge.
const Y_MAX = BUDGET_TOTAL * 1.05;

// Deterministic, organic-looking daily spend that sums to exactly SPENT_TOTAL.
const SPEND_SERIES = (() => {
  const weights = Array.from(
    { length: TODAY },
    (_, i) => 1 + 0.35 * Math.sin(i * 1.3) + 0.15 * Math.sin(i * 0.6),
  );
  let acc = 0;
  const cumulative = weights.map((w) => (acc += w));
  const scale = SPENT_TOTAL / cumulative[cumulative.length - 1];
  return cumulative.map((v) => v * scale);
})();

// day (0…DAYS_IN_MONTH) → x; euros (0…Y_MAX) → y (SVG y grows downward).
const x = (day: number) => (day / DAYS_IN_MONTH) * VIEW_W;
const y = (value: number) => PAD_Y + (1 - value / Y_MAX) * (VIEW_H - 2 * PAD_Y);

// Anchor the spend line at the month's start (day 0, €0) — the same origin the
// budget line starts from — then trace each day's cumulative total.
const spendPath = [
  `M${x(0)} ${y(0).toFixed(2)}`,
  ...SPEND_SERIES.map((v, i) => `L${x(i + 1).toFixed(2)} ${y(v).toFixed(2)}`),
].join(" ");

// A data point's marker position, as viewBox-percentages, so an overlaid round
// dot lands on the line without being stretched by preserveAspectRatio.
const leftPctForDay = (day: number) => (x(day) / VIEW_W) * 100;
const topPctForValue = (value: number) => (y(value) / VIEW_H) * 100;

const budgetPath = `M${x(0)} ${y(0).toFixed(2)} L${x(DAYS_IN_MONTH)} ${y(BUDGET_TOTAL).toFixed(2)}`;

const projectionPath = `M${x(TODAY).toFixed(2)} ${y(SPENT_TOTAL).toFixed(2)} L${x(DAYS_IN_MONTH)} ${y(PROJECTED_END).toFixed(2)}`;

const DOT_SIZE = 6; // px — round marker at the active spend point

const fmtEUR = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
const dateLabel = (day: number) => `${MONTH_LABEL} ${day} ${YEAR}`;

// Cumulative value for a day: actual through today, projected beyond it (linear
// along the projection line from today's spend to the month-end projection).
const valueForDay = (day: number) =>
  day <= TODAY
    ? SPEND_SERIES[day - 1]
    : SPENT_TOTAL + ((day - TODAY) / (DAYS_IN_MONTH - TODAY)) * (PROJECTED_END - SPENT_TOTAL);

/** Gridless cumulative-spend sparkline with budget-pace and projection lines. */
export function SpendSparkline() {
  const ref = useRef<HTMLDivElement>(null);
  // Day being inspected on hover; null = resting on today ("Actual").
  const [hoverDay, setHoverDay] = useState<number | null>(null);

  // Snap the cursor's x to the nearest day — actual through today, projected to
  // the right of the "Actual" dot (days beyond today, out to month-end).
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const frac = (e.clientX - rect.left) / rect.width;
    const day = Math.round(frac * DAYS_IN_MONTH);
    setHoverDay(Math.min(Math.max(day, 1), DAYS_IN_MONTH));
  };

  const activeDay = hoverDay ?? TODAY;
  const isProjected = activeDay > TODAY;
  const activeValue = valueForDay(activeDay);

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setHoverDay(null)}
      style={{ position: "relative", width: "100%", height: VIEW_H, cursor: "crosshair" }}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Cumulative spend against a constant-pace budget, with a projection to month-end"
        style={{ display: "block", width: "100%", height: VIEW_H }}
      >
        {/* Constant-pace budget — subtle straight reference line. */}
        <path
          d={budgetPath}
          fill="none"
          stroke="var(--color-text-disabled)"
          strokeWidth={1.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Projection from today → month-end at the current daily average. */}
        <path
          d={projectionPath}
          fill="none"
          stroke="var(--color-accent-500)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeDasharray="0.5 4"
          opacity={0.4}
          vectorEffect="non-scaling-stroke"
        />

        {/* Actual cumulative spend. */}
        <path
          d={spendPath}
          fill="none"
          stroke="var(--color-accent-500)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Active marker — rests on today, glides to the hovered day. Overlaid so
          it stays perfectly round despite the horizontal stretch of the SVG. */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: `${leftPctForDay(activeDay)}%`,
          top: `${topPctForValue(activeValue)}%`,
          width: DOT_SIZE,
          height: DOT_SIZE,
          transform: "translate(-50%, -50%)",
          borderRadius: "var(--radius-full)",
          background: "var(--color-accent-500)",
          transition: "left 120ms ease, top 120ms ease",
        }}
      />

      {/* Legend, tucked into the empty top-left corner (both lines start low). */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-space-1)", // 2
          fontSize: 10,
          color: "var(--color-text-muted)",
        }}
      >
        <span className="flex items-center" style={{ gap: "var(--spacing-space-2)" }}>
          <span style={{ width: 14, borderTop: "2px solid var(--color-text-disabled)" }} />
          Budget pace
        </span>
        <span className="flex items-center" style={{ gap: "var(--spacing-space-2)" }}>
          <span style={{ width: 14, borderTop: "2px dotted var(--color-accent-500)", opacity: 0.6 }} />
          Projected
        </span>
      </div>

      {/* Readout: the active date and its cumulative spend. Rests on today;
          follows the cursor on hover, showing the projection past today. */}
      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          fontSize: 11,
          color: "var(--color-text-secondary)",
          whiteSpace: "nowrap",
        }}
      >
        {dateLabel(activeDay)} -{" "}
        <span style={{ fontWeight: 500 }}>{fmtEUR.format(activeValue)}</span>
        {isProjected && (
          <span style={{ color: "var(--color-text-muted)" }}>
            {" · "}
            {activeDay === DAYS_IN_MONTH ? PROJECTED_LABEL : "Projected"}
          </span>
        )}
      </div>
    </div>
  );
}
