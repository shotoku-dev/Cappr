import type { NudgeRequest } from "../../types";

interface Props {
  request: NudgeRequest;
  index: number;
  onClick: () => void;
}

export function QueueItemCollapsed({ onClick }: Props) {
  return (
    <div data-nudge-item="collapsed" onClick={onClick}>
      <span data-nudge-field="requester" />
      <span data-nudge-field="summary" />
      <span data-nudge-field="requested-at" />
    </div>
  );
}
