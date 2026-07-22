import { useState, useEffect } from "react";
import { ApprovalQueue } from "./components/approval-queue";
import type { NudgeRequest } from "./types";

const genericRequests: NudgeRequest[] = [
  {
    id: "req-1",
    requester: "ci-pipeline",
    summary: "Merge feature/auth-refactor into main",
    detail:
      "All checks passed. This branch modifies the authentication middleware and removes legacy session handling.",
    requestedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    id: "req-2",
    requester: "ops-bot",
    summary: "Scale web-server replicas from 3 → 8",
    detail: "p95 latency has exceeded threshold for 5 consecutive minutes.",
    value: 8,
    constraint: { label: "max_replicas", limit: 10 },
    requestedAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
  },
  {
    id: "req-3",
    requester: "content-mod",
    summary: "Remove post #48291 from public feed",
    detail: "Flagged by 12 users. Automated classifier confidence: 94%.",
    requestedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
];

const agentSpendRequests: NudgeRequest[] = [
  {
    id: "spend-1",
    requester: "ops-agent",
    summary: "to AWS EMEA",
    detail: "Compute overage for the eu-west-1 batch cluster",
    value: 49.99,
    valuePrefix: "€",
    constraint: { label: "max_per_tx", limit: 30 },
    requestedAt: new Date(Date.now() - 24000).toISOString(),
  },
  {
    id: "spend-2",
    requester: "billing-agent",
    summary: "to Figma",
    detail: "Annual seat renewal for the design team workspace",
    value: 89.00,
    valuePrefix: "€",
    constraint: { label: "max_per_tx", limit: 30 },
    requestedAt: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: "spend-3",
    requester: "coding-agent",
    summary: "to Anthropic",
    detail: "API usage overage for the claude-sonnet-4-6 batch jobs",
    value: 25.79,
    valuePrefix: "€",
    constraint: { label: "max_per_tx", limit: 30 },
    requestedAt: new Date(Date.now() - 120000).toISOString(),
  },
];

type Page = "generic" | "agent-spend";

export default function App() {
  const [page, setPage] = useState<Page>("agent-spend");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div onClick={() => setPage("generic")} />
      <div onClick={() => setPage("agent-spend")} />

      <ApprovalQueue
        key={page}
        requests={page === "generic" ? genericRequests : agentSpendRequests}
        isLoading={isLoading}
        onApprove={(id, value) => console.log("approved", id, value)}
        onDeny={(id) => console.log("denied", id)}
        onModify={(id, val) => console.log("modified", id, val)}
      />
    </div>
  );
}
