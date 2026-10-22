import Image from "next/image";
import { PageByline } from "@/components/seo/page-byline";
import { VERIFIED, VERIFIED_INR_ALL_IN, verifiedPriceLine } from "@/lib/cfd-verified";
import type { Metadata } from "next";
import { ViewContent } from "@/components/analytics/view-content";
import { JsonLd } from "@/components/seo/json-ld";
import { ORG_ID, SITE, breadcrumbList, gpuLadderOffers, regionalOffers } from "@/lib/seo";
import { GpuLadder } from "@/components/pricing/gpu-ladder";
import { CFD_PREPROCESS_INR } from "@/lib/cfd-prices";
import { studioPrices } from "@/lib/studio-prices";
import { PricingSection } from "@/components/home/pricing-section";
import { ExplainerFaq } from "@/components/home/explainer-faq";
import { BillingMeter } from "@/components/visuals/billing-meter";
import { RateBars } from "@/components/visuals/diagrams";
import { GenImage } from "@/components/visuals/media";
import {
  getRateCard,
  adhocRate as adhocRateFrom,
  introOfferFor,
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
  otherCurrencyLine,
  taxWords,
  introPrice,
  publicGpus,
} from "@/lib/rate-card";
import { storageTerms } from "@/lib/storage-terms";
import Link from "next/link";
import { StatusBadge } from "@/components/home/redesign/offerings";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { offering } from "@/lib/offerings";
import { cellsLabel, formatMoney, usdRates, type Currency } from "@/lib/money";

/**
 * One metadata per copy, each in its own currency (owner, 18 Oct 2026: one
 * currency per visitor). The title fits in 60 characters (SEO review T9).
 */
export async function pricingMetadata(currency: Currency): Promise<Metadata> {
  const card = await getRateCard();
  const usd = usdRates(card);
  const meshCheck =
    currency === "USD" ? formatMoney(usd.cfd_quote_fee_small, "USD") : formatMoney(CFD_PREPROCESS_INR.small, "INR");
  return {
    // 22 Oct 2026: 65 characters was cut in results; 51 keeps both services.
    title: { absolute: "Pricing: GPU by the Minute, CFD by Quote | Coreframe" },
    description:
      currency === "USD"
        ? `GPU workstations by the minute in US dollars with no GST, team plans, CFD from a ${meshCheck} mesh check, and Studio downloads.`
        : `GPU workstations by the minute with GST included, team plans, CFD from a ${meshCheck} mesh check, and Studio downloads.`,
    alternates: { canonical: "/pricing" },
  };
}

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
 * typed price is the CFD pre-processing charge (quote_fee, ₹599 all-in; ₹1,499 over 5 million cells), which is the published fee on
 * /cfd; how a CFD run is quoted is never described here. The exception is the
 * Verified package's published starting price (lib/cfd-verified.ts, owner
 * 16 Oct 2026).
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
  // The "from" price: the cheapest public GPU on the ladder, in the page's
  // currency (owner, 21 Oct 2026). Each GPU's own rate is in <GpuLadder/>.
  const ladderCount = publicGpus(rateCard).length;
  // "from ₹99" once more than one GPU is public; the bare rate with one.
  const adhocRate = adhocRateFrom(rateCard, currency) ?? undefined;
  const adhocLabel = adhocRate ? `${ladderCount > 1 ? "from " : ""}${adhocRate}` : undefined;
  // The page's own currency's offer: $20 = 8 hours on the dollar copy while
  // the API publishes usd.intro_offer (owner, 18 Oct 2026), else none.
  const intro = introOfferFor(rateCard, currency);
  const storage = storageTerms(rateCard);
  // Rate bars: pay-as-you-go against the lowest plan rate, both from the card.
  const adhocNum = adhocRateValue(rateCard, currency);
  // Plans compared on what an included hour actually costs (the rate card's
  // effective_included_hourly_rupees), not the extra-hour rate.
  const lowest = lowestPublishedHourly(rateCard);
  const lowestPlan = lowest ? (rateCard?.plans ?? []).find((pl) => pl.name === lowest.planName) : undefined;
  const effectiveFrom = lowest ? { ...lowest, storageFree: lowestPlan ? planStorageIsFree(lowestPlan) : false } : null;
  // The included-hour comparison is a rupee figure; the USD view lists the
  // plans' dollar fee and overage rate instead.
  // Only drawn while committing is actually cheaper than the "from" rate (it
  // is not once a GPU cheaper than any plan's included hour is public).
  const rateBars =
    !usdView && adhocNum && effectiveFrom && commitmentIsCheaper(rateCard)
      ? [
          { label: "Pay as you go, per hour", value: rupees(adhocNum), ratio: 1 },
          {
            label: `Team plans, per included hour from (${effectiveFrom.planName})`,
            value: `≈ ${rupees(effectiveFrom.rupees)}`,
            ratio: effectiveFrom.rupees / adhocNum,
          },
        ]
      : [];

  // The structured data keeps an INR Offer (India) and a USD Offer
  // (elsewhere) for each price: invisible, and true of both copies. Every
  // VISIBLE price is in the visitor's currency only (owner, 18 Oct 2026).
  const studio = studioPrices(rateCard);
  const money = (inrValue: number, usdValue: number) =>
    usdView ? formatMoney(usdValue, "USD") : formatMoney(inrValue, "INR");
  const meshSmall = money(CFD_PREPROCESS_INR.small, usd.cfd_quote_fee_small);
  const meshLarge = money(CFD_PREPROCESS_INR.large, usd.cfd_quote_fee_large);
  const cellsOver = cellsLabel(usdView ? usd.cfd_quote_fee_small_max_cells : CFD_PREPROCESS_INR.smallMaxCells);
  const st = {
    extraPreview: money(studio.inr.extraPreview, studio.usd.extraPreview),
    edit: money(studio.inr.edit, studio.usd.edit),
    k2: money(studio.inr.k2, studio.usd.k2),
    k4: money(studio.inr.k4, studio.usd.k4),
  };
  const catalogLd = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "@id": `${SITE}/pricing#catalog`,
    name: "Coreframe Cloud prices, India (INR, GST included) and elsewhere (USD)",
    url: `${SITE}/pricing`,
    provider: { "@id": ORG_ID },
    itemListElement: [
      // One Offer pair per public GPU on the ladder (owner, 21 Oct 2026).
      ...gpuLadderOffers(rateCard, `${SITE}/pricing`),
      ...regionalOffers({ name: "CFD pre-processing / mesh check", inr: CFD_PREPROCESS_INR.small, usd: usd.cfd_quote_fee_small, url: `${SITE}/cfd` }),
      ...regionalOffers({ name: "CFD Verified: mesh-independence study (GCI)", inr: VERIFIED_INR_ALL_IN.from, usd: VERIFIED.fromUsd, url: `${SITE}${VERIFIED.path}`, from: true }),
      ...regionalOffers({ name: "Studio 2K download", inr: studio.inr.k2, usd: studio.usd.k2, url: `${SITE}/floor-plan-to-render` }),
      ...regionalOffers({ name: "Studio 4K download", inr: studio.inr.k4, usd: studio.usd.k4, url: `${SITE}/floor-plan-to-render` }),
    ],
  };

  return (
    <main className="text-ink" data-usd-view={usdView ? "" : undefined}>
      <JsonLd data={catalogLd} />
      <ViewContent name="Pricing" category="pricing" />
      <JsonLd data={breadcrumbList([{ name: "Pricing", path: "/pricing" }])} />
      <section className="cf-section px-5 pb-0 cf-pagehero" data-cf-dots="">
        {/* The site's one animated background (app/motion.css, section 7). */}
        <span className="cf-dotgrid" aria-hidden="true" />
        <div className="cf-col">
          <p className="cf-eyebrow mb-5">Pricing</p>
          <h1 className="cf-display">Pay for what you use.</h1>
          {/* cf-col caps this at 680px. The old version ran the full width of
              a max-w-7xl container, which is why it broke "16 GB" from "GDDR7"
              mid-line — a measure that long has no good break points. */}
          <p className="cf-lead mt-[22px]">
            {usdView
              ? "Workstations by the minute, in US dollars with no GST. CFD by quote. Studio previews free."
              : "Workstations by the minute or a monthly plan, GST included. CFD by quote. Studio previews free."}
          </p>
          <PageByline path="/pricing" className="mt-4 opacity-75" />
        </div>
      </section>

      {/* The three services at a glance, each jumping to its section below. */}
      <section className="cf-section px-5 pb-0">
        <div className="cf-wide grid gap-4 md:grid-cols-3">
          {[
            {
              o: offering("gpu"),
              price: adhocLabel ? `${adhocLabel} an hour` : "By the minute",
              note: intro
                ? `First top-up: ${introPrice(intro)} = ${hoursLabel(intro.hours)}${usdView ? ", no GST" : ""}`
                : usdView
                  ? "No GST (export of services), billed per minute"
                  : "GST included, billed per minute",
              href: "#gpu-workstations",
              tint: "cf-cine",
            },
            {
              o: offering("cfd"),
              price: `${meshSmall} pre-processing`,
              note: `Most models; ${meshLarge} over ${cellsOver} cells. Pay for the run only if you accept`,
              href: "#cfd",
              tint: "cfx-panel",
            },
            {
              o: offering("studio"),
              price: `Free previews; 2K download ${st.k2}`,
              note: `Edit ${st.edit}, 4K ${st.k4}, ${taxWords(currency)}`,
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

      {/* The one line about the other currency (owner, 18 Oct 2026): the
          policy, never the other currency's prices. */}
      <section className="cf-section px-5 pb-0">
        <p className="cf-wide text-[14px] leading-6 text-ink-2">{otherCurrencyLine(currency)}</p>
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

      {/* The GPU ladder: every public GPU from the rate card, cheapest first,
          in this page's currency only (owner, 21 Oct 2026). One row today,
          more as profiles go public; never a typed list. */}
      <section className="cf-section px-5 pt-0">
        <div className="cf-wide">
          <p className="text-[11.5px] font-semibold tracking-[0.12em] text-ink-2 uppercase">Pick your GPU</p>
          <h2 className="cf-section-title mt-3">
            {ladderCount > 1 ? "One workstation, your choice of GPU." : "The workstation."}
          </h2>
          <p className="cf-section-copy mt-3 max-w-[40rem]">
            {ladderCount > 1
              ? `Every workstation is a full Windows desktop streamed to your laptop, with the applications installed, that you drive yourself through the Connect app; it is not a Linux server you SSH into. Pick the GPU for the job. Per GPU-hour, ${taxWords(currency)}, billed per minute.`
              : `A full Windows desktop streamed to your laptop, with the applications installed, that you drive yourself; not a Linux server you SSH into. Per GPU-hour, ${taxWords(currency)}, billed per minute.`}
          </p>
          <div className="mt-7">
            <GpuLadder card={rateCard} currency={currency} />
          </div>
        </div>
      </section>

      {usdView ? (
        <PricingSection
          currency="USD"
          adhocRate={adhocLabel}
          storage={storage}
          billingNote={
            rateCard?.billing_granularity === "per_minute"
              ? billingSentence(rateCard)
              : "Billed for the time your session actually runs."
          }
          perMinute={perMinuteRate(rateCard, "USD")}
          example={sessionCostExample(rateCard, 20, "USD")}
          usdTopup={usd}
          intro={intro}
          bestOverage={bestOverageRateUsd(rateCard)}
          entryPlanFee={entryPlanFeeUsd(rateCard)}
          storageRate={formatMoney(usd.storage_rate_per_tb_month, "USD")}
        />
      ) : (
        <PricingSection
          adhocRate={adhocLabel}
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
            {`${meshSmall} for pre-processing / mesh check.`}
          </h2>
          <p className="cf-section-copy mt-3 max-w-[40rem]">
            Upload one STL of your duct or pipe. We check it, build the real mesh on our machine and email you a quote.
            The solver runs on our side, so you need no CFD licence.
          </p>
          <ul className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[
              [
                "Pre-processing / mesh check",
                `${meshSmall} for most duct and pipe models; ${meshLarge} for very large models (over ${cellsOver} cells). Paid from your Coreframe wallet. We check your geometry, build a wall-resolved mesh and verify its quality; your exact run price comes with it. A separate charge, not deducted from the run.`,
              ],
              usdView
                ? ["Mesh report and quote by email", "Runs are quoted in US dollars after the mesh is built: packages to choose from, each with its iteration budget and convergence targets."]
                : ["Mesh report and quote by email", "Packages to choose from, each with its iteration budget and convergence targets."],
              ["Pay only if you accept", "Nothing runs, and nothing more is charged, until you pay the quote."],
              ["Held, then settled", "The quote is held in your wallet; you are charged for what the run used and the rest comes back."],
              [
                "Verified: mesh-independence study (GCI)",
                `${verifiedPriceLine(usdView ? "USD" : "INR")} Your case on three meshes with the grid convergence index, for internal flow up to about ${VERIFIED.maxMcells} million cells; results within ${VERIFIED.deliveryHours} hours.`,
              ],
            ].map(([t, b]) => (
              <li key={t} className="min-w-0 border-t border-ink/10 pt-4">
                <p className="font-semibold text-ink">{t}</p>
                <p className="mt-1 text-[15px] leading-6 text-ink-2">{b}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[14px] leading-6 text-ink-2">
            {usdView
              ? "Rejected before meshing: no charge. An invoice in US dollars on every payment. Rooms and HVAC airflow (steady analysis): describe one room instead of uploading an STL; it is pre-processed and quoted the same way."
              : "Rejected before meshing: no charge. An invoice on every payment. Rooms and HVAC airflow (steady analysis): describe one room instead of uploading an STL; it is pre-processed and quoted the same way."}
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
            <Link href={VERIFIED.path} className="cf-btn-secondary">Mesh independence study</Link>
          </div>
        </div>
      </section>

      {/* Studio: open since 16 Oct 2026. Prices from lib/studio-prices.ts
          (apps/tools' live defaults; the rate card's usd.studio block). */}
      <section id="studio" className="cf-section scroll-mt-20 px-5 pt-0">
        <div className="cf-warm cf-wide grid items-center gap-8 rounded-[28px] p-6 sm:p-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="text-[11.5px] font-semibold tracking-[0.12em] text-ink-2 uppercase">Studio</p>
            <StatusBadge status={offering("studio").status} />
          </div>
          <h2 className="cf-section-title mt-4">Pre-sale concept images from a floor plan.</h2>
          <p className="cf-section-copy mt-3 max-w-[40rem]">
            Studio turns a 2D DXF floor plan into generated room images in the browser. Previews are free, up to 5 a
            day, then extra previews are {st.extraPreview} each; otherwise you pay only for what you keep,
            from the same wallet as your workstation hours.
          </p>
          <ul className="mt-5 space-y-1.5 text-[15px] text-ink">
            <li>Preview (three camera angles): free, up to 5 a day</li>
            <li>Extra preview after that: {st.extraPreview}</li>
            <li>Edit a preview: {st.edit}</li>
            <li>2K download: {st.k2}</li>
            <li>4K download: {st.k4}</li>
          </ul>
          <p className="mt-2 text-[13px] text-ink-3">{usdView ? "No GST (export of services)." : "GST included."}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <TrackedLink
              href="/studio"
              event="offering_cta_click"
              params={{ offering: "studio", label: "Open Studio", location: "pricing_studio" }}
              className="cf-btn-primary"
            >
              Open Studio
            </TrackedLink>
            <TrackedLink
              href="/floor-plan-to-render"
              event="offering_cta_click"
              params={{ offering: "studio", label: "How Studio works", location: "pricing_studio_more" }}
              className="cf-btn-secondary"
            >
              How Studio works
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

      <ExplainerFaq storage={storage} intro={intro} adhocRate={adhocLabel} currency={currency} />
    </main>
  );
}
