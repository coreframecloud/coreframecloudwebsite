import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";
import { SpecBlock, K, B } from "@/components/home/spec-block";
import { NODE } from "@/lib/node-spec";
import {
  getRateCard,
  adhocRateHourly,
  adhocRateValue,
  getTrialTerms,
  firstTopupBonus,
  lowestPublishedHourly,
  gstClause,
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
 * and multi-GPU configurations we do not sell at all -- and their new-customer
 * bonus is twice ours. All of that is on the page. A comparison that finds for
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

export const metadata: Metadata = {
  title: "Coreframe vs iRender — cloud GPU pricing compared from India",
  description:
    `iRender bills in US dollars from $${IRENDER.gpu4090.list.toFixed(2)}/hr for a single RTX 4090. ` +
    "Coreframe bills in rupees with GST included. A dated, sourced comparison for Indian " +
    "studios, including where iRender is the better choice.",
  keywords: [
    "Coreframe vs iRender",
    "iRender alternative India",
    "cloud rendering price India",
    "cloud GPU rental rupees GST",
  ],
  alternates: { canonical: "/coreframe-vs-irender" },
  openGraph: {
    title: "Coreframe vs iRender — cloud GPU pricing compared from India",
    description:
      "Dated, sourced pricing for both, in both currencies, including where iRender wins.",
    url: "https://www.coreframecloud.com/coreframe-vs-irender",
    type: "article",
  },
};

const pad = (s: string, n: number) => (s.length >= n ? s : s + " ".repeat(n - s.length));

export default async function Page() {
  const card = await getRateCard();
  const rate = adhocRateHourly(card);
  const rateValue = adhocRateValue(card);
  const trial = getTrialTerms(card);
  const bonus = firstTopupBonus(card);
  const lowest = lowestPublishedHourly(card);
  const gst = gstClause(card);

  const irenderWins = [
    `More VRAM in a single node. Their 4090 is ${IRENDER.gpu4090.vram} and their 5090 is ${IRENDER.gpu5090.vram}, against our ${NODE.vram}. If a scene will not fit, price is irrelevant.`,
    `Four times the system RAM — ${IRENDER.ram} against our ${NODE.ram}. That matters for very large scenes and point clouds.`,
    "Multi-GPU nodes, up to eight cards. We do not sell that at all, at any price.",
    `A bigger joining offer: ${IRENDER.firstChargeBonus}${bonus ? `, against our ${bonus.percent}%` : ""}.`,
    "A long track record with VFX and animation studios, well outside our market.",
  ];

  const coreframeWins = [
    "Billed in rupees. No card forex markup, and no exchange-rate risk between quoting a client and paying the invoice.",
    gst
      ? `The published rate is what leaves your account — ${gst}, nothing added at checkout.`
      : "The published rate is what leaves your account.",
    "An Indian GST invoice for every payment, under SAC 998315. A business importing the same service from abroad generally has to account for IGST itself under reverse charge — worth asking your accountant what that costs you, because the sticker price abroad is not the landed price.",
    "Your files stay on storage in India.",
    "Software already installed. D5, Lumion, Enscape and Twinmotion are on the machine when it starts.",
    trial?.gpu_minutes
      ? `${trial.gpu_minutes} free minutes with no card, so you can judge it on your own project.`
      : "A free trial so you can judge it on your own project.",
  ];

  return (
    <div className="relative min-h-screen text-ink">
      <BackgroundGlow />
      <main className="relative">
        <section className="cf-section px-5">
          <div className="cf-col">
            <p className="cf-eyebrow mb-5">Comparison</p>
            <h1 className="cf-display">Coreframe vs iRender.</h1>
            <p className="cf-lead mt-6">
              Both rent you a GPU by the hour. One bills in dollars from
              Vietnam, the other in rupees from Bengaluru. Here are both price
              lists as published, the conversion with its rate shown, and the
              three things iRender does better than we do.
            </p>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-wide">
            <SpecBlock label={`Published rates — iRender read ${IRENDER_CHECKED}`}>
              {"  "}
              {pad("", 26)}
              {pad("per hour", 14)}
              {pad(`at ₹${FX.usdInr}/$`, 14)}
              {"VRAM"}
              {"\n\n"}
              {"  "}
              <K>{pad("iRender 1x RTX 4090", 26)}</K>
              {pad(`$${IRENDER.gpu4090.list.toFixed(2)}`, 14)}
              {pad(inr(IRENDER.gpu4090.list), 14)}
              {IRENDER.gpu4090.vram}
              {"\n"}
              {"  "}
              <K>{pad("   same, 3h+ (−10%)", 26)}</K>
              {pad(`$${IRENDER.gpu4090.discounted.toFixed(2)}`, 14)}
              {pad(inr(IRENDER.gpu4090.discounted), 14)}
              {IRENDER.gpu4090.vram}
              {"\n"}
              {"  "}
              <K>{pad("iRender 1x RTX 5090", 26)}</K>
              {pad(`$${IRENDER.gpu5090.list.toFixed(2)}`, 14)}
              {pad(inr(IRENDER.gpu5090.list), 14)}
              {IRENDER.gpu5090.vram}
              {"\n"}
              {"  "}
              <K>{pad("   same, 3h+ (−10%)", 26)}</K>
              {pad(`$${IRENDER.gpu5090.discounted.toFixed(2)}`, 14)}
              {pad(inr(IRENDER.gpu5090.discounted), 14)}
              {IRENDER.gpu5090.vram}
              {"\n\n"}
              {"  "}
              <B>{pad(`Coreframe 1x ${NODE.gpu}`, 26)}</B>
              {pad(rate ?? "see pricing", 14)}
              {pad("—", 14)}
              <B>{NODE.vram}</B>
              {"\n"}
            </SpecBlock>
            <p className="mt-6 text-sm text-white/55">
              iRender rates read from their public price page on{" "}
              {IRENDER_CHECKED}. Rupee column converted at the mid-market rate
              of ₹{FX.usdInr} to the dollar on {FX.asOf}; that rate moves and
              your bank will add its own markup on top. Our rate is served live
              from our billing system, so this page cannot quote a price we do
              not charge.
            </p>
            {lowest ? (
              <p className="mt-4 text-sm text-white/70">
                On a committed plan it goes lower:{" "}
                <b className="text-white">
                  ₹{lowest.rupees.toLocaleString("en-IN", { maximumFractionDigits: 2 })}/hr
                </b>{" "}
                on {lowest.planName}, for hours inside the monthly allowance.
                That figure is computed from the rate card, not quoted by hand.
              </p>
            ) : null}
            {rateValue ? (
              <p className="mt-4 text-sm text-white/70">
                At those figures a Coreframe hour is about{" "}
                <b className="text-white">
                  {Math.round((rateValue / (IRENDER.gpu4090.list * FX.usdInr)) * 100)}%
                </b>{" "}
                of iRender&apos;s list price for a single-4090 node — before any
                forex markup on your card.
              </p>
            ) : null}
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <h2 className="cf-title">Where iRender is the better choice</h2>
            <p className="cf-lead mt-5">
              There are real ones, and if any of them describes you then the
              price comparison above does not matter.
            </p>
            <ul className="mt-7 grid gap-4">
              {irenderWins.map((t) => (
                <li key={t} className="cf-card-sm text-white/80">{t}</li>
              ))}
            </ul>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <h2 className="cf-title">Where we are the better choice</h2>
            <ul className="mt-7 grid gap-4">
              {coreframeWins.map((t) => (
                <li key={t} className="cf-card-sm text-white/80">{t}</li>
              ))}
            </ul>
            <p className="cf-lead mt-8">
              The short version: if your scene fits in {NODE.vram} and you are
              invoicing an Indian client, we are cheaper and the paperwork is
              simpler. If your scene does not fit, go and use the bigger card —
              we would rather say so than take an hour of your money and have
              you run out of memory.
            </p>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <h2 className="cf-title">Try it on your own project</h2>
            <p className="cf-lead mt-5">
              {trial?.gpu_minutes
                ? `${trial.gpu_minutes} minutes, no card, the same machine paying customers use.`
                : "The same machine paying customers use."}{" "}
              Open your own scene and judge it from that rather than from this
              page.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link href="/login" className="cf-btn-primary">
                {trial?.gpu_minutes ? `Start free — ${trial.gpu_minutes} minutes` : "Create an account"}
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
