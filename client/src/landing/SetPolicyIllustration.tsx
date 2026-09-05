import SingleAgentIcon from "../assets/icons/Single Agent Icon.svg?react";
import "./set-policy-illus.css";

const POLICY_ROWS = [
  {
    scope: "data-enricher",
    budget: "€500/mo",
    allowlist: "8 tools",
    threshold: "€50",
  },
  {
    scope: "agent-alpha",
    budget: "€200/mo",
    allowlist: "4 tools",
    threshold: "€25",
  },
] as const;

function AgentScope({ id }: { id: string }) {
  return (
    <span className="set-policy-illus__scope">
      <SingleAgentIcon width={16} height={16} aria-hidden />
      {id}
    </span>
  );
}

export function SetPolicyIllustration() {
  return (
    <div
      className="set-policy-illus"
      role="img"
      aria-label="Policy table as definition lists with fields nested under each agent"
    >
      <div className="set-policy-illus__table" aria-hidden>
        {POLICY_ROWS.map((row) => (
          <div key={row.scope} className="set-policy-illus__def-block">
            <AgentScope id={row.scope} />
            <div className="set-policy-illus__def-list">
              <div className="set-policy-illus__def-item">
                <span>Budget</span>
                <strong>{row.budget}</strong>
              </div>
              <div className="set-policy-illus__def-item">
                <span>Allowlist</span>
                <strong>{row.allowlist}</strong>
              </div>
              <div className="set-policy-illus__def-item">
                <span>Threshold</span>
                <strong>{row.threshold}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
