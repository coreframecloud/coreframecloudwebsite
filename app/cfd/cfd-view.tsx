import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { OG_IMAGE, breadcrumbList } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Fold } from "@/components/visuals/fold";
import CfdStart from "./cfd-start";
import { StatusBadge } from "@/components/home/redesign/offerings";
import { getRateCard } from "@/lib/rate-card";
import { cellsLabel, formatMoney, usdRates, type Currency, type UsdRateCard } from "@/lib/money";

/**
 * /cfd — CFD for ducts and pipes (managed, automatic). Live 13 Oct 2026.
 *
 * Until 13 Oct this page was a six-step brief for "we size a GPU workstation,
 * you bring the solver licence". The product behind it is now the automatic
 * duct/pipe service in the control plane (apps/api/app/api/cfd_jobs.py):
 * one closed binary STL -> automatic geometry check -> quote fee from the
 * wallet -> mesh on our machine -> emailed quote -> pay from the wallet ->
 * OpenFOAM run -> PDF report, 3D viewer and data files.
 *
 * Claims on this page are only the ones cfd-runner/RUNBOOK.md supports:
 *   - straight-pipe friction factor within about 1-5 % of Haaland/Colebrook;
 *   - wall layers at y+ ~ 1 by default;
 *   - every run is judged against residual targets, and a run that did not
 *     converge is delivered marked provisional.
 * Do NOT add a bend / fitting K accuracy figure (about +-25 % today), package
 * prices or anything about how quotes are priced.
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
 * copy shows the quote fee from the rate card's `usd` block with no GST and
 * says runs are quoted in US dollars after the mesh, never a run price.
 */

export const cfdMetadata: Metadata = {
  title: "Duct and Pipe CFD: Pressure Drop from One STL",
  description:
    "Upload one STL of your duct or pipe and get a quote by email. Then a PDF report, a 3D results viewer and the OpenFOAM data. No CFD licence needed.",
  keywords: [
    "CFD pressure drop duct",
    "pipe pressure drop CFD India",
    "duct CFD analysis service",
    "loss coefficient CFD",
    "OpenFOAM CFD service India",
    "CFD for final year project",
    "HVAC duct CFD consultant",
  ],
  alternates: { canonical: "/cfd" },
  openGraph: {
    images: [OG_IMAGE],
    title: "CFD for ducts and pipes — Coreframe Cloud",
    description:
      "One STL in. Pressure drop, loss coefficient, a PDF report, a 3D viewer and the data files out. OpenFOAM on our machine, no licence on yours.",
    url: "https://www.coreframecloud.com/cfd",
  },
};

const CFD_SERVICES: {
  name: string;
  status: "Live" | "Coming soon";
  body: string;
  href?: string;
  cta: string;
  tint: string;
}[] = [
  {
    name: "Ducts and pipes",
    status: "Live",
    body: "Bends, reducers, transitions, valves, fittings and manifolds. Upload one STL; we mesh it, email a quote, and deliver pressure drop, loss coefficient, a PDF report, a 3D viewer and the data files.",
    href: "#start",
    cta: "Start a job",
    tint: "bg-tint-mint",
  },
  {
    name: "Rooms and HVAC airflow",
    status: "Coming soon",
    body: "Room air movement and comfort for HVAC designers. We release it only once it passes our validation cases, so the numbers are ones you can hand on. See a first pass on a real clinic floor: 90 diffusers, 100 rooms.",
    href: "/cfd/projects/clinic-floor-hvac",
    cta: "See it on a real building",
    tint: "bg-tint-blue",
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
    title: "Pay the quote fee (₹599 incl. GST for most models). We mesh it and email the quote",
    body: "We build the real mesh on our machine, with wall layers, and email you a quote with packages to choose from.",
  },
  {
    title: "Accept, pay from your wallet, get the results",
    body: "Normal: results within 24 hours. Express: results in 1–2 hours at 3x the price, where your quote offers it. You get a PDF report, a 3D results viewer and the data files.",
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
    a: "The quote fee is ₹599 (incl. GST) for most duct and pipe models and ₹1,499 for very large models (over 5 million cells), paid from your Coreframe wallet. The size is estimated from your STL before you pay, so you see which fee applies on your job page. For that we build the real mesh of your geometry and email you a quote with packages. You pay for the run only if you accept the quote. The quoted amount is held in your wallet, you are charged for what the run actually used, and the rest goes back to your wallet.",
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
    a: "It is rejected automatically, before any meshing, with the reason and what to change. You are not charged for a rejection, and a quote fee already paid for that job goes back to your wallet.",
  },
  {
    q: "What can you not run yet?",
    a: "Heat transfer, buoyancy, transient flow, multiphase, moving or rotating parts, compressible flow and more than one inlet. Air and water only. Rooms and HVAC comfort studies are coming soon.",
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
    name: "Quote fee (mesh and quote)",
    price: "599",
    priceCurrency: "INR",
    valueAddedTaxIncluded: true,
    description: "Including GST, for most duct and pipe models. Very large models (over 5 million cells): ₹1,499 including GST. Paid from the Coreframe wallet. The run is quoted separately and paid only if you accept.",
  },
};

/** The quote-fee sentences for a visitor outside India. No GST: an export of
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
          title: `Pay the quote fee (${small} for most models, no GST). We mesh it and email the quote`,
          body: "We build the real mesh on our machine, with wall layers, and email you a quote in US dollars with packages to choose from.",
        }
      : s,
  );
}

function usdFaq(u: UsdRateCard) {
  const { small, large, cells } = usdCopy(u);
  return FAQ.map((f) =>
    f.q === "What does it cost to start?"
      ? {
          q: f.q,
          a: `The quote fee is ${small} for most duct and pipe models and ${large} for very large models (over ${cells} cells), paid from your Coreframe wallet, with no GST (export of services). The size is estimated from your STL before you pay, so you see which fee applies on your job page. For that we build the real mesh of your geometry and email you a quote with packages. Runs are quoted in US dollars after the mesh is built, and you pay for the run only if you accept the quote. The quoted amount is held in your wallet, you are charged for what the run actually used, and the rest goes back to your wallet.`,
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
      name: "Quote fee (mesh and quote)",
      price: String(u.cfd_quote_fee_small),
      priceCurrency: "USD",
      valueAddedTaxIncluded: false,
      description: `For most duct and pipe models; no GST (export of services). Very large models (over ${cells} cells): ${large}. Paid from the Coreframe wallet. The run is quoted separately in US dollars and paid only if you accept.`,
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
    <div className="relative min-h-screen text-ink" data-usd-view={usdView ? "" : undefined}>
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
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="cf-section px-5 cf-pagehero">
          <div className="cf-wide grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
            <div className="min-w-0">
              <p className="cf-eyebrow">CFD for ducts and pipes · Live</p>
              <p className="mt-5 font-heading text-[22px] leading-tight font-medium sm:text-[26px]">Slow CFD? Try us.</p>
              <h1 className="cf-display mt-3">Pressure drop for your duct or pipe, from one STL.</h1>
              <p className="cf-lead mt-5">
                Upload the geometry. We check it, mesh it on our machine and email you a quote. Accept it and you get a
                PDF report, a 3D results viewer and the data files, with the pressure drop and the loss coefficient.
                OpenFOAM runs on our side, so you need no CFD licence.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#start" className="cf-btn-primary">Start a job</a>
                <a href="#sample" className="cf-btn-secondary">See a sample report</a>
              </div>
              {usdText ? (
                <p className="mt-6 text-[14px]">
                  {usdText.small} quote fee (no GST — export of services) for most duct and pipe models; {usdText.large} for
                  very large models (over {usdText.cells} cells). Runs are quoted in US dollars after the mesh is built; pay
                  for the run only if you accept the quote.
                </p>
              ) : (
              <p className="mt-6 text-[14px]">
                ₹599 quote fee (incl. GST) for most duct and pipe models; ₹1,499 for very large models (over 5 million cells). Pay for the run only if you accept the quote.
              </p>
              )}
            </div>
            <figure className="min-w-0 overflow-hidden rounded-[24px] bg-white p-3 sm:p-4">
              <Image
                src="/cfd/bend-slice-U-zoom.webp"
                alt="Velocity magnitude on the mid-plane of a 90 degree pipe bend, from a Coreframe CFD run"
                width={1329}
                height={889}
                sizes="(max-width: 1024px) 100vw, 460px"
                preload
                className="h-auto w-full"
              />
              <figcaption className="mt-2 px-1 text-[12.5px] leading-5 !text-ink-3">
                Velocity through a 90° bend, water at 4 m/s, from one of our own test runs.
              </figcaption>
            </figure>
          </div>
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

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide rounded-[28px] bg-tint-blue p-6 sm:p-10">
            <p className="cf-eyebrow">How it works</p>
            <h2 className="cf-section-title mt-4">Four steps, all automatic.</h2>
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
                  ["Coming soon", "Rooms and HVAC comfort"],
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

        {/* ── Accuracy ─────────────────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide grid gap-6 md:grid-cols-3">
            {[
              ["Checked against the textbook", "In a straight pipe, our friction factor matched the Haaland/Colebrook correlation to about 1–5 %."],
              ["Wall-resolved by default", "Prism layers sized for y+ ≈ 1, so the boundary layer is resolved, and the report shows the y+ you actually got."],
              ["Converged, or told so", "Each run is judged against residual targets. If it did not converge, the report carries a provisional warning and you can continue it."],
            ].map(([t, b]) => (
              <div key={t} className="cf-card">
                <p className="cf-card-label">{t}</p>
                <p className="cf-section-copy">{b}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Cost ─────────────────────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide rounded-[28px] bg-night p-6 text-white sm:p-10">
            <p className="cf-eyebrow !bg-white/10 !text-white">What it costs to start</p>
            <h2 className="cf-section-title mt-4 !text-white">
              {usdText ? `${usdText.small} for the mesh and the quote.` : "₹599 incl. GST for the mesh and the quote."}
            </h2>
            <ul className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {[
                usdText
                  ? ["Quote fee", `${usdText.small} for most duct and pipe models; ${usdText.large} for very large models (over ${usdText.cells} cells). No GST (export of services). Paid from your Coreframe wallet. For it we build the real mesh of your geometry.`]
                  : ["Quote fee", "₹599 incl. GST for most duct and pipe models; ₹1,499 for very large models (over 5 million cells). Paid from your Coreframe wallet. For it we build the real mesh of your geometry."],
                usdText
                  ? ["Quote by email", "Runs are quoted in US dollars after the mesh is built: packages to choose from, each with its iteration budget and convergence targets."]
                  : ["Quote by email", "Packages to choose from, each with its iteration budget and convergence targets."],
                ["Pay only if you accept", "Nothing runs, and nothing more is charged, until you pay the quote."],
                ["Normal or express", "Normal: results within 24 hours. Express: results in 1–2 hours at 3x the price, where the quote offers it."],
                ["Held, then settled", "The quote is held in your wallet; you are charged for what the run used and the rest comes back."],
              ].map(([t, b]) => (
                <li key={t} className="min-w-0 border-t border-white/15 pt-4">
                  <p className="font-semibold">{t}</p>
                  <p className="mt-1 text-[15px] leading-6 text-white/70">{b}</p>
                </li>
              ))}
            </ul>
            {usdText ? (
              <p className="mt-7 text-[14px] leading-6 text-white/60">
                Rejected before meshing: no charge. A quote that fails on our side: the fee goes back to your wallet. An
                invoice in US dollars on every payment.
              </p>
            ) : (
            <p className="mt-7 text-[14px] leading-6 text-white/60">
              Rejected before meshing: no charge. A quote that fails on our side: the fee goes back to your wallet. GST
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
                account, and the quote fee is paid from its wallet on your job page.
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
