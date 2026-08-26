import CalendarIcon from "../../assets/icons/Calendar Icon.svg?react";
import IndentIcon from "../../assets/icons/Indent Icon.svg?react";
import { SpendSparkline } from "./SpendSparkline";

// Small glyph in the card's top-left corner.
const CALENDAR_ICON_SIZE = 16;
// Subdirectory arrow marking each nested metric beneath the headline figure.
const INDENT_ICON_SIZE = 16;

/** Spend so far this month, against the fleet's monthly budget. */
const SPENT = "€5,547.30";
const BUDGET = "€7,470.00";

/** Nested breakdown sitting under the headline spend. `warning` flags the
 *  leading number for the amber warning colour (over-pace budget usage). */
const METRICS: { value: string; label: string; warning?: boolean }[] = [
  { value: "74.3%", label: "used", warning: true },
  { value: "5,214", label: "transactions" },
  { value: "€231.14/day", label: "avg" },
];

/**
 * Overview → "Month to Date" summary card.
 * A lighter Calendar tab is notched into the top-left corner; the running spend
 * sits indented past it (with the budget trailing in quieter text), and under
 * the spend a couple of subdivided metrics hang off indent arrows. Sized to its
 * content, not the full column.
 */
export function MonthToDateCard() {
  return (
    <section
      className="bg-surface-panel"
      style={{
        position: "relative", // anchors the corner tab
        alignSelf: "flex-start", // hug content — a card, not a full-width band
        borderRadius: "var(--radius-lg)", // 8
        // 16 top/left, a touch more on the right and bottom for breathing room.
        padding: "var(--spacing-space-6) var(--spacing-space-7) var(--spacing-space-7) var(--spacing-space-6)",
      }}
    >
      {/* Calendar tab, notched flush into the top-left corner in the lighter
          elevated surface — its outer corner matches the card's radius. */}
      <div
        className="flex items-center justify-center bg-surface-panel-elevated"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          padding: "var(--spacing-space-3)", // 6 around the glyph
          borderTopLeftRadius: "var(--radius-lg)", // 8 — flush with the card corner
          borderBottomRightRadius: "var(--radius-lg)", // 8 — rounded inner corner
        }}
      >
        <CalendarIcon
          width={CALENDAR_ICON_SIZE}
          height={CALENDAR_ICON_SIZE}
          aria-hidden
          style={{ color: "var(--color-text-muted)" }}
        />
      </div>

      {/* Content clears the corner tab, then indents past it. */}
      <div
        style={{
          marginTop: "var(--spacing-space-6)", // 16 — drops below the tab
          marginLeft: "var(--spacing-space-3)", // 6 — slight indent past the tab
        }}
      >
        {/* Headline spend; budget trails on the same baseline. */}
        <div className="flex items-baseline" style={{ gap: "var(--spacing-space-3)" }}>
          <span
            style={{
              fontSize: 32,
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              letterSpacing: "-0.01em",
            }}
          >
            {SPENT}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: "var(--color-text-muted)",
            }}
          >
            of {BUDGET} fleet budget
          </span>
        </div>

        {/* Nested metrics, each hanging off an indent arrow. */}
        <div
          className="flex flex-col"
          style={{
            marginTop: "var(--spacing-space-3)", // 6 below the headline
            marginLeft: "var(--spacing-space-6)", // 16 — stepped in again under the spend
            gap: "var(--spacing-space-2)", // 4 between rows
          }}
        >
          {METRICS.map(({ value, label, warning }) => (
            <div key={`${value} ${label}`} className="flex items-center" style={{ gap: "var(--spacing-space-2)" }}>
              <IndentIcon
                width={INDENT_ICON_SIZE}
                height={INDENT_ICON_SIZE}
                aria-hidden
                // Glyph sits low in its viewBox; nudge up to optically center on the text.
                style={{ color: "var(--color-text-disabled)", transform: "translateY(-2px)" }}
              />
              <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                <span style={warning ? { color: "var(--color-status-warning)" } : undefined}>{value}</span> {label}
              </span>
            </div>
          ))}
        </div>

        {/* Cumulative spend vs. constant-pace budget, with a month-end projection. */}
        <div style={{ marginTop: "var(--spacing-space-6)" /* 16 below the metrics */ }}>
          <SpendSparkline />
        </div>
      </div>
    </section>
  );
}
