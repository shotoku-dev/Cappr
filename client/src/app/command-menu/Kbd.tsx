import type { ReactNode } from "react";

interface KbdProps {
  children: ReactNode;
  /** Lit state — brightens the cap while its key is held down. */
  active?: boolean;
}

/**
 * A keycap. Shared by the topbar trigger and the palette footer so both read
 * identically: a `surface-panel` chip that sits one level below its
 * `surface-panel-elevated` container.
 */
export function Kbd({ children, active = false }: KbdProps) {
  return (
    <kbd
      className="flex items-center justify-center"
      style={{
        background: "var(--color-surface-panel)",
        borderRadius: "var(--radius-sm)", // 4
        // Held key lights up via text only — the cap surface stays put.
        color: active
          ? "var(--color-text-primary)"
          : "var(--color-text-muted)",
        minWidth: 18,
        height: 18,
        padding: "0 var(--spacing-space-1)", // 2
        fontSize: 11,
        fontFamily: "inherit",
        transition: "color 150ms ease",
      }}
    >
      {children}
    </kbd>
  );
}
