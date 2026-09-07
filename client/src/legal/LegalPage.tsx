import { useEffect, type ReactNode } from "react";
import { LandingBanner } from "../landing/LandingBanner";
import { LandingNav } from "../landing/LandingNav";
import { LandingFooter } from "../landing/LandingFooter";
import "../landing/landing.css";
import "./legal.css";

type LegalPageProps = {
  title: string;
  updated: string;
  children: ReactNode;
};

/** Legal pages reuse the landing shell — same nav and footer, minimalist
 *  left-aligned prose in the shared content grid. */
export function LegalPage({ title, updated, children }: LegalPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="landing-page legal-page min-h-dvh font-sans">
      <header className="landing-header">
        <LandingBanner />
        <LandingNav />
      </header>

      <main className="legal-main">
        <div className="legal-grid landing-grid">
          <div className="landing-grid__gutter" aria-hidden />
          <article className="legal-article">
            <h1 className="legal-title">{title}</h1>
            <p className="legal-updated">Last updated {updated}</p>
            <div className="legal-prose">{children}</div>
          </article>
          <div className="landing-grid__gutter" aria-hidden />
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
