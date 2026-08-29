import { Block, Col, Row, Text } from "../wireframe";

const POSTS = [
  "Introducing the Shotoku enforcement proxy",
  "Graduated enforcement: observe → nudge → approve → block",
  "EU AI Act: your audit trail as compliance evidence",
  "From component library to control plane — why we pivoted",
] as const;

/** Blog / news — latest articles grid. (Guild: "The latest from Guild") */
export function BlogSection() {
  return (
    <section id="blog" className="wf-section" data-section="blog">
      <div className="wf-section__label">Blog</div>
      <div className="wf-container wf-stack">
        <Row cols={2}>
          <Text as="h2" variant="h2">
            The latest from Shotoku
          </Text>
          <span className="wf-btn" style={{ justifySelf: "end", alignSelf: "center" }}>
            View all articles →
          </span>
        </Row>
        <Row cols={4}>
          {POSTS.map((title) => (
            <Block key={title} label="Article card">
              <Col>
                <div
                  className="wf-placeholder"
                  data-aspect="16/9"
                  style={{ minHeight: 100, marginBottom: "var(--spacing-space-4)" }}
                >
                  [ Cover image ]
                </div>
                <Text as="h3" variant="h3">
                  {title}
                </Text>
                <Text variant="caption">Blog · 5 min read</Text>
              </Col>
            </Block>
          ))}
        </Row>
      </div>
    </section>
  );
}
