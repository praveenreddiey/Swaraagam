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
  const revealSource = await readProjectFile(
    "components",
    "home",
    "RevealOnScroll.tsx",
  );
  const combinedSource = `${visualStyles}\n${revealSource}`;

  assert.match(visualStyles, /prefers-reduced-motion:\s*reduce/u);
  assert.match(visualStyles, /animation:\s*none/u);
  assert.match(revealSource, /IntersectionObserver/u);
  assert.match(revealSource, /prefers-reduced-motion:\s*reduce/u);
  assert.doesNotMatch(combinedSource, /secondwind\.org\.in|custom-domains\.chatgpt\.site/iu);
});

test("composes the homepage from its new visual-language elements", async () => {
  const pageSource = await readProjectFile("app", "page.tsx");
  const artworkSource = await readProjectFile("components", "home", "HeroArtwork.tsx");
  const heroSource = await readProjectFile("components", "home", "HeroSection.tsx");
  const ribbonSource = await readProjectFile("components", "home", "RhythmRibbon.tsx");

  assert.match(pageSource, /<HeroSection\s*\/>/u);
  assert.match(pageSource, /<RhythmRibbon\s*\/>/u);
  assert.match(heroSource, /A place for your whole self/u);
  assert.match(artworkSource, /className="hero-artwork"/u);
  assert.match(ribbonSource, /Pause/u);
  assert.match(ribbonSource, /Reconnect/u);
});
