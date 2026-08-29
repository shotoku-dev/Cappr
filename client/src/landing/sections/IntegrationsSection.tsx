import { Block, Col, Row, Text } from "../wireframe";

const MODELS = [
  "Anthropic",
  "OpenAI",
  "Gemini",
  "Mistral",
  "DeepSeek",
  "Perplexity",
  "Groq",
  "Azure OpenAI",
];

const TOOLS = [
  "Slack",
  "GitHub",
  "Linear",
  "Jira",
  "Notion",
  "Stripe",
  "AWS",
  "LangChain",
];

/** Stack / integrations — models + tools logo grids. (Guild: "Your Stack. One Control Plane") */
export function IntegrationsSection() {
  return (
    <section id="integrations" className="wf-section" data-section="integrations">
      <div className="wf-section__label">Integrations</div>
      <div className="wf-container wf-stack">
        <div className="wf-stack wf-center">
          <Text as="h2" variant="h2">
            Your agents. Your stack. One control plane.
          </Text>
          <Text variant="body">
            Keep the models, frameworks, and tools your teams already use. Shotoku
            sits in front of them — no migrations, no vendor lock-in.
          </Text>
          <span className="wf-btn">Explore integrations →</span>
        </div>

        <Row cols={2}>
          <Block label="Models grid">
            <Col>
              <Text as="h3" variant="h3">
                Models
              </Text>
              <Text variant="caption">
                Route and meter spend across any LLM provider.
              </Text>
              <div className="wf-logo-strip">
                {MODELS.map((name) => (
                  <span key={name} className="wf-logo-chip">
                    {name}
                  </span>
                ))}
              </div>
            </Col>
          </Block>
          <Block label="Tools grid">
            <Col>
              <Text as="h3" variant="h3">
                Tools & APIs
              </Text>
              <Text variant="caption">
                Govern tool calls and payment rails your agents already hit.
              </Text>
              <div className="wf-logo-strip">
                {TOOLS.map((name) => (
                  <span key={name} className="wf-logo-chip">
                    {name}
                  </span>
                ))}
              </div>
            </Col>
          </Block>
        </Row>
      </div>
    </section>
  );
}
