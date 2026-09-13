import Link from "next/link";

/** Present the practitioner, credentials and therapeutic philosophy. */
export function AboutSection() {
  return (
    <section
      id="about"
      className="section-pad therapist-section scroll-mt-24"
      aria-labelledby="about-title"
    >
      <div className="page-shell">
        <div className="therapist-heading therapist-heading-compact" data-reveal>
          <h2 id="about-title" className="section-title">
            A space that meets you <em>as you are.</em>
          </h2>
        </div>

        <div className="therapist-grid">
          <article
            className="therapist-card"
            data-reveal
            aria-label="About Pragati Bhatt, founder of Swaraagam"
          >
            <div
              className="therapist-portrait"
              role="img"
              aria-label="Portrait space for Pragati Bhatt, founder of Swaraagam"
            >
              <div className="portrait-monogram" aria-hidden="true">
                PB
              </div>
              <span aria-hidden="true">Pragati Bhatt · Founder</span>
            </div>
            <div className="therapist-card-caption">
              <div className="therapist-card-details">
                <p className="therapist-card-founder">Founder, Swaraagam</p>
                <h3>Pragati Bhatt</h3>
                <p className="therapist-card-role">
                  Counselling Psychologist | Arts-Based Therapy Practitioner |
                  Music Therapy Intern
                </p>
                <div className="credential-chips" aria-label="Key credentials">
                  <span>MA Counselling Psychology</span>
                  <span>Arts-Based Therapy</span>
                  <span>Mumbai · Online India</span>
                </div>
                <p className="therapist-card-experience">
                  Experience working across schools, therapy settings and
                  community mental health.
                </p>
                <p className="therapist-card-languages">
                  <strong>Languages:</strong> English, Hindi, Gujarati
                </p>
              </div>
              <span className="therapist-mark" aria-hidden="true">
                ∿
              </span>
            </div>
          </article>

          <div className="therapist-copy" data-reveal>
            <p className="therapist-lede">
              I believe meaningful change doesn’t begin with having all the
              answers; it begins with{" "}
              <strong>feeling safe enough to explore</strong> the questions.
            </p>
            <p>
              At Swaraagam, I offer a gentle, collaborative space where you can{" "}
              <strong>arrive exactly as you are.</strong> Together, we use
              conversation, music, creative expression and reflection to
              understand your experiences.
            </p>
            <p className="therapist-emphasis">
              <span>Sometimes words are enough.</span>
              <span>Sometimes they aren’t.</span>
            </p>
            <p>
              At those moments, music, rhythm, colour and creative expression
              can help us notice what language alone cannot always hold.
            </p>
            <div className="philosophy-card">
              <span aria-hidden="true">∽</span>
              <p>
                “You will either step forward into growth or you will step back
                into safety.” — Abraham Maslow
              </p>
            </div>
            <p>
              Every person carries an inner rhythm. Sometimes life pulls us away
              from it. Swaraagam is a space to help you listen to it again.
            </p>
            <Link
              className="inline-detail-link directional-link"
              data-direction="right"
              href="/service-information"
            >
              View qualifications and service information{" "}
              <span className="link-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
