export function LandingSectionBand() {
  return (
    <div className="landing-section__band-row landing-grid">
      <div className="landing-grid__gutter landing-dither-sync__mask" aria-hidden />
      <div className="landing-section__band" aria-hidden />
      <div className="landing-grid__gutter landing-dither-sync__mask" aria-hidden />
    </div>
  );
}

export function LandingSection() {
  return (
    <section className="landing-section">
      <LandingSectionBand />
      <div className="landing-section__body" />
    </section>
  );
}
