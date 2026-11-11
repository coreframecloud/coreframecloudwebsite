import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { PageByline } from "@/components/seo/page-byline";
import { GpuPickCards } from "@/components/go/gpu-start";
import { breadcrumbList, faqPage, OG_IMAGE, SITE } from "@/lib/seo";
import { formatMoney, type Currency } from "@/lib/money";
import { startGpus } from "@/lib/gpu-start-server";
import { getRateCard, hourlyValue, publicGpus, shortGpuName, taxWords, type RateCardGpu } from "@/lib/rate-card";

/**
 * /rtx-a4000-vs-rtx-a5000 — "RTX A4000 vs RTX A5000 for rendering"
 * (content quick win 3, owner-approved 11 Nov 2026). Search Console showed
 * "a4000 gpu rental" at position 10 with no page behind it.
 *
 * SPECS ONLY FROM NVIDIA'S DATASHEETS (read 11 Nov 2026; SPEC below):
 *   RTX A4000: nvidia.com/content/dam/en-zz/Solutions/gtcs21/rtx-a4000/nvidia-rtx-a4000-datasheet.pdf
 *   RTX A5000: nvidia.com/content/dam/en-zz/Solutions/products/workstations/nvidia-rtx-a5000-datasheet.pdf
 *
 * NO SPEED FIGURES. We have no measured render on either card (plans/: the
 * only scripted render is the RTX 5080, gpu-p-vm-learnings-20261027 §3), so
 * the page states spec ratios only and points to the render-time calculator,
 * which labels its numbers as estimates from public medians.
 *
 * PRICES, VRAM and the ladder come from the live rate card only, in the
 * visitor's currency (/usd copy via proxy.ts). A card missing from the rate
 * card hides its price instead of printing a typed one.
 *
 * ONE big call to action (owner, 10 Nov 2026): the price-first card picker
 * with these two cards, Start → sign-up → pre-filled payment.
 */

const PATH = "/rtx-a4000-vs-rtx-a5000";
const CHECKED = "11 November 2026";

const SOURCES = {
  a4000: "https://www.nvidia.com/content/dam/en-zz/Solutions/gtcs21/rtx-a4000/nvidia-rtx-a4000-datasheet.pdf",
  a5000: "https://www.nvidia.com/content/dam/en-zz/Solutions/products/workstations/nvidia-rtx-a5000-datasheet.pdf",
} as const;

type Spec = {
  cuda: number;
  rt: number;
  tensor: number;
  vramGb: number;
  memory: string;
  bus: string;
  bandwidth: number;
  fp32: number;
  power: number;
  slot: string;
};

/** As published by NVIDIA (datasheets above). */
const SPEC: { a4000: Spec; a5000: Spec } = {
  a4000: { cuda: 6144, rt: 48, tensor: 192, vramGb: 16, memory: "GDDR6 with ECC", bus: "256-bit", bandwidth: 448, fp32: 19.2, power: 140, slot: "Single slot" },
  a5000: { cuda: 8192, rt: 64, tensor: 256, vramGb: 24, memory: "GDDR6 with ECC", bus: "384-bit", bandwidth: 768, fp32: 27.8, power: 230, slot: "Dual slot" },
};

const pct = (a: number, b: number) => Math.round((b / a - 1) * 100);
const n = (v: number) => v.toLocaleString("en-US");

export function compareMetadata(): Metadata {
  // No price in the metadata: the same for both currency copies.
  return {
    title: { absolute: "RTX A4000 vs RTX A5000 for Rendering: Specs & Which to Pick" },
    description:
      "RTX A4000 (16 GB, 6,144 CUDA cores) vs RTX A5000 (24 GB, 8,192 CUDA cores) for rendering: NVIDIA's specs side by side, which scene sizes fit each, and the hourly price.",
    keywords: ["a4000 vs a5000", "rtx a4000 vs rtx a5000 rendering", "rtx a4000 rental", "rtx a5000 rental", "a4000 gpu rental"],
    alternates: { canonical: PATH },
    openGraph: {
      images: [OG_IMAGE],
      title: "RTX A4000 vs RTX A5000 for rendering",
      description: "The published specs side by side, and which scene sizes fit each card.",
      url: `${SITE}${PATH}`,
      type: "article",
    },
  };
}

function find(card: Awaited<ReturnType<typeof getRateCard>>, re: RegExp): RateCardGpu | null {
  return publicGpus(card).find((g) => re.test(g.gpu_model)) ?? null;
}

export default async function CompareView({ currency }: { currency: Currency }) {
  const card = await getRateCard();
  const a4 = find(card, /RTX A4000/i);
  const a5 = find(card, /RTX A5000/i);
  const p4 = a4 ? hourlyValue(a4, currency, card) : null;
  const p5 = a5 ? hourlyValue(a5, currency, card) : null;
  const price = (v: number | null) => (v != null ? `${formatMoney(v, currency)}/hr` : null);
  const tax = taxWords(currency);

  // The next card up in memory, and the card with the most CUDA cores at 16 GB, from the live ladder.
  const bigger = publicGpus(card)
    .filter((g) => g.vram_gb > SPEC.a5000.vramGb && hourlyValue(g, currency, card) != null)
    .sort((x, y) => x.vram_gb - y.vram_gb)[0];
  const fast16 = publicGpus(card)
    .filter((g) => g.vram_gb === 16 && (g.cuda_cores ?? 0) > SPEC.a4000.cuda && hourlyValue(g, currency, card) != null)
    .sort((x, y) => (y.cuda_cores ?? 0) - (x.cuda_cores ?? 0))[0];

  const pick = startGpus(card, currency);
  const pairSlugs = [a4?.slug, a5?.slug].filter(Boolean) as string[];
  const pairGpus = pick.gpus.filter((g) => pairSlugs.includes(g.slug));
  const pairDefault = a4?.slug ?? pairGpus[0]?.slug ?? null;

  const cudaUp = pct(SPEC.a4000.cuda, SPEC.a5000.cuda);
  const bwUp = pct(SPEC.a4000.bandwidth, SPEC.a5000.bandwidth);
  const priceUp = p4 && p5 ? pct(p4, p5) : null;

  const answer =
    `The RTX A5000 has 24 GB of memory, 8,192 CUDA cores and 768 GB/s of memory bandwidth; the RTX A4000 has 16 GB, 6,144 CUDA cores and 448 GB/s (NVIDIA's datasheets). ` +
    `For rendering, memory decides first: if your scene peaks under about 14 GB, the A4000 holds it; between about 14 and 22 GB, you need the A5000.` +
    (p4 && p5 ? ` On Coreframe the A4000 is ${price(p4)} and the A5000 ${price(p5)}, ${tax}, billed per minute.` : "");

  const rows: { label: string; a: string; b: string; win?: "a" | "b" }[] = [
    { label: "GPU memory (VRAM)", a: `${SPEC.a4000.vramGb} GB`, b: `${SPEC.a5000.vramGb} GB`, win: "b" },
    { label: "Memory type", a: SPEC.a4000.memory, b: SPEC.a5000.memory },
    { label: "Memory interface", a: SPEC.a4000.bus, b: SPEC.a5000.bus },
    { label: "Memory bandwidth", a: `${SPEC.a4000.bandwidth} GB/s`, b: `${SPEC.a5000.bandwidth} GB/s`, win: "b" },
    { label: "CUDA cores", a: n(SPEC.a4000.cuda), b: n(SPEC.a5000.cuda), win: "b" },
    { label: "RT cores (2nd gen)", a: n(SPEC.a4000.rt), b: n(SPEC.a5000.rt), win: "b" },
    { label: "Tensor cores (3rd gen)", a: n(SPEC.a4000.tensor), b: n(SPEC.a5000.tensor), win: "b" },
    { label: "FP32 (peak, NVIDIA)", a: `${SPEC.a4000.fp32} TFLOPS`, b: `${SPEC.a5000.fp32} TFLOPS` },
    { label: "Board power", a: `${SPEC.a4000.power} W`, b: `${SPEC.a5000.power} W`, win: "a" },
    { label: "Form factor", a: SPEC.a4000.slot, b: SPEC.a5000.slot },
    ...(p4 && p5 ? [{ label: `Coreframe price (${tax})`, a: price(p4)!, b: price(p5)!, win: "a" as const }] : []),
  ];

  const bars: { label: string; a: number; b: number; unit: string }[] = [
    { label: "VRAM", a: SPEC.a4000.vramGb, b: SPEC.a5000.vramGb, unit: "GB" },
    { label: "CUDA cores", a: SPEC.a4000.cuda, b: SPEC.a5000.cuda, unit: "" },
    { label: "Bandwidth", a: SPEC.a4000.bandwidth, b: SPEC.a5000.bandwidth, unit: "GB/s" },
    ...(p4 && p5 ? [{ label: "Price per hour", a: p4, b: p5, unit: currency === "USD" ? "$" : "₹" }] : []),
  ];

  const faqs: { q: string; a: string }[] = [
    {
      q: "Is the RTX A5000 faster than the RTX A4000 for rendering?",
      a: `On paper, yes: it has ${cudaUp}% more CUDA cores (8,192 vs 6,144) and ${bwUp}% more memory bandwidth (768 vs 448 GB/s), per NVIDIA's datasheets. We have not timed renders on either card ourselves, so we don't quote a render-time difference; the render-time calculator gives an estimate from public benchmark medians.`,
    },
    {
      q: "Is 16 GB of VRAM enough for rendering?",
      a: "For most single-building work, yes: interiors, one building without site context, 2K texture sets and stills usually fit. It stops being enough with 4K texture sets, dense scattered vegetation, a point cloud or a federated model; measure your scene's peak in Task Manager and add about 2 GB of headroom.",
    },
    {
      q: "When should I pick the RTX A5000 over the RTX A4000?",
      a: "When your scene's measured peak memory is above about 14 GB, or close enough that it might grow past it. The A5000's 24 GB holds scenes the 16 GB A4000 cannot load; a scene that doesn't fit doesn't render more slowly, it fails or spills to system memory.",
    },
    ...(p4 && p5
      ? [
          {
            q: "How much does it cost to rent an RTX A4000 or RTX A5000?",
            a: `On Coreframe the RTX A4000 (16 GB) is ${price(p4)} and the RTX A5000 (24 GB) is ${price(p5)}, ${tax}, billed per minute from a prepaid wallet. You pick the card each time you start a session.`,
          },
        ]
      : []),
    {
      q: "Do the RTX A4000 and RTX A5000 support hardware ray tracing?",
      a: `Yes. Both are NVIDIA Ampere workstation cards with second-generation RT cores (48 on the A4000, 64 on the A5000), so GPU path tracers such as Blender Cycles with OptiX, D5 Render, Twinmotion, Enscape and V-Ray GPU can use them.`,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-x-clip text-ink">
      <JsonLd data={breadcrumbList([{ name: "RTX A4000 vs RTX A5000", path: PATH }])} />
      <JsonLd data={faqPage(faqs)} />

      <main className="relative">
        <section className="cf-section cf-pagehero px-5">
          <div className="cf-col">
            <p className="cf-eyebrow mb-5">Comparison · GPUs</p>
            <h1 className="cf-display">RTX A4000 vs RTX A5000 for rendering</h1>
            <p className="cf-lead mt-6">{answer}</p>
            <PageByline path={PATH} className="mt-4 opacity-75" />
          </div>
        </section>

        <section className="cf-section px-5" data-cf-section="at-a-glance">
          <div className="cf-col">
            <h2 className="cf-title">At a glance</h2>
            <div className="mt-6 grid gap-5">
              {bars.map((b) => {
                const max = Math.max(b.a, b.b);
                const fmt = (v: number) =>
                  b.unit === "₹" || b.unit === "$" ? formatMoney(v, currency) : `${n(v)}${b.unit ? ` ${b.unit}` : ""}`;
                return (
                  <div key={b.label}>
                    <p className="text-[13px] font-semibold tracking-[0.04em] text-ink-3 uppercase">{b.label}</p>
                    {(
                      [
                        ["RTX A4000", b.a],
                        ["RTX A5000", b.b],
                      ] as const
                    ).map(([name, v]) => (
                      <div key={name} className="mt-1.5 grid grid-cols-[84px_1fr] items-center gap-3">
                        <span className="text-[13.5px] text-ink-2">{name}</span>
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className={`h-3.5 rounded-full ${name === "RTX A5000" ? "bg-blue" : "bg-ink/35"}`}
                            style={{ width: `${Math.max(8, (v / max) * 70)}%` }}
                            aria-hidden
                          />
                          <span className="shrink-0 text-[14px] font-semibold text-ink">{fmt(v)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <p className="mt-6 text-[14px] leading-6 text-ink-2">
              The A5000 has {cudaUp}% more CUDA cores, {bwUp}% more memory bandwidth and 50% more memory
              {priceUp != null ? `, for ${priceUp}% more per hour` : ""}. These are spec ratios, not measured render
              times.
            </p>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5" data-cf-section="specs">
          <div className="cf-col">
            <h2 className="cf-title">The published specs</h2>
            <div className="mt-6 overflow-x-auto rounded-[16px] border border-rule">
              <table className="w-full min-w-[320px] text-left text-[14px] leading-5">
                <thead className="bg-paper-2 text-[12.5px] tracking-[0.04em] text-ink-3 uppercase">
                  <tr>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Spec</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">RTX A4000</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">RTX A5000</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.label} className="border-t border-rule align-top">
                      <th scope="row" className="px-3 py-2.5 font-medium text-ink-2">{r.label}</th>
                      <td className={`px-3 py-2.5 ${r.win === "a" ? "font-semibold text-ink" : "text-ink-2"}`}>{r.a}</td>
                      <td className={`px-3 py-2.5 ${r.win === "b" ? "font-semibold text-ink" : "text-ink-2"}`}>{r.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[13px] leading-5 text-ink-3">
              Specs from NVIDIA&apos;s datasheets for the{" "}
              <a href={SOURCES.a4000} className="underline underline-offset-2" rel="noopener" target="_blank">
                RTX A4000
              </a>{" "}
              and the{" "}
              <a href={SOURCES.a5000} className="underline underline-offset-2" rel="noopener" target="_blank">
                RTX A5000
              </a>
              , read {CHECKED}. FP32 is NVIDIA&apos;s peak figure at boost clock. Prices are Coreframe&apos;s live rates.
              {a4 && a5 && a4.ram_gb === a5.ram_gb ? ` On Coreframe both come with ${a4.ram_gb} GB of system RAM.` : ""}
            </p>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5" data-cf-section="which">
          <div className="cf-col">
            <h2 className="cf-title">Which one for your scene</h2>
            <p className="mt-4 text-[15px] leading-6 text-ink-2">
              Open your heaviest project, read <b className="text-ink">Dedicated GPU memory</b> in Task Manager while
              you orbit and start a render, and add about 2 GB for Windows and the display.{" "}
              <Link href="/vram-for-architectural-rendering" className="text-blue underline underline-offset-2">
                How to measure it
              </Link>
              .
            </p>
            <ul className="mt-6 grid gap-3">
              <li className="cf-card-sm">
                <p className="font-semibold text-ink">Peak under about 14 GB → RTX A4000 (16 GB){p4 ? ` · ${price(p4)}` : ""}</p>
                <p className="mt-1 text-ink-2">
                  Interiors, a single building without site context, 2K texture sets, stills and short walkthroughs.
                </p>
              </li>
              <li className="cf-card-sm">
                <p className="font-semibold text-ink">Peak about 14 to 22 GB → RTX A5000 (24 GB){p5 ? ` · ${price(p5)}` : ""}</p>
                <p className="mt-1 text-ink-2">
                  4K PBR texture sets, site context with scattered trees and grass, a federated model, Enscape VR (Chaos
                  recommends 12 GB) or Lumion&apos;s high-end tier (16 GB or more).
                </p>
              </li>
              {bigger ? (
                <li className="cf-card-sm">
                  <p className="font-semibold text-ink">
                    Peak above about 22 GB → {shortGpuName(bigger.name)} ({bigger.vram_gb} GB) ·{" "}
                    {price(hourlyValue(bigger, currency, card))}
                  </p>
                  <p className="mt-1 text-ink-2">Point clouds, city blocks and large animations that outgrow 24 GB.</p>
                </li>
              ) : null}
              {fast16 ? (
                <li className="cf-card-sm">
                  <p className="font-semibold text-ink">
                    Fits in 16 GB and you want more CUDA cores → {shortGpuName(fast16.name)} ·{" "}
                    {price(hourlyValue(fast16, currency, card))}
                  </p>
                  <p className="mt-1 text-ink-2">
                    {n(fast16.cuda_cores ?? 0)} CUDA cores with 16 GB. Our{" "}
                    <Link href="/tools/render-time" className="text-blue underline underline-offset-2">
                      render-time calculator
                    </Link>{" "}
                    shows an estimate for each card.
                  </p>
                </li>
              ) : null}
            </ul>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5" data-cf-section="speed">
          <div className="cf-col">
            <h2 className="cf-title">What about render speed?</h2>
            <p className="mt-4 text-[15px] leading-6 text-ink-2">
              We haven&apos;t timed renders on either card ourselves yet, so this page has no speed figures. More CUDA
              cores, RT cores and memory bandwidth usually mean shorter GPU renders, but how much depends on the
              renderer and the scene. For a rough estimate based on public benchmark medians, with the assumptions
              shown, use the{" "}
              <Link href="/tools/render-time" className="text-blue underline underline-offset-2">
                render-time calculator
              </Link>
              . Or run your own scene on both: you pay per minute for the time you use.
            </p>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5" data-cf-section="faq">
          <div className="cf-col">
            <h2 className="cf-title">Questions</h2>
            <div className="mt-6 grid gap-3">
              {faqs.map((f) => (
                <details key={f.q} className="group rounded-[16px] border border-rule bg-paper px-4">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 [&::-webkit-details-marker]:hidden">
                    <span className="font-semibold text-ink">{f.q}</span>
                    <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink/[0.06] text-ink-2 transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="pb-4 text-ink-2">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {pairDefault && pairGpus.length ? (
          <section className="cf-section px-5 pb-20" data-cf-section="start">
            <div className="cf-col">
              <h2 className="cf-title">Try your scene on either card</h2>
              <p className="mt-3 mb-6 text-[15px] leading-6 text-ink-2">
                A Windows workstation with the card you pick, streamed to your laptop. Billed per minute, {tax}.
              </p>
              <GpuPickCards
                gpus={pairGpus}
                defaultSlug={pairDefault}
                amount={pick.amount}
                introHours={pick.introHours}
                currency={currency}
                where="a4000_vs_a5000"
              />
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
