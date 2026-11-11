import type { Currency } from "@/lib/money";
import { Fold } from "@/components/visuals/fold";
import { PageByline } from "@/components/seo/page-byline";
import { GenImage } from "@/components/visuals/media";
import { VramDiagram } from "@/components/visuals/diagrams";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbList, OG_IMAGE } from "@/lib/seo";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";
import { SpecBlock, K, B } from "@/components/home/spec-block";
import { getRateCard, publicGpus, formatHourly, shortGpuName, taxWords, type RateCardGpu } from "@/lib/rate-card";
import { startGpus } from "@/lib/gpu-start-server";
import { GpuPickCards, GpuStartSticky } from "@/components/go/gpu-start";
import { formatMoney } from "@/lib/money";

/**
 * How much VRAM architectural rendering actually needs.
 *
 * WHY THIS PAGE. "Is 8 GB enough for Lumion / D5 / Enscape" is asked
 * constantly and answered badly -- almost every result is a spec table
 * reprinted from a vendor page, and the vendors disagree with each other.
 * An answer engine asked this question has nothing good to cite.
 *
 * THE FINDING THAT MAKES IT WORTH PUBLISHING. The vendors do not actually
 * answer it. Enscape publishes 4 GB minimum and 8 GB recommended. D5 publishes
 * a GPU MODEL floor and no VRAM number at all, while saying in the same
 * breath that "video memory determines how well complex scenes are handled".
 * So the honest answer is that the number depends on the scene and not on the
 * software -- and the useful thing we can give someone is how to measure
 * their own, which nobody else bothers to write down.
 *
 * SOURCED AND DATED. Every vendor figure below is in VENDOR with the date it
 * was read. Vendor requirements change with every major release and a figure
 * without a date is a figure nobody can check.
 *
 * NO BENCHMARKS, NO SPEED CLAIMS. We have not measured D5 or Lumion against
 * each other and will not imply we have. Capacity is checkable; speed here
 * would be marketing.
 *
 * WHICH CARD FOR WHICH PEAK (rewritten 11 Nov 2026, owner). The old "Where we
 * fit" said we had nothing above 16 GB and sent readers to a competitor; the
 * ladder now runs well past that. The section is built from the live rate
 * card only: every public card, its VRAM and its price in the visitor's
 * currency, grouped by the measured peak it suits (VRAM minus the ~2 GB the
 * page itself tells readers to keep for Windows and the display). No card,
 * size or price is typed into this file, and with no rate card the section
 * shows no prices rather than stale ones. No competitor is named or linked.
 */

const VENDOR_CHECKED = "2 October 2026";
const VENDOR = {
  enscape: { min: "4 GB", recommended: "8 GB", vr: "12 GB" },
  d5: { gpuFloor: "GTX 1060 6 GB", vramPublished: null as string | null },
};

export function vramMetadata(): Metadata {
  // No price in this metadata: the same for both currency copies.
  return {
  title: { absolute: "Is 8 GB VRAM enough for architectural rendering?" },
  description:
    "Enscape recommends 8 GB. D5 publishes no VRAM figure. Your scene decides, not your software: how to measure what it uses, and what happens when you run out.",
  keywords: [
    "is 8GB VRAM enough for rendering",
    "VRAM for Lumion D5 Enscape",
    "how much VRAM architectural visualisation",
    "GPU memory 3D rendering requirements",
  ],
  alternates: { canonical: "/vram-for-architectural-rendering" },
  openGraph: {
    images: [OG_IMAGE],
    title: "Is 8 GB of VRAM enough for architectural rendering?",
    description:
      "What the vendors actually publish, how to measure your own scene, and what happens when you run out.",
    url: "https://www.coreframecloud.com/vram-for-architectural-rendering",
    type: "article",
  },
  };
}

const pad = (s: string, n: number) => (s.length >= n ? s : s + " ".repeat(n - s.length));

/** Windows and the display take about this much before the renderer sees any (the page's own rule). */
const HEADROOM_GB = 2;

/** The kind of scene that fits a card of this size, by VRAM band, so a new size on the ladder still reads right. */
function scenesFor(vram: number): string {
  if (vram <= 16)
    return "Interiors, a single building without heavy site context, 2K texture sets, Enscape VR (Chaos asks for 12 GB), stills and short walkthroughs.";
  if (vram <= 32)
    return "4K PBR texture sets, site context with scattered trees and grass, a federated model opened together, Lumion\u2019s high-end tier.";
  if (vram <= 64)
    return "Scanned point clouds or survey meshes beside the model, city blocks, long animations with full landscape.";
  return "The heaviest jobs: very large point clouds, whole masterplans with dense vegetation, several heavy scenes or apps open at once.";
}

type FitRow = { gpu: RateCardGpu; peak: string; note: string };

/**
 * One row per VRAM size on the live ladder (its cheapest card), plus a row for
 * any dearer card of the same size that has more CUDA cores (the RTX 5080 next
 * to the A4000 today). Built from the rate card only.
 */
function fitRows(gpus: RateCardGpu[]): FitRow[] {
  const sizes = [...new Set(gpus.map((g) => g.vram_gb).filter((v) => v > 0))].sort((a, b) => a - b);
  const rows: FitRow[] = [];
  sizes.forEach((size, i) => {
    const same = gpus.filter((g) => g.vram_gb === size); // publicGpus order: cheapest first
    const lo = i === 0 ? null : sizes[i - 1] - HEADROOM_GB;
    const hi = size - HEADROOM_GB;
    const peak = lo == null ? `Peak up to about ${hi} GB` : `Peak about ${lo} to ${hi} GB`;
    rows.push({ gpu: same[0], peak, note: scenesFor(size) });
    const base = same[0].cuda_cores ?? 0;
    for (const g of same.slice(1)) {
      if (base > 0 && (g.cuda_cores ?? 0) > base)
        rows.push({
          gpu: g,
          peak: `Fits in ${size} GB, you want it faster`,
          note: `${(g.cuda_cores ?? 0).toLocaleString("en-US")} CUDA cores against ${base.toLocaleString("en-US")} on the ${shortGpuName(same[0].name)}, same ${size} GB.`,
        });
    }
  });
  return rows;
}

/**
 * A FAQPage for THIS page's own questions. The one in explainer-faq.tsx is
 * scoped to the home page; two FAQPage nodes on two different URLs is correct
 * and is how an answer engine finds the question it was asked. What must not
 * happen is a second Organization node -- layout.tsx owns that one.
 */
const FAQ: { q: string; a: string }[] = [
  {
    q: "Is 8 GB of VRAM enough for architectural rendering?",
    a: `For Enscape, 8 GB is the figure Chaos publishes as recommended rather than minimum, with 4 GB as the floor and 12 GB for VR (read ${VENDOR_CHECKED}). For a single building at 1080p it's usually workable. It stops being enough when you load 4K texture sets, a point cloud or a full site context with vegetation. What sets the limit is your scene, whichever software you use.`,
  },
  {
    q: "What VRAM does D5 Render need?",
    a: `D5 publishes a GPU model floor of ${VENDOR.d5.gpuFloor} and no VRAM figure at all, while stating that video memory determines how well complex scenes are handled. There's no official number to quote, so measuring your own scene is the only reliable answer.`,
  },
  {
    q: "What happens when a scene exceeds the GPU's VRAM?",
    a: "It doesn't slow down gradually. Either the application spills to system memory across the PCIe bus, which is far slower than local VRAM and feels like the machine has stalled, or it refuses to load the scene and reports an out-of-memory error. Because the failure is that abrupt, headroom matters more than the average case.",
  },
  {
    q: "How do I find out how much VRAM my scene uses?",
    a: "Open the scene, then in Windows Task Manager go to Performance, select your GPU, and read Dedicated GPU memory while you orbit the viewport and start a render. That figure, plus roughly 2 GB of headroom for Windows and the display, is the card you need.",
  },
];

export default async function VramView({ currency }: { currency: Currency }) {
  const card = await getRateCard();
  const ours = publicGpus(card);
  const rows = fitRows(ours);
  const maxVram = ours.length ? Math.max(...ours.map((g) => g.vram_gb)) : null;
  const vramSizes = [...new Set(ours.map((g) => g.vram_gb))].sort((a, b) => a - b);
  const pick = startGpus(card, currency);
  const cheapest = pick.gpus.find((g) => g.rate != null);

  const eightIsFine = [
    "One building, no site context, at 1080p or 1440p.",
    "Texture sets at 2K. Most manufacturer libraries ship at 2K and look identical at render size.",
    "Enscape or D5 walkthroughs of an interior with a few rooms, rather than a masterplan.",
    "You're producing stills and short clips rather than long animations.",
  ];

  const eightIsNot = [
    "4K texture sets, especially PBR materials with five maps each.",
    "A scanned point cloud, or a surveyed site mesh, loaded alongside the model.",
    "Full landscape context. Scattered trees and grass are the most common single cause of running out.",
    "A federated model: architecture plus structure plus services, opened together.",
    "VR. Enscape asks for 12 GB, and that's before your scene is anything unusual.",
  ];

  return (
    <div className="relative min-h-screen text-ink">
      <JsonLd data={breadcrumbList([{ name: "VRAM for architectural rendering", path: "/vram-for-architectural-rendering" }])} />
      <BackgroundGlow />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />

      <main className="relative">
        <section className="cf-section px-5 cf-pagehero">
          <div className="cf-wide grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div className="min-w-0">
            <p className="cf-eyebrow mb-5">Explainer</p>
            <h1 className="cf-display">Is 8 GB of VRAM enough?</h1>
            <p className="cf-lead mt-6">
            Usually, until suddenly it isn&apos;t. Here&apos;s what the vendors say, and how to measure your own scene.
          </p>
            <PageByline path="/vram-for-architectural-rendering" className="mt-4 opacity-75" />
          </div>
          <GenImage src="/visuals/gen-student-architecture-4x5.webp" alt="An architecture student working on a laptop beside her models" width={1000} height={1286} sizes="(max-width: 1024px) 100vw, 480px" parallax priority />
        </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-wide">
            <SpecBlock label={`What the vendors actually publish (read ${VENDOR_CHECKED})`}>
              {"  "}
              <K>{pad("Enscape, minimum", 26)}</K>
              {VENDOR.enscape.min}
              {"\n"}
              {"  "}
              <K>{pad("Enscape, recommended", 26)}</K>
              <B>{VENDOR.enscape.recommended}</B>
              {"\n"}
              {"  "}
              <K>{pad("Enscape, VR", 26)}</K>
              {VENDOR.enscape.vr}
              {"\n\n"}
              {"  "}
              <K>{pad("D5 Render, GPU floor", 26)}</K>
              {VENDOR.d5.gpuFloor}
              {"\n"}
              {"  "}
              <K>{pad("D5 Render, VRAM", 26)}</K>
              {"not published"}
              {vramSizes.length ? (
                <>
                  {"\n\n"}
                  {"  "}
                  <B>{pad("Coreframe GPUs", 26)}</B>
                  <B>{vramSizes.map((v) => `${v} GB`).join(" · ")}</B>
                  {"\n"}
                </>
              ) : null}
            </SpecBlock>
            <p className="mt-6 text-sm text-ink-3">
              Enscape figures from Chaos&apos;s published system requirements.
              D5&apos;s own specification page lists GPU models and states that
              video memory determines how well complex scenes are handled, but
              gives no figure for it. Both read on {VENDOR_CHECKED}; vendor
              requirements change with major releases, so check the date before
              relying on this.
            </p>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <h2 className="cf-title">Running out happens all at once</h2>
            <div className="mt-6 rounded-[24px] bg-tint-blue p-6">
              <VramDiagram />
            </div>
            <p className="cf-lead mt-5">
              The spec tables leave this out. A scene that exceeds the card&apos;s
              memory doesn&apos;t just render a bit more slowly. Either the
              application spills into system RAM across the PCIe bus, which is an
              order of magnitude slower than the memory on the card and feels like
              the machine has frozen, or it refuses the scene outright with an
              out-of-memory error.
            </p>
            <p className="cf-lead mt-5">
              So the useful thing to ask is how much headroom is left once it
              fits. Windows and your display take roughly 2 GB before your
              renderer sees any.
            </p>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
<Fold title="Measure your own scene in two minutes">
            <ol className="mt-7 grid gap-4 text-ink-2">
              <li className="cf-card-sm">Open your heaviest real project. A test file won&apos;t tell you much.</li>
              <li className="cf-card-sm">Ctrl+Shift+Esc for Task Manager, then <b className="text-ink">Performance</b> → your GPU.</li>
              <li className="cf-card-sm">Watch <b className="text-ink">Dedicated GPU memory</b> while you orbit the viewport, then while a render starts. The peak is your number.</li>
              <li className="cf-card-sm">Add about 2 GB of headroom. That&apos;s the card you need, whatever the vendor table says.</li>
            </ol>
          </Fold>
</div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <h2 className="cf-title">When 8 GB is genuinely fine</h2>
            <ul className="mt-7 grid gap-4">
              {eightIsFine.map((t) => <li key={t} className="cf-card-sm text-ink-2">{t}</li>)}
            </ul>
            <h2 className="cf-title mt-14">When it is not</h2>
            <ul className="mt-7 grid gap-4">
              {eightIsNot.map((t) => <li key={t} className="cf-card-sm text-ink-2">{t}</li>)}
            </ul>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5" data-cf-section="which-card">
          <div className="cf-col">
            <h2 className="cf-title">Which card for your measured peak</h2>
            {rows.length ? (
              <>
                <p className="cf-lead mt-5">
                  Take the peak from Task Manager, then pick the smallest card that leaves about {HEADROOM_GB} GB
                  spare. We rent {vramSizes.length > 1 ? `cards from ${vramSizes[0]} GB up to ${maxVram} GB` : `a ${maxVram} GB card`},
                  one GPU per machine, {taxWords(currency)}, billed per minute.
                </p>
                <ul className="mt-7 grid gap-3">
                  {rows.map((r) => (
                    <li key={r.gpu.slug} className="cf-card-sm">
                      <p className="font-semibold text-ink">
                        {r.peak} → {shortGpuName(r.gpu.name)} ({r.gpu.vram_gb} GB) · {formatHourly(r.gpu, currency, card)}
                      </p>
                      <p className="mt-1 text-ink-2">{r.note}</p>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="cf-lead mt-5">
                Take the peak from Task Manager, then pick the smallest card that leaves about {HEADROOM_GB} GB spare.
                Our current cards and prices are on the{" "}
                <Link href="/pricing" className="text-blue underline underline-offset-2">pricing page</Link>.
              </p>
            )}
            <p className="mt-6 text-ink-2">
              Between 16 and 24 GB?{" "}
              <Link href="/rtx-a4000-vs-rtx-a5000" className="text-blue underline underline-offset-2">
                RTX A4000 vs RTX A5000
              </Link>{" "}
              sets the two side by side. Wondering how long the render takes on each? The{" "}
              <Link href="/tools/render-time" className="text-blue underline underline-offset-2">
                render-time calculator
              </Link>{" "}
              gives an estimate per card.
            </p>
            {pick.defaultSlug ? (
              <div id="cf-hero-cta" className="mt-9" data-cf-section="vram-start">
                {cheapest?.rate != null ? (
                  <p className="mb-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="font-heading text-[30px] leading-none font-semibold text-ink sm:text-[36px]">
                      {pick.gpus.filter((g) => g.rate != null).length > 1 ? "From " : ""}
                      {formatMoney(cheapest.rate, currency)}
                    </span>
                    <span className="text-[15px] leading-5 text-ink-2">an hour, {taxWords(currency)}</span>
                  </p>
                ) : null}
                <GpuPickCards
                  gpus={pick.gpus}
                  defaultSlug={pick.defaultSlug}
                  amount={pick.amount}
                  introHours={pick.introHours}
                  currency={currency}
                  where="vram_guide"
                />
              </div>
            ) : null}
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <h2 className="cf-title">Questions</h2>
            <div className="mt-7 grid gap-5">
              {FAQ.map((f) => (
                <div key={f.q} className="cf-card-sm">
                  <p className="font-semibold text-ink">{f.q}</p>
                  <p className="mt-2 text-ink-2">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      {pick.defaultSlug && cheapest?.rate != null ? (
        <GpuStartSticky
          gpus={pick.gpus}
          defaultSlug={pick.defaultSlug}
          amount={pick.amount}
          offer={`From ${formatMoney(cheapest.rate, currency)}/hr`}
        />
      ) : null}
    </div>
  );
}
