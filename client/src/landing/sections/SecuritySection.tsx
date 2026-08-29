import { Block, Col, Row, Text } from "../wireframe";

const BADGES = ["SOC 2", "GDPR", "EU AI Act ready", "ISO 27001"] as const;

const SECURITY_FEATURES = [
  {
    title: "Security & data privacy",
    items: [
      "No training on your data",
      "SAML, SSO & SCIM",
      "Data encrypted at rest and in transit",
      "Self-hosted enterprise option",
    ],
  },
  {
    title: "Advanced admin controls",
    items: [
      "Org-level budgets & policies",
      "Role-based access (Owner / Approver / Viewer)",
      "API access for custom integrations",
      "Audit export & compliance reports",
    ],
  },
  {
    title: "Enterprise support",
    items: [
      "Dedicated success team & SLA",
      "On-prem / EU data residency",
      "Policy migration & onboarding",
      "Priority support channel",
    ],
  },
] as const;

/** Security & compliance — badges + feature columns. (Guild: enterprise security section) */
export function SecuritySection() {
  return (
    <section id="security" className="wf-section" data-section="security">
      <div className="wf-section__label">Security</div>
      <div className="wf-container wf-stack">
        <div className="wf-stack wf-center">
          <Text as="h2" variant="h2">
            Enterprise-grade security for your agents
          </Text>
          <div className="wf-logo-strip">
            {BADGES.map((badge) => (
              <span key={badge} className="wf-pill">
                {badge}
              </span>
            ))}
          </div>
        </div>
        <Row cols={3}>
          {SECURITY_FEATURES.map(({ title, items }) => (
            <Block key={title} label="Security column">
              <Col>
                <Text as="h3" variant="h3">
                  {title}
                </Text>
                <ul style={{ margin: 0, paddingLeft: "1.2em", color: "var(--color-neutral-500)", fontSize: 13 }}>
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Col>
            </Block>
          ))}
        </Row>
      </div>
    </section>
  );
}
