import { Block, Col, Placeholder, Row, Text } from "../wireframe";

const BULLETS = [
  {
    title: "Every provider in one view",
    body: "Pull Anthropic, OpenAI, and tool billing into a single daily spend series.",
  },
  {
    title: "Spend segmented automatically",
    body: "Sort by model, provider, team, or agent — find the workload that drove the bill.",
  },
  {
    title: "Read-only by design",
    body: "Connect billing APIs with scoped, read-only keys. No card required. Two minutes.",
  },
] as const;

/** Lead magnet — free spend audit tool. (Guild: "AI Spend Explorer") */
export function SpendExplorerSection() {
  return (
    <section id="spend-explorer" className="wf-section" data-section="spend-explorer">
      <div className="wf-section__label">Lead magnet</div>
      <div className="wf-container wf-stack">
        <div className="wf-stack wf-center">
          <Text variant="eyebrow">Introducing Agent Spend Explorer</Text>
          <Text as="h2" variant="h2">
            Are your agents overspending? Find out in minutes.
          </Text>
          <Text variant="body">
            Get a free instant breakdown of usage and spend across models,
            providers, teams, and agents — and see where you can optimize costs.
          </Text>
          <span className="wf-btn wf-btn--primary">See your spend</span>
          <Text variant="caption">Read-only · No card · Two minutes</Text>
        </div>

        <Placeholder label="[ Interactive spend breakdown — charts + agent table ]" tall />

        <Row cols={3}>
          {BULLETS.map(({ title, body }) => (
            <Block key={title} label="Value prop">
              <Col>
                <Text as="h3" variant="h3">
                  {title}
                </Text>
                <Text variant="caption">{body}</Text>
              </Col>
            </Block>
          ))}
        </Row>
      </div>
    </section>
  );
}
