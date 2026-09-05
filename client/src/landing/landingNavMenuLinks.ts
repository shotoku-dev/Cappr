import {
  IconArticle,
  IconBriefcase,
  IconBuilding,
  IconCode,
  IconEyeOff,
  IconLayoutGrid,
  IconShieldCheck,
  IconStairs,
  type Icon,
} from "@tabler/icons-react";

export type NavDropdownLink = {
  title: string;
  label: string;
  href: string;
  icon: Icon;
};

export type NavMenuId = "product" | "company";

export const NAV_MENUS: Record<
  NavMenuId,
  { trigger: string; ariaLabel: string; links: NavDropdownLink[] }
> = {
  product: {
    trigger: "Product",
    ariaLabel: "Product",
    links: [
      {
        title: "Shadow mode",
        label: "Observe before you enforce",
        href: "#shadow-mode",
        icon: IconEyeOff,
      },
      {
        title: "Enforcement ladder",
        label: "Warn, cap, and block",
        href: "#enforcement-ladder",
        icon: IconStairs,
      },
      {
        title: "Modules",
        label: "Policy, approval, audit",
        href: "#modules",
        icon: IconLayoutGrid,
      },
      {
        title: "Ledger proof",
        label: "Cryptographic audit trail",
        href: "#ledger-proof",
        icon: IconShieldCheck,
      },
    ],
  },
  company: {
    trigger: "Company",
    ariaLabel: "Company",
    links: [
      {
        title: "About",
        label: "Who builds Cappr",
        href: "#about",
        icon: IconBuilding,
      },
      {
        title: "Open core",
        label: "Cappr on your infra",
        href: "#open-core",
        icon: IconCode,
      },
      {
        title: "Blog",
        label: "Updates and ideas",
        href: "#blog",
        icon: IconArticle,
      },
      {
        title: "Careers",
        label: "Join the team",
        href: "#careers",
        icon: IconBriefcase,
      },
    ],
  },
};

export const NAV_MENU_IDS = Object.keys(NAV_MENUS) as NavMenuId[];
