import { Link } from "react-router-dom";
import { Text } from "../wireframe";

/** Sticky nav — product links + dual CTA (demo / self-serve). */
export function NavSection() {
  return (
    <header className="wf-section wf-section--inset" data-section="nav" style={{ paddingBlock: "var(--spacing-space-4)" }}>
      <div className="wf-section__label">Nav</div>
      <div className="wf-container">
        <div className="wf-split" data-ratio="1-1" style={{ alignItems: "center" }}>
          <div
            className="wf-split__pane"
            style={{ flexDirection: "row", alignItems: "center", gap: "var(--spacing-space-6)" }}
          >
            <Text as="span" variant="h3">
              Cappr
            </Text>
            <nav style={{ display: "flex", gap: "var(--spacing-space-5)" }} aria-label="Primary">
              <span className="wf-pill">How it works</span>
              <span className="wf-pill">Pricing</span>
              <span className="wf-pill">Docs</span>
            </nav>
          </div>
          <div
            className="wf-split__pane"
            style={{ flexDirection: "row", justifyContent: "flex-end", gap: "var(--spacing-space-3)" }}
          >
            <a href="#book-demo" className="wf-btn">
              Book a demo
            </a>
            <Link to="/dashboard" className="wf-btn wf-btn--primary">
              Start free
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
