import Link from "next/link";
import {
  adhocRateHourly,
  introOfferFor,
  getRateCard,
  hoursLabel,
  introPrice,
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
 * One currency per visitor (owner, 18 Oct 2026): a visitor shown US-dollar
 * prices sees the dollar offer ($20 = 8 hours, owner 18 Oct 2026), and only
 * while the control plane publishes it as `usd.intro_offer`; otherwise no bar.
 */
export async function IntroStrip({ currency = "INR" }: { currency?: Currency }) {
  const card = await getRateCard();
  const offer = introOfferFor(card, currency);
  if (!offer) return null;
  const hourly = adhocRateHourly(card, currency);
  const headline = `First top-up: ${introPrice(offer)} = ${hoursLabel(offer.hours)}`;
  const gpu = offer.gpuName ? `of ${offer.gpuName}` : "of GPU time";

  // One pass of the message. Rendered several times so the loop has no seam,
  // and so a wide monitor is never showing empty bar.
  const segments = [
    { strong: headline, rest: gpu },
    { strong: "No paperwork", rest: "just your email and mobile number" },
    { strong: "International cards", rest: "accepted" },
    // One all-in price, no tax words in the banner (owner, 19 Oct 2026); the
    // GST invoice already carries the split.
    { strong: "Billed by the minute", rest: hourly ? `${hourly} after that` : "for the minutes you use" },
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
