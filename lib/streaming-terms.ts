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

const NBSP = " ";
const B = STREAM_BANDWIDTH;

/** The full statement, for prose and FAQ answers. */
export const BANDWIDTH_SENTENCE =
  `4K at 60${NBSP}fps looks its best on about ${B.best4kMbps}${NBSP}Mbps and still holds up at ` +
  `${B.workable4kMbps}. 1080p is comfortable on ${B.comfortable1080pMbps}${NBSP}Mbps.`;

/** One line, for a bullet list. */
export const BANDWIDTH_SHORT =
  `About ${B.comfortable1080pMbps}${NBSP}Mbps for 1080p. 4K looks best on about ` +
  `${B.best4kMbps} and holds up at ${B.workable4kMbps}`;
