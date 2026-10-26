import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AREA_SERVED_WORLD, ORG_ID, SITE, breadcrumbList, faqPage, regionalOffers } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Fold } from "@/components/visuals/fold";
import { Callout, ExplainFigure, Hl, SectionHead } from "@/components/cfd-explainer";
import { getRateCard } from "@/lib/rate-card";
import { usdRates, type Currency } from "@/lib/money";
import { CFD_NORMAL_HOURS, CFD_PREPROCESS_INR, preprocessFee, preprocessLarge } from "@/lib/cfd-prices";
import { CLINIC_CASE, HVAC_PAGE, HVAC_SERVICE, MESH_STUDY } from "@/lib/cfd-pages";
import { VERIFICATION_POST_SLUG } from "@/lib/blog/posts/verification-vs-validation-cfd";
import { PageByline } from "@/components/seo/page-byline";
import { ROOMS_DELIVERS, ROOMS_VALIDATION } from "@/lib/cfd-rooms";
import { ROOMS_SAMPLE_REPORT, ROOMS_SAMPLE_REPORT_LIVE } from "@/lib/cfd-services";

/**
 * /cfd/hvac-simulation — the HVAC simulation SERVICE page (owner, 19 Oct 2026:
 * "build pages 1–4, start with HVAC"). It sells the Rooms / HVAC steady
 * service to the people who commission it; /cfd/room-airflow-hvac (HVAC_PAGE)
 * stays the guide to the inputs, the outputs and reading ADPI, and the clinic
 * case study the worked example. This page links to both as supporting
 * reading and does not repeat their sections (no ADPI explainer, no clinic
 * numbers).
 *
 * Every claim comes from code that already ships:
 *   - ROOMS_VALIDATION, word for word, and ROOMS_DELIVERS (lib/cfd-rooms.ts).
 *   - The inputs, limits and defaults of the Rooms form (app/cfd/categories/
 *     rooms.tsx): one box room 1–100 m long and wide, 2–20 m high; up to 12
 *     supplies and 12 returns; supply 5–60 °C; 20–300 W per person (75 by
 *     default); clo 0.6, met 1.2, RH 50 % by default; Draft (medium) or Fine mesh.
 *   - Steady analysis only: the transient tier is off (ROOMS_TRANSIENT_OFFERED),
 *     so it is never named here. Radiation is not modelled.
 *   - Prices: the pre-processing / mesh check fee only (lib/cfd-prices.ts), in
 *     the visitor's currency only; the run is on the quote. Normal delivery
 *     (CFD_NORMAL_HOURS) only: the site does not say Express is offered for rooms.
 *   - The wallet hold / settle and refund rules are the ones /cfd states for
 *     every CFD job ("Rooms and HVAC airflow jobs are quoted the same way").
 * No engine, provider or machine names. The Quick package is never named here
 * (it is being renamed Draft for customers; Draft here is the mesh choice).
 *
 * /usd/cfd/hvac-simulation is the dollar copy (proxy.ts).
 */

const PATH = HVAC_SERVICE.path;
const ART = "/cfd/explainer";
const CLINIC_IMG = "/cfd/projects/clinic-floor-hvac";

/** The Rooms sample report link: one source, lib/cfd-services.ts. */

// 22 Oct 2026: was 63 characters; 52 fits a result title whole.
const TITLE = "HVAC Simulation Service: Room Airflow CFD | Coreframe";
const DESCRIPTION =
  "An HVAC CFD simulation of one room, set up from a form: air speed, temperature, PMV/PPD and ADPI in a PDF report. Draft or Fine mesh, quoted after a mesh check.";

export const hvacSimulationMetadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "HVAC simulation",
    "HVAC simulation service",
    "HVAC CFD simulation",
    "HVAC CFD consultant",
    "diffuser layout simulation",
    "thermal comfort simulation",
    "airflow simulation service India",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    title: "HVAC simulation service — Coreframe Cloud",
    description: "Room airflow and thermal comfort CFD, set up from a form. A PDF report with the comfort numbers and the maps.",
    url: `${SITE}${PATH}`,
    images: [{ url: `${CLINIC_IMG}/og-ankle-air-speed.jpg`, width: 1200, height: 630, alt: "Air speed at ankle height on a clinic floor, from a Coreframe HVAC CFD run" }],
  },
  twitter: { card: "summary_large_image", title: "HVAC simulation service — Coreframe Cloud", images: [`${CLINIC_IMG}/og-ankle-air-speed.jpg`] },
};

const AUDIENCE: [string, string][] = [
  [
    "HVAC and MEP consultants",
    "You have the room, the diffuser schedule and the loads. Check where the supply air lands and what the occupied zone feels like before the layout is issued, without a CFD licence or an analyst.",
  ],
  [
    "Architects and interior designers",
    "A double-height space, a long room with air from one end, a ceiling crowded with lights: see whether the air terminals the engineer proposed reach the people in it.",
  ],
  [
    "Contractors and design-build teams",
    "Two diffuser options on the table. Describe each as its own job, run both on the Draft mesh, and compare the averages and the maps side by side.",
  ],
  [
    "Building owners and facility teams",
    "A room people call draughty or stuffy. Describe it as it is and see where the air moves fast, where it is still and how the comfort indices come out.",
  ],
];

const DELIVERABLES: [string, string][] = [
  ["Room averages", "Mean air speed and air temperature in the occupied zone, PMV and PPD (ISO 7730) and ADPI (ASHRAE 113)."],
  ["Flagged range", "The fastest air and the worst head-to-ankle temperature difference in the room, flagged as a range."],
  ["Maps", "Temperature and air-speed maps through the room: where the jet goes, where it drops and where the air is still."],
  ["The PDF report", "Your inputs, the mesh used, the convergence of the run, the maps and the averages, with the validation statement."],
  ["Before the run", "A mesh report and a quote for the run, emailed after pre-processing. You decide then whether to go ahead."],
];

const READY: [string, string][] = [
  [
    "Room size",
    "Length, width and height in metres. One box-shaped room, 1 to 100 m long and wide, 2 to 20 m high. Pick one floor corner as x = 0, y = 0: every position is measured from it, x along the length, y across, z up.",
  ],
  [
    "Supply diffusers",
    "Up to 12, each on the ceiling, the floor or a wall: its centre (in the plane of that surface), its face size, its airflow in m³/h, l/s, CFM or as a face velocity, and the supply air temperature (5 to 60 °C).",
  ],
  ["Returns and exhausts", "At least one and up to 12: where each one is and its size."],
  [
    "Heat loads",
    "The number of people and the sensible heat per person (20 to 300 W; 75 W if you leave it), equipment watts (spread up to desk height) and lighting watts (just under the ceiling). There is no solar-gain field: describe it in the job notes.",
  ],
  ["Comfort inputs", "Clothing (clo), activity (met) and relative humidity, for PMV and PPD. Left as they are, they are 0.6 clo, 1.2 met and 50 %."],
  ["Mesh", "Draft or Fine. See below."],
];

function howSteps(fee: string): [string, string][] {
  return [
    ["Describe the room", "Sign in, open the CFD form, choose Rooms / HVAC and fill it in. No CAD or geometry file."],
    ["Instant check, free", "A description we cannot set up is rejected at once, with what to change. A rejection costs nothing."],
    ["Pre-processing / mesh check", `${fee}, paid from your Coreframe wallet. We mesh the room and email a mesh report and a quote for the run.`],
    ["Accept the quote", `Pay it from your wallet only if you want to go ahead. Results within ${CFD_NORMAL_HOURS} hours of payment, on your job page.`],
  ];
}

function faqs(fee: string, large: string) {
  return [
    {
      q: "What is an HVAC simulation, and what does this one cover?",
      a: `Here it is a computational fluid dynamics (CFD) simulation of the air in one room: how the supply air moves from the diffusers to the returns, and the speeds and temperatures people sit in. This service runs one box-shaped room per job, as a steady analysis, and delivers ${ROOMS_DELIVERS}.`,
    },
    {
      q: "How much does an HVAC simulation cost?",
      a: `Pre-processing / mesh check is ${fee} for most rooms, paid from your Coreframe wallet. ${large} The run itself is priced on the quote that comes with the mesh report, and you pay for it only if you accept. The quoted amount is held in your wallet, you are charged for what the run used, and the rest goes back.`,
    },
    {
      q: "How long does it take?",
      a: `Results come within ${CFD_NORMAL_HOURS} hours of paying the quote. A room description that cannot be set up is rejected straight away when you submit it, free, with what to change.`,
    },
    {
      q: "Should I pick the Draft or the Fine mesh?",
      a: "Draft uses a medium mesh and is meant for early design comparisons, such as two diffuser layouts. Fine is for the final numbers. Your quote and your report both state which mesh was used.",
    },
    {
      q: "Can I compare two diffuser layouts?",
      a: "Yes, as two jobs: each room description is one job with its own quote and report. Running both on the Draft mesh keeps them comparable with each other.",
    },
    {
      q: "Does it model radiation, a cold window or solar gain?",
      a: "Radiation between surfaces is not modelled, and air temperatures within a few centimetres of heated or cooled surfaces are less reliable. There is no solar-gain field on the form; describe the gain in the job notes.",
    },
    {
      q: "Can the report be used for approval or certification?",
      a: "No. Results are design guidance, not certification. The report states what the run was validated against and where it is less reliable.",
    },
    {
      q: "Can you simulate a whole floor or an odd-shaped room?",
      a: "Not as this service: it takes one box-shaped room at a time. For a whole floor, read the clinic case study, an indicative run on a real building model, and talk to us about the project.",
    },
    {
      q: "Do I need a separate account?",
      a: "No. It is the same Coreframe account and wallet as GPU workstations and Studio, and your jobs appear in My Activity.",
    },
  ];
}

export default async function HvacSimulationView({ currency }: { currency: Currency }) {
  const usd = usdRates(await getRateCard());
  const fee = preprocessFee(currency, usd);
  const large = preprocessLarge(currency, usd);
  const faq = faqs(fee, large);
  const steps = howSteps(fee);
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE}${PATH}#service`,
    name: "HVAC simulation service (room airflow and thermal comfort CFD)",
    serviceType: "HVAC simulation, computational fluid dynamics of room air distribution and thermal comfort",
    provider: { "@id": ORG_ID },
    areaServed: AREA_SERVED_WORLD,
    url: `${SITE}${PATH}`,
    isRelatedTo: [{ "@id": `${SITE}/#cfd-service` }, { "@id": `${SITE}${HVAC_PAGE.path}#service` }],
    audience: { "@type": "BusinessAudience", audienceType: "HVAC and MEP consultants, architects, contractors, building owners" },
    description: `Steady CFD of one box-shaped room described on a form (size, supply diffusers, returns, heat loads, comfort inputs): ${ROOMS_DELIVERS}. Draft or Fine mesh. Results within ${CFD_NORMAL_HOURS} hours of payment. No geometry file or CFD licence needed.`,
    offers: regionalOffers({
      name: "Pre-processing / mesh check",
      inr: CFD_PREPROCESS_INR.small,
      usd: usd.cfd_quote_fee_small,
      url: `${SITE}${PATH}`,
      description: "For most rooms. The room is meshed and checked, then the run is quoted and paid only if you accept.",
    }),
  };

  return (
    <div className="cfx-paper relative min-h-screen text-ink">
      <JsonLd
        data={breadcrumbList([
          { name: "CFD", path: "/cfd" },
          { name: "HVAC simulation service", path: PATH },
        ])}
      />
      <JsonLd data={faqPage(faq)} />
      <JsonLd data={serviceLd} />
      <main className="relative">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="cf-section px-5 cf-pagehero cf-pagehero--paper">
          <div className="cf-wide grid items-center gap-8 min-[900px]:grid-cols-[7fr_5fr]">
            <div className="min-w-0 max-w-[640px]">
              <nav aria-label="Breadcrumb" className="mb-6 font-mono text-[12px] tracking-[0.06em]">
                <Link href="/cfd" className="text-ink-2 hover:text-ink">CFD</Link>
                <span aria-hidden className="text-ink-3"> / </span>
                <span className="text-ink-2">HVAC simulation</span>
              </nav>
              <p className="cf-eyebrow">CFD · HVAC simulation service</p>
              <h1 className="cf-display mt-5">HVAC simulation for one room, set up from a form</h1>
              <p className="cf-lead mt-5 max-w-[52ch]">
                Coreframe runs a steady CFD simulation of the air in a room you describe: its size, supply diffusers,
                returns and heat loads. You get the comfort numbers (mean air speed, PMV/PPD, ADPI), temperature and
                air-speed maps and a PDF report within {CFD_NORMAL_HOURS} hours of payment. Pre-processing /
                mesh check is {fee}; the run is priced on your quote.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {ROOMS_SAMPLE_REPORT_LIVE ? (
                  <a href={ROOMS_SAMPLE_REPORT} target="_blank" rel="noopener" className="cf-btn-secondary">
                    Sample report (PDF)
                  </a>
                ) : null}
                <a href="#how" className="cf-btn-secondary">How it works</a>
              </div>
              <PageByline path={PATH} published="2026-10-19" className="mt-4 text-ink-3" />
            </div>
            <ExplainFigure
              src={`${ART}/i-room-diffuser-airflow.webp`}
              alt="Sketch of a room cut open, with air curling down from a ceiling diffuser"
              width={1536}
              height={864}
              sizes="(max-width: 900px) 100vw, 560px"
              caption="Supply air from a ceiling diffuser, curling into the room. Illustration."
            />
          </div>
        </section>

        {/* ── 1. Who it is for ─────────────────────────────────────────── */}
        <section className="cf-section px-5">
          <div className="cf-wide">
            <SectionHead n={1} tint="teal" eyebrow="Who it is for" title="For the people who have to answer “will this room be comfortable?”">
              You bring the design numbers. We set up, mesh and run the case, and send back a report you can put in front of
              a client or a colleague.
            </SectionHead>
            <div className="grid gap-4 sm:grid-cols-2">
              {AUDIENCE.map(([k, v]) => (
                <div key={k} className="min-w-0 rounded-[6px] border-[1.5px] border-ink bg-paper px-5 py-4">
                  <h3 className="font-heading text-[18px] leading-[1.3] font-medium text-ink">{k}</h3>
                  <p className="mt-2 text-[15px] leading-6 text-ink-2">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. What you get ──────────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <SectionHead n={2} tint="blue" eyebrow="What you get" title="A report, not a solver to learn.">
              The averages say whether the room works. The maps show where it does not, and why.
            </SectionHead>
            <div className="grid gap-8 min-[900px]:grid-cols-2 min-[900px]:items-start">
              <div className="min-w-0">
                <dl className="grid gap-4">
                  {DELIVERABLES.map(([k, v]) => (
                    <div key={k} className="min-w-0 border-t border-rule pt-4">
                      <dt className="font-semibold text-ink">{k}</dt>
                      <dd className="mt-1 text-[15px] leading-6 text-ink-2">{v}</dd>
                    </div>
                  ))}
                </dl>
                {ROOMS_SAMPLE_REPORT_LIVE ? (
                  <p className="mt-6 text-[14.5px] leading-6 text-ink-2">
                    <a href={ROOMS_SAMPLE_REPORT} target="_blank" rel="noopener" className="text-ink underline underline-offset-4">
                      Open the sample room report (PDF)
                    </a>{" "}
                    to see the layout before you start.
                  </p>
                ) : null}
              </div>
              <figure className="min-w-0">
                <div className="overflow-hidden rounded-[20px] border border-rule bg-white p-2">
                  <Image
                    src={`${CLINIC_IMG}/temperature-1-1m.webp`}
                    alt="Plan of a clinic floor coloured by air temperature 1.1 m above the floor, from a Coreframe HVAC CFD run"
                    width={1600}
                    height={1334}
                    sizes="(max-width: 900px) 100vw, 520px"
                    className="h-auto w-full"
                  />
                </div>
                <figcaption className="mt-2.5 text-[13px] leading-5 text-ink-3">
                  A temperature map at seated head height, from our whole-floor clinic run (an indicative study, larger than
                  this single-room service). <Link href={CLINIC_CASE.path} className="underline underline-offset-4">Read the case study</Link>.
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* ── 3. Draft or Fine ─────────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <SectionHead n={3} tint="coral" eyebrow="Draft or Fine" title="Choose the mesh for the question you are asking.">
              Early in a design you are comparing options. At the end you need numbers to stand behind.
            </SectionHead>
            <div className="grid gap-8 min-[900px]:grid-cols-2 min-[900px]:items-center">
              <ExplainFigure
                src={`${ART}/e-accuracy-vs-time-scale.webp`}
                alt="Sketch of a brass balance scale with an hourglass on one pan and an archery target on the other, level"
                width={1536}
                height={864}
              />
              <dl className="grid gap-4">
                {[
                  ["Draft", "A medium mesh, for early design comparisons: two diffuser layouts, two supply temperatures, a room before and after a change."],
                  ["Fine", "The default, for final numbers: the run you report on."],
                  ["Either way", "Your quote and your report state which mesh was used, so nobody mistakes a Draft run for a final one."],
                ].map(([k, v]) => (
                  <div key={k} className="min-w-0 rounded-[6px] border-[1.5px] border-ink bg-paper px-6 py-4">
                    <dt className="cfx-eyebrow">{k}</dt>
                    <dd className="mt-2 text-[15.5px] leading-6 text-ink-2">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ── 4. What to have ready ────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <SectionHead n={4} tint="teal" eyebrow="Before you start" title="What to have ready.">
              The numbers are the ones already in your design. Have them to hand and the form is quick to fill in.
            </SectionHead>
            <dl className="grid gap-4 sm:grid-cols-2">
              {READY.map(([k, v]) => (
                <div key={k} className="min-w-0 rounded-[6px] border-[1.5px] border-ink bg-paper px-5 py-4">
                  <dt className="cfx-eyebrow">{k}</dt>
                  <dd className="mt-2 text-[15px] leading-6 text-ink-2">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-[14.5px] leading-6 text-ink-2">
              What each input does to the result, and how to read the outputs:{" "}
              <Link href={HVAC_PAGE.path} className="text-ink underline underline-offset-4">room airflow CFD for HVAC, the guide</Link>.
            </p>
          </div>
        </section>

        {/* ── How it works + price ─────────────────────────────────────── */}
        <section id="how" className="cf-section scroll-mt-20 px-5 pt-0">
          <div className="cf-wide grid gap-10 lg:grid-cols-2">
            <div className="min-w-0">
              <p className="cf-eyebrow">How it works</p>
              <h2 className="cf-section-title mt-4">Four steps, all from your account.</h2>
              <ol data-cf-steps="" className="mt-6 space-y-5">
                {steps.map(([t, b], i) => (
                  <li key={t} className="flex gap-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink font-heading text-[15px] text-white">{i + 1}</span>
                    <div className="min-w-0">
                      <h3 className="text-[16px] leading-6 font-semibold text-ink">{t}</h3>
                      <p className="mt-1 text-[15px] leading-6 text-ink-2">{b}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="cfx-panel min-w-0 rounded-[6px] p-6 sm:p-8">
              <p className="cfx-eyebrow">What it costs</p>
              <h2 className="cf-section-title mt-4">{fee} to mesh and quote your room.</h2>
              <ul className="mt-5 space-y-3 text-[15px] leading-6 text-ink-2">
                <li>Pre-processing / mesh check is {fee} for most rooms, from your Coreframe wallet. {large}</li>
                <li>The run is priced on the quote that comes with the mesh report. You pay it only if you accept.</li>
                <li>The quoted amount is held in your wallet; you are charged for what the run used and the rest comes back.</li>
                <li>Rejected before meshing: no charge. Pre-processing that fails on our side: the charge goes back to your wallet.</li>
                <li>Results within {CFD_NORMAL_HOURS} hours of payment.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Scope and limits ─────────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide grid gap-8 min-[900px]:grid-cols-2 min-[900px]:items-center">
            <div className="min-w-0">
              <p className="cf-eyebrow">Accuracy and limits</p>
              <h2 className="cf-section-title mt-4">What it has been checked against, and what it leaves out.</h2>
              <p className="cf-section-copy mt-4">{ROOMS_VALIDATION}</p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-6 text-ink-2">
                <li>One box-shaped room per job, as a steady analysis.</li>
                <li>The room is described on the form; there is no geometry upload for rooms.</li>
                <li>A whole floor or an irregular room is not this service: talk to us.</li>
                <li>Results are design guidance, not certification.</li>
              </ul>
            </div>
            <Callout source="How to use the result">
              A steady run of one room is a <Hl>design check you can repeat</Hl>: change the layout, run it again, compare.
            </Callout>
          </div>
        </section>

        {/* ── Supporting reading ───────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <p className="cf-eyebrow">Further reading</p>
            <h2 className="cf-section-title mt-4">Before you commission a run.</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  href: HVAC_PAGE.path,
                  title: "Room airflow CFD for HVAC: the guide",
                  body: "Every input and output in detail, and what ADPI tells you and what it doesn't.",
                },
                {
                  href: CLINIC_CASE.path,
                  title: "Case study: a clinic floor with 90 diffusers",
                  body: "An indicative whole-floor run: comfortable at head height, draughty at the ankles in the small rooms.",
                },
                {
                  href: `/blog/${VERIFICATION_POST_SLUG}`,
                  title: "Verification vs validation in CFD",
                  body: "What a benchmark comparison proves, and what a mesh-independence study proves instead.",
                },
              ].map((c) => (
                <Link key={c.href} href={c.href} className="group flex min-w-0 flex-col rounded-[6px] border-[1.5px] border-ink bg-paper px-5 py-4 transition hover:bg-white">
                  <span className="font-heading text-[17px] leading-[1.3] font-medium text-ink group-hover:underline group-hover:underline-offset-4">{c.title}</span>
                  <span className="mt-2 text-[14.5px] leading-6 text-ink-2">{c.body}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ, then the ask ────────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-col">
            <h2 className="cf-section-title">Questions.</h2>
            {faq.map((f) => (
              <Fold key={f.q} title={f.q}>
                <p className="mt-3 text-[15px] leading-6 break-words text-ink-2">{f.a}</p>
              </Fold>
            ))}
            <p className="mt-8 text-[14.5px] leading-6 text-ink-2">
              Related: <Link href="/cfd" className="text-ink underline underline-offset-4">CFD for ducts and pipes</Link>
              {" · "}
              <Link href={MESH_STUDY.path} className="text-ink underline underline-offset-4">Mesh independence study (GCI)</Link>
            </p>
            <p className="mt-6 text-[14.5px] leading-6 text-ink-2">
              Ready with your room?{" "}
              <Link href="/cfd#start" className="cfh-link text-ink">
                Start a room job <span aria-hidden>→</span>
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
