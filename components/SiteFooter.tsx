import Image from "next/image";
import Link from "next/link";
import { CopyEmailAddress } from "@/components/CopyEmailAddress";
import { CONTACT_EMAIL } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-shell">
        <div className="footer-main">
          <Link href="/" className="brand footer-brand" aria-label="Swaraagam home">
            <Image
              className="brand-mark"
              src="/swaraagam-guitar-waves-mark.png"
              alt=""
              width={50}
              height={50}
              unoptimized
              aria-hidden="true"
            />
            <span>
              <strong>swaraagam</strong>
              <small>Creative Therapeutic Practice</small>
            </span>
          </Link>
          <p>A compassionate space for counselling, creativity, and sound.</p>
          <nav aria-label="Footer navigation">
            <Link href="/#about">About</Link>
            <Link href="/#modalities">Modalities</Link>
            <Link href="/#booking">Contact</Link>
            <Link href="/service-information">Service information</Link>
          </nav>
        </div>

        <aside className="crisis-note" aria-labelledby="urgent-support-title">
          <span aria-hidden="true">!</span>
          <p>
            <strong id="urgent-support-title">Need urgent support?</strong>{" "}
            Swaraagam does not provide emergency or crisis-intervention services.
            If you or someone else is in immediate danger in India, call{" "}
            <a href="tel:112">112</a> or visit the nearest hospital emergency
            department. For tele-mental-health support, contact Tele-MANAS at{" "}
            <a href="tel:14416">14416</a> or{" "}
            <a href="tel:18008914416">1800-89-14416</a>.
          </p>
        </aside>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Swaraagam</span>
          <div>
            <Link href="/privacy">Privacy</Link>
            <Link href="/accessibility">Accessibility</Link>
            <CopyEmailAddress email={CONTACT_EMAIL} />
          </div>
          <a
            className="back-to-top directional-link"
            data-direction="up"
            href="#top"
          >
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
