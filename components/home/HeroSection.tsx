import { HeroArtwork } from "./HeroArtwork";

/** Introduce Swaraagam and guide visitors toward modalities or booking. */
export function HeroSection() {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-orb hero-orb-one" aria-hidden="true" />
      <div className="hero-orb hero-orb-two" aria-hidden="true" />
      <HeroArtwork />
      <div className="page-shell hero-grid">
        <div className="hero-copy">
          <p className="hero-kicker">A place for your whole self</p>
          <h1 id="hero-title" className="hero-title">
            Rediscover your
            <span> inner rhythm</span>
          </h1>
          <p className="hero-lede">
            <strong>Swa</strong> means self. <strong>Raagam</strong> is more
            than melody—it is expression, emotion and the unique rhythm each
            of us carries within.
          </p>
          <p className="hero-meaning-line">
            Swaraagam is a space to hear that rhythm again.
          </p>
        </div>

        <div className="hero-side">
          <p className="hero-side-label">Creative therapeutic practice</p>
          <p className="hero-side-copy">
            Counselling, arts-based therapy and music-informed support,
            offered online across India and in person in Mumbai.
          </p>
          <div className="hero-actions">
            <a
              className="button hero-primary-cta directional-link"
              data-direction="right"
              href="#booking"
            >
              Take the first step
              <span aria-hidden="true">→</span>
            </a>
            <a
              className="hero-action-link directional-link"
              data-direction="down"
              href="#modalities"
            >
              Explore Swaraagam
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
