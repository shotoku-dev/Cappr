import { Command } from "cmdk";
import ArrowUpIcon from "../../assets/icons/Arrow Up Icon.svg?react";
import ArrowDownIcon from "../../assets/icons/Arrow Down Icon.svg?react";
import EnterIcon from "../../assets/icons/Enter Icon.svg?react";
import { Kbd } from "./Kbd";
import { NAV_ITEMS, type ModuleId } from "../navigation";
import "./command-menu.css";

const HINT_ICON_SIZE = 14;
const ITEM_ICON_SIZE = 16;

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Jump to a module when its item is selected. */
  onNavigate: (id: ModuleId) => void;
}

/**
 * The cmdk command palette. Lists every module as a standalone,
 * keyboard-navigable item; selecting one jumps to that module. The shell
 * (input, list, footer) stays stable as more commands land.
 */
export function CommandPalette({ open, onOpenChange, onNavigate }: CommandPaletteProps) {
  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command menu"
      overlayClassName="command-overlay"
      contentClassName="command-dialog"
    >
      <Command.Input className="command-input" placeholder="Search or jump to..." />

      <Command.List className="command-list">
        <Command.Empty className="command-empty">No results found.</Command.Empty>
        {/* Modules as standalone, navigable items. */}
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <Command.Item
            key={id}
            value={label}
            className="command-item"
            onSelect={() => {
              onNavigate(id);
              onOpenChange(false);
            }}
          >
            <Icon width={ITEM_ICON_SIZE} height={ITEM_ICON_SIZE} aria-hidden />
            <span>{label}</span>
          </Command.Item>
        ))}
      </Command.List>

      {/* Keyboard hints — cmdk already handles the actual key behaviour. */}
      <div className="command-footer">
        <span className="command-hint">
          <Kbd>
            <ArrowUpIcon width={HINT_ICON_SIZE} height={HINT_ICON_SIZE} aria-hidden />
          </Kbd>
          <Kbd>
            <ArrowDownIcon width={HINT_ICON_SIZE} height={HINT_ICON_SIZE} aria-hidden />
          </Kbd>
          <span className="command-hint-label">Navigate</span>
        </span>
        <span className="command-hint">
          <Kbd>
            <EnterIcon width={HINT_ICON_SIZE} height={HINT_ICON_SIZE} aria-hidden />
          </Kbd>
          <span className="command-hint-label">Submit</span>
        </span>
        <span className="command-hint">
          <Kbd>esc</Kbd>
          <span className="command-hint-label">Exit</span>
        </span>
      </div>
    </Command.Dialog>
  );
}
