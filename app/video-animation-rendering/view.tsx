import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ViewContent } from "@/components/analytics/view-content";
import { JsonLd } from "@/components/seo/json-ld";
import { PageByline } from "@/components/seo/page-byline";
import { BackgroundGlow } from "@/components/home/background-glow";
import { GenImage } from "@/components/visuals/media";
import { Fold } from "@/components/visuals/fold";
import { SpecTable } from "@/components/gpu/spec-table";
import { GpuLadder } from "@/components/pricing/gpu-ladder";
import { AREA_SERVED_WORLD, ORG_ID, SITE, breadcrumbList, faqPage, gpuLadderOffers } from "@/lib/seo";
import { NODE } from "@/lib/node-spec";
import { STREAM_BANDWIDTH } from "@/lib/streaming-terms";
import type { Currency } from "@/lib/money";
import {
  adhocRate,
  cheapestGpu,
  ladderPhrase,
  getRateCard,
  hoursLabel,
  introOfferFaq,
  introOfferFor,
  introPrice,
  pricingFaqAnswer,
  storageSpec,
  type RateCard,
} from "@/lib/rate-card";

/**
 * /video-animation-rendering — video and animation work on the RTX 5080
 * workstation (owner, 19 Oct 2026: "build pages 1–4"). A hub over the After
 * Effects / Premiere page, the Blender page, the walkthrough tools and the two
 * blog posts that already explain the details; it does not repeat them.
 *
 * Every claim is one the site already makes:
 *   - Creative Cloud is installed; After Effects, Premiere Pro and Media Encoder
 *     run on the customer's own Adobe account (lib/software-pages.ts,
 *     blog after-effects-on-a-remote-gpu). H.264 / HEVC on the card's hardware
 *     encoder, fonts and caches reset, colour judged on the export, upload
 *     planning (the blog's 100 GB at 50 Mbps ≈ 4.5 hours), the 15-minute hold
 *     after a dropped stream.
 *   - Blender is preinstalled; Cycles with OptiX (blog blender-interior-render).
 *     "Yes, on one GPU" for animation, and a render farm can be the better
 *     choice for long ones (same post): this page says so too.
 *   - FFmpeg, HandBrake and VLC are preinstalled (lib/software-catalogue.ts).
 *   - Walkthroughs from D5 Render, Lumion, Twinmotion and Unreal: their own
 *     pages; finishing them in After Effects or Premiere on the same machine
 *     is the blog's "Visualisation walkthroughs" section.
 *   - Prices: the live rate card, the visitor's currency only, lowest first.
 *     /usd/video-animation-rendering is the dollar copy (proxy.ts).
 * No render times or speed multiples: we have not measured the reader's scene.
 */

const PATH = "/video-animation-rendering";

const TITLE = "Video & Animation Rendering on a GPU Workstation | Coreframe";
const DESCRIPTION =
  "After Effects, Premiere Pro, Blender animation and walkthrough exports on a Windows GPU workstation, billed per minute. What works, what to plan for.";

export const videoMetadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "video rendering cloud",
    "animation rendering cloud GPU",
    "After Effects cloud workstation",
    "Premiere Pro cloud PC",
    "Blender animation render cloud",
    "cloud PC for video editing India",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    title: "Video and animation rendering on a GPU workstation — Coreframe Cloud",
    description: "After Effects, Premiere Pro, Blender and walkthrough exports on one rented Windows workstation.",
    url: `${SITE}${PATH}`,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Coreframe Cloud: Windows GPU workstations, rented by the minute" }],
  },
};

type Card = { name: string; tag: string; body: string; href: string; link: string };

const WORK: Card[] = [
  {
    name: "After Effects",
    tag: "Your Adobe account",
    body: `Motion graphics and heavy comps: small to upload, heavy to preview. The GPU handles many effects and the 3D renderer, and RAM preview gets ${NODE.ram} of system memory.`,
    href: "/software/after-effects-premiere-cloud-workstation",
    link: "After Effects and Premiere on Coreframe",
  },
  {
    name: "Premiere Pro and Media Encoder",
    tag: "Your Adobe account",
    body: "Short-form edits and social cuts, and export queues. H.264 and HEVC can encode on the card's hardware encoder while your laptop stays free.",
    href: "/software/after-effects-premiere-cloud-workstation",
    link: "The Adobe page",
  },
  {
    name: "Blender animation",
    tag: "Preinstalled",
    body: "Cycles on the GPU with OptiX, on one card. Render the frames to your project drive, then turn the image sequence into a video with FFmpeg or HandBrake, both on the machine.",
    href: "/software/blender-cloud-workstation",
    link: "Blender on Coreframe",
  },
  {
    name: "Architectural walkthroughs",
    tag: "D5 · Lumion · Twinmotion · Unreal",
    body: "Export the walkthrough from D5 Render, Lumion, Twinmotion or Unreal, then finish it in After Effects or Premiere on the same workstation: no upload and download between machines.",
    href: "/architectural-visualization",
    link: "Architectural visualization on Coreframe",
  },
];

const PLAN: [string, string][] = [
  [
    "Get the footage up first",
    "Footage travels over your own internet connection to your persistent project drive, so your upload speed is the limit: 100 GB at a steady 50 Mbps takes about four and a half hours. The Files tab in Coreframe Connect works without a workstation running and uploading is not billed, so send it the night before.",
  ],
  [
    "Judge colour on the export",
    `You see the desktop as a compressed stream at up to ${NODE.stream}. It is fine for editing, timing and motion, not a calibrated reference signal. Make final colour calls on the downloaded file.`,
  ],
  [
    "Fonts and caches start fresh",
    "Every session starts from a clean machine. Keep the project's fonts in a folder on your drive and install them at the start of a session; point the disk cache at the local drive, which is cleared when the session ends.",
  ],
  [
    "Your connection",
    `4K at 60 fps looks its best on about ${STREAM_BANDWIDTH.best4kMbps} Mbps and holds up at ${STREAM_BANDWIDTH.workable4kMbps}; 1080p is comfortable on ${STREAM_BANDWIDTH.comfortable1080pMbps} Mbps. If the stream drops, the workstation keeps running and Connect holds it for 15 minutes so you can reconnect.`,
  ],
];

function priceAnswer(card: RateCard | null, cur: Currency): string | null {
  const rate = adhocRate(card, cur);
  if (!rate) return null;
  const tax = cur === "USD" ? "no GST" : "GST included";
  const billed = card?.billing_granularity === "per_minute" ? ", billed per minute" : "";
  const intro = introOfferFor(card, cur);
  return intro
    ? `Your first ${introPrice(intro)} top-up buys ${hoursLabel(intro.hours)} on the workstation. After that it is ${rate} an hour, ${tax}${billed}.`
    : `The workstation is ${rate} an hour, ${tax}${billed}.`;
}

/** The fixed facts of every node; the GPU rows and prices are the ladder
 *  (<GpuLadder/>, from the rate card; owner, 21 Oct 2026). */
function specRows(card: RateCard | null): [string, string][] {
  const gpu = cheapestGpu(card);
  return [
    ["Storage", gpu ? `${storageSpec(gpu.storage_gb)} NVMe` : NODE.disk],
    ["Operating system", NODE.osShort],
    ["Streamed to you", `${NODE.stream}, through the Coreframe Connect app`],
    ["Location", NODE.location],
  ];
}

export default async function VideoView({ currency }: { currency: Currency }) {
  const card = await getRateCard();
  const answer = priceAnswer(card, currency);
  const priceFaq = pricingFaqAnswer(card, currency);
  const introFaq = introOfferFaq(card, currency);
  // One Offer pair per public GPU on the ladder (owner, 21 Oct 2026).
  const ladderOffers = gpuLadderOffers(card, `${SITE}${PATH}`);

  const faqs = [
    {
      q: "Can I render video and animation on a Coreframe workstation?",
      a: `Yes. It is a full Windows desktop (${NODE.os}) with ${ladderPhrase(card) ?? "a workstation-class GPU"}. After Effects, Premiere Pro and Media Encoder run on your own Adobe account; Blender, FFmpeg and HandBrake are preinstalled; D5 Render, Twinmotion and Unreal Engine are installed for walkthroughs.`,
    },
    {
      q: "Does Coreframe provide an Adobe licence?",
      a: "No. Creative Cloud is installed on the workstation and you sign in with your own Adobe account, so it runs on your own subscription.",
    },
    {
      q: "Can I render a Blender animation on it?",
      a: "Yes, on one GPU. For long animations a render farm that supports Cycles can spread frames across many machines at once, which a single workstation cannot do.",
    },
    {
      q: "How do I get my footage onto the workstation?",
      a: "Upload it to your persistent project drive with the Files tab in Coreframe Connect, which works without a workstation running. It travels over your own connection, so large camera originals take time: plan the upload before the deadline.",
    },
    {
      q: "Where do my renders go, and do they stay?",
      a: "Save them to your project drive (N:), which persists between sessions; the rest of the machine resets when the session ends. Download what you need from the Files tab.",
    },
    {
      q: "How long will my render take?",
      a: "It depends on your project, so we don't publish render times. Run one real comp, sequence or export in a short first session and time it before you plan a deadline around it.",
    },
    ...(priceFaq ? [{ q: "How much does a Coreframe workstation cost?", a: priceFaq }] : []),
    ...(introFaq ? [introFaq] : []),
  ];

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE}${PATH}#service`,
    name: "Cloud workstations for video and animation rendering",
    serviceType: "GPU workstation rental for video editing, motion graphics and animation rendering",
    provider: { "@id": ORG_ID },
    areaServed: AREA_SERVED_WORLD,
    url: `${SITE}${PATH}`,
    description: `A Windows GPU workstation rented by the minute for After Effects, Premiere Pro and Media Encoder on your own Adobe account, Blender animation (preinstalled), and walkthrough exports from D5 Render, Lumion, Twinmotion and Unreal Engine.`,
    ...(ladderOffers.length ? { offers: ladderOffers } : {}),
  };

  return (
    <div className="relative min-h-screen text-ink">
      <ViewContent name="Video and animation rendering" category="workstation" />
      <JsonLd data={breadcrumbList([{ name: "Video and animation rendering", path: PATH }])} />
      <JsonLd data={faqPage(faqs)} />
      <JsonLd data={serviceLd} />
      <BackgroundGlow />

      <main className="relative">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="cf-section px-5 cf-pagehero">
          <div className="cf-wide grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
            <div className="min-w-0">
              <p className="cf-eyebrow mb-5">Video and animation</p>
              <h1 className="cf-display">Video and animation rendering on a GPU workstation</h1>
              <p className="cf-lead mt-6">
                Comps, edits, exports and animation frames run on a rented Windows workstation while your laptop shows the
                stream and stays free. After Effects and Premiere Pro on your own Adobe account; Blender preinstalled;
                walkthroughs from D5 Render, Lumion, Twinmotion and Unreal finished on the same machine.
              </p>
              {answer ? <p className="cf-section-copy mt-5">{answer}</p> : null}
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#plan" className="cf-btn-secondary min-h-[44px]">What to plan for</a>
                <Link href="/pricing" className="cf-btn-secondary min-h-[44px]">Pricing</Link>
              </div>
              <PageByline path={PATH} published="2026-10-19" className="mt-4 opacity-75" />
            </div>
            <GenImage
              src="/visuals/gen-motion-designer-desk-16x9.webp"
              alt="A motion designer at his desk"
              width={1600}
              height={914}
              sizes="(max-width: 1024px) 100vw, 480px"
              parallax
              priority
            />
          </div>
        </section>

        {/* ── What runs ────────────────────────────────────────────────── */}
        <section className="cf-section px-5">
          <div className="cf-wide">
            <p className="cf-eyebrow mb-5">What you can render</p>
            <h2 className="cf-section-title">Four kinds of work, one machine.</h2>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {WORK.map((w) => (
                <Link key={w.name} href={w.href} className="cf-card group flex min-w-0 flex-col">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="text-base font-semibold tracking-[-0.01em] text-ink group-hover:underline group-hover:underline-offset-4">{w.name}</span>
                    <span className="font-mono text-[11.5px] tracking-[0.08em] text-ink-3 uppercase">{w.tag}</span>
                  </span>
                  <span className="mt-2.5 text-sm leading-[1.62] break-words text-ink-2">{w.body}</span>
                  <span className="mt-auto pt-4 text-[13.5px] text-blue">{w.link} &rarr;</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className="cf-rule" />

        {/* ── Blender on the GPU (a real screenshot) ───────────────────── */}
        <section className="cf-section px-5">
          <div className="cf-wide grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="min-w-0">
              <p className="cf-eyebrow mb-5">Blender animation</p>
              <h2 className="cf-section-title">Frames on the card, video on the same machine.</h2>
              <p className="cf-section-copy mt-4">
                In Blender&rsquo;s preferences choose OptiX, which uses the RTX card&rsquo;s ray-tracing cores, and set Cycles
                to GPU Compute. Render the animation as an image sequence to your project drive, so a frame finished is a
                frame kept, then join the sequence into a video with FFmpeg or HandBrake before you download it.
              </p>
              <p className="cf-section-copy mt-4">
                It is one GPU. For a long animation of hundreds of frames, a render farm that splits frames across many
                machines will often be the better choice, and{" "}
                <Link href="/cloud-workstation-vs-render-farm" className="text-ink underline underline-offset-4">
                  we have written up where each one wins
                </Link>
                .
              </p>
            </div>
            <figure className="min-w-0">
              <div className="overflow-hidden rounded-[20px] border border-rule bg-paper-2">
                <Image
                  src="/blog/blender-interior-render-on-cloud-rtx-5080/blender-optix.webp"
                  alt="Blender Preferences, System tab, with OptiX selected and the workstation's RTX 5080 ticked. Render properties show Cycles and GPU Compute."
                  width={1546}
                  height={782}
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="h-auto w-full"
                />
              </div>
              <figcaption className="mt-2.5 text-[13px] leading-5 text-ink-3">
                Preferences on the workstation: OptiX, with the RTX 5080 ticked. From{" "}
                <Link href="/blog/blender-interior-render-on-cloud-rtx-5080" className="underline underline-offset-4">
                  a whole Blender session, step by step
                </Link>
                .
              </figcaption>
            </figure>
          </div>
        </section>

        <div className="cf-rule" />

        {/* ── What to plan for ─────────────────────────────────────────── */}
        <section id="plan" className="cf-section scroll-mt-20 px-5">
          <div className="cf-wide">
            <p className="cf-eyebrow mb-5">What to plan for</p>
            <h2 className="cf-section-title">Four things to sort out before a deadline.</h2>
            <p className="cf-section-copy mt-4 max-w-[46rem]">
              The work runs well on a remote machine. <span className="cfx-hl">The footage and the stream are what need planning.</span>
            </p>
            <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {PLAN.map(([k, v]) => (
                <div key={k} className="cf-card min-w-0">
                  <dt className="text-base font-semibold tracking-[-0.01em] text-ink">{k}</dt>
                  <dd className="mt-2.5 text-sm leading-[1.62] break-words text-ink-2">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-[14.5px] leading-6 text-ink-2">
              The full version, with screenshots:{" "}
              <Link href="/blog/after-effects-on-a-remote-gpu" className="text-ink underline underline-offset-4">
                After Effects on a remote GPU: what works and what doesn&rsquo;t
              </Link>
              .
            </p>
          </div>
        </section>

        <div className="cf-rule" />

        {/* ── Fit + machine ────────────────────────────────────────────── */}
        <section className="cf-section px-5">
          <div className="cf-wide grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="min-w-0">
              <p className="cf-eyebrow mb-5">Where it fits</p>
              <h2 className="cf-section-title">And where it doesn&rsquo;t.</h2>
              <ul className="mt-6 list-disc space-y-2 pl-5 text-[15px] leading-6 text-ink-2">
                <li>Fits: motion graphics, short-form edits, comps that need more GPU or RAM than your laptop has, and exports you would rather not run on the machine you are working on.</li>
                <li>Fits: finishing a walkthrough on the machine that rendered it.</li>
                <li>Doesn&rsquo;t: hundreds of frames spread across many machines at once. That is a render farm&rsquo;s job.</li>
                <li>Doesn&rsquo;t: long-form work with terabytes of camera originals and a reference monitor. The upload and the stream are the wrong tools for that.</li>
              </ul>
            </div>
            <div className="min-w-0">
              <p className="cf-eyebrow mb-5">The machine</p>
              <h2 className="cf-section-title">What you are renting.</h2>
              <div className="mt-6"><GpuLadder card={card} currency={currency} compact /></div>
              <SpecTable rows={specRows(card)} caption="The workstation you rent: storage, system and location" />
            </div>
          </div>
        </section>

        <div className="cf-rule" />

        {/* ── First session ────────────────────────────────────────────── */}
        <section className="cf-section px-5">
          <div className="cf-col">
            <p className="cf-eyebrow mb-5">A sensible first session</p>
            <h2 className="cf-section-title">Test it on one real project.</h2>
            <ol data-cf-steps="" className="mt-6 space-y-4">
              {[
                "Install the Connect app on your Windows laptop and create an account (email and a WhatsApp code, no ID documents).",
                "Upload one real project and its footage to the Files tab before launching.",
                "Launch, sign in to Creative Cloud with your own Adobe account (or open Blender), and open the project from the N: drive.",
                "Scrub the timeline, run a preview, and queue one export or a few frames.",
                "Download the result and check it on your own screen. Then end the session so billing stops.",
              ].map((t, i) => (
                <li key={t} className="flex gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink font-heading text-[15px] text-white">{i + 1}</span>
                  <p className="min-w-0 pt-1.5 text-[15px] leading-6 text-ink-2">{t}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Further reading ──────────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <ul className="grid grid-cols-1 gap-x-8 gap-y-1 text-[15px] sm:grid-cols-2">
              {[
                ["/software/after-effects-premiere-cloud-workstation", "After Effects and Premiere Pro on a rented RTX workstation"],
                ["/software/blender-cloud-workstation", "Blender cloud workstation for Cycles"],
                ["/software/unreal-engine-cloud-workstation", "Unreal Engine, preinstalled"],
                ["/d5-render-cloud-workstation", "D5 Render cloud workstation"],
                ["/cloud-workstation-vs-render-farm", "Cloud workstation vs render farm"],
                ["/how-to-use", "How a Coreframe session works"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="inline-flex min-h-[44px] items-center text-blue underline-offset-4 hover:underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── FAQ, then the ask ────────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-col">
            <h2 className="cf-section-title">Questions.</h2>
            {faqs.map((f) => (
              <Fold key={f.q} title={f.q}>
                <p className="mt-3 text-[15px] leading-6 break-words text-ink-2">{f.a}</p>
              </Fold>
            ))}
            <p className="mt-8 text-[14.5px] leading-6 text-ink-2">
              Ready to try one project?{" "}
              <Link href="/signup" className="text-ink underline underline-offset-4">
                Create an account
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
