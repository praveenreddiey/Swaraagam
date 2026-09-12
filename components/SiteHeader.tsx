import Image from "next/image";
import Link from "next/link";
import { RotatingBrandName } from "./RotatingBrandName";

export function SiteHeader() {
  return (
    <header className="site-header" aria-label="Primary navigation">
      <div className="page-shell flex h-[76px] items-center justify-between gap-5">
        <Link href="/" className="brand" aria-label="Swaraagam home">
          <Image
            className="brand-mark"
            src="/swaraagam-guitar-waves-mark.png"
            alt=""
            width={50}
            height={50}
            priority
            unoptimized
            aria-hidden="true"
          />
          <span>
            <RotatingBrandName />
            <small>Creative Therapeutic Practice</small>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main menu">
          <Link className="nav-link" href="/#about">
            About
          </Link>
          <Link className="nav-link" href="/#modalities">
            Modalities
          </Link>
          <Link className="nav-link" href="/service-information">
            Service information
          </Link>
        </nav>

        <Link
          className="button button-small directional-link"
          data-direction="right"
          href="/#booking"
        >
          Book a session
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  );
}
