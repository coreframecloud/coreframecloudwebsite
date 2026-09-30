import clsx from "clsx";
import Image from "next/image";

/**
 * The Coreframe wordmark.
 *
 * This used to be live text with CSS letter-spacing, which meant the mark
 * rendered differently anywhere the font was missing or substituted — and it
 * could not be reused outside the browser, so the invoice and the letterhead
 * each drew their own approximation of it.
 *
 * It is now one shared vector asset (`/brand/coreframe-logo-*.svg`), generated
 * from glyph outlines by `brand/make_logo.py` in the control-plane repo. Same
 * file on the website, the tax invoice and the letterhead. The E of CORE and
 * the F of FRAME are kerned tight enough to read as a single word in two
 * colours, which is the whole idea of the mark and is exactly what CSS
 * letter-spacing could not be relied upon to reproduce.
 *
 * `variant` picks the colour of CORE. FRAME is always Coreframe blue.
 *   dark   — near-black CORE, for white backgrounds. THE DEFAULT, because the
 *            site is white paper.
 *   light  — white CORE, for a dark ground: the mono .cf-term blocks, an OG
 *            image, a dark slide.
 *
 * The default used to be `light`, from when the site was dark. Neither the
 * header nor the footer passes a variant, so the moment the background became
 * white the C-O-R-E half of the wordmark went white-on-white and the brand
 * read as "FRAME" on every page. Nothing errored; the logo was simply half
 * absent. If you invert a surface, pass variant="light" there rather than
 * changing this default back.
 */

type Props = {
  /** Height of the wordmark in pixels. Width follows the 9.1:1 aspect ratio. */
  iconSize?: number;
  className?: string;
  /** Kept for call-site compatibility; the mark itself does not animate. */
  animated?: boolean;
  compact?: boolean;
  variant?: "light" | "dark";
};

// Intrinsic ratio of the generated SVG (viewBox 6437.0 x 772.0).
// The box is measured from the real ink bounds, so it already accounts for the
// round-letter overshoot on C and O and for the emboldening stroke. Regenerate
// the mark and this number changes — read it off the SVG's viewBox.
const ASPECT = 6437.0 / 772.0;

export function CoreframeWordmarkAtlas({
  iconSize = 56,
  className,
  compact = false,
  variant = "dark",
}: Props) {
  // The old API took an icon box size and derived a font size from it. Keep the
  // same call sites working by mapping that to a sensible wordmark height.
  const height = compact ? 16 : Math.max(18, Math.round(iconSize * 0.36));
  const width = Math.round(height * ASPECT);

  return (
    <Image
      src={`/brand/coreframe-logo-${variant}.svg`}
      alt="COREFRAME"
      width={width}
      height={height}
      priority
      className={clsx("select-none", className)}
      style={{ height, width: "auto" }}
    />
  );
}
