import { Block, Col, Row, Text } from "../wireframe";

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: ["Overview", "Firewall", "Ledger", "Studio", "Inbox", "Score", "Wallet", "Pricing"],
  },
  {
    heading: "Developers",
    links: ["Docs", "Open Source (Shotoku)", "SDK", "Proxy setup", "API reference", "Changelog"],
  },
  {
    heading: "Company",
    links: ["About", "Blog", "Careers", "Contact", "Terms", "Privacy"],
  },
  {
    heading: "Resources",
    links: ["Spend Explorer", "Case studies", "EU AI Act guide", "Security", "Status"],
  },
] as const;

/** Site footer — multi-column link grid. (ReadMe / Apollo footer pattern) */
export function FooterSection() {
  return (
    <footer id="footer" className="wf-section" data-section="footer">
      <div className="wf-section__label">Footer</div>
      <div className="wf-container wf-stack">
        <Row cols={5}>
          <Block label="Brand">
            <Col>
              <Text as="h3" variant="h3">
                Cappr
              </Text>
              <Text variant="caption">by Shotoku</Text>
              <Text variant="caption">Give your agents a budget, not your card.</Text>
            </Col>
          </Block>
          {FOOTER_COLUMNS.map(({ heading, links }) => (
            <Block key={heading} label={`Footer col — ${heading}`}>
              <Col>
                <Text as="h3" variant="h3">
                  {heading}
                </Text>
                {links.map((link) => (
                  <span key={link} className="wf-pill" style={{ width: "fit-content" }}>
                    {link}
                  </span>
                ))}
              </Col>
            </Block>
          ))}
        </Row>
        <div className="wf-divider" />
        <Row cols={2}>
          <Text variant="caption">© 2026 Shotoku. All rights reserved.</Text>
          <Text variant="caption" style={{ textAlign: "right" }}>
            Open-core · Hosted & self-hosted
          </Text>
        </Row>
      </div>
    </footer>
  );
}
