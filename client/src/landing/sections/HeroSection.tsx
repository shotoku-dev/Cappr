import { Link } from "react-router-dom";
import { Block, Placeholder, Row, Text } from "../wireframe";

/** Hero — eyebrow, headline, subcopy, CTAs, product screenshot. (Guild + Mistral hero pattern) */
export function HeroSection() {
  return (
    <section id="hero" className="wf-section" data-section="hero">
      <div className="wf-section__label">Hero</div>
      <div className="wf-container wf-stack">
        <div className="wf-stack wf-center">
          <Text variant="eyebrow">The spend control plane for AI agents</Text>
          <Text as="h1" variant="h1">
            Give your agents a budget, not your card
          </Text>
          <Text variant="body">
            Nudge is the dashboard for Shotoku — route every agent call through
            enforcement, set policies, approve spend, and audit everything in one
            place.
          </Text>
          <Row cols={2}>
            <Link to="/dashboard" className="wf-btn wf-btn--primary">
              Start free trial
            </Link>
            <span className="wf-btn">Book a demo</span>
          </Row>
        </div>
        <Placeholder label="[ Product screenshot — Fleet Overview dashboard ]" tall />
        <Block label="Social proof strip">
          <Text variant="caption">Trusted by teams running agents in production</Text>
          <div className="wf-logo-strip" style={{ marginTop: "var(--spacing-space-4)" }}>
            {["Acme Labs", "Turo", "Sovrn", "WorkWhile", "Series B startup"].map((name) => (
              <span key={name} className="wf-logo-chip">
                {name}
              </span>
            ))}
          </div>
        </Block>
      </div>
    </section>
  );
}
