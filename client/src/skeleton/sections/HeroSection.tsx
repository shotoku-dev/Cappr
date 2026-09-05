import { Link } from "react-router-dom";
import { Placeholder, Split, SplitPane, Text } from "../wireframe";

/** Hero — outcome headline, dual CTA, product visual. */
export function HeroSection() {
  return (
    <section id="hero" className="wf-section" data-section="hero">
      <div className="wf-section__label">Hero</div>
      <div className="wf-container wf-stack wf-stack--loose">
        <Split ratio="5-7">
          <SplitPane>
            <Text variant="eyebrow">Agent spend control</Text>
            <Text as="h1" variant="h1">
              Give your agents a budget, not your card.
            </Text>
            <Text variant="lead">
              Cappr routes every agent call through enforcement — set policies, approve exceptions,
              and audit spend before the invoice arrives.
            </Text>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-space-4)" }}>
              <Link to="/dashboard" className="wf-btn wf-btn--primary">
                Start free — shadow mode
              </Link>
              <a href="#book-demo" className="wf-btn">
                Book a demo
              </a>
            </div>
            <Text variant="caption">Observe-only to start · No card required · Open-core</Text>
          </SplitPane>
          <SplitPane>
            <Placeholder label="[ Product UI — fleet overview / live spend + policy outcomes ]" aspect="16/10" />
          </SplitPane>
        </Split>
      </div>
    </section>
  );
}
