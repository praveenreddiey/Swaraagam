import type { ReactNode } from "react";
import Link from "next/link";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

type LegalPageProps = {
  title: string;
  summary: string;
  updated: string;
  children: ReactNode;
};

export function LegalPage({
  title,
  summary,
  updated,
  children,
}: LegalPageProps) {
  return (
    <div id="top" className="min-h-screen overflow-hidden bg-cream text-ink">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content" className="legal-main">
        <header className="legal-hero">
          <div className="page-shell legal-shell">
            <Link
              className="inline-detail-link directional-link legal-back-link"
              data-direction="left"
              href="/"
            >
              <span aria-hidden="true">←</span>
              Back to Swaraagam
            </Link>
            <h1>{title}</h1>
            <p className="legal-summary">{summary}</p>
            <p className="legal-updated">Last updated: {updated}</p>
          </div>
        </header>
        <div className="page-shell legal-shell legal-content">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
