import { useState } from "react";
import AgentIcon from "../../assets/icons/Agent Icon.svg?react";
import SingleAgentIcon from "../../assets/icons/Single Agent Icon.svg?react";
import { AGENTS, fmtEUR, shortName, type AgentRow } from "./agents";
import { TierBadge, StatusPill, UsageBar } from "./agent-visuals";

// Grid glyph notched into the card's top-left corner (mirrors the Calendar tab
// on the Month-to-Date card).
const HEADER_ICON_SIZE = 16;
// Per-agent glyph sitting beside each name in the table body.
const ROW_ICON_SIZE = 18;

// Shared column track + gap so the header and every body row line up exactly.
// The card stretches to fill the row, so the agent column flexes (`minmax(180px,
// 1fr)`) to absorb the slack while the rest stay fixed; usage gets a little more
// for its bar. Status is last, sized to its content so its trailing whitespace is
// just the panel's right padding — matching the agent column's left padding.
//   agent | tier | owner | spend | budget | usage | status
const GRID_COLUMNS = "minmax(180px, 1fr) 110px 120px 110px 110px 150px max-content";
const COLUMN_GAP = "var(--spacing-space-6)"; // 16

// Row divider: sparse, faint dots along the bottom edge (native `dotted` packs
// them too tightly). One 1px dot every 12px, in the subtle border colour.
const ROW_DIVIDER = {
  backgroundImage: "radial-gradient(circle, var(--color-border-subtle) 1px, transparent 1px)",
  backgroundSize: "12px 2px",
  backgroundPosition: "center bottom",
  backgroundRepeat: "repeat-x",
} as const;

const COLUMNS = ["Agent", "Tier", "Owner", "Spend", "Budget", "Usage", "Status"] as const;

interface Props {
  /** Row currently open in the detail drawer — highlighted in the table. */
  selectedName?: string | null;
  /** Open the detail drawer for an agent. */
  onSelect?: (agent: AgentRow) => void;
}

/**
 * Overview → "Agents" table.
 * Full-width sibling to the Month-to-Date card: the same panel surface and
 * corner-tab treatment (Agent grid glyph here), with a per-agent spend/budget/
 * usage/status breakdown. Each row carries the single-agent glyph beside its name
 * and opens a detail drawer on click.
 */
export function AgentsCard({ selectedName, onSelect }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section
      className="bg-surface-panel"
      style={{
        position: "relative", // anchors the corner tab
        alignSelf: "flex-start", // keep natural height/top — the table sets the row height
        flex: "1 1 0", // grow to fill the remaining width beside the left column
        minWidth: 0, // allow shrinking; the flexible agent column absorbs the slack
        borderRadius: "var(--radius-lg)", // 8
        // Match the Month-to-Date card: 16 top/left, a touch more right/bottom.
        padding: "var(--spacing-space-6) var(--spacing-space-7) var(--spacing-space-7) var(--spacing-space-6)",
      }}
    >
      {/* Agent grid glyph, notched flush into the top-left corner in the lighter
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
        <AgentIcon
          width={HEADER_ICON_SIZE}
          height={HEADER_ICON_SIZE}
          aria-hidden
          style={{ color: "var(--color-text-muted)" }}
        />
      </div>

      {/* Content clears the corner tab; the table sits in its own inset panel.
          Positioned like the Month-to-Date card's headline figure — indented
          past the tab and dropped lower. */}
      <div
        style={{
          marginTop: "var(--spacing-space-8)", // 24 — sits lower, clear of the corner tab
          marginLeft: "var(--spacing-space-3)", // 6 — same indent as the €5,547.30 figure
        }}
      >
        <div
          style={{
            // Inset the table onto the darker app surface. Radius stays smaller
            // than the card's 8 so the corners read as concentric — the panel is
            // set well inside the card, so an equal radius looks wrong.
            background: "var(--color-surface-app)",
            borderRadius: "var(--radius-sm)", // 4
            padding: "0 var(--spacing-space-6)", // 0 / 16 — rows own the vertical rhythm
            overflow: "hidden", // clip row borders to the rounded corners
            // One shared grid for the whole table: the header and every body row
            // opt into these exact tracks via `subgrid`, so `max-content` (Status)
            // and `1fr` (Agent) resolve once — otherwise each row's grid sizes
            // independently and the columns drift out of alignment.
            display: "grid",
            gridTemplateColumns: GRID_COLUMNS,
            columnGap: COLUMN_GAP,
          }}
        >
          {/* Column headers. */}
          <div
            role="row"
            style={{
              display: "grid",
              gridTemplateColumns: "subgrid", // inherit the parent's shared tracks
              gridColumn: "1 / -1", // span every column of the parent grid
              alignItems: "center",
              paddingTop: "var(--spacing-space-5)", // 12 — top breathing inside the panel
              paddingBottom: "var(--spacing-space-4)", // 8
            }}
          >
            {COLUMNS.map((label) => (
              <span
                key={label}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  color: "var(--color-text-muted)",
                  opacity: 0.7, // slightly quieter than the row text
                  textAlign: "left", // every column reads from its left edge
                }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Body rows. */}
          {AGENTS.map((agent, i) => {
            const usage = agent.budget > 0 ? agent.spend / agent.budget : 0;
            const isSelected = selectedName === agent.name;
            const isHovered = hovered === agent.name;
            return (
              <div
                key={agent.name}
                role="button"
                tabIndex={0}
                aria-label={`Open ${agent.name} details`}
                onClick={() => onSelect?.(agent)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect?.(agent);
                  }
                }}
                onMouseEnter={() => setHovered(agent.name)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "subgrid", // inherit the parent's shared tracks
                  gridColumn: "1 / -1", // span every column of the parent grid
                  alignItems: "center",
                  paddingTop: "var(--spacing-space-5)", // 12
                  paddingBottom: "var(--spacing-space-5)", // 12
                  cursor: "pointer",
                  // Row highlight: a neutral gray wash for both hover and the open
                  // row (same tone, so clicking doesn't shift colour). Drawn as an
                  // inset box-shadow spanning the padded gutter so it reads as a
                  // full-width band without disturbing the subgrid tracks.
                  boxShadow:
                    isSelected || isHovered
                      ? "inset 0 0 0 100vw color-mix(in oklch, var(--color-text-primary) 4%, transparent)"
                      : undefined,
                  transition: "box-shadow 140ms ease",
                  ...(i < AGENTS.length - 1 ? ROW_DIVIDER : {}),
                }}
              >
                {/* Agent — single-agent glyph + name. */}
                <span className="flex items-center" style={{ gap: "var(--spacing-space-1)", minWidth: 0 }}>
                  <SingleAgentIcon
                    width={ROW_ICON_SIZE}
                    height={ROW_ICON_SIZE}
                    aria-hidden
                    style={{ color: "var(--color-text-muted)", flexShrink: 0 }}
                  />
                  <span
                    className="truncate"
                    style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)" }}
                  >
                    {agent.name}
                  </span>
                </span>

                {/* Tier. */}
                <span style={{ justifySelf: "start" }}>
                  <TierBadge tier={agent.tier} />
                </span>

                {/* Owner — coloured initial-avatar + name, matching the org
                    switcher's member roster. */}
                <span className="flex items-center" style={{ gap: "var(--spacing-space-2)", minWidth: 0 }}>
                  <span
                    className="flex items-center justify-center"
                    aria-hidden
                    style={{
                      flexShrink: 0,
                      width: 20,
                      height: 20,
                      borderRadius: "var(--radius-full)",
                      background: agent.owner.color,
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                  >
                    {agent.owner.name[0]}
                  </span>
                  <span
                    className="truncate"
                    title={agent.owner.name}
                    style={{ fontSize: 13, color: "var(--color-text-secondary)" }}
                  >
                    {shortName(agent.owner.name)}
                  </span>
                </span>

                {/* Spend. */}
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--color-text-secondary)",
                    textAlign: "left",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {fmtEUR.format(agent.spend)}
                </span>

                {/* Budget. */}
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--color-text-muted)",
                    textAlign: "left",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {fmtEUR.format(agent.budget)}
                </span>

                {/* Usage. */}
                <UsageBar usage={usage} />

                {/* Status. */}
                <StatusPill status={agent.status} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
