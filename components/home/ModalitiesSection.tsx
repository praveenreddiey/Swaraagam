import { MODALITIES } from "./content";
import { LineIcon } from "./LineIcon";

/** Describe the three complementary therapeutic modalities offered by Swaraagam. */
export function ModalitiesSection() {
  return (
    <section
      id="modalities"
      className="modalities-section scroll-mt-20"
      aria-labelledby="modalities-title"
    >
      <div className="page-shell">
        <div className="section-heading-row" data-reveal>
          <h2 id="modalities-title" className="section-title">
            Three paths. One whole you.
          </h2>
          <p className="section-intro">
            Growth doesn’t always happen in one direction.
          </p>
        </div>

        <div className="modalities-grid">
          {MODALITIES.map((item) => (
            <article
              key={item.title}
              className={`modality-card ${item.tone}`}
              data-reveal
            >
              <div className="card-topline">
                <span className="card-number">{item.number}</span>
                <span className="modality-icon" aria-hidden="true">
                  <LineIcon name={item.icon} />
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
          These aren’t separate boxes. They are different ways of meeting you
          where you are.
        </p>
      </div>
    </section>
  );
}
