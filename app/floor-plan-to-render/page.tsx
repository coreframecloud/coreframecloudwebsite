import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbList } from "@/lib/seo";
import Link from "next/link";
import { Fold } from "@/components/visuals/fold";
import Image from "next/image";
import { PlanImage, ShellFurnished } from "@/components/visuals/studio-compare";
import { PageHeroBg, type HeroImage } from "@/components/page-hero-bg";
import { NODE } from "@/lib/node-spec";

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
 * defaults in apps/tools (CF_STUDIO_PRICE_*_INR: edit 20, 2K 30, 4K 50). If
 * they change there, change them here and in components/home/redesign/
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

export const metadata: Metadata = {
  title: "Floor Plan to Interior Render from a DXF",
  description:
    "Coreframe Studio: upload a 2D DXF floor plan, pick a room and get pre-sale concept images. Free previews; 2K download ₹30. Walls, doors and windows come from your drawing.",
  keywords: [
    "floor plan to 3d render",
    "DXF to interior render",
    "AI interior rendering from floor plan",
    "convert floor plan to render India",
    "2d plan to 3d visualisation online",
    "AI render for architects India",
  ],
  alternates: { canonical: "/floor-plan-to-render" },
};

/**
 * Hero picture (owner, 16 Oct 2026: "the subtle interior"). It is the warm
 * living room from a RenderGrid test render on our RTX 5080 -- NOT a Studio
 * output -- so it carries "Rendered on Coreframe" and no "Generated image"
 * label, and the plan card moved out of the hero to sit next to a real
 * Studio export further down.
 */
const HERO: HeroImage = {
  src: "/heroes/interior-rendergrid-2560.webp",
  w: 2560,
  h: 1440,
  mobile: { src: "/heroes/interior-rendergrid-m780.webp", w: 780, h: 1040 },
  alt: "A calm living room with a white sofa, a woven leather chair, an olive tree and a garden through the windows",
  pos: "70% 50%",
  posMobile: "50% 50%",
  credit: "Rendered on Coreframe",
};

/** More rooms from the same sample plan, each a Studio 4K export (16 Oct 2026). */
const STUDIO_ROOMS = [
  { src: "/studio-renders/studio-kitchen-2048.webp", cap: "The kitchen.", alt: "The kitchen from our sample plan: sage-green cabinets, a stone-topped island with a fruit bowl, open shelves with copper jars and brass taps" },
  { src: "/studio-renders/studio-masterbed-2048.webp", cap: "The master bedroom.", alt: "The master bedroom from our sample plan: a teak bed with a rust throw, a tall louvred wardrobe, a patterned rug, a palm and sheer curtains" },
  { src: "/studio-renders/studio-balcony-2048.webp", cap: "The balcony, looking back into a bedroom.", alt: "The balcony from our sample plan at dusk: potted plants, a cane chair and a railing over trees, with a lit bedroom through the door" },
];

const steps = [
  { n: "1", title: "Upload your DXF.", body: "We find the walls and rooms. Free." },
  { n: "2", title: "Pick a room.", body: "Tell us it's a bedroom or a kitchen. Free." },
  { n: "3", title: "Say how it should feel.", body: "One sentence. You get three angles to compare. Free, up to 5 previews a day." },
  { n: "4", title: "Download the one you like.", body: "2K for email (₹30), 4K for print (₹50). Only this step is paid." },
];

const faqs = [
  {
    q: "What file does Coreframe Studio need?",
    a: "A DXF floor plan (up to 30 MB). Studio reads the walls, doors and windows from the drawing's lines, so a PDF, JPG or PNG of a plan can't be read yet, and neither can a DWG. If you work in AutoCAD, Revit or ArchiCAD, exporting a DXF is a Save As; the three-click guide is at coreframecloud.com/studio/learn, and there's a demo 3BHK plan to try if you don't have a drawing to hand.",
  },
  {
    q: "Does it invent rooms or windows that are not on my plan?",
    a: "No. Walls, corners, doors and windows are read from the DXF. If a room has no window marked, we don't add one. It may be windowless on purpose, and that's your call. We do place the furniture and the camera, based on the room's shape and the room type you picked, and Studio tells you so on screen every time.",
  },
  {
    q: "What does it cost?",
    a: "Reading the drawing, browsing the rooms and previewing the three camera angles are free, up to 5 previews a day. You pay only for what you keep: an edit of a preview is ₹20, a 2K download ₹30 and a 4K download ₹50, GST included (US$0.49, $0.99 and $1.49 for accounts billed in dollars). It comes out of the same Coreframe wallet as GPU workstation hours and CFD, and Studio shows the price before you confirm.",
  },
  {
    q: "Do I have to install anything?",
    a: "No. Studio runs in the browser with your Coreframe account: the same sign-in, wallet and My activity page as GPU workstations and CFD. New here? Sign up with your email and a WhatsApp code and you land in Studio. GPU workstations additionally need a small client app.",
  },
  {
    q: "What happens to my client's drawing?",
    a: "It stays in your account until you delete it (there's a delete button). We don't purge on a schedule, and we don't train anything on your drawings. Everything is hosted in Bengaluru.",
  },
];

export default function Page() {
  return (
    <div className="cf-warm-page min-h-screen text-ink">
      <JsonLd data={breadcrumbList([{ name: "Floor plan to render", path: "/floor-plan-to-render" }])} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />

      <main className="relative">
        <section className="cf-section px-5 cf-pagehero">
          <PageHeroBg image={HERO} />
          <div className="cf-wide">
            <div className="min-w-0 max-w-[600px]">
              <p className="cf-eyebrow mb-5">Studio · Pre-sale renders</p>
              <h1 className="cf-display">Win the client before the project is signed.</h1>
              <p className="cf-lead mt-6">Upload a 2D DXF floor plan. Get concept images of the room back, generated in the browser, ready to pitch with.</p>
              {/* Studio is open (16 Oct 2026). /studio is the app itself, on
                  this site, signed in with the same Coreframe account. */}
              <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[13px]">
                <span className="h-2 w-2 rounded-full bg-[#15803d]" /> Live. Free previews, 2K download ₹30.
              </p>
              <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <a href="/studio" className="cf-btn-primary w-full sm:w-auto">
                  Try it with your plan
                </a>
              </div>
              <p className="mt-4 text-[13.5px] text-ink-3">
                DXF floor plans only, up to 30 MB. Working in DWG or Revit?{" "}
                <a href="/studio/learn" className="underline underline-offset-4">Export a DXF in three clicks</a>.
              </p>
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
            <p className="cf-section-copy mt-3">The demo 3BHK plan and its rooms, each exported at 4K from Studio.</p>
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
            <ShellFurnished />
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <h2 className="cf-section-title">Four steps. You only pay on the last.</h2>
            <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((st) => (
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

        <section className="cf-section px-5 pt-0">
          <div className="cf-col">
            <h2 className="cf-section-title">What architects ask first.</h2>
            <div className="mt-6 divide-y divide-rule rounded-[24px] border border-rule">
              {faqs.map((f) => (
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
                Previews are free, up to 5 a day. Edits ₹20, 2K download ₹30, 4K ₹50, from your Coreframe wallet.
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
