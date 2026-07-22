import { useState, useCallback } from "react";
import type {
  UseApprovalQueueOptions,
  UseApprovalQueueReturn,
  DecisionStatus,
  ValidationResult,
} from "../types";

export function useApprovalQueue({
  requests,
  onApprove,
  onDeny,
  onModify,
  resolveDelayMs = 1000,
}: UseApprovalQueueOptions): UseApprovalQueueReturn {
  const [activeId, setActiveId] = useState<string | null>(
    requests[0]?.id ?? null
  );
  const [statuses, setStatuses] = useState<Record<string, DecisionStatus>>({});
  const [pendingValue, setPendingValueState] = useState<Record<string, number>>(
    {}
  );
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const items = requests.filter((r) => !removedIds.has(r.id));

  const validate = useCallback(
    (id: string, value: number): ValidationResult => {
      const request = requests.find((r) => r.id === id);
      if (!request?.constraint) return { valid: true };
      if (value > request.constraint.limit) {
        return {
          valid: false,
          reason: `Exceeds ${request.constraint.label} limit of ${request.constraint.limit}`,
        };
      }
      return { valid: true };
    },
    [requests]
  );

  const resolveItem = useCallback(
    (id: string, finalStatus: "approved" | "denied") => {
      setStatuses((prev) => ({ ...prev, [id]: "resolving" }));

      setTimeout(() => {
        setStatuses((prev) => ({ ...prev, [id]: finalStatus === "approved" ? "success-approved" : "success-denied" }));

        setTimeout(() => {
          setStatuses((prev) => ({ ...prev, [id]: finalStatus }));
          setRemovedIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
          });
          setActiveId((currentActive) => {
            if (currentActive !== id) return currentActive;
            const remaining = requests.filter(
              (r) => !removedIds.has(r.id) && r.id !== id
            );
            return remaining[0]?.id ?? null;
          });
        }, 650);
      }, resolveDelayMs);
    },
    [requests, removedIds, resolveDelayMs]
  );

  const approve = useCallback(
    (id: string) => {
      const current = pendingValue[id];
      const request = requests.find((r) => r.id === id);
      const effectiveValue = current ?? request?.value;
      onApprove(id, effectiveValue);
      resolveItem(id, "approved");
    },
    [pendingValue, requests, onApprove, resolveItem]
  );

  const deny = useCallback(
    (id: string) => {
      onDeny(id);
      resolveItem(id, "denied");
    },
    [onDeny, resolveItem]
  );

  const modify = useCallback(
    (id: string, newValue: number): ValidationResult => {
      const result = validate(id, newValue);
      if (!result.valid) return result;
      setPendingValueState((prev) => ({ ...prev, [id]: newValue }));
      onModify?.(id, newValue);
      return { valid: true };
    },
    [validate, onModify]
  );

  const setPendingValue = useCallback((id: string, value: number) => {
    setPendingValueState((prev) => ({ ...prev, [id]: value }));
  }, []);

  return {
    items,
    activeId,
    setActiveId,
    statuses,
    pendingValue,
    setPendingValue,
    validate,
    approve,
    deny,
    modify,
  };
}
