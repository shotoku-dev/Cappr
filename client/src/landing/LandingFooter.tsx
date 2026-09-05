import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import CapprLogo from "../assets/brand/cappr-logo.svg?react";
import { LandingWaitlistForm } from "./LandingWaitlistForm";
import "./footer.css";

const CDN = "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "#overview" },
      { label: "Enforcement", href: "#enforcement" },
      { label: "Integrations", href: "#integrations" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "#docs" },
      { label: "API reference", href: "#api" },
      { label: "GitHub", href: "https://github.com", external: true },
      { label: "Changelog", href: "#changelog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Contact", href: "mailto:hello@cappr.dev", external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#privacy" },
      { label: "Terms", href: "#terms" },
      { label: "Security", href: "#security" },
    ],
  },
] as const;

// theSVG marks, rendered mono via CSS mask so they inherit currentColor.
const SOCIALS = [
  { label: "X", href: "https://x.com", src: `${CDN}/x/mono.svg` },
  { label: "LinkedIn", href: "https://linkedin.com", src: `${CDN}/linkedin/default.svg` },
] as const;

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer" aria-labelledby="landing-footer-heading">
      <div className="landing-footer__content landing-grid">
        <div className="landing-grid__gutter" aria-hidden />
        <div className="landing-footer__frame">
          <h2 id="landing-footer-heading" className="landing-footer__sr-only">
            Cappr site footer
          </h2>

          <div className="landing-footer__top">
            <div className="landing-footer__brand">
              <Link to="/" className="landing-footer__logo" aria-label="Cappr">
                <CapprLogo aria-hidden className="landing-footer__logo-mark" />
              </Link>
              <p className="landing-footer__tagline">
                Governance and spend control for the AI stack. One proxy —
                observed, enforced, open.
              </p>
              <LandingWaitlistForm variant="stacked" />

            </div>

            <nav className="landing-footer__nav" aria-label="Footer">
              {COLUMNS.map((col) => (
                <div key={col.title} className="landing-footer__col">
                  <h3 className="landing-footer__col-title">{col.title}</h3>
                  <ul className="landing-footer__list">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="landing-footer__link"
                          {...("external" in link && link.external
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className="landing-footer__bottom">
            <span className="landing-footer__copy">
              © {year} Cappr, Inc. All rights reserved.
            </span>

            <div className="landing-footer__socials">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="landing-footer__social"
                >
                  <span
                    className="landing-footer__social-icon"
                    style={{ "--icon": `url(${s.src})` } as CSSProperties}
                    aria-hidden
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="landing-grid__gutter" aria-hidden />
      </div>
    </footer>
  );
}
