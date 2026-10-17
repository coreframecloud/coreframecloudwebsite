import type { Metadata } from "next";
import { PageByline } from "@/components/seo/page-byline";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbList } from "@/lib/seo";
import Link from "next/link";
import { Fold } from "@/components/visuals/fold";
import Image from "next/image";
import { PlanImage, ShellFurnished } from "@/components/visuals/studio-compare";
import { PageHeroBg, type HeroImage } from "@/components/page-hero-bg";
import { NODE } from "@/lib/node-spec";
import { SITE } from "@/lib/seo";
import { getRateCard } from "@/lib/rate-card";
import { Hl } from "@/components/cfd-explainer";
import { FREE_PREVIEWS_PER_DAY, MAX_DXF_MB, inr, studioOffers, studioPrices, usd, type StudioPrices } from "@/lib/studio-prices";

/**
 * THE INDEXABLE PAGE FOR STUDIO. It did not exist, and that is why Studio is
 * not in any search index.
 *
 * Four faults stacked up:
 *
 *   1. /studio on this host is a PERMANENT 301 to studio.coreframecloud.com.
 *      A 301 tells a crawler "this URL is gone". So the site with all the
 *      authority had no Studio page at all -- it gave the URL away.
 *   2. app/sitemap.ts lists twenty-odd URLs and not one of them was Studio.
 *      The same file already carries a note about /tools and /cfd being
 *      missing from it. Same fault, newer product.
 *   3. studio.coreframecloud.com served no robots.txt. robots.txt is per-host,
 *      so the careful one here -- Content-Signals, the AI answer-engine
 *      allow-list -- never applied to it. (Now served by the control plane.)
 *   4. Even crawled, the app is a sign-in screen. Nothing to rank, and nothing
 *      you would want to rank.
 *
 * The 301 is NOT unwound: next.config.ts is right that a permanent redirect is
 * cached hard and reversing it means serving a 301 back the other way. /studio
 * keeps pointing at the app, which is correct -- that IS the app's entrance.
 * This is a separate URL, aimed at what people actually type, and the app now
 * carries a canonical link back to it.
 *
 * PRICES (16 Oct 2026, Studio open): the rupee prices below are the live
 * defaults in apps/tools (CF_STUDIO_PRICE_*_INR: edit 20, 2K 30, 4K 50), typed
 * once in @/lib/studio-prices.ts (dollars from the rate card). If they change
 * there, change them in studio-prices.ts and components/home/redesign/
 * offerings.tsx. The note that follows is history.
 *
 * NO RUPEE FIGURE ON THIS PAGE. It carried "Credits from Rs 99" in the meta
 * description, the hero, the FAQ and the closing CTA, for a product that is
 * still in private testing -- four hand-typed copies of a price with no
 * source, which is how the workstation rate ended up in fourteen files. Credit
 * COSTS (30 for a 2K export, 42 for 4K) are product facts and stay; what a
 * credit is worth in rupees is shown in Studio, and goes here only once there
 * is a helper to read it from.
 */

/**
 * SEO/AEO review 18 Oct 2026 (section 3.4, action 7): a descriptive H1 (the
 * slogan became the line under it), a title and description inside the
 * 60 / 155-character limits, an answer-first paragraph with both currencies in
 * the static HTML, WebApplication + HowTo schema with dual-currency Offers, a
 * visible "Last updated" date, the "export a clean DXF" how-to, and a link to
 * the 3BHK worked example. Prices: @/lib/studio-prices.ts.
 */
const LAST_UPDATED = { iso: "2026-10-18", label: "18 October 2026" };

export const metadata: Metadata = {
  title: { absolute: "Floor Plan to 3D Interior Render from DXF | Coreframe Studio" },
  description:
    "Upload a 2D DXF floor plan, pick a room and get interior concept renders. Walls, doors and windows come from your drawing. Free previews; 2K ₹30.",
  keywords: [
    "floor plan to 3d render",
    "floor plan rendering",
    "DXF to interior render",
    "2d floor plan to 3d render",
    "AI interior rendering from floor plan",
    "convert floor plan to render India",
    "AI render for architects India",
  ],
  alternates: { canonical: "/floor-plan-to-render" },
};

/**
 * Hero picture (owner, 16 Oct 2026: "the hero image should be a very nice
 * render"). A genuine Studio 4K export of the demo plan's living room, corner
 * view, golden hour (seed 44; prompt in
 * marketing-20261016-site-explainer/gen/runs.jsonl, grade in grade.md), so it
 * carries Studio's own "Generated image" label. Different from the living-room
 * export further down (wide view, evening).
 */
const HERO: HeroImage = {
  src: "/heroes/studio-hero-living-2560.webp",
  w: 2560,
  h: 1440,
  mobile: { src: "/heroes/studio-hero-living-m780.webp", w: 780, h: 1040 },
  alt: "The living room from our sample plan at golden hour: a sand linen sofa with rust and indigo cushions, an olive tree, a carved teak cabinet and a garden through tall windows (generated image)",
  pos: "60% 50%",
  posMobile: "50% 50%",
  credit: "Generated image",
};

/** More rooms from the same sample plan, each a Studio 4K export (16 Oct 2026). */
const STUDIO_ROOMS = [
  { src: "/studio-renders/studio-kitchen-2048.webp", cap: "The kitchen.", alt: "The kitchen from our sample plan: sage-green cabinets, a stone-topped island with a fruit bowl, open shelves with copper jars and brass taps" },
  { src: "/studio-renders/studio-masterbed-2048.webp", cap: "The master bedroom.", alt: "The master bedroom from our sample plan: a teak bed with a rust throw, a tall louvred wardrobe, a patterned rug, a palm and sheer curtains" },
  { src: "/studio-renders/studio-balcony-2048.webp", cap: "The balcony, looking back into a bedroom.", alt: "The balcony from our sample plan at dusk: potted plants, a cane chair and a railing over trees, with a lit bedroom through the door" },
];

function steps(p: StudioPrices) {
  return [
    { n: "1", title: "Upload your DXF.", body: "We find the walls and rooms. Free." },
    { n: "2", title: "Pick a room.", body: "Tell us it's a bedroom or a kitchen. Use our camera angles or place your own. Free." },
    { n: "3", title: "Say how it should feel.", body: `One sentence. You get three angles to compare. Free, up to ${FREE_PREVIEWS_PER_DAY} previews a day.` },
    {
      n: "4",
      title: "Download the one you like.",
      body: `2K for email (${inr(p.inr.k2)}), 4K for print (${inr(p.inr.k4)}); ${usd(p.usd.k2)} and ${usd(p.usd.k4)} for accounts billed in dollars.`,
    },
  ];
}

/** HowTo schema: the same four steps, in plain words. */
function howToLd(p: StudioPrices) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to turn a DXF floor plan into an interior concept render",
    description: "Upload a 2D DXF floor plan to Coreframe Studio, pick a room, preview three camera angles for free and download the image you want.",
    tool: { "@type": "HowToTool", name: "A 2D floor plan saved as DXF" },
    step: [
      { "@type": "HowToStep", position: 1, name: "Upload the DXF", text: `Upload a 2D DXF floor plan (up to ${MAX_DXF_MB} MB) at ${SITE}/studio. Studio reads the walls, rooms, doors and windows from the drawing. Free.` },
      { "@type": "HowToStep", position: 2, name: "Pick a room", text: "Choose a room and its type (bedroom, kitchen and so on). Use the suggested camera angles or place your own camera. Free." },
      { "@type": "HowToStep", position: 3, name: "Preview", text: `Describe the feel in one sentence and get three camera angles to compare. Free, up to ${FREE_PREVIEWS_PER_DAY} previews a day, then ${inr(p.inr.extraPreview)} (${usd(p.usd.extraPreview)}) each.` },
      { "@type": "HowToStep", position: 4, name: "Download", text: `Download the image you want: 2K ${inr(p.inr.k2)} or 4K ${inr(p.inr.k4)} incl. GST in India; ${usd(p.usd.k2)} or ${usd(p.usd.k4)} for accounts billed in US dollars.` },
    ],
  };
}

/** WebApplication schema with the free preview and the downloads in both currencies. */
function appLd(p: StudioPrices) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${SITE}/floor-plan-to-render#app`,
    name: "Coreframe Studio",
    alternateName: "Coreframe Studio: floor plan to interior render",
    url: `${SITE}/studio`,
    applicationCategory: "DesignApplication",
    operatingSystem: "Any (web browser)",
    browserRequirements: "A current web browser and a Coreframe account",
    description:
      "Turns a 2D DXF floor plan into interior concept renders in the browser. Walls, doors and windows are read from the drawing; the furniture is generated. Concept visuals, not construction drawings or a 3D model.",
    isAccessibleForFree: false,
    provider: { "@id": `${SITE}/#organization` },
    publisher: { "@id": `${SITE}/#organization` },
    isRelatedTo: { "@id": `${SITE}/#studio-service` },
    dateModified: LAST_UPDATED.iso,
    offers: studioOffers(p, `${SITE}/floor-plan-to-render`),
  };
}

/** How to get a clean DXF out of each tool, from the Studio guide (/studio/learn). */
const EXPORTS: [string, string][] = [
  ["AutoCAD and AutoCAD LT", "In Model space, File › Save As, and pick AutoCAD 2018 DXF (or the newest DXF offered). DXFOUT does the same."],
  ["Revit", "Open the floor plan view (not a 3D view or a sheet), then File › Export › CAD Formats › DXF, current view only. Turn off a crop region that cuts rooms."],
  ["Archicad", "On the Floor Plan window for the storey you want, File › Save as… and choose DXF with the default translator."],
  ["SketchUp Pro", "Top camera, Parallel Projection, then File › Export › 2D Graphic as DXF at 1:1. SketchUp Free and Web cannot export DXF."],
  ["BricsCAD, ZWCAD, DraftSight and similar", "Model space, Save As, the newest DXF in the list."],
];

function faqs(p: StudioPrices) {
  return [
  {
    q: "What file does Coreframe Studio need?",
    a: `A DXF floor plan (up to ${MAX_DXF_MB} MB). Studio reads the walls, doors and windows from the drawing's lines, so a PDF, JPG or PNG of a plan can't be read yet, and neither can a DWG. If you work in AutoCAD, Revit or ArchiCAD, exporting a DXF is a Save As; the three-click guide is at coreframecloud.com/studio/learn.`,
  },
  {
    q: "Does it invent rooms or windows that are not on my plan?",
    a: "No. Walls, corners, doors and windows are read from the DXF. If a room has no window marked, we don't add one. It may be windowless on purpose, and that's your call. We do place the furniture and the camera, based on the room's shape and the room type you picked, and Studio tells you so on screen every time.",
  },
  {
    q: "What does it cost?",
    a: `Reading the drawing, browsing the rooms and previewing the three camera angles are free, up to ${FREE_PREVIEWS_PER_DAY} previews a day; after that, extra previews are ${inr(p.inr.extraPreview)} each. You pay only for those and for what you keep: an edit of a preview is ${inr(p.inr.edit)}, a 2K download ${inr(p.inr.k2)} and a 4K download ${inr(p.inr.k4)}, GST included (US${usd(p.usd.extraPreview)}, ${usd(p.usd.edit)}, ${usd(p.usd.k2)} and ${usd(p.usd.k4)} for accounts billed in dollars, no GST). It comes out of the same Coreframe wallet as GPU workstation hours and CFD, and Studio shows the price before you confirm.`,
  },
  {
    q: "Is it a 3D model or a construction drawing?",
    a: "No. Studio makes concept images for pitching a design: the walls, doors and windows come from your drawing and the furniture, materials and light are generated. It does not produce a 3D model file, a floor plan, or drawings you could build from.",
  },
  {
    q: "Do I have to install anything?",
    a: "No. Studio runs in the browser with your Coreframe account: the same sign-in, wallet and My activity page as GPU workstations and CFD. New here? Sign up with your email and a WhatsApp code and you land in Studio. GPU workstations additionally need a small client app.",
  },
  {
    q: "What happens to my client's drawing?",
    a: "It stays in your account until you delete it (there's a delete button). We don't purge on a schedule, and we don't train on your drawings unless you choose to let us (an optional tick box that earns wallet credit). Studio runs on our own machines in Bengaluru; the one exception is Plus and Pro ray-traced renders, which are processed by an outside AI service, only to make your image.",
  },
  ];
}

export default async function Page() {
  const prices = studioPrices(await getRateCard());
  const faq = faqs(prices);
  const stepList = steps(prices);
  return (
    <div className="cf-warm-page min-h-screen text-ink">
      <JsonLd data={breadcrumbList([{ name: "Floor plan to render", path: "/floor-plan-to-render" }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <JsonLd data={appLd(prices)} />
      <JsonLd data={howToLd(prices)} />

      <main className="relative">
        <section className="cf-section px-5 cf-pagehero">
          <PageHeroBg image={HERO} />
          <div className="cf-wide">
            <div className="min-w-0 max-w-[620px]">
              <p className="cf-eyebrow mb-5">Studio · Pre-sale renders</p>
              <h1 className="cf-display">Floor plan to interior render, straight from your DXF.</h1>
              <p className="mt-4 font-heading text-[clamp(19px,2.3vw,24px)] leading-[1.3] font-medium">
                Win the client before the project is signed.
              </p>
              {/* Answer-first (SEO/AEO review 18 Oct 2026): both currencies in
                  the static HTML, whatever country the reader is in. */}
              <p className="cf-lead mt-5">
                Coreframe Studio turns a 2D DXF floor plan into interior concept renders in the browser. It reads the walls,
                doors and windows from your drawing; you pick a room and a camera, and it furnishes the room. Previews are
                free ({FREE_PREVIEWS_PER_DAY} a day, then {inr(prices.inr.extraPreview)} each); a 2K download is{" "}
                {inr(prices.inr.k2)} and 4K {inr(prices.inr.k4)}, GST included ({usd(prices.usd.k2)} and{" "}
                {usd(prices.usd.k4)} outside India).
              </p>
              <p className="mt-3 text-[14.5px] leading-6">Concept visuals for pitching, not construction drawings or a 3D model.</p>
              <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <a href="/studio" className="cf-btn-primary w-full sm:w-auto">
                  Try it with your plan
                </a>
              </div>
              <p className="mt-4 text-[13.5px] text-ink-3">
                DXF floor plans only, up to {MAX_DXF_MB} MB. Working in DWG or Revit?{" "}
                <a href="#export-dxf" className="underline underline-offset-4">Export a clean DXF</a>.
              </p>
              <PageByline path="/floor-plan-to-render" updated={LAST_UPDATED.iso} className="mt-2 text-ink-3" />
            </div>
          </div>
        </section>

        {/* Real Studio exports (16 Oct 2026): rooms of our sample plan through the
            live Studio code path (plan preset, 4K) on our node; prompts and seeds
            in marketing-20261016-site-explainer/gen/runs.jsonl. Labelled
            "Generated image", as Studio labels it. Shown smaller than the
            3840 x 2880 files. */}
        <section className="cf-section px-5">
          <div className="cf-wide">
            <h2 className="cf-section-title">One plan, every room.</h2>
            <p className="cf-section-copy mt-3">
              Our sample 3BHK plan and its rooms, each exported at 4K from Studio.{" "}
              <Link href="/floor-plan-to-render/3bhk-example" className="text-ink underline underline-offset-4">
                Follow the whole 3BHK example, step by step
              </Link>
              .
            </p>
            <div className="mt-8 grid items-start gap-6 lg:grid-cols-[0.75fr_1.25fr]">
              <PlanImage caption="Our sample 3BHK plan (a real drawing)" />
              <figure className="min-w-0">
                <div className="relative overflow-hidden rounded-[20px] bg-paper-2">
                  <Image
                    src="/studio-renders/studio-living2-2048.webp"
                    alt="The living room from our sample plan, furnished: a sofa with cushions, a carved wooden cabinet, a floor lamp, plants and a rug on a stone floor, with the doors and window as drawn"
                    width={2048}
                    height={1536}
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="h-auto w-full"
                  />
                  <span className="absolute right-3 bottom-3 rounded-md bg-black/60 px-2 py-1 text-[11px] font-semibold text-white">Generated image</span>
                </div>
                <figcaption className="mt-2 text-[12.5px] text-ink-3">
                  A 4K export (3840 × 2880) from Studio, shown smaller. Walls, doors and windows from the drawing; the furniture is generated.
                </figcaption>
              </figure>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {STUDIO_ROOMS.map((r) => (
                <figure key={r.src} className="min-w-0">
                  <div className="relative overflow-hidden rounded-[20px] bg-paper-2 shadow-[0_18px_40px_-26px_rgb(90_60_30/0.45)]">
                    <Image src={r.src} alt={r.alt} width={2048} height={1536} sizes="(max-width: 640px) 100vw, 310px" className="h-auto w-full" />
                    <span className="absolute right-2.5 bottom-2.5 rounded-md bg-black/60 px-2 py-1 text-[11px] font-semibold text-white">Generated image</span>
                  </div>
                  <figcaption className="mt-2 text-[12.5px] text-ink-3">{r.cap}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="cf-section-title">From your drawing to the room.</h2>
              <p className="cf-section-copy mt-3">Your walls and windows, exactly as drawn. Then we furnish it.</p>
              <p className="mt-2 text-[14px] text-ink-3">Drag the line to compare.</p>
            </div>
            <ShellFurnished caption="Shell: your walls and openings, rendered from the drawing. Furnished: a generated image." />
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <h2 className="cf-section-title">Four steps. You only pay on the last.</h2>
            <ol data-cf-steps="" className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stepList.map((st) => (
                <li key={st.n} className="cf-card cfh-lift">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-ink font-heading text-[15px] text-white">{st.n}</span>
                  <h3 className="mt-4 font-heading text-[18px] font-medium text-ink">{st.title}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-6 text-ink-2">{st.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-col">
            <h2 className="cf-section-title">We never invent your building.</h2>
            <p className="cf-section-copy mt-3">Walls, doors and windows come from your drawing. The furniture is ours, and Studio tells you so.</p>
            <Fold title="Where exactly we draw the line">
              <p className="cf-section-copy mt-3">
                If a room has no window in the drawing, Studio doesn&rsquo;t add one. It may be windowless on
                purpose, and that&rsquo;s the architect&rsquo;s call.
              </p>
              <p className="cf-section-copy mt-3">
                We suggest furniture and the camera from the room&rsquo;s shape and the type you pick, and Studio
                says so every time:{" "}
                <em className="text-ink">&ldquo;We placed a bed, 2 nightstands, a wardrobe. None of it is in your drawing.&rdquo;</em>
              </p>
            </Fold>
          </div>
        </section>

        {/* Export a clean DXF: from the Studio guide (apps/tools/web/learn.html). */}
        <section id="export-dxf" className="cf-section scroll-mt-24 px-5 pt-0">
          <div className="cf-col">
            <h2 className="cf-section-title">Working in DWG or Revit? Export a clean DXF.</h2>
            <p className="cf-section-copy mt-3">
              Studio reads DXF only: a PDF or scan of a plan has no walls in it to measure, and DWG is not read yet. The
              export takes a few clicks in most tools. <Hl>Every read of a drawing is free</Hl>, so you can check what Studio
              measured before you spend anything.
            </p>
            <dl className="mt-6 divide-y divide-rule rounded-[20px] border border-rule">
              {EXPORTS.map(([tool, how]) => (
                <div key={tool} className="px-5 py-4">
                  <dt className="font-semibold text-ink">{tool}</dt>
                  <dd className="mt-1 text-[15px] leading-6 text-ink-2">{how}</dd>
                </div>
              ))}
            </dl>
            <ul className="mt-6 space-y-2 text-[15px] leading-6 text-ink-2">
              <li>Export at 1:1 from model space, one storey per file.</li>
              <li>Keep at least one dimension or a room label with real numbers: it tells Studio the units.</li>
              <li>Leave your layer names alone and don&rsquo;t explode everything first; leave out raster underlays, details and schedules.</li>
            </ul>
            <p className="mt-5 text-[14px] text-ink-3">
              The full guide, with Chief Architect and what Studio takes from the drawing:{" "}
              <a href="/studio/learn" className="underline underline-offset-4">Getting a DXF out of your CAD</a>.
            </p>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-col">
            <h2 className="cf-section-title">What architects ask first.</h2>
            <div className="mt-6 divide-y divide-rule rounded-[24px] border border-rule">
              {faq.map((f) => (
                <details key={f.q} className="group px-6 py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                    {f.q}
                    <span aria-hidden className="text-ink-3 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-[15px] leading-6 break-words text-ink-2">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <div id="start" className="scroll-mt-24 rounded-[32px] bg-[#2a1f17] px-7 py-12 text-white sm:px-14">
              <p className="text-[11.5px] font-semibold tracking-[0.12em] text-white/75 uppercase">Studio is live</p>
              <h2 className="mt-3 font-heading text-[28px] font-medium sm:text-[36px]">Try it with your own plan.</h2>
              <p className="mt-3 text-white/80">
                Previews are free, up to {FREE_PREVIEWS_PER_DAY} a day, then {inr(prices.inr.extraPreview)} each. Edits {inr(prices.inr.edit)}, 2K download{" "}
                {inr(prices.inr.k2)}, 4K {inr(prices.inr.k4)}, from your Coreframe wallet ({usd(prices.usd.edit)}, {usd(prices.usd.k2)} and{" "}
                {usd(prices.usd.k4)} for accounts billed in dollars).
              </p>
              <p className="mt-3 text-white/70">
                Need a whole machine for your own software instead?{" "}
                <Link href="/" className="text-[#a9c4ff] underline underline-offset-4">
                  Rent an {NODE.gpu} by the minute
                </Link>
                .
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="/studio" className="cfh-pill-light">
                  Open Studio
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
