import { EARLY_ACCESS_HREF } from "../LandingCtas";

export const OPEN_CORE_COPY = {
  titleLine1: "Choose where Cappr runs.",
  titleLine2: null,
  lead:
    "Without Cappr you get a total. With Cappr you get the control plane — hosted in our cloud, or with the gateway on your infra. Same Cappr either way; Shotoku stays open underneath.",
} as const;

export const SHOTOKU_PROOF = {
  href: "https://shotoku.dev",
} as const;

export const COLUMNS = [
  {
    id: "none",
    title: "Provider billing alone",
    subtitle: "Status quo",
    cta: null,
  },
  {
    id: "hosted",
    title: "Cappr hosted",
    subtitle: "Managed control plane",
    cta: { label: "Get early access", href: EARLY_ACCESS_HREF },
  },
  {
    id: "infra",
    title: "Cappr on your infra",
    subtitle: "Same product · your boundary",
    cta: null,
  },
] as const;

export type ColumnId = (typeof COLUMNS)[number]["id"];

export type CellValue =
  | { kind: "text"; value: string; muted?: boolean }
  | { kind: "missing"; value: string }
  | { kind: "check" }
  | { kind: "cross" };

export const ROWS: {
  feature: string;
  none: CellValue;
  hosted: CellValue;
  infra: CellValue;
}[] = [
  {
    feature: "Broken down by agent",
    none: { kind: "missing", value: "—" },
    hosted: { kind: "check" },
    infra: { kind: "check" },
  },
  {
    feature: "Policy outcome on record",
    none: { kind: "missing", value: "—" },
    hosted: { kind: "check" },
    infra: { kind: "check" },
  },
  {
    feature: "Human approval trail",
    none: { kind: "missing", value: "—" },
    hosted: { kind: "check" },
    infra: { kind: "check" },
  },
  {
    feature: "Gateway location",
    none: { kind: "text", value: "None · direct to provider", muted: true },
    hosted: { kind: "text", value: "Cappr cloud" },
    infra: { kind: "text", value: "Your VPC" },
  },
  {
    feature: "Spend & audit data",
    none: { kind: "text", value: "Provider invoice only", muted: true },
    hosted: { kind: "text", value: "Cappr-hosted" },
    infra: { kind: "text", value: "Stays with you" },
  },
  {
    feature: "Ops & upgrades",
    none: { kind: "text", value: "N/A", muted: true },
    hosted: { kind: "text", value: "We handle" },
    infra: { kind: "text", value: "Your team" },
  },
];
