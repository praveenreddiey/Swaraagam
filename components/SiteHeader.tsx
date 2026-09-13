import Image from "next/image";
import Link from "next/link";
import { RotatingBrandName } from "./RotatingBrandName";

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
            <RotatingBrandName animated={false} />
            <small>Creative Therapeutic Practice</small>
          </span>
        </Link>
      </div>

      <div className="site-header-navigation-row">
        <div className="page-shell site-header-navigation-shell">
          <nav className="site-menu" aria-label="Main menu">
            <Link className="nav-link nav-link-active" href="/">
              Home
            </Link>
            <Link className="nav-link" href="/#about">
              About us
            </Link>
            <Link className="nav-link" href="/#modalities">
              Modalities
            </Link>
            <Link className="nav-link" href="/#process">
              How it works
            </Link>
            <Link className="nav-link" href="/service-information">
              Service information
            </Link>
          </nav>

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
