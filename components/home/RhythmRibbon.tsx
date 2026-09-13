const RHYTHM_WORDS = ["Pause", "Listen", "Express", "Reconnect"] as const;

/** Add a quiet visual interlude between the introduction and practice story. */
export function RhythmRibbon() {
  return (
    <aside
      className="rhythm-ribbon"
      aria-label="Pause, listen, express and reconnect"
    >
      <div className="rhythm-ribbon-track" aria-hidden="true">
        {[0, 1].map((group) => (
          <div className="rhythm-ribbon-group" key={group}>
            {RHYTHM_WORDS.map((word) => (
              <span key={`${group}-${word}`}>{word}</span>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
