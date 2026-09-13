import { AboutSection } from "@/components/home/AboutSection";
import { BookingSection } from "@/components/home/BookingSection";
import { FaqSection } from "@/components/home/FaqSection";
import { HeroSection } from "@/components/home/HeroSection";
import { ModalitiesSection } from "@/components/home/ModalitiesSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { RevealOnScroll } from "@/components/home/RevealOnScroll";
import { RhythmRibbon } from "@/components/home/RhythmRibbon";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

/** Assemble the public Swaraagam homepage from its focused content sections. */
export default function Home() {
  return (
    <div
      id="top"
      className="site-canvas min-h-screen overflow-hidden bg-cream text-ink"
    >
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <RevealOnScroll />
      <SiteHeader />
      <main id="main-content">
        <HeroSection />
        <RhythmRibbon />
        <AboutSection />
        <ProcessSection />
        <ModalitiesSection />
        <FaqSection />
        <BookingSection />
      </main>
      <aside className="mobile-booking-bar" aria-label="Book a Swaraagam session">
        <a
          className="button directional-link"
          data-direction="right"
          href="#booking"
        >
          Book a session
          <span aria-hidden="true">→</span>
        </a>
      </aside>
      <SiteFooter />
    </div>
  );
}
