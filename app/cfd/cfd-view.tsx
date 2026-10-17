import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { breadcrumbList } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Fold } from "@/components/visuals/fold";
import { PageHeroBg, type HeroImage } from "@/components/page-hero-bg";
import { Callout, CheckRow, ExplainFigure, Hl, SectionHead, Stamp } from "@/components/cfd-explainer";
import { VelocityProfileOverlay } from "@/components/cfd-explainer/velocity-profile";
import CfdStart from "./cfd-start";
import { StatusBadge } from "@/components/home/redesign/offerings";
import { getRateCard } from "@/lib/rate-card";
import { cellsLabel, formatMoney, usdRates, type Currency, type UsdRateCard } from "@/lib/money";
import { VerifiedCard } from "@/components/cfd-explainer/verified-card";
import { VERIFIED, verifiedFrom } from "@/lib/cfd-verified";

/**
 * /cfd — CFD for ducts and pipes (managed, automatic). Live 13 Oct 2026.
 *
 * Until 13 Oct this page was a six-step brief for "we size a GPU workstation,
 * you bring the solver licence". The product behind it is now the automatic
 * duct/pipe service in the control plane (apps/api/app/api/cfd_jobs.py):
 * one closed binary STL -> automatic geometry check -> pre-processing (quote_fee) from the
 * wallet -> mesh on our machine -> emailed quote -> pay from the wallet ->
 * OpenFOAM run -> PDF report, 3D viewer and data files.
 *
 * Claims on this page are only the ones cfd-runner/RUNBOOK.md supports:
 *   - straight-pipe friction factor within about 1-5 % of Haaland/Colebrook;
 *   - wall layers at y+ ~ 1 by default;
 *   - every run is judged against residual targets, and a run that did not
 *     converge is delivered marked provisional.
 * Do NOT add a bend / fitting K accuracy figure (about +-25 % today), the
 * Quick / Standard package prices or anything about how quotes are priced.
 *
 * VERIFIED (owner, 16 Oct 2026): the mesh-independence study (GCI), built as
 * the API's "validated" package, is on sale and is the one package whose
 * starting price is published (lib/cfd-verified.ts: from ₹5,999 + GST, from $99
 * outside India). Never call it "Validated" here: a GCI study is verification,
 * not validation. Landing page: /cfd/mesh-independence-study.
 *
 * DELIVERY SPEEDS (owner, 14 Oct 2026; control plane branch cfd-express-20261014,
 * merged into cfd-cloudpe-20261016): Normal = "results within 24 hours" of payment;
 * Express = "results in 1–2 hours", 3x the price, offered on the quote only for
 * models that fit (smaller steady runs). Keep the provider, our costs and how the
 * 3x is derived off this page.
 *
 * Images in /public/cfd are real outputs of overnight end-to-end runs on our
 * own test geometry (12 Oct 2026, 50 mm pipes, water at 4 m/s): a 90 degree
 * bend (0.91 M cells) and a reducer (1.49 M cells). The report pages and
 * /cfd/sample-report.pdf are the bend run re-rendered (13 Oct 2026) with the
 * current letterhead report (cfd-runner/report.py), titled "Sample: 90° water
 * bend" in place of the internal test job name; the numbers are the run's.
 *
 * ACCOUNT FIRST (owner, 13 Oct 2026): the form is only for a signed-in account
 * that finished sign-up (cfd-start.tsx); the API refuses anything else. The
 * form itself is driven by lib/cfd-categories.ts (one tab per CFD vertical).
 *
 * 15 Oct 2026: rendered twice, as /cfd (INR) and /usd/cfd (USD, for visitors
 * outside India; proxy.ts rewrites to it, the browser keeps /cfd). The USD
 * copy shows the pre-processing charge from the rate card's `usd` block with no GST and
 * says runs are quoted in US dollars after the mesh, never a run price.
 */

const CFD_OG_IMAGE = {
  url: "/cfd/og-cfd.jpg",
  width: 1200,
  height: 630,
  alt: "Pressure drop you can check: a sketch of a duct bend under a magnifying glass",
};

export const cfdMetadata: Metadata = {
  // Absolute (no "| Coreframe Cloud"): the SEO audit's 60-character title limit (16 Oct 2026).
  title: { absolute: "Duct and Pipe Pressure Drop Calculation · CFD Meshing" },
  description:
    "Pressure drop calculation for ducts and pipes with OpenFOAM CFD. Upload one STL; we build and check a wall-resolved mesh, quote, run it and report.",
  keywords: [
    "pressure drop calculation",
    "pipe pressure drop calculation",
    "duct pressure drop",
    "CFD pre-processing",
    "CFD meshing",
    "mesh quality check",
    "snappyHexMesh",
    "CFD pressure drop duct",
    "pipe pressure drop CFD India",
    "duct CFD analysis service",
    "loss coefficient CFD",
    "OpenFOAM CFD service India",
    "CFD for final year project",
    "mesh independence study",
    "HVAC duct CFD consultant",
  ],
  alternates: { canonical: "/cfd" },
  openGraph: {
    // The CFD share card (16 Oct 2026, explainer style). No price on it, on
    // purpose: share cards are cached for weeks.
    images: [CFD_OG_IMAGE],
    title: "Duct and pipe pressure drop calculation (CFD) — Coreframe Cloud",
    description:
      "One STL in. Pressure drop, loss coefficient, a PDF report, a 3D viewer and the data files out. OpenFOAM on our machine, no licence on yours.",
    url: "https://www.coreframecloud.com/cfd",
  },
  twitter: {
    card: "summary_large_image",
    title: "Duct and pipe pressure drop calculation (CFD) — Coreframe Cloud",
    images: [CFD_OG_IMAGE.url],
  },
};

/** The explainer sketches (ink + watercolour, Z-Image Turbo on our node,
 *  16 Oct 2026; prompts and seeds in marketing-20261016-cfd-style/art/illustrations.json).
 *  Illustrations only: every result picture on this page is from a real run. */
const ART = "/cfd/explainer";

const CFD_HERO: HeroImage = {
  src: `${ART}/hero-what-is-cfd-1440.webp`,
  w: 1440,
  h: 624,
  mobile: { src: `${ART}/hero-what-is-cfd-m780.webp`, w: 780, h: 624 },
  alt: "Sketch: air flowing into a duct bend, with a magnifying glass showing the mesh on its wall",
  pos: "right center",
};

const CFD_SERVICES: {
  name: string;
  status: "Live" | "Coming soon";
  body: string;
  href?: string;
  cta: string;
  tint: string;
  art?: { src: string; alt: string };
}[] = [
  {
    name: "Ducts and pipes",
    status: "Live",
    body: "Bends, reducers, transitions, valves, fittings and manifolds. Upload one STL; we mesh it, email a quote, and deliver pressure drop, loss coefficient, a PDF report, a 3D viewer and the data files.",
    href: "#start",
    cta: "Start a job",
    tint: "bg-tint-mint",
    art: { src: "/cfd/explainer/j-pressure-drop-gauges.webp", alt: "Sketch of a pipe with a valve and an elbow, and a pressure gauge on each side of the valve" },
  },
  {
    name: "Rooms and HVAC airflow",
    status: "Coming soon",
    body: "Room air movement and comfort for HVAC designers: describe one room, its diffusers, returns and heat loads, and get air speed, temperature, PMV/PPD and ADPI in a PDF report. Opening once it passes our heated-room validation.",
    cta: "Opening soon",
    tint: "bg-tint-blue",
    art: { src: "/cfd/explainer/i-room-diffuser-airflow.webp", alt: "Sketch of a room cut open, with air curling down from a ceiling diffuser" },
  },
];

const AUDIENCE = [
  {
    label: "HVAC and MEP consultants",
    body: "Pressure drop across a duct run, a transition or a fitting, with a PDF report you can attach for your client.",
  },
  {
    label: "Plant and process engineers",
    body: "The pressure loss of a pipe spool or manifold before you size the pump or the fan, from the geometry you already have.",
  },
  {
    label: "Students and researchers",
    body: "A real OpenFOAM case for your final-year project or thesis: mesh, convergence history, fields and the full case files.",
  },
];

const STEPS = [
  {
    title: "Sign in, submit the job and upload one STL",
    body: "With your Coreframe account: the fluid volume of your duct or pipe as one closed binary STL, the units, the fluid and the inlet flow.",
  },
  {
    title: "We check the geometry automatically",
    body: "Closed solid, units, and the flat end caps that become your inlet and outlets. You confirm which opening is the inlet on your job page.",
  },
  {
    title: "Pay for pre-processing / mesh check (₹599 incl. GST for most models)",
    body: "We check your geometry, build a wall-resolved mesh and verify its quality; your exact run price comes with it. You get a one-page mesh report and a quote with packages to choose from, by email.",
  },
  {
    title: "Accept, pay from your wallet, get the results",
    body: "Normal: results within 24 hours. Express: results in 1–2 hours at 3x the price, where your quote offers it (not for Verified). You get a PDF report, a 3D results viewer and the data files.",
  },
];

const RECEIVE = [
  ["Pressure drop", "Static and total, inlet to outlet, in pascals"],
  ["Loss coefficient K", "For one inlet and one outlet, on the inlet velocity (and the outlet velocity where they differ)"],
  ["Convergence verdict", "Residual history, the monitored pressure drop, and CONVERGED or a provisional warning"],
  ["Mesh record", "Cell count, wall layers, y+ on the walls, checkMesh quality"],
  ["Fields and 3D view", "Velocity and pressure on the mid-plane, wall pressure and streamlines, in a viewer that runs in your browser"],
  ["Data files", "The OpenFOAM case with the final fields and mesh, readable in ParaView"],
];

const GALLERY = [
  { src: "/cfd/bend-slice-U-zoom.webp", w: 1329, h: 889, cap: "Velocity through a 90° bend: the slow inner wall and the fast outer core." },
  { src: "/cfd/bend-slice-p-zoom.webp", w: 1316, h: 889, cap: "Static pressure through the same bend, relative to the outlet." },
  { src: "/cfd/bend-walls-p.webp", w: 1067, h: 789, cap: "Wall pressure on the whole run, as in the 3D viewer." },
  { src: "/cfd/reducer-streams.webp", w: 1079, h: 789, cap: "Streamlines coloured by speed through a reducer." },
];

const FAQ = [
  {
    q: "What file do you need?",
    a: "One closed binary STL of the fluid volume, which is the air or water inside the duct or pipe, not the metal around it. Close each opening with a flat face at the end of a short straight section. Tell us the units, because STL files do not store them. STEP, IGES, Parasolid and IFC are not accepted yet: export an STL from your CAD tool.",
  },
  {
    q: "Do I need a CFD licence?",
    a: "No. The case runs on OpenFOAM on our machine. You need a browser and a Coreframe account with wallet balance.",
  },
  {
    q: "Do I need a Coreframe account?",
    a: "Yes. Sign up with your email and a WhatsApp code to your mobile, the same account and wallet as GPU workstations and Studio. Your name, email and number come from the account, so the form does not ask for them again.",
  },
  {
    q: "What does it cost to start?",
    a: "Pre-processing / mesh check is ₹599 (incl. GST) for most duct and pipe models and ₹1,499 for very large models (over 5 million cells), paid from your Coreframe wallet. We check your geometry, build a wall-resolved mesh and verify its quality; your exact run price comes with it. The size is estimated from your STL before you pay, so you see which price applies on your job page. You get a one-page mesh report and a quote with packages. Pre-processing is a separate charge for that work and is not deducted from the run. You pay for the run only if you accept the quote. The quoted amount is held in your wallet, you are charged for what the run actually used, and the rest goes back to your wallet.",
  },
  {
    q: "Do you offer CFD meshing as a service?",
    a: "Not as a separate product. Meshing is part of pre-processing / mesh check (₹599 incl. GST for most models): we build a wall-resolved mesh of your geometry with OpenFOAM snappyHexMesh, run a mesh quality check on it and send you a one-page Mesh report with your exact run price. The mesh files themselves (the OpenFOAM polyMesh, which opens in ParaView) come in the case download after a run.",
  },
  {
    q: "Do you check mesh independence?",
    a: verifiedFaq("INR"),
  },
  {
    q: "How fast do I get results?",
    a: "Normal runs deliver results within 24 hours of payment. Express delivers results in 1–2 hours of payment at 3x the price of the same package. Express is offered for smaller models whose run fits that window, and your quote shows whether it is offered for yours. Both follow the same rules: you pay for the iterations run, and the rest of the hold comes back to your wallet.",
  },
  {
    q: "How accurate is it?",
    a: "On our validation cases, the friction factor in a straight pipe matched the Haaland/Colebrook correlation to about 1–5 %. Meshes use wall layers sized for y+ ≈ 1 by default, so the boundary layer is resolved rather than modelled. Every run is judged against residual targets: the report says CONVERGED only when they were met, and a run that did not converge is delivered with a provisional warning. Results are design guidance, not certification.",
  },
  {
    q: "What if the run does not converge?",
    a: "You still get the report, the viewer and the data, clearly marked provisional, and you can continue the run for more iterations from your job page.",
  },
  {
    q: "What if my job is out of scope?",
    a: "It is rejected automatically, before any meshing, with the reason and what to change. You are not charged for a rejection, and a pre-processing charge already paid for that job goes back to your wallet.",
  },
  {
    q: "What can you not run yet?",
    a: "For ducts and pipes: heat transfer, buoyancy, transient flow, multiphase, moving or rotating parts, compressible flow and more than one inlet. Air and water only. Rooms with heat loads and buoyancy (Rooms / HVAC) are opening soon, once they pass our heated-room validation.",
  },
  {
    q: "I have a straight duct but no CAD. Can I still submit?",
    a: "Yes. Tick 'Straight duct, no STL' in the form and give its length, width and height. Then choose 'use my dimensions' on your job page.",
  },
  {
    q: "Is my geometry kept private?",
    a: "Your job belongs to your Coreframe account. Its page and results open only with the private link we email you.",
  },
];

/** The mesh-independence answer; only the price differs by currency. */
function verifiedFaq(cur: Currency): string {
  return `Yes, with the Verified package (${verifiedFrom(cur)}${cur === "USD" ? ", no GST" : ""}): a mesh-independence study that runs your case on three meshes, coarse, medium and fine, and reports the grid convergence index (GCI) on the pressure drop, for example "Mesh-independent: static pressure drop = 12.20 Pa ± 0.85 % (GCI, fine mesh)". Internal flow up to about ${VERIFIED.maxMcells} million cells, results within ${VERIFIED.deliveryHours} hours. ${VERIFIED.meaning} The Quick and Standard packages run one wall-resolved mesh that has passed our mesh quality check.`;
}

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const serviceLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://www.coreframecloud.com/#cfd-service",
  name: "CFD for ducts and pipes",
  serviceType: "Computational fluid dynamics, internal flow pressure drop",
  provider: { "@type": "Organization", name: "Coreframe Cloud", url: "https://www.coreframecloud.com" },
  areaServed: "IN",
  description:
    "Automatic OpenFOAM internal-flow runs for ducts, pipes, bends, reducers, valves and fittings from one closed STL: pressure drop, loss coefficient, PDF report, 3D results viewer and data files.",
  offers: {
    "@type": "Offer",
    name: "Pre-processing / mesh check",
    price: "599",
    priceCurrency: "INR",
    valueAddedTaxIncluded: true,
    description: "Including GST, for most duct and pipe models. Very large models (over 5 million cells): ₹1,499 including GST. Paid from the Coreframe wallet. Geometry check, wall-resolved mesh and mesh-quality check, with a mesh report and the exact run price. The run is quoted separately and paid only if you accept.",
  },
};

/** The pre-processing sentences for a visitor outside India. No GST: an export of
 *  services. Run prices are never shown; runs are quoted after the mesh. */
function usdCopy(u: UsdRateCard) {
  const small = formatMoney(u.cfd_quote_fee_small, "USD");
  const large = formatMoney(u.cfd_quote_fee_large, "USD");
  const cells = cellsLabel(u.cfd_quote_fee_small_max_cells);
  return { small, large, cells };
}

function usdSteps(u: UsdRateCard) {
  const { small } = usdCopy(u);
  return STEPS.map((s, i) =>
    i === 2
      ? {
          title: `Pay for pre-processing / mesh check (${small} for most models, no GST)`,
          body: "We check your geometry, build a wall-resolved mesh and verify its quality; your exact run price comes with it. You get a one-page mesh report and a quote in US dollars with packages to choose from, by email.",
        }
      : s,
  );
}

function usdFaq(u: UsdRateCard) {
  const { small, large, cells } = usdCopy(u);
  return FAQ.map((f) =>
    f.q === "Do you check mesh independence?"
      ? { q: f.q, a: verifiedFaq("USD") }
      : f.q === "Do you offer CFD meshing as a service?"
      ? { q: f.q, a: f.a.replace("₹599 incl. GST for most models", `${small} for most models, no GST`) }
      : f.q === "What does it cost to start?"
      ? {
          q: f.q,
          a: `Pre-processing / mesh check is ${small} for most duct and pipe models and ${large} for very large models (over ${cells} cells), paid from your Coreframe wallet, with no GST (export of services). We check your geometry, build a wall-resolved mesh and verify its quality; your exact run price comes with it. The size is estimated from your STL before you pay, so you see which price applies on your job page. You get a one-page mesh report and a quote with packages. Pre-processing is a separate charge for that work and is not deducted from the run. Runs are quoted in US dollars after the mesh is built, and you pay for the run only if you accept the quote. The quoted amount is held in your wallet, you are charged for what the run actually used, and the rest goes back to your wallet.`,
        }
      : f,
  );
}

function usdServiceLd(u: UsdRateCard) {
  const { large, cells } = usdCopy(u);
  return {
    ...serviceLd,
    offers: {
      "@type": "Offer",
      name: "Pre-processing / mesh check",
      price: String(u.cfd_quote_fee_small),
      priceCurrency: "USD",
      valueAddedTaxIncluded: false,
      description: `For most duct and pipe models; no GST (export of services). Very large models (over ${cells} cells): ${large}. Paid from the Coreframe wallet. Geometry check, wall-resolved mesh and mesh-quality check, with a mesh report and the exact run price. The run is quoted separately in US dollars and paid only if you accept.`,
    },
  };
}

export default async function CfdView({ currency }: { currency: Currency }) {
  const usdView = currency === "USD";
  // Only the USD copy needs the rate card (its `usd` block); the INR fee is
  // the published one typed below, as before.
  const usd = usdView ? usdRates(await getRateCard()) : null;
  const usdText = usd ? usdCopy(usd) : null;
  const steps = usd ? usdSteps(usd) : STEPS;
  const faq = usd ? usdFaq(usd) : FAQ;
  return (
    <div className="cfx-paper relative min-h-screen text-ink" data-usd-view={usdView ? "" : undefined}>
      <JsonLd data={breadcrumbList([{ name: "CFD for ducts and pipes", path: "/cfd" }])} />
      <JsonLd
        data={
          usd
            ? { ...faqLd, mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }
            : faqLd
        }
      />
      <JsonLd data={usd ? usdServiceLd(usd) : serviceLd} />
      <main className="relative">
        {/* ── Hero ─────────────────────────────────────────────────────
            Paper variant (explainer style, owner approved 16 Oct 2026): the
            "what is CFD" sketch on the right, ink text, no scrim. The real
            velocity picture that used to sit here is in the sample section. */}
        <section className="cf-section px-5 cf-pagehero cf-pagehero--paper">
          <div className="cf-wide">
            <div className="min-w-0 max-w-[640px] min-[900px]:max-w-[52%]">
              <p className="cf-eyebrow">CFD for ducts and pipes · Live</p>
              <h1 className="cf-display mt-5 max-w-[14ch]">Pressure drop calculation for your duct or pipe, from one STL.</h1>
              <p className="cf-lead mt-5 max-w-[44ch]">
                Upload the geometry. We check it, mesh it on our machine and email you a quote. OpenFOAM runs on our side,
                so you need no CFD licence.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#start" className="cf-btn-primary">Start a job</a>
                <a href="#sample" className="cf-btn-secondary">See a sample report</a>
              </div>
              <p className="cfx-quiet mt-6">
                <a href="#right">How we know the answer is right ↓</a>
              </p>
            </div>
          </div>
          {/* After the text on purpose: below 900px the sketch flows under it. */}
          <PageHeroBg image={CFD_HERO} />
        </section>

        {/* ── CFD services (sub-categories) ────────────────────────────────
            Owner, 13 Oct 2026: the sub-categories live here, not in the
            homepage hero. Only real ones: ducts and pipes is live, and rooms and
            HVAC airflow is the next physics case (not sold until it passes
            validation). The bring-your-own-solver page was retired 13 Oct 2026. */}
        <section id="services" className="cf-section scroll-mt-20 px-5">
          <div className="cf-wide">
            <p className="cf-eyebrow">CFD services</p>
            <h2 className="cf-section-title mt-4">Pick what you need to run.</h2>
            <div className="mt-9 grid grid-cols-1 gap-5 md:grid-cols-2">
              {CFD_SERVICES.map((c) => (
                <div key={c.name} className={`flex min-w-0 flex-col rounded-[24px] p-6 sm:p-7 ${c.tint}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-[20px] leading-[1.25] font-medium text-ink">{c.name}</h3>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="mt-3 text-[15px] leading-6 text-ink-2">{c.body}</p>
                  {c.art ? (
                    <figure className="mt-4">
                      <Image src={c.art.src} alt={c.art.alt} width={1536} height={864} sizes="(max-width: 768px) 90vw, 420px" className="cfx-art mx-auto h-auto w-full max-w-[360px]" />
                    </figure>
                  ) : null}
                  {c.href ? (
                    <Link href={c.href} className="cfh-link mt-auto pt-5 text-ink">
                      {c.cta} <span aria-hidden>→</span>
                    </Link>
                  ) : (
                    <p className="mt-auto pt-5 text-[13px] font-semibold tracking-[0.04em] text-ink-3 uppercase">{c.cta}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who it is for ────────────────────────────────────────────── */}
        <section className="cf-section px-5">
          <div className="cf-wide">
            <p className="cf-eyebrow">Who it is for</p>
            <h2 className="cf-section-title mt-4">Engineers who need the number and the report, not a CFD seat.</h2>
            <div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-3">
              {AUDIENCE.map((a) => (
                <div key={a.label} className="cf-card">
                  <p className="cf-card-label">{a.label}</p>
                  <p className="cf-section-copy">{a.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────
            Explainer style: numbered head, the geometry → mesh → solve strip,
            then the four real steps (account first, pre-processing, quote). */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <SectionHead n={1} tint="teal" eyebrow="How it works" title="Geometry, mesh, solve.">
              Four steps, all automatic. You see your mesh report and the run price before anything runs.
            </SectionHead>
            <ExplainFigure
              src={`${ART}/b-process-geometry-mesh-solve.webp`}
              alt="Sketch of the same pipe elbow three times: plain geometry, then covered in mesh, then with coloured flow"
              width={1536}
              height={640}
              sizes="(max-width: 960px) 100vw, 960px"
            />
            <ol className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink font-heading text-[15px] text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[16px] leading-6 font-semibold text-ink">{s.title}</h3>
                    <p className="mt-1 text-[15px] leading-6 text-ink-2">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Pre-processing (SEO, owner 16 Oct 2026) ─────────────────────── */}
        <section id="pre-processing" className="cf-section scroll-mt-20 px-5 pt-0">
          <div className="cf-wide">
            <p className="cf-eyebrow">Pre-processing</p>
            <h2 className="cf-section-title mt-4">CFD pre-processing and mesh check</h2>
            <p className="cf-section-copy mt-3 max-w-[46rem]">
              Before any run, we check your geometry, build a wall-resolved mesh with OpenFOAM (blockMesh and
              snappyHexMesh) and run a mesh quality check on it. You get a one-page Mesh report and the exact price of the
              pressure drop simulation, for {usdText ? `${usdText.small} (no GST)` : "₹599 incl. GST"} on most models.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {[
                ["Geometry check", "A closed solid, believable units, and the flat openings that become the inlet and outlets, with their areas and hydraulic diameters. You confirm the inlet."],
                ["Wall-resolved mesh", "CFD mesh generation with snappyHexMesh, with prism layers at the walls sized for y+ ≈ 1. Where those layers cannot cover enough of the wall, we fall back to layers for wall functions, and the report says so."],
                ["Mesh quality check", "checkMesh on every mesh: non-orthogonality, skewness and negative cell volumes against our limits, plus the wall-layer coverage. A mesh that fails is not quoted."],
                ["Mesh report and run price", "One page: the geometry, the mesh numbers, pass or fail for each check and a picture of the mesh, with the price of each run package. A separate charge, not deducted from the run."],
              ].map(([t, b]) => (
                <div key={t} className="cf-card">
                  <h3 className="cf-card-label">{t}</h3>
                  <p className="cf-section-copy">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What you upload ──────────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div className="min-w-0">
              <p className="cf-eyebrow">What you upload</p>
              <h2 className="cf-section-title mt-4">One closed STL of the fluid inside.</h2>
              <ul className="mt-6 space-y-3 text-[15.5px] leading-6 text-ink-2">
                <li><span className="font-semibold text-ink">The fluid volume,</span> not the pipe wall: the air or water inside, as one closed binary STL.</li>
                <li><span className="font-semibold text-ink">Flat end caps</span> on every opening, each at the end of a short straight section. One becomes the inlet; up to two more are outlets.</li>
                <li><span className="font-semibold text-ink">The units</span> your CAD exported in (mm, cm, m or inches).</li>
                <li><span className="font-semibold text-ink">The fluid and the flow:</span> air or water, and the inlet velocity or flow rate.</li>
                <li><span className="font-semibold text-ink">Up to 200 MB.</span> STEP, IGES and IFC are not accepted yet; export an STL instead.</li>
              </ul>
            </div>
            <div className="min-w-0">
              <p className="cf-eyebrow">In scope today</p>
              <div className="mt-4 overflow-hidden rounded-cf border border-rule bg-paper-2">
                {[
                  ["Geometry", "Ducts, pipes, bends, reducers, transitions, valves, fittings, manifolds"],
                  ["Fluid", "Air or water, single phase"],
                  ["Flow", "Steady, incompressible, isothermal; laminar or turbulent"],
                  ["Openings", "One inlet; one or more outlets at the outlet pressure"],
                  ["Not yet", "Heat transfer, transient, multiphase, moving parts, compressible flow"],
                  ["Rooms", "Rooms / HVAC with diffusers, returns and heat loads: opening soon"],
                ].map(([k, v], i) => (
                  <div key={k} className={`flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:gap-6 ${i ? "border-t border-rule" : ""}`}>
                    <dt className="text-sm font-semibold text-ink sm:w-28 sm:shrink-0">{k}</dt>
                    <dd className="min-w-0 text-sm break-words text-ink-2">{v}</dd>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[14px] leading-6 text-ink-3">
                Anything out of scope is rejected automatically, with the reason, before you pay for a mesh.
              </p>
            </div>
          </div>
        </section>

        {/* ── What you receive ─────────────────────────────────────────── */}
        <section id="sample" className="cf-section scroll-mt-20 px-5 pt-0">
          <div className="cf-wide">
            <p className="cf-eyebrow">What you receive</p>
            <h2 className="cf-section-title mt-4">A report you can hand on, and the case behind it.</h2>
            <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              {RECEIVE.map(([k, v]) => (
                <div key={k} className="min-w-0 border-t border-rule pt-4">
                  <dt className="font-semibold text-ink">{k}</dt>
                  <dd className="mt-1 text-[15px] leading-6 text-ink-2">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
              {[
                { src: "/cfd/report-bend-p1.webp", alt: "Page 1 of a Coreframe CFD results report on the company letterhead: plain-language summary, convergence verdict, pressure drop and loss coefficient", cap: "Report page 1: the summary, the verdict and the headline numbers." },
                { src: "/cfd/report-bend-p2.webp", alt: "Page 2 of a Coreframe CFD results report: job inputs, boundary conditions, assumptions and mesh quality", cap: "Report page 2: the inputs, the assumptions and the mesh." },
              ].map((p) => (
                <figure key={p.src} className="min-w-0">
                  <div className="overflow-hidden rounded-[20px] border border-rule bg-white shadow-[0_20px_60px_-24px_rgba(16,17,19,0.35)]">
                    <Image src={p.src} alt={p.alt} width={1600} height={2263} sizes="(max-width: 768px) 100vw, 470px" className="h-auto w-full" />
                  </div>
                  <figcaption className="mt-2.5 text-[13px] text-ink-3">{p.cap}</figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-6">
              <a href="/cfd/sample-report.pdf" target="_blank" rel="noopener" className="cf-btn-secondary">
                Download the full sample report (PDF, 6 pages)
              </a>
            </p>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {GALLERY.map((g) => (
                <figure key={g.src} className="min-w-0">
                  <div className="overflow-hidden rounded-[20px] border border-rule bg-white p-2">
                    <Image src={g.src} alt={g.cap} width={g.w} height={g.h} sizes="(max-width: 640px) 100vw, 470px" className="h-auto w-full" />
                  </div>
                  <figcaption className="mt-2.5 text-[13px] text-ink-3">{g.cap}</figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-6 text-[13px] leading-5 text-ink-3">
              All images are from our own end-to-end test runs: 50 mm pipes, water at 4 m/s, a 90° bend (0.91 M cells) and
              a reducer (1.49 M cells), solved on our machine and reported exactly as a customer receives them.
            </p>
          </div>
        </section>

        {/* ── How we know your answer is right (explainer, 16 Oct 2026) ──
            Claims are only the RUNBOOK ones (see the header of this file):
            residual targets + CONVERGED/provisional, wall layers at y+ ≈ 1
            with the wall-function fallback, and 1–5 % against
            Haaland/Colebrook in a straight pipe. Mesh independence (GCI) is
            the Verified package (on sale 16 Oct 2026), with its card below. */}
        <section id="right" className="cf-section scroll-mt-20 px-5 pt-0">
          <div className="cf-wide">
            <SectionHead n={2} tint="blue" eyebrow="Trusting the result" title="How we know your answer is right.">
              Colourful flow plots are easy. Three checks decide whether the number behind them means anything.
            </SectionHead>

            <CheckRow
              q="Check A · Did it settle?"
              title="Residuals fall, then the run is called converged."
              figure={
                <ExplainFigure
                  src={`${ART}/c-convergence-funnel.webp`}
                  alt="Sketch of a glass funnel: tangled colourful lines go in at the top, one calm line comes out of the spout"
                  width={1024}
                  height={1024}
                  maxWidth={420}
                  stamp={<Stamp decorative>Converged</Stamp>}
                />
              }
            >
              <p>
                The solver guesses, measures how wrong the guess is (the residual), and guesses again. When every residual is
                under its target, the answer has stopped changing.
              </p>
              <div className="cfx-ministat">
                <b>
                  &lt;&thinsp;10<sup>−3</sup>
                </b>
                <span>default residual target</span>
              </div>
              <p>
                The report says <strong className="text-ink">CONVERGED</strong> only when the targets were met. A run that did
                not get there is delivered with a provisional warning, and you can continue it.
              </p>
            </CheckRow>

            <CheckRow
              flip
              q="Check B · Is the wall resolved?"
              title="Thin layers at the wall, sized for y+ ≈ 1."
              figure={
                <ExplainFigure
                  src={`${ART}/f-wall-layers-yplus.webp`}
                  alt="Sketch of a hatched wall with thin flat mesh layers stacked on it; an inset draws the flow speed rising from zero at the wall"
                  width={1536}
                  height={864}
                  overlay={<VelocityProfileOverlay />}
                  caption="Inset: the flow speed is zero at the wall and climbs through the thin layers to the core flow."
                />
              }
            >
              <p>
                Most of the pressure drop is made in a thin layer right at the wall, where the flow speed climbs from zero. We
                stack prism layers there so that layer is resolved, not guessed.
              </p>
              <ul>
                <li>Every mesh goes through a quality check before it is quoted.</li>
                <li>The report shows the y+ you actually got.</li>
                <li>Where layers cannot cover enough of the wall, we fall back to wall functions and the report says so.</li>
              </ul>
            </CheckRow>

            <CheckRow
              q="Check C · Does the mesh change the answer?"
              title="Three meshes, one answer: mesh independence."
              figure={
                <ExplainFigure
                  src={`${ART}/g-three-meshes-gci.webp`}
                  alt="Sketch of the same bend three times: coarse, medium and fine mesh"
                  width={1536}
                  height={640}
                />
              }
            >
              <p>
                Run the same case on a coarse, a medium and a fine mesh. If the pressure drop stops moving, the mesh is no
                longer part of the answer. The grid convergence index (GCI) puts a number on what is left.
              </p>
              <p>
                On our own 90° bend test, three meshes from 0.25 to 1.21 million cells gave 12.247, 12.240 and 12.205 Pa:
                mesh-independent to ± 0.85 %.
              </p>
              <p>
                <a href="#verified" className="cfx-chip no-underline">
                  Verified package · {verifiedFrom(currency)}
                </a>
              </p>
            </CheckRow>
            <div className="mt-10">
              <VerifiedCard currency={currency} id="verified" startHref="#start" />
            </div>
          </div>
        </section>

        {/* ── Pretty vs converged ─────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <SectionHead n={3} tint="coral" eyebrow="Why it matters" title="Beautiful is not the same as right.">
              An unconverged run still draws a lovely picture. The residuals, the wall layers and the mesh check are what tell
              you the pressure drop is real.
            </SectionHead>
            <div className="grid gap-8 min-[900px]:grid-cols-[7fr_4fr] min-[900px]:items-center">
              <ExplainFigure
                src={`${ART}/h-pretty-vs-converged.webp`}
                alt="Sketch of the same pipe twice: on the left a chaotic rainbow splash, on the right calm teal flow"
                width={1536}
                height={864}
                sizes="(max-width: 900px) 100vw, 560px"
                labels={["Beautiful but meaningless", "Converged, checked"]}
              />
              <Callout source="Our validation cases · design guidance, not certification">
                In a straight pipe, our friction factor matched the Haaland/Colebrook correlation to <Hl>about 1–5 %</Hl>.
              </Callout>
            </div>
          </div>
        </section>

        {/* ── Accuracy against time, next to normal / express ─────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <SectionHead n={4} tint="teal" eyebrow="Good enough is a decision" title="Accuracy against time.">
              Each package on your quote has its own iteration budget and convergence targets. Tighter targets take longer;
              you choose, and you choose how fast.
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
                  ["Normal", "Results within 24 hours of payment."],
                  ["Express", "Results in 1–2 hours at 3x the price of the same package, where your quote offers it (smaller steady runs; not Verified)."],
                  ["Either way", "The quote is held in your wallet, you pay for the iterations run, and the rest comes back."],
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

        {/* ── Cost ─────────────────────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cfx-panel cf-wide rounded-[6px] p-6 sm:p-10">
            <p className="cfx-eyebrow">What it costs to start</p>
            <h2 className="cf-section-title mt-4">
              {usdText ? `${usdText.small} for pre-processing / mesh check.` : "₹599 incl. GST for pre-processing / mesh check."}
            </h2>
            <ul className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {[
                usdText
                  ? ["Pre-processing / mesh check", `${usdText.small} for most duct and pipe models; ${usdText.large} for very large models (over ${usdText.cells} cells). No GST (export of services). Paid from your Coreframe wallet. We check your geometry, build a wall-resolved mesh and verify its quality; your exact run price comes with it.`]
                  : ["Pre-processing / mesh check", "₹599 incl. GST for most duct and pipe models; ₹1,499 for very large models (over 5 million cells). Paid from your Coreframe wallet. We check your geometry, build a wall-resolved mesh and verify its quality; your exact run price comes with it."],
                ["A separate charge", "Pre-processing pays for the geometry check, the mesh and its quality check. It is not deducted from the run price."],
                usdText
                  ? ["Mesh report and quote by email", "A one-page mesh report (geometry, mesh quality checks, a picture of the mesh) and a quote in US dollars: packages to choose from, each with its iteration budget and convergence targets."]
                  : ["Mesh report and quote by email", "A one-page mesh report (geometry, mesh quality checks, a picture of the mesh) and packages to choose from, each with its iteration budget and convergence targets."],
                ["Pay only if you accept", "Nothing runs, and nothing more is charged, until you pay the quote."],
                ["Normal or express", "Normal: results within 24 hours. Express: results in 1–2 hours at 3x the price, where the quote offers it."],
                ["Held, then settled", "The quote is held in your wallet; you are charged for what the run used and the rest comes back."],
              ].map(([t, b]) => (
                <li key={t} className="min-w-0 border-t border-dashed border-ink/25 pt-4">
                  <p className="font-semibold text-ink">{t}</p>
                  <p className="mt-1 text-[15px] leading-6 text-ink-2">{b}</p>
                </li>
              ))}
            </ul>
            {usdText ? (
              <p className="mt-7 text-[14px] leading-6 text-ink-3">
                Rejected before meshing: no charge. Pre-processing that fails on our side: the charge goes back to your wallet. An
                invoice in US dollars on every payment.
              </p>
            ) : (
            <p className="mt-7 text-[14px] leading-6 text-ink-3">
              Rejected before meshing: no charge. Pre-processing that fails on our side: the charge goes back to your wallet. GST
              invoice on every payment.
            </p>
            )}
          </div>
        </section>

        {/* ── Form ─────────────────────────────────────────────────────── */}
        <section id="start" className="cf-section scroll-mt-20 px-5 pt-0">
          <div className="cf-wide">
            <div className="mx-auto max-w-[720px]">
              <p className="cf-eyebrow">Start a job</p>
              <h2 className="cf-section-title mt-4">Tell us the flow, then upload the STL.</h2>
              <p className="cf-section-copy mt-3">
                A few fields and a file, from your Coreframe account. Your name, email and WhatsApp number come from the
                account, and pre-processing is paid from its wallet on your job page.
              </p>
              <div className="mt-8">
                <CfdStart currency={currency} />
              </div>
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
          </div>
        </section>
      </main>
    </div>
  );
}
