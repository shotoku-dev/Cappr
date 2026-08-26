import type { FC, SVGProps } from "react";
import OverviewIcon from "../assets/icons/overview.svg?react";
import LedgerIcon from "../assets/icons/ledger.svg?react";
import FirewallIcon from "../assets/icons/firewall.svg?react";
import StudioIcon from "../assets/icons/studio.svg?react";
import InboxIcon from "../assets/icons/inbox.svg?react";
import ScoreIcon from "../assets/icons/score.svg?react";
import WalletIcon from "../assets/icons/wallet.svg?react";

/** The dashboard modules, identified by a stable id (also used for routes later). */
export type ModuleId =
  | "overview"
  | "ledger"
  | "firewall"
  | "studio"
  | "inbox"
  | "score"
  | "wallet";

export interface NavItem {
  id: ModuleId;
  label: string;
  Icon: FC<SVGProps<SVGSVGElement>>;
}

/** Sidebar entries, in display order. Single source of truth for the nav. */
export const NAV_ITEMS: readonly NavItem[] = [
  { id: "overview", label: "Overview", Icon: OverviewIcon },
  { id: "ledger", label: "Ledger", Icon: LedgerIcon },
  { id: "firewall", label: "Firewall", Icon: FirewallIcon },
  { id: "studio", label: "Studio", Icon: StudioIcon },
  { id: "inbox", label: "Inbox", Icon: InboxIcon },
  { id: "score", label: "Score", Icon: ScoreIcon },
  { id: "wallet", label: "Wallet", Icon: WalletIcon },
];
