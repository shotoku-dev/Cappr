export type DecisionStatus = "pending" | "resolving" | "success-approved" | "success-denied" | "approved" | "denied";

export interface Meter {
  value: number;
  limit: number;
  prefix?: string;
}

export interface NudgeRequest {
  id: string;
  requester: string;
  summary: string;
  detail?: string;
  value?: number;
  valuePrefix?: string;
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

export interface AuditEntry {
  request: NudgeRequest;
  status: "approved" | "denied";
  resolvedAt: string;
  resolvedValue?: number;
  hash?: string;
}

export interface AgentPolicy {
  agent: string;
  autoApproveBelow: number;
  requireApprovalAbove: number;
  autoApproveEnabled: boolean;
  auditLocked: boolean;
}

export interface Policy {
  budgetLimit: number;
  budgetPrefix: string;
  agents: AgentPolicy[];
}

export interface UseApprovalQueueReturn {
  items: NudgeRequest[];
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  statuses: Record<string, DecisionStatus>;
  pendingValue: Record<string, number>;
  setPendingValue: (id: string, value: number) => void;
  validate: (id: string, value: number) => ValidationResult;
  approve: (id: string) => void;
  deny: (id: string) => void;
  modify: (id: string, newValue: number) => ValidationResult;
}
