"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR = "[data-reveal]";
const INITIAL_VIEWPORT_RATIO = 0.92;
const REVEAL_ROOT_MARGIN = "0px 0px -8%";
const REVEAL_THRESHOLD = 0.08;

function showAll(elements: readonly Element[]) {
  elements.forEach((element) => element.classList.add("is-visible"));
}

/**
 * Reveal homepage sections as they enter the viewport.
 * Falls back to fully visible content when motion is reduced or observers are unavailable.
 */
export function RevealOnScroll() {
  useEffect(() => {
    const elements = [...document.querySelectorAll(REVEAL_SELECTOR)];
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      showAll(elements);
      return;
    }

    const initialViewportLimit = window.innerHeight * INITIAL_VIEWPORT_RATIO;
    elements.forEach((element) => {
      if (element.getBoundingClientRect().top <= initialViewportLimit) {
        element.classList.add("is-visible");
      }
    });
    document.documentElement.classList.add("reveal-enabled");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: REVEAL_ROOT_MARGIN, threshold: REVEAL_THRESHOLD },
    );

    elements.forEach((element) => {
      if (!element.classList.contains("is-visible")) observer.observe(element);
    });

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("reveal-enabled");
    };
  }, []);

  return null;
}
