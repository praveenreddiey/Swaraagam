import type { LineIconName } from "./content";

/** Render a decorative, CSS-drawn line icon for a homepage concept. */
export function LineIcon({ name }: { name: LineIconName }) {
  return (
    <span className={`line-icon line-icon-${name}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}
