import type { Metadata } from "next";
import Link from "next/link";
import { ViewContent } from "@/components/analytics/view-content";
import { JsonLd } from "@/components/seo/json-ld";
import { PageByline } from "@/components/seo/page-byline";
import { BackgroundGlow } from "@/components/home/background-glow";
import { GenImage } from "@/components/visuals/media";
import { StreamDiagram } from "@/components/visuals/diagrams";
import { Fold } from "@/components/visuals/fold";
import { SpecTable } from "@/components/gpu/spec-table";
import { GpuLadder } from "@/components/pricing/gpu-ladder";
import { AREA_SERVED_WORLD, ORG_ID, SITE, breadcrumbList, faqPage, gpuLadderOffers } from "@/lib/seo";
import { NODE } from "@/lib/node-spec";
import type { Currency } from "@/lib/money";
import {
  adhocRate,
  cheapestGpu,
  getRateCard,
  hoursLabel,
  introOfferFaq,
  introOfferFor,
  introPrice,
  pricingFaqAnswer,
  storageSpec,
  type RateCard,
} from "@/lib/rate-card";
import { FREE_PREVIEWS_PER_DAY, studioMoney, studioPrices } from "@/lib/studio-prices";

/**
 * /architectural-visualization — the hub for architectural visualisation
 * (owner, 19 Oct 2026: "build pages 1–4"). It ties the per-application pages
 * together by task (real-time walkthroughs, path-traced stills, modelling and
 * BIM, interiors from a plan) and sends each reader to the page for their
 * tool. /cloud-rendering-for-architects stays the page for STUDIOS (named
 * seats, shared NAS, plans); this one is organised by software and links to it.
 *
 * Every claim is one an existing page already makes:
 *   - Preinstalled: D5 Render, Twinmotion, Unreal Engine 5.8 with Quixel
 *     Bridge, Blender (lib/software-catalogue.ts PREINSTALLED, the D5 / Twinmotion
 *     / Unreal / Blender pages). D5 and Unreal sign in with the customer's own
 *     account; Twinmotion's free tier covers most individual users.
 *   - Bring your own licence: Lumion, Enscape (a plugin in Revit, SketchUp,
 *     Rhino or Archicad), V-Ray, 3ds Max (V-Ray, Corona, Vantage with a Chaos
 *     account), Revit, SketchUp Pro, Rhino (lib/software-pages.ts,
 *     lib/software-catalogue.ts BRING_YOUR_OWN_LICENCE).
 *   - No speed claims or render times (cloud-rendering-for-architects rule).
 *   - The machine: the rate card's GPU row, NODE as fallback (lib/node-spec.ts).
 *   - Prices: the live rate card only, in the visitor's currency only, lowest
 *     first (the intro offer when it is live, then the hourly rate); Studio
 *     from lib/studio-prices.ts. Rendered twice: here in rupees and
 *     /usd/architectural-visualization in dollars (proxy.ts).
 */

const PATH = "/architectural-visualization";

const TITLE = "Architectural Visualization on a GPU Workstation | Coreframe";
const DESCRIPTION =
  "D5 Render, Lumion, Enscape, Twinmotion, V-Ray, Unreal, Revit, SketchUp and 3ds Max on one Windows GPU workstation, billed per minute. Which tool, which page.";

export const archvizMetadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "architectural visualization",
    "architectural visualization cloud workstation",
    "archviz cloud GPU",
    "architectural rendering software cloud",
    "cloud workstation for architectural rendering",
    "3D architectural visualization India",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    title: "Architectural visualization on a GPU workstation — Coreframe Cloud",
    description: "Every archviz tool we support, grouped by job, on one rented Windows workstation.",
    url: `${SITE}${PATH}`,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Coreframe Cloud: Windows GPU workstations, rented by the minute" }],
  },
};

type Tool = { name: string; href: string; licence: "Preinstalled" | "Your licence"; body: string };
type Group = { id: string; title: string; lead: string; tools: Tool[] };

const GROUPS: Group[] = [
  {
    id: "real-time",
    title: "Real-time walkthroughs and quick stills",
    lead: "Engines that render as you move. They lean on the GPU and its memory, which is what you are renting.",
    tools: [
      {
        name: "D5 Render",
        href: "/d5-render-cloud-workstation",
        licence: "Preinstalled",
        body: "Installed for you; sign in with your own D5 account, and whatever plan you hold with D5 applies.",
      },
      {
        name: "Lumion",
        href: "/lumion-cloud-gpu",
        licence: "Your licence",
        body: `Install Lumion and activate your own seat. Heavy vegetation and high-resolution textures get the card's ${NODE.vram}.`,
      },
      {
        name: "Enscape",
        href: "/enscape-cloud-gpu",
        licence: "Your licence",
        body: "A plugin: its host (Revit, SketchUp, Rhino or Archicad) goes on the same desktop first, then you sign in to Enscape.",
      },
      {
        name: "Twinmotion",
        href: "/software/twinmotion-cloud-workstation",
        licence: "Preinstalled",
        body: "Installed and ready. Its free tier covers most individual users; a paid seat signs in with your Epic account.",
      },
      {
        name: "Unreal Engine",
        href: "/software/unreal-engine-cloud-workstation",
        licence: "Preinstalled",
        body: "Unreal Engine 5.8 with Quixel Bridge, installed. Sign in with your Epic account; Datasmith brings in Revit and SketchUp models.",
      },
    ],
  },
  {
    id: "stills",
    title: "Path-traced stills and production rendering",
    lead: "The final images, where you choose quality over speed and the renderer runs for as long as it needs.",
    tools: [
      {
        name: "V-Ray",
        href: "/software/vray-cloud-rendering",
        licence: "Your licence",
        body: "Signs in with your Chaos account or your own licence server, inside 3ds Max, SketchUp, Rhino or Revit.",
      },
      {
        name: "3ds Max",
        href: "/software/3ds-max-cloud-workstation",
        licence: "Your licence",
        body: "Your Autodesk licence, and whichever renderer you sign in to with your Chaos account: V-Ray, Corona or Vantage.",
      },
      {
        name: "Blender",
        href: "/software/blender-cloud-workstation",
        licence: "Preinstalled",
        body: "Free and open source, so there is nothing to license. Cycles renders on the GPU.",
      },
    ],
  },
  {
    id: "modelling",
    title: "Modelling and BIM",
    lead: "The model the renders come from, on the same desktop as the renderer, so there is no export step between machines.",
    tools: [
      {
        name: "Revit",
        href: "/software/revit-cloud-workstation",
        licence: "Your licence",
        body: "Install from your own Autodesk account. Enscape, D5 and Twinmotion run beside it in the same session.",
      },
      {
        name: "SketchUp",
        href: "/software/sketchup-cloud-workstation",
        licence: "Your licence",
        body: "SketchUp Pro signs in with your Trimble account, with V-Ray, Enscape or D5 alongside.",
      },
      {
        name: "Rhino",
        href: "/software/rhino-cloud-workstation",
        licence: "Your licence",
        body: "Rhino on your own licence key, with Grasshopper and your renderer on the same desktop.",
      },
    ],
  },
];

/** The lowest live price first: the intro offer when it is on, then the hourly rate. Null without a rate card. */
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

export default async function ArchvizView({ currency }: { currency: Currency }) {
  const card = await getRateCard();
  const answer = priceAnswer(card, currency);
  const studio = studioMoney(studioPrices(card), currency);
  const priceFaq = pricingFaqAnswer(card, currency);
  const introFaq = introOfferFaq(card, currency);
  // One Offer pair per public GPU on the ladder (owner, 21 Oct 2026).
  const ladderOffers = gpuLadderOffers(card, `${SITE}${PATH}`);

  const faqs = [
    {
      q: "Which architectural visualization software is preinstalled?",
      a: "D5 Render, Twinmotion, Unreal Engine 5.8 with Quixel Bridge and Blender are installed on every Coreframe workstation. D5 and Unreal sign in with your own account; Twinmotion's free tier covers most individual users; Blender needs no licence.",
    },
    {
      q: "Do I need my own licence for Lumion, Enscape, V-Ray or Revit?",
      a: "Yes. Lumion, Enscape, V-Ray, 3ds Max, Revit, SketchUp Pro and Rhino are bring your own licence: you install them and sign in with your own account or key, exactly as on a new PC. We supply the machine, never the licence.",
    },
    {
      q: "Is this a render farm?",
      a: "No. It is a whole Windows desktop that you work on: you open the model, change it, render it and look at the result in the same session. A render farm takes a finished scene and renders it in a queue. Our comparison page explains when each one fits.",
    },
    {
      q: "Will my renders be faster than on my own computer?",
      a: "It depends on the machine you have now, so we don't publish a speed multiple or render times. What is true is that the render happens on the rented workstation, so your own computer stays free, and several people can render at once on separate workstations.",
    },
    {
      q: "I only need an interior image from a floor plan. Do I need a workstation?",
      a: `No. Coreframe Studio turns a 2D DXF floor plan into interior concept images in the browser, with no software to install. Previews are free, up to ${FREE_PREVIEWS_PER_DAY} a day; a 2K download is ${studio.k2} and 4K ${studio.k4}, ${studio.tax}.`,
    },
    ...(priceFaq ? [{ q: "How much does a Coreframe workstation cost?", a: priceFaq }] : []),
    ...(introFaq ? [introFaq] : []),
  ];

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE}${PATH}#service`,
    name: "Cloud workstations for architectural visualization",
    serviceType: "GPU workstation rental for architectural visualization and rendering",
    provider: { "@id": ORG_ID },
    areaServed: AREA_SERVED_WORLD,
    url: `${SITE}${PATH}`,
    description: `A Windows GPU workstation rented by the minute for D5 Render, Lumion, Enscape, Twinmotion, Unreal Engine, V-Ray, 3ds Max, Blender, Revit, SketchUp and Rhino. D5 Render, Twinmotion, Unreal Engine and Blender are preinstalled; the others run on your own licence.`,
    ...(ladderOffers.length ? { offers: ladderOffers } : {}),
  };

  return (
    <div className="relative min-h-screen text-ink">
      <ViewContent name="Architectural visualization" category="workstation" />
      <JsonLd data={breadcrumbList([{ name: "Architectural visualization", path: PATH }])} />
      <JsonLd data={faqPage(faqs)} />
      <JsonLd data={serviceLd} />
      <BackgroundGlow />

      <main className="relative">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="cf-section px-5 cf-pagehero">
          <div className="cf-wide grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
            <div className="min-w-0">
              <p className="cf-eyebrow mb-5">Architectural visualization</p>
              <h1 className="cf-display">Architectural visualization on a GPU workstation</h1>
              <p className="cf-lead mt-6">
                One Windows workstation with a workstation-class GPU, rented by the minute, for the tools architects
                and visualisers already use: D5 Render, Lumion, Enscape, Twinmotion, Unreal, V-Ray, 3ds Max, Blender, Revit,
                SketchUp and Rhino. Pick your tool below for the details.
              </p>
              {answer ? <p className="cf-section-copy mt-5">{answer}</p> : null}
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#tools" className="cf-btn-secondary min-h-[44px]">Find your tool</a>
                <Link href="/pricing" className="cf-btn-secondary min-h-[44px]">Pricing</Link>
              </div>
              <PageByline path={PATH} published="2026-10-19" className="mt-4 opacity-75" />
            </div>
            <GenImage
              src="/visuals/gen-visualisers-review-16x9.webp"
              alt="Two visualisers reviewing architectural stills together at a studio desk"
              width={1600}
              height={914}
              sizes="(max-width: 1024px) 100vw, 480px"
              parallax
              priority
            />
          </div>
        </section>

        {/* ── Tools, grouped by the job ───────────────────────────────── */}
        <section id="tools" className="cf-section scroll-mt-20 px-5">
          <div className="cf-wide">
            <p className="cf-eyebrow mb-5">Pick your tool</p>
            <h2 className="cf-section-title">Grouped by the job, each with its own page.</h2>
            <p className="cf-section-copy mt-4 max-w-[46rem]">
              Every tool runs on the same machine, so you can model in one, render in another and never move a file between
              computers. <span className="cfx-hl">Four are preinstalled</span>; the rest run on your own licence.
            </p>
            {GROUPS.map((g) => (
              <div key={g.id} id={g.id} className="mt-12 scroll-mt-20">
                <h3 className="font-heading text-[22px] leading-[1.25] font-medium text-ink">{g.title}</h3>
                <p className="mt-2 max-w-[46rem] text-[15px] leading-6 text-ink-2">{g.lead}</p>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {g.tools.map((t) => (
                    <Link key={t.name} href={t.href} className="cf-card group flex min-w-0 flex-col">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <span className="text-base font-semibold tracking-[-0.01em] text-ink group-hover:underline group-hover:underline-offset-4">{t.name}</span>
                        <span className="font-mono text-[11.5px] tracking-[0.08em] text-ink-3 uppercase">{t.licence}</span>
                      </span>
                      <span className="mt-2.5 text-sm leading-[1.62] break-words text-ink-2">{t.body}</span>
                      <span className="mt-auto pt-4 text-[13.5px] text-blue">{t.name} on Coreframe &rarr;</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Interiors from a plan: Studio, not a workstation. */}
            <div id="interiors" className="mt-12 scroll-mt-20">
              <h3 className="font-heading text-[22px] leading-[1.25] font-medium text-ink">Interiors from a floor plan</h3>
              <p className="mt-2 max-w-[46rem] text-[15px] leading-6 text-ink-2">
                For an interior concept image you may not need a workstation at all.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link href="/floor-plan-to-render" className="cf-card group flex min-w-0 flex-col">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="text-base font-semibold tracking-[-0.01em] text-ink group-hover:underline group-hover:underline-offset-4">Coreframe Studio</span>
                    <span className="font-mono text-[11.5px] tracking-[0.08em] text-ink-3 uppercase">In the browser</span>
                  </span>
                  <span className="mt-2.5 text-sm leading-[1.62] break-words text-ink-2">
                    Upload a 2D DXF plan, pick a room and get interior concept images; walls, doors and windows come from your
                    drawing. Previews free ({FREE_PREVIEWS_PER_DAY} a day), 2K {studio.k2}, 4K {studio.k4}, {studio.tax}.
                  </span>
                  <span className="mt-auto pt-4 text-[13.5px] text-blue">Floor plan to render &rarr;</span>
                </Link>
                <Link href="/floor-plan-to-render/3bhk-example" className="cf-card group flex min-w-0 flex-col">
                  <span className="text-base font-semibold tracking-[-0.01em] text-ink group-hover:underline group-hover:underline-offset-4">A 3BHK plan, worked through</span>
                  <span className="mt-2.5 text-sm leading-[1.62] break-words text-ink-2">
                    One real 3BHK drawing through Studio: the rooms it read, the previews and the 4K living room, kitchen and
                    bedroom.
                  </span>
                  <span className="mt-auto pt-4 text-[13.5px] text-blue">See the example &rarr;</span>
                </Link>
                <Link href="/blog/blender-interior-render-on-cloud-rtx-5080" className="cf-card group flex min-w-0 flex-col">
                  <span className="text-base font-semibold tracking-[-0.01em] text-ink group-hover:underline group-hover:underline-offset-4">An interior in Blender, start to finish</span>
                  <span className="mt-2.5 text-sm leading-[1.62] break-words text-ink-2">
                    One whole session: upload a .blend, launch the workstation, render the interior in Cycles, save it and download it.
                  </span>
                  <span className="mt-auto pt-4 text-[13.5px] text-blue">Read the session &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="cf-rule" />

        {/* ── The machine ──────────────────────────────────────────────── */}
        <section className="cf-section px-5">
          <div className="cf-wide grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="min-w-0">
              <p className="cf-eyebrow mb-5">The machine</p>
              <h2 className="cf-section-title">One workstation for all of them.</h2>
              <p className="cf-section-copy mt-4">
                The same machine whichever tool you open. It runs in {NODE.location.split(",")[0]} and streams its desktop to
                your laptop; your laptop only shows the picture.
              </p>
              <div className="mt-6"><GpuLadder card={card} currency={currency} compact /></div>
              <SpecTable rows={specRows(card)} caption="The workstation you rent: storage, system and location" />
            </div>
            <div className="min-w-0 rounded-[24px] bg-tint-blue p-6">
              <p className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-ink-2 uppercase">Your laptop, our workstation</p>
              <StreamDiagram />
            </div>
          </div>
        </section>

        <div className="cf-rule" />

        {/* ── Workstation or Studio ────────────────────────────────────── */}
        <section className="cf-section px-5">
          <div className="cf-wide">
            <p className="cf-eyebrow mb-5">Which one</p>
            <h2 className="cf-section-title">A workstation, or Studio?</h2>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="cf-card min-w-0">
                <h3 className="text-base font-semibold text-ink">Rent the workstation when</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-[1.62] text-ink-2">
                  <li>you already work in D5, Lumion, Enscape, Twinmotion, Unreal, V-Ray or Blender;</li>
                  <li>you need your own model, materials and camera, frame by frame;</li>
                  <li>you are rendering a walkthrough or a set of stills for a client;</li>
                  <li>you want a full Windows desktop, billed per minute from when you connect.</li>
                </ul>
              </div>
              <div className="cf-card min-w-0">
                <h3 className="text-base font-semibold text-ink">Use Studio when</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-[1.62] text-ink-2">
                  <li>you have a 2D DXF floor plan and want a feel for the rooms;</li>
                  <li>an interior concept image is enough, with no 3D model to build;</li>
                  <li>you want to try looks for free before paying for a download;</li>
                  <li>there is no rendering software on your computer.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <div className="cf-rule" />

        {/* ── Further reading ──────────────────────────────────────────── */}
        <section className="cf-section px-5">
          <div className="cf-wide">
            <p className="cf-eyebrow mb-5">Before you choose</p>
            <h2 className="cf-section-title">Guides that answer the next question.</h2>
            <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-1 text-[15px] sm:grid-cols-2">
              {[
                ["/cloud-rendering-for-architects", "Cloud rendering for architecture studios: seats, shared files, plans"],
                ["/vram-for-architectural-rendering", "Is 8 GB of VRAM enough for architectural rendering?"],
                ["/blog/can-my-laptop-run-d5-render-or-lumion", "Can your laptop run D5 Render or Lumion?"],
                ["/cloud-workstation-vs-render-farm", "Cloud workstation vs render farm"],
                ["/video-animation-rendering", "Video and animation rendering: After Effects, Premiere, Blender"],
                ["/blog/cloud-workstation-vs-render-farm-vs-buying-cost-india", "Workstation, render farm or a new PC: what each costs"],
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
              Ready with your scene?{" "}
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
