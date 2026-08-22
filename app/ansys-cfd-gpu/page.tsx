import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import Link from "next/link";

export const metadata: Metadata = {
  title: "GPU Workstations for CFD, by the Hour — Bring Your Own Licence | India",
  description:
    "Rent an RTX-class GPU workstation by the hour and run Ansys Fluent, OpenFOAM or your own CFD solver on it. You bring the licence and the engineering; we provide the hardware. India, INR billing, GST invoice.",
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

const whyGpu = [
  {
    icon: "⚡",
    title: "GPU solvers, where they help",
    body: "Ansys Fluent has a native GPU solver and publishes substantial speedups on the professional cards it supports. OpenFOAM is different: only the linear solver moves to the GPU, and published end-to-end gains are around 1.7–2.2× because meshing, matrix assembly and I/O stay on the CPU. We quote no multiple for your case — benchmark it and see.",
  },
  {
    icon: "🧠",
    title: "VRAM determines mesh ceiling",
    body: "VRAM is the hard ceiling. Ansys's own figures are roughly 1.0–1.9 GB per million tet/hex cells and 1.8–2.8 GB per million polyhedral cells. On a 16 GB card that is about 8 million tet cells or 5 million polyhedral — and a mesh-independence study needs the same case two or three times over. Tell us your cell count and we will say plainly whether it fits.",
  },
  {
    icon: "🌊",
    title: "Memory bandwidth for convergence",
    body: "Each solver iteration moves the full mesh state across memory repeatedly. High-bandwidth GPU memory keeps iterations fast even for large turbulent flow problems.",
  },
  {
    icon: "💸",
    title: "No idle hardware cost",
    body: "A CFD-class GPU workstation is a multi-lakh capital purchase that sits idle between jobs. Hourly rental means you pay for the hours you actually use, on a machine you do not have to own, house or depreciate.",
  },
];

const useCases = [
  { icon: "🏗️", label: "Wind engineering", desc: "Building façade wind loads, urban wind comfort, cladding pressure coefficients" },
  { icon: "✈️", label: "External aerodynamics", desc: "Drag, lift, wake analysis for aerospace and automotive" },
  { icon: "🌡️", label: "Thermal / HVAC", desc: "Data centre cooling, cleanroom airflow, indoor thermal comfort (ASHRAE)" },
  { icon: "💧", label: "Internal flow", desc: "Pipe networks, heat exchangers, pumps, valves, mixing" },
  { icon: "🔥", label: "Combustion", desc: "Burner design, furnace modelling, reacting flow" },
  { icon: "🔩", label: "Electronics cooling", desc: "PCB thermal management, server rack CFD, junction temperature prediction" },
];

const pricingTiers = [
  {
    label: "Validation",
    elements: "Up to 2 M elements",
    useFor: "Concept checks, quick parameter sweeps",
    price: "Contact us",
  },
  {
    label: "Engineering",
    elements: "2 M – 20 M elements",
    useFor: "Design validation, steady-state RANS",
    price: "Contact us",
  },
  {
    label: "Industrial",
    elements: "20 M – 80 M elements",
    useFor: "Full-scale external aero, large HVAC, wind tunnel",
    price: "Contact us",
  },
  {
    label: "Large Scale",
    elements: "80 M – 200 M elements",
    useFor: "Complex multi-physics, LES, transient, parametric campaigns",
    price: "Contact us",
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
        text: "Yes. Ansys Fluent has a dedicated GPU solver (available since Ansys 2022 R1) that offloads pressure-based steady and transient solving to NVIDIA GPUs via CUDA. How much faster it is depends heavily on the case: for OpenFOAM the published end-to-end figure is around 1.7-2.2x, because matrix assembly and I/O stay on the CPU even when the linear solve does not. Fluent's native GPU solver scales better than that, but Ansys tests and supports professional cards rather than the GeForce hardware we currently run. Treat any single speedup number you see quoted, including ours, as case-dependent until it has been measured on your mesh.",
      },
    },
    {
      "@type": "Question",
      name: "How large a mesh can you run?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ansys publishes roughly 1.0-1.9 GB of GPU memory per million tet/hex cells and 1.8-2.8 GB per million polyhedral cells. Our current card is a 16 GB RTX 5080, which works out to about 8 million tet cells or 5 million polyhedral, with less headroom again if you are running a mesh-independence study. Larger meshes need a bigger card than we currently offer - tell us your cell count and we will say so before you book rather than after.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need my own Ansys licence?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We rent hardware, not software. You bring your own Ansys, Siemens or other commercial licence, or use an open-source solver such as OpenFOAM or SU2. We are not an Ansys reseller and have no licence-supply arrangement with any CFD vendor. Check your own licence terms for remote or hosted use before you book - that is between you and your vendor, and we would rather you confirm it than assume.",
      },
    },
    {
      "@type": "Question",
      name: "How is pricing calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Hourly, for the workstation, billed in INR with a GST invoice. You are renting a machine and running your own solver on it, so the cost depends on how long you use it rather than on your mesh size. Contact us for the current rate.",
      },
    },
  ],
};

export default function AnsysCfdPage() {
  const wa = (msg: string) =>
    `https://wa.me/916366889488?text=${encodeURIComponent(msg)}`;

  return (
    <div className="relative min-h-screen text-white">
      <BackgroundGlow />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="relative mx-auto max-w-5xl px-6 pb-20 pt-16 md:pt-20">

        {/* Hero */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
          <span>CFD · Ansys · Cloud GPU</span>
          <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-slate-300">
            Bring your own licence
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          GPU workstations for CFD.<br className="hidden sm:block" />
          By the hour. Bring your own licence.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          Rent an RTX-class GPU workstation by the hour and run Ansys Fluent, OpenFOAM or
          whichever solver you are licensed for. You keep the engineering and the licence;
          we provide the machine, billed in INR with a GST invoice.
        </p>
        <p className="mt-3 max-w-2xl text-xs leading-6 text-white/40">
          We do not run your simulation, choose your turbulence model or interpret your results.
          This is hardware rental. The engineering, and responsibility for it, stays with you.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="/cfd-intake"
            className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-cyan-300 transition"
          >
            Submit a CFD job →
          </a>
          <a
            href={wa("Hi Coreframe, I'd like to discuss GPU CFD simulation for my Ansys project.")}
            target="_blank" rel="noreferrer"
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white hover:bg-white/8 transition"
          >
            WhatsApp us
          </a>
        </div>

        {/* Why GPU */}
        <div className="mt-14">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35 mb-5">
            Why GPU matters for CFD
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {whyGpu.map((w) => (
              <div key={w.title} className="rounded-[18px] border border-white/8 bg-white/[0.02] p-5">
                <div className="text-xl mb-2">{w.icon}</div>
                <h3 className="text-sm font-semibold text-white">{w.title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-white/50">{w.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How the hardware is chosen */}
        <div className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35 mb-5">
            How we size the hardware
          </h2>
          <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs leading-6 text-white/60">
              VRAM is the binding constraint, and it is worth being blunt about it. Ansys
              publishes roughly 1.0–1.9 GB per million tet/hex cells and 1.8–2.8 GB per million
              polyhedral cells. Our current card is a <strong className="text-white/80">16 GB
              RTX 5080</strong>, which is about <strong className="text-white/80">8 million tet
              or 5 million polyhedral cells</strong> — less if you are running the same case at
              two or three refinement levels, as a mesh-independence study requires.
            </p>
            <p className="mt-3 text-xs leading-6 text-white/60">
              Two caveats we would rather you heard from us. Ansys tests and supports
              professional cards (A-series, L40S, A100) — GeForce is not on that list, so
              validate your workflow on a short booking before committing to a deadline. And
              FDS, which is what most car-park and atrium smoke work in India uses, is CPU-only
              and gets nothing from a GPU at all.
            </p>
            <p className="mt-3 text-xs leading-6 text-white/60">
              If your case will not fit, we will say so before you book. A bigger card
              (RTX 6000-class) is on the roadmap when demand justifies it.
            </p>
            <p className="mt-3 text-xs leading-6 text-white/40">
              Note: CFD hardware is separate from our self-serve rendering fleet. The only GPU you
              can rent by the hour on Coreframe is the RTX 5080 — see{" "}
              <Link href="/compute-nodes" className="text-cyan-300 hover:text-cyan-200 transition">
                compute nodes
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Use cases */}
        <div className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35 mb-5">Simulation types</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((u) => (
              <div key={u.label} className="flex gap-3 rounded-[16px] border border-white/8 bg-white/[0.02] px-4 py-3">
                <span className="text-lg mt-0.5">{u.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-white">{u.label}</div>
                  <div className="mt-0.5 text-xs leading-5 text-white/45">{u.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Licensing — what we do and do not supply */}
        <div className="mt-12 rounded-[20px] border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1">Licensing</div>
              <h3 className="text-base font-semibold text-white">You bring the licence</h3>
              <p className="mt-2 text-xs leading-6 text-white/55">
                We rent hardware, not software. Bring your own Ansys, Siemens or other commercial
                licence, or run an open-source solver — OpenFOAM, SU2, Code_Saturne. We are not a
                reseller for any CFD vendor and we have no licence-supply arrangement with one.
              </p>
              <p className="mt-2 text-xs leading-6 text-white/55">
                Check your own licence terms for remote or hosted use before booking. Some
                commercial licences restrict it and some are node-locked. That is between you and
                your vendor — we would rather you confirmed it than assumed.
              </p>
              <p className="mt-2 text-xs text-white/40">
                We do not perform CFD analysis, and nothing produced on our hardware is reviewed,
                verified or signed off by us.
              </p>
            </div>
            <a
              href={wa("Hi Coreframe, I'd like to ask about hourly GPU workstations for CFD.")}
              target="_blank" rel="noreferrer"
              className="shrink-0 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
            >
              Ask about availability
            </a>
          </div>
        </div>

        {/* Pricing by element count */}
        <div className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35 mb-1">Pricing</h2>
          <p className="mb-5 text-xs text-white/40">
            Priced per simulation job based on mesh element count — the primary driver of GPU memory and compute time.
          </p>
          <div className="overflow-hidden rounded-[20px] border border-white/10">
            <div className="grid grid-cols-3 gap-0 border-b border-white/8 bg-white/[0.02] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/35">
              <span>Tier</span>
              <span>Element count</span>
              <span>Use for</span>
            </div>
            {pricingTiers.map((t, i) => (
              <div
                key={t.label}
                className={`grid grid-cols-3 gap-0 px-5 py-4 text-xs ${i < pricingTiers.length - 1 ? "border-b border-white/6" : ""} ${i === pricingTiers.length - 1 ? "bg-cyan-400/[0.03]" : ""}`}
              >
                <span className="font-semibold text-white">{t.label}</span>
                <span className="text-white/60">{t.elements}</span>
                <span className="text-white/45">{t.useFor}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/30">
            Final pricing depends on element count, solver type, and estimated wall-clock time.
            Contact us with your .cas file or element count for an exact quote.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/cfd-intake"
              className="rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-semibold text-slate-900 hover:bg-cyan-300 transition"
            >
              Submit a CFD job →
            </a>
            <a
              href={wa("Hi Coreframe, I'd like a quote for an Ansys CFD job. My mesh has approximately [X] million elements.")}
              target="_blank" rel="noreferrer"
              className="rounded-xl border border-white/12 bg-white/[0.04] px-5 py-2.5 text-xs font-medium text-white hover:bg-white/8 transition"
            >
              WhatsApp for quick quote
            </a>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35 mb-5">FAQ</h2>
          <div className="space-y-3">
            {jsonLd.mainEntity.map((q) => (
              <div key={q.name} className="rounded-[18px] border border-white/8 bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-white">{q.name}</h3>
                <p className="mt-2 text-xs leading-6 text-white/50">{q.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="text-slate-400 hover:text-white transition">← Home</Link>
          <Link href="/d5-render-cloud-workstation" className="text-slate-400 hover:text-white transition">3D Rendering →</Link>
          <Link href="/enterprise" className="text-slate-400 hover:text-white transition">Enterprise plans →</Link>
        </div>
      </main>
    </div>
  );
}
