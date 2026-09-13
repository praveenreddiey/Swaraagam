# Swaraagam visual language

This document defines the visual and motion conventions for the public website.
The goal is expressive warmth without compromising the calm, trustworthy tone
expected from a counselling practice.

## Design principles

1. Calm before novelty. Movement must never compete with service information or
   the appointment form.
2. Expression without imitation. Use Swaraagam's own rhythm, breath, music and
   creative-practice motifs rather than copying another practice's assets.
3. Content without animation. Every word and action remains available when
   JavaScript is unavailable or reduced motion is requested.
4. Restraint through reuse. Extend the existing tokens before introducing a new
   color, timing value or visual pattern.

## Typography

- Fraunces is the display face. Its optical character suits editorial headings
  and provides a softer alternative to the previous generic serif stack.
- Manrope is the body and interface face. It remains clear at small sizes and
  pairs cleanly with the more expressive headings.
- Both families are self-hosted from `public/fonts/`. Their SIL Open Font
  License files must remain beside the font assets.
- Indian-script brand-name rotations continue to use the established system
  fallbacks because the Latin font files do not contain those scripts.

## Color

The canonical tokens live in `app/styles/foundation.css`:

- cream and paper provide the quiet base;
- ink and sage convey stability;
- clay adds warmth;
- ochre and marigold add small moments of creative energy; and
- rose is reserved for low-opacity decorative artwork.

Do not introduce high-saturation pink or purple as a dominant surface. Those
colors would change the practice's established character and reduce the sense
of calm.

## Motion

Motion lives in `app/styles/visual-language.css`, with viewport observation in
`components/home/RevealOnScroll.tsx`.

- Hero shapes drift slowly within a small range.
- The rhythm lines travel through stroke dashes rather than moving page layout.
- The ribbon is continuous and slow; it is an interlude, not a call to action.
- Section reveals use opacity and a short vertical translation only.
- Modality cards respond to hover and keyboard focus without hiding content.
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
- `app/styles/home-*.css` owns existing homepage sections.
- `app/styles/visual-language.css` owns decorative visuals and motion.
- `app/styles/responsive.css` owns shared responsive overrides.
- `components/home/` owns homepage-only markup and content constants.

Keep each source file below the repository's 400-line soft ceiling. The visual
language test enforces this boundary and verifies font licensing and reduced
motion support.
