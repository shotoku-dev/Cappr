import { Block, Col, Placeholder, Row, Text } from "../wireframe";

const MODULES = [
  {
    tab: "Firewall",
    title: "Graduated enforcement",
    body: "Observe, nudge, approve, or block — ratchet up enforcement as agents earn trust.",
  },
  {
    tab: "Ledger",
    title: "Tamper-evident audit trail",
    body: "Every call logged with policy outcome. Export-ready for compliance.",
  },
  {
    tab: "Studio",
    title: "Policy authoring",
    body: "YAML for developers, plain English for ops. Dry-run against historical traffic.",
  },
  {
    tab: "Inbox",
    title: "Human approval queue",
    body: "Actions that hit Approve tier pause until a human decides.",
  },
  {
    tab: "Score",
    title: "Agent trust tiering",
    body: "Agents earn autonomy over time; anomalies auto-demote.",
  },
] as const;

/** Platform showcase — tabbed feature explorer + module cards. (Guild: "Manage all your agents") */
export function PlatformSection() {
  return (
    <section id="platform" className="wf-section" data-section="platform">
      <div className="wf-section__label">Platform</div>
      <div className="wf-container wf-stack">
        <div className="wf-stack">
          <Text as="h2" variant="h2">
            Govern every agent dollar in one place
          </Text>
          <Text variant="body">
            You can't control what you can't see. Nudge is the dashboard on top
            of Shotoku's enforcement gateway — run, monitor, and govern all your
            agents from a single surface.
          </Text>
          <span className="wf-btn">Explore the dashboard →</span>
        </div>

        <Block label="Module tab bar">
          <div className="wf-tab-bar">
            {MODULES.map(({ tab }, i) => (
              <span key={tab} className={`wf-tab${i === 0 ? " wf-tab--active" : ""}`}>
                {tab}
              </span>
            ))}
            <span className="wf-tab">Wallet</span>
          </div>
        </Block>

        <Row cols={2}>
          <Col>
            <Block label="Active tab — copy">
              <Text as="h3" variant="h3">
                {MODULES[0].title}
              </Text>
              <Text variant="body">{MODULES[0].body}</Text>
              <span className="wf-btn">Learn more →</span>
            </Block>
          </Col>
          <Placeholder label="[ Active module UI — Firewall enforcement view ]" aspect="4/3" />
        </Row>

        <Row cols={5}>
          {MODULES.map(({ tab, title, body }) => (
            <Block key={tab} label={`Feature card — ${tab}`}>
              <Col>
                <Text as="h3" variant="h3">
                  {title}
                </Text>
                <Text variant="caption">{body}</Text>
                <span className="wf-btn">Learn more</span>
              </Col>
            </Block>
          ))}
        </Row>
      </div>
    </section>
  );
}
