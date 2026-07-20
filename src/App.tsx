import { useState } from "react";
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
    summary: "€49.99 to AWS EMEA — Reserved Instance",
    detail:
      "Purchasing a 1-year reserved t3.medium for the staging environment. Projected savings vs on-demand: 38%.",
    value: 49.99,
    constraint: { label: "max_per_tx", limit: 30 },
    requestedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: "spend-2",
    requester: "ops-agent",
    summary: "€12.00 to Datadog — Log retention extension",
    detail: "Extending log retention from 7 to 30 days for compliance audit.",
    value: 12,
    constraint: { label: "max_per_tx", limit: 30 },
    requestedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: "spend-3",
    requester: "infra-agent",
    summary: "€8.50 to Cloudflare — Additional WAF rules",
    value: 8.5,
    constraint: { label: "max_per_tx", limit: 30 },
    requestedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];

type Page = "generic" | "agent-spend";

export default function App() {
  const [page, setPage] = useState<Page>("generic");

  return (
    <div>
      <div onClick={() => setPage("generic")} />
      <div onClick={() => setPage("agent-spend")} />

      <ApprovalQueue
        key={page}
        requests={page === "generic" ? genericRequests : agentSpendRequests}
        onApprove={(id, value) => console.log("approved", id, value)}
        onDeny={(id) => console.log("denied", id)}
        onModify={(id, val) => console.log("modified", id, val)}
      />
    </div>
  );
}
