import type { DecisionStatus } from "../../types";

interface Props {
  status: DecisionStatus;
}

export function StatusOverlay({ status }: Props) {
  if (status === "pending" || status === "resolving") return null;
  return <div data-nudge-overlay="status" data-status={status} />;
}
