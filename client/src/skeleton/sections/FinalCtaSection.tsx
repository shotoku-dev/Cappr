import { Link } from "react-router-dom";
import { Text } from "../wireframe";

/** Closing CTA — dual path before footer. */
export function FinalCtaSection() {
  return (
    <section id="book-demo" className="wf-section" data-section="final-cta">
      <div className="wf-section__label">Final CTA</div>
      <div className="wf-container" style={{ textAlign: "center" }}>
        <div
          className="wf-stack"
          style={{ gap: "var(--spacing-space-5)", alignItems: "center", maxWidth: "36rem", marginInline: "auto" }}
        >
          <Text variant="eyebrow">Get started</Text>
          <Text as="h2" variant="h2" style={{ maxWidth: "18ch" }}>
            Put a budget on every agent this week.
          </Text>
          <Text variant="lead" style={{ textAlign: "center" }}>
            Start in shadow mode for free, or book a walkthrough with the team.
          </Text>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-space-4)", justifyContent: "center" }}>
            <Link to="/dashboard" className="wf-btn wf-btn--primary">
              Start free
            </Link>
            <a href="mailto:hello@shotoku.dev" className="wf-btn">
              Book a demo
            </a>
          </div>
          <Text variant="caption">No card · Observe-only default · Open-core</Text>
        </div>
      </div>
    </section>
  );
}
