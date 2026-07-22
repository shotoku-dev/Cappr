import { motion } from "framer-motion";
import type { NudgeRequest } from "../../types";

interface Props {
  request: NudgeRequest;
  index: number;
  onClick: () => void;
}

export function QueueItemCollapsed({ request, onClick }: Props) {
  return (
    <motion.div
      data-nudge-item="collapsed"
      onClick={onClick}
      className="flex items-center justify-between cursor-pointer bg-surface-app w-[300px]"
      style={{
        borderRadius: "12px",
        border: "0.5px solid var(--color-border-subtle)",
        padding: "10px 20px",
      }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
    >
      <span
        data-nudge-field="requester"
        className="text-base font-normal text-text-primary"
      >
        {request.requester}
      </span>
      <span
        data-nudge-field="summary"
        className="text-base font-medium text-text-muted"
      >
        {request.valuePrefix}{request.value} {request.summary}
      </span>
    </motion.div>
  );
}
