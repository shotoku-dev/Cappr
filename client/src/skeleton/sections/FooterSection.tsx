import { Col, Text } from "../wireframe";

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: ["How it works", "Enforcement", "Ledger", "Shadow mode", "Pricing"],
  },
  {
    heading: "Developers",
    links: ["Docs", "Proxy setup", "SDK", "API", "GitHub"],
  },
  {
    heading: "Company",
    links: ["About", "Blog", "Careers", "Security", "Contact"],
  },
] as const;

export function FooterSection() {
  return (
    <footer id="footer" className="wf-section wf-section--inset" data-section="footer">
      <div className="wf-section__label">Footer</div>
      <div className="wf-container wf-stack">
        <div className="wf-split" data-ratio="1-1">
          <div className="wf-split__pane">
            <Col>
              <Text as="h3" variant="h3">
                Cappr
              </Text>
              <Text variant="caption">by Shotoku</Text>
              <Text variant="caption">Give your agents a budget, not your card.</Text>
            </Col>
          </div>
          <div
            className="wf-split__pane"
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-space-6)" }}
          >
            {FOOTER_COLUMNS.map(({ heading, links }) => (
              <Col key={heading}>
                <Text as="h3" variant="h3">
                  {heading}
                </Text>
                {links.map((link) => (
                  <span key={link} className="wf-pill" style={{ width: "fit-content" }}>
                    {link}
                  </span>
                ))}
              </Col>
            ))}
          </div>
        </div>
        <div className="wf-divider" />
        <div className="wf-split" data-ratio="1-1" style={{ alignItems: "center" }}>
          <Text variant="caption">© 2026 Shotoku. All rights reserved.</Text>
          <Text variant="caption" style={{ textAlign: "right" }}>
            Open-core · Hosted & self-hosted
          </Text>
        </div>
      </div>
    </footer>
  );
}
