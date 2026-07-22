import { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApprovalQueue } from "../../hooks/useApprovalQueue";
import type { UseApprovalQueueOptions } from "../../types";
import { QueueItemExpanded } from "./QueueItemExpanded";

type Props = UseApprovalQueueOptions & { isLoading?: boolean };

export function ApprovalQueue({
  requests,
  onApprove,
  onDeny,
  onModify,
  resolveDelayMs,
  isLoading = false,
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

  // ID to activate once the current active item finishes collapsing.
  const pendingIdRef = useRef<string | null>(null);

  function handleClick(id: string) {
    if (id === activeId) return;
    if (activeId === null) {
      // Nothing to collapse — expand immediately. Drop any queued target so an
      // in-flight collapse can't re-activate a stale item later.
      pendingIdRef.current = null;
      setActiveId(id);
    } else {
      // Collapse current first; expand target when collapse completes.
      pendingIdRef.current = id;
      setActiveId(null);
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const idx = items.findIndex((item) => item.id === activeId);
        const nextIdx = e.key === "ArrowDown"
          ? Math.min(idx + 1, items.length - 1)
          : Math.max(idx - 1, 0);
        const target = items[nextIdx];
        if (target && target.id !== activeId) handleClick(target.id);
        return;
      }

      if (!activeId) return;
      if (e.key === "a" || e.key === "A") approve(activeId);
      if (e.key === "d" || e.key === "D") deny(activeId);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [items, activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCollapseComplete() {
    if (pendingIdRef.current !== null) {
      setActiveId(pendingIdRef.current);
      pendingIdRef.current = null;
    }
  }

  return (
    <div data-nudge="approval-queue" className="w-fit flex flex-col" style={{ gap: "8px" }}>
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout="position"
            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <QueueItemExpanded
              request={item}
              isActive={item.id === activeId}
              status={statuses[item.id] ?? "pending"}
              isLoading={isLoading}
              pendingValue={pendingValue[item.id]}
              onClick={() => handleClick(item.id)}
              onCollapseComplete={handleCollapseComplete}
              onApprove={() => approve(item.id)}
              onDeny={() => deny(item.id)}
              onModify={(val) => modify(item.id, val)}
              onPendingValueChange={(val) => setPendingValue(item.id, val)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {items.length === 0 && <div data-nudge-state="empty" />}
    </div>
  );
}
