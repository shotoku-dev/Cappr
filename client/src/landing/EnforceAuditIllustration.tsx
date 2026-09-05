import SingleAgentIcon from "../assets/icons/Single Agent Icon.svg?react";
import "./enforce-audit-illus.css";

const PAST_ENTRIES = [
  {
    time: "13:42",
    hash: "b8e4",
    verdict: "approved",
    requester: "data-enricher",
    amount: "€18.40",
  },
  {
    time: "13:58",
    hash: "7c91",
    verdict: "denied",
    requester: "market-scanner",
    amount: "€31.20",
  },
  {
    time: "14:02",
    hash: "a3f2",
    verdict: "approved",
    requester: "agent-alpha",
    amount: "€84.00",
  },
] as const;

function AgentScope({ id }: { id: string }) {
  return (
    <span className="enforce-audit-illus__scope">
      <SingleAgentIcon width={16} height={16} aria-hidden />
      {id}
    </span>
  );
}

export function EnforceAuditIllustration() {
  return (
    <div
      className="enforce-audit-illus"
      role="img"
      aria-label="Audit trail of recorded approve and deny decisions with one pending request"
    >
      <div className="enforce-audit-illus__trail" aria-hidden>
        {PAST_ENTRIES.map((entry) => (
          <div key={entry.hash} className="enforce-audit-illus__entry enforce-audit-illus__entry--past">
            <span className="enforce-audit-illus__time">{entry.time}</span>
            <div className="enforce-audit-illus__entry-body">
              <AgentScope id={entry.requester} />
              <span
                className={`enforce-audit-illus__verdict enforce-audit-illus__verdict--${entry.verdict}`}
              >
                {entry.verdict}
                <span className="enforce-audit-illus__hash">{entry.hash}</span>
              </span>
            </div>
            <span className="enforce-audit-illus__amount">{entry.amount}</span>
          </div>
        ))}

        <div className="enforce-audit-illus__entry enforce-audit-illus__entry--pending">
          <span className="enforce-audit-illus__time">now</span>
          <div className="enforce-audit-illus__entry-body">
            <AgentScope id="atlas-researcher" />
            <span className="enforce-audit-illus__meta">over threshold</span>
          </div>
          <span className="enforce-audit-illus__amount">€512.00</span>
        </div>
      </div>
    </div>
  );
}
