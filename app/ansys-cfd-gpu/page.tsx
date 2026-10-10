import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbList } from "@/lib/seo";
import { BackgroundGlow } from "@/components/home/background-glow";
import Link from "next/link";
import { NODE, WORKSTATION_REPLACEMENT_COST } from "@/lib/node-spec";

export const metadata: Metadata = {
  title: "GPU Workstations for CFD, by the Hour",
  description:
    "Rent an RTX GPU workstation by the hour for Ansys Fluent, OpenFOAM or your own CFD solver. You bring the licence and engineering; INR billing, GST invoice.",
  keywords: [
    "Ansys CFD cloud GPU India",
    "GPU CFD simulation India",
    "Ansys Fluent GPU cloud",
    "CFD cloud computing India",
    "GPU workstation rental CFD India",
    "bring your own licence CFD GPU",
  ],
  alternates: { canonical: "/ansys-cfd-gpu" },
};

/**
 * Hardware comes from lib/node-spec. This page used to state "16 GB RTX 5080"
 * in three places in prose and once more in structured data, which is four
 * chances to disagree with the fleet.
 */
const SPECS: [string, string][] = [
  ["GPU", NODE.gpu],
  ["VRAM", `${NODE.vram} · ${NODE.memoryBandwidth}`],
  ["System RAM", NODE.ram],
  ["CPU", NODE.cpu],
  ["Disk", NODE.disk],
  ["OS", NODE.os],
  ["Access", `Coreframe Connect app, streamed at ${NODE.stream}`],
  ["Location", NODE.location],
];

const whyGpu = [
  {
    title: "Where a GPU solver helps",
    body: "Ansys Fluent has a native GPU solver that moves pressure-based steady and transient solving onto the card. OpenFOAM is a different case: only the linear solve goes to the GPU, and meshing, matrix assembly and I/O stay on the CPU. We don't publish a speedup figure, ours or anyone else's, because none of them were measured on your mesh. Benchmark it on a short booking.",
  },
  {
    title: "VRAM sets your mesh ceiling",
    body: `VRAM is the hard ceiling. Ansys's own figures are roughly 1.0 to 1.9 GB per million tet or hex cells and 1.8 to 2.8 GB per million polyhedral cells. On this card's ${NODE.vram} that's about 8 million tet cells or 5 million polyhedral, and a mesh-independence study needs the same case two or three times over. Tell us your cell count and we'll tell you straight whether it fits.`,
  },
  {
    title: "Memory bandwidth, not clock speed",
    body: `Each solver iteration moves the full mesh state across memory, over and over. This card runs at ${NODE.memoryBandwidth}, and for an iterative solve that figure matters far more than the core clock.`,
  },
  {
    title: "No idle machine on the books",
    body: `A workstation of this class lands at about ${WORKSTATION_REPLACEMENT_COST} in India, and CFD work is bursty: a fortnight of solving, then a month of post-processing on a laptop. Renting by the hour means you pay for the hours the solver actually runs, on a machine you don't have to house, insure or depreciate.`,
  },
];

const useCases = [
  { label: "Wind engineering", desc: "Building façade wind loads, urban wind comfort, cladding pressure coefficients" },
  { label: "External aerodynamics", desc: "Drag, lift and wake analysis for aerospace and automotive" },
  { label: "Thermal and HVAC", desc: "Data centre cooling, cleanroom airflow, indoor thermal comfort to ASHRAE" },
  { label: "Internal flow", desc: "Pipe networks, heat exchangers, pumps, valves, mixing" },
  { label: "Combustion", desc: "Burner design, furnace modelling, reacting flow" },
  { label: "Electronics cooling", desc: "PCB thermal management, server rack CFD, junction temperature prediction" },
];

const pricingTiers = [
  {
    label: "Validation",
    elements: "Up to 2 M elements",
    useFor: "Concept checks, quick parameter sweeps",
  },
  {
    label: "Engineering",
    elements: "2 M to 20 M elements",
    useFor: "Design validation, steady-state RANS",
  },
  {
    label: "Industrial",
    elements: "20 M to 80 M elements",
    useFor: "Full-scale external aero, large HVAC, wind tunnel",
  },
  {
    label: "Large scale",
    elements: "80 M to 200 M elements",
    useFor: "Complex multi-physics, LES, transient, parametric campaigns",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Does Ansys Fluent support GPU acceleration?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Ansys Fluent has a dedicated GPU solver, available since Ansys 2022 R1, that offloads pressure-based steady and transient solving to NVIDIA GPUs through CUDA. How much it helps depends on the case and on the solver: in OpenFOAM only the linear solve moves to the GPU, while matrix assembly and I/O stay on the CPU, so a share of the wall-clock time is untouched by the card. Ansys also tests and supports professional cards rather than the GeForce hardware we currently run. We don't publish a speedup figure, ours or anyone else's, because none of them were measured on your mesh. Benchmark it on a short booking before you plan a deadline around it.",
      },
    },
    {
      "@type": "Question",
      name: "How large a mesh can you run?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `Ansys publishes roughly 1.0-1.9 GB of GPU memory per million tet or hex cells and 1.8-2.8 GB per million polyhedral cells. Our current card is a ${NODE.gpu} with ${NODE.vram}, which works out at about 8 million tet cells or 5 million polyhedral, with less headroom again if you're running a mesh-independence study. A larger mesh needs a bigger card than we currently offer. Tell us your cell count and we'll say so before you book, not after.`,
      },
    },
    {
      "@type": "Question",
      name: "Do I need my own Ansys licence?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We rent hardware, not software. You bring your own Ansys, Siemens or other commercial licence, or use an open-source solver such as OpenFOAM or SU2. We aren't an Ansys reseller and have no licence-supply arrangement with any CFD vendor. Check your own licence terms for remote or hosted use before you book. That's between you and your vendor, and we'd rather you confirm it than assume.",
      },
    },
    {
      "@type": "Question",
      name: "What hardware would my solver run on?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `A ${NODE.gpu} with ${NODE.vram} at ${NODE.memoryBandwidth}, ${NODE.ram} of system memory, ${NODE.cpu} and ${NODE.disk}, running ${NODE.os} in ${NODE.location}. One customer per node, and you reach it through the Coreframe Connect app rather than a remote desktop.`,
      },
    },
    {
      "@type": "Question",
      name: "How is pricing calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Hourly, for the workstation, billed in INR with a GST invoice. You're renting a machine and running your own solver on it, so the cost depends on how long you use it, not on your mesh size. Contact us for the current rate.",
      },
    },
  ],
};

export default function AnsysCfdPage() {
  const wa = (msg: string) =>
    `https://wa.me/916366889488?text=${encodeURIComponent(msg)}`;

  return (
    <div className="relative min-h-screen text-ink">
      <JsonLd data={breadcrumbList([{ name: "GPU workstations for CFD", path: "/ansys-cfd-gpu" }])} />
      <BackgroundGlow />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="relative">
        <section className="cf-section px-5">
          <div className="cf-col">
            <p className="cf-eyebrow mb-5">CFD · Ansys · Bring your own licence</p>
            <h1 className="cf-display">
              GPU workstations for CFD.
              <br className="hidden md:block" /> By the hour.
            </h1>
            <p className="cf-lead mt-[22px]">
              Rent an RTX-class GPU workstation by the hour and run Ansys Fluent,
              OpenFOAM or whichever solver you&rsquo;re licensed for. The
              engineering and the licence stay yours. We provide the machine,
              billed in INR with a GST invoice.
            </p>
            <p className="cf-section-copy mt-5">
              We don&rsquo;t run your simulation, pick your turbulence model or
              interpret your results. This is hardware rental, and the
              engineering, along with responsibility for it, stays with you.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/cfd-intake" className="cf-btn-primary">
                Submit a CFD job
              </a>
              <a href="/tools" className="cf-btn-secondary">
                Check an IFC model
              </a>
              <a
                href={wa("Hi Coreframe, I'd like to discuss GPU CFD simulation for my Ansys project.")}
                target="_blank"
                rel="noreferrer"
                className="cf-btn-secondary"
              >
                WhatsApp us
              </a>
            </div>

            <div className="cf-note mt-8">
              <p className="cf-section-copy">
                Before you book anything: our{" "}
                <Link href="/tools" className="text-blue underline underline-offset-4">
                  free IFC pre-CFD check
                </Link>{" "}
                reads a model export and reports the things that will break the
                conversion: doors that lost their openings, missing spaces, wrong
                units, storeys that won&rsquo;t resolve. There&rsquo;s no signup,
                and the file is deleted as soon as it&rsquo;s read. Finding these
                after handover costs a week.
              </p>
            </div>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <h2 className="cf-section-title">Why a GPU matters for CFD.</h2>
            <div className="mt-9 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {whyGpu.map((w) => (
                <div key={w.title} className="cf-card">
                  <p className="cf-card-label">{w.title}</p>
                  <p className="cf-section-copy">{w.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <h2 className="cf-section-title">The machine your solver runs on.</h2>
            <dl className="mt-8 overflow-hidden rounded-cf border border-rule bg-paper-2">
              {SPECS.map(([k, v], i) => (
                <div
                  key={k}
                  className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 ${
                    i > 0 ? "border-t border-rule" : ""
                  }`}
                >
                  <dt className="text-sm text-ink-2">{k}</dt>
                  <dd className="text-sm font-medium break-words text-ink sm:text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-col">
            <h2 className="cf-section-title">How we size the hardware.</h2>
            <p className="cf-section-copy mt-5">
              VRAM is the limit you&rsquo;ll hit first, so here it is plainly.
              Ansys publishes roughly 1.0 to 1.9 GB per million tet or hex cells
              and 1.8 to 2.8 GB per million polyhedral cells. Our current card has{" "}
              {NODE.vram}, which is about 8 million tet or 5 million polyhedral
              cells. It&rsquo;s less if you&rsquo;re running the same case at two
              or three refinement levels, as a mesh-independence study requires.
            </p>
            <p className="cf-section-copy mt-4">
              Two caveats, so you hear them from us first. Ansys tests and
              supports professional cards (A-series, L40S, A100), and GeForce
              isn&rsquo;t on that list, so validate your workflow on a short
              booking before you commit to a deadline. And FDS, which is what most
              car-park and atrium smoke work in India uses, is CPU-only and gets
              nothing from a GPU at all.
            </p>
            <p className="cf-section-copy mt-4">
              If your case won&rsquo;t fit, we&rsquo;ll say so before you book. A bigger
              card, RTX 6000-class, is on the roadmap when demand justifies it.
            </p>
            <p className="mt-4 text-base leading-[1.62] text-ink-3">
              CFD hardware is quoted separately from the self-serve rendering
              fleet. The only GPU you can rent by the hour on Coreframe is the{" "}
              {NODE.gpu}. More on{" "}
              <Link href="/compute-nodes" className="text-blue underline underline-offset-4">
                compute nodes
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <h2 className="cf-section-title">What people run on it.</h2>
            <div className="mt-9 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {useCases.map((u) => (
                <div key={u.label} className="cf-card">
                  <p className="cf-card-label">{u.label}</p>
                  <p className="cf-section-copy">{u.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-col">
            <h2 className="cf-section-title">You bring the licence.</h2>
            <p className="cf-section-copy mt-5">
              We rent hardware, not software. Bring your own Ansys, Siemens or
              other commercial licence, or run an open-source solver such as
              OpenFOAM, SU2 or Code_Saturne. We aren&rsquo;t a reseller for any
              CFD vendor and have no licence-supply arrangement with one.
            </p>
            <p className="cf-section-copy mt-4">
              Check your own licence terms for remote or hosted use before
              booking. Some commercial licences restrict it and some are
              node-locked. That&rsquo;s between you and your vendor, and
              we&rsquo;d rather you confirmed it than assumed.
            </p>
            <p className="mt-4 text-base leading-[1.62] text-ink-3">
              We don&rsquo;t perform CFD analysis, and we don&rsquo;t review,
              verify or sign off anything produced on our hardware.
            </p>
            <a
              href={wa("Hi Coreframe, I'd like to ask about hourly GPU workstations for CFD.")}
              target="_blank"
              rel="noreferrer"
              className="cf-btn-secondary mt-7"
            >
              Ask about availability
            </a>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <h2 className="cf-section-title">Pricing.</h2>
            <p className="cf-section-copy mt-5">
              We quote CFD per job, based on mesh element count, since that
              drives both GPU memory and wall-clock time. Send us your .cas file
              or your element count and we&rsquo;ll send back one figure rather
              than a range.
            </p>

            {/* One row per tier, label stacked above the values on a phone: a
                three-column table at 390px puts two words on each line and
                stops being readable as a table. */}
            <dl className="mt-9 overflow-hidden rounded-cf border border-rule bg-paper-2">
              {pricingTiers.map((t, i) => (
                <div
                  key={t.label}
                  className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6 ${
                    i > 0 ? "border-t border-rule" : ""
                  }`}
                >
                  <dt className="text-sm font-semibold text-ink sm:w-40 sm:shrink-0">
                    {t.label}
                  </dt>
                  <dd className="min-w-0">
                    <span className="block text-sm break-words text-ink-2">
                      {t.elements}
                    </span>
                    <span className="mt-1 block text-sm break-words text-ink-3">
                      {t.useFor}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            <p className="cf-section-copy mt-5">
              The final figure depends on element count, solver type and estimated
              wall-clock time.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a href="/cfd-intake" className="cf-btn-primary">
                Submit a CFD job
              </a>
              <a
                href={wa("Hi Coreframe, I'd like a quote for an Ansys CFD job. My mesh has approximately [X] million elements.")}
                target="_blank"
                rel="noreferrer"
                className="cf-btn-secondary"
              >
                WhatsApp for a quote
              </a>
            </div>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-col">
            <h2 className="cf-section-title">Questions.</h2>
            <div className="mt-8 space-y-7">
              {jsonLd.mainEntity.map((q) => (
                <div key={q.name}>
                  <h3 className="font-semibold text-ink">{q.name}</h3>
                  <p className="cf-section-copy mt-2 break-words">
                    {q.acceptedAnswer.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-col">
            <div className="cf-rule" />
            <ul className="mt-8 space-y-1">
              {[
                ["/", "Home"],
                ["/d5-render-cloud-workstation", "D5 Render on a cloud RTX 5080"],
                ["/enterprise", "Enterprise plans"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex min-h-[44px] items-center text-blue hover:underline"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
