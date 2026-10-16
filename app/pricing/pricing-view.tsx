import Image from "next/image";
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
  bestOverageRateUsd,
  entryPlanFeeUsd,
  entryPlanFee,
  storageRatePerTb,
  perMinuteRate,
  sessionCostExample,
  commitmentIsCheaper,
  adhocRateValue,
  lowestPublishedHourly,
  planStorageIsFree,
  rupees,
  hoursLabel,
} from "@/lib/rate-card";
import { storageTerms } from "@/lib/storage-terms";
import Link from "next/link";
import { StatusBadge } from "@/components/home/redesign/offerings";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { offering } from "@/lib/offerings";
import { cellsLabel, formatMoney, usdRates, type Currency } from "@/lib/money";

export const pricingMetadata: Metadata = {
  title: { absolute: "Pricing: RTX 5080 by the minute, CFD by quote | Coreframe Cloud" },
  description:
    "RTX 5080 workstation prices per minute and per month, GST included, and what a duct or pipe CFD job costs to start (₹599 for pre-processing / mesh validation for most models).",
  alternates: { canonical: "/pricing" },
};

/** The same page for a visitor outside India (see proxy.ts): US dollars, no
 *  GST; every product in dollars. Canonical stays /pricing. */
export const pricingMetadataUsd: Metadata = {
  ...pricingMetadata,
  description:
    "RTX 5080 workstation prices per minute in US dollars, and what a duct or pipe CFD job costs to start ($15 for pre-processing / mesh validation for most models, no GST on exports).",
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
 * Every workstation figure comes from the control-plane rate card. The one
 * typed price is the CFD pre-processing charge (quote_fee, ₹599 incl. GST; ₹1,499 over 5 million cells), which is the published fee on
 * /cfd; how a CFD run is quoted is never described here.
 *
 * 13 Oct 2026: the page covers all three services, in the site-wide order
 * (GPU workstations, CFD, Studio), with a summary row at the top.
 *
 * 15 Oct 2026: rendered twice, as /pricing (INR) and /usd/pricing (USD, for
 * visitors outside India; proxy.ts rewrites to it). The USD copy reads the
 * rate card's `usd` block (usdRates() falls back to the approved constants),
 * shows no GST. Everything is global (owner, 15 Oct 2026): team plans and the
 * storage add-on show their dollar prices too. The INR copy is unchanged.
 */
export default async function PricingView({ currency }: { currency: Currency }) {
  const usdView = currency === "USD";
  const rateCard = await getRateCard();
  const usd = usdRates(rateCard);
  const entry = rateCard?.gpus.find((g) => !g.quote_on_request);
  const adhocRate = usdView ? formatMoney(usd.gpu_hourly, "USD") : entry ? formatHourly(entry).replace("/hr", "") : undefined;
  // The intro offer is never offered to a USD account.
  const intro = usdView ? null : getIntroOffer(rateCard);
  const storage = storageTerms(rateCard);
  // Rate bars: pay-as-you-go against the lowest plan rate, both from the card.
  const adhocNum = usdView ? usd.gpu_hourly : adhocRateValue(rateCard);
  // Plans compared on what an included hour actually costs (the rate card's
  // effective_included_hourly_rupees), not the extra-hour rate.
  const lowest = lowestPublishedHourly(rateCard);
  const lowestPlan = lowest ? (rateCard?.plans ?? []).find((pl) => pl.name === lowest.planName) : undefined;
  const effectiveFrom = lowest ? { ...lowest, storageFree: lowestPlan ? planStorageIsFree(lowestPlan) : false } : null;
  // The included-hour comparison is a rupee figure; the USD view lists the
  // plans' dollar fee and overage rate instead.
  const rateBars =
    !usdView && adhocNum && effectiveFrom
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
    <main className="text-ink" data-usd-view={usdView ? "" : undefined}>
      <ViewContent name="Pricing" category="pricing" />
      <JsonLd data={breadcrumbList([{ name: "Pricing", path: "/pricing" }])} />
      <section className="cf-section px-5 pb-0 cf-pagehero">
        <div className="cf-col">
          <p className="cf-eyebrow mb-5">Pricing</p>
          <h1 className="cf-display">Pay for what you use.</h1>
          {/* cf-col caps this at 680px. The old version ran the full width of
              a max-w-7xl container, which is why it broke "16 GB" from "GDDR7"
              mid-line — a measure that long has no good break points. */}
          <p className="cf-lead mt-[22px]">
            {usdView
              ? "Workstations by the minute, in US dollars with no GST. CFD by quote. Studio when it opens."
              : "Workstations by the minute or a monthly plan, GST included. CFD by quote. Studio when it opens."}
          </p>
        </div>
      </section>

      {/* The three services at a glance, each jumping to its section below. */}
      <section className="cf-section px-5 pb-0">
        <div className="cf-wide grid gap-4 md:grid-cols-3">
          {[
            {
              o: offering("gpu"),
              price: adhocRate ? `${adhocRate} an hour` : "By the minute",
              note: usdView
                ? "No GST (export of services), billed per minute"
                : intro ? `First top-up: ${rupees(intro.priceRupees)} = ${hoursLabel(intro.hours)}` : "GST included, billed per minute",
              href: "#gpu-workstations",
              tint: "cf-cine",
            },
            {
              o: offering("cfd"),
              price: usdView ? `${formatMoney(usd.cfd_quote_fee_small, "USD")} pre-processing (no GST)` : "₹599 pre-processing (incl. GST)",
              note: usdView
                ? `Most models; ${formatMoney(usd.cfd_quote_fee_large, "USD")} over ${cellsLabel(usd.cfd_quote_fee_small_max_cells)} cells. Pay for the run only if you accept`
                : "Most models; ₹1,499 over 5 million cells. Pay for the run only if you accept",
              href: "#cfd",
              tint: "cfx-panel",
            },
            {
              o: offering("studio"),
              price: "Opening soon",
              note: "In private testing; prices published when it opens",
              href: "#studio",
              tint: "cf-warm",
            },
          ].map(({ o, price, note, href, tint }) => (
            <a key={o.id} href={href} className={`flex min-w-0 flex-col rounded-[24px] p-6 transition hover:shadow-[0_12px_40px_-18px_rgba(16,17,19,0.35)] ${tint}`}>
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-[11.5px] font-semibold tracking-[0.12em] text-ink-2 uppercase">{o.name}</span>
                <StatusBadge status={o.status} />
              </span>
              <span className="mt-3 font-heading text-[22px] leading-[1.2] font-medium text-ink">{price}</span>
              <span className="mt-1.5 text-[14px] leading-[1.5] text-ink-2">{note}</span>
            </a>
          ))}
        </div>
      </section>

      <div id="gpu-workstations" className="scroll-mt-20" />

      {/* The billing idea as motion, not a paragraph: a session meter at the
          live rate, the two rates side by side, and a generated scene. */}
      <section className="cf-section px-5">
        <div className="cf-wide grid items-center gap-8 lg:grid-cols-2">
          <BillingMeter ratePerHour={adhocNum} currency={currency} />
          <div>
            <p className="text-[11.5px] font-semibold tracking-[0.12em] text-ink-2 uppercase">GPU workstations</p>
            <h2 className="cf-section-title mt-3">Pay for the minutes you use.</h2>
            <p className="cf-section-copy mt-3">Close the window and billing stops.</p>
            {rateBars.length ? <div className="mt-7"><RateBars rows={rateBars} /></div> : null}
          </div>
        </div>
      </section>

      {usdView ? (
        <PricingSection
          currency="USD"
          adhocRate={adhocRate}
          storage={storage}
          billingNote={
            rateCard?.billing_granularity === "per_minute"
              ? billingSentence(rateCard)
              : "Billed for the time your session actually runs."
          }
          perMinute={
            rateCard?.billing_granularity === "per_minute" ? formatMoney(usd.gpu_hourly / 60, "USD") : null
          }
          example={
            rateCard?.billing_granularity === "per_minute"
              ? { minutes: 20, cost: formatMoney((usd.gpu_hourly / 60) * 20, "USD") }
              : null
          }
          usdTopup={usd}
          bestOverage={bestOverageRateUsd(rateCard)}
          entryPlanFee={entryPlanFeeUsd(rateCard)}
          storageRate={formatMoney(usd.storage_rate_per_tb_month, "USD")}
        />
      ) : (
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
      )}

      {/* CFD for ducts and pipes. Only the published facts from /cfd. */}
      <section id="cfd" className="cf-section scroll-mt-20 px-5">
        <div className="cfx-panel cf-wide relative overflow-hidden rounded-[28px] p-6 sm:p-10">
          {/* The CFD explainer sketch, as on /cfd (16 Oct 2026). */}
          <Image
            src="/cfd/explainer/j-pressure-drop-gauges.webp"
            alt=""
            width={1536}
            height={864}
            sizes="320px"
            className="cfx-art pointer-events-none absolute -top-4 right-0 hidden w-[320px] lg:block"
          />
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="text-[11.5px] font-semibold tracking-[0.12em] text-ink-2 uppercase">CFD for ducts and pipes</p>
            <StatusBadge status="New" />
          </div>
          <h2 className="cf-section-title mt-4 max-w-[36rem]">
            {usdView
              ? `${formatMoney(usd.cfd_quote_fee_small, "USD")} for pre-processing / mesh validation.`
              : "₹599 incl. GST for pre-processing / mesh validation."}
          </h2>
          <p className="cf-section-copy mt-3 max-w-[40rem]">
            Upload one STL of your duct or pipe. We check it, build the real mesh on our machine and email you a quote.
            OpenFOAM runs on our side, so you need no CFD licence.
          </p>
          <ul className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[
              usdView
                ? ["Pre-processing / mesh validation", `${formatMoney(usd.cfd_quote_fee_small, "USD")} for most duct and pipe models; ${formatMoney(usd.cfd_quote_fee_large, "USD")} for very large models (over ${cellsLabel(usd.cfd_quote_fee_small_max_cells)} cells). No GST (export of services). Paid from your Coreframe wallet. We check your geometry, build a wall-resolved mesh and verify its quality; your exact run price comes with it. A separate charge, not deducted from the run.`]
                : ["Pre-processing / mesh validation", "₹599 incl. GST for most duct and pipe models; ₹1,499 for very large models (over 5 million cells). Paid from your Coreframe wallet. We check your geometry, build a wall-resolved mesh and verify its quality; your exact run price comes with it. A separate charge, not deducted from the run."],
              usdView
                ? ["Mesh report and quote by email", "Runs are quoted in US dollars after the mesh is built: packages to choose from, each with its iteration budget and convergence targets."]
                : ["Mesh report and quote by email", "Packages to choose from, each with its iteration budget and convergence targets."],
              ["Pay only if you accept", "Nothing runs, and nothing more is charged, until you pay the quote."],
              ["Held, then settled", "The quote is held in your wallet; you are charged for what the run used and the rest comes back."],
            ].map(([t, b]) => (
              <li key={t} className="min-w-0 border-t border-ink/10 pt-4">
                <p className="font-semibold text-ink">{t}</p>
                <p className="mt-1 text-[15px] leading-6 text-ink-2">{b}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[14px] leading-6 text-ink-2">
            {usdView
              ? "Rejected before meshing: no charge. An invoice in US dollars on every payment. Rooms and HVAC airflow: coming soon."
              : "Rejected before meshing: no charge. A GST invoice on every payment. Rooms and HVAC airflow: coming soon."}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <TrackedLink
              href="/cfd#start"
              event="offering_cta_click"
              params={{ offering: "cfd", label: "Get a CFD quote", location: "pricing_cfd" }}
              className="cf-btn-primary"
            >
              Get a CFD quote
            </TrackedLink>
            <Link href="/cfd#sample" className="cf-btn-secondary">See a sample report</Link>
          </div>
        </div>
      </section>

      {/* Studio: no price until it opens. */}
      <section id="studio" className="cf-section scroll-mt-20 px-5 pt-0">
        <div className="cf-warm cf-wide grid items-center gap-8 rounded-[28px] p-6 sm:p-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="text-[11.5px] font-semibold tracking-[0.12em] text-ink-2 uppercase">Studio</p>
            <StatusBadge status="Opening soon" />
          </div>
          <h2 className="cf-section-title mt-4">Pre-sale concept images from a floor plan.</h2>
          <p className="cf-section-copy mt-3 max-w-[40rem]">
            Studio turns a 2D DXF floor plan into generated room images in the browser. It is in private testing; its
            prices are published here when it opens.
          </p>
          <div className="mt-7">
            <TrackedLink
              href="/floor-plan-to-render#notify"
              event="offering_cta_click"
              params={{ offering: "studio", label: "Get notified", location: "pricing_studio" }}
              className="cf-btn-secondary"
            >
              Get notified
            </TrackedLink>
          </div>
          </div>
          <figure className="relative min-w-0 overflow-hidden rounded-[20px]">
            <Image src="/studio-renders/studio-masterbed-2048.webp" alt="A bedroom generated by Coreframe Studio from a floor plan: a teak bed, a louvred wardrobe and a patterned rug (generated image)" width={2048} height={1536} sizes="(max-width: 1024px) 100vw, 360px" className="h-auto w-full" />
            <span className="absolute right-2.5 bottom-2.5 rounded-md bg-black/60 px-2 py-1 text-[11px] font-semibold text-white">Generated image</span>
          </figure>
        </div>
      </section>

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

      <ExplainerFaq storage={storage} intro={intro} adhocRate={adhocRate} currency={currency} />
    </main>
  );
}
