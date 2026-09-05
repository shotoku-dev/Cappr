import type { ReactNode } from "react";
import { Col, Row, Text } from "../wireframe";

const STEPS: { n: string; title: string; body: ReactNode }[] = [
  {
    n: "01",
    title: "Route traffic",
    body: (
      <>
        Point agents at{" "}
        <a
          href="https://shotoku.dev"
          className="wf-link-dotted"
          target="_blank"
          rel="noopener noreferrer"
        >
          Shotoku
        </a>
        &apos;s proxy. Every provider call — models, tools, payments — goes through Cappr.
      </>
    ),
  },
  {
    n: "02",
    title: "Set policy",
    body: "Budgets, allowlists, and approval thresholds per agent or fleet. Start in observe-only; ratchet when ready.",
  },
  {
    n: "03",
    title: "Enforce & audit",
    body: "Block, hold for approval, or log. Every decision lands in an immutable ledger humans can defend.",
  },
];

/** How it works — 3-step adoption path (reduces perceived complexity). */
export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="wf-section" data-section="how-it-works">
      <div className="wf-section__label">How it works</div>
      <div className="wf-container wf-stack wf-stack--loose">
        <div className="wf-stack" style={{ gap: "var(--spacing-space-4)", maxWidth: "42rem" }}>
          <Text variant="eyebrow">How it works</Text>
          <Text as="h2" variant="h2">
            Everything between the agent and the bill.
          </Text>
          <Text variant="lead">
            Cappr is the control plane: gateway, policy, human approval, and an audit trail that
            survives finance and security review.
          </Text>
          <Text variant="body">
            No SDK rewrite required to start. Proxy the traffic, calibrate in shadow mode, then turn on
            enforcement.
          </Text>
        </div>

        <Row cols={3}>
          {STEPS.map((step) => (
            <Col key={step.n}>
              <Text variant="eyebrow">{step.n}</Text>
              <Text as="h3" variant="h3">
                {step.title}
              </Text>
              <Text variant="body">{step.body}</Text>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
}
