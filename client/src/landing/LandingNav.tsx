import { Link } from "react-router-dom";
import CapprLogo from "../assets/brand/cappr-logo.svg?react";
import { LandingNavCta } from "./LandingNavCta";
import { LandingNavMenus } from "./LandingNavMenus";

/** Flip to true to restore Product / Solutions dropdowns. */
const SHOW_NAV_MENUS = false;

export function LandingNav() {
  return (
    <div className="landing-nav">
      <div className="landing-nav__inner">
        <Link to="/" className="landing-nav__logo" aria-label="Cappr">
          <CapprLogo aria-hidden className="landing-nav__logo-mark" />
        </Link>

        {SHOW_NAV_MENUS ? (
          <nav className="landing-nav__links" aria-label="Primary">
            <LandingNavMenus />
          </nav>
        ) : (
          <div className="landing-nav__links" aria-hidden />
        )}

        <div className="landing-nav__actions">
          <LandingNavCta />
        </div>
      </div>
    </div>
  );
}
