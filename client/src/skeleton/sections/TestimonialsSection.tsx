import { Callout, Row, Text } from "../wireframe";

/** Customer proof — quote placeholders until real logos/stories land. */
export function TestimonialsSection() {
  return (
    <section id="customers" className="wf-section wf-section--accent" data-section="customers">
      <div className="wf-section__label">Testimonials</div>
      <div className="wf-container wf-stack wf-stack--loose">
        <div className="wf-stack" style={{ gap: "var(--spacing-space-4)", maxWidth: "40rem" }}>
          <Text variant="eyebrow">Customers</Text>
          <Text as="h2" variant="h2">
            Proof from teams who can't afford runaway agents.
          </Text>
        </div>

        <Row cols={2}>
          <Callout label="Quote · placeholder">
            <Text variant="lead">
              “We stopped learning about agent spend from the OpenAI invoice. Cappr told us which
              agent, which night, and which policy was missing.”
            </Text>
            <Text variant="caption">[ Name ] · [ Title ] · [ Company ]</Text>
          </Callout>
          <Callout label="Quote · placeholder">
            <Text variant="lead">
              “Shadow mode let us see would-blocks for two weeks before we turned on approvals.
              Nothing broke in prod.”
            </Text>
            <Text variant="caption">[ Name ] · [ Title ] · [ Company ]</Text>
          </Callout>
        </Row>
      </div>
    </section>
  );
}
