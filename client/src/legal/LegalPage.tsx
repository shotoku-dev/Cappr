import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import CapprLogo from "../assets/brand/cappr-logo.svg?react";
import "./legal.css";

type LegalPageProps = {
  title: string;
  updated: string;
  children: ReactNode;
};

/** Shared minimalist shell for the legal pages. */
export function LegalPage({ title, updated, children }: LegalPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page font-sans">
      <header className="legal-header">
        <Link to="/" className="legal-logo" aria-label="Cappr — home">
          <CapprLogo aria-hidden className="legal-logo-mark" />
        </Link>
        <Link to="/" className="legal-back">
          ← Back to home
        </Link>
      </header>

      <main className="legal-main">
        <article className="legal-article">
          <h1 className="legal-title">{title}</h1>
          <p className="legal-updated">Last updated {updated}</p>
          <div className="legal-prose">{children}</div>
        </article>
      </main>

      <footer className="legal-footer">
        © {new Date().getFullYear()} Cappr, Inc. All rights reserved.
      </footer>
    </div>
  );
}
