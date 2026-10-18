import Link from "next/link";
import {
  adhocRateHourly,
  getIntroOffer,
  getRateCard,
  hoursLabel,
  rupees,
} from "@/lib/rate-card";
import type { Currency } from "@/lib/money";

/**
 * The intro offer, above the header on every page. A rolling ticker.
 *
 * Was the free-trial strip until paid-first onboarding (10 Oct 2026): no more
 * free minutes and no more ID check — the first top-up carries the offer.
 *
 * THIRD VERSION, AND THE REASONING MATTERS. It started as pale blue on a pale
 * blue wash — the lowest-contrast thing on the site, in the position seen
 * first, saying the thing most likely to start a sign-up. It read as a cookie
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
 * when there is no intro offer — never advertise what billing will not grant.
 * That includes every visitor shown US-dollar prices (owner, 18 Oct 2026: one
 * currency per visitor): the offer is a rupee first top-up that an account
 * billed in dollars never gets, so for them there is no bar.
 */
export async function IntroStrip({ currency = "INR" }: { currency?: Currency }) {
  if (currency === "USD") return null;
  const card = await getRateCard();
  const offer = getIntroOffer(card);
  if (!offer) return null;
  const hourly = adhocRateHourly(card);
  const headline = `First top-up: ${rupees(offer.priceRupees)} = ${hoursLabel(offer.hours)}`;
  const gpu = offer.gpuName ? `of ${offer.gpuName}` : "of GPU time";

  // One pass of the message. Rendered several times so the loop has no seam,
  // and so a wide monitor is never showing empty bar.
  const segments = [
    { strong: headline, rest: gpu },
    { strong: "No paperwork", rest: "just your email and mobile number" },
    { strong: "International cards", rest: "accepted" },
    { strong: "Billed by the minute", rest: hourly ? `${hourly} after that, GST included` : "GST included" },
  ];

  const pass = (key: string) => (
    <div className="cf-ticker-pass" key={key} aria-hidden={key !== "a"}>
      {segments.map((s, i) => (
        <span key={i} className="cf-ticker-item">
          <span className="font-semibold text-white">{s.strong}</span>
          {/* Explicit {" "}. A literal space written as `> {s.rest}` gets
              trimmed by JSX at the tag boundary, which rendered
              "No paperworkemail and mobile". */}
          {" "}
          <span className="text-white/75">{s.rest}</span>
          <span className="cf-ticker-dot" aria-hidden="true" />
        </span>
      ))}
      <span className="cf-ticker-item">
        <span className="font-semibold text-white underline decoration-white/50 underline-offset-4">
          Get started →
        </span>
        <span className="cf-ticker-dot" aria-hidden="true" />
      </span>
    </div>
  );

  return (
    <Link
      href="/signup"
      className="cf-ticker group block bg-blue"
      aria-label={`${headline} ${gpu}. No paperwork. Billed by the minute.`}
    >
      <div className="cf-ticker-track">
        {pass("a")}
        {pass("b")}
        {pass("c")}
      </div>
    </Link>
  );
}
