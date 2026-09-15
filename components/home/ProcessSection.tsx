import { PROCESS_STEPS } from "./content";
import { LineIcon } from "./LineIcon";

/** Explain the three-stage journey from first conversation to ongoing growth. */
export function ProcessSection() {
  return (
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
            There is no need to prepare for this space. Bring yourself, we’ll
            take it from there.
          </p>
        </div>

        <ol className="process-list">
          {PROCESS_STEPS.map((step, index) => (
            <li key={step.number} data-reveal>
              <div className="step-number">
                <LineIcon name={step.icon} />
                <span>{step.number}</span>
              </div>
              <div className="step-copy">
                <h3>{step.title}</h3>
                <span>{step.text}</span>
              </div>
              {index < PROCESS_STEPS.length - 1 && (
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
  );
}
