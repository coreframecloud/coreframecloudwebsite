import { formatMoney, type Currency } from "@/lib/money";
import { BillingMeter } from "@/components/visuals/billing-meter";
import { PageByline } from "@/components/seo/page-byline";
import { GenImage } from "@/components/visuals/media";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbList, OG_IMAGE } from "@/lib/seo";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";
import { SpecBlock, K, B } from "@/components/home/spec-block";
import { NODE } from "@/lib/node-spec";
import {
  getRateCard,
  cheapestGpu,
  formatHourly,
  hourlyValue,
  publicGpus,
  introOfferFor,
  bestOverageRate,
  firstTopupBonus,
  hoursLabel,
  lowestPublishedHourly,
  gstClause,
  introPrice,
  introMoreGpusNote,
  withArticle,
} from "@/lib/rate-card";

/**
 * Coreframe against iRender, with the arithmetic shown.
 *
 * WHY THIS PAGE. iRender is the name an Indian architect actually meets when
 * they search for cloud rendering, and nobody has written the comparison from
 * the India side. Answer engines cite comparison pages; they do not cite
 * landing pages that only describe one product.
 *
 * EVERY COMPETITOR FIGURE IS DATED AND SOURCED, because a competitor-pricing
 * page that is wrong is worse than no page at all. Prices read from
 * irendering.net/price on 1 Oct 2026 and recorded in IRENDER below with the
 * date attached, so a reader can check them and a future editor can see how
 * stale they are. Do not update one number without updating IRENDER_CHECKED.
 *
 * THE LIST-VS-DISCOUNT TRAP. iRender publishes two prices: a list rate and a
 * 10% rate for sessions of 3 hours or more. An early draft of this comparison
 * put their discounted 5090 price next to their list 4090 price, which would
 * have been torn apart by the first reader who opened their pricing page.
 * Both are carried here and both are labelled.
 *
 * IT HAS TO BE FAIR, same rule as d5-render-vs-local-gpu. iRender beats us on
 * three things that matter -- more VRAM per node, four times the system RAM,
 * and multi-GPU configurations we do not sell at all. All of that is on the
 * page. The joining offers are compared only from live numbers: ours from the
 * rate card's intro offer, theirs as read on the date below. A comparison that finds for
 * its author on every line reads as marketing and gets cited by nobody.
 *
 * NO RENDER-TIME CLAIMS. We have not benchmarked their hardware against ours
 * and will not imply we have. The comparison is price, VRAM, currency and
 * what the invoice looks like -- every one of them checkable.
 *
 * PRICES COME FROM THE RATE CARD. Ours is never typed into this file.
 */

/** Read from irendering.net/price. Change both together or neither. */
const IRENDER_CHECKED = "1 October 2026";
const IRENDER = {
  gpu4090: { list: 8.2, discounted: 7.38, vram: "24 GB" },
  gpu5090: { list: 10.8, discounted: 9.72, vram: "32 GB" },
  ram: "256 GB",
  storage: "2 TB NVMe",
  firstChargeBonus: "100% on the first charge within 24h",
};

/**
 * Mid-market rate from Wise on the date shown. Stated, not hidden, because a
 * conversion with an invisible rate is a number nobody can check -- and this
 * one moves. The structural argument below does not depend on it.
 */
const FX = { usdInr: 95.92, asOf: "1 October 2026" };

const inr = (usd: number) => `₹${Math.round(usd * FX.usdInr).toLocaleString("en-IN")}`;

export function vsIrenderMetadata(currency: Currency): Metadata {
  const usdView = currency === "USD";
  return {
  title: "Coreframe vs iRender — pricing compared",
  // One currency per visitor (owner, 18 Oct 2026): the rupee copy converts
  // iRender's dollar list price, the dollar copy quotes it as listed.
  description: usdView
    ? `iRender lists one RTX 4090 at ${formatMoney(IRENDER.gpu4090.list, "USD")}/hr. ` +
      "Coreframe bills by the minute. A dated, sourced comparison, including where iRender wins."
    : `iRender bills in US dollars, about ${inr(IRENDER.gpu4090.list)}/hr for one RTX 4090. ` +
      "Coreframe bills in rupees, GST included. A dated, sourced comparison, including where iRender wins.",
  keywords: [
    "Coreframe vs iRender",
    "iRender alternative India",
    "cloud rendering price India",
    "cloud GPU rental rupees GST",
  ],
  alternates: { canonical: "/coreframe-vs-irender" },
  openGraph: {
    images: [OG_IMAGE],
    title: "Coreframe vs iRender — cloud GPU pricing compared from India",
    description:
      "Dated, sourced pricing for both, including where iRender wins.",
    url: "https://www.coreframecloud.com/coreframe-vs-irender",
    type: "article",
  },
  };
}

const pad = (s: string, n: number) => (s.length >= n ? s : s + " ".repeat(n - s.length));

export default async function VsIrenderView({ currency }: { currency: Currency }) {
  const card = await getRateCard();
  const usdView = currency === "USD";
  // This page compares OUR BASE NODE (NODE.gpu) with iRender's cards, so it
  // uses that GPU's own row on the rate card (its own dollar rate since the
  // ladder, 21 Oct 2026), not the ladder's "from" price. Falls back to the
  // cheapest public GPU if the base node is not public.
  const baseGpu = publicGpus(card).find((g) => g.name === NODE.gpu) ?? cheapestGpu(card);
  const rate = baseGpu ? formatHourly(baseGpu, currency, card) : null;
  const rateValue = baseGpu ? hourlyValue(baseGpu, currency, card) : null;
  const intro = introOfferFor(card, currency);
  /** iRender's dollar list price in the page's currency: as listed, or converted at FX. */
  const theirs = (usd: number) => (usdView ? formatMoney(usd, "USD") : inr(usd));
  const overageUsd = usdView ? bestOverageRate(card, "USD") : null;
  // The old percentage bonus, only while no intro offer replaces it.
  const bonus = intro ? null : firstTopupBonus(card);
  const lowest = lowestPublishedHourly(card);
  const gst = gstClause(card);

  const irenderWins = [
    `More VRAM in a single node. Their 4090 is ${IRENDER.gpu4090.vram} and their 5090 is ${IRENDER.gpu5090.vram}, against our ${NODE.vram}. If a scene won't fit, the price doesn't matter.`,
    `Four times the system RAM: ${IRENDER.ram} against our ${NODE.ram}. That matters for very large scenes and point clouds.`,
    "Multi-GPU nodes, up to eight cards. We don't sell that at any price.",
    ...(intro
      ? []
      : [`A bigger joining offer: ${IRENDER.firstChargeBonus}${bonus ? `, against our ${bonus.percent}%` : ""}.`]),
    "A long track record with VFX and animation studios, which is well outside our market.",
  ];

  const coreframeWins = usdView
    ? [
        "Billed per minute from a prepaid wallet in US dollars, with no GST (export of services) and nothing added at checkout.",
        "D5 Render, Twinmotion and Blender are already installed when the machine starts. Lumion, Enscape, 3ds Max and Revit run on your own licence: we set them up with you once, and after that they're on every workstation you launch.",
        intro
          ? `A first top-up of ${introPrice(intro)} (no GST) buys ${hoursLabel(intro.hours)}${intro.gpuName ? ` on ${withArticle(intro.gpuName)}` : ""}${introMoreGpusNote(intro)}, so you can judge it on your own project. (Theirs: ${IRENDER.firstChargeBonus}.)`
          : "Billed per minute, so trying it on your own project costs you minutes instead of a month.",
        "Sign-up takes an email and a WhatsApp code, with no ID documents, and we accept international cards.",
      ]
    : [
    "Billed in rupees, so there's no card forex markup and no exchange-rate risk between quoting a client and paying the invoice.",
    gst
      ? `The published rate is what leaves your account (${gst}), with nothing added at checkout.`
      : "The published rate is what leaves your account.",
    "An Indian GST invoice for every payment, under SAC 998315. A business importing the same service from abroad generally has to account for IGST itself under reverse charge. Ask your accountant what that costs you, because the sticker price abroad isn't the landed price.",
    "Your files stay on storage in India.",
    "D5 Render, Twinmotion and Blender are already installed when the machine starts. Lumion, Enscape, 3ds Max and Revit run on your own licence: we set them up with you once, and after that they're on every workstation you launch.",
    intro
      ? `A first top-up of ${introPrice(intro)} buys ${hoursLabel(intro.hours)}${intro.gpuName ? ` on ${withArticle(intro.gpuName)}` : ""}${introMoreGpusNote(intro)}, so you can judge it on your own project. (Theirs: ${IRENDER.firstChargeBonus}.)`
      : "Billed per minute, so trying it on your own project costs you minutes instead of a month.",
    "Sign-up takes an email and a WhatsApp code, with no ID documents, and we accept international cards.",
      ];

  return (
    <div className="relative min-h-screen text-ink">
      <JsonLd data={breadcrumbList([{ name: "Coreframe vs iRender", path: "/coreframe-vs-irender" }])} />
      <BackgroundGlow />
      <main className="relative">
        <section className="cf-section px-5 cf-pagehero">
          <div className="cf-wide grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div className="min-w-0">
            <p className="cf-eyebrow mb-5">Comparison</p>
            <h1 className="cf-display">Coreframe vs iRender.</h1>
            <p className="cf-lead mt-6">
            Both rent you a GPU by the hour. Their prices and ours, side by side, with the conversion shown.
          </p>
            <PageByline path="/coreframe-vs-irender" className="mt-4 opacity-75" />
          </div>
          <GenImage src="/visuals/gen-night-desk-laptop.webp" alt="A laptop on a desk at night with a client message waiting" width={1000} height={1750} sizes="(max-width: 1024px) 100vw, 480px" parallax priority />
        </div>
        </section>
      <section className="cf-section px-5 pb-0">
        <div className="cf-wide grid items-center gap-8 rounded-[28px] bg-tint-blue p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 className="cf-section-title">Billed by the minute. Close it and it stops.</h2>
          <div className="min-w-0"><BillingMeter ratePerHour={rateValue} currency={currency} /></div>
        </div>
      </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-wide">
            <SpecBlock label={`Published rates (iRender read ${IRENDER_CHECKED})`}>
              {"  "}
              {pad("", 26)}
              {pad(usdView ? "per hour" : `per hour, at ₹${FX.usdInr}/$`, 26)}
              {"VRAM"}
              {"\n\n"}
              {(
                [
                  ["iRender 1x RTX 4090", IRENDER.gpu4090.list, IRENDER.gpu4090.vram],
                  ["   same, 3h+ (−10%)", IRENDER.gpu4090.discounted, IRENDER.gpu4090.vram],
                  ["iRender 1x RTX 5090", IRENDER.gpu5090.list, IRENDER.gpu5090.vram],
                  ["   same, 3h+ (−10%)", IRENDER.gpu5090.discounted, IRENDER.gpu5090.vram],
                ] as [string, number, string][]
              ).map(([label, price, vram], i) => (
                <span key={i}>
                  {"  "}
                  <K>{pad(label, 26)}</K>
                  {pad(theirs(price), 26)}
                  {vram}
                  {"\n"}
                </span>
              ))}
              {"\n"}
              {"  "}
              <B>{pad(`Coreframe 1x ${NODE.gpu}`, 26)}</B>
              {pad(rate ?? "see pricing", 26)}
              <B>{NODE.vram}</B>
              {"\n"}
            </SpecBlock>
            <p className="mt-6 text-sm text-ink-3">
              iRender rates read from their public price page on{" "}
              {IRENDER_CHECKED}.{" "}
              {usdView
                ? "They list in US dollars; any card forex markup is on top."
                : `They list in US dollars; converted here at the mid-market rate of ₹${FX.usdInr} to the dollar on ${FX.asOf}. That rate moves and your bank will add its own markup on top.`}{" "}
              Our rate comes live from our
              billing system, so this page can&apos;t quote a price we don&apos;t
              charge.
            </p>
            {usdView ? (
              overageUsd ? (
                <p className="mt-4 text-sm text-ink-2">
                  On a committed plan it goes lower: extra hours from{" "}
                  <b className="text-ink">{overageUsd}/hr</b>. We read that
                  figure from the rate card; nobody types it in.
                </p>
              ) : null
            ) : lowest ? (
              <p className="mt-4 text-sm text-ink-2">
                On a committed plan it goes lower:{" "}
                <b className="text-ink">
                  ₹{lowest.rupees.toLocaleString("en-IN", { maximumFractionDigits: 2 })}/hr
                </b>{" "}
                on {lowest.planName}, for hours inside the monthly allowance.
                We work that figure out from the rate card; nobody types it in.
              </p>
            ) : null}
            {rateValue ? (
              <p className="mt-4 text-sm text-ink-2">
                At those figures a Coreframe hour is about{" "}
                <b className="text-ink">
                  {Math.round((rateValue / (IRENDER.gpu4090.list * (usdView ? 1 : FX.usdInr))) * 100)}%
                </b>{" "}
                of iRender&apos;s list price for a single-4090 node
                {usdView ? "." : ", before any forex markup on your card."}
              </p>
            ) : null}
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <h2 className="cf-title">Where iRender is the better choice</h2>
            <p className="cf-lead mt-5">
              There are real ones. If any of these describes you, ignore the
              price comparison above.
            </p>
            <ul className="mt-7 grid gap-4">
              {irenderWins.map((t) => (
                <li key={t} className="cf-card-sm text-ink-2">{t}</li>
              ))}
            </ul>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <h2 className="cf-title">Where we&apos;re the better choice</h2>
            <ul className="mt-7 grid gap-4">
              {coreframeWins.map((t) => (
                <li key={t} className="cf-card-sm text-ink-2">{t}</li>
              ))}
            </ul>
            <p className="cf-lead mt-8">
              {usdView ? (
                <>In short: if your scene fits in {NODE.vram}, we cost less per hour.</>
              ) : (
                <>
                  In short: if your scene fits in {NODE.vram} and you&apos;re
                  invoicing an Indian client, we&apos;re cheaper and the paperwork is
                  simpler.
                </>
              )} If it doesn&apos;t fit, go and use the bigger card.
              We&apos;d rather tell you that than take an hour of your money and
              have you run out of memory.
            </p>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <h2 className="cf-title">Try it on your own project</h2>
            <p className="cf-lead mt-5">
              {intro
                ? `Your first top-up of ${introPrice(intro)} buys ${hoursLabel(intro.hours)} on the same machine every customer uses.`
                : "The same machine every customer uses, billed per minute."}{" "}
              Open your own scene and judge us on that.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link href="/login" className="cf-btn-primary">
                {intro ? `Get started: ${introPrice(intro)} for ${hoursLabel(intro.hours)}` : "Create an account"}
              </Link>
              <Link href="/d5-render-vs-local-gpu" className="cf-btn-secondary">
                Or compare against buying a machine
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
