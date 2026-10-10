import type { Metadata } from "next";
import { NODE } from "@/lib/node-spec";
import {
  adhocRateHourly,
  getIntroOffer,
  getRateCard,
  hoursLabel,
  rupees,
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
 * gone: sign-up is email + a WhatsApp code to the mobile, and paying is the
 * filter. The offer line is the intro offer from the live rate card — never a
 * typed number — and says nothing when the control plane publishes no offer.
 */

export async function generateMetadata(): Promise<Metadata> {
  const card = await getRateCard();
  const offer = getIntroOffer(card);
  const hourly = adhocRateHourly(card);

  // The root layout appends " | Coreframe Cloud" via its title template.
  return {
    title: offer
      ? `Create your account — ${rupees(offer.priceRupees)} = ${hoursLabel(offer.hours)} on an ${NODE.gpu}`
      : `Create your Coreframe account`,
    description: offer
      ? `Create a Coreframe account with your email and mobile, no paperwork. Your first top-up of ${rupees(offer.priceRupees)} buys ${hoursLabel(offer.hours)} on an ${NODE.gpu}.${hourly ? ` Billed by the minute, ${hourly} after that.` : " Billed by the minute."}`
      : `Create a Coreframe account and run an ${NODE.gpu} workstation from the laptop you already own.${hourly ? ` Billed by the minute, from ${hourly}.` : " Billed by the minute."}`,
    alternates: { canonical: "/signup" },
  };
}

export default async function SignupPage() {
  const card = await getRateCard();
  const intro = getIntroOffer(card);
  const hourly = adhocRateHourly(card);

  const offer = intro
    ? [
        `First top-up: ${rupees(intro.priceRupees)} = ${hoursLabel(intro.hours)}${intro.gpuName ? ` of ${intro.gpuName}` : ""}`,
        "no paperwork",
        hourly ? `${hourly} after that` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "Just your email and mobile, no paperwork. Pay by the minute.";

  return (
    <div className="relative min-h-screen text-ink">
      <div className="cf-aurora" />
      <main className="relative flex min-h-screen justify-center px-5 py-10 sm:items-center sm:py-16">
        <div className="w-full max-w-[440px]">
          {/* The offer used to be a box here, above the card. It read well and
              it cost us the campaign: it pushed the email input to 673px on a
              657px viewport, so 87 people landed and none reached the field.
              It is one line under the headline now, rendered from the live
              rate card. Nothing else goes above the form on this page. */}
          <LoginForm variant="start" offer={offer} />

          <section className="mt-8 rounded-cf border border-rule bg-paper-2 p-6">
            <h2 className="cf-section-title">How sign-up works</h2>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-ink-2">
              <li>
                <b className="font-medium text-ink">1. Your email.</b> We send you a link, so
                there&rsquo;s no password to remember.
              </li>
              <li>
                <b className="font-medium text-ink">2. Your mobile.</b> We send a one-time code
                on WhatsApp, because Indian regulations (CERT-In) require a verified contact number
                for compute rental. Any country code works.
              </li>
              <li>
                <b className="font-medium text-ink">3. Add funds.</b>{" "}
                {intro
                  ? `Your first top-up of ${rupees(intro.priceRupees)} buys ${hoursLabel(intro.hours)}${intro.gpuName ? ` of ${intro.gpuName}` : ""}.`
                  : "Top up your wallet and start a session."}{" "}
                Pay by card, UPI or netbanking (international cards work too), and the invoice
                is issued automatically.
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
