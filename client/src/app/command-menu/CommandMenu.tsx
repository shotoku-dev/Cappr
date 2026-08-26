import { useEffect, useState } from "react";
import SearchIcon from "../../assets/icons/Search Icon.svg?react";
import CmdIcon from "../../assets/icons/Cmd Icon.svg?react";
import { Kbd } from "./Kbd";
import { CommandPalette } from "./CommandPalette";
import type { ModuleId } from "../navigation";

const SEARCH_ICON_SIZE = 16;
const CMD_ICON_SIZE = 14;

interface CommandMenuProps {
  /** Jump to a module when its palette item is selected. */
  onNavigate: (id: ModuleId) => void;
}

/**
 * Command-palette entry point: the topbar trigger button plus the ⌘K/Ctrl+K
 * global shortcut, both toggling the {@link CommandPalette} dialog.
 */
export function CommandMenu({ onNavigate }: CommandMenuProps) {
  const [open, setOpen] = useState(false);
  // Which shortcut keys are currently held — lets the caps light up live, even
  // when only one half of ⌘K is pressed.
  const [heldMod, setHeldMod] = useState(false);
  const [heldK, setHeldK] = useState(false);

  useEffect(() => {
    const isMod = (key: string) => key === "Meta" || key === "Control";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.metaKey || e.ctrlKey || isMod(e.key)) setHeldMod(true);
      if (e.key.toLowerCase() === "k") setHeldK(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (isMod(e.key) || !(e.metaKey || e.ctrlKey)) setHeldMod(false);
      if (e.key.toLowerCase() === "k") setHeldK(false);
    };
    // A held key can get "stuck" if the window loses focus mid-press.
    const reset = () => {
      setHeldMod(false);
      setHeldK(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", reset);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", reset);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center cursor-pointer"
        style={{
          background: "var(--color-surface-panel-elevated)",
          border: "none",
          borderRadius: "var(--radius-md)", // 6
          // l6 t4 r4 b3 — bottom trimmed 1px to optically center the caps row.
          padding: "var(--spacing-space-2) var(--spacing-space-2) 3px var(--spacing-space-3)",
          gap: "var(--spacing-space-4)", // 8 between icon · label · shortcut
        }}
      >
        <SearchIcon
          width={SEARCH_ICON_SIZE}
          height={SEARCH_ICON_SIZE}
          aria-hidden
          style={{ color: "var(--color-text-disabled)" }}
        />
        <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
          Search or jump to...
        </span>
        <span className="flex items-center" style={{ gap: "var(--spacing-space-1)" }}>
          <Kbd active={heldMod}>
            <CmdIcon width={CMD_ICON_SIZE} height={CMD_ICON_SIZE} aria-hidden />
          </Kbd>
          <Kbd active={heldK}>K</Kbd>
        </span>
      </button>

      <CommandPalette open={open} onOpenChange={setOpen} onNavigate={onNavigate} />
    </>
  );
}
