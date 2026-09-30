import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";
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
 *      The same file already carries a note about /tools and /cfd-intake being
 *      added because "/ansys-cfd-gpu sat at priority 0.9 pointing into nothing
 *      indexed". Same fault, newer product.
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
 * NO RUPEE FIGURE ON THIS PAGE. It carried "Credits from Rs 99" in the meta
 * description, the hero, the FAQ and the closing CTA, for a product that is
 * still in private testing -- four hand-typed copies of a price with no
 * source, which is how the workstation rate ended up in fourteen files. Credit
 * COSTS (30 for a 2K export, 42 for 4K) are product facts and stay; what a
 * credit is worth in rupees is shown in Studio, and goes here only once there
 * is a helper to read it from.
 */

export const metadata: Metadata = {
  title: "Floor Plan to Interior Render — Upload a DXF, Coreframe Studio",
  description:
    "Turn a 2D DXF floor plan into an interior render in the browser. Coreframe Studio reads your walls, doors and windows, lets you pick a room and a camera angle, and exports at 2K or 4K. No installer, no ID check. Hosted in Bengaluru.",
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

const STUDIO = "https://studio.coreframecloud.com/studio";

const steps = [
  {
    n: "01",
    title: "Upload the DXF.",
    body: "We read the walls off the layer your drawing uses, close the rooms and report the real areas. You see which layer we picked and can correct it before anything else happens. Free.",
  },
  {
    n: "02",
    title: "Pick a room and say what it is.",
    body: "Every room in the plan, listed separately. Tell us it is a bedroom or a kitchen — one click — and the furniture and the camera position change to match. Free.",
  },
  {
    n: "03",
    title: "Say how it should feel.",
    body: "One sentence is enough: “matte handle-less cabinets in muted olive”. You get three camera angles back and compare them side by side. Still free.",
  },
  {
    n: "04",
    title: "Export the one you want.",
    body: "2K for a client email, 4K for print. This is the only step that spends credits, and the cost is shown before you press it.",
  },
];

const faqs = [
  {
    q: "What file does Coreframe Studio need?",
    a: "A DXF. If you work in DWG, Revit or ArchiCAD, exporting a DXF is a Save As. There is a three-click guide inside Studio, and a demo 3BHK plan you can download and try it on if you do not have a drawing to hand.",
  },
  {
    q: "Does it invent rooms or windows that are not on my plan?",
    a: "No. Walls, corners, doors and windows are read from the DXF. If a room has no window marked, we do not add one — it may be windowless on purpose, and that is your decision. Furniture and the camera position ARE placed by us, suggested from the room's shape and the room type you picked, and Studio says so on screen every time.",
  },
  {
    q: "What does it cost?",
    a: "Reading the drawing, browsing the rooms and comparing the three camera angles cost nothing. You pay only when you ask for an image: a 2K export is 30 credits and a 4K export is 42. What a credit costs is shown in Studio before you spend one.",
  },
  {
    q: "Do I have to install anything, or verify my identity?",
    a: "Neither. Studio runs in the browser and starts with an email and a code. That is different from Coreframe's GPU workstation product, which does need a client app and identity verification, because that hands you a real machine.",
  },
  {
    q: "What happens to my client's drawing?",
    a: "It stays in your account until you delete it, and there is a delete button. We do not purge on a schedule and we do not train anything on your drawings. Everything is hosted in Bengaluru.",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen text-ink">
      <BackgroundGlow />

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
        <section className="cf-section px-5">
          <div className="cf-col">
            <p className="cf-eyebrow mb-5">Coreframe Studio</p>
            <h1 className="cf-display">Turn a floor plan into the room.</h1>
            <p className="cf-lead mt-6">
              Upload a DXF. Coreframe Studio reads the walls, doors and windows
              out of the drawing, works out where a photographer would stand,
              and gives you an interior image you can export at 2K or 4K. It
              runs in the browser — nothing to install, and no ID check to get
              started.
            </p>

            {/* Studio is not open to the public yet. Saying so here, plainly, is
                cheaper than letting someone click "Open Studio" and meet a sign-in
                they cannot complete — the second costs trust, the first costs
                nothing. The guide becomes the real action in the meantime, which is
                why it is the primary button rather than a footnote. */}
            <div className="cf-note mt-9">
              <p className="cf-eyebrow mb-3 text-blue">Releasing soon</p>
              <p className="text-base leading-[1.62] text-ink">
                Coreframe Studio is in private testing. It is not open for
                sign-ups yet — the five-page guide below is the clearest look at
                how it reads a drawing and what it gives you back.
              </p>
            </div>

            <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
              <a
                href="/studio/guide.pdf"
                target="_blank"
                rel="noopener"
                className="cf-btn-primary w-full sm:w-auto min-h-[44px]"
              >
                Read the five-page guide
              </a>
              <a
                href="https://studio.coreframecloud.com/studio/demo.dxf"
                className="cf-btn-secondary w-full sm:w-auto min-h-[44px]"
              >
                Download a demo plan
              </a>
            </div>
            <p className="mt-4 text-sm leading-[1.62] text-ink-2">
              Reading your drawing is free. You spend credits only on an export.{" "}
              {/* MOVED HERE FROM THE HOMEPAGE HERO, 28 Sep 2026. It was the only
                  link to the guide anywhere on the site, sitting as a third-level
                  line in a hero that is selling the workstation, not Studio. This
                  is the page where someone is deciding about Studio. */}
              Credits apply once Studio opens.
            </p>
          </div>
        </section>

        {/* A REAL PLAN, not a picture of one. Built by
            apps/tools/scripts/make_3bhk.py in the control-plane repo: ten
            rooms, 1,147 sq ft, and it opens in CAD. An AI-generated floor plan
            would be spotted by this audience in seconds, on the one page that
            promises we do not invent geometry. */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <figure className="rounded-cf border border-rule bg-paper-2 p-4 sm:p-8">
              {/* THE PLAN WAS INVISIBLE FOR WEEKS AND THE CAUSE WAS ONE CHARACTER.
                  public/brand/plan-3bhk.svg contained a room labelled
                  `LIVING & DINING` — a bare ampersand, which is not valid XML. An
                  SVG loaded as an image is parsed strictly, so the whole document
                  failed and the browser drew nothing and showed the alt text.
                  Nothing 404'd, nothing errored, and the file looked fine in an
                  editor. It is now `&amp;`.

                  apps/tools/scripts/make_3bhk.py in the control-plane repo
                  generates this file and does not escape room names, so it will
                  reintroduce the bug the next time a plan is regenerated. Escape
                  there too.

                  A plain <img> rather than next/image, separately: the optimizer
                  refuses SVG unless `dangerouslyAllowSVG` is set, and setting it
                  would push EVERY svg through the optimizer including any a user
                  could later supply. An SVG gains nothing from it anyway — there is
                  no format to negotiate and no raster to resize. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/plan-3bhk.svg"
                alt="Ground floor plan of a three-bedroom flat: living and dining, kitchen, utility, three bedrooms, two bathrooms, corridor and balcony, with door and window openings marked."
                width={1320}
                height={1100}
                className="h-auto w-full max-w-full"
              />
              <figcaption className="mt-4 text-sm leading-[1.62] text-ink-2">
                The demo plan, drawn to scale — 10 rooms, 1,147 sq ft. Download
                it above and run it through Studio yourself.
              </figcaption>
            </figure>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-wide">
            <p className="cf-eyebrow mb-5">How it goes</p>
            <h2 className="cf-section-title">Four steps, and you only pay on the last one.</h2>
            <ol className="mt-10 grid grid-cols-1 gap-9 sm:grid-cols-2">
              {steps.map((s) => (
                <li key={s.n} className="cf-card">
                  <p className="cf-card-label">{s.n}</p>
                  <h3 className="text-base font-semibold tracking-[-0.01em] text-ink">{s.title}</h3>
                  <p className="mt-2.5 text-sm leading-[1.62] break-words text-ink-2">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <p className="cf-eyebrow mb-5">Where the line is</p>
            <h2 className="cf-section-title">We never invent your building.</h2>
            <p className="cf-section-copy mt-6">
              The walls, corners, doors and windows come from your DXF. If a room
              has no window marked in the drawing, Studio does not add one — it
              may be windowless on purpose, and that is the architect&rsquo;s
              decision, not ours.
            </p>
            <p className="cf-section-copy mt-4">
              The furniture and the camera position are ours. They are suggested
              from the room&rsquo;s shape and from the room type you pick, and
              Studio says so on screen every time it places anything:{" "}
              <em className="text-ink">
                &ldquo;We placed a bed, 2 nightstands, a wardrobe. None of it is in
                your drawing.&rdquo;
              </em>
            </p>
            <p className="cf-section-copy mt-4">
              Adding a window that is not on the plan changes what the building is.
              Suggesting a bed in a room you called a bedroom does not. We keep
              that line, and we label which side of it every part of the image came
              from.
            </p>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-col">
            <p className="cf-eyebrow mb-5">Questions</p>
            <h2 className="cf-section-title">What architects ask first.</h2>
            <dl className="mt-10 divide-y divide-rule border-y border-rule">
              {faqs.map((f) => (
                <div key={f.q} className="py-6">
                  <dt className="text-lg font-semibold tracking-[-0.02em] break-words text-ink">{f.q}</dt>
                  <dd className="mt-2.5 text-base leading-[1.62] break-words text-ink-2">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-col">
            <div className="cf-note">
              <p className="cf-eyebrow mb-4 text-blue">Next step</p>
              <h2 className="cf-section-title">Start with one room.</h2>
              <p className="cf-section-copy mt-4">
                One drawing, one image. Need a machine to drive your own software
                instead?{" "}
                <Link href="/" className="text-blue underline underline-offset-4">
                  Coreframe also rents {NODE.gpu} workstations by the minute
                </Link>
                .
              </p>
              <a href={STUDIO} className="cf-btn-primary mt-6 w-full sm:w-auto min-h-[44px]">
                Open Studio
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
