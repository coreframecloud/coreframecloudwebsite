import type { Metadata } from "next";
import type { Currency } from "@/lib/money";
import {
  adhocRateHourly,
  introOfferFor,
  getRateCard,
  hoursLabel,
  introPrice,
  introMoreGpusNote,
  withArticle,
  introOfferShort,
  ladderRanges,
} from "@/lib/rate-card";
import LoginForm from "../login/login-form";

/**
 * /signup used to be `redirect("/login")`.
 *
 * Three things were wrong with that, and a paid campaign made all three
 * visible on 19 Sep 2026 — 551 ad clicks, 161 landing page views, 0 signups:
 *
 *  1. The destination was headed "Sign In — Coreframe Cloud". Someone who met
 *     the brand ten seconds ago in an ad is not signing back in.
 *  2. Next's redirect() drops the query string, so every utm_* parameter the ad
 *     carried died on arrival and no signup could ever be attributed to a
 *     campaign. The attribution columns were there; nothing could fill them.
 *  3. The page that answered the ad did not repeat the ad's promise.
 *
 * PAID-FIRST (10 Oct 2026). The free trial and the identity-document check are
 * gone: sign-up is email + a one-time code to the mobile, and paying is the
 * filter. The offer line is the intro offer from the live rate card — never a
 * typed number — and says nothing when the control plane publishes no offer.
 *
 * ONE CURRENCY PER VISITOR (owner, 18 Oct 2026). Rendered twice, like every
 * priced page: /signup in rupees and app/usd/signup in US dollars, which
 * proxy.ts serves to visitors outside India. The dollar copy shows the dollar
 * offer ($20 = 8 hours, owner 18 Oct 2026) only while the API publishes it.
 */

export async function signupMetadata(currency: Currency): Promise<Metadata> {
  const card = await getRateCard();
  const offer = introOfferFor(card, currency);
  const hourly = adhocRateHourly(card, currency);

  // The root layout appends " | Coreframe Cloud" via its title template.
  return {
    title: offer
      ? `Sign up — ${introPrice(offer)} = ${hoursLabel(offer.hours)}${offer.gpuName ? ` on ${withArticle(offer.gpuName)}` : ""}`
      : `Create your Coreframe account`,
    description: offer
      ? `Sign up with your email and mobile, no paperwork. Your first top-up of ${introPrice(offer)} buys ${hoursLabel(offer.hours)}${offer.gpuName ? ` on ${withArticle(offer.gpuName)}` : ""}.${hourly ? ` Billed by the minute, ${hourly} after that.` : " Billed by the minute."}`
      : `Create a Coreframe account and run a GPU workstation from the laptop you already own.${hourly ? ` Billed by the minute, from ${hourly}.` : " Billed by the minute."}`,
    alternates: { canonical: "/signup" },
  };
}

export default async function SignupView({ currency }: { currency: Currency }) {
  const usdView = currency === "USD";
  const card = await getRateCard();
  const intro = introOfferFor(card, currency);
  const hourly = adhocRateHourly(card, currency);
  // "from ₹99/hr" once more than one GPU is public: the bare cheapest rate
  // after the offer would read as the rate for the card the hours are on.
  const fromHourly = (ladderRanges(card)?.count ?? 0) > 1 ? "from " : "";

  const offer = intro
    ? [
        `First top-up ${introOfferShort(intro).main}${introOfferShort(intro).alt ? `, ${introOfferShort(intro).alt}` : ""}`,
        "no paperwork",
        hourly ? `${fromHourly}${hourly} after that${usdView ? ", no GST" : ""}` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "Just your email and mobile, no paperwork. Pay by the minute.";

  return (
    <div className="relative min-h-screen text-ink">
      <div className="cf-aurora" />
      <main className="relative flex min-h-screen justify-center px-5 py-10 sm:items-center sm:py-16">
        <div className="w-full max-w-lg">
          {/* The offer used to be a box here, above the card. It read well and
              it cost us the campaign: it pushed the email input to 673px on a
              657px viewport, so 87 people landed and none reached the field.
              It is one line under the headline now, rendered from the live
              rate card. Nothing else goes above the form on this page. */}
          <div data-cf-section="signup_form">
            <LoginForm variant="start" offer={offer} />
          </div>

          {/* Quiet, like the card above it: an inset panel and a small heading,
              not a section-sized title competing with "Create your account". */}
          <section className="cf-glass-inset mt-6 p-5 sm:p-6" data-cf-section="how">
            <h2 className="font-display text-lg leading-snug font-medium text-ink">How sign-up works</h2>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-ink-2">
              <li>
                <b className="font-medium text-ink">1. Your email.</b> We send you a link, so
                there&rsquo;s no password to remember.
              </li>
              <li>
                <b className="font-medium text-ink">2. Your mobile.</b> We send a one-time code
                to confirm it, because Indian regulations (CERT-In) require a verified contact number
                for compute rental. Any country code works.
              </li>
              <li>
                <b className="font-medium text-ink">3. Add funds.</b>{" "}
                {intro
                  ? `Your first top-up of ${introPrice(intro)} buys ${hoursLabel(intro.hours)}${intro.gpuName ? ` of ${intro.gpuName}` : ""}${introMoreGpusNote(intro)}.`
                  : "Top up your wallet and start a session."}{" "}
                {usdView
                  ? "Pay by card in US dollars, with no GST, and the invoice is issued automatically."
                  : "Pay by card, UPI or netbanking (international cards work too), and the invoice is issued automatically."}
              </li>
            </ol>
            <p className="mt-4 text-xs leading-5 text-ink-3">
              You don&rsquo;t upload Aadhaar, a passport or any other ID.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
