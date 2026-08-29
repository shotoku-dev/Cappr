import { Block, Col, Row, Text } from "../wireframe";

const PAIN_POINTS = [
  {
    title: "Control every AI dollar",
    body: "See usage and spend by agent, team, model, and provider. Set budgets, forecast burn, and stop unexpected overages.",
  },
  {
    title: "Know every agent spending",
    body: "Catalog every governed agent — what it costs, who owns it, and whether it's behaving within policy.",
  },
  {
    title: "Secure every connection",
    body: "Route traffic through the enforcement proxy. Scope credentials, approve actions, and enforce graduated policy tiers.",
  },
] as const;

/** Problem framing — headline + 3 pain-point cards. (Guild: "agent control problem") */
export function ProblemSection() {
  return (
    <section id="problem" className="wf-section" data-section="problem">
      <div className="wf-section__label">Problem</div>
      <div className="wf-container wf-stack">
        <div className="wf-stack">
          <Text as="h2" variant="h2">
            Companies have an agent spend problem
          </Text>
          <Text variant="body">
            Everyone's deploying AI agents, but most teams still can't answer the
            basics: What are they spending? Who approved it? What happens when an
            agent retries in a loop and burns through budget overnight?
          </Text>
        </div>
        <Row cols={3}>
          {PAIN_POINTS.map(({ title, body }) => (
            <Block key={title} label="Pain point card">
              <Col>
                <Text as="h3" variant="h3">
                  {title}
                </Text>
                <Text variant="body">{body}</Text>
              </Col>
            </Block>
          ))}
        </Row>
      </div>
    </section>
  );
}
