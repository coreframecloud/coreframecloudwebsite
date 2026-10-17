import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SITE, breadcrumbList } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

/**
 * /cfd/projects/clinic-floor-hvac — case study (owner request, 13 Oct 2026).
 *
 * Our automated HVAC airflow run on a real building: the second floor of the
 * buildingSMART "Medical-Dental Clinic" sample (CC BY 4.0), with its real
 * diffusers at their design flows. Source: plans/hvac-real-building-20261013.md.
 *
 * Rules for this page:
 *   - Numbers are exactly the run's (floor_metrics.json / the internal plan).
 *     Do not round them up or add new ones.
 *   - It is an INDICATIVE, automated first pass. Rooms and HVAC airflow is not
 *     on sale and not validated yet; never say it is.
 *   - No prices, no cost or margin figures, no machine RAM, no CPU maker.
 *   - The CC BY 4.0 attribution block must stay on the page (licence term).
 *   - The summary PDF is NOT published: it carries internal notes (machine
 *     name, "prototype" wording for internal readers).
 *
 * Images in /public/cfd/projects/clinic-floor-hvac are the run's plots,
 * watermarked (COREFRAME + coreframecloud.com burned in) by the scratchpad
 * script hvac-case/wm.py.
 */

const PATH = "/cfd/projects/clinic-floor-hvac";
const IMG = "/cfd/projects/clinic-floor-hvac";
const TITLE = "HVAC CFD on a Real Clinic Floor: 90 Diffusers";
const DESCRIPTION =
  "A real clinic floor, 90 ceiling diffusers at design airflow: rooms held 23.0 °C and ADPI was 93 %, but 15 % of the floor had draught at ankle height.";

const OG = {
  url: `${IMG}/og-ankle-air-speed.jpg`,
  width: 1200,
  height: 630,
  alt: "Air speed at ankle height across the second floor of a real clinic, from a Coreframe HVAC CFD run",
};

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "HVAC CFD case study",
    "ADPI CFD",
    "PMV CFD office floor",
    "diffuser draught CFD",
    "HVAC airflow simulation India",
    "IFC HVAC CFD",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    images: [OG],
    title: "HVAC CFD on a real clinic floor — Coreframe Cloud",
    description:
      "90 real diffusers, 100 rooms, one automated run. Comfortable at head height, draughty at the ankles in the small rooms.",
    url: `${SITE}${PATH}`,
    type: "article",
    publishedTime: "2026-10-13",
  },
};

const MODEL_URL =
  "https://github.com/buildingsmart-community/Community-Sample-Test-Files/tree/main/IFC%202.3.0.1%20(IFC%202x3)/Medical-Dental%20Clinic";
const LICENCE_URL = "https://creativecommons.org/licenses/by/4.0/";

const HEADLINE = [
  { k: "23.0 °C", v: "Average air temperature in the occupied rooms. Most of the floor sits between 22.5 and 23.5 °C." },
  { k: "93 %", v: "ADPI (ASHRAE 113) over the floor. 56 of 59 occupied rooms reach 80 % or more." },
  { k: "−0.28", v: "PMV (ISO 7730): a touch on the cool side of neutral, inside the comfortable band." },
  { k: "15 %", v: "Of the floor has air faster than 0.25 m/s at ankle height. That is the finding." },
];

const BUILDING = [
  ["Building", "A real two-storey clinic, 44,800 sq ft, exported from Revit"],
  ["HVAC in the model", "Ducts, VAV boxes, air handlers and diffusers, with the design airflow on each diffuser"],
  ["Floor studied", "Second floor, 18,500 sq ft"],
  ["Air volume", "100 rooms and corridors, 14,500 sq ft of air"],
  ["Supply", "90 real ceiling diffusers at their design flows"],
  ["Extract", "80 return and exhaust grilles in their real positions"],
  ["Heat", "A heat load in every room"],
];

const RUN = [
  ["Mesh", "1.9 million cells"],
  ["Solver", "Open-source CFD solver, steady, buoyant, 3,000 iterations"],
  ["Run time", "5.1 hours on our own machine in Bengaluru"],
  ["Outputs", "Temperature, air speed, ADPI, PMV and draught maps, plus a table for every room"],
];

const FIGURES = [
  {
    src: `${IMG}/temperature-1-1m.webp`,
    w: 1600,
    h: 1334,
    alt: "Plan of the clinic's second floor coloured by air temperature at 1.1 m, from 22 °C (blue) to 24 °C (red); most rooms are between 22.5 and 23.5 °C",
    cap: "Air temperature at 1.1 m, seated head height. Occupied rooms average 23.0 °C; most of the floor is between 22.5 and 23.5 °C.",
  },
  {
    src: `${IMG}/adpi-1-1m.webp`,
    w: 1600,
    h: 1288,
    alt: "Plan of the second floor marking each point as comfortable, too warm, too cool or draughty under the ASHRAE 113 ADPI test; most of the floor is comfortable",
    cap: "ADPI check at 1.1 m (ASHRAE 113). Green is comfortable. 93 % over the floor; 56 of 59 occupied rooms at 80 % or more.",
  },
  {
    src: `${IMG}/hvac-layout-second-floor.webp`,
    w: 1600,
    h: 1420,
    alt: "Second-floor HVAC layout from the building model: supply ducts in blue, return ducts in red, exhaust in purple, the two air handlers in black",
    cap: "The HVAC we simulated, read straight from the building model: supply (blue), return (red) and exhaust (purple) ducts, VAV boxes and diffusers.",
  },
];

const NEXT_STEPS = [
  ["A finer mesh on a zone", "A group of rooms or one open-plan area meshed at the density we validate single rooms at, not a whole floor at a coarser one."],
  ["Your real loads", "Room loads from your load calculation, or people and watts per room, in place of loads derived from the design airflows."],
  ["Your diffusers' data", "The make and model of each diffuser, so the jet leaves the ceiling at the throw the maker publishes."],
  ["Envelope for perimeter rooms", "Window and wall surface temperatures, so rooms on the façade see the sun and the glass."],
  ["A mesh check", "One representative room run on two meshes, to show the answer does not change with the grid."],
];

const articleLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "HVAC CFD on a real clinic floor: 90 diffusers, 100 rooms",
  description: DESCRIPTION,
  image: [`${SITE}${IMG}/ankle-air-speed.webp`, `${SITE}${OG.url}`],
  datePublished: "2026-10-13",
  dateModified: "2026-10-13",
  inLanguage: "en-IN",
  about: ["HVAC airflow simulation", "Computational fluid dynamics", "Thermal comfort"],
  mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}${PATH}` },
  url: `${SITE}${PATH}`,
  author: { "@type": "Organization", "@id": `${SITE}/#organization`, name: "Coreframe Cloud", url: SITE },
  publisher: {
    "@type": "Organization",
    "@id": `${SITE}/#organization`,
    name: "Coreframe Cloud",
    logo: { "@type": "ImageObject", url: `${SITE}/icon.png` },
  },
  isBasedOn: {
    "@type": "CreativeWork",
    name: "Medical-Dental Test Files",
    url: MODEL_URL,
    author: { "@type": "Organization", name: "buildingSMART International" },
    license: LICENCE_URL,
  },
};

function Figure({
  src,
  w,
  h,
  alt,
  cap,
  sizes,
  preload,
}: {
  src: string;
  w: number;
  h: number;
  alt: string;
  cap: string;
  sizes: string;
  preload?: boolean;
}) {
  return (
    <figure className="min-w-0">
      <div className="overflow-hidden rounded-[20px] border border-rule bg-white p-2">
        <Image src={src} alt={alt} width={w} height={h} sizes={sizes} preload={preload} className="h-auto w-full" />
      </div>
      <figcaption className="mt-2.5 text-[13px] leading-5 text-ink-3">{cap}</figcaption>
    </figure>
  );
}

export default function ClinicFloorHvacPage() {
  return (
    <div className="cfx-paper relative min-h-screen text-ink">
      <JsonLd
        data={breadcrumbList([
          { name: "CFD", path: "/cfd" },
          { name: "HVAC on a real clinic floor", path: PATH },
        ])}
      />
      <JsonLd data={articleLd} />
      <main className="relative">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="cf-section px-5 cf-pagehero cf-pagehero--paper">
          <div className="cf-wide">
            <nav aria-label="Breadcrumb" className="mb-6 font-mono text-[12px] tracking-[0.06em]">
              <Link href="/cfd" className="text-ink-2 hover:text-ink">
                CFD
              </Link>
              <span aria-hidden className="text-ink-3"> / </span>
              <span className="text-ink-2">Projects</span>
            </nav>
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr]">
              <div className="min-w-0">
                <p className="cf-eyebrow">Project · Rooms and HVAC airflow</p>
                <h1 className="cf-display mt-5">A real clinic floor. 90 real diffusers. Where does the cold air land?</h1>
                <p className="cf-lead mt-5">
                  We took a real building model with its HVAC drawn in, and ran the air on a whole floor. Every diffuser
                  sits where the designer put it and blows its design airflow. The rooms are comfortable at head height.
                  At the ankles, the small rooms are draughty.
                </p>
                <p className="mt-6 text-[14px] leading-6">
                  An indicative, automated first-pass study. Read what that means{" "}
                  <a href="#limits" className="underline underline-offset-4">
                    below
                  </a>
                  .
                </p>
              </div>
              <figure className="min-w-0 overflow-hidden rounded-[24px] bg-white p-3 sm:p-4">
                <Image
                  src={`${IMG}/ankle-air-speed.webp`}
                  alt="Plan of the clinic's second floor coloured by air speed 0.1 m above the floor; bright yellow and green patches show air above 0.25 m/s in several small treatment rooms"
                  width={1600}
                  height={1343}
                  sizes="(max-width: 1024px) 100vw, 560px"
                  preload
                  className="h-auto w-full"
                />
                <figcaption className="mt-2 px-1 text-[12.5px] leading-5 !text-ink-3">
                  Air speed at 0.1 m, ankle height. The bright patches are above 0.25 m/s: 15 % of the floor area.
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* ── Headline numbers ─────────────────────────────────────────── */}
        <section className="cf-section px-5">
          <div className="cf-wide">
            <p className="cf-eyebrow">The result</p>
            <h2 className="cf-section-title mt-4">Comfortable at the head. Draughty at the feet.</h2>
            <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {HEADLINE.map((h) => (
                <div key={h.k} className="cf-card">
                  <p className="font-heading text-[34px] leading-none font-medium text-ink">{h.k}</p>
                  <p className="cf-section-copy mt-3">{h.v}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[13px] leading-5 text-ink-3">
              Measured over the 59 occupied rooms, half a metre in from the walls.
            </p>
          </div>
        </section>

        {/* ── The finding ──────────────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide rounded-[28px] bg-tint-blue p-6 sm:p-10">
            <p className="cf-eyebrow">The finding</p>
            <h2 className="cf-section-title mt-4">In the small rooms, the jet hits the wall and comes back along the floor.</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <p className="text-[15.5px] leading-7 text-ink-2">
                The treatment rooms on this floor are about 3 × 3.5 m, each with a four-way ceiling diffuser. Cold air
                leaves the diffuser along the ceiling. In a room that small it reaches the wall before it slows down,
                drops down the wall and runs back across the floor.
              </p>
              <p className="text-[15.5px] leading-7 text-ink-2">
                The temperature is right and the averages look good. But a patient on a chair or a dentist at the
                chairside feels it at the ankles. 15 % of the floor has air faster than 0.25 m/s at 0.1 m. That is what
                you would check on a design review: diffuser type and size, throw, and where it sits in the room.
              </p>
            </div>
          </div>
        </section>

        {/* ── Building and run ─────────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide grid gap-10 lg:grid-cols-2">
            <div className="min-w-0">
              <p className="cf-eyebrow">The building</p>
              <h2 className="cf-section-title mt-4">A real clinic, with its HVAC drawn in.</h2>
              <dl className="mt-6 overflow-hidden rounded-cf border border-rule bg-paper-2">
                {BUILDING.map(([k, v], i) => (
                  <div key={k} className={`flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:gap-6 ${i ? "border-t border-rule" : ""}`}>
                    <dt className="text-sm font-semibold text-ink sm:w-36 sm:shrink-0">{k}</dt>
                    <dd className="min-w-0 text-sm break-words text-ink-2">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-[14px] leading-6 text-ink-3">
                The model is the buildingSMART Medical-Dental Clinic, an openly licensed sample. Credit and licence are{" "}
                <a href="#credits" className="underline underline-offset-4">
                  at the end of this page
                </a>
                .
              </p>
            </div>
            <div className="min-w-0">
              <p className="cf-eyebrow">The run</p>
              <h2 className="cf-section-title mt-4">One automated run, model in, maps out.</h2>
              <dl className="mt-6 overflow-hidden rounded-cf border border-rule bg-paper-2">
                {RUN.map(([k, v], i) => (
                  <div key={k} className={`flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:gap-6 ${i ? "border-t border-rule" : ""}`}>
                    <dt className="text-sm font-semibold text-ink sm:w-28 sm:shrink-0">{k}</dt>
                    <dd className="min-w-0 text-sm break-words text-ink-2">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-[14px] leading-6 text-ink-3">
                The rooms, doors, diffusers, grilles and their airflows were read from the building model. Nobody drew
                the floor by hand.
              </p>
            </div>
          </div>
        </section>

        {/* ── Figures ──────────────────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <p className="cf-eyebrow">The maps</p>
            <h2 className="cf-section-title mt-4">What the floor looks like.</h2>
            <div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-2">
              {FIGURES.map((f) => (
                <Figure key={f.src} {...f} sizes="(max-width: 768px) 100vw, 560px" />
              ))}
            </div>
          </div>
        </section>

        {/* ── Limits ───────────────────────────────────────────────────── */}
        <section id="limits" className="cf-section scroll-mt-20 px-5 pt-0">
          <div className="cfx-panel cf-wide rounded-[6px] p-6 sm:p-10">
            <p className="cfx-eyebrow">What this is, and what it is not</p>
            <h2 className="cf-section-title mt-4">An indicative first pass, not an engineering sign-off.</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <ul className="space-y-3 text-[15px] leading-6 text-ink-2">
                <li>
                  <span className="font-semibold text-ink">Coarser mesh.</span>{" "}A whole floor at 1.9 million cells is
                  coarser than the level we validate single rooms at.
                </li>
                <li>
                  <span className="font-semibold text-ink">Derived loads.</span>{" "}Each room&apos;s heat load was worked
                  back from its design airflow, not taken from a load calculation.
                </li>
                <li>
                  <span className="font-semibold text-ink">Simple diffuser model.</span>{" "}Each diffuser blows its design
                  flow through its face, without the maker&apos;s throw data.
                </li>
                <li>
                  <span className="font-semibold text-ink">Not validated.</span>{" "}This whole-floor run is indicative. The
                  Rooms / HVAC service on our CFD page runs one room at a time, with its own validation statement.
                </li>
              </ul>
              <div className="min-w-0">
                <p className="font-semibold">For an engineering-grade study we would add:</p>
                <ul className="mt-3 space-y-3 text-[15px] leading-6 text-ink-2">
                  {NEXT_STEPS.map(([t, b]) => (
                    <li key={t}>
                      <span className="font-semibold text-ink">{t}.</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-7 text-[14px] leading-6 text-ink-3">
              What it already shows is useful: where the jets go, which rooms are slow or warm, and where the draught
              risk is. All from the design data, before anything is built.
            </p>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide grid gap-5 md:grid-cols-2">
            <div className="flex min-w-0 flex-col rounded-[24px] bg-tint-mint p-6 sm:p-7">
              <h3 className="font-heading text-[20px] leading-[1.25] font-medium text-ink">Ducts and pipes: live today</h3>
              <p className="mt-3 text-[15px] leading-6 text-ink-2">
                Pressure drop and loss coefficient for a duct run, a transition or a fitting, from one STL. PDF report,
                3D viewer and the data files.
              </p>
              <Link href="/cfd#start" className="cfh-link mt-auto pt-5 text-ink">
                Start a duct job <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="flex min-w-0 flex-col rounded-[24px] bg-tint-lilac p-6 sm:p-7">
              <h3 className="font-heading text-[20px] leading-[1.25] font-medium text-ink">Have a floor you want checked?</h3>
              <p className="mt-3 text-[15px] leading-6 text-ink-2">
                Single rooms run on our CFD page today (steady analysis). For a whole floor, send us an IFC with spaces
                and the HVAC model, or plans with a diffuser schedule, and tell us what you need to know.
              </p>
              <Link href="/request-demo" className="cfh-link mt-auto pt-5 text-ink">
                Talk to us <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Credits (CC BY 4.0 attribution: required) ────────────────── */}
        <section id="credits" className="cf-section scroll-mt-20 px-5 pt-0">
          <div className="cf-wide border-t border-rule pt-6">
            <p className="text-[13px] leading-6 break-words text-ink-3">
              <span className="font-semibold text-ink-2">Building model credit.</span> &ldquo;Medical-Dental Clinic&rdquo;
              from BSI (2020) &ldquo;Medical-Dental Test Files,&rdquo; buildingSMART International,{" "}
              <a href={MODEL_URL} target="_blank" rel="noopener" className="underline underline-offset-2">
                github.com/buildingsmart-community/Community-Sample-Test-Files
              </a>
              , licensed under{" "}
              <a href={LICENCE_URL} target="_blank" rel="noopener license" className="underline underline-offset-2">
                Creative Commons Attribution 4.0 International (CC BY 4.0)
              </a>
              . Modified: simulated by Coreframe. The second floor was extracted from the IFC model, its rooms joined
              into one air volume, and its diffusers and grilles used as the airflow inputs for a CFD run. The maps on
              this page are Coreframe&apos;s results, not part of the original files.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
