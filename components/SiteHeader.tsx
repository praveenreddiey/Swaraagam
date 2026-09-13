import Image from "next/image";
import Link from "next/link";
import { PrimaryNavigation } from "./PrimaryNavigation";

/** Render the shared brand header and route-aware primary navigation. */
export function SiteHeader() {
  return (
    <header className="site-header" aria-label="Primary navigation">
      <div className="site-header-brand-row">
        <Link
          href="/"
          className="brand brand-centered"
          aria-label="Swaraagam home"
        >
          <Image
            className="brand-mark"
            src="/swaraagam-guitar-waves-mark.png"
            alt=""
            width={72}
            height={72}
            priority
            unoptimized
            aria-hidden="true"
          />
          <span className="brand-lockup">
            <strong>swaraagam</strong>
            <small>Creative Therapeutic Practice</small>
          </span>
        </Link>
      </div>

      <div className="site-header-navigation-row">
        <div className="page-shell site-header-navigation-shell">
          <PrimaryNavigation />

          <Link
            className="header-booking-link directional-link"
            data-direction="right"
            href="/#booking"
          >
            Book a session
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
