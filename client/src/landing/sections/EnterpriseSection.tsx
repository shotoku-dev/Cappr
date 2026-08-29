import { Block, Text } from "../wireframe";

/** Enterprise value prop band. (Guild: "Make AI work for your enterprise") */
export function EnterpriseSection() {
  return (
    <section id="enterprise" className="wf-section" data-section="enterprise">
      <div className="wf-section__label">Enterprise</div>
      <div className="wf-container">
        <Block label="Enterprise value prop">
          <div className="wf-stack wf-center">
            <Text as="h2" variant="h2">
              Make AI spend work for your enterprise
            </Text>
            <Text variant="body">
              Break down silos, reduce waste, and drive AI adoption with the
              first platform designed to help teams use and control agents
              responsibly at scale.
            </Text>
            <span className="wf-btn">Talk to sales</span>
          </div>
        </Block>
      </div>
    </section>
  );
}
