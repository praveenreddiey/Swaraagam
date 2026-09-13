import { MODALITIES } from "./content";
import { ModalityCard } from "./ModalityCard";

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
            Three ways to connect
          </h2>
        </div>

        <div className="modalities-grid">
          {MODALITIES.map((item) => (
            <ModalityCard key={item.title} item={item} />
          ))}
        </div>

      </div>
    </section>
  );
}
