import "./skeleton.css";
import { EnforcementSection } from "./sections/EnforcementSection";
import { FinalCtaSection } from "./sections/FinalCtaSection";
import { FooterSection } from "./sections/FooterSection";
import { HeroSection } from "./sections/HeroSection";
import { HowItWorksSection } from "./sections/HowItWorksSection";
import { IntegrationsSection } from "./sections/IntegrationsSection";
import { NavSection } from "./sections/NavSection";
import { ProofSection } from "./sections/ProofSection";
import { SocialProofSection } from "./sections/SocialProofSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";

/**
 * Cappr landing skeleton — conversion wireframe at /skeleton.
 *
 * Structure derived from high-converting B2B SaaS homepages (Mobbin):
 * Nav → Hero → Social proof → How it works →
 * Feature deep-dives (enforcement, proof) → Integrations →
 * Testimonials → Final CTA → Footer
 *
 * Skips a dedicated "problem" section — hero carries the provocation;
 * product sections prove the solution.
 */
export function SkeletonPage() {
  return (
    <div className="wf-landing">
      <NavSection />
      <main>
        <HeroSection />
        <SocialProofSection />
        <HowItWorksSection />
        <EnforcementSection />
        <ProofSection />
        <IntegrationsSection />
        <TestimonialsSection />
        <FinalCtaSection />
      </main>
      <FooterSection />
    </div>
  );
}
