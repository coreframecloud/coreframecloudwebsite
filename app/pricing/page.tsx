import type { Metadata } from "next";
import { PricingSection } from "@/components/home/pricing-section";
import { ExplainerFaq } from "@/components/home/explainer-faq";
import {
  getRateCard,
  formatHourly,
  getTrialTerms,
  billingSentence,
  bestOverageRate,
  entryPlanFee,
  storageRatePerTb,
  perMinuteRate,
  sessionCostExample,
  commitmentIsCheaper,
} from "@/lib/rate-card";
import { storageTerms } from "@/lib/storage-terms";

export const metadata: Metadata = {
  title: "Pricing — Coreframe Cloud",
  description:
    "What an RTX 5080 workstation costs by the minute, what a committed monthly plan costs, and what happens to your files between sessions. Prices in rupees with GST included, billed per minute of actual use.",
  alternates: { canonical: "/pricing" },
};

/**
 * Pricing got its own page when the landing page was rebuilt.
 *
 * It used to be an anchor, `/#pricing`, three-quarters of the way down a very
 * long homepage. Nine places across the site linked to that anchor and the nav
 * pointed at it, which meant "Pricing" scrolled you into the middle of a sales
 * page instead of answering the question.
 *
 * The FAQ lives here too, and that is not filler. It carries the site's
 * FAQPage structured data — live markup Google is already using — and it was
 * orphaned when it came off the landing page. Its questions are almost all
 * about money and commitment, so this is where they belonged anyway.
 *
 * Every figure comes from the control-plane rate card. Nothing on this page is
 * a typed price.
 */
export default async function PricingPage() {
  const rateCard = await getRateCard();
  const entry = rateCard?.gpus.find((g) => !g.quote_on_request);
  const adhocRate = entry ? formatHourly(entry).replace("/hr", "") : undefined;
  const trial = getTrialTerms(rateCard);
  const storage = storageTerms(rateCard);

  return (
    <main className="text-ink">
      <section className="cf-section px-5 pb-0">
        <div className="cf-col">
          <p className="cf-eyebrow mb-5">Pricing</p>
          <h1 className="cf-display">Two ways to pay for it.</h1>
          {/* cf-col caps this at 680px. The old version ran the full width of
              a max-w-7xl container, which is why it broke "16 GB" from "GDDR7"
              mid-line — a measure that long has no good break points. */}
          <p className="cf-lead mt-[22px]">
            Pay by the minute when you need a machine for an afternoon, or
            commit monthly if you are on it every week. Same hardware either
            way, same Bengaluru rack. Every price here includes GST and comes
            with a tax invoice.
          </p>
        </div>
      </section>

      <PricingSection
        adhocRate={adhocRate}
        storage={storage}
        billingNote={billingSentence(rateCard)}
        bestOverage={bestOverageRate(rateCard)}
        entryPlanFee={entryPlanFee(rateCard)}
        storageRate={storageRatePerTb(rateCard)}
        perMinute={perMinuteRate(rateCard)}
        example={sessionCostExample(rateCard)}
        commitmentCheaper={commitmentIsCheaper(rateCard)}
      />

      <div className="cf-rule" />

      <ExplainerFaq storage={storage} trial={trial} adhocRate={adhocRate} />
    </main>
  );
}
