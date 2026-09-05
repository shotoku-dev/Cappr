import { Placeholder, Split, SplitPane, Text } from "../wireframe";

/** Feature deep-dive — audit / ledger proof. */
export function ProofSection() {
  return (
    <section id="proof" className="wf-section" data-section="proof">
      <div className="wf-section__label">Feature · Proof</div>
      <div className="wf-container">
        <Split ratio="3-2" reverse>
          <SplitPane>
            <Placeholder label="[ Immutable ledger — agent · policy · approver · hash ]" aspect="16/10" />
          </SplitPane>
          <SplitPane>
            <Text variant="eyebrow">Audit trail</Text>
            <Text as="h2" variant="h2">
              When finance asks what happened, you have more than a total.
            </Text>
            <Text variant="lead">
              Cappr records which agent spent, which policy fired, who approved an override, and
              whether the log was tampered with — so the invoice is explainable.
            </Text>
            <ul className="wf-detail-list">
              <li>
                <span className="wf-detail-list__key">Agent</span>
                <span className="wf-detail-list__val">atlas-researcher</span>
              </li>
              <li>
                <span className="wf-detail-list__key">Policy</span>
                <span className="wf-detail-list__val">daily-cap · would-block</span>
              </li>
              <li>
                <span className="wf-detail-list__key">Approver</span>
                <span className="wf-detail-list__val">never required @ observe</span>
              </li>
              <li>
                <span className="wf-detail-list__key">Integrity</span>
                <span className="wf-detail-list__val">hash-chained · exportable</span>
              </li>
            </ul>
          </SplitPane>
        </Split>
      </div>
    </section>
  );
}
