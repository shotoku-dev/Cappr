import { useApprovalQueue } from "../../hooks/useApprovalQueue";
import type { UseApprovalQueueOptions } from "../../types";
import { QueueItemExpanded } from "./QueueItemExpanded";
import { QueueItemCollapsed } from "./QueueItemCollapsed";

type Props = UseApprovalQueueOptions;

export function ApprovalQueue({
  requests,
  onApprove,
  onDeny,
  onModify,
  resolveDelayMs,
}: Props) {
  const {
    items,
    activeId,
    setActiveId,
    statuses,
    pendingValue,
    setPendingValue,
    approve,
    deny,
    modify,
  } = useApprovalQueue({ requests, onApprove, onDeny, onModify, resolveDelayMs });

  const activeItem = items.find((r) => r.id === activeId);
  const collapsedItems = items.filter((r) => r.id !== activeId);

  return (
    <div data-nudge="approval-queue">
      {activeItem && (
        <QueueItemExpanded
          key={activeItem.id}
          request={activeItem}
          status={statuses[activeItem.id] ?? "pending"}
          pendingValue={pendingValue[activeItem.id]}
          onApprove={() => approve(activeItem.id)}
          onDeny={() => deny(activeItem.id)}
          onModify={(val) => modify(activeItem.id, val)}
          onPendingValueChange={(val) => setPendingValue(activeItem.id, val)}
        />
      )}

      {collapsedItems.map((item, i) => (
        <QueueItemCollapsed
          key={item.id}
          request={item}
          index={i}
          onClick={() => setActiveId(item.id)}
        />
      ))}

      {items.length === 0 && <div data-nudge-state="empty" />}
    </div>
  );
}
