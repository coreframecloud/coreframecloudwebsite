import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Enscape Cloud GPU Workstation — RTX 5080, India",
  description:
    "Run Enscape on an RTX 5080 cloud workstation in India. Real-time architectural visualisation at GPU speed. Pay-as-you-go from ₹399/hr, GST included. BYOL — bring your Enscape subscription.",
  keywords: [
    "Enscape cloud GPU India",
    "Enscape cloud rendering India",
    "Enscape cloud workstation",
    "cloud GPU for Enscape",
    "Enscape RTX cloud India",
    "Enscape Revit cloud GPU",
    "Enscape SketchUp cloud",
  ],
  alternates: { canonical: "/enscape-cloud-gpu" },
};

const specs = [
  { label: "GPU", value: "NVIDIA RTX 5080" },
  { label: "VRAM", value: "16 GB GDDR7 · 960 GB/s" },
  { label: "CUDA cores", value: "10,752 (Blackwell)" },
  { label: "System RAM", value: "64 GB ECC" },
  { label: "vCPU", value: "6-core EPYC" },
  { label: "OS", value: "Windows 11, full RDP desktop" },
  { label: "Display driver", value: "WDDM (required for Enscape)" },
  { label: "Supports", value: "Revit, SketchUp, Rhino, ArchiCAD" },
  { label: "Location", value: "Bengaluru, India" },
];

export default function EnscapePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does Enscape work on a cloud GPU?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Enscape requires a WDDM-enabled GPU with RTX support for ray tracing. Coreframe Cloud provides Windows workstations with full WDDM drivers on the RTX 5080, so Enscape runs at full real-time speed including ray tracing.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use Enscape with Revit or SketchUp on a cloud workstation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Install Revit, SketchUp, Rhino, or ArchiCAD on the workstation alongside Enscape and work exactly as you would locally. All plugins and host applications are supported.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need my own Enscape licence?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes — Enscape is BYOL (Bring Your Own Licence). Log in to your Enscape account on the workstation to activate your named-user or floating seat. Coreframe charges only for GPU-hours.",
        },
      },
    ],
  };

  return (
    <div className="relative min-h-screen text-white">
      <BackgroundGlow />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="relative mx-auto max-w-5xl px-6 pb-24 pt-20 md:pt-28">

        <div className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
          Enscape · Cloud GPU · India
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Run Enscape on RTX 5080.<br className="hidden md:block" /> Ray tracing. No hardware.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
          Enscape's real-time ray tracing pushes hard on GPU VRAM and compute.
          Launch an RTX 5080 Windows workstation, install Enscape alongside
          Revit or SketchUp, and render walkthroughs and stills at speeds your local machine can't match.
        </p>

        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link href="/signup" className="rounded-full bg-cyan-400 px-5 py-2.5 font-semibold text-slate-900 hover:bg-cyan-300 transition">
            Get started →
          </Link>
          <Link href="/enterprise" className="rounded-full border border-white/15 px-5 py-2.5 text-white hover:bg-white/8 transition">
            Studio plans
          </Link>
        </div>

        {/* Why RTX 5080 for Enscape */}
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {[
            { title: "RTX ray tracing", body: "Enscape's ray-traced reflections, shadows, and GI run natively on the RTX 5080's dedicated RT cores — the same cores powering local RTX machines." },
            { title: "Works with your host app", body: "Install Revit, SketchUp, Rhino, or ArchiCAD on the same workstation. Enscape plugs in exactly as it does locally." },
            { title: "Skip the CapEx entirely", body: "A high-end RTX workstation with server-grade RAM, managed OS, and a dedicated connection costs lakhs to buy and maintain. With Coreframe you get the same hardware as a fully managed service — no procurement, no IT overhead, no upgrades." },
          ].map((c) => (
            <div key={c.title} className="rounded-[20px] border border-white/8 bg-white/[0.02] p-6">
              <h3 className="font-semibold text-white">{c.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{c.body}</p>
            </div>
          ))}
        </div>

        {/* Specs */}
        <div className="mt-14">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">Workstation specs</h2>
          <div className="mt-4 overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.03]">
            {specs.map((s, i) => (
              <div key={s.label} className={`flex items-center justify-between px-6 py-4 ${i < specs.length - 1 ? "border-b border-white/8" : ""}`}>
                <span className="text-sm text-white/50">{s.label}</span>
                <span className="text-sm font-medium text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-14 grid gap-4 md:grid-cols-2">
          <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs uppercase tracking-wider text-white/40 mb-3">Ad-hoc</div>
            <div className="text-4xl font-bold text-white">₹399 <span className="text-lg font-normal text-white/40">/ GPU-hr</span></div>
            <p className="mt-3 text-sm text-white/50">No commitment. Pay only for the hours you use. 20 GB persistent storage free, 50 GB once you add credit. Session scratch is cleared when the session ends.</p>
          </div>
          <div className="rounded-[20px] border border-cyan-400/20 bg-cyan-400/[0.04] p-6">
            <div className="text-xs uppercase tracking-wider text-cyan-300/60 mb-3">Committed plans from</div>
            <div className="text-4xl font-bold text-white">₹339 <span className="text-lg font-normal text-white/40">/ GPU-hr</span></div>
            <p className="mt-3 text-sm text-white/50">Cheaper per hour than ad-hoc at every tier, from ₹19,000/month. Persistent storage + named seats for your whole practice. Extra NAS storage ₹1,999/TB/month.</p>
            <Link href="/enterprise" className="mt-4 inline-block text-sm text-cyan-400 hover:underline">See plans →</Link>
          </div>
        </div>

        <div className="mt-8 rounded-[16px] border border-white/8 bg-white/[0.02] px-6 py-5">
          <p className="text-sm leading-6 text-white/50">
            <span className="font-semibold text-white/70">Enscape licence is BYOL.</span>{" "}
            Sign in to your Enscape account on the workstation to activate your seat.
            Named-user and floating licences both work. All prices include 18% GST — what you see is
            what you pay, and a GST invoice showing the taxable value and tax split is issued.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="text-slate-400 hover:text-white transition">← Home</Link>
          <Link href="/d5-render-cloud-workstation" className="text-slate-400 hover:text-white transition">D5 Render on cloud →</Link>
          <Link href="/lumion-cloud-gpu" className="text-slate-400 hover:text-white transition">Lumion on cloud →</Link>
        </div>
      </main>
    </div>
  );
}
