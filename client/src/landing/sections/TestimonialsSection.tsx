import { Block, Col, Row, Text } from "../wireframe";

const QUOTES = [
  {
    quote:
      "Shotoku gave us the visibility we were missing — a single place to see what our agents spend and what they can access.",
    name: "Engineering lead",
    company: "Series B startup",
  },
  {
    quote:
      "We needed enforcement that wasn't honor-system. The proxy gateway is what made the audit trail actually trustworthy.",
    name: "CTO",
    company: "EU fintech",
  },
  {
    quote:
      "Graduated enforcement let us start in observe mode. We saw what would have been blocked before turning anything on in prod.",
    name: "Head of Platform",
    company: "Marketplace company",
  },
] as const;

/** Social proof — customer quotes grid. (Guild + Hex testimonial pattern) */
export function TestimonialsSection() {
  return (
    <section id="testimonials" className="wf-section" data-section="testimonials">
      <div className="wf-section__label">Testimonials</div>
      <div className="wf-container wf-stack">
        <Text as="h2" variant="h2">
          Don't just take our word for it
        </Text>
        <Text variant="body">
          How engineering teams deploy Nudge and Shotoku across research agents,
          support bots, and internal tools.
        </Text>
        <Row cols={3}>
          {QUOTES.map(({ quote, name, company }) => (
            <Block key={company} label="Testimonial card">
              <Col>
                <span className="wf-logo-chip">{company}</span>
                <p className="wf-quote">"{quote}"</p>
                <Text variant="caption">
                  — {name}, {company}
                </Text>
              </Col>
            </Block>
          ))}
        </Row>
      </div>
    </section>
  );
}
