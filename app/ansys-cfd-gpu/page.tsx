import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ansys CFD in Minutes Not Days — GPU CFD as a Managed Service, India",
  description:
    "Why wait 3 days for a CFD solve? Submit your Ansys Fluent job and we run it on GPU hardware sized to your mesh. Per-job pricing by element count. Ansys cloud partner. Bengaluru, India.",
  keywords: [
    "Ansys CFD cloud GPU India",
    "GPU CFD simulation India",
    "Ansys Fluent GPU cloud",
    "CFD cloud computing India",
    "managed CFD service India",
    "per job CFD cloud India",
  ],
  alternates: { canonical: "/ansys-cfd-gpu" },
};

const whyGpu = [
  {
    icon: "⚡",
    title: "5–20× faster solve times",
    body: "Ansys Fluent's GPU solver offloads the pressure-velocity coupling and linear algebra to thousands of CUDA cores in parallel. What takes 8 hours on a CPU cluster can resolve in minutes on a suitably sized GPU.",
  },
  {
    icon: "🧠",
    title: "VRAM determines mesh ceiling",
    body: "The number of elements your solver can hold in memory is bounded by GPU VRAM. We size the hardware to your mesh, so large industrial cases run without you having to decompose them by hand.",
  },
  {
    icon: "🌊",
    title: "Memory bandwidth for convergence",
    body: "Each solver iteration moves the full mesh state across memory repeatedly. High-bandwidth GPU memory keeps iterations fast even for large turbulent flow problems.",
  },
  {
    icon: "💸",
    title: "No idle hardware cost",
    body: "A dedicated CFD-class GPU workstation is a multi-lakh capital purchase that then sits idle between jobs. Per-job billing means you pay only when the simulation is actually running.",
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
        text: "Yes. Ansys Fluent has a dedicated GPU solver (available since Ansys 2022 R1) that offloads pressure-based steady and transient solving to NVIDIA GPUs via CUDA. Speedups of 5–20× vs CPU are typical depending on mesh size and turbulence model.",
      },
    },
    {
      "@type": "Question",
      name: "How large a mesh can you run?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ansys Fluent's GPU solver requires roughly 1–1.5 GB of GPU memory per million elements for a double-precision k-ω SST case. We size the hardware to the job, and routinely run cases well into the tens of millions of elements. Send us your element count and we will confirm what is feasible before you commit.",
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
        text: "Pricing is per job, based on mesh element count (the primary driver of memory and compute cost), solver type, and estimated solve time. Contact Coreframe with your .cas file or element count for an accurate quote.",
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
          Ansys Fluent, run as a managed service.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          Solve large Ansys CFD meshes 5–20× faster than CPU clusters. Submit a job, specify
          your element count, and we run it on GPU hardware appropriate to the case — no hardware
          to procure, no licences to manage. Per-job pricing, hosted in Bengaluru.
        </p>
        <p className="mt-3 max-w-2xl text-xs leading-6 text-white/40">
          CFD is a per-job service, not self-serve GPU rental. There is no hourly CFD node to
          book — you send the job, we return the results.
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
              You do not pick a GPU. Send us the mesh — element count, solver, turbulence model,
              steady or transient — and we run the job on hardware appropriate to it. Memory is
              usually the binding constraint: Ansys Fluent&apos;s GPU solver needs roughly
              1–1.5 GB of GPU memory per million elements for a double-precision case, so the
              mesh size decides the machine, not the other way round.
            </p>
            <p className="mt-3 text-xs leading-6 text-white/60">
              If a case will not run well, we will tell you before you pay rather than quote you
              for something that will not converge.
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
