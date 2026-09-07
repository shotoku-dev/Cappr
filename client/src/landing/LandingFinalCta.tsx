import { LandingWaitlistForm } from "./LandingWaitlistForm";
import "./final-cta.css";

export function LandingFinalCta() {
  return (
    <section
      id="early-access"
      className="landing-final-cta landing-grid"
      aria-labelledby="landing-final-cta-title"
    >
      <div className="landing-grid__gutter" aria-hidden />
      <div className="landing-final-cta__frame">
        <h2 id="landing-final-cta-title" className="landing-final-cta__title">
          Put a ceiling on agent spend{" "}
          <br />
          before the next invoice.
        </h2>
        <p className="landing-final-cta__lead">
          Leave your work email and we’ll reach out as access opens — observe
          every model, tool, and payment call before you enforce a single budget.
        </p>
        <LandingWaitlistForm variant="inline" className="landing-final-cta__form" />
      </div>
      <div className="landing-grid__gutter" aria-hidden />
    </section>
  );
}
