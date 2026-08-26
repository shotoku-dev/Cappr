import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconArrowLoopRight } from "@tabler/icons-react";
import CheckIcon from "../../assets/icons/CheckIcon.svg?react";
import DenyIcon from "../../assets/icons/DenyIcon.svg?react";
import type { AuditEntry } from "@nudge/shared";

const COLLAPSED_HEIGHT = 44;
const EXPANDED_PAD_Y = 24;
const PAD_X = 20;

const openEase = {
  duration: 0.7,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};
const closeSpring = { type: "spring", duration: 0.5, bounce: 0 } as const;

function fmt(value: number): string {
  return value.toFixed(2);
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function valueFontPx(totalChars: number): number {
  if (totalChars <= 8) return 40;
  if (totalChars <= 10) return 32;
  return 26;
}

interface ItemProps {
  entry: AuditEntry;
  isActive: boolean;
  onClick: () => void;
  onCollapseComplete: () => void;
  onTamper?: () => void;
}

function AuditEntryItem({ entry, isActive, onClick, onCollapseComplete, onTamper }: ItemProps) {
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [, setIsExpanding] = useState(false);
  const [prevActive, setPrevActive] = useState(isActive);
  const [showConstraint, setShowConstraint] = useState(false);

  const isCollapsingRef = useRef(false);
  const prevIsActiveRef = useRef(isActive);

  const isApproved = entry.status === "approved";
  const displayValue = entry.resolvedValue ?? entry.request.value;
  const displayText = displayValue !== undefined ? fmt(displayValue) : "";
  const valueChars = (entry.request.valuePrefix?.length ?? 0) + displayText.length;
  const valueFontSize = valueFontPx(valueChars);

  const isIdleCollapsed = !isActive && !isCollapsing;
  const showCollapsedOverlay = isCollapsing || isIdleCollapsed;
  const contentVisible = !isCollapsing && isActive;

  // Drive expand/collapse synchronously during render.
  // Reset showConstraint here so the motion.div is already at height 0 before
  // the new expand's timer fires — avoids a stale-state flash on re-expand.
  if (isActive !== prevActive) {
    setPrevActive(isActive);
    if (isActive) {
      setIsExpanding(true);
      setIsCollapsing(false);
      isCollapsingRef.current = false;
      setShowConstraint(false);
    } else {
      isCollapsingRef.current = true;
      setIsCollapsing(true);
    }
  }

  useEffect(() => {
    if (!isCollapsing) return;
    const t = setTimeout(() => {
      setIsCollapsing(false);
      isCollapsingRef.current = false;
      setIsExpanding(false);
      onCollapseComplete();
    }, closeSpring.duration * 1000 + 50);
    return () => clearTimeout(t);
  }, [isCollapsing]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const wasActive = prevIsActiveRef.current;
    prevIsActiveRef.current = isActive;
    if (!isActive || !wasActive === false) return;
    // Card just became active: clear isExpanding fallback + trigger constraint reveal
    const t1 = setTimeout(() => setIsExpanding(false), openEase.duration * 1000 + 100);
    const t2 = setTimeout(() => setShowConstraint(true), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  const statusIcon = isApproved
    ? <CheckIcon width={16} height={16} style={{ color: "var(--color-green-500)", flexShrink: 0 }} />
    : <DenyIcon width={16} height={16} style={{ color: "var(--color-red-500)", flexShrink: 0 }} />;

  return (
    <motion.div
      data-nudge-item={isIdleCollapsed ? "collapsed" : "expanded"}
      data-status={entry.status}
      className="relative bg-surface-app"
      style={{
        width: 300,
        border: "0.5px solid var(--color-border-subtle)",
        overflow: "hidden",
        cursor: isIdleCollapsed ? "pointer" : "default",
        paddingLeft: PAD_X,
        paddingRight: PAD_X,
      }}
      initial={{ height: COLLAPSED_HEIGHT, borderRadius: 12 }}
      animate={{
        height: (isCollapsing || isIdleCollapsed) ? COLLAPSED_HEIGHT : "auto",
        borderRadius: (isCollapsing || isIdleCollapsed) ? 12 : 16,
      }}
      transition={(isCollapsing || isIdleCollapsed) ? closeSpring : openEase}
      onClick={isIdleCollapsed ? onClick : undefined}
      onAnimationComplete={() => {
        if (!isCollapsingRef.current) setIsExpanding(false);
      }}
    >
      {/* Collapsed overlay */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: 12,
          paddingRight: PAD_X,
          pointerEvents: "none",
        }}
        animate={{ opacity: showCollapsedOverlay ? 1 : 0 }}
        transition={
          showCollapsedOverlay
            ? { duration: 0.25, delay: 0.15, ease: "easeOut" }
            : { duration: 0 }
        }
      >
        <span className="text-base font-normal text-text-primary shrink-0">
          {entry.request.requester}
        </span>
        {statusIcon}
      </motion.div>

      {/* Expanded content */}
      <motion.div
        style={{
          pointerEvents: contentVisible ? "auto" : "none",
          paddingTop: EXPANDED_PAD_Y,
          paddingBottom: EXPANDED_PAD_Y,
        }}
        animate={{ opacity: contentVisible ? 1 : 0 }}
        transition={{ duration: isCollapsing ? 0.08 : 0 }}
      >
        {/* Header — icon gets marginTop to optically align with requester line
            (text-base line-height 24px, icon 16px → 4px offset) */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-space-1">
            <span className="text-base font-normal text-text-primary">
              {entry.request.requester}
            </span>
            <span className="text-[10px] text-text-secondary">
              {isApproved ? "Approved" : "Denied"} {relativeTime(entry.resolvedAt)}
            </span>
          </div>
          <div style={{ marginTop: 4 }}>{statusIcon}</div>
        </div>

        {/* Value + Summary */}
        {displayValue !== undefined && (
          <div className="mt-space-6">
            <div className="flex flex-wrap items-center gap-space-4">
              <div className="flex items-center">
                <span
                  className="font-medium text-text-primary leading-none tabular-nums"
                  style={{ fontSize: valueFontSize }}
                >
                  {entry.request.valuePrefix}
                </span>
                <span
                  className="font-medium text-text-primary leading-none tabular-nums"
                  style={{ fontSize: valueFontSize }}
                >
                  {displayText}
                </span>
              </div>
              <span className="text-base font-medium text-text-secondary">
                {entry.request.summary}
              </span>
            </div>
          </div>
        )}

        {/* Detail */}
        {entry.request.detail && (
          <div className="mt-space-5">
            <p className="text-sm font-normal text-text-secondary">
              {entry.request.detail}
            </p>
          </div>
        )}

        {/* Constraint — always a motion.div so it never remounts between expands.
            showConstraint drives it; reset in derived-state on each new expand. */}
        {entry.request.constraint && (
          <motion.div
            animate={{ height: showConstraint ? "auto" : 0, opacity: showConstraint ? 1 : 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="flex flex-col mt-space-4" style={{ gap: "10px" }}>
              <div className="flex items-center justify-between pl-space-6">
                <div className="flex items-center gap-space-2">
                  <IconArrowLoopRight
                    size={14}
                    className="text-text-muted"
                    style={{ transform: "scaleY(-1)" }}
                  />
                  <span className="text-sm text-text-secondary">Constraint</span>
                </div>
                <span className="text-xs font-normal text-status-warning tabular-nums">
                  {entry.request.constraint.label}: {entry.request.valuePrefix}
                  {fmt(entry.request.constraint.limit)}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tamper control */}
        {onTamper && (
          <div
            className="flex items-center justify-end mt-space-5 pt-space-4"
            style={{ borderTop: "0.5px solid var(--color-border-subtle)" }}
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onTamper(); }}
              className="text-[10px] font-mono cursor-pointer"
              style={{
                color: "var(--color-red-500)",
                background: "none",
                border: "none",
                padding: 0,
                opacity: 0.6,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
            >
              tamper record
            </button>
          </div>
        )}

      </motion.div>
    </motion.div>
  );
}

type FilterType = "all" | "approved" | "denied";

const filterOptions: { id: FilterType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "approved", label: "Approved" },
  { id: "denied", label: "Denied" },
];

interface Props {
  entries: AuditEntry[];
  isActive?: boolean;
  onTamper?: (id: string) => void;
  canTamper?: (id: string) => boolean;
}

export function AuditTrail({ entries, isActive = true, onTamper, canTamper }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [hoveredFilter, setHoveredFilter] = useState<FilterType | null>(null);
  const pendingIdRef = useRef<string | null>(null);

  const counts: Record<FilterType, number> = {
    all: entries.length,
    approved: entries.filter((e) => e.status === "approved").length,
    denied: entries.filter((e) => e.status === "denied").length,
  };

  const filteredEntries =
    filter === "all" ? entries : entries.filter((e) => e.status === filter);

  function handleFilterChange(f: FilterType) {
    setFilter(f);
    setActiveId(null);
    pendingIdRef.current = null;
  }

  function handleClick(id: string) {
    if (id === activeId) return;
    if (activeId === null) {
      pendingIdRef.current = null;
      setActiveId(id);
    } else {
      pendingIdRef.current = id;
      setActiveId(null);
    }
  }

  function handleCollapseComplete() {
    if (pendingIdRef.current !== null) {
      setActiveId(pendingIdRef.current);
      pendingIdRef.current = null;
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!isActive) return;
      if (e.target instanceof HTMLInputElement) return;
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      const idx = filteredEntries.findIndex((e) => e.request.id === activeId);
      const nextIdx = e.key === "ArrowDown"
        ? Math.min(idx + 1, filteredEntries.length - 1)
        : Math.max(idx - 1, 0);
      const target = filteredEntries[nextIdx];
      if (target && target.request.id !== activeId) handleClick(target.request.id);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filteredEntries, activeId, isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  if (entries.length === 0) {
    return (
      <div
        data-nudge="audit-trail"
        data-nudge-state="empty"
        className="flex items-center justify-center"
        style={{ width: 300, height: 120 }}
      >
        <span className="text-sm text-text-muted">No decisions yet.</span>
      </div>
    );
  }

  return (
    <div data-nudge="audit-trail" className="flex flex-col" style={{ gap: 8 }}>
      {/* Filter */}
      <div
        className="flex bg-surface-panel"
        style={{
          borderRadius: 12,
          border: "1.5px dashed var(--color-border-subtle)",
          padding: 3,
          gap: 2,
        }}
      >
        {filterOptions.map((opt) => {
          const isFilterActive = opt.id === filter;
          const isHighlighted = isFilterActive || hoveredFilter === opt.id;
          const showIndicator = hoveredFilter === opt.id || (!hoveredFilter && isFilterActive);
          const count = counts[opt.id];
          return (
            <motion.button
              key={opt.id}
              type="button"
              onClick={() => handleFilterChange(opt.id)}
              onHoverStart={() => setHoveredFilter(opt.id)}
              onHoverEnd={() => setHoveredFilter(null)}
              className="relative flex items-center justify-center gap-space-2 cursor-pointer"
              style={{
                flex: 1,
                padding: "4px 8px",
                borderRadius: 9,
                border: "none",
                background: "none",
              }}
            >
              {showIndicator && (
                <motion.div
                  layoutId="audit-filter-indicator"
                  className="absolute inset-0 bg-surface-hover"
                  style={{ borderRadius: 9 }}
                  transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                />
              )}
              <span
                className="relative text-xs"
                style={{
                  zIndex: 1,
                  color: isHighlighted ? "var(--color-text-primary)" : "var(--color-text-muted)",
                  fontWeight: isHighlighted ? 500 : 400,
                  transition: isHighlighted ? "none" : "color 300ms ease",
                }}
              >
                {opt.label}
              </span>
              {count > 0 && (
                <span
                  className="relative text-[10px] tabular-nums"
                  style={{
                    zIndex: 1,
                    color: isHighlighted ? "var(--color-text-secondary)" : "var(--color-text-disabled)",
                  }}
                >
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* List */}
      {filteredEntries.length === 0 ? (
        <div
          className="flex items-center justify-center"
          style={{ width: 300, height: 80 }}
        >
          <span className="text-sm text-text-muted">
            No {filter} decisions.
          </span>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {filteredEntries.map((entry) => (
            <motion.div
              key={entry.request.id}
              layout="position"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ type: "spring", duration: 0.4, bounce: 0 }}
            >
              <AuditEntryItem
                entry={entry}
                isActive={entry.request.id === activeId}
                onClick={() => handleClick(entry.request.id)}
                onCollapseComplete={handleCollapseComplete}
                onTamper={onTamper && canTamper?.(entry.request.id) ? () => onTamper(entry.request.id) : undefined}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
