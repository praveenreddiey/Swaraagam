"use client";

import { useState, type KeyboardEvent } from "react";
import { LineIcon } from "./LineIcon";
import type { MODALITIES } from "./content";

type Modality = (typeof MODALITIES)[number];

interface ModalityCardProps {
  item: Modality;
}

function isActivationKey(event: KeyboardEvent<HTMLElement>) {
  return event.key === "Enter" || event.key === " ";
}

/** Render one modality as a keyboard-accessible card that flips to its details. */
export function ModalityCard({ item }: ModalityCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const detailsId = `modality-details-${item.number}`;
  const actionLabel = isFlipped
    ? `${item.title}. Activate to return to the overview.`
    : `${item.title}. Activate to view details.`;

  function toggleCard() {
    setIsFlipped((current) => !current);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!isActivationKey(event)) return;

    event.preventDefault();
    toggleCard();
  }

  return (
    <article
      className={`modality-card ${item.tone}${isFlipped ? " is-flipped" : ""}`}
      role="button"
      tabIndex={0}
      aria-controls={detailsId}
      aria-expanded={isFlipped}
      aria-label={actionLabel}
      onClick={toggleCard}
      onKeyDown={handleKeyDown}
    >
      <div className="modality-card-inner">
        <div className="modality-card-face modality-card-front" aria-hidden={isFlipped}>
          <div className="card-topline">
            <span className="card-number">{item.number}</span>
            <span className="modality-icon" aria-hidden="true">
              <LineIcon name={item.icon} />
            </span>
          </div>
          <div className="modality-card-front-content">
            <p className="card-eyebrow">{item.eyebrow}</p>
            <h3>{item.title}</h3>
          </div>
          <span className="modality-card-cue" aria-hidden="true">
            ↗
          </span>
        </div>

        <div
          className="modality-card-face modality-card-back"
          id={detailsId}
          aria-hidden={!isFlipped}
        >
          <div className="card-topline">
            <span className="card-number">{item.number}</span>
            <span className="modality-back-label">Details</span>
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
          <span className="modality-card-cue" aria-hidden="true">
            ↩
          </span>
        </div>
      </div>
    </article>
  );
}
