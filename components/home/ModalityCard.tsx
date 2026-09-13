"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
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
  const cardRef = useRef<HTMLElement>(null);
  const backFaceRef = useRef<HTMLDivElement>(null);
  const isPointerOverRef = useRef(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isPointerOver, setIsPointerOver] = useState(false);
  const [isHoverSuppressed, setIsHoverSuppressed] = useState(false);
  const isFlipped = isPinned || (isPointerOver && !isHoverSuppressed);
  const detailsId = `modality-details-${item.number}`;
  const actionLabel = isFlipped
    ? `${item.title}. Activate to return to the overview.`
    : `${item.title}. Activate to view details.`;

  useEffect(() => {
    const card = cardRef.current;
    const backFace = backFaceRef.current;
    if (!card || !backFace) return;

    let measuredWidth = -1;

    // Measure flowing content rather than scrollHeight so expanding the card
    // cannot create a ResizeObserver feedback loop.
    function updateExpandedHeight(force = false) {
      if (!card || !backFace) return;
      if (!force && backFace.clientWidth === measuredWidth) return;

      measuredWidth = backFace.clientWidth;
      const details = backFace.querySelector("ul");
      if (!details) return;

      const styles = window.getComputedStyle(backFace);
      const detailsStyles = window.getComputedStyle(details);
      const paddingBottom = Number.parseFloat(styles.paddingBottom) || 0;
      const detailsMarginBottom =
        Number.parseFloat(detailsStyles.marginBottom) || 0;
      const borderAllowance = 4;
      const requiredHeight = Math.ceil(
        details.offsetTop +
          details.offsetHeight +
          detailsMarginBottom +
          paddingBottom +
          borderAllowance,
      );

      card.style.setProperty(
        "--modality-card-expanded-height",
        `${requiredHeight}px`,
      );
    }

    updateExpandedHeight();
    const resizeObserver = new ResizeObserver(() => updateExpandedHeight());
    resizeObserver.observe(backFace);
    void document.fonts?.ready.then(() => updateExpandedHeight(true));
    card.dataset.interactive = "true";

    return () => {
      resizeObserver.disconnect();
      delete card.dataset.interactive;
    };
  }, []);

  function toggleCard() {
    if (isPinned) {
      setIsPinned(false);
      setIsHoverSuppressed(isPointerOverRef.current);
      return;
    }

    setIsPinned(true);
    setIsHoverSuppressed(false);
  }

  function handlePointerEnter(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    isPointerOverRef.current = true;
    setIsPointerOver(true);
    setIsHoverSuppressed(false);
  }

  function handlePointerLeave(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    isPointerOverRef.current = false;
    setIsPointerOver(false);
    setIsHoverSuppressed(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!isActivationKey(event)) return;

    event.preventDefault();
    toggleCard();
  }

  return (
    <article
      ref={cardRef}
      className={`modality-card ${item.tone}${isFlipped ? " is-flipped" : ""}`}
      role="button"
      tabIndex={0}
      aria-controls={detailsId}
      aria-expanded={isFlipped}
      aria-label={actionLabel}
      onClick={toggleCard}
      onKeyDown={handleKeyDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
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
          ref={backFaceRef}
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
