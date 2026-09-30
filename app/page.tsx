import type { Metadata } from "next";
import { ValueHero } from "@/components/home/landing/value-hero";
import { MachineSection } from "@/components/home/landing/machine-section";
import { CostOfWaitingSection } from "@/components/home/cost-of-waiting-section";
import { OldWayNewWay } from "@/components/home/landing/old-way-new-way";
import { DisciplineCards } from "@/components/home/landing/discipline-cards";
import { VersusSection } from "@/components/home/landing/versus-section";
import { BuiltForStrip } from "@/components/home/landing/built-for-strip";
import {
  WalkthroughSection,
  WALKTHROUGH_YOUTUBE_ID,
} from "@/components/home/landing/walkthrough-section";
import { RateCardSection } from "@/components/home/landing/rate-card-section";
import {
  getRateCard,
  adhocRateValue,
  formatHourly,
  getTrialTerms,
} from "@/lib/rate-card";
import { storageTerms } from "@/lib/storage-terms";

export const metadata: Metadata = {
  title: "RTX 5080 workstations by the hour — Coreframe Cloud",
  description:
    "A real Windows workstation with a current-generation RTX 5080, opened from the laptop you already own and streamed in 4K. Billed per minute with GST included, hosted in Bengaluru. No month to commit to and nothing to cancel.",
  alternates: { canonical: "/" },
  other: { "contact:email": "admin@coreframecloud.com" },
};

/**
 * The landing page, rebuilt from the approved draft.
 *
 * THE ORDER IS THE ARGUMENT, and it is not the old one. The previous page was
 * an explainer: here is a concept, here is how it works, here are some
 * benefits. That answers "what is this" for someone who has not yet agreed
 * they have a problem, and it opened by quoting the price of a workstation —
 * a feature, aimed at a stranger.
 *
 * This page assumes the visitor has already arrived and is deciding whether we
 * are worth their next two minutes. So:
 *
 *   1  worth        what we are worth to your studio, in one sentence
 *   2  machine      exactly what you get, as a spec block, with the honest
 *                   bandwidth you need at your end
 *   3  the turn     you are not paid to watch a progress bar
 *   4  arithmetic   price the waiting YOURSELF — we invent no figure
 *   5  who          four disciplines, four different constraints
 *   6  difference   not a monthly RDP box, and here is the comparison
 *   7  recognition  postures a reader sees themselves in (NOT testimonials —
 *                   we have no customers to quote and will not invent any)
 *   8  proof        one unedited session, no cuts
 *   9  the offer    the whole rate card, then two doors
 *
 * Every figure is read from the live rate card. Nothing on this page is a
 * typed price, and where a value is missing the line disappears rather than
 * quoting a stale one.
 *
 * Deliberately NOT on this page any more: HowItWorksSection, BenefitsSection,
 * PricingSection, ExplainerFaq, ContactSection, ClosingCta. They said the same
 * things three times in different words, which is what made the page long
 * without making it persuasive. The FAQ carried FAQPage schema — it needs
 * re-homing on /pricing rather than deleting.
 */
export default async function Page() {
  const rateCard = await getRateCard();

  // The live rate, twice: formatted for display, and as a number for the
  // calculator's arithmetic. Both null-safe — see the note in each section.
  const entry = rateCard?.gpus.find((g) => !g.quote_on_request);
  const adhocRate = entry ? formatHourly(entry).replace("/hr", "") : undefined;
  const adhocRateNumber = adhocRateValue(rateCard);

  // Trial figures vanish the moment trials are switched off in the control
  // plane, rather than advertising an offer the platform will refuse after
  // someone has handed over their ID.
  const trial = getTrialTerms(rateCard);
  const trialMinutes = trial?.enabled ? trial.gpu_minutes : undefined;

  const storage = storageTerms(rateCard);

  return (
    <main className="text-ink">
      <ValueHero />

      {/* The four wins sit BETWEEN the promise and the spec, which is where a
          reader actually is at this point: they have just been told we are
          worth something and they want to know what that means before they
          care what is in the box. The spec block answers "what am I renting";
          this answers "why would I", and that question comes first.

          It was under the calculator until now, which put four screens of
          arithmetic between the headline and the reason to keep reading. */}
      <section className="cf-section px-5 pt-0">
        <div className="cf-wide">
          <OldWayNewWay />
        </div>
      </section>
      <div className="cf-rule" />

      <MachineSection adhocRate={adhocRate} storage={storage} />
      <div className="cf-rule" />

      <CostOfWaitingSection ratePerHour={adhocRateNumber} />

      {/* The proof goes HERE, immediately under the benefits, not eight
          screens further down where it used to sit. The strike block is the
          hook — it makes four claims in four lines — and the very next thing a
          sceptical reader wants is to watch someone actually do it. Putting a
          full uncut session between the claim and the price is the cheapest
          way to answer "yes but does it really work like that". */}
      <WalkthroughSection youtubeId={WALKTHROUGH_YOUTUBE_ID} />
      <div className="cf-rule" />

      <DisciplineCards />
      <div className="cf-rule" />

      <VersusSection trialMinutes={trialMinutes} />
      <div className="cf-rule" />

      <section className="cf-section px-5">
        <div className="cf-col">
          <p className="cf-eyebrow mb-5">Who this is built for</p>
          <h2 className="cf-section-title">
            The kind of studio that treats an hour as something it owns.
          </h2>
          <p className="cf-section-copy mt-4">
            Not everyone needs this. If a render finishing overnight has never cost you anything,
            it won&rsquo;t now. These are the people we built it for.
          </p>
        </div>
      </section>
      <BuiltForStrip />
      <div className="cf-rule" />

      {/* The walkthrough, published 30 Sep 2026. One id, used by both the
          embed and the VideoObject schema in walkthrough-section.tsx. */}
      <RateCardSection adhocRate={adhocRate} trialMinutes={trialMinutes} />
    </main>
  );
}
