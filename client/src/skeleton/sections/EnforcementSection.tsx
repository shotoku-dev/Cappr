import { Ladder, LadderStep, Placeholder, Split, SplitPane, Text } from "../wireframe";

const TIERS = [
  {
    tier: "01 · Observe",
    title: "See what would happen. Change nothing.",
    body: "Shadow mode evaluates every call against policy without blocking. Calibrate before you enforce.",
    scenario: "atlas-researcher would-have-required-approval → logged, allowed",
    active: true,
  },
  {
    tier: "02 · Nudge",
    title: "Warn the agent and its owner.",
    body: "Surface over-budget attempts without stopping the workflow. Signal before spend compounds.",
    scenario: "studio-render hits soft daily cap → warning + owner notified",
  },
  {
    tier: "03 · Approve",
    title: "Pause for a human.",
    body: "High-value actions land in Cappr's inbox. Nothing proceeds until someone decides.",
    scenario: "route-optimizer holds €1,200 until Yusuf approves",
  },
  {
    tier: "04 · Block",
    title: "Hard stop at the proxy.",
    body: "The gateway refuses the call. The agent cannot reach the provider — regardless of its code.",
    scenario: "off-scope Stripe charge → blocked, logged, owner alerted",
  },
] as const;

/** Feature deep-dive — graduated enforcement (product proof, not problem essay). */
export function EnforcementSection() {
  return (
    <section id="enforcement" className="wf-section wf-section--accent" data-section="enforcement">
      <div className="wf-section__label">Feature · Enforcement</div>
      <div className="wf-container">
        <Split ratio="2-3">
          <SplitPane>
            <Text variant="eyebrow">Graduated enforcement</Text>
            <Text as="h2" variant="h2">
              Start in shadow mode. Turn the dial when you're ready.
            </Text>
            <Text variant="lead">
              Most teams can't flip to hard blocks on day one. Cappr ratchets from observe → nudge →
              approve → block against real traffic.
            </Text>
            <Placeholder label="[ Shadow mode simulator — would-block count ]" aspect="16/9" compact />
          </SplitPane>
          <SplitPane>
            <Ladder label="Enforcement ladder">
              {TIERS.map((tier) => (
                <LadderStep key={tier.tier} {...tier} />
              ))}
            </Ladder>
          </SplitPane>
        </Split>
      </div>
    </section>
  );
}
