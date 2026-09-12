import { EnquiryForm } from "@/components/EnquiryForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import Link from "next/link";

const modalities = [
  {
    number: "01",
    icon: "counselling",
    title: "Counselling",
    eyebrow: "Space to speak",
    description:
      "A confidential space to explore your thoughts, emotions and life experiences with curiosity, compassion and care.",
    details: [
      "Emotional wellbeing",
      "Self-understanding",
      "Anxiety & stress",
      "Relationships",
    ],
    tone: "sage",
  },
  {
    number: "02",
    icon: "arts",
    title: "Arts-Based Therapy",
    eyebrow: "Space to create",
    description:
      "Through drawing, painting, movement, storytelling and other creative processes, we explore emotions in ways that feel natural and meaningful.",
    details: [
      "Creative expression",
      "Emotional exploration",
      "Visual reflection",
      "Self-discovery",
    ],
    tone: "clay",
  },
  {
    number: "03",
    icon: "music",
    title: "Music Therapy",
    eyebrow: "Space to listen",
    description:
      "Connect with emotions, memories, the body and the present moment. Together we use rhythm, sound and carefully chosen musical experiences to support wellbeing.",
    details: [
      "Receptive music experiences",
      "Rhythm & grounding",
      "Emotional expression",
      "Relaxation & regulation",
    ],
    tone: "ochre",
  },
];

const steps = [
  {
    number: "01",
    icon: "welcome",
    label: "Begin",
    title: "Getting to know you",
    text: "A brief conversation to understand what brings you here and explore whether this space is right for you.",
  },
  {
    number: "02",
    icon: "explore",
    label: "Explore",
    title: "Finding what works for you",
    text: "Every person’s journey is different. Together, we shape an approach that may include conversation, music, creative expression, reflection or a thoughtful combination.",
  },
  {
    number: "03",
    icon: "grow",
    label: "Grow",
    title: "Growing at your own pace",
    text: "Change doesn’t always happen all at once. Together we notice patterns, celebrate small shifts and create space for growth.",
  },
];

const faqs = [
  {
    question: "What happens in the first session?",
    answer:
      "The first session is a gentle conversation about what brings you here, what support may feel useful and whether Swaraagam is the right fit. You do not need to prepare anything in advance.",
  },
  {
    question: "How do arts-based and music therapy sessions work online?",
    answer:
      "Online sessions can include conversation, guided listening, rhythm, drawing, movement or reflective creative prompts using materials already available to you. No artistic or musical experience is required.",
  },
  {
    question: "What session formats and availability are offered?",
    answer:
      "Online sessions are available across India. In-person sessions in Mumbai are subject to location and appointment availability. Individual sessions are generally 45–60 minutes.",
  },
  {
    question: "Do you work with children and adolescents?",
    answer:
      "Yes. Swaraagam works with children, adolescents and adults. Services for minors are provided with appropriate parent or guardian consent and involvement, where applicable.",
  },
];

type LineIconName =
  | "counselling"
  | "arts"
  | "music"
  | "welcome"
  | "explore"
  | "grow";

function LineIcon({ name }: { name: LineIconName }) {
  return (
    <span className={`line-icon line-icon-${name}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

export default function Home() {
  return (
    <div id="top" className="min-h-screen overflow-hidden bg-cream text-ink">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-orb hero-orb-one" aria-hidden="true" />
          <div className="hero-orb hero-orb-two" aria-hidden="true" />
          <div className="page-shell hero-grid">
            <div className="hero-copy" data-reveal>
              <h1 id="hero-title" className="hero-title">
                Rediscover your
                <span> inner rhythm</span>
              </h1>
              <p className="hero-lede">
                <strong>Swa</strong> means self. <strong>Raagam</strong> is more
                than melody-it is expression, emotion and the unique rhythm each
                of us carries within.
              </p>
              <p className="hero-meaning-line">
                Swaraagam is a space to hear that rhythm again.
              </p>
            </div>

            <div className="hero-side" data-reveal>
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

        <section
          id="about"
          className="section-pad therapist-section scroll-mt-24"
          aria-labelledby="about-title"
        >
          <div className="page-shell">
            <div
              className="therapist-heading therapist-heading-compact"
              data-reveal
            >
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
                      Counselling Psychologist | Arts-Based Therapy Practitioner
                      | Music Therapy Intern
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
                  answers; it begins with <strong>feeling safe enough to explore</strong>
                  {" "}the questions.
                </p>
                <p>
                  At Swaraagam, I offer a gentle, collaborative space where you
                  can <strong>arrive exactly as you are.</strong> Together, we use
                  conversation, music, creative expression and reflection to
                  understand your experiences.
                </p>
                <p className="therapist-emphasis">
                  <span>Sometimes words are enough.</span>
                  <span>Sometimes they aren’t.</span>
                </p>
                <p>
                  At those moments, music, rhythm, colour and creative
                  expression can help us notice what language alone cannot
                  always hold.
                </p>

                <div className="philosophy-card">
                  <span aria-hidden="true">∽</span>
                  <p>
                    “You will either step forward into growth or you will step
                    back into safety.” — Abraham Maslow
                  </p>
                </div>

                <p>
                  Every person carries an inner rhythm. Sometimes life pulls us
                  away from it. Swaraagam is a space to help you listen to it
                  again.
                </p>
                <Link
                  className="inline-detail-link directional-link"
                  data-direction="right"
                  href="/service-information"
                >
                  View qualifications and service information{" "}
                  <span className="link-arrow" aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section
          id="process"
          className="section-pad therapist-process"
          aria-labelledby="process-title"
        >
          <div className="page-shell">
            <div className="process-heading" data-reveal>
              <h2 id="process-title" className="section-title process-title">
                We’ll begin exactly where you are!
              </h2>
              <p>
                There is no need to prepare for this space. Bring yourself,
                we’ll take it from there.
              </p>
            </div>

            <ol className="process-list">
              {steps.map((step, index) => (
                <li key={step.number} data-reveal>
                  <div className="step-number">
                    <LineIcon name={step.icon as LineIconName} />
                    <span>{step.number}</span>
                  </div>
                  <div className="step-copy">
                    <p>{step.label}</p>
                    <h3>{step.title}</h3>
                    <span>{step.text}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="step-line" aria-hidden="true" />
                  )}
                </li>
              ))}
            </ol>

            <blockquote className="process-quote" data-reveal>
              <span aria-hidden="true">🍃</span>
              <p>
                “There is no perfect pace for growing; only the pace that feels
                right for you.”
              </p>
            </blockquote>
          </div>
        </section>
        <section
          id="modalities"
          className="modalities-section scroll-mt-20"
          aria-labelledby="modalities-title"
        >
          <div className="page-shell">
            <div className="section-heading-row" data-reveal>
              <div>
                <h2 id="modalities-title" className="section-title">
                  Three paths. One whole you.
                </h2>
              </div>
              <p className="section-intro">
                Growth doesn’t always happen in one direction.
              </p>
            </div>

            <div className="modalities-grid">
              {modalities.map((item) => (
                <article
                  key={item.title}
                  className={`modality-card ${item.tone}`}
                  data-reveal
                >
                  <div className="card-topline">
                    <span className="card-number">{item.number}</span>
                    <span className="modality-icon" aria-hidden="true">
                      <LineIcon name={item.icon as LineIconName} />
                    </span>
                  </div>
                  <p className="card-eyebrow">{item.eyebrow}</p>
                  <h3>{item.title}</h3>
                  <p className="card-description">{item.description}</p>
                  <ul>
                    {item.details.map((detail) => (
                      <li key={detail}>
                        <span aria-hidden="true" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <p className="modalities-note" data-reveal>
              These aren’t separate boxes. They are different ways of meeting
              you where you are.
            </p>
          </div>
        </section>
        <section
          id="faq"
          className="faq-section scroll-mt-20"
          aria-labelledby="faq-title"
        >
          <div className="page-shell faq-grid">
            <div className="faq-heading" data-reveal>
              <p className="section-kicker">Questions, gently answered</p>
              <h2 id="faq-title" className="section-title">
                A little clarity before you begin.
              </h2>
              <p>
                You are welcome to ask anything else when you send your
                appointment request.
              </p>
            </div>
            <div className="faq-list" data-reveal>
              {faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary>
                    <span>{faq.question}</span>
                    <span className="faq-toggle" aria-hidden="true" />
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section
          id="booking"
          className="booking-section scroll-mt-20"
          aria-labelledby="booking-title"
        >
          <div className="page-shell booking-grid">
            <div className="booking-intro" data-reveal>
              <h2 id="booking-title" className="section-title">
                Let’s find a gentle way forward.
              </h2>
              <p>
                Share a few essential details and one preferred time. I’ll
                respond within two working days to discuss the right support,
                confirm availability and explain the next step.
              </p>

              <div className="booking-journey" aria-labelledby="booking-journey-title">
                <h3 id="booking-journey-title">How booking works</h3>
                <ol>
                  <li>
                    <span aria-hidden="true">1</span>
                    <p>
                      <strong>Send your request</strong>
                      Share the essential details and your preferred time.
                    </p>
                  </li>
                  <li>
                    <span aria-hidden="true">2</span>
                    <p>
                      <strong>Receive a personal reply</strong>
                      Availability, fees and the next step are shared by email.
                    </p>
                  </li>
                  <li>
                    <span aria-hidden="true">3</span>
                    <p>
                      <strong>Confirm the consultation</strong>
                      Your appointment is set only after Swaraagam confirms it.
                    </p>
                  </li>
                </ol>
              </div>

              <Link
                className="inline-detail-link directional-link booking-service-link"
                data-direction="right"
                href="/service-information"
              >
                View session formats, duration and fees
                <span className="link-arrow" aria-hidden="true">→</span>
              </Link>
            </div>

            <EnquiryForm />
          </div>

          <div className="page-shell booking-closing" data-reveal>
            <p>Before you go…</p>
            <h3>Reaching out can feel like the hardest step.</h3>
            <span>Thank you for considering Swaraagam.</span>
          </div>
        </section>
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
