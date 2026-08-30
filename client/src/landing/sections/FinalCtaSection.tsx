import { Link } from "react-router-dom";
import { Block, Text } from "../wireframe";

/** Final conversion band. (Guild: "Run. Control. Transform") */
export function FinalCtaSection() {
  return (
    <section id="final-cta" className="wf-section" data-section="final-cta">
      <div className="wf-section__label">Final CTA</div>
      <div className="wf-container">
        <Block label="Closing CTA">
          <div className="wf-stack wf-center">
            <Text as="h2" variant="h2">
              Run. Control. Transform with Cappr.
            </Text>
            <Text variant="body">See Cappr in action — start free or book a walkthrough.</Text>
            <div style={{ display: "flex", gap: "var(--spacing-space-4)" }}>
              <Link to="/dashboard" className="wf-btn wf-btn--primary">
                Start free trial
              </Link>
              <span className="wf-btn">Explore docs</span>
            </div>
          </div>
        </Block>
      </div>
    </section>
  );
}
