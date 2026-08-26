import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { NAV_ITEMS, type ModuleId } from "./navigation";

interface SidebarProps {
  /** Selected module (drives which tab stays highlighted when not hovering). */
  activeId: ModuleId;
  onSelect: (id: ModuleId) => void;
}

const ICON_SIZE = 18;

export function Sidebar({ activeId, onSelect }: SidebarProps) {
  const [hoveredId, setHoveredId] = useState<ModuleId | null>(null);

  // Shift+1…N jumps straight to the Nth module. Use `code` (Digit1…) so it works
  // regardless of the shifted character the layout produces (e.g. "!").
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return; // don't hijack typing
      }
      const match = /^Digit([1-9])$/.exec(e.code);
      if (!match) return;
      const item = NAV_ITEMS[Number(match[1]) - 1];
      if (!item) return;
      e.preventDefault();
      onSelect(item.id);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onSelect]);

  return (
    <aside
      // Leaving the whole rail (not individual tabs) returns the highlight to active.
      onMouseLeave={() => setHoveredId(null)}
      className="flex flex-col items-center shrink-0 w-fit bg-surface-panel"
      style={{
        borderRadius: "var(--radius-xl)", // 12 — concentric: 6 padding + 6 item radius
        padding: "var(--spacing-space-3)", // 6 t/b, l/r (the concentric gap)
        gap: "var(--spacing-space-4)", // 8 between icons
      }}
    >
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const isActive = activeId === id;
        const isHovered = hoveredId === id;
        // Pill follows the hovered tab; with none hovered, the active one.
        const isHighlighted = hoveredId ? isHovered : isActive;
        // Color stays secondary for the selected tab even while hovering elsewhere;
        // it only drops to muted once another tab is clicked (becomes active).
        const isSecondary = isActive || isHovered;
        return (
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-current={activeId === id ? "page" : undefined}
            onMouseEnter={() => setHoveredId(id)}
            onClick={() => onSelect(id)}
            className="relative flex items-center justify-center cursor-pointer"
            style={{
              padding: "var(--spacing-space-3)", // 6 around the icon (narrower rail)
              border: "none",
              background: "transparent",
              color: isSecondary
                ? "var(--color-text-secondary)"
                : "var(--color-text-muted)",
              // Instantly color the incoming tab; fade the outgoing one out.
              transition: isSecondary ? "none" : "color 300ms ease",
            }}
          >
            {isHighlighted && (
              <motion.div
                layoutId="sidebar-highlight"
                className="absolute inset-0"
                style={{
                  zIndex: 0,
                  background: "var(--color-surface-panel-elevated)",
                  borderRadius: "var(--radius-md)", // 6 — concentric inner radius
                }}
                transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              />
            )}
            <Icon
              width={ICON_SIZE}
              height={ICON_SIZE}
              aria-hidden
              style={{ position: "relative", zIndex: 1 }}
            />
          </button>
        );
      })}
    </aside>
  );
}
