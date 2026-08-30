import type { DecisionStatus } from "@cappr/shared";

interface Props {
  status: DecisionStatus;
}

export function StatusOverlay({ status }: Props) {
  if (status === "pending" || status === "resolving") return null;
  return <div data-cappr-overlay="status" data-status={status} />;
}
