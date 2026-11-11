import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import Link from "next/link";
import { GpuPickCards } from "@/components/go/gpu-start";
import { startGpus } from "@/lib/gpu-start-server";
import { RenderCalculator, type OurGpu } from "@/components/tools/render-calculator";
import { breadcrumbList, OG_IMAGE, SITE } from "@/lib/seo";
import type { Currency } from "@/lib/money";
import { formatMoney } from "@/lib/money";
import { getRateCard, hourlyValue, isPricedGpu, publicGpus, shortGpuName, taxWords } from "@/lib/rate-card";
import { ANCHOR, BENCH_SOURCE, SETUP_MINUTES, ourGpuScore } from "@/lib/render-calc";

/**
 * /tools/render-time — the free render-time calculator (28 Oct 2026), the
 * link sent in the Instagram "comment RENDER" auto-DM.
 *
 * Every number's source is documented in lib/render-calc.ts: relative GPU
 * speed from Blender Open Data medians, the absolute anchor from our own
 * measured RTX 5080 render. Prices and the GPU list come from the live rate
 * card only; a card with no Open Data score is left out rather than guessed.
 *
 * Rendered twice like every priced page: /tools/render-time in rupees and
 * app/usd/tools/render-time in dollars (proxy.ts). /tools/* is otherwise the
 * control plane's IFC checker (next.config.ts rewrites); this one path is
 * carved out of that in proxy.ts and next.config.ts.
 *
 * 11 Nov 2026 (content quick wins, owner-approved): every output is labelled
 * an estimate with its assumptions (scene, samples, resolution) beside it; the
 * RTX 5080 row is the only one marked "measured" (our own render), the rest
 * "scaled from public benchmark medians". ONE big call to action at the end,
 * price first (owner, 10 Nov 2026): pick a card with its live price, Start
 * goes through sign-up to the pre-filled payment step (components/go/gpu-start).
 */

const PATH = "/tools/render-time";

export function renderTimeMetadata(): Metadata {
  // No price in the metadata, so it is the same for both currency copies.
  return {
    title: { absolute: "Render time calculator: your GPU vs a faster workstation | Coreframe" },
    description:
      "Estimate how long a Blender, Unreal, Twinmotion, D5 or V-Ray GPU render could take on your GPU and on workstation GPUs, with the cost. Assumptions shown. No sign-up.",
    alternates: { canonical: PATH },
    openGraph: {
      images: [OG_IMAGE],
      title: "How long will your render take?",
      description: "An estimate for your GPU and for workstation GPUs, from public benchmark medians and our own measured render.",
      url: `${SITE}${PATH}`,
      type: "website",
    },
  };
}

export default async function RenderTimeView({ currency }: { currency: Currency }) {
  const card = await getRateCard();
  const ours: OurGpu[] = publicGpus(card)
    .filter(isPricedGpu)
    .map((g) => ({
      name: shortGpuName(g.name),
      vramGb: g.vram_gb,
      hourly: hourlyValue(g, currency, card),
      score: ourGpuScore(g.gpu_model) ?? 0,
      measured: ANCHOR.match.test(g.gpu_model),
    }))
    .filter((g) => g.score > 0);
  const pick = startGpus(card, currency);
  const lowest = ours.map((g) => g.hourly).filter((v): v is number => v != null).sort((a, b) => a - b)[0];

  return (
    <div className="relative min-h-screen text-ink">
      <JsonLd data={breadcrumbList([{ name: "Render time calculator", path: PATH }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Render time calculator",
          url: `${SITE}${PATH}`,
          applicationCategory: "DesignApplication",
          operatingSystem: "Any (runs in a web browser)",
          isAccessibleForFree: true,
          offers: [
            { "@type": "Offer", price: "0", priceCurrency: "INR" },
            { "@type": "Offer", price: "0", priceCurrency: "USD" },
          ],
          publisher: { "@id": `${SITE}/#organization` },
        }}
      />

      <main className="relative px-4 sm:px-5">
        <section className="cf-col pt-8 pb-6 sm:pt-14">
          <p className="cf-eyebrow mb-4">Free tool</p>
          <h1 className="cf-display">How long will your render take?</h1>
          <p className="cf-lead mt-4">
            Pick your GPU and your frames. See an estimate for yours and for our workstation GPUs, with the cost
            {lowest != null ? ` (from ${formatMoney(lowest, currency)}/hr, ${taxWords(currency)})` : ""}. Every
            number is an estimate, and the assumptions are shown with it.
          </p>
        </section>

        <section className="cf-col pb-10">
          <RenderCalculator ours={ours} currency={currency} />
          {!ours.length ? (
            <p className="mt-4 text-[14px] text-ink-2">Workstation prices couldn&apos;t be loaded just now. Your own estimate above still works.</p>
          ) : null}
        </section>

        <section className="cf-col border-t border-rule py-8" data-cf-section="method">
          <h2 className="font-heading text-[20px] leading-tight font-medium text-ink">How we estimate</h2>
          <ul className="mt-3 grid gap-2.5 text-[14px] leading-6 text-ink-2">
            <li>
              These are estimates, not promises. Your scene, samples, resolution and memory use change the real time,
              and a scene that does not fit in a card&apos;s memory will not render on it at all (see{" "}
              <Link href="/vram-for-architectural-rendering" className="text-blue underline underline-offset-2">
                how much VRAM you need
              </Link>
              ).
            </li>
            <li>
              Relative GPU speed comes from{" "}
              <a href={BENCH_SOURCE.url} className="text-blue underline underline-offset-2" rel="noopener" target="_blank">
                {BENCH_SOURCE.name}
              </a>{" "}
              ({BENCH_SOURCE.version}, median score per GPU, read {BENCH_SOURCE.read}). It measures Blender Cycles; other
              renderers are scaled the same way and may differ.
            </li>
            <li>
              The reference frame is our own render: the {ANCHOR.scene} at {ANCHOR.resolution} ({ANCHOR.settings}) took{" "}
              {Math.floor(ANCHOR.seconds / 60)}:{(ANCHOR.seconds % 60).toFixed(1).padStart(4, "0")} on our {ANCHOR.gpu}{" "}
              workstation on {ANCHOR.measured} (second render, after the scene had loaded once). It is the only row we
              measured; every other card is scaled from the public medians, and where our own runs differ we keep the
              more conservative figure.
            </li>
            <li>
              Job cost adds {SETUP_MINUTES} minutes to upload and open your scene. Billing is per minute
              {currency === "USD" ? ", in US dollars" : ", GST included"}.
            </li>
          </ul>
        </section>

        {pick.defaultSlug && pick.gpus.length ? (
          <section className="cf-col border-t border-rule pt-8 pb-16" data-cf-section="start">
            <h2 className="font-heading text-[22px] leading-tight font-medium text-ink">Run the real thing on a workstation</h2>
            <p className="mt-2 mb-5 text-[15px] leading-6 text-ink-2">
              Pick a card and its price. Your own render is the only number that counts, and it is billed per minute.
            </p>
            <GpuPickCards
              gpus={pick.gpus}
              defaultSlug={pick.defaultSlug}
              amount={pick.amount}
              introHours={pick.introHours}
              currency={currency}
              where="render_calc"
            />
            <p className="mt-6 text-[14px] leading-6 text-ink-2">
              Choosing between the two entry cards?{" "}
              <Link href="/rtx-a4000-vs-rtx-a5000" className="text-blue underline underline-offset-2">
                RTX A4000 vs RTX A5000 for rendering
              </Link>
              .
            </p>
          </section>
        ) : (
          <div className="pb-16" />
        )}
      </main>
    </div>
  );
}
