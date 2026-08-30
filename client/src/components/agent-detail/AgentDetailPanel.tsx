// Overview → per-agent detail drawer.
// A right-side slide-over opened by clicking a row in the Agents table. Scrolls
// through: header (identity + actions), Spend Snapshot (+ projection chart and
// anomaly callout), Policy (plain-English + enforcement + YAML toggle), scoped
// Ledger, Tier History, Wallet, and — only when non-empty — pending Approvals.

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconX,
  IconSnowflake,
  IconPlayerPlay,
  IconCoins,
  IconPencil,
  IconExternalLink,
  IconDotsVertical,
  IconDownload,
  IconAlertHexagon,
  IconArrowUpRight,
  IconArrowDownRight,
  IconCircleDot,
  IconChevronRight,
  IconGavel,
  type IconProps,
} from "@tabler/icons-react";
import SingleAgentIcon from "../../assets/icons/Single Agent Icon.svg?react";
import ArrowRightIcon from "../../assets/icons/Arrow Right Icon.svg?react";
import {
  computeAgentDetail,
  fmtEUR,
  fmtPct,
  ENFORCEMENT_META,
  OUTCOME_META,
  type AgentRow,
  type TierChange,
  type LedgerEntry,
} from "../../app/overview/agents";
import { TierBadge, StatusPill } from "../../app/overview/agent-visuals";
import { BreachChart } from "./BreachChart";

const PANEL_WIDTH = 460;

const panelSpring = { type: "spring", duration: 0.5, bounce: 0 } as const;

// ── time helpers ─────────────────────────────────────────────────────────────

const dateFmt = new Intl.DateTimeFormat("en-IE", { day: "numeric", month: "short", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-IE", { hour: "2-digit", minute: "2-digit", hour12: false });
const absDate = (iso: string) => dateFmt.format(new Date(iso));

// Dotted section divider — a dense run of faint dots along a block's top edge.
const DOT_DIVIDER_TOP = {
  backgroundImage: "radial-gradient(circle, var(--color-border-subtle) 1px, transparent 1px)",
  backgroundSize: "7px 2px",
  backgroundRepeat: "repeat-x",
  backgroundPosition: "center top",
} as const;

// ── primitives ───────────────────────────────────────────────────────────────

/** A titled block with a muted heading, optional trailing action. */
function Section({
  title,
  action,
  id,
  children,
}: {
  title: string;
  action?: ReactNode;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      style={{
        padding: "var(--spacing-space-7) var(--spacing-space-8)",
        ...DOT_DIVIDER_TOP,
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: "var(--spacing-space-5)" }}>
        <h3
          style={{
            margin: 0,
            fontSize: 12.5,
            fontWeight: 600,
            letterSpacing: "0.01em",
            color: "var(--color-text-secondary)",
          }}
        >
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

/** A pill-shaped action button used in the header row. */
function ActionButton({
  icon: Icon,
  label,
  onClick,
  tone = "default",
}: {
  icon: React.ComponentType<IconProps>;
  label: string;
  onClick?: () => void;
  tone?: "default" | "info";
}) {
  const [hover, setHover] = useState(false);
  const color = tone === "info" ? "var(--color-status-info)" : "var(--color-text-secondary)";
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center"
      style={{
        gap: "var(--spacing-space-2)",
        padding: "6px var(--spacing-space-4)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border-subtle)",
        background: hover ? "var(--color-surface-hover)" : "transparent",
        color,
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        transition: "background 140ms ease",
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

/** "Text link" with a trailing chevron/external glyph. */
function TextLink({ label, icon: Icon, onClick }: { label: string; icon?: React.ComponentType<IconProps>; onClick?: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center"
      style={{
        gap: 4,
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 500,
        color: hover ? "var(--color-status-info)" : "var(--color-text-muted)",
        transition: "color 140ms ease",
      }}
    >
      {label}
      {Icon && <Icon size={13} />}
    </button>
  );
}

// ── panel ────────────────────────────────────────────────────────────────────

interface Props {
  agent: AgentRow | null;
  onClose: () => void;
}

export function AgentDetailPanel({ agent, onClose }: Props) {
  // Close on Escape while open.
  useEffect(() => {
    if (!agent) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [agent, onClose]);

  return (
    <AnimatePresence>
      {agent && <PanelBody key={agent.name} agent={agent} onClose={onClose} />}
    </AnimatePresence>
  );
}

function PanelBody({ agent, onClose }: { agent: AgentRow; onClose: () => void }) {
  const [showYaml, setShowYaml] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Deterministic per-agent; memoized so ledger timestamps don't drift per render.
  const detail = useMemo(() => computeAgentDetail(agent), [agent.name]); // eslint-disable-line react-hooks/exhaustive-deps

  const { usage, dailyBurn, series, projectedBreachDay, projectedEnd, ledger } = detail;
  const isFrozen = agent.status === "frozen";
  const isShadow = agent.status === "shadow";
  const isAnomaly = agent.status === "anomaly";
  const barColor =
    usage >= 1 ? "var(--color-status-danger)" : usage >= 0.85 ? "var(--color-status-warning)" : "var(--color-accent-500)";
  const enforcement = ENFORCEMENT_META[agent.enforcement];

  return (
    <>
      {/* Scrim */}
      <motion.div
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          background: "color-mix(in oklch, var(--color-surface-app) 55%, transparent)",
          backdropFilter: "blur(1.5px)",
        }}
      />

      {/* Drawer */}
      <motion.aside
        aria-label={`${agent.name} details`}
        initial={{ x: PANEL_WIDTH + 24 }}
        animate={{ x: 0 }}
        exit={{ x: PANEL_WIDTH + 24 }}
        transition={panelSpring}
        className="bg-surface-panel"
        style={{
          position: "fixed",
          top: "var(--spacing-space-3)",
          right: "var(--spacing-space-3)",
          bottom: "var(--spacing-space-3)",
          zIndex: 50,
          width: PANEL_WIDTH,
          maxWidth: "calc(100vw - 24px)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border-subtle)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 60px -20px rgba(0,0,0,0.5)",
        }}
      >
        {/* Breadcrumb bar */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: "var(--spacing-space-4) var(--spacing-space-5) var(--spacing-space-4) var(--spacing-space-8)",
            flexShrink: 0,
          }}
        >
          <span className="flex items-center" style={{ gap: 6, fontSize: 12, color: "var(--color-text-muted)" }}>
            Agents
            <ArrowRightIcon width={16} height={16} aria-hidden style={{ color: "var(--color-text-disabled)" }} />
            <span style={{ color: "var(--color-text-secondary)", fontWeight: 500 }}>{agent.name}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center"
            style={{
              width: 26,
              height: 26,
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "transparent",
              color: "var(--color-text-muted)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Scroll body */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {/* ── Header: identity + actions ── */}
          <div style={{ padding: "var(--spacing-space-7) var(--spacing-space-8)" }}>
            <div className="flex items-center" style={{ gap: "var(--spacing-space-2)" }}>
              <SingleAgentIcon
                width={30}
                height={30}
                aria-hidden
                style={{
                  color: "var(--color-text-secondary)",
                  flexShrink: 0,
                  shapeRendering: "geometricPrecision",
                  // The glyph sits ~1/4 inset in its 24×24 viewBox; pull left so its
                  // visible edge lines up with the Tier/Status/Owner labels below.
                  marginLeft: -9,
                }}
              />
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  lineHeight: 1.2,
                }}
              >
                {agent.name}
              </h2>
            </div>

            {/* Identity rows — Tier, Status, Owner in one labelled column. */}
            <div
              className="flex flex-col"
              style={{ gap: "var(--spacing-space-4)", marginTop: "var(--spacing-space-6)" }}
            >
              <div className="flex items-center" style={{ gap: "var(--spacing-space-2)" }}>
                <span style={{ fontSize: 12, color: "var(--color-text-muted)", width: 52, flexShrink: 0 }}>Tier</span>
                <TierBadge tier={agent.tier} size="md" />
              </div>
              <div className="flex items-center" style={{ gap: "var(--spacing-space-2)" }}>
                <span style={{ fontSize: 12, color: "var(--color-text-muted)", width: 52, flexShrink: 0 }}>Status</span>
                <StatusPill status={agent.status} />
              </div>
              <div className="flex items-center" style={{ gap: "var(--spacing-space-2)" }}>
                <span style={{ fontSize: 12, color: "var(--color-text-muted)", width: 52, flexShrink: 0 }}>Owner</span>
                <span
                  className="flex items-center justify-center"
                  aria-hidden
                  style={{
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
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{agent.owner.name}</span>
              </div>
            </div>

            {/* Actions */}
            <div
              className="flex items-center"
              style={{ gap: "var(--spacing-space-3)", marginTop: "var(--spacing-space-6)", flexWrap: "wrap", position: "relative" }}
            >
              <ActionButton
                icon={isFrozen ? IconPlayerPlay : IconSnowflake}
                label={isFrozen ? "Unfreeze" : "Freeze"}
                tone={isFrozen ? "info" : "default"}
              />
              <ActionButton icon={IconCoins} label="Adjust budget" />
              <ActionButton icon={IconPencil} label="Edit policy" />
              <button
                type="button"
                aria-label="More actions"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center justify-center"
                style={{
                  width: 32,
                  height: 30,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border-subtle)",
                  background: menuOpen ? "var(--color-surface-hover)" : "transparent",
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                }}
              >
                <IconDotsVertical size={15} />
              </button>

              {menuOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 1 }} onClick={() => setMenuOpen(false)} />
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      right: 0,
                      zIndex: 2,
                      minWidth: 168,
                      background: "var(--color-surface-panel-elevated)",
                      border: "1px solid var(--color-border-subtle)",
                      borderRadius: "var(--radius-md)",
                      padding: "var(--spacing-space-2)",
                      boxShadow: "0 12px 32px -12px rgba(0,0,0,0.5)",
                    }}
                  >
                    <MenuItem icon={IconExternalLink} label="View full page" onClick={() => setMenuOpen(false)} />
                    <MenuItem icon={IconDownload} label="Export ledger" onClick={() => setMenuOpen(false)} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── 1. Spend Snapshot ── */}
          <Section title="Spend snapshot">
            <div className="flex items-baseline" style={{ gap: "var(--spacing-space-3)", flexWrap: "wrap" }}>
              <span
                style={{ fontSize: 26, fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}
              >
                {fmtEUR.format(agent.spend)}
              </span>
              <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>of {fmtEUR.format(agent.budget)}</span>
            </div>

            {/* Usage + burn */}
            <div
              className="flex items-center"
              style={{ gap: "var(--spacing-space-6)", marginTop: "var(--spacing-space-5)", flexWrap: "wrap" }}
            >
              <span className="flex items-center" style={{ gap: "var(--spacing-space-3)" }}>
                <UsageBarMini usage={usage} color={barColor} />
                <span style={{ fontSize: 13, fontWeight: 600, color: barColor, fontVariantNumeric: "tabular-nums" }}>
                  {fmtPct(usage)}
                </span>
              </span>
              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                <span style={{ color: "var(--color-text-secondary)", fontWeight: 500 }}>
                  {fmtEUR.format(dailyBurn)}
                </span>{" "}
                / day avg
              </span>
            </div>

            {/* Projected breach summary */}
            <div style={{ marginTop: "var(--spacing-space-4)", fontSize: 12, color: "var(--color-text-muted)" }}>
              {projectedBreachDay !== null ? (
                <>
                  Projected to breach budget{" "}
                  <span style={{ color: "var(--color-status-danger)", fontWeight: 500 }}>
                    {agent.spend >= agent.budget ? "already over" : `around Aug ${projectedBreachDay}`}
                  </span>{" "}
                  at the current burn.
                </>
              ) : (
                <>
                  On pace to finish at{" "}
                  <span style={{ color: "var(--color-text-secondary)", fontWeight: 500 }}>
                    {fmtPct(projectedEnd / agent.budget)}
                  </span>{" "}
                  of budget — no breach projected this month.
                </>
              )}
            </div>

            {/* Projection chart */}
            <div style={{ marginTop: "var(--spacing-space-6)" }}>
              <BreachChart
                series={series}
                budget={agent.budget}
                projectedEnd={projectedEnd}
                projectedBreachDay={projectedBreachDay}
                color={barColor}
              />
            </div>

            {/* Anomaly callout — a soft neutral panel with the danger glyph. */}
            {isAnomaly && agent.anomalyReason && (
              <div
                className="flex"
                style={{
                  gap: "var(--spacing-space-3)",
                  marginTop: "var(--spacing-space-6)",
                  padding: "var(--spacing-space-4) var(--spacing-space-5)",
                  borderRadius: "var(--radius-md)",
                  background: "color-mix(in oklch, var(--color-text-primary) 5%, transparent)",
                }}
              >
                <IconAlertHexagon size={15} style={{ color: "var(--color-status-danger)", flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12.5, lineHeight: 1.45, color: "var(--color-text-secondary)" }}>
                  {agent.anomalyReason}
                </span>
              </div>
            )}
          </Section>

          {/* ── 2. Policy ── */}
          <Section
            title="Policy"
            action={<TextLink label={showYaml ? "Hide YAML" : "View YAML"} onClick={() => setShowYaml((s) => !s)} />}
          >
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--color-text-secondary)" }}>
              {agent.policySummary}
            </p>

            {/* Enforcement tier */}
            <div className="flex items-center" style={{ gap: "var(--spacing-space-3)", marginTop: "var(--spacing-space-5)" }}>
              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Enforcement</span>
              <span
                className="flex items-center"
                style={{
                  gap: 6,
                  padding: "3px var(--spacing-space-3)",
                  borderRadius: "var(--radius-full)",
                  background: "var(--color-surface-panel-elevated)",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--color-text-secondary)",
                }}
              >
                <IconGavel size={12} style={{ color: "var(--color-text-muted)" }} />
                {enforcement.label}
              </span>
              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>· {enforcement.hint}</span>
            </div>

            {/* YAML */}
            <AnimatePresence initial={false}>
              {showYaml && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <pre
                    style={{
                      margin: "var(--spacing-space-5) 0 0",
                      padding: "var(--spacing-space-4) var(--spacing-space-5)",
                      borderRadius: "var(--radius-md)",
                      background: "var(--color-surface-app)",
                      border: "1px solid var(--color-border-subtle)",
                      fontSize: 11.5,
                      lineHeight: 1.6,
                      color: "var(--color-text-secondary)",
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                      overflowX: "auto",
                    }}
                  >
                    {agent.policyYaml}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Shadow explainer */}
            {isShadow && (
              <div
                style={{
                  marginTop: "var(--spacing-space-5)",
                  padding: "var(--spacing-space-4) var(--spacing-space-5)",
                  borderRadius: "var(--radius-md)",
                  background: "color-mix(in oklch, var(--color-text-primary) 4%, transparent)",
                  border: "1px dashed var(--color-border-default)",
                  fontSize: 12.5,
                  lineHeight: 1.45,
                  color: "var(--color-text-secondary)",
                }}
              >
                This agent is running in <strong style={{ color: "var(--color-text-primary)" }}>Shadow mode</strong> —
                policy decisions are logged but <strong style={{ color: "var(--color-text-primary)" }}>not enforced</strong>.
                Nothing is being blocked for this agent.
              </div>
            )}

            <div style={{ marginTop: "var(--spacing-space-5)" }}>
              <TextLink label="Edit in Studio" icon={IconExternalLink} />
            </div>
          </Section>

          {/* ── 3. Ledger (scoped) ── */}
          <Section
            title="Ledger"
            id="agent-ledger"
            action={<TextLink label="View full ledger" icon={IconChevronRight} />}
          >
            <div className="flex flex-col">
              {ledger.map((entry, i) => (
                <LedgerRow key={entry.id} entry={entry} last={i === ledger.length - 1} />
              ))}
            </div>
          </Section>

          {/* ── 4. Tier History ── */}
          <Section title="Tier history">
            <TierTimeline history={agent.tierHistory} />
          </Section>

          <div style={{ height: "var(--spacing-space-6)" }} />
        </div>
      </motion.aside>
    </>
  );
}

// ── row + fact sub-components ─────────────────────────────────────────────────

function MenuItem({ icon: Icon, label, onClick }: { icon: React.ComponentType<IconProps>; label: string; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex items-center"
      style={{
        width: "100%",
        gap: "var(--spacing-space-3)",
        padding: "var(--spacing-space-3) var(--spacing-space-3)",
        borderRadius: "var(--radius-sm)",
        border: "none",
        background: hover ? "var(--color-surface-hover)" : "transparent",
        color: "var(--color-text-secondary)",
        fontSize: 12.5,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <Icon size={14} style={{ color: "var(--color-text-muted)" }} />
      {label}
    </button>
  );
}

/** A compact non-percentage usage bar for the snapshot. */
function UsageBarMini({ usage, color }: { usage: number; color: string }) {
  const SEG = 12;
  const filled = Math.max(usage > 0 ? 1 : 0, Math.round(Math.min(usage, 1) * SEG));
  return (
    <span aria-hidden className="flex items-center" style={{ gap: 2 }}>
      {Array.from({ length: SEG }, (_, i) => (
        <span
          key={i}
          style={{
            width: 3,
            height: 14,
            borderRadius: "var(--radius-full)",
            background: i < filled ? color : "var(--color-surface-panel-elevated)",
          }}
        />
      ))}
    </span>
  );
}

function LedgerRow({ entry, last }: { entry: LedgerEntry; last: boolean }) {
  const meta = OUTCOME_META[entry.outcome];
  return (
    <div
      className="flex items-center"
      style={{
        gap: "var(--spacing-space-4)",
        paddingBlock: "var(--spacing-space-4)",
        borderBottom: last ? "none" : "1px solid var(--color-border-subtle)",
      }}
    >
      <span
        style={{ width: 62, flexShrink: 0, fontSize: 11, color: "var(--color-text-muted)", fontVariantNumeric: "tabular-nums" }}
      >
        {timeFmt.format(new Date(entry.at))}
      </span>
      <span className="truncate" style={{ flex: 1, fontSize: 12.5, color: "var(--color-text-secondary)" }}>
        {entry.action}
      </span>
      <span
        style={{ fontSize: 12.5, color: "var(--color-text-primary)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}
      >
        {fmtEUR.format(entry.amount)}
      </span>
      <span
        style={{
          flexShrink: 0,
          width: 68,
          textAlign: "right",
          fontSize: 11,
          fontWeight: 500,
          color: meta.color,
        }}
      >
        {meta.label}
      </span>
    </div>
  );
}

// Tier-change glyph + colour + headline, mirroring the semantics of the table's
// tier ladder (a lower number = a higher tier).
function tierMeta(change: TierChange) {
  const isInit = change.from === 0;
  const isPromo = !isInit && change.to < change.from;
  const isDemo = !isInit && change.to > change.from;
  const Icon = isPromo ? IconArrowUpRight : isDemo ? IconArrowDownRight : IconCircleDot;
  const color = isPromo
    ? "var(--color-status-success)"
    : isDemo
      ? "var(--color-status-warning)"
      : "var(--color-text-muted)";
  const label = isInit
    ? `Onboarded at T${change.to}`
    : isPromo
      ? `Promoted T${change.from} → T${change.to}`
      : isDemo
        ? `Demoted T${change.from} → T${change.to}`
        : `Held at T${change.to}`;
  return { Icon, color, label };
}

// Timeline geometry — matches the Overview Activity feed (ActivityCard): a single
// rounded capsule wraps the icon rail, a 1px connector threads down its centre,
// and one glyph sits vertically centred in each row.
const RAIL_WIDTH = 28;
const TL_ICON_SIZE = 14;
const TL_ICON_GAP = 6;
const TL_LINE_X = RAIL_WIDTH / 2 - 0.5;
const TL_LINE_INSET = TL_ICON_SIZE / 2 + TL_ICON_GAP;
const TL_CAPSULE_PAD = 10;

/** Chronological tier changes as a connected vertical timeline (newest first). */
function TierTimeline({ history }: { history: TierChange[] }) {
  const items = [...history].reverse(); // top = most recent
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
        top: firstTop - listTop - TL_CAPSULE_PAD,
        height: lastBottom - firstTop + TL_CAPSULE_PAD * 2,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [items.length]);

  return (
    <ol
      ref={listRef}
      aria-label="Tier history"
      style={{ listStyle: "none", margin: 0, padding: 0, position: "relative" }}
    >
      {/* Capsule wrapping the icon rail; connector + glyphs render on top. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          width: RAIL_WIDTH,
          top: capsule ? capsule.top : 0,
          height: capsule ? capsule.height : "100%",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-lg)",
        }}
      />

      {items.map((change, i) => {
        const isFirst = i === 0;
        const isLast = i === items.length - 1;
        const { Icon, color, label } = tierMeta(change);
        return (
          <li
            key={`${change.at}-${i}`}
            style={{
              display: "grid",
              gridTemplateColumns: `${RAIL_WIDTH}px 1fr`,
              columnGap: "var(--spacing-space-4)",
              paddingBlock: "var(--spacing-space-4)",
            }}
          >
            {/* Rail — connector threading through the capsule, glyph centred. */}
            <span aria-hidden style={{ position: "relative" }}>
              {!isFirst && (
                <span
                  style={{
                    position: "absolute",
                    left: TL_LINE_X,
                    width: 1,
                    background: "var(--color-border-subtle)",
                    top: 0,
                    height: `calc(50% - ${TL_LINE_INSET}px)`,
                  }}
                />
              )}
              {!isLast && (
                <span
                  style={{
                    position: "absolute",
                    left: TL_LINE_X,
                    width: 1,
                    background: "var(--color-border-subtle)",
                    top: `calc(50% + ${TL_LINE_INSET}px)`,
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
                  width: TL_ICON_SIZE,
                  height: TL_ICON_SIZE,
                  color,
                }}
              >
                <Icon size={TL_ICON_SIZE} stroke={2} />
              </span>
            </span>

            {/* Change — headline over the date, with the reason beneath. */}
            <span style={{ alignSelf: "center" }}>
              <span className="flex items-baseline" style={{ gap: "var(--spacing-space-3)" }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)" }}>{label}</span>
                <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{absDate(change.at)}</span>
              </span>
              <span style={{ display: "block", marginTop: 2, fontSize: 12, color: "var(--color-text-muted)" }}>
                {change.reason}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
