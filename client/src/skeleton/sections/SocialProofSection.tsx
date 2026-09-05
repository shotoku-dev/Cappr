import { Text } from "../wireframe";

const LOGOS = [
  "OpenAI",
  "Anthropic",
  "Stripe",
  "AWS",
  "Vercel",
  "LangChain",
] as const;

/** Trust strip — logos / credibility immediately under hero. */
export function SocialProofSection() {
  return (
    <section id="social-proof" className="wf-section wf-section--inset" data-section="social-proof">
      <div className="wf-section__label">Social proof</div>
      <div className="wf-container wf-stack" style={{ gap: "var(--spacing-space-6)" }}>
        <Text variant="caption" style={{ textAlign: "center" }}>
          Built for teams shipping agents against production APIs and payment rails
        </Text>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "var(--spacing-space-4) var(--spacing-space-7)",
          }}
        >
          {LOGOS.map((name) => (
            <span key={name} className="wf-pill">
              {name}
            </span>
          ))}
        </div>
        <Text variant="caption" style={{ textAlign: "center" }}>
          [ Replace with customer logos when available · or keep as stack/integration logos ]
        </Text>
      </div>
    </section>
  );
}
