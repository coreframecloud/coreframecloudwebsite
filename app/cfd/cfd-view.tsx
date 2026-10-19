import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AREA_SERVED_WORLD, ORG_ID, SITE, breadcrumbList, faqPage, howTo, regionalOffers } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Fold } from "@/components/visuals/fold";
import { PageHeroBg, type HeroImage } from "@/components/page-hero-bg";
import { Callout, CheckRow, ExplainFigure, Hl, SectionHead, Stamp } from "@/components/cfd-explainer";
import { VelocityProfileOverlay } from "@/components/cfd-explainer/velocity-profile";
import CfdStart from "./cfd-start";
import { getRateCard, otherCurrencyLine } from "@/lib/rate-card";
import { cellsLabel, formatMoney, usdRates, type Currency, type UsdRateCard } from "@/lib/money";
import { VerifiedCard } from "@/components/cfd-explainer/verified-card";
import { VERIFIED, VERIFIED_INR_ALL_IN, verifiedFrom, verifiedFromAmount } from "@/lib/cfd-verified";
import { CfxFigure } from "@/components/cfd-explainer/figure";
import type { Figure } from "@/lib/cfd-services";
import {
  CFD_EXPRESS,
  CFD_NORMAL_HOURS,
  CFD_PREPROCESS_INR,
  preprocessFee,
  preprocessLarge,
} from "@/lib/cfd-prices";
import { CFD_HOME, CLINIC_CASE, HVAC_PAGE } from "@/lib/cfd-pages";
import { PageByline } from "@/components/seo/page-byline";
import { getVisiblePost } from "@/lib/blog";
import { VERIFICATION_POST_SLUG } from "@/lib/blog/posts/verification-vs-validation-cfd";
import { HAND_CALC_POST_SLUG } from "@/lib/blog/posts/pressure-drop-hand-calc-vs-cfd";
import { ROOMS_VALIDATION } from "@/lib/cfd-rooms";
import { cfdServiceTiles } from "@/lib/cfd-services";
import { ServiceTiles } from "./service-tiles";

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
 * Draft / Standard package prices or anything about how quotes are priced.
 *
 * VERIFIED (owner, 16 Oct 2026): the mesh-independence study (GCI), built as
 * the API's "validated" package, is on sale and is the one package whose
 * starting price is published (lib/cfd-verified.ts: from ₹7,079 all-in, from $99
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
 * copy shows the pre-processing charge from the rate card's `usd` block and
 * says runs are quoted in US dollars after the mesh, never a run price.
 *
 * ONE all-in price, no tax words (owner, 19 Oct 2026): rupee figures are what
 * the wallet is charged (lib/cfd-prices.ts inrAllIn); the terms page alone
 * mentions tax and the invoice.
 */

const CFD_OG_IMAGE = {
  url: "/cfd/og-cfd.jpg",
  width: 1200,
  height: 630,
  alt: "Pressure drop you can check: a sketch of a duct bend under a magnifying glass",
};

export const cfdMetadata: Metadata = {
  // Absolute, 58 characters with the brand (SEO review 18 Oct 2026, 3.1).
  title: { absolute: "Duct & Pipe Pressure Drop CFD from One STL | Coreframe Cloud" },
  // cfdMetadataLive() adds the mesh-check fee in the page's currency.
  description:
    "Upload one STL of a bend, reducer or manifold. We mesh and check it, then quote; you get pressure drop, loss coefficient and a PDF report.",
  keywords: [
    "pressure drop calculation",
    "pipe pressure drop calculation",
    "duct pressure drop",
    "CFD pre-processing",
    "CFD meshing",
    "mesh quality check",
    "CFD pressure drop duct",
    "pipe pressure drop CFD India",
    "duct CFD analysis service",
    "loss coefficient CFD",
    "CFD service India",
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
      "One STL in. Pressure drop, loss coefficient, a PDF report, a 3D viewer and the data files out. The solver runs on our machine, no licence on yours.",
    url: "https://www.coreframecloud.com/cfd",
  },
  twitter: {
    card: "summary_large_image",
    title: "Duct and pipe pressure drop calculation (CFD) — Coreframe Cloud",
    images: [CFD_OG_IMAGE.url],
  },
};

/**
 * The metadata of one copy, with the mesh-check fee in that copy's currency
 * only (owner, 18 Oct 2026). The dollar fee is the rate card's.
 */
export async function cfdMetadataLive(currency: Currency): Promise<Metadata> {
  const u = usdRates(await getRateCard());
  const fee = currency === "USD" ? formatMoney(u.cfd_quote_fee_small, "USD") : formatMoney(CFD_PREPROCESS_INR.small, "INR");
  return {
    ...cfdMetadata,
    description: `${cfdMetadata.description} Mesh check ${fee}.`,
  };
}

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
    body: "A real CFD case for your final-year project or thesis: mesh, convergence history, fields and the full case files.",
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
    title: "Pay for pre-processing / mesh check (₹599 for most models)",
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
  ["Mesh record", "Cell count, wall layers, y+ on the walls, mesh quality checks"],
  ["Fields and 3D view", "Velocity and pressure on the mid-plane, wall pressure and streamlines, in a viewer that runs in your browser"],
  ["Data files", "The complete simulation case with the final fields and mesh, in an open format that free CFD post-processing tools can read"],
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
    a: "No. The case runs on an open-source CFD solver on our machine. You need a browser and a Coreframe account with wallet balance.",
  },
  {
    q: "Do I need a Coreframe account?",
    a: "Yes. Sign up with your email and a WhatsApp code to your mobile, the same account and wallet as GPU workstations and Studio. Your name, email and number come from the account, so the form does not ask for them again.",
  },
  {
    q: "What does it cost to start?",
    a: "Pre-processing / mesh check is ₹599 for most duct and pipe models and ₹1,499 for very large models (over 5 million cells), paid from your Coreframe wallet. We check your geometry, build a wall-resolved mesh and verify its quality; your exact run price comes with it. The size is estimated from your STL before you pay, so you see which price applies on your job page. You get a one-page mesh report and a quote with packages. Pre-processing is a separate charge for that work and is not deducted from the run. You pay for the run only if you accept the quote. The quoted amount is held in your wallet, you are charged for what the run actually used, and the rest goes back to your wallet.",
  },
  {
    q: "Do you offer CFD meshing as a service?",
    a: "Not as a separate product. Meshing is part of pre-processing / mesh check (₹599 for most models): we build a wall-resolved mesh of your geometry, run a mesh quality check on it and send you a one-page Mesh report with your exact run price. The mesh files themselves come in the case download after a run, in an open format.",
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
    a: `For ducts and pipes: heat transfer, buoyancy, transient flow, multiphase, moving or rotating parts, compressible flow and more than one inlet. Air and water only. Rooms with heat loads and buoyancy are a separate service (Rooms / HVAC): one box-shaped room you describe, steady analysis. ${ROOMS_VALIDATION}`,
  },
  {
    q: "I have a straight duct but no CAD. Can I still submit?",
    a: "Yes. Tick 'Straight duct, no STL' in the form and give its length, width and height. Then choose 'use my dimensions' on your job page.",
  },
  {
    q: "Is my geometry kept private?",
    a: "Your job belongs to your Coreframe account. Its page, results and files open only when you are signed in to that account; the links in our emails take you to the job page, which asks you to sign in first.",
  },
];

/** The mesh-independence answer; only the price differs by currency. */
function verifiedFaq(cur: Currency): string {
  return `Yes, with the Verified package (${verifiedFrom(cur)}): a mesh-independence study that runs your case on three meshes, coarse, medium and fine, and reports the grid convergence index (GCI) on the pressure drop, for example "Mesh-independent: static pressure drop = 12.30 Pa ± 0.13 % (fine mesh)". Internal flow up to about ${VERIFIED.maxMcells} million cells, results within ${VERIFIED.deliveryHours} hours. ${VERIFIED.meaning} The Draft and Standard packages run one wall-resolved mesh that has passed our mesh quality check.`;
}


const PACKAGES_Q = "What are the Draft, Standard and Verified packages?";

/** Draft / Standard / Verified / Express in one answer, in the page's currency. */
function packagesFaq(cur: Currency): string {
  return `Three packages, shown on your quote after the mesh check. Draft is the cheaper one, for comparing design options early; Standard is the number you put in a client report. Both run your case on one wall-resolved mesh that has passed our mesh quality check; Standard holds the pressure to a tighter convergence target than Draft. Both are priced on your quote. Verified is Standard on three meshes with a ± band: it reports the grid convergence index, ${verifiedFrom(cur)}. Express, results in ${CFD_EXPRESS.hours} hours at ${CFD_EXPRESS.multiple}x the price, is offered on Draft and Standard where the model fits.`;
}

/**
 * The FAQ for this copy of the page, in its currency only (owner, 18 Oct
 * 2026). The cost answer ends with the page's one line on the other
 * currency: the policy, never its prices.
 */
function faqFor(cur: Currency, u: UsdRateCard): { q: string; a: string }[] {
  const base = cur === "USD" ? usdFaq(u) : FAQ;
  const other = ` ${otherCurrencyLine(cur)}`;
  const out: { q: string; a: string }[] = [];
  for (const f of base) {
    out.push(f.q === "What does it cost to start?" ? { q: f.q, a: f.a + other } : f);
    if (f.q === "Do you check mesh independence?") out.push({ q: PACKAGES_Q, a: packagesFaq(cur) });
  }
  return out;
}

/**
 * The CFD Service node, the same on both copies of the page: offers in INR
 * (India) and USD (everywhere else), the Verified floor, and Express as an
 * add-on (SEO review 18 Oct 2026, 3.1). Same @id as the layout's node, so the
 * two merge. No Draft / Standard prices: they are on the quote.
 */
function serviceLdFor(u: UsdRateCard, cur: Currency) {
  const url = `${SITE}/cfd`;
  const cells = cellsLabel(u.cfd_quote_fee_small_max_cells);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE}/#cfd-service`,
    name: "CFD for ducts and pipes",
    serviceType: "Computational fluid dynamics, internal flow pressure drop",
    provider: { "@id": ORG_ID },
    areaServed: AREA_SERVED_WORLD,
    url,
    description:
      "Automatic CFD internal-flow runs for ducts, pipes, bends, reducers, valves and fittings from one closed STL: pressure drop, loss coefficient, PDF report, 3D results viewer and data files. Rooms and HVAC airflow (steady) from a room you describe.",
    offers: [
      ...regionalOffers({
        name: "Pre-processing / mesh check",
        inr: CFD_PREPROCESS_INR.small,
        usd: u.cfd_quote_fee_small,
        url,
        description: `For most duct and pipe models. Geometry check, wall-resolved mesh and mesh-quality check, with a mesh report and the exact run price. Very large models (over ${cells} cells) are ${cur === "USD" ? formatMoney(u.cfd_quote_fee_large, "USD") : formatMoney(CFD_PREPROCESS_INR.large, "INR")}. The run is quoted separately and paid only if you accept.`,
      }),
      ...regionalOffers({
        name: "Verified: mesh-independence study (GCI)",
        inr: VERIFIED_INR_ALL_IN.from,
        usd: VERIFIED.fromUsd,
        url: `${SITE}${VERIFIED.path}`,
        from: true,
        description: `Three meshes and the grid convergence index on the pressure drop, ${verifiedFrom(cur)}. Results within ${VERIFIED.deliveryHours} hours.`,
      }),
      {
        "@type": "Offer",
        name: "Express delivery (add-on)",
        url,
        category: "Add-on",
        description: `Results in ${CFD_EXPRESS.hours} hours of payment at ${CFD_EXPRESS.multiple}x the price of the same package (Draft or Standard), where the quote offers it. Normal delivery: within ${CFD_NORMAL_HOURS} hours.`,
      },
    ],
  };
}

/** The pre-processing sentences for a visitor outside India. Run prices are never shown; runs are quoted after the mesh. */
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
          title: `Pay for pre-processing / mesh check (${small} for most models)`,
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
      ? { q: f.q, a: f.a.replace("₹599 for most models", `${small} for most models`) }
      : f.q === "What does it cost to start?"
      ? {
          q: f.q,
          a: `Pre-processing / mesh check is ${small} for most duct and pipe models and ${large} for very large models (over ${cells} cells), paid from your Coreframe wallet. We check your geometry, build a wall-resolved mesh and verify its quality; your exact run price comes with it. The size is estimated from your STL before you pay, so you see which price applies on your job page. You get a one-page mesh report and a quote with packages. Pre-processing is a separate charge for that work and is not deducted from the run. Runs are quoted in US dollars after the mesh is built, and you pay for the run only if you accept the quote. The quoted amount is held in your wallet, you are charged for what the run actually used, and the rest goes back to your wallet.`,
        }
      : f,
  );
}

/** The package table (SEO review 18 Oct 2026, 3.1). Draft and Standard prices are on the quote, never here. Draft is the API's "quick" package (renamed by the owner, 19 Oct 2026). */
function packageRows(cur: Currency, u: UsdRateCard): [string, string, string, Figure, Figure][] {
  const fee = cur === "USD" ? formatMoney(u.cfd_quote_fee_small, "USD") : formatMoney(CFD_PREPROCESS_INR.small, "INR");
  const onQuote: Figure = { figure: "On your quote", after: `after the ${fee} mesh check` };
  const day: Figure = { pre: "within", figure: `${CFD_NORMAL_HOURS} h`, after: "or Express" };
  return [
    ["Draft", "1", "Cheaper, for comparing design options early. Pressure drop, loss coefficient, PDF report, 3D viewer, data files; default residual targets (10⁻³)", day, onQuote],
    ["Standard", "1", "The number you put in a client report. As Draft, with a tighter pressure target (10⁻⁴) and a longer iteration budget", day, onQuote],
    ["Verified", "3 + GCI", "Standard on three meshes, with a ± band. Mesh-independence study: three meshes, the grid convergence index and a one-line verdict", { pre: "within", figure: `${VERIFIED.deliveryHours} h`, after: "no Express" }, { pre: "from", figure: verifiedFromAmount(cur) }],
    ["Express", "—", "A delivery speed on Draft or Standard, where your quote offers it (smaller steady runs)", { figure: `${CFD_EXPRESS.hours} h` }, { figure: `${CFD_EXPRESS.multiple}×`, after: "the package price" }],
  ];
}

export default async function CfdView({ currency }: { currency: Currency }) {
  const usdView = currency === "USD";
  // One currency per copy (owner, 18 Oct 2026). The dollar fees are the rate
  // card's `usd` block; the INR fee is the published one in lib/cfd-prices.ts.
  const card = usdRates(await getRateCard());
  const usd = usdView ? card : null;
  const usdText = usd ? usdCopy(usd) : null;
  const steps = usd ? usdSteps(usd) : STEPS;
  const faq = faqFor(currency, card);
  const packages = packageRows(currency, card);
  const tiles = cfdServiceTiles(currency, card);
  const post = getVisiblePost(VERIFICATION_POST_SLUG);
  const handCalc = getVisiblePost(HAND_CALC_POST_SLUG);
  return (
    <div className="cfx-paper relative min-h-screen text-ink" data-usd-view={usdView ? "" : undefined}>
      <JsonLd data={breadcrumbList([{ name: "CFD for ducts and pipes", path: "/cfd" }])} />
      <JsonLd data={faqPage(faq)} />
      <JsonLd data={serviceLdFor(card, currency)} />
      <JsonLd data={howTo("How to get the pressure drop of a duct or pipe from one STL", steps, { url: `${SITE}/cfd` })} />
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
              {/* Answer-first (SEO review 18 Oct 2026, 3.1): price, turnaround and
                  deliverables in one quotable passage, in the page's currency. */}
              <p className="cf-lead mt-5 max-w-[52ch]">
                Coreframe CFD calculates the pressure drop and loss coefficient of a duct or pipe fitting from a single STL
                file. Pre-processing and a mesh check cost {preprocessFee(currency, card)} for most models; you then
                accept a quote for the run and get a PDF report, a 3D viewer and the data files within {CFD_NORMAL_HOURS}{" "}
                hours, or in {CFD_EXPRESS.hours} hours with Express at {CFD_EXPRESS.multiple}× the price.
              </p>
              <p className="mt-3 max-w-[52ch] text-[15px] leading-6 text-ink-2">
                The solver runs on our side, so you need no CFD licence. {preprocessLarge(currency, card)}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#start" className="cf-btn-primary">Start a job</a>
                <a href="#sample" className="cf-btn-secondary">See a sample report</a>
              </div>
              <p className="cfx-quiet mt-6">
                <a href="#right">How we know the answer is right ↓</a>
              </p>
              <PageByline path={CFD_HOME.path} className="mt-4 text-ink-3" />
            </div>
          </div>
          {/* After the text on purpose: below 900px the sketch flows under it. */}
          <PageHeroBg image={CFD_HERO} />
        </section>

        {/* ── CFD services (sub-categories) ────────────────────────────────
            Owner, 13 Oct 2026: the sub-categories live here, not in the
            homepage hero. Only real ones: ducts and pipes, and rooms and HVAC
            airflow (steady tier, released 17 Oct 2026 with lib/cfd-rooms.ts). The bring-your-own-solver page was retired 13 Oct 2026. */}
        <section id="services" className="cf-section scroll-mt-20 px-5">
          <div className="cf-wide">
            <p className="cf-eyebrow">CFD services</p>
            <h2 className="cf-section-title mt-4">Pick what you need to run.</h2>
            <div className="mt-9">
              <ServiceTiles tiles={tiles} variant="overview" />
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
            <ol data-cf-steps="" className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
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
              Before any run, we check your geometry, build a wall-resolved mesh and run a mesh quality check on it. You get a one-page Mesh report and the exact price of the
              pressure drop simulation, for {usdText ? usdText.small : formatMoney(CFD_PREPROCESS_INR.small, "INR")} on most models.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {[
                ["Geometry check", "A closed solid, believable units, and the flat openings that become the inlet and outlets, with their areas and hydraulic diameters. You confirm the inlet."],
                ["Wall-resolved mesh", "CFD mesh generation with prism layers at the walls sized for y+ ≈ 1. Where those layers cannot cover enough of the wall, we fall back to layers for wall functions, and the report says so."],
                ["Mesh quality check", "A quality check on every mesh: non-orthogonality, skewness and negative cell volumes against our limits, plus the wall-layer coverage. A mesh that fails is not quoted."],
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
                  ["Rooms", "One box-shaped room with diffusers, returns and heat loads: steady analysis, room averages and temperature and air-speed maps"],
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
                On our own 90° bend test, three meshes from 0.25 to 1.21 million cells gave 12.234, 12.292 and 12.297 Pa:
                mesh-independent, 12.30 Pa ± 0.13 %.
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

        {/* ── Packages (SEO review 18 Oct 2026, 3.1): Draft (then "Quick") and Standard were
            named only inside the FAQ. Their prices are on the quote, never here. */}
        <section id="packages" className="cf-section scroll-mt-20 px-5 pt-0">
          <div className="cf-wide">
            <p className="cf-eyebrow">Packages</p>
            <h2 className="cf-section-title mt-4">Draft, Standard, Verified, and Express when you need it fast.</h2>
            {/* phones: one card per package, so turnaround and price are on screen (owner, 19 Oct 2026) */}
            <ul className="mt-8 space-y-4 sm:hidden">
              {packages.map(([name, meshes, what, when, price]) => (
                <li key={name} className="rounded-[6px] border-[1.5px] border-ink bg-paper p-5">
                  <p className="font-semibold text-ink">
                    {name} <span className="font-normal text-ink-3">· {meshes === "—" ? "a delivery speed" : meshes === "1" ? "1 mesh" : meshes.replace(/^3 \+ /, "3 meshes + ")}</span>
                  </p>
                  <p className="mt-2 text-[14.5px] leading-6 text-ink-2">{what}</p>
                  <div className="cfx-figs mt-4">
                    <CfxFigure size="sm" label="Turnaround" tone="coral" {...when} />
                    <CfxFigure size="sm" label="Price" {...price} />
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 hidden overflow-x-auto rounded-[6px] border-[1.5px] border-ink bg-paper sm:block">
              <table className="w-full min-w-[720px] border-collapse text-left text-[14.5px] leading-6 text-ink-2">
                <thead>
                  <tr>
                    {["Package", "Meshes", "What you get", "Turnaround", "Price"].map((h) => (
                      <th key={h} scope="col" className="px-4 py-3 font-mono text-[12px] font-normal tracking-[0.12em] text-ink-3 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {packages.map(([name, meshes, what, when, price]) => (
                    <tr key={name} className="border-t border-rule align-top">
                      <th scope="row" className="px-4 py-3 font-semibold text-ink">{name}</th>
                      <td className="px-4 py-3">{meshes}</td>
                      <td className="px-4 py-3">{what}</td>
                      <td className="px-4 py-3"><CfxFigure size="sm" tone="coral" {...when} /></td>
                      <td className="px-4 py-3"><CfxFigure size="sm" {...price} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[14px] leading-6 text-ink-3">
              Rooms and HVAC airflow jobs are quoted the same way, with a Draft or Fine mesh:{" "}
              <Link href={HVAC_PAGE.path} className="underline underline-offset-4">room airflow CFD for HVAC</Link>.
            </p>
          </div>
        </section>

        {/* ── Cost ─────────────────────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cfx-panel cf-wide rounded-[6px] p-6 sm:p-10">
            <p className="cfx-eyebrow">What it costs to start</p>
            <h2 className="cf-section-title mt-4">
              {/* the price on the watercolour wash (owner, 19 Oct 2026) */}
              <span className="cfx-fig">
                <span className="cfx-fig-num cfx-fig-num--inherit">{usdText ? usdText.small : formatMoney(CFD_PREPROCESS_INR.small, "INR")}</span>
              </span>{" "}
              for pre-processing / mesh check.
            </h2>
            <p className="mt-3 text-[15px] leading-6 text-ink-2">
              {preprocessFee(currency, card)} for most models. {preprocessLarge(currency, card)}
            </p>
            <ul className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {[
                usdText
                  ? ["Pre-processing / mesh check", `${usdText.small} for most duct and pipe models; ${usdText.large} for very large models (over ${usdText.cells} cells). Paid from your Coreframe wallet. We check your geometry, build a wall-resolved mesh and verify its quality; your exact run price comes with it.`]
                  : ["Pre-processing / mesh check", `${formatMoney(CFD_PREPROCESS_INR.small, "INR")} for most duct and pipe models; ${formatMoney(CFD_PREPROCESS_INR.large, "INR")} for very large models (over ${cellsLabel(CFD_PREPROCESS_INR.smallMaxCells)} cells). Paid from your Coreframe wallet. We check your geometry, build a wall-resolved mesh and verify its quality; your exact run price comes with it.`],
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
              Rejected before meshing: no charge. Pre-processing that fails on our side: the charge goes back to your wallet. An
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
              <h2 className="cf-section-title mt-4">Choose the service, then tell us the flow.</h2>
              <p className="cf-section-copy mt-3">
                A few fields and a file, from your Coreframe account. Your name, email and WhatsApp number come from the
                account, and pre-processing is paid from its wallet on your job page.
              </p>
            </div>
            {/* Owner, 19 Oct 2026: the three tiles are the way to choose (they replaced the form's tabs). */}
            <div className="mt-8">
              <ServiceTiles tiles={tiles} variant="picker" />
            </div>
            <div id="cfd-form" className="mx-auto mt-8 max-w-[720px] scroll-mt-20">
              <CfdStart currency={currency} />
            </div>
          </div>
        </section>

        {/* ── Further reading (SEO review 18 Oct 2026: link every CFD page) ── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-col">
            <p className="cf-eyebrow">Further reading</p>
            <ul className="mt-4 space-y-2 text-[15.5px] leading-6">
              <li>
                <Link href={VERIFIED.path} className="text-ink underline underline-offset-4">Mesh independence study (GCI): a worked example on our bend</Link>
              </li>
              <li>
                <Link href={HVAC_PAGE.path} className="text-ink underline underline-offset-4">Room airflow CFD for HVAC: comfort, ADPI and draught</Link>
              </li>
              <li>
                <Link href={CLINIC_CASE.path} className="text-ink underline underline-offset-4">Case study: HVAC CFD on a clinic floor with 90 diffusers</Link>
              </li>
              {handCalc ? (
                <li>
                  <Link href={`/blog/${handCalc.slug}`} className="text-ink underline underline-offset-4">{handCalc.title}</Link>
                </li>
              ) : null}
              {post ? (
                <li>
                  <Link href={`/blog/${post.slug}`} className="text-ink underline underline-offset-4">{post.title}</Link>
                </li>
              ) : null}
              <li>
                <Link href="/tools" className="text-ink underline underline-offset-4">Free IFC checker: find what breaks a CFD conversion</Link>
              </li>
              <li>
                <Link href="/software/gpu-workstation-rental-india" className="text-ink underline underline-offset-4">Running your own CFD software? Rent an RTX 5080 workstation</Link>
              </li>
            </ul>
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
