import { IsoDottedCube } from "./IsoDottedCube";
import { LandingCtas } from "./LandingCtas";

export function LandingHero() {
  return (
    <section className="landing-hero landing-grid" aria-labelledby="landing-hero-title">
      <div className="landing-hero__gutter landing-grid__gutter" aria-hidden />
      <div className="landing-hero__frame">
        <div className="landing-hero__layout">
          <div className="landing-hero__copy">
            <h1 id="landing-hero-title" className="landing-hero__title">
              Give your agents a budget,
              <br />
              not your card.
            </h1>
            <p className="landing-hero__subtitle">
              Cappr gives platform and finance teams real-time command of autonomous agent spend — before
              money moves, not after the invoice.
            </p>
            <LandingCtas className="landing-hero__ctas" />
          </div>
          <div className="landing-hero__visual">
            <IsoDottedCube className="landing-hero__cube" />
          </div>
        </div>
      </div>
      <div className="landing-hero__gutter landing-grid__gutter" aria-hidden />
    </section>
  );
}
