import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import Link from "next/link";

export default function NotFound() {
  return (
    <div id="top" className="min-h-screen overflow-hidden bg-cream text-ink">
      <SiteHeader />
      <main className="not-found-main">
        <div className="page-shell">
          <p className="eyebrow">Page not found</p>
          <h1>This page has moved out of rhythm.</h1>
          <p>
            The address may be incorrect or the page may no longer be
            available.
          </p>
          <Link className="button directional-link" data-direction="right" href="/">
            Return to Swaraagam <span aria-hidden="true">→</span>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
