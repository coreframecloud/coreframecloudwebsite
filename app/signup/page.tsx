import type { Metadata } from "next";
import { WhyWeVerify } from "@/components/auth/why-we-verify";
import { NODE } from "@/lib/node-spec";
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
 *
 * THE TITLE AND DESCRIPTION ARE GENERATED, NOT TYPED. They carried "200 GPU
 * minutes" and "20 GB of storage" as literals, which is the one number on this
 * page nobody may hardcode: the day the control plane changes the trial, or
 * switches it off, a static string goes on promising it in the search result
 * that brought the person here. `generateMetadata` reads the same rate card the
 * body does, and says nothing about a trial when there is no trial to honour.
 */

export async function generateMetadata(): Promise<Metadata> {
  const card = await getRateCard();
  const trial = getTrialTerms(card);
  const hourly = adhocRateHourly(card);
  const after = hourly ? ` Billed by the minute after that, from ${hourly}.` : " Billed by the minute after that.";

  // The root layout appends " | Coreframe Cloud" via its title template.
  return {
    title: trial
      ? `Start free — ${trial.gpu_minutes} GPU minutes on an ${NODE.gpu}`
      : `Create your Coreframe account`,
    description: trial
      ? `Create a Coreframe account and get ${trial.gpu_minutes} free GPU minutes on an ${NODE.gpu} with ${trial.storage_gb} GB of storage. No card needed.${after}`
      : `Create a Coreframe account and run an ${NODE.gpu} workstation from the laptop you already own.${hourly ? ` Billed by the minute, from ${hourly}.` : " Billed by the minute."}`,
    alternates: { canonical: "/signup" },
  };
}

export default async function SignupPage() {
  const card = await getRateCard();
  const trial = getTrialTerms(card);
  const hourly = adhocRateHourly(card);

  const offer = trial
    ? [
        `${trial.gpu_minutes} free GPU minutes on an ${NODE.gpu}`,
        `${trial.storage_gb} GB storage`,
        "no card",
        hourly ? `${hourly} after that` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : undefined;

  return (
    <div className="relative min-h-screen text-ink">
      <div className="cf-aurora" />
      <main className="relative flex min-h-screen justify-center px-5 py-10 sm:items-center sm:py-16">
        <div className="w-full max-w-[440px]">
          {/* The offer used to be a box here, above the card. It read well and
              it cost us the campaign: it pushed the email input to 673px on a
              657px viewport, so 87 people landed and none reached the field.
              It is one line under the headline now, still rendered from the
              live rate card and never from a hardcoded number. Nothing else
              goes above the form on this page. */}
          <LoginForm variant="start" offer={offer} />

          <WhyWeVerify trialMinutes={trial?.gpu_minutes ?? null} trialStorageGb={trial?.storage_gb} />
        </div>
      </main>
    </div>
  );
}
