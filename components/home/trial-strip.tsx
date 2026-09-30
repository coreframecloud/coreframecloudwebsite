import Link from "next/link";
import { getRateCard, getTrialTerms } from "@/lib/rate-card";

/**
 * The trial offer, above the header on every page. A rolling ticker.
 *
 * THIRD VERSION, AND THE REASONING MATTERS. It started as pale blue on a pale
 * blue wash — the lowest-contrast thing on the site, in the position seen
 * first, saying the thing most likely to start a trial. It read as a cookie
 * notice. Then it went near-black, which was legible but disappeared into the
 * browser chrome: a dark bar under a dark tab strip is a bar nobody sees.
 *
 * Bright brand blue, full bleed, white type, and it MOVES. On white paper
 * that is the strongest mark available, and motion is what the eye catches
 * before it has read anything.
 *
 * NO FLASHING, and that is not timidity. A flash rate above three per second
 * is a documented seizure risk (WCAG 2.3.1) and this bar is on every page of
 * the site. Steady horizontal travel gets the same attention with none of
 * that, and it does not read as an ad.
 *
 * NO SECOND ACCENT COLOUR either. Reaching for orange or yellow to "pop"
 * would put a colour on the most-seen element of the site that appears
 * nowhere else in it. The blue is already vivid; the contrast that makes it
 * shout is blue against white, not blue against another hue.
 *
 * Every figure comes from the control plane, and the whole bar disappears
 * when there is no trial — never advertise what the platform will refuse
 * after someone has handed over their ID.
 */
export async function TrialStrip() {
  const terms = getTrialTerms(await getRateCard());
  if (!terms) return null;

  // One pass of the message. Rendered several times so the loop has no seam,
  // and so a wide monitor is never showing empty bar.
  const segments = [
    { strong: `${terms.gpu_minutes} free minutes`, rest: "on a real RTX 5080" },
    { strong: `${terms.storage_gb} GB storage`, rest: "included" },
    { strong: "No card needed", rest: "start in two minutes" },
    { strong: "Billed by the minute", rest: "GST included" },
  ];

  const pass = (key: string) => (
    <div className="cf-ticker-pass" key={key} aria-hidden={key !== "a"}>
      {segments.map((s, i) => (
        <span key={i} className="cf-ticker-item">
          <span className="font-semibold text-white">{s.strong}</span>
          {/* Explicit {" "}. A literal space written as `> {s.rest}` gets
              trimmed by JSX at the tag boundary, which rendered
              "20 GB storageincluded". */}
          {" "}
          <span className="text-white/75">{s.rest}</span>
          <span className="cf-ticker-dot" aria-hidden="true" />
        </span>
      ))}
      <span className="cf-ticker-item">
        <span className="font-semibold text-white underline decoration-white/50 underline-offset-4">
          Start free →
        </span>
        <span className="cf-ticker-dot" aria-hidden="true" />
      </span>
    </div>
  );

  return (
    <Link
      href="/signup"
      className="cf-ticker group block bg-blue"
      aria-label={`Start free: ${terms.gpu_minutes} free GPU minutes on an RTX 5080, ${terms.storage_gb} GB storage, no card needed`}
    >
      <div className="cf-ticker-track">
        {pass("a")}
        {pass("b")}
        {pass("c")}
      </div>
    </Link>
  );
}
