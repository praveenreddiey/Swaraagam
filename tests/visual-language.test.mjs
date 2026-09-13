import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(testDirectory, "..");
const stylesDirectory = resolve(projectDirectory, "app", "styles");
const homepageComponentsDirectory = resolve(projectDirectory, "components", "home");
const softLineCeiling = 400;

async function readProjectFile(...segments) {
  return readFile(resolve(projectDirectory, ...segments), "utf8");
}

async function collectFiles(directory, extension) {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => resolve(directory, entry.name));
}

async function assertWithinLineCeiling(paths) {
  for (const path of paths) {
    const source = await readFile(path, "utf8");
    const lineCount = source.split(/\r?\n/u).length;
    assert.ok(
      lineCount <= softLineCeiling,
      `${path} has ${lineCount} lines; split it before exceeding ${softLineCeiling}`,
    );
  }
}

test("keeps homepage visuals in focused files below the maintenance ceiling", async () => {
  const stylePaths = await collectFiles(stylesDirectory, ".css");
  const componentPaths = await collectFiles(homepageComponentsDirectory, ".tsx");
  componentPaths.push(resolve(projectDirectory, "app", "page.tsx"));

  await assertWithinLineCeiling(stylePaths);
  await assertWithinLineCeiling(componentPaths);

  const globalStyles = await readProjectFile("app", "globals.css");
  assert.match(globalStyles, /styles\/visual-language\.css/u);
  assert.match(globalStyles, /styles\/responsive\.css/u);
  assert.match(globalStyles, /styles\/playful-foundation\.css/u);
  assert.match(globalStyles, /styles\/playful-sections\.css/u);
  assert.match(globalStyles, /styles\/modality-cards\.css/u);
});

test("self-hosts licensed display and body fonts", async () => {
  const foundationStyles = await readProjectFile("app", "styles", "foundation.css");
  assert.match(foundationStyles, /fraunces-latin-variable\.woff2/u);
  assert.match(foundationStyles, /fraunces-latin-italic-variable\.woff2/u);
  assert.match(foundationStyles, /manrope-latin-variable\.woff2/u);
  assert.doesNotMatch(foundationStyles, /fonts\.(?:googleapis|gstatic)\.com/u);

  for (const fontName of [
    "fraunces-latin-variable.woff2",
    "fraunces-latin-italic-variable.woff2",
    "manrope-latin-variable.woff2",
  ]) {
    const fontStats = await stat(resolve(projectDirectory, "public", "fonts", fontName));
    assert.ok(fontStats.size > 10_000, `${fontName} should contain a real font payload`);
  }

  for (const licenseName of ["FRAUNCES-LICENSE.txt", "MANROPE-LICENSE.txt"]) {
    const license = await readProjectFile("public", "fonts", licenseName);
    assert.match(license, /SIL OPEN FONT LICENSE/u);
  }
});

test("keeps decorative motion optional and independent of the reference website", async () => {
  const visualStyles = await readProjectFile("app", "styles", "visual-language.css");
  const playfulFoundation = await readProjectFile(
    "app",
    "styles",
    "playful-foundation.css",
  );
  const playfulSections = await readProjectFile("app", "styles", "playful-sections.css");
  const revealSource = await readProjectFile(
    "components",
    "home",
    "RevealOnScroll.tsx",
  );
  const combinedSource = `${visualStyles}\n${playfulFoundation}\n${playfulSections}\n${revealSource}`;

  assert.match(visualStyles, /prefers-reduced-motion:\s*reduce/u);
  assert.match(visualStyles, /animation:\s*none/u);
  assert.match(playfulFoundation, /\.rhythm-wash,[\s\S]*animation:\s*none/u);
  assert.match(playfulSections, /prefers-reduced-motion:\s*reduce/u);
  assert.match(revealSource, /IntersectionObserver/u);
  assert.match(revealSource, /prefers-reduced-motion:\s*reduce/u);
  assert.doesNotMatch(combinedSource, /secondwind\.org\.in|custom-domains\.chatgpt\.site/iu);
});

test("gives each major section a distinct solid color identity", async () => {
  const playfulFoundation = await readProjectFile(
    "app",
    "styles",
    "playful-foundation.css",
  );
  const playfulSections = await readProjectFile(
    "app",
    "styles",
    "playful-sections.css",
  );
  const legalStyles = await readProjectFile("app", "styles", "legal.css");

  assert.match(playfulFoundation, /--surface-hero:/u);
  assert.match(playfulFoundation, /--surface-ribbon:/u);
  assert.match(playfulFoundation, /--surface-footer:/u);
  assert.match(playfulFoundation, /--card-backplate-color:\s*#ffd34e/u);
  assert.match(playfulFoundation, /--card-backplate-offset:\s*12px/u);
  assert.match(playfulFoundation, /--nav-accent:/u);
  assert.match(playfulFoundation, /\.hero-section[\s\S]*var\(--surface-hero\)/u);
  assert.match(playfulSections, /\.therapist-section[\s\S]*background:\s*var\(--surface-about\)/u);
  assert.match(playfulSections, /\.therapist-process[\s\S]*background:\s*var\(--surface-process\)/u);
  assert.match(playfulSections, /\.modalities-section[\s\S]*background:\s*var\(--surface-modalities\)/u);
  assert.match(playfulSections, /\.modalities-section \.section-heading-row[\s\S]*justify-content:\s*center/u);
  assert.match(playfulSections, /\.faq-section[\s\S]*background:\s*var\(--surface-faq\)/u);
  assert.match(playfulSections, /\.booking-section[\s\S]*background:\s*var\(--surface-booking\)/u);
  assert.match(
    playfulSections,
    /\.contact-form[\s\S]*box-shadow:\s*var\(--card-backplate-offset\)\s+var\(--card-backplate-offset\)\s+0\s+var\(--card-backplate-color\)/u,
  );
  assert.match(
    playfulFoundation,
    /\.hero-side[\s\S]*box-shadow:\s*var\(--card-backplate-offset\)\s+var\(--card-backplate-offset\)\s+0\s+var\(--card-backplate-color\)/u,
  );
  assert.match(playfulSections, /\.rhythm-ribbon[\s\S]*background:\s*var\(--surface-ribbon\)/u);
  assert.match(playfulSections, /\.site-footer[\s\S]*background:\s*var\(--surface-footer\)/u);
  assert.doesNotMatch(playfulFoundation, /\.hero-section[\s\S]*linear-gradient/u);
  assert.doesNotMatch(playfulSections, /\.rhythm-ribbon[\s\S]*linear-gradient/u);
  assert.match(legalStyles, /\.legal-main[\s\S]*background:\s*var\(--surface-modalities\)/u);
  assert.match(legalStyles, /\.legal-hero[\s\S]*background:\s*var\(--surface-hero\)/u);
  assert.doesNotMatch(legalStyles, /\.legal-hero \.eyebrow/u);
  assert.match(legalStyles, /\.legal-content section[\s\S]*padding:\s*0/u);
  assert.match(
    legalStyles,
    /\.legal-content section::before[\s\S]*background:\s*var\(--sage-deep\)/u,
  );
  assert.doesNotMatch(legalStyles, /\.legal-content section:nth-child/u);
  assert.doesNotMatch(
    legalStyles,
    /\.legal-content section \{[^}]*?(?:border|box-shadow|background:\s*var\(--paper\))/u,
  );
  assert.doesNotMatch(legalStyles, /radial-gradient|linear-gradient/u);
});

test("keeps navigation centered and footer controls free of separator rules", async () => {
  const playfulFoundation = await readProjectFile(
    "app",
    "styles",
    "playful-foundation.css",
  );
  const playfulSections = await readProjectFile(
    "app",
    "styles",
    "playful-sections.css",
  );
  const legalStyles = await readProjectFile("app", "styles", "legal.css");
  const modalityCards = await readProjectFile(
    "app",
    "styles",
    "modality-cards.css",
  );

  assert.match(playfulFoundation, /scrollbar-width:\s*none/u);
  assert.match(playfulFoundation, /\.site-header-navigation-row[\s\S]*border:\s*0/u);
  assert.match(playfulFoundation, /\.site-header-navigation-shell[\s\S]*justify-content:\s*center[\s\S]*gap:/u);
  assert.match(playfulFoundation, /\.header-booking-link[\s\S]*position:\s*static/u);
  assert.match(playfulFoundation, /\.site-menu \.nav-link[\s\S]*color:\s*var\(--nav-accent\)/u);
  assert.match(playfulFoundation, /\.site-header-brand-row[\s\S]*min-height:\s*150px/u);
  assert.match(playfulFoundation, /\.brand-centered \.brand-mark[\s\S]*width:\s*98px/u);
  assert.match(playfulFoundation, /\.brand-centered strong[\s\S]*font-size:\s*clamp\(49px/u);
  assert.match(playfulFoundation, /\.hero-title[\s\S]*font-size:\s*clamp\(50px/u);
  assert.doesNotMatch(playfulFoundation, /\.brand-centered \.brand-name-layer[\s\S]*transition:\s*none/u);
  assert.match(playfulFoundation, /\.site-menu \.nav-link[\s\S]*font-size:\s*15px/u);
  assert.match(playfulFoundation, /\.site-menu \.nav-link[\s\S]*font-weight:\s*500/u);
  assert.match(playfulFoundation, /\.site-menu \.nav-link::after[\s\S]*opacity:\s*0;/u);
  assert.match(playfulFoundation, /\.nav-link-active::after/u);
  assert.match(modalityCards, /\.modality-card-inner[\s\S]*transform-style:\s*preserve-3d/u);
  assert.match(modalityCards, /\.modalities-grid[\s\S]*grid-auto-rows:\s*auto/u);
  assert.match(modalityCards, /\.modality-card[\s\S]*height:\s*280px/u);
  assert.match(modalityCards, /\.modality-card\.is-flipped \.modality-card-inner[\s\S]*rotateY\(180deg\)/u);
  assert.match(modalityCards, /\.modality-card\.is-flipped[\s\S]*height:\s*520px/u);
  assert.match(modalityCards, /@media \(hover:\s*hover\) and \(pointer:\s*fine\)[\s\S]*\.modality-card:hover \.modality-card-inner[\s\S]*rotateY\(180deg\)/u);
  assert.match(modalityCards, /\.modality-card-face[\s\S]*backface-visibility:\s*hidden/u);
  assert.match(modalityCards, /\.modality-card-front-content[\s\S]*margin:\s*auto 0/u);
  assert.match(modalityCards, /\.modality-card-back \.card-description[\s\S]*margin-bottom:\s*18px/u);
  assert.match(modalityCards, /\.modality-card\.sage[\s\S]*--tone-pale:\s*var\(--sky-pale\)/u);
  assert.match(modalityCards, /\.modality-card\.sage \.modality-card-face[\s\S]*background:\s*var\(--sky-pale\)/u);
  assert.match(playfulSections, /\.rhythm-ribbon[\s\S]*border:\s*0/u);
  assert.match(playfulSections, /\.rhythm-ribbon span[\s\S]*font-family:\s*var\(--font-body\)/u);
  assert.match(playfulSections, /\.rhythm-ribbon span[\s\S]*font-style:\s*normal/u);
  assert.match(playfulSections, /\.rhythm-ribbon span strong[\s\S]*font-weight:\s*800/u);
  assert.match(playfulSections, /\.rhythm-ribbon-group[\s\S]*gap:\s*0\.25em/u);
  assert.match(playfulSections, /\.rhythm-ribbon-group[\s\S]*padding-right:\s*0/u);
  assert.match(playfulSections, /\.back-to-top[\s\S]*width:\s*42px/u);
  assert.match(playfulSections, /\.back-to-top[\s\S]*border-radius:\s*50%/u);
  assert.match(playfulSections, /\.site-footer \.back-to-top[\s\S]*position:\s*absolute/u);
  assert.match(playfulSections, /\.site-footer \.footer-bottom > span[\s\S]*font-size:\s*12px/u);
  assert.doesNotMatch(playfulSections, /crisis-note/u);
  assert.doesNotMatch(legalStyles, /section \+ section[\s\S]*border-top/u);
});

test("composes the homepage from its new visual-language elements", async () => {
  const pageSource = await readProjectFile("app", "page.tsx");
  const headerSource = await readProjectFile("components", "SiteHeader.tsx");
  const footerSource = await readProjectFile("components", "SiteFooter.tsx");
  const artworkSource = await readProjectFile("components", "home", "HeroArtwork.tsx");
  const heroSource = await readProjectFile("components", "home", "HeroSection.tsx");
  const modalitiesSource = await readProjectFile("components", "home", "ModalitiesSection.tsx");
  const modalityCardSource = await readProjectFile("components", "home", "ModalityCard.tsx");
  const ribbonSource = await readProjectFile("components", "home", "RhythmRibbon.tsx");
  const ribbonPosition = footerSource.indexOf("<RhythmRibbon />");

  assert.match(pageSource, /<HeroSection\s*\/>/u);
  assert.match(headerSource, /<RotatingBrandName animated=\{false\}\s*\/>/u);
  assert.doesNotMatch(pageSource, /RhythmRibbon/u);
  assert.match(footerSource, /<RhythmRibbon\s*\/>/u);
  assert.ok(ribbonPosition >= 0, "the rhythm ribbon should remain in the footer");
  assert.doesNotMatch(footerSource, /crisis-note|Need urgent support/u);
  assert.doesNotMatch(footerSource, /footer-main|footer-brand/u);
  assert.match(heroSource, /A place for your whole self/u);
  assert.match(modalitiesSource, /Three ways to connect/u);
  assert.doesNotMatch(modalitiesSource, /Growth doesn’t always happen/u);
  assert.doesNotMatch(modalitiesSource, /These aren’t separate boxes/u);
  assert.match(artworkSource, /className="hero-artwork"/u);
  assert.match(modalityCardSource, /useState\(false\)/u);
  assert.match(modalityCardSource, /aria-expanded=\{isFlipped\}/u);
  assert.match(modalityCardSource, /onKeyDown=\{handleKeyDown\}/u);
  assert.match(modalityCardSource, /modality-card-front-content/u);
  assert.match(modalityCardSource, /item\.description/u);
  assert.doesNotMatch(modalityCardSource, /data-reveal/u);
  assert.doesNotMatch(heroSource, /data-reveal/u);
  assert.match(ribbonSource, /RHYTHM_GROUP_COUNT\s*=\s*12/u);
  assert.match(ribbonSource, /Pause/u);
  assert.match(ribbonSource, /Reconnect/u);
});
