# Swaraagam visual language

This document defines the visual and motion conventions for the public website.
The goal is expressive warmth without compromising the calm, trustworthy tone
expected from a counselling practice.

## Design principles

1. Calm entry, expressive journey. The header keeps the English wordmark clear
   while the hero remains static; playful movement begins lower on the page and
   never competes with the form.
2. Expression without imitation. Use Swaraagam's own rhythm, breath, music and
   creative-practice motifs rather than copying another practice's assets.
3. Content without animation. Every word and action remains available when
   JavaScript is unavailable or reduced motion is requested.
4. Energy through reuse. Repeat a small family of paper shapes, saturated color
   tokens and motion timings instead of inventing a new effect for each section.

## Typography

- Fraunces is the display face. Its optical character suits editorial headings
  and provides a softer alternative to the previous generic serif stack.
- Manrope is the body and interface face. It remains clear at small sizes and
  pairs cleanly with the more expressive headings.
- Both families are self-hosted from `public/fonts/`. Their SIL Open Font
  License files must remain beside the font assets.
- The header uses a static English wordmark so the brand is clear without
  shipping unnecessary client-side state or timers.

## Color

The complete public-facing palette and shared tokens live in
`app/styles/foundation.css`:

- paper cream keeps copy readable and gives collage shapes room to breathe;
- plum ink anchors headings and long-form content;
- magenta and violet drive navigation, calls to action and expressive emphasis;
- teal and mint represent grounding and connection; and
- yellow, orange, sky and lime provide small high-energy accents.

Use saturated colors as purposeful blocks or accents, with plum or white text
chosen for sufficient contrast. Avoid placing long paragraphs directly on the
strongest colors.

The wordmark is the header's visual anchor. Navigation sits beneath it at a
smaller, lighter scale and uses one muted-plum accent as a calm wayfinding
system. Keep the current page underlined, and reveal the paint-stroke underline
on hover or focus for other destinations.

The opening hero headline is intentionally one visual step quieter than the
wordmark. Keep the brand lockup's scale and breathing room ahead of the headline
so the practice name is the first thing visitors notice.

Each major section has a distinct solid surface color so the page reads like a
series of painted panels. Keep the surface tokens consistent when changing a
section, and use small organic shapes or angled accents instead of gradients to
connect neighboring panels.

The hero card and booking form share the same yellow backplate and offset so
the two primary calls to action feel like part of one visual system.

The footer is a compact two-tier close: a green rhythm ribbon followed by a
short charcoal footer panel. The ribbon uses the body font with alternating regular
and bold words for a light, wayfinding-style rhythm. Keep the copyright and
legal links centered with the back-to-top action as an icon-only circular
control at the panel's edge.

## Motion

Motion lives in `app/styles/visual-language.css`, with viewport observation in
`components/home/RevealOnScroll.tsx`.

- Header branding remains a static English wordmark while hero artwork remains
  static so the first screen still feels clear.
- The ribbon is continuous and slow inside the footer, immediately above the
  footer links, so the page closes with a celebratory transition without
  repeating the site information already provided in the header.
- Section reveals use opacity and a short vertical translation only.
- Process icons move gently. Modality cards begin with a compact heading-only
  footprint, then expand and flip from one synchronized interaction state on
  mouse hover, click, Enter or Space. Their expanded height is measured from
  the rendered details so narrow screens never clip content.
- All animations stop under `prefers-reduced-motion: reduce`.

Avoid autoplay video, rapid parallax, scroll hijacking and large cursor-following
effects. They add distraction and can make a mental-health website feel less
safe or predictable.

## Artwork and photography

The hero score in `components/home/HeroArtwork.tsx` is an original inline SVG.
It is decorative and therefore hidden from assistive technology.

Do not download or reuse imagery from reference websites. Future photography
should be owned or properly licensed and ideally show authentic details of the
practice: the practitioner, art materials, instruments, hands creating, or the
therapy space. Record the license or ownership source beside every new asset.

## File organization

- `app/globals.css` is an import manifest only.
- `app/styles/foundation.css` owns tokens, fonts, reset and shared primitives.
- `app/styles/home-*.css` owns each homepage section's complete visual rules.
- `app/styles/visual-language.css` owns shared decorative visuals and ribbon motion.
- `app/styles/modality-cards.css` owns the interactive card faces and flip transition.
- `app/styles/responsive.css` loads last and owns shared responsive overrides.
- `app/styles/legal.css` owns the painted legal-page hero, continuous reading
  column, single teal section accent and the no-gradient not-found state.
- `components/home/` owns homepage-only markup and content constants.

Keep each source file below the repository's 400-line soft ceiling. The visual
language test enforces this boundary and verifies font licensing and reduced
motion support. Playwright tests cover navigation state, card interactions,
narrow-screen overflow and mobile access to footer destinations.
