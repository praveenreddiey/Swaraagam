const RHYTHM_WORDS = [
  { label: "Pause", emphasis: false },
  { label: "Listen", emphasis: true },
  { label: "Express", emphasis: false },
  { label: "Reconnect", emphasis: true },
] as const;

// Keep both animation halves wider than desktop viewports so the loop never exposes a blank tail.
const RHYTHM_GROUP_COUNT = 12;

/** Close the page with a full-width rhythm banner before the footer panel. */
export function RhythmRibbon() {
  return (
    <aside
      className="rhythm-ribbon"
      aria-label="Pause, listen, express and reconnect"
    >
      <div className="rhythm-ribbon-track" aria-hidden="true">
        {Array.from({ length: RHYTHM_GROUP_COUNT }, (_, group) => (
          <div className="rhythm-ribbon-group" key={group}>
            {RHYTHM_WORDS.map((word) => (
              <span key={`${group}-${word.label}`}>
                {word.emphasis ? <strong>{word.label}.</strong> : `${word.label}.`}
              </span>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
