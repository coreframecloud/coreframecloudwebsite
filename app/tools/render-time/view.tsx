import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { KeepQueryLink } from "@/components/go/keep-query-link";
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
 * The ask is the last thing on the page, small and quiet (owner, 15 Oct 2026).
 */

const PATH = "/tools/render-time";

export function renderTimeMetadata(): Metadata {
  // No price in the metadata, so it is the same for both currency copies.
  return {
    title: { absolute: "Render time calculator: your GPU vs a faster workstation | Coreframe" },
    description:
      "Estimate how long your Blender, Unreal, Twinmotion, D5 or V-Ray GPU render takes on your GPU and on faster workstation GPUs, with the cost. Free, no sign-up.",
    alternates: { canonical: PATH },
    openGraph: {
      images: [OG_IMAGE],
      title: "How long will your render take?",
      description: "Your GPU vs faster workstation GPUs, estimated from public benchmark data and our own measured render.",
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
    }))
    .filter((g) => g.score > 0);
  const lowest = ours.map((g) => g.hourly).filter((v): v is number => v != null).sort((a, b) => a - b)[0];

  return (
    <div className="relative min-h-screen text-ink">
      <JsonLd data={breadcrumbList([{ name: "Free tools", path: "/tools" }, { name: "Render time calculator", path: PATH }])} />
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
            Pick your GPU and your frames. See an estimate on yours and on our workstation GPUs, with the cost
            {lowest != null ? ` (from ${formatMoney(lowest, currency)}/hr, ${taxWords(currency)})` : ""}.
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
              These are estimates, not promises. Your scene, samples, resolution and memory use change the real time.
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
              The reference frame is our own render: the {ANCHOR.scene} took {Math.floor(ANCHOR.seconds / 60)}:
              {(ANCHOR.seconds % 60).toFixed(1).padStart(4, "0")} on our {ANCHOR.gpu} workstation (second render, after
              the scene had loaded once).
            </li>
            <li>
              Job cost adds {SETUP_MINUTES} minutes to upload and open your scene. Billing is per minute
              {currency === "USD" ? ", in US dollars" : ", GST included"}.
            </li>
          </ul>
        </section>

        <section className="cf-col pb-16">
          <KeepQueryLink
            href="/go/gpu"
            event="render_calc_cta"
            cta="render-calc-end"
            className="inline-flex min-h-11 items-center text-[15px] font-medium text-ink-2 underline decoration-rule underline-offset-4 hover:text-ink"
          >
            Try it on a workstation <span aria-hidden className="ml-1">→</span>
          </KeepQueryLink>
        </section>
      </main>
    </div>
  );
}
