import type { Metadata } from "next";
import { ViewContent } from "@/components/analytics/view-content";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbList } from "@/lib/seo";
import { PricingSection } from "@/components/home/pricing-section";
import { ExplainerFaq } from "@/components/home/explainer-faq";
import { BillingMeter } from "@/components/visuals/billing-meter";
import { RateBars } from "@/components/visuals/diagrams";
import { GenImage } from "@/components/visuals/media";
import {
  getRateCard,
  formatHourly,
  getIntroOffer,
  billingSentence,
  bestOverageRate,
  entryPlanFee,
  storageRatePerTb,
  perMinuteRate,
  sessionCostExample,
  commitmentIsCheaper,
  adhocRateValue,
  lowestPublishedHourly,
  planStorageIsFree,
  rupees,
} from "@/lib/rate-card";
import { storageTerms } from "@/lib/storage-terms";

export const metadata: Metadata = {
  title: { absolute: "Pricing: RTX 5080 by the minute | Coreframe Cloud" },
  description:
    "What an RTX 5080 workstation costs per minute and per month, in rupees with GST included, and what happens to your files between sessions.",
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
  const intro = getIntroOffer(rateCard);
  const storage = storageTerms(rateCard);
  // Rate bars: pay-as-you-go against the lowest plan rate, both from the card.
  const adhocNum = adhocRateValue(rateCard);
  // Plans compared on what an included hour actually costs (the rate card's
  // effective_included_hourly_rupees), not the extra-hour rate.
  const lowest = lowestPublishedHourly(rateCard);
  const lowestPlan = lowest ? (rateCard?.plans ?? []).find((pl) => pl.name === lowest.planName) : undefined;
  const effectiveFrom = lowest ? { ...lowest, storageFree: lowestPlan ? planStorageIsFree(lowestPlan) : false } : null;
  const rateBars =
    adhocNum && effectiveFrom
      ? [
          { label: "Pay as you go, per hour", value: rupees(adhocNum), ratio: 1 },
          {
            label: `Studio plans, per included hour from (${effectiveFrom.planName})`,
            value: `≈ ${rupees(effectiveFrom.rupees)}`,
            ratio: effectiveFrom.rupees / adhocNum,
          },
        ]
      : [];

  return (
    <main className="text-ink">
      <ViewContent name="Pricing" category="pricing" />
      <JsonLd data={breadcrumbList([{ name: "Pricing", path: "/pricing" }])} />
      <section className="cf-section px-5 pb-0 cf-pagehero">
        <div className="cf-col">
          <p className="cf-eyebrow mb-5">Pricing</p>
          <h1 className="cf-display">Two ways to pay for it.</h1>
          {/* cf-col caps this at 680px. The old version ran the full width of
              a max-w-7xl container, which is why it broke "16 GB" from "GDDR7"
              mid-line — a measure that long has no good break points. */}
          <p className="cf-lead mt-[22px]">
            By the minute, or a monthly plan. Same machines. GST included.
          </p>
        </div>
      </section>

      {/* The billing idea as motion, not a paragraph: a session meter at the
          live rate, the two rates side by side, and a generated scene. */}
      <section className="cf-section px-5">
        <div className="cf-wide grid items-center gap-8 lg:grid-cols-2">
          <BillingMeter ratePerHour={adhocRateValue(rateCard)} />
          <div>
            <h2 className="cf-section-title">Pay for the minutes you use.</h2>
            <p className="cf-section-copy mt-3">Close the window and billing stops.</p>
            {rateBars.length ? <div className="mt-7"><RateBars rows={rateBars} /></div> : null}
          </div>
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
        intro={intro}
        effectiveFrom={effectiveFrom}
      />

      <div className="cf-rule" />

      <section className="cf-section px-5 pb-0">
        <div className="cf-wide">
          <GenImage
            src="/visuals/gen-designer-cafe-laptop-16x9.webp"
            alt="An interior designer working on a laptop in a Bengaluru cafe"
            width={1600}
            height={914}
            sizes="(max-width: 960px) 100vw, 960px"
            parallax
          />
        </div>
      </section>

      <ExplainerFaq storage={storage} intro={intro} adhocRate={adhocRate} />
    </main>
  );
}
