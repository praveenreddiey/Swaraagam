import { RhythmRibbon } from "@/components/home/RhythmRibbon";

/** Render the shared ribbon, copyright notice and back-to-top control. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <RhythmRibbon />
      <div className="page-shell">
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Swaraagam. All rights reserved.</span>
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
