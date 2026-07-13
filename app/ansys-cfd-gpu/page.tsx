import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ansys CFD in Minutes Not Days — H100 & RTX 6000 Pro Cloud India",
  description:
    "Why wait 3 days for a CFD solve? Run Ansys Fluent on H100 (80 GB HBM3) or RTX 6000 Pro (96 GB) and finish the same job in minutes. Per-job pricing by element count. Ansys cloud partner. Bengaluru, India.",
  keywords: [
    "Ansys CFD cloud GPU India",
    "GPU CFD simulation India",
    "Ansys Fluent GPU cloud",
    "CFD cloud computing India",
    "H100 CFD simulation India",
    "RTX 6000 Pro CFD India",
    "per job CFD cloud India",
  ],
  alternates: { canonical: "/ansys-cfd-gpu" },
};

const whyGpu = [
  {
    icon: "⚡",
    title: "5–20× faster solve times",
    body: "Ansys Fluent's GPU solver offloads the pressure-velocity coupling and linear algebra to thousands of CUDA cores in parallel. What takes 8 hours on a CPU cluster resolves in minutes on an H100.",
  },
  {
    icon: "🧠",
    title: "VRAM determines mesh ceiling",
    body: "The number of elements your solver can hold in memory is bounded by GPU VRAM. RTX 6000 Pro gives 96 GB GDDR7 — enough for most industrial meshes up to ~80 M elements without decomposition.",
  },
  {
    icon: "🌊",
    title: "Memory bandwidth for convergence",
    body: "Each solver iteration moves the full mesh state across memory repeatedly. H100's 3.35 TB/s HBM3 bandwidth keeps iterations fast even for large turbulent flow problems.",
  },
  {
    icon: "💸",
    title: "No idle hardware cost",
    body: "A dedicated H100 workstation costs ₹50–80 lakh upfront, then sits idle between jobs. Per-job cloud billing means you pay only when the simulation is actually running.",
  },
];

const gpus = [
  {
    name: "RTX 6000 Pro",
    badge: "Mid-to-large meshes",
    vram: "96 GB GDDR7",
    bandwidth: "960 GB/s",
    cuda: "18,176 CUDA cores",
    mesh: "Up to ~80 M elements",
    best: "Building wind loads, HVAC, electronics cooling, external aero up to medium scale",
    highlight: false,
  },
  {
    name: "NVIDIA H100",
    badge: "Industrial scale",
    vram: "80 GB HBM3",
    bandwidth: "3.35 TB/s",
    cuda: "16,896 CUDA cores + 528 Tensor cores",
    mesh: "100 M+ elements, multi-physics",
    best: "Full-aircraft aerodynamics, large-scale combustion, parametric sweeps, transient simulations",
    highlight: true,
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
    gpu: "RTX 6000 Pro",
    useFor: "Concept checks, quick parameter sweeps",
    price: "Contact us",
  },
  {
    label: "Engineering",
    elements: "2 M – 20 M elements",
    gpu: "RTX 6000 Pro",
    useFor: "Design validation, steady-state RANS",
    price: "Contact us",
  },
  {
    label: "Industrial",
    elements: "20 M – 80 M elements",
    gpu: "RTX 6000 Pro",
    useFor: "Full-scale external aero, large HVAC, wind tunnel",
    price: "Contact us",
  },
  {
    label: "Large Scale",
    elements: "80 M – 200 M elements",
    gpu: "H100",
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
        text: "Yes. Ansys Fluent has a dedicated GPU solver (available since Ansys 2022 R1) that offloads pressure-based steady and transient solving to NVIDIA GPUs via CUDA. Speedups of 5–20× vs CPU are typical depending on mesh size and turbulence model.",
      },
    },
    {
      "@type": "Question",
      name: "How many mesh elements can run on RTX 6000 Pro?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "RTX 6000 Pro has 96 GB GDDR7 VRAM. Ansys Fluent's GPU solver requires roughly 1–1.5 GB per million elements for a double-precision k-ω SST case. Practically, meshes up to ~60–80 M elements fit comfortably within single-GPU memory.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need my own Ansys licence?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Coreframe is partnering with Ansys to offer per-job HPC licensing as part of the service. You can bring your own Ansys licence (BYOL) or use per-job licence access through the Coreframe–Ansys partnership. Contact us to discuss which model fits your workflow.",
      },
    },
    {
      "@type": "Question",
      name: "How is CFD job pricing calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pricing is based on mesh element count (the primary driver of memory and compute cost), GPU tier (RTX 6000 Pro vs H100), and estimated solve time. Contact Coreframe with your .cas file or element count for an accurate quote.",
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
          <span className="rounded-full bg-emerald-400/15 border border-emerald-400/20 px-2 py-0.5 text-emerald-300">
            Ansys Cloud Partner
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          GPU-accelerated CFD.<br className="hidden sm:block" />
          Ansys Fluent on H100 & RTX 6000 Pro.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          Solve large Ansys CFD meshes 5–20× faster than CPU clusters. Submit a job, specify
          your element count, and Coreframe's GPU infrastructure handles the rest — no hardware
          to procure, no licences to manage. Per-job pricing, hosted in Bengaluru.
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

        {/* GPU specs */}
        <div className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35 mb-5">
            GPU options
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {gpus.map((g) => (
              <div key={g.name} className={`relative rounded-[20px] border p-6 ${g.highlight ? "border-cyan-400/25 bg-cyan-400/[0.04]" : "border-white/10 bg-white/[0.03]"}`}>
                {g.highlight && (
                  <span className="absolute -top-3 left-5 rounded-full bg-cyan-400 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-900">
                    Highest performance
                  </span>
                )}
                <div className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${g.highlight ? "text-cyan-300/60" : "text-white/35"}`}>
                  {g.badge}
                </div>
                <div className="text-lg font-bold text-white">{g.name}</div>

                <div className="mt-4 space-y-2">
                  {[
                    { l: "VRAM", v: g.vram },
                    { l: "Memory bandwidth", v: g.bandwidth },
                    { l: "Compute", v: g.cuda },
                    { l: "Max mesh size", v: g.mesh },
                  ].map(({ l, v }) => (
                    <div key={l} className="flex justify-between text-xs border-b border-white/6 pb-2 last:border-b-0">
                      <span className="text-white/45">{l}</span>
                      <span className="font-medium text-white">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl bg-white/[0.03] px-3 py-2">
                  <div className="text-[10px] text-white/35 mb-1">Best for</div>
                  <p className="text-xs leading-5 text-white/60">{g.best}</p>
                </div>
              </div>
            ))}
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

        {/* Ansys partnership */}
        <div className="mt-12 rounded-[20px] border border-emerald-400/15 bg-emerald-400/[0.03] p-6">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300/60 mb-1">Partnership</div>
              <h3 className="text-base font-semibold text-white">Coreframe × Ansys</h3>
              <p className="mt-2 text-xs leading-6 text-white/55">
                Coreframe is partnering with Ansys to deliver CFD as a managed per-job service.
                Submit your simulation job — mesh file, solver settings, boundary conditions — and
                receive results without touching any infrastructure. Per-job Ansys HPC licence access
                is available through the partnership, or bring your existing Ansys licence (BYOL).
              </p>
              <p className="mt-2 text-xs text-white/40">
                Partnership currently in onboarding. Contact us to join the early access programme.
              </p>
            </div>
            <a
              href={wa("Hi Coreframe, I'm interested in the Ansys CFD partnership early access.")}
              target="_blank" rel="noreferrer"
              className="shrink-0 rounded-xl bg-emerald-400/15 border border-emerald-400/20 px-4 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-400/25 transition"
            >
              Join early access
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
            <div className="grid grid-cols-4 gap-0 border-b border-white/8 bg-white/[0.02] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/35">
              <span>Tier</span>
              <span>Element count</span>
              <span>GPU</span>
              <span>Use for</span>
            </div>
            {pricingTiers.map((t, i) => (
              <div
                key={t.label}
                className={`grid grid-cols-4 gap-0 px-5 py-4 text-xs ${i < pricingTiers.length - 1 ? "border-b border-white/6" : ""} ${i === pricingTiers.length - 1 ? "bg-cyan-400/[0.03]" : ""}`}
              >
                <span className="font-semibold text-white">{t.label}</span>
                <span className="text-white/60">{t.elements}</span>
                <span className={`font-medium ${t.gpu === "H100" ? "text-cyan-300" : "text-white/70"}`}>{t.gpu}</span>
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
          <Link href="/d5-render" className="text-slate-400 hover:text-white transition">3D Rendering →</Link>
          <Link href="/enterprise" className="text-slate-400 hover:text-white transition">Enterprise plans →</Link>
        </div>
      </main>
    </div>
  );
}
