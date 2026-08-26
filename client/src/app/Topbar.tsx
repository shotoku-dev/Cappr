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

export function Topbar({ activeId, onNavigate }: TopbarProps) {
  const { label, Icon } = NAV_ITEMS.find((item) => item.id === activeId) ?? NAV_ITEMS[0];

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

      {/* Current module: label with its sidebar icon tucked in close. */}
      <span
        className="flex items-center"
        style={{
          gap: "var(--spacing-space-1)", // 2 — icon hugs the label
          color: "var(--color-text-secondary)",
        }}
      >
        <span style={{ fontWeight: 500 }}>{label}</span>
        <Icon width={PAGE_ICON_SIZE} height={PAGE_ICON_SIZE} aria-hidden />
      </span>

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
