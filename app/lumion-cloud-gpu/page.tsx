import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lumion Cloud GPU Workstation — RTX 5070 Ti, India",
  description:
    "Run Lumion on an RTX 5070 Ti cloud workstation in India. Real-time rendering at full GPU speed. Pay-as-you-go from ₹400/hr. BYOL — bring your own Lumion licence.",
  keywords: [
    "Lumion cloud GPU India",
    "Lumion cloud rendering India",
    "Lumion cloud workstation",
    "cloud GPU for Lumion",
    "Lumion RTX cloud India",
  ],
  alternates: { canonical: "/lumion-cloud-gpu" },
};

const specs = [
  { label: "GPU", value: "NVIDIA RTX 5070 Ti" },
  { label: "VRAM", value: "16 GB GDDR7" },
  { label: "System RAM", value: "64 GB ECC" },
  { label: "vCPU", value: "6-core EPYC" },
  { label: "OS", value: "Windows 11, full RDP desktop" },
  { label: "Display driver", value: "WDDM (required for Lumion)" },
  { label: "Location", value: "Bengaluru, India" },
];

export default function LumionPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does Lumion work on a cloud GPU?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Lumion requires a WDDM-enabled GPU. Coreframe Cloud provides Windows workstations with a full WDDM display driver on the RTX 5070 Ti, so Lumion runs at full real-time rendering speed.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need my own Lumion licence?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes — Lumion is BYOL (Bring Your Own Licence). Install Lumion on the workstation and activate your existing named-user or floating licence. Coreframe does not charge any software fees.",
        },
      },
      {
        "@type": "Question",
        name: "How much does Lumion cloud GPU cost in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ad-hoc sessions are ₹400/GPU-hour, charged per full hour. Committed monthly plans start at ₹24,000/month with lower per-hour overage rates by tier.",
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
          Lumion · Cloud GPU · India
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Run Lumion on RTX 5070 Ti.<br className="hidden md:block" /> Real-time. No hardware.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
          Lumion's real-time rendering engine is GPU-bound. Launch an RTX 5070 Ti Windows workstation
          and run Lumion at speeds your local machine can't match — without buying new hardware.
          Bring your own Lumion licence and you're ready in minutes.
        </p>

        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link href="/signup" className="rounded-full bg-cyan-400 px-5 py-2.5 font-semibold text-slate-900 hover:bg-cyan-300 transition">
            Get started →
          </Link>
          <Link href="/enterprise" className="rounded-full border border-white/15 px-5 py-2.5 text-white hover:bg-white/8 transition">
            Studio plans
          </Link>
        </div>

        {/* Why RTX 5070 Ti for Lumion */}
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {[
            { title: "16 GB GDDR7 VRAM", body: "Large Lumion scenes with detailed assets, high-res textures, and complex vegetation fit comfortably in 16 GB." },
            { title: "Consumer RTX drivers", body: "Lumion requires WDDM display drivers. Our RTX 5070 Ti runs full consumer drivers — unlike datacenter cards which use compute-only drivers." },
            { title: "Data stays in India", body: "Your project files never leave Indian servers. Critical for studios with NDA projects and enterprise clients." },
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
            <div className="text-4xl font-bold text-white">₹400 <span className="text-lg font-normal text-white/40">/ GPU-hr</span></div>
            <p className="mt-3 text-sm text-white/50">No commitment. Pay only for the hours you render.</p>
          </div>
          <div className="rounded-[20px] border border-cyan-400/20 bg-cyan-400/[0.04] p-6">
            <div className="text-xs uppercase tracking-wider text-cyan-300/60 mb-3">Committed plans from</div>
            <div className="text-4xl font-bold text-white">₹250 <span className="text-lg font-normal text-white/40">/ GPU-hr</span></div>
            <p className="mt-3 text-sm text-white/50">Persistent project storage + named seats for your studio.</p>
            <Link href="/enterprise" className="mt-4 inline-block text-sm text-cyan-400 hover:underline">See plans →</Link>
          </div>
        </div>

        <div className="mt-8 rounded-[16px] border border-white/8 bg-white/[0.02] px-6 py-5">
          <p className="text-sm leading-6 text-white/50">
            <span className="font-semibold text-white/70">Lumion licence is BYOL.</span>{" "}
            Named-user and floating licences both work. Install Lumion, activate your seat, and start rendering.
            All prices exclusive of GST.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="text-slate-400 hover:text-white transition">← Home</Link>
          <Link href="/d5-render" className="text-slate-400 hover:text-white transition">D5 Render on cloud →</Link>
          <Link href="/enscape-cloud-gpu" className="text-slate-400 hover:text-white transition">Enscape on cloud →</Link>
        </div>
      </main>
    </div>
  );
}
