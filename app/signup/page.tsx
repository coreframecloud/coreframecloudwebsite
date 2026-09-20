import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import { WhyWeVerify } from "@/components/auth/why-we-verify";
import { adhocRateHourly, getRateCard, getTrialTerms } from "@/lib/rate-card";
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
 *  3. The ad promised free minutes and the page that answered it mentioned
 *     none of them, and said nothing about the ID check waiting one screen
 *     later — the step where roughly fifty people have already gone quiet.
 *
 * So this is a real page now: the same form, the promise the ad made repeated
 * where it lands, and the ID check explained before it is asked for.
 */

export const metadata: Metadata = {
  // The root layout appends " | Coreframe Cloud" via its title template.
  title: "Start free — 200 GPU minutes on an RTX 5080",
  description:
    "Create a Coreframe account and get 200 free GPU minutes on an RTX 5080 with 20 GB of storage. No card needed. Billed by the minute after that.",
  alternates: { canonical: "/signup" },
};

export default async function SignupPage() {
  const card = await getRateCard();
  const trial = getTrialTerms(card);
  const hourly = adhocRateHourly(card);

  const offer = trial
    ? [
        `${trial.gpu_minutes} free GPU minutes on an RTX 5080`,
        `${trial.storage_gb} GB storage`,
        "no card",
        hourly ? `${hourly} after that` : null,
      ]
        .filter(Boolean)
        .join(" \u00b7 ")
    : undefined;

  return (
    <div className="relative min-h-screen text-white">
      <BackgroundGlow />
      <main className="relative flex min-h-screen justify-center px-4 py-10 sm:items-center sm:py-16">
        <div className="w-full max-w-[440px]">
          {/* The offer used to be a box here, above the card. It read well and
              it cost us the campaign: it pushed the email input to 673px on a
              657px viewport, so 87 people landed and none reached the field.
              It is one line under the headline now, still rendered from the
              live rate card and never from a hardcoded number. */}
          <LoginForm variant="start" offer={offer} />

          <WhyWeVerify trialMinutes={trial?.gpu_minutes ?? null} />
        </div>
      </main>
    </div>
  );
}
