import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ArrowRightIcon from "../assets/icons/Arrow Right Icon.svg?react";
import ShadowIcon from "../assets/icons/Shadow Icon.svg?react";
import CrossIcon from "../assets/icons/Cross Icon.svg?react";
import { BorderBeam } from "border-beam";
import { CommandMenu } from "./command-menu";
import { OrganizationSwitcher } from "./OrganizationSwitcher";
import { NAV_ITEMS, type ModuleId } from "./navigation";

interface TopbarProps {
  /** Selected module — drives the breadcrumb's current-page segment. */
  activeId: ModuleId;
  /** Jump to a module from the command palette. */
  onNavigate: (id: ModuleId) => void;
}

// Breadcrumb glyphs run smaller than the 24px sidebar rail.
const ARROW_SIZE = 16; // segment separator
const PAGE_ICON_SIZE = 16; // the module's own sidebar icon, echoed inline
const SHADOW_ICON_SIZE = 16; // active shadow-agent pill

/** Active shadow agent (static until agents are wired up). */
const SHADOW_AGENT = "atlas-researcher";

// Directional swap for the breadcrumb's current-module segment. `dir` is the
// sign of (new tab index − old): +1 for a tab below (slides down), −1 for above
// (slides up). Reduced-motion collapses it to a plain crossfade.
type SwapCustom = { dir: number; reduce: boolean };
const labelSwap = {
  enter: ({ dir, reduce }: SwapCustom) => ({ y: reduce ? 0 : dir > 0 ? "-100%" : "100%", opacity: 0 }),
  center: { y: "0%", opacity: 1 },
  exit: ({ dir, reduce }: SwapCustom) => ({ y: reduce ? 0 : dir > 0 ? "100%" : "-100%", opacity: 0 }),
};

export function Topbar({ activeId, onNavigate }: TopbarProps) {
  const { label, Icon } = NAV_ITEMS.find((item) => item.id === activeId) ?? NAV_ITEMS[0];
  const reduce = useReducedMotion() ?? false;

  // Swap direction from the tab's position in the rail relative to the last one.
  const activeIndex = NAV_ITEMS.findIndex((item) => item.id === activeId);
  const prevIndexRef = useRef(activeIndex);
  const dir = Math.sign(activeIndex - prevIndexRef.current);
  useEffect(() => {
    prevIndexRef.current = activeIndex;
  }, [activeIndex]);

  return (
    <header
      className="flex items-center w-full shrink-0 bg-surface-panel"
      style={{
        borderRadius: "var(--radius-lg)", // 8 — optically matches the sidebar on the short bar
        padding: "var(--spacing-space-3) var(--spacing-space-2)", // 6 t/b, 4 l/r
        paddingLeft: "var(--spacing-space-6)", // 16 — extra room for the leading label
        gap: "var(--spacing-space-3)", // 6 between breadcrumb segments
        fontSize: 14,
      }}
    >
      {/* Workspace / organization switcher. */}
      <OrganizationSwitcher />

      <ArrowRightIcon
        width={ARROW_SIZE}
        height={ARROW_SIZE}
        aria-hidden
        style={{ color: "var(--color-text-disabled)" }}
      />

      {/* Current module: label + its sidebar icon, swapped with a directional
          vertical slide when the selected tab changes. Clipped so the outgoing
          and incoming segments slide past behind the same window. */}
      <div className="relative flex items-center" style={{ overflow: "hidden" }}>
        <AnimatePresence initial={false} mode="popLayout" custom={{ dir, reduce }}>
          <motion.span
            key={activeId}
            custom={{ dir, reduce }}
            variants={labelSwap}
            initial="enter"
            animate="center"
            exit="exit"
            transition={reduce ? { duration: 0.15 } : { type: "spring", duration: 0.35, bounce: 0 }}
            className="flex items-center"
            style={{
              gap: "var(--spacing-space-1)", // 2 — icon hugs the label
              color: "var(--color-text-secondary)",
            }}
          >
            <span style={{ fontWeight: 500 }}>{label}</span>
            <Icon width={PAGE_ICON_SIZE} height={PAGE_ICON_SIZE} aria-hidden />
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Right cluster: active shadow-agent pill + command palette. */}
      <div
        className="flex items-center"
        style={{ marginLeft: "auto", gap: "var(--spacing-space-3)" }} // 6
      >
        <CommandMenu onNavigate={onNavigate} />

        {/* Ocean variant ≈ our blue accent; low strength keeps it subtle. */}
        <BorderBeam
          size="sm"
          colorVariant="ocean"
          theme="auto"
          strength={0.65}
          duration={2.8}
          borderRadius={20}
        >
          <div
            className="flex items-center"
            style={{
              background: "var(--color-surface-panel-elevated)",
              borderRadius: 20,
              // 2 top/bottom, 4 left, 8 right.
              padding: "var(--spacing-space-1) var(--spacing-space-4) var(--spacing-space-1) var(--spacing-space-2)",
              gap: "var(--spacing-space-3)", // 6 between icon and label
              color: "var(--color-text-secondary)",
              fontSize: 14,
            }}
          >
            <ShadowIcon width={SHADOW_ICON_SIZE} height={SHADOW_ICON_SIZE} aria-hidden />
            <span>Shadow: {SHADOW_AGENT}</span>
          </div>
        </BorderBeam>

        {/* Stop the active shadow agent. */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 24,
            height: 24,
            borderRadius: "var(--radius-full)",
            background: "var(--color-surface-panel-elevated)",
            color: "var(--color-text-primary)",
          }}
        >
          <CrossIcon width={14} height={14} aria-hidden />
        </div>

        {/* Current user — dotted ring around a blue accent avatar. */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 28,
            height: 28,
            borderRadius: "var(--radius-full)",
            // Green "you" ring, matching the org roster; 2px = same steps.
            border: "2px dotted var(--color-green-500)",
          }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: 22,
              height: 22,
              borderRadius: "var(--radius-full)",
              background: "var(--color-accent-500)",
              color: "var(--color-text-primary)",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            J
          </div>
        </div>
      </div>
    </header>
  );
}
