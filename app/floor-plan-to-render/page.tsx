import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BackgroundGlow } from "@/components/home/background-glow";

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
 */

export const metadata: Metadata = {
  title: "Floor Plan to Interior Render — Upload a DXF, Coreframe Studio",
  description:
    "Turn a 2D DXF floor plan into an interior render in the browser. Coreframe Studio reads your walls, doors and windows, lets you pick a room and a camera angle, and exports at 2K or 4K. Credits from ₹99. No installer, no ID check. Hosted in Bengaluru.",
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
    title: "Upload the DXF",
    body: "We read the walls off the layer your drawing uses, close the rooms and report the real areas. You see which layer we picked and can correct it before anything else happens. Free.",
  },
  {
    n: "02",
    title: "Pick a room and say what it is",
    body: "Every room in the plan, listed separately. Tell us it is a bedroom or a kitchen — one click — and the furniture and the camera position change to match. Free.",
  },
  {
    n: "03",
    title: "Say how it should feel",
    body: "One sentence is enough: “matte handle-less cabinets in muted olive”. You get three camera angles back and compare them side by side. Still free.",
  },
  {
    n: "04",
    title: "Export the one you want",
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
    a: "Credits start at ₹99. Reading the drawing, browsing the rooms and comparing the three camera angles cost nothing — you pay when you ask for an image. A 2K export is 30 credits and a 4K export is 42.",
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
    <div className="min-h-screen text-white">
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

      <main className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
          Coreframe Studio
        </p>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.06] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
          Turn a floor plan into the room.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
          Upload a DXF. Coreframe Studio reads the walls, doors and windows out
          of the drawing, works out where a photographer would stand, and gives
          you an interior image you can export at 2K or 4K. It runs in the
          browser — nothing to install, and no ID check to get started.
        </p>

        <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <a href={STUDIO} className="cf-btn-primary w-full sm:w-auto">
            Open Studio
          </a>
          <a
            href="https://studio.coreframecloud.com/studio/demo.dxf"
            className="cf-btn-secondary w-full sm:w-auto"
          >
            Download a demo plan
          </a>
        </div>
        <p className="mt-4 text-sm text-white/55">
          Credits from ₹99. Reading your drawing is free.
        </p>

        {/* A REAL PLAN, not a picture of one. Built by
            apps/tools/scripts/make_3bhk.py in the control-plane repo: ten
            rooms, 1,147 sq ft, and it opens in CAD. An AI-generated floor plan
            would be spotted by this audience in seconds, on the one page that
            promises we do not invent geometry. */}
        <figure className="mt-14 rounded-xl border border-white/12 bg-white/[0.03] p-4 sm:p-8">
          <Image
            src="/brand/plan-3bhk.svg"
            alt="Ground floor plan of a three-bedroom flat: living and dining, kitchen, utility, three bedrooms, two bathrooms, corridor and balcony, with door and window openings marked."
            width={1320}
            height={1100}
            className="h-auto w-full max-w-full text-white/80"
            priority
          />
          <figcaption className="mt-4 text-sm text-white/50">
            The demo plan, drawn to scale — 10 rooms, 1,147 sq ft. Download it
            above and run it through Studio yourself.
          </figcaption>
        </figure>

        <section className="mt-20">
          <h2 className="cf-section-title">Four steps, and you only pay on the last one</h2>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-xl border border-white/12 bg-white/10 sm:grid-cols-2">
            {steps.map((s) => (
              <li key={s.n} className="bg-[#04101d] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  {s.n}
                </p>
                <h3 className="mt-3 text-lg font-semibold tracking-[-0.02em]">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-20 max-w-3xl">
          <h2 className="cf-section-title">We never invent your building</h2>
          <p className="mt-6 cf-section-copy">
            The walls, corners, doors and windows come from your DXF. If a room
            has no window marked in the drawing, Studio does not add one — it
            may be windowless on purpose, and that is the architect&rsquo;s
            decision, not ours.
          </p>
          <p className="mt-4 cf-section-copy">
            The furniture and the camera position are ours. They are suggested
            from the room&rsquo;s shape and from the room type you pick, and
            Studio says so on screen every time it places anything:{" "}
            <em className="text-white/85">
              &ldquo;We placed a bed, 2 nightstands, a wardrobe. None of it is in
              your drawing.&rdquo;
            </em>
          </p>
          <p className="mt-4 cf-section-copy">
            Adding a window that is not on the plan changes what the building is.
            Suggesting a bed in a room you called a bedroom does not. We keep
            that line, and we label which side of it every part of the image came
            from.
          </p>
        </section>

        <section className="mt-20">
          <h2 className="cf-section-title">Questions</h2>
          <dl className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {faqs.map((f) => (
              <div key={f.q} className="py-6">
                <dt className="text-lg font-semibold tracking-[-0.02em]">{f.q}</dt>
                <dd className="mt-2 max-w-3xl text-base leading-7 text-white/65">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-20 flex flex-wrap items-center justify-between gap-6 rounded-xl border border-white/12 bg-white/[0.03] p-8">
          <div className="max-w-md">
            <h2 className="text-2xl font-semibold tracking-[-0.025em]">Start with one room.</h2>
            <p className="mt-3 text-sm leading-6 text-white/65">
              ₹99, one drawing, one image. Need a machine to drive your own
              software instead?{" "}
              <Link href="/" className="underline decoration-white/30 underline-offset-4">
                Coreframe also rents RTX 5080 workstations by the hour
              </Link>
              .
            </p>
          </div>
          <a href={STUDIO} className="cf-btn-primary">
            Open Studio
          </a>
        </section>
      </main>
    </div>
  );
}
