import "./landing.css";
import { BlogSection } from "./sections/BlogSection";
import { EnterpriseSection } from "./sections/EnterpriseSection";
import { FinalCtaSection } from "./sections/FinalCtaSection";
import { FooterSection } from "./sections/FooterSection";
import { HeroSection } from "./sections/HeroSection";
import { IntegrationsSection } from "./sections/IntegrationsSection";
import { NavSection } from "./sections/NavSection";
import { PlatformSection } from "./sections/PlatformSection";
import { ProblemSection } from "./sections/ProblemSection";
import { SecuritySection } from "./sections/SecuritySection";
import { SpendExplorerSection } from "./sections/SpendExplorerSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";

/**
 * Landing page wireframe — structure only.
 *
 * Section order mirrors guild.ai (adjacent competitor) adapted for Nudge/Shotoku:
 * Nav → Hero → Problem → Platform → Lead magnet → Enterprise → Integrations
 * → Testimonials → Blog → Security → Final CTA → Footer
 */
export function LandingPage() {
  return (
    <div className="wf-landing">
      <NavSection />
      <main>
        <HeroSection />
        <ProblemSection />
        <PlatformSection />
        <SpendExplorerSection />
        <EnterpriseSection />
        <IntegrationsSection />
        <TestimonialsSection />
        <BlogSection />
        <SecuritySection />
        <FinalCtaSection />
      </main>
      <FooterSection />
    </div>
  );
}
