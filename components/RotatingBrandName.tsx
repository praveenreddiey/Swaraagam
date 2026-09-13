"use client";

import { useEffect, useState } from "react";

const BRAND_NAMES = [
  { language: "English", lang: "en", text: "swaraagam" },
  { language: "Hindi", lang: "hi", text: "स्वरागम" },
  { language: "Gujarati", lang: "gu", text: "સ્વરાગમ" },
  { language: "Telugu", lang: "te", text: "స్వరాగం" },
  { language: "Tamil", lang: "ta", text: "ஸ்வராகம்" },
] as const;

interface RotatingBrandNameProps {
  animated?: boolean;
}

/** Show Swaraagam's multilingual name, optionally rotating through each script. */
export function RotatingBrandName({ animated = true }: RotatingBrandNameProps = {}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!animated) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (reducedMotion.matches) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % BRAND_NAMES.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [animated]);

  return (
    <strong className="brand-name-rotator">
      <span className="brand-name-accessible">Swaraagam</span>
      <span className="brand-name-layers" aria-hidden="true">
        {BRAND_NAMES.map((name, index) => (
          <span
            className={`brand-name-layer${index === activeIndex ? " is-active" : ""}`}
            data-language={name.language}
            lang={name.lang}
            key={name.lang}
          >
            {name.text}
          </span>
        ))}
      </span>
    </strong>
  );
}
