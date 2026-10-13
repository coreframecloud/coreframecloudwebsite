import { StreamDiagram } from "@/components/visuals/diagrams";
import { Fold } from "@/components/visuals/fold";
import { GenImage } from "@/components/visuals/media";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbList } from "@/lib/seo";
import { BackgroundGlow } from "@/components/home/background-glow";
import Link from "next/link";
import Image from "next/image";
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
        text: `A ${NODE.gpu} with ${NODE.vram} at ${NODE.memoryBandwidth}, ${NODE.ram} of system memory, an ${NODE.cpu} and ${NODE.disk}, running ${NODE.os} in ${NODE.location}. One customer per node, and you reach it through the Coreframe Connect app rather than a remote desktop.`,
      },
    },
    {
      "@type": "Question",
      name: "Can you run the simulation for me?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, for internal flow in ducts and pipes. Upload one closed STL of the fluid volume at coreframecloud.com/cfd-intake. We check the geometry, build the mesh and email a quote; the quote fee is Rs 499 + GST. If you accept the quote, the case runs on OpenFOAM on our machine and you get a PDF report with the pressure drop and loss coefficient, a 3D results viewer and the data files. No CFD licence is needed for that service. Rooms and HVAC comfort studies are coming soon.",
      },
    },
    {
      "@type": "Question",
      name: "How is pricing calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Workstation rental is hourly, billed in INR with a GST invoice. You're renting a machine and running your own solver on it, so the cost depends on how long you use it, not on your mesh size. Live rates are on the pricing page. The managed duct and pipe service is quoted per job instead, after a Rs 499 + GST quote fee.",
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
        <section className="cf-section px-5 cf-pagehero">
          <div className="cf-wide grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div className="min-w-0">
            <p className="cf-eyebrow mb-5">CFD · Ansys · Bring your own licence</p>
            <h1 className="cf-display">
              GPU workstations for CFD.
              <br className="hidden md:block" /> By the hour.
            </h1>
            <p className="cf-lead mt-[22px]">
            Run Ansys Fluent, OpenFOAM or your own solver on a rented RTX workstation. Your licence, our machine, billed in rupees with a GST invoice.
          </p>
            <p className="cf-section-copy mt-5">
              On a rented workstation the engineering is yours: you set up the
              case, pick the turbulence model and interpret the results. If
              you&rsquo;d rather we ran it, our{" "}
              <Link href="/cfd-intake" className="underline underline-offset-4">
                CFD service for ducts and pipes
              </Link>{" "}
              does exactly that.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={wa("Hi Coreframe, I'd like to rent a GPU workstation for CFD.")}
                target="_blank"
                rel="noreferrer"
                className="cf-btn-primary"
              >
                Rent a workstation
              </a>
              <a href="/cfd-intake" className="cf-btn-secondary">
                Or let us run it
              </a>
              <a href="/tools" className="cf-btn-secondary">
                Check an IFC model
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
          <GenImage src="/visuals/gen-engineer-simulation-16x9.webp" alt="An engineer studying an airflow simulation" width={1600} height={914} sizes="(max-width: 1024px) 100vw, 480px" parallax priority />
        </div>
        </section>
      <section className="cf-section px-5 pb-0">
        <div className="cf-wide grid items-center gap-8 rounded-[28px] bg-tint-blue p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 className="cf-section-title">Your solver runs here. You drive it from there.</h2>
          <div className="min-w-0"><StreamDiagram /></div>
        </div>
      </section>

        <section className="cf-section px-5">
          <div className="cf-wide grid items-center gap-8 rounded-[28px] bg-night p-6 text-white sm:p-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="min-w-0">
              <p className="cf-eyebrow !bg-white/10 !text-white">Or let us run it</p>
              <h2 className="cf-section-title mt-4 !text-white">CFD for ducts and pipes, run for you.</h2>
              <p className="mt-4 text-[16px] leading-[1.62] text-white/75">
                No workstation, no licence, no case setup. Upload one closed STL of the fluid volume. We check
                it, mesh it with wall-resolved layers and email you a quote; accept it and OpenFOAM runs on our
                machine. You get a PDF report, a 3D results viewer and the data files, with the pressure drop and
                the loss coefficient.
              </p>
              <p className="mt-4 text-[14px] leading-6 text-white/60">
                Quote fee ₹499 + GST from your Coreframe wallet. Pay for the run only if you accept the quote.
              </p>
              <a href="/cfd-intake" className="cf-btn-primary mt-7 !bg-white !text-ink hover:!bg-[#e9ebef]">
                CFD for ducts and pipes
              </a>
            </div>
            <div className="min-w-0 overflow-hidden rounded-[20px] bg-white p-3">
              <Image
                src="/cfd/bend-slice-p-zoom.webp"
                alt="Static pressure through a 90 degree pipe bend, from a Coreframe CFD run"
                width={1316}
                height={889}
                sizes="(max-width: 1024px) 100vw, 400px"
                className="h-auto w-full"
              />
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
<Fold title="How we size the hardware.">
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
          </Fold>
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
<Fold title="You bring the licence.">
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
              We don&rsquo;t review, verify or sign off analysis you run on a
              rented workstation. Our own managed service covers{" "}
              <Link href="/cfd-intake" className="text-blue underline underline-offset-4">
                ducts and pipes
              </Link>
              , with its own report.
            </p>
            <a
              href={wa("Hi Coreframe, I'd like to ask about hourly GPU workstations for CFD.")}
              target="_blank"
              rel="noreferrer"
              className="cf-btn-secondary mt-7"
            >
              Ask about availability
            </a>
          </Fold>
</div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <h2 className="cf-section-title">Pricing.</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="cf-card">
                <p className="cf-card-label">Rent the workstation</p>
                <p className="cf-section-copy">
                  Billed by the hour for the {NODE.gpu} workstation, in rupees with a GST invoice. You run your own
                  solver and licence on it, so the cost follows the hours you use, not your mesh size.
                </p>
                <Link href="/pricing" className="cf-btn-secondary mt-6">
                  See live rates
                </Link>
              </div>
              <div className="cf-card">
                <p className="cf-card-label">Let us run a duct or pipe</p>
                <p className="cf-section-copy">
                  ₹499 + GST quote fee: we build the real mesh of your STL and email a quote. Pay for the run only if
                  you accept it; the quote is held in your wallet and settled at what the run used.
                </p>
                <a href="/cfd-intake" className="cf-btn-primary mt-6">
                  CFD for ducts and pipes
                </a>
              </div>
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
