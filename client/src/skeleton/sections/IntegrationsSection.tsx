import { Col, Placeholder, Row, Text } from "../wireframe";

const STACK = [
  { title: "LLM providers", items: "OpenAI · Anthropic · Azure · Bedrock" },
  { title: "Agent runtimes", items: "LangChain · CrewAI · custom workers" },
  { title: "Payment & tools", items: "Stripe · internal APIs · tool calls" },
  { title: "Deploy", items: "Hosted Cappr · self-host Shotoku proxy" },
] as const;

/** Integrations / stack fit — where Cappr sits in the stack. */
export function IntegrationsSection() {
  return (
    <section id="integrations" className="wf-section" data-section="integrations">
      <div className="wf-section__label">Integrations</div>
      <div className="wf-container wf-stack wf-stack--loose">
        <div className="wf-stack" style={{ gap: "var(--spacing-space-4)", maxWidth: "40rem" }}>
          <Text variant="eyebrow">Fits your stack</Text>
          <Text as="h2" variant="h2">
            One proxy. The tools you already use.
          </Text>
          <Text variant="lead">
            Cappr doesn't replace your agent framework. It sits in front of the providers and rails
            those agents already call.
          </Text>
        </div>

        <Row cols={4}>
          {STACK.map((col) => (
            <Col key={col.title}>
              <Text as="h3" variant="h3">
                {col.title}
              </Text>
              <Text variant="caption">{col.items}</Text>
            </Col>
          ))}
        </Row>

        <Placeholder label="[ Integration / architecture diagram ]" aspect="21/9" compact />
      </div>
    </section>
  );
}
