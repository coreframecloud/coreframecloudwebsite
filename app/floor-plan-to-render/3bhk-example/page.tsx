import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE, breadcrumbList, faqPage } from "@/lib/seo";
import { getRateCard } from "@/lib/rate-card";
import { PlanImage } from "@/components/visuals/studio-compare";
import { Hl } from "@/components/cfd-explainer";
import { FREE_PREVIEWS_PER_DAY, MAX_DXF_MB, inr, studioPrices, usd, type StudioPrices } from "@/lib/studio-prices";

/**
 * /floor-plan-to-render/3bhk-example: one real 3BHK drawing taken through
 * Studio (SEO/AEO review 18 Oct 2026, section 3.4, action 17; the
 * "3bhk house plan 3d" cluster).
 *
 * ONE PAGE ON PURPOSE. It is a worked example on the real sample plan
 * (apps/tools/web/plan-sample.png = public/home/plan-3bhk.webp), not a
 * template. Do not clone it into 1BHK / 2BHK / sq-ft variants: those would be
 * doorway pages.
 *
 * The demo DXF is no longer offered inside Studio (owner, 16 Oct 2026), so
 * the copy calls it "our sample plan" and never says you can open it there.
 *
 * Every image is a genuine Studio 4K export of THIS plan's rooms (16 Oct 2026,
 * the live Studio code path; prompts and seeds in
 * marketing-20261016-site-explainer/gen/runs.jsonl), the same files
 * /floor-plan-to-render shows, labelled "Generated image" as Studio labels it.
 * Facts about reading the drawing come from the Studio guide
 * (apps/tools/web/learn.html): DXF only, defaults 2.8 m / 2.1 m / 0.9-2.1 m,
 * every read free. No timings are claimed. Prices: @/lib/studio-prices.ts.
 */

const PATH = "/floor-plan-to-render/3bhk-example";
const PUBLISHED = { iso: "2026-10-18", label: "18 October 2026" };
const TITLE = "3BHK floor plan to 3D render: a worked example";

export const metadata: Metadata = {
  title: { absolute: "3BHK Floor Plan to 3D Render: a Worked Example | Coreframe" },
  description:
    "One real 3BHK DXF plan through Coreframe Studio: rooms read from the drawing, free previews, and 4K concept renders of the living room, kitchen and bedroom.",
  keywords: ["3bhk house plan 3d", "3bhk floor plan 3d render", "floor plan to 3d render example", "2d floor plan to 3d render", "DXF floor plan render"],
  alternates: { canonical: PATH },
};

const ROOMS = [
  {
    room: "Living room",
    src: "/studio-renders/studio-living2-2048.webp",
    alt: "The living room from the 3BHK plan, furnished: a sofa with cushions, a carved wooden cabinet, a floor lamp, plants and a rug on a stone floor, with the doors and window as drawn (generated image)",
    got: "A wide evening view: sofa, carved cabinet, floor lamp and rug. The doors and the window are where the drawing puts them.",
  },
  {
    room: "Kitchen",
    src: "/studio-renders/studio-kitchen-2048.webp",
    alt: "The kitchen from the 3BHK plan: sage-green cabinets, a stone-topped island with a fruit bowl, open shelves with copper jars and brass taps (generated image)",
    got: "Sage-green cabinets, a stone-topped island and open shelves, inside the kitchen's walls from the plan.",
  },
  {
    room: "Master bedroom",
    src: "/studio-renders/studio-masterbed-2048.webp",
    alt: "The master bedroom from the 3BHK plan: a teak bed with a rust throw, a tall louvred wardrobe, a patterned rug, a palm and sheer curtains (generated image)",
    got: "A teak bed, a louvred wardrobe and sheer curtains. Studio says on screen which furniture it placed, because none of it is in the drawing.",
  },
  {
    room: "Balcony",
    src: "/studio-renders/studio-balcony-2048.webp",
    alt: "The balcony from the 3BHK plan at dusk: potted plants, a cane chair and a railing over trees, with a lit bedroom through the door (generated image)",
    got: "Dusk on the balcony, looking back into a bedroom through the door that the plan draws.",
  },
];

function steps(p: StudioPrices) {
  return [
    {
      title: "Upload the DXF",
      cost: "Free",
      body: `The plan goes in as a 2D DXF (up to ${MAX_DXF_MB} MB). Studio finds the walls, closes the rooms and reads the door and window openings that are drawn. A dimension on the plan tells it the units.`,
    },
    {
      title: "Check the rooms and heights",
      cost: "Free",
      body: "A plan is flat, so the heights are assumptions you can change: 2.8 m floor to ceiling, a 2.1 m door head and windows from 0.9 m to 2.1 m by default. Re-reading with different heights is free.",
    },
    {
      title: "Pick a room, its type and the camera",
      cost: "Free",
      body: "Living room, kitchen, master bedroom, balcony: each is picked on the plan and given its type. Use the suggested camera angles or place your own camera in the room.",
    },
    {
      title: "Describe the feel, compare three angles",
      cost: `Free, up to ${FREE_PREVIEWS_PER_DAY} a day`,
      body: `One sentence about materials and mood. Each preview gives three camera angles to compare. After ${FREE_PREVIEWS_PER_DAY} previews in a day, extra ones are ${inr(p.inr.extraPreview)} (${usd(p.usd.extraPreview)}) each.`,
    },
    {
      title: "Download the ones you keep",
      cost: `4K ${inr(p.inr.k4)} · ${usd(p.usd.k4)}`,
      body: `Each room on this page is a 4K export (3840 × 2880). A 2K download for email is ${inr(p.inr.k2)} (${usd(p.usd.k2)}). Rupee prices include GST; dollar prices are for accounts billed outside India.`,
    },
  ];
}

function faqs(p: StudioPrices) {
  const four = 4;
  return [
    {
      q: "Can Studio turn a 3BHK floor plan into a 3D model?",
      a: "No. Studio makes concept images of the rooms for pitching a design. The walls, doors and windows come from your drawing; the furniture, materials and light are generated. It does not export a 3D model file, and it does not draw or change the plan.",
    },
    {
      q: "What did this 3BHK example cost?",
      a: `Reading the plan and the previews were free. Done on your own account, the four 4K downloads shown here would cost ${four} × ${inr(p.inr.k4)} = ${inr(four * p.inr.k4)} including GST in India, or ${four} × ${usd(p.usd.k4)} = ${usd(four * p.usd.k4)} for an account billed in US dollars. Previews beyond ${FREE_PREVIEWS_PER_DAY} in a day are ${inr(p.inr.extraPreview)} each.`,
    },
    {
      q: "Do I need a DXF, or can I upload a PDF or image of the plan?",
      a: "A DXF. A PDF, JPG or scan of a plan has no walls in it to measure, and DWG is not read yet. AutoCAD, Revit, Archicad, SketchUp Pro and most CAD tools export DXF in a few clicks; the guide is at coreframecloud.com/studio/learn.",
    },
    {
      q: "Will Studio add windows or rooms that are not on my plan?",
      a: "No. If a room has no window drawn, Studio does not add one. It places furniture and suggests the camera from the room's shape and the type you picked, and tells you so on screen.",
    },
  ];
}

export default async function Page() {
  const prices = studioPrices(await getRateCard());
  const stepList = steps(prices);
  const faq = faqs(prices);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${SITE}${PATH}#article`,
    headline: TITLE,
    description:
      "A worked example: one real 3BHK DXF floor plan taken through Coreframe Studio, from upload to 4K concept renders of four rooms, with what each step cost.",
    url: `${SITE}${PATH}`,
    mainEntityOfPage: `${SITE}${PATH}`,
    datePublished: PUBLISHED.iso,
    dateModified: PUBLISHED.iso,
    inLanguage: "en-IN",
    author: { "@id": `${SITE}/#organization` },
    publisher: { "@id": `${SITE}/#organization` },
    about: [
      { "@type": "Thing", name: "3BHK floor plan" },
      { "@type": "Thing", name: "Interior concept rendering from a DXF floor plan" },
    ],
    mentions: { "@id": `${SITE}/floor-plan-to-render#app` },
    image: ROOMS.map((r) => `${SITE}${r.src}`),
  };

  return (
    <div className="cf-warm-page min-h-screen text-ink">
      <JsonLd
        data={breadcrumbList([
          { name: "Floor plan to render", path: "/floor-plan-to-render" },
          { name: "3BHK example", path: PATH },
        ])}
      />
      <JsonLd data={articleLd} />
      <JsonLd data={faqPage(faq)} />

      <main className="relative">
        <section className="cf-section px-5">
          <div className="cf-col">
            <nav aria-label="Breadcrumb" className="text-[13px] text-ink-3">
              <Link href="/" className="underline-offset-4 hover:underline">Home</Link>
              <span aria-hidden> › </span>
              <Link href="/floor-plan-to-render" className="underline-offset-4 hover:underline">Studio</Link>
              <span aria-hidden> › </span>
              <span>3BHK example</span>
            </nav>
            <p className="cf-eyebrow mt-6">Studio · Worked example</p>
            <h1 className="cf-display mt-5">3BHK floor plan to 3D render: a worked example.</h1>
            <p className="cf-lead mt-5">
              One real 3BHK drawing taken through Coreframe Studio: the DXF in, the rooms read from it, and a 4K concept
              render out for the living room, kitchen, master bedroom and balcony. Reading the plan and the previews were
              free; each 4K download is {inr(prices.inr.k4)} incl. GST ({usd(prices.usd.k4)} outside India). The output is
              concept images, not a 3D model.
            </p>
            <p className="mt-4 text-[12.5px] text-ink-3">
              Published <time dateTime={PUBLISHED.iso}>{PUBLISHED.label}</time> · Coreframe team
            </p>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <PlanImage caption="Our sample 3BHK plan, a real drawing (the sheet the Studio guide opens with)." />
            <div className="min-w-0">
              <h2 className="cf-section-title">The plan.</h2>
              <p className="cf-section-copy mt-3">
                Three bedrooms, three bathrooms, a kitchen, a dining area for six, a living area and a planted balcony, with
                door swings and window openings drawn. It is our own sample drawing; with your plan, every step below works
                the same way.
              </p>
              <p className="cf-section-copy mt-3">
                <Hl>Walls, doors and windows come from the drawing</Hl>. The furniture, materials and light are generated,
                and Studio says so on screen every time.
              </p>
            </div>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-col">
            <h2 className="cf-section-title">Five steps, and what each one cost.</h2>
            <ol data-cf-steps="" className="mt-6 space-y-5">
              {stepList.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink font-heading text-[15px] text-white">{i + 1}</span>
                  <div className="min-w-0">
                    <h3 className="text-[16px] leading-6 font-semibold text-ink">
                      {s.title} <span className="font-normal text-ink-3">· {s.cost}</span>
                    </h3>
                    <p className="mt-1 text-[15px] leading-6 text-ink-2">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <h2 className="cf-section-title">What each room got.</h2>
            <p className="cf-section-copy mt-3">Four 4K exports (3840 × 2880) from Studio, shown smaller.</p>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {ROOMS.map((r) => (
                <figure key={r.src} className="min-w-0">
                  <div className="relative overflow-hidden rounded-[20px] bg-paper-2 shadow-[0_18px_40px_-26px_rgb(90_60_30/0.45)]">
                    <Image src={r.src} alt={r.alt} width={2048} height={1536} sizes="(max-width: 640px) 100vw, 470px" className="h-auto w-full" />
                    <span className="absolute right-2.5 bottom-2.5 rounded-md bg-black/60 px-2 py-1 text-[11px] font-semibold text-white">Generated image</span>
                  </div>
                  <figcaption className="mt-2.5">
                    <span className="font-semibold text-ink">{r.room}.</span>{" "}
                    <span className="text-[14.5px] leading-6 text-ink-2">{r.got}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-col">
            <h2 className="cf-section-title">What it is, and what it isn&rsquo;t.</h2>
            <ul className="mt-5 space-y-2.5 text-[15.5px] leading-6 text-ink-2">
              <li><span className="font-semibold text-ink">It is</span> a set of concept images for a client pitch, made from the plan you already drew.</li>
              <li><span className="font-semibold text-ink">It isn&rsquo;t</span> a 3D model file, a plan generator or a construction drawing. Nothing here changes your plan.</li>
              <li><span className="font-semibold text-ink">It won&rsquo;t</span> add a window or a room the drawing doesn&rsquo;t have.</li>
            </ul>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-col">
            <h2 className="cf-section-title">Questions.</h2>
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
          <div className="cf-col">
            <p className="text-[15px] leading-6 text-ink-2">
              Try the same steps on your own plan. Reading it and the first previews cost nothing.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href="/studio" className="cf-btn-secondary">Open Studio</a>
              <Link href="/floor-plan-to-render" className="cf-btn-secondary">How Studio works</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
