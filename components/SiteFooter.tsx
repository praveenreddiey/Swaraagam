import Link from "next/link";
import { CopyEmailAddress } from "@/components/CopyEmailAddress";
import { RhythmRibbon } from "@/components/home/RhythmRibbon";
import { CONTACT_EMAIL } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <RhythmRibbon />
      <div className="page-shell">
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
            aria-label="Back to top"
          >
            <span aria-hidden="true">↑</span>
            <span className="back-to-top-label">Back to top</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
