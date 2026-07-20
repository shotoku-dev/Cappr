export type DecisionStatus = "pending" | "approved" | "denied";

export interface NudgeRequest {
  id: string;
  requester: string;
  summary: string;
  detail?: string;
  value?: number;
  constraint?: {
    label: string;
    limit: number;
  };
  requestedAt: string;
}

export interface UseApprovalQueueOptions {
  requests: NudgeRequest[];
  onApprove: (id: string, value?: number) => void | Promise<void>;
  onDeny: (id: string) => void | Promise<void>;
  onModify?: (id: string, newValue: number) => void | Promise<void>;
  resolveDelayMs?: number;
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; reason: string };

export interface UseApprovalQueueReturn {
  items: NudgeRequest[];
  activeId: string | null;
  setActiveId: (id: string) => void;
  statuses: Record<string, DecisionStatus>;
  pendingValue: Record<string, number>;
  setPendingValue: (id: string, value: number) => void;
  validate: (id: string, value: number) => ValidationResult;
  approve: (id: string) => void;
  deny: (id: string) => void;
  modify: (id: string, newValue: number) => ValidationResult;
}
