import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import Link from "next/link";

export const metadata: Metadata = {
  title: "D5 Render 5× Faster — RTX 5070 Ti Cloud GPU India | Coreframe",
  description:
    "Render D5 scenes 5× faster than a mid-range local GPU. Launch an RTX 5070 Ti cloud workstation in under 2 minutes. ₹400/hr, no setup, no hardware. Hosted in Bengaluru, India.",
  keywords: [
    "D5 Render cloud GPU",
    "D5 Render cloud workstation India",
    "D5 Render RTX cloud",
    "D5 Render on cloud India",
    "cloud GPU for D5 Render",
  ],
  alternates: { canonical: "/d5-render" },
};

const steps = [
  { n: "01", title: "Create your account", body: "Sign up at coreframecloud.com and add wallet credit. Takes under 2 minutes." },
  { n: "02", title: "Launch a workstation", body: "One click spins up an RTX 5070 Ti Windows machine. Full WDDM display driver — D5 Render runs exactly as it does on a local GPU." },
  { n: "03", title: "Install D5 & activate your licence", body: "D5 Render is BYOL. Install it, sign in to your named-user account, and your licence activates instantly." },
  { n: "04", title: "Transfer your project", body: "Upload your scene files over the encrypted connection. Large project files transfer fast over our 1 Gbps dedicated link." },
  { n: "05", title: "Render", body: "Run D5 Render at full RTX 5070 Ti speed — GPU ray tracing, DLSS, and real-time path tracing all work. Render times typically drop 3–5× vs a mid-range local GPU." },
  { n: "06", title: "Download & shut down", body: "Download your outputs and end the session. You are charged for the full hour. Scratch storage is cleared automatically." },
];

const specs = [
  { label: "GPU", value: "NVIDIA RTX 5070 Ti" },
  { label: "VRAM", value: "16 GB GDDR7" },
  { label: "System RAM", value: "64 GB ECC" },
  { label: "vCPU", value: "6-core EPYC" },
  { label: "Local scratch", value: "NVMe — cleared after session" },
  { label: "OS", value: "Windows 11, full RDP desktop" },
  { label: "Display driver", value: "WDDM (required for D5 Render)" },
  { label: "Location", value: "Bengaluru, India" },
];

export default function D5RenderPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does D5 Render work on a cloud GPU?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. D5 Render requires a WDDM-enabled GPU with RTX support. Coreframe Cloud provisions Windows workstations with a full WDDM display driver on the RTX 5070 Ti, so D5 runs identically to a local machine.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need a D5 Render licence?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes — D5 Render is BYOL (Bring Your Own Licence). Install D5 on the workstation and sign in with your named-user account. Your licence activates exactly as it would on your local machine.",
        },
      },
      {
        "@type": "Question",
        name: "How much does a D5 Render cloud session cost?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ad-hoc sessions are ₹400/GPU-hour, charged per full hour. Committed monthly plans start at ₹24,000/month with lower per-hour overage rates depending on the tier.",
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
          D5 Render · Cloud GPU · India
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Run D5 Render on RTX 5070 Ti.<br className="hidden md:block" /> No hardware. Pay by the hour.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
          Skip the GPU upgrade cycle. Launch an RTX 5070 Ti Windows workstation in under 2 minutes,
          render your D5 scene at full speed, and shut down when you're done.
          Charged per full hour. Data stays in India.
        </p>

        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link href="/signup" className="rounded-full bg-cyan-400 px-5 py-2.5 font-semibold text-slate-900 hover:bg-cyan-300 transition">
            Create account →
          </Link>
          <Link href="/enterprise" className="rounded-full border border-white/15 px-5 py-2.5 text-white hover:bg-white/8 transition">
            View committed plans
          </Link>
        </div>

        {/* Specs */}
        <div className="mt-16">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">Workstation specs</h2>
          <div className="mt-4 overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.03]">
            {specs.map((s, i) => (
              <div key={s.label} className={`flex items-center justify-between px-6 py-4 ${i < specs.length - 1 ? "border-b border-white/8" : ""}`}>
                <span className="text-sm text-white/50">{s.label}</span>
                <span className="text-sm font-medium text-white">{s.value}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/30">
            RTX 5070 Ti is a consumer card with full gaming-driver support — not available on any other cloud provider.
          </p>
        </div>

        {/* How it works */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {steps.map((s) => (
              <div key={s.n} className="rounded-[20px] border border-white/8 bg-white/[0.02] p-6">
                <div className="text-xs font-bold text-white/25 mb-2">{s.n}</div>
                <h3 className="font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing summary */}
        <div className="mt-16 grid gap-4 md:grid-cols-2">
          <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs uppercase tracking-wider text-white/40 mb-3">Ad-hoc</div>
            <div className="text-4xl font-bold text-white">₹400 <span className="text-lg font-normal text-white/40">/ GPU-hr</span></div>
            <p className="mt-3 text-sm text-white/50">No commitment. Spin up anytime, pay only for what you use.</p>
          </div>
          <div className="rounded-[20px] border border-cyan-400/20 bg-cyan-400/[0.04] p-6">
            <div className="text-xs uppercase tracking-wider text-cyan-300/60 mb-3">Committed plans from</div>
            <div className="text-4xl font-bold text-white">₹250 <span className="text-lg font-normal text-white/40">/ GPU-hr</span></div>
            <p className="mt-3 text-sm text-white/50">Monthly plans with persistent storage and named render seats.</p>
            <Link href="/enterprise" className="mt-4 inline-block text-sm text-cyan-400 hover:underline">See plans →</Link>
          </div>
        </div>

        {/* BYOL note */}
        <div className="mt-8 rounded-[16px] border border-white/8 bg-white/[0.02] px-6 py-5">
          <p className="text-sm leading-6 text-white/50">
            <span className="font-semibold text-white/70">D5 Render licence is BYOL.</span>{" "}
            Named-user licences work — install D5 on the workstation and sign in with your existing account.
            No extra licensing fees from Coreframe.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="text-slate-400 hover:text-white transition">← Home</Link>
          <Link href="/lumion-cloud-gpu" className="text-slate-400 hover:text-white transition">Lumion on cloud →</Link>
          <Link href="/enscape-cloud-gpu" className="text-slate-400 hover:text-white transition">Enscape on cloud →</Link>
        </div>
      </main>
    </div>
  );
}
