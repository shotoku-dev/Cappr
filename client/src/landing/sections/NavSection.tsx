import { Link } from "react-router-dom";
import { Block, Row, Text } from "../wireframe";

/** Sticky nav — logo, primary links, auth CTAs. (Guild: top bar) */
export function NavSection() {
  return (
    <header className="wf-section" data-section="nav" style={{ paddingBlock: "var(--spacing-space-4)" }}>
      <div className="wf-section__label">Nav</div>
      <div className="wf-container">
        <Row cols={3}>
          <Block label="Logo">
            <Text as="span" variant="h3">
              Cappr
            </Text>
            <Text variant="caption">by Shotoku</Text>
          </Block>
          <Block label="Primary links">
            <Row cols={5}>
              <span className="wf-pill">Product ▾</span>
              <span className="wf-pill">Docs</span>
              <span className="wf-pill">Pricing</span>
              <span className="wf-pill">Open Source</span>
              <span className="wf-pill">Company ▾</span>
            </Row>
          </Block>
          <Block label="Auth CTAs">
            <Row cols={2}>
              <span className="wf-btn">Log in</span>
              <Link to="/dashboard" className="wf-btn wf-btn--primary">
                Start free trial
              </Link>
            </Row>
          </Block>
        </Row>
      </div>
    </header>
  );
}
