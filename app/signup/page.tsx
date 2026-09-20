import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import { WhyWeVerify } from "@/components/auth/why-we-verify";
import { adhocRateHourly, getRateCard, getTrialTerms, perMinuteRate } from "@/lib/rate-card";
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
  const perMin = perMinuteRate(card);

  return (
    <div className="relative min-h-screen text-white">
      <BackgroundGlow />
      <main className="relative flex min-h-screen items-center justify-center px-4 py-24">
        <div className="w-full max-w-[440px]">
          {/* The ad's promise, restated where the ad lands. Rendered only from
              the live rate card — never a hardcoded number, because the whole
              reason this file can quote a price is that lib/rate-card.ts is the
              single source both this page and billing read. */}
          {trial ? (
            <div className="mb-8 rounded-2xl border border-cyan-400/25 bg-cyan-400/[0.07] px-5 py-4 text-center">
              <p className="text-sm font-semibold text-white">
                {trial.gpu_minutes} free GPU minutes on an RTX 5080
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                {trial.storage_gb} GB storage included · no card needed
                {hourly ? <> · {hourly} after that</> : null}
                {perMin ? <>, billed by the minute</> : null}
              </p>
            </div>
          ) : null}

          <LoginForm variant="start" />

          <WhyWeVerify trialMinutes={trial?.gpu_minutes ?? null} />
        </div>
      </main>
    </div>
  );
}
