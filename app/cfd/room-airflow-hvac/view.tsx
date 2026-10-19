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
import { CLINIC_CASE, HVAC_PAGE, HVAC_SERVICE } from "@/lib/cfd-pages";
import { PageByline } from "@/components/seo/page-byline";
import { ROOMS_DELIVERS, ROOMS_VALIDATION } from "@/lib/cfd-rooms";

/**
 * /cfd/room-airflow-hvac — the Rooms / HVAC steady service's own page (SEO
 * review 18 Oct 2026, 3.3 and action 13). Until now the service was a card
 * on /cfd; "airflow simulation" and "room air flow simulation online" had no
 * page to land on.
 *
 * A real product, so not a doorway: the steady tier went on sale 17 Oct 2026
 * (lib/cfd-categories.ts "rooms" live; API CFD_HVAC_ROOMS_ENABLED=true). Every
 * claim is the form's (app/cfd/categories/rooms.tsx), the API's intake rules
 * (control plane services/cfd_hvac.py: one box room 1–100 m long and wide and
 * 2–20 m high, up to 12 supplies and 12 returns, Draft or Fine mesh) and the
 * validation sentence in lib/cfd-rooms.ts, word for word. The transient tier
 * is off (ROOMS_TRANSIENT_OFFERED), so it is not offered here.
 *
 * Prices: only the pre-processing / mesh check fee, in the visitor's currency
 * only (owner, 18 Oct 2026; /usd/cfd/room-airflow-hvac is the dollar copy,
 * proxy.ts); the run is priced on the quote, never here. No costs, provider or solver names.
 * The ADPI section is textbook ASHRAE 113, stated with its limits.
 */

const PATH = HVAC_PAGE.path;
const ART = "/cfd/explainer";
const CLINIC_IMG = "/cfd/projects/clinic-floor-hvac";

const TITLE = "Room Airflow & Thermal Comfort CFD for HVAC | Coreframe";
const DESCRIPTION =
  "Describe one room: size, diffusers, returns and heat loads. Get air speed, temperature, PMV/PPD and ADPI maps in a PDF. No geometry file, no CFD licence.";

export const roomAirflowMetadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "airflow simulation",
    "room air flow simulation online",
    "HVAC CFD analysis",
    "thermal comfort CFD",
    "ADPI calculation",
    "draught rating CFD",
    "PMV PPD CFD",
    "diffuser throw CFD",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    title: "Room airflow CFD for HVAC designers — Coreframe Cloud",
    description: "Comfort, ADPI and draught for one room you describe. A PDF with maps, no CFD licence.",
    url: `${SITE}${PATH}`,
    images: [{ url: `${CLINIC_IMG}/og-ankle-air-speed.jpg`, width: 1200, height: 630, alt: "Air speed at ankle height on a clinic floor, from a Coreframe HVAC CFD run" }],
  },
  twitter: { card: "summary_large_image", title: "Room airflow CFD for HVAC designers — Coreframe Cloud", images: [`${CLINIC_IMG}/og-ankle-air-speed.jpg`] },
};

const INPUTS: [string, string][] = [
  ["The room", "One box-shaped room: length and width from 1 to 100 m, height from 2 to 20 m."],
  ["Supply diffusers", "Up to 12, on the ceiling, floor or any wall: position, size, airflow (m³/h, l/s, CFM or face velocity) and supply air temperature."],
  ["Returns and exhausts", "Up to 12, where the air leaves the room. At least one is needed."],
  ["Heat loads", "People (count and watts each), equipment and lighting, in watts."],
  ["Comfort inputs", "Clothing (clo), activity (met) and relative humidity, for PMV and PPD."],
  ["Mesh", "Draft (a medium mesh) for early design comparisons, or Fine for final numbers. The quote and the report say which was used."],
];

const OUTPUTS: [string, string][] = [
  ["Room averages", "Mean air speed and air temperature in the occupied zone, PMV and PPD (ISO 7730) and ADPI (ASHRAE 113)."],
  ["Maps", "Temperature and air-speed maps through the room, so you can see where the jet lands and where the air is still."],
  ["A PDF report", "The inputs, the mesh used, the convergence of the run, the maps and the averages, with the validation statement."],
];

const STEPS: [string, string][] = [
  ["Describe the room", "On /cfd, choose Rooms / HVAC and fill in the room, the diffusers, the returns and the loads. No geometry file."],
  ["We check it", "Anything we cannot set up is rejected at once, free, with what to change."],
  ["Pre-processing / mesh check", "Paid from your Coreframe wallet. We mesh the room and email a mesh report and a quote for the run."],
  ["Accept and get the report", `Pay the quote from your wallet; results within ${CFD_NORMAL_HOURS} hours of payment.`],
];

function faqs(fee: string) {
  return [
    {
      q: "What does room airflow CFD tell an HVAC designer?",
      a: `Where the supply air goes in the room, how fast it is moving in the occupied zone, the temperatures people sit in, and the comfort indices: PMV and PPD (ISO 7730) and ADPI (ASHRAE 113). You get ${ROOMS_DELIVERS}.`,
    },
    {
      q: "Do I need a 3D model or a CFD licence?",
      a: "No. You describe one box-shaped room on a form: its size, the supply diffusers and returns on its walls or ceiling, and the heat loads. The solver runs on our side.",
    },
    {
      q: "What does it cost?",
      a: `Pre-processing / mesh check is ${fee} for most models, paid from your Coreframe wallet. The run is priced on your quote, after the mesh, and you pay for it only if you accept.`,
    },
    {
      q: "How accurate is it?",
      a: ROOMS_VALIDATION,
    },
    {
      q: "Can it model a whole floor or a non-rectangular room?",
      a: "Not as this service. It runs one box-shaped room at a time, steady state. For a whole floor, see our clinic case study, an indicative run on a real building model, and talk to us about your project.",
    },
    {
      q: "Is ADPI enough to judge comfort?",
      a: "No. ADPI was developed for mixing ventilation in cooling, typically with ceiling or high sidewall diffusers. It scores air speed and temperature at points in the occupied zone, and it says nothing about displacement or radiant systems, vertical temperature differences or warm and cold surfaces. Read it next to PMV/PPD and the maps.",
    },
  ];
}

export default async function RoomAirflowHvacView({ currency }: { currency: Currency }) {
  const usd = usdRates(await getRateCard());
  const fee = preprocessFee(currency, usd);
  const faq = faqs(fee);
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE}${PATH}#service`,
    name: "Room airflow and thermal comfort CFD for HVAC",
    serviceType: "Computational fluid dynamics, room air distribution and thermal comfort",
    provider: { "@id": ORG_ID },
    areaServed: AREA_SERVED_WORLD,
    url: `${SITE}${PATH}`,
    isRelatedTo: { "@id": `${SITE}/#cfd-service` },
    description: `Steady CFD of one box-shaped room described on a form (size, supply diffusers, returns, heat loads): ${ROOMS_DELIVERS}. Draft or Fine mesh. No geometry file or CFD licence needed.`,
    offers: regionalOffers({
      name: "Pre-processing / mesh check",
      inr: CFD_PREPROCESS_INR.small,
      usd: usd.cfd_quote_fee_small,
      url: `${SITE}${PATH}`,
      description: "For most models. The room is meshed and checked, then the run is quoted and paid only if you accept.",
    }),
  };

  return (
    <div className="cfx-paper relative min-h-screen text-ink">
      <JsonLd
        data={breadcrumbList([
          { name: "CFD", path: "/cfd" },
          { name: "Room airflow CFD for HVAC", path: PATH },
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
                <span className="text-ink-2">Rooms and HVAC</span>
              </nav>
              <p className="cf-eyebrow">CFD · Rooms and HVAC airflow · Live</p>
              <h1 className="cf-display mt-5">Room airflow CFD for HVAC designers: comfort, ADPI and draught</h1>
              {/* Answer-first (SEO review 18 Oct 2026, 3.3). */}
              <p className="cf-lead mt-5 max-w-[52ch]">
                Describe one room, its supply diffusers, returns and heat loads, and Coreframe runs a steady CFD of the air in
                it. You get the mean air speed, PMV/PPD and ADPI, temperature and air-speed maps and a PDF report within{" "}
                {CFD_NORMAL_HOURS} hours of accepting the quote. Pre-processing / mesh check is {fee}; the run price is
                on your quote.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/cfd#start" className="cf-btn-primary">Start a room job</Link>
                <Link href={CLINIC_CASE.path} className="cf-btn-secondary">See a whole-floor example</Link>
              </div>
              <PageByline path={HVAC_PAGE.path} published="2026-10-18" className="mt-4 text-ink-3" />
            </div>
            <ExplainFigure
              src={`${ART}/i-room-diffuser-airflow.webp`}
              alt="Sketch of a room cut open, with air curling down from a ceiling diffuser"
              width={1536}
              height={864}
              sizes="(max-width: 900px) 100vw, 560px"
              caption="Air from a ceiling diffuser, curling into the room. Illustration."
            />
          </div>
        </section>

        {/* ── 1. What you enter ────────────────────────────────────────── */}
        <section className="cf-section px-5">
          <div className="cf-wide">
            <SectionHead n={1} tint="teal" eyebrow="What you enter" title="A room described on a form, not drawn.">
              No CAD file. The numbers you already have from the design: the room, the air terminals and the loads.
            </SectionHead>
            <dl className="grid gap-4 sm:grid-cols-2">
              {INPUTS.map(([k, v]) => (
                <div key={k} className="min-w-0 rounded-[6px] border-[1.5px] border-ink bg-paper px-5 py-4">
                  <dt className="cfx-eyebrow">{k}</dt>
                  <dd className="mt-2 text-[15px] leading-6 text-ink-2">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── 2. What you get ──────────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <SectionHead n={2} tint="blue" eyebrow="What you get" title="The comfort numbers, and the maps behind them.">
              Averages answer &ldquo;is the room comfortable&rdquo;. The maps answer &ldquo;where is it not, and why&rdquo;.
            </SectionHead>
            <div className="grid gap-8 min-[900px]:grid-cols-2 min-[900px]:items-start">
              <dl className="grid gap-4">
                {OUTPUTS.map(([k, v]) => (
                  <div key={k} className="min-w-0 border-t border-rule pt-4">
                    <dt className="font-semibold text-ink">{k}</dt>
                    <dd className="mt-1 text-[15px] leading-6 text-ink-2">{v}</dd>
                  </div>
                ))}
              </dl>
              <figure className="min-w-0">
                <div className="overflow-hidden rounded-[20px] border border-rule bg-white p-2">
                  <Image
                    src={`${CLINIC_IMG}/ankle-air-speed.webp`}
                    alt="Plan of a clinic floor coloured by air speed 0.1 m above the floor; bright patches show air above 0.25 m/s in small treatment rooms"
                    width={1600}
                    height={1343}
                    sizes="(max-width: 900px) 100vw, 520px"
                    className="h-auto w-full"
                  />
                </div>
                <figcaption className="mt-2.5 text-[13px] leading-5 text-ink-3">
                  An air-speed map at ankle height, from our whole-floor clinic run (an indicative study, not this single-room
                  service). <Link href={CLINIC_CASE.path} className="underline underline-offset-4">Read the case study</Link>.
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* ── 3. The clinic example ────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide rounded-[28px] bg-tint-blue p-6 sm:p-10">
            <p className="cf-eyebrow">Worked example</p>
            <h2 className="cf-section-title mt-4">A clinic floor: comfortable at the head, draughty at the feet.</h2>
            <p className="mt-4 max-w-[46rem] text-[15.5px] leading-7 text-ink-2">
              On a real clinic floor with 90 ceiling diffusers at design airflow, the occupied rooms averaged 23.0 °C and the
              floor reached an ADPI of 93 %, but 15 % of the floor had air faster than 0.25 m/s at ankle height. In the small
              treatment rooms the ceiling jet reaches the wall, drops and runs back across the floor. It is an indicative,
              whole-floor first pass, and the case study says what that means.
            </p>
            <p className="mt-5">
              <Link href={CLINIC_CASE.path} className="cfh-link text-ink">
                The clinic case study <span aria-hidden>→</span>
              </Link>
            </p>
          </div>
        </section>

        {/* ── 4. ADPI: what it tells you and what it doesn't ───────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <SectionHead n={3} tint="coral" eyebrow="Reading the numbers" title="What ADPI tells you, and what it doesn't.">
              One number for a whole room is useful and easy to over-read.
            </SectionHead>
            <div className="grid gap-8 min-[900px]:grid-cols-2 min-[900px]:items-center">
              <div className="min-w-0 space-y-4 text-[16px] leading-[1.65] text-ink-2">
                <p>
                  ADPI, the air diffusion performance index of ASHRAE Standard 113, is the share of points in the occupied zone
                  where the air is neither draughty nor stuffy: the effective draft temperature between −1.7 and +1.1 K, and the
                  air speed under 0.35 m/s. Above 80 % is usually read as good mixing.
                </p>
                <p>
                  It was developed for mixing ventilation in cooling, with ceiling or high sidewall diffusers. It does not judge
                  displacement or radiant systems, the temperature difference between head and ankles, or a cold window. A
                  room can score well on ADPI and still have a draughty corner, which is why the maps and PMV/PPD come with it.
                </p>
              </div>
              <Callout source="How to read ADPI">
                ADPI is a mixing-ventilation score: <Hl>read it next to the maps</Hl>, not instead of them.
              </Callout>
            </div>
          </div>
        </section>

        {/* ── How it works + accuracy ──────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide grid gap-10 lg:grid-cols-2">
            <div className="min-w-0">
              <p className="cf-eyebrow">How it works</p>
              <h2 className="cf-section-title mt-4">Four steps, from your account.</h2>
              <ol data-cf-steps="" className="mt-6 space-y-5">
                {STEPS.map(([t, b], i) => (
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
            <div className="min-w-0">
              <p className="cf-eyebrow">Accuracy and limits</p>
              <h2 className="cf-section-title mt-4">What it has been checked against.</h2>
              <p className="cf-section-copy mt-4">{ROOMS_VALIDATION}</p>
              <ul className="mt-4 space-y-2 text-[15px] leading-6 text-ink-2">
                <li>One box-shaped room per job, steady state.</li>
                <li>Results are design guidance, not certification.</li>
                <li>{preprocessLarge(currency, usd).replace(/\.$/, ", for pre-processing.")}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-col">
            <h2 className="cf-section-title">Questions.</h2>
            {faq.map((f) => (
              <Fold key={f.q} title={f.q}>
                <p className="mt-3 text-[15px] leading-6 break-words text-ink-2">{f.a}</p>
              </Fold>
            ))}
            <p className="mt-8 text-[14.5px] leading-6 text-ink-2">
              Related: <Link href={HVAC_SERVICE.path} className="text-ink underline underline-offset-4">HVAC simulation service: who it is for, price and turnaround</Link>
              {" · "}
              <Link href="/cfd" className="text-ink underline underline-offset-4">CFD for ducts and pipes</Link>
              {" · "}
              <Link href={CLINIC_CASE.path} className="text-ink underline underline-offset-4">Clinic floor case study</Link>
              {" · "}
              <Link href="/cfd/mesh-independence-study" className="text-ink underline underline-offset-4">Mesh independence study (GCI)</Link>
            </p>
            <p className="mt-6">
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
