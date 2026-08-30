import { useLayoutEffect, useRef, useState, type ComponentType } from "react";
import {
  IconGavel,
  IconAlertTriangle,
  IconAlertHexagon,
  IconShieldCheck,
  IconCreditCard,
  IconSnowflake,
  IconRocket,
  type IconProps,
} from "@tabler/icons-react";
import ActivityIcon from "../../assets/icons/Activity Icon.svg?react";

// Pulse glyph notched into the card's top-left corner (mirrors the Calendar tab
// on the Month-to-Date card and the Agent grid on the Agents card).
const HEADER_ICON_SIZE = 16;

// Timeline geometry. A single rounded capsule wraps the whole icon rail; the
// connector line threads down its centre, and one icon sits vertically centred in
// each event row. Each icon is centred at 50% of its row, so the capsule's top/
// bottom padding stays balanced regardless of row height.
const RAIL_WIDTH = 28; // width of the capsule column
const ICON_SIZE = 14; // the event glyph
const ICON_GAP = 6; // breathing room so the connector line stops short of each icon
const LINE_X = RAIL_WIDTH / 2 - 0.5; // centre the 1px line in the capsule
// Distance from an icon's centre to where the connector line may start.
const LINE_INSET = ICON_SIZE / 2 + ICON_GAP;

/** The kind of event drives the node colour; kinds mirror the fleet's semantic
 *  palette (and the Agents table — `frozen` shares the same info blue). */
type ActivityKind =
  | "approval" // awaiting / routed for a human decision
  | "budget" // spend threshold crossed
  | "anomaly" // trust/tier regression, flagged behaviour
  | "verified" // ledger / chain integrity confirmed
  | "wallet" // spending instrument provisioned (routine)
  | "frozen" // agent paused — security state
  | "activated"; // agent brought online

// Colours are the Agents table's status palette (STATUS_META), so an event and
// the status it relates to read the same: budget→Warning, anomaly→Anomaly,
// verified/activated→Healthy (success), frozen→Frozen (info), wallet→Shadow
// (muted). Approval has no table status; it borrows the info blue as an
// informational "awaiting action" cue.
const KIND_COLOR: Record<ActivityKind, string> = {
  approval: "var(--color-status-info)",
  budget: "var(--color-status-warning)",
  anomaly: "var(--color-status-danger)",
  verified: "var(--color-status-success)",
  wallet: "var(--color-text-muted)",
  frozen: "var(--color-status-info)",
  activated: "var(--color-status-success)",
};

/** Tabler glyph per kind — the icon symbolises the action, the colour its tone. */
const KIND_ICON: Record<ActivityKind, ComponentType<IconProps>> = {
  approval: IconGavel, // a decision / sign-off is being requested
  budget: IconAlertTriangle, // spend threshold crossed
  anomaly: IconAlertHexagon, // flagged behaviour / tier regression
  verified: IconShieldCheck, // ledger integrity confirmed
  wallet: IconCreditCard, // spending instrument provisioned
  frozen: IconSnowflake, // agent paused / on ice
  activated: IconRocket, // agent brought online
};

type ActivityEvent = { title: string; time: string; kind: ActivityKind };

/** Most-recent first — the feed reads top (now) to bottom (older). Mock data. */
const EVENTS: ActivityEvent[] = [
  { title: "Approval requested · ads-optimizer · €180.00", time: "22 min ago", kind: "approval" },
  { title: "support-triage crossed 75% of budget", time: "31 min ago", kind: "budget" },
  { title: "crawl-indexer demoted T2→T1 (anomaly)", time: "4 h ago", kind: "anomaly" },
  { title: "Chain verified · 18,204 records", time: "5 h ago", kind: "verified" },
  { title: "Research v3 sent for approval (Y. Adeyemi)", time: "Yesterday", kind: "approval" },
  { title: "Card •• 2211 issued to sales-enricher", time: "21 Aug", kind: "wallet" },
  { title: "qa-fuzzer frozen (prompt-injection attempt)", time: "19 Aug", kind: "frozen" },
  { title: "Marketing v3 activated", time: "18 Aug", kind: "activated" },
];

// Padding between the capsule border and the first/last icon it wraps.
const CAPSULE_PAD = 10;

/**
 * Overview → "Activity" feed.
 * Sits to the right of the Agents table on the same panel surface + corner-tab
 * treatment (pulse glyph here). A connected vertical timeline: a single rounded
 * capsule wraps the whole icon rail, the connector line threading down its centre
 * with a coloured event glyph at each row, each carrying a title and a relative
 * timestamp. Glyph colour follows the fleet's semantic palette (the Agents table's).
 */
export function ActivityCard() {
  // The capsule is sized to hug the first and last icons (titles can wrap, so the
  // extent is measured rather than computed) and re-measured when the card resizes.
  const listRef = useRef<HTMLOListElement>(null);
  const firstIconRef = useRef<HTMLSpanElement>(null);
  const lastIconRef = useRef<HTMLSpanElement>(null);
  const [capsule, setCapsule] = useState<{ top: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    const first = firstIconRef.current;
    const last = lastIconRef.current;
    if (!list || !first || !last) return;
    const measure = () => {
      const listTop = list.getBoundingClientRect().top;
      const firstTop = first.getBoundingClientRect().top;
      const lastBottom = last.getBoundingClientRect().bottom;
      setCapsule({
        top: firstTop - listTop - CAPSULE_PAD,
        height: lastBottom - firstTop + CAPSULE_PAD * 2,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="bg-surface-panel"
      style={{
        position: "relative", // anchors the corner tab
        alignSelf: "stretch", // match the Month-to-Date card's width in the left column
        flex: "1 1 auto", // grow down to fill the column, level with the table's bottom
        borderRadius: "var(--radius-lg)", // 8
        // Match the sibling cards: 16 top/left, a touch more right/bottom.
        padding: "var(--spacing-space-6) var(--spacing-space-7) var(--spacing-space-7) var(--spacing-space-6)",
      }}
    >
      {/* Pulse glyph, notched flush into the top-left corner in the lighter
          elevated surface — outer corner matches the card radius. */}
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
        <ActivityIcon
          width={HEADER_ICON_SIZE}
          height={HEADER_ICON_SIZE}
          aria-hidden
          style={{ color: "var(--color-text-muted)" }}
        />
      </div>

      {/* Content clears the corner tab; the timeline sits directly on the card
          surface (no inset panel). */}
      <div
        style={{
          marginTop: "var(--spacing-space-8)", // 24 — sits lower, clear of the corner tab
          marginLeft: "var(--spacing-space-3)", // 6 — same indent as the sibling cards
        }}
      >
        <ol
          ref={listRef}
          aria-label="Recent activity"
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            position: "relative", // anchors the capsule overlay
          }}
        >
          {/* One rounded capsule wrapping the whole icon rail; the connector line
              and icons render on top of it. Sized to hug the first/last icons. */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              width: RAIL_WIDTH,
              top: capsule ? capsule.top : 0,
              height: capsule ? capsule.height : "100%",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "var(--radius-lg)", // 8 — gently rounded, not a pill
            }}
          />

          {EVENTS.map((event, i) => {
            const isFirst = i === 0;
            const isLast = i === EVENTS.length - 1;
            const color = KIND_COLOR[event.kind];
            const Icon = KIND_ICON[event.kind];
            return (
              <li
                key={`${event.time} ${event.title}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: `${RAIL_WIDTH}px 1fr`, // content fills the card width
                  columnGap: "var(--spacing-space-4)", // 8
                  paddingBlock: "var(--spacing-space-4)", // 8 — vertical rhythm between events
                }}
              >
                {/* Rail — the connector line threading through the capsule. Each
                    icon is centred at 50% of its row; the line stops LINE_INSET
                    short of an icon on either end so it never touches one. */}
                <span aria-hidden style={{ position: "relative" }}>
                  {!isFirst && (
                    <span
                      style={{
                        position: "absolute",
                        left: LINE_X,
                        width: 1,
                        background: "var(--color-border-subtle)",
                        top: 0,
                        height: `calc(50% - ${LINE_INSET}px)`,
                      }}
                    />
                  )}
                  {!isLast && (
                    <span
                      style={{
                        position: "absolute",
                        left: LINE_X,
                        width: 1,
                        background: "var(--color-border-subtle)",
                        top: `calc(50% + ${LINE_INSET}px)`,
                        bottom: 0,
                      }}
                    />
                  )}
                  <span
                    ref={isFirst ? firstIconRef : isLast ? lastIconRef : undefined}
                    className="flex items-center justify-center"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: ICON_SIZE,
                      height: ICON_SIZE,
                      color, // drives the glyph via currentColor
                    }}
                  >
                    <Icon size={ICON_SIZE} stroke={2} />
                  </span>
                </span>

                {/* Event — title over its relative timestamp, centred against the icon. */}
                <span style={{ alignSelf: "center" }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 13,
                      lineHeight: 1.4,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {event.title}
                  </span>
                  <span
                    style={{
                      display: "block",
                      marginTop: 2,
                      fontSize: 11.5,
                      color: "var(--color-text-muted)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {event.time}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
