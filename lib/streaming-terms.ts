/**
 * How much connection the stream needs, stated once.
 *
 * The site used to give three different answers: "about 25 Mbps" as a floor in
 * the FAQ, llms.txt and the D5 page, "20 at 1080p, 50 for 4K" on /about and
 * /how-to-use, and "50, holds up at 35, 20 for 1080p" on the home page. These
 * are the home page's per-resolution figures, and every page reads them from
 * here so they cannot drift apart again.
 */
export const STREAM_BANDWIDTH = {
  /** Mbps at which the 4K / 60 fps stream looks its best. */
  best4kMbps: 50,
  /** Mbps at which the 4K stream still holds up. */
  workable4kMbps: 35,
  /** Mbps that is comfortable for a 1080p stream. */
  comfortable1080pMbps: 20,
} as const;

// A non-breaking space keeps "50 Mbps" on one line. Written as an escape and
// joined with +, not inside a template literal: the production bundler dropped
// the words after a raw U+00A0 inside a template, and /download showed
// "About 20 50 and holds up at 35" (21 Oct 2026).
const nb = "\u00a0";
const B = STREAM_BANDWIDTH;

/** The full statement, for prose and FAQ answers. */
export const BANDWIDTH_SENTENCE =
  "4K at 60" + nb + "fps looks its best on about " + B.best4kMbps + nb + "Mbps and still holds up at " +
  B.workable4kMbps + nb + "Mbps. 1080p is comfortable on " + B.comfortable1080pMbps + nb + "Mbps.";

/** One line, for a bullet list. */
export const BANDWIDTH_SHORT =
  "Internet: about " + B.comfortable1080pMbps + nb + "Mbps for 1080p. 4K looks best at " +
  B.best4kMbps + nb + "Mbps and holds up at " + B.workable4kMbps + nb + "Mbps.";
