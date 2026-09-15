import { FAQS } from "./content";

/** Answer practical questions that commonly arise before a first session. */
export function FaqSection() {
  return (
    <section
      id="faq"
      className="faq-section scroll-mt-20"
      aria-labelledby="faq-title"
    >
      <div className="page-shell faq-grid">
        <div className="faq-heading" data-reveal>
          <h2 id="faq-title" className="section-title">
            A little clarity before you begin.
          </h2>
          <p>
            You are welcome to ask anything else when you send your appointment
            request.
          </p>
        </div>
        <div className="faq-list" data-reveal>
          {FAQS.map((faq, index) => (
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
  );
}
