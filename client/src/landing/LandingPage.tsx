import "./landing.css";
import { LandingBanner } from "./LandingBanner";
import { LandingDitherField } from "./LandingDitherField";
import { LandingHero } from "./LandingHero";
import { LandingNav } from "./LandingNav";
import { LandingEnforcementSection } from "./LandingEnforcementSection";
import { LandingProcessSection } from "./LandingProcessSection";
import { LandingSectionBand } from "./LandingSection";
import { LandingOpenCoreSection } from "./LandingOpenCoreSection";
import { LandingIntegrationsSection } from "./LandingIntegrationsSection";
import { LandingFinalCta } from "./LandingFinalCta";
import { LandingFooter } from "./LandingFooter";

/** Cappr marketing landing — real page at /. */
export function LandingPage() {
  return (
    <div className="landing-page min-h-dvh font-sans">
      <header className="landing-header">
        <LandingBanner />
        <LandingNav />
      </header>
      <main>
        <div className="landing-dither-sync">
          <LandingDitherField />
          <LandingHero />
          <LandingSectionBand />
        </div>
        <LandingProcessSection />
        <LandingEnforcementSection />
        <LandingOpenCoreSection />
        <LandingIntegrationsSection />
        <div className="landing-dither-sync">
          <LandingDitherField />
          <LandingSectionBand />
          <LandingFinalCta />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
