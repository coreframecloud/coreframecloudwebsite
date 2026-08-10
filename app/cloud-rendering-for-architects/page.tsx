import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cloud Rendering for Architects — RTX 5080, India",
  description:
    "Cloud GPU workstations for architecture studios. Run D5 Render, Lumion, Enscape, Revit on RTX 5080. Persistent project storage, named seats, data hosted in Bengaluru.",
  keywords: [
    "cloud rendering for architects India",
    "cloud GPU architecture India",
    "D5 Render cloud architects",
    "Lumion cloud India architects",
    "Enscape cloud Revit India",
    "architecture visualisation cloud GPU",
  ],
  alternates: { canonical: "/cloud-rendering-for-architects" },
};

const useCases = [
  {
    icon: "🏛️",
    title: "D5 Render walkthroughs",
    body: "Fly-through animations and real-time walkthroughs need sustained GPU throughput your local machine can't sustain for long sessions. Offload to RTX 5080 and let the render run.",
  },
  {
    icon: "🪟",
    title: "Enscape + Revit / SketchUp",
    body: "Install Revit or SketchUp on the workstation alongside Enscape. RTX ray tracing works natively. Your Enscape named-user licence activates exactly as it does locally.",
  },
  {
    icon: "🌳",
    title: "Lumion scenes with large assets",
    body: "16 GB GDDR7 VRAM fits complex Lumion scenes with high-res textures, detailed vegetation, and animated water — without dropping to lower quality settings.",
  },
  {
    icon: "👥",
    title: "Team handoffs, no re-uploading",
    body: "On committed plans, your project files live on persistent NAS. A designer uploads the model; the renderer picks it up immediately. No copying, no waiting.",
  },
  {
    icon: "🔒",
    title: "Client NDA projects stay in India",
    body: "All data is hosted in Bengaluru. Your client's unreleased building design never touches an overseas server — important for large commercial and government projects.",
  },
  {
    icon: "📐",
    title: "Scale for deadline crunches",
    body: "Before a presentation, multiple team members can run separate render sessions simultaneously. Each gets their own RTX 5080 instance. Scale up, scale down.",
  },
];

const workflow = [
  { n: "01", title: "Create account & add credit", body: "Sign up, verify email, and add wallet credit. Takes under 5 minutes." },
  { n: "02", title: "Launch a Windows workstation", body: "One click. RTX 5080 boots with WDDM display drivers. Ready in under 2 minutes." },
  { n: "03", title: "Install your apps", body: "Install D5 Render, Lumion, Enscape, Revit, or SketchUp and sign in with your existing licences. BYOL — no extra software fees." },
  { n: "04", title: "Transfer your project files", body: "Upload scene files and assets to Coreframe's secure storage layer over an encrypted transfer." },
  { n: "05", title: "Render", body: "Run at full RTX 5080 speed. For committed-plan studios, files persist on NAS so any team member can continue the session." },
  { n: "06", title: "Download & shut down", body: "Download outputs. Shut down the workstation. Billing stops. Committed-plan files stay on NAS for next time." },
];

const plans = [
  { name: "Ad-hoc", price: "₹399/hr", note: "Per full hour, no commitment. Session scratch storage only, 7-day retention — download outputs before shutting down.", cta: "Get started", href: "/signup", highlight: false },
  { name: "Studio", price: "₹19,000/mo", note: "2 TB NAS · 30-day retention · 5 seats · 40 GPU-hrs · ₹379/hr extra", cta: "Get a quote", href: "https://wa.me/916366889488?text=Hi%20Coreframe%2C%20I%27d%20like%20to%20discuss%20the%20Studio%20plan%20for%20my%20architecture%20studio.", highlight: false },
  { name: "Medium Firm", price: "₹53,000/mo", note: "5 TB NAS · 90-day retention · 12 seats · 120 GPU-hrs · ₹359/hr extra", cta: "Get a quote", href: "https://wa.me/916366889488?text=Hi%20Coreframe%2C%20I%27d%20like%20to%20discuss%20the%20Medium%20Firm%20plan.", highlight: true },
  { name: "Big Firm", price: "₹1,21,000/mo", note: "10 TB NAS · 365-day retention · 25 seats · 300 GPU-hrs · ₹339/hr extra", cta: "Get a quote", href: "https://wa.me/916366889488?text=Hi%20Coreframe%2C%20I%27d%20like%20to%20discuss%20the%20Big%20Firm%20plan.", highlight: false },
  { name: "Big Firm Dedicated", price: "₹1,89,000/mo", note: "A node reserved entirely for one practice. 10 TB NAS · 365-day retention · 25 seats · 500 GPU-hrs · ₹339/hr extra", cta: "Get a quote", href: "https://wa.me/916366889488?text=Hi%20Coreframe%2C%20I%27d%20like%20to%20discuss%20the%20Big%20Firm%20Dedicated%20plan.", highlight: false },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can I run Revit on a cloud GPU workstation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Install Revit on the Windows workstation just as you would locally. Enscape, D5 Render, and other Revit plugins all work. BYOL — bring your own Autodesk licence.",
      },
    },
    {
      "@type": "Question",
      name: "How do team members share project files?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "On committed plans, project files live on persistent NAS storage. Any team member with a named seat can access the same files immediately — no manual file transfers between sessions.",
      },
    },
    {
      "@type": "Question",
      name: "Is cloud rendering faster than a local workstation for architects?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on your local GPU. An RTX 5080 with 16 GB GDDR7 outperforms most mid-range local GPUs for D5 Render, Lumion, and Enscape. The bigger benefit is removing the local bottleneck — your machine stays free while the cloud GPU renders.",
      },
    },
  ],
};

export default function ArchitectsPage() {
  return (
    <div className="relative min-h-screen text-white">
      <BackgroundGlow />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="relative mx-auto max-w-5xl px-6 pb-20 pt-16 md:pt-20">

        <div className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
          Cloud Rendering · Architecture Studios · India
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Cloud GPU for Architecture Studios.<br className="hidden sm:block" /> RTX 5080. Hosted in India.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          Skip GPU hardware upgrades. Launch an RTX 5080 Windows workstation for D5 Render,
          Lumion, Enscape, or Revit. Persistent NAS storage keeps your team's projects accessible
          anytime. All data stays in Bengaluru.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/signup" className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-cyan-300 transition">
            Get started →
          </Link>
          <Link href="/enterprise" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white hover:bg-white/8 transition">
            Studio plans
          </Link>
        </div>

        {/* Use cases */}
        <div className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35 mb-5">What architects use it for</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((u) => (
              <div key={u.title} className="rounded-[18px] border border-white/8 bg-white/[0.02] p-5">
                <div className="text-xl mb-2">{u.icon}</div>
                <h3 className="text-sm font-semibold text-white">{u.title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-white/50">{u.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow */}
        <div className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35 mb-5">How it works</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {workflow.map((s) => (
              <div key={s.n} className="rounded-[18px] border border-white/8 bg-white/[0.02] p-5">
                <div className="text-xs font-bold text-white/20 mb-1">{s.n}</div>
                <h3 className="text-sm font-semibold text-white">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-white/50">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35 mb-5">Plans</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {plans.map((p) => (
              <div key={p.name} className={`relative rounded-[18px] border p-5 ${p.highlight ? "border-cyan-400/25 bg-cyan-400/[0.04]" : "border-white/8 bg-white/[0.02]"}`}>
                {/* Same fix as the enterprise page: left-1/2 shrink-to-fit gives
                    the badge only half the card to lay out in. "Best value" is
                    short enough to survive that today, which is exactly why it
                    would break silently later. */}
                {p.highlight && (
                  <div className="absolute -top-3 inset-x-0 flex justify-center">
                    <span className="whitespace-nowrap rounded-full bg-cyan-400 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-900">Best value</span>
                  </div>
                )}
                <div className={`text-[10px] font-semibold uppercase tracking-wider ${p.highlight ? "text-cyan-300/70" : "text-white/40"}`}>{p.name}</div>
                <div className="mt-1 text-lg font-bold text-white">{p.price}</div>
                <p className="mt-1.5 text-[11px] leading-4 text-white/45">{p.note}</p>
                <Link
                  href={p.href}
                  target={p.href.startsWith("https://wa") ? "_blank" : undefined}
                  rel={p.href.startsWith("https://wa") ? "noreferrer" : undefined}
                  className={`mt-4 block w-full rounded-xl px-4 py-2 text-center text-xs font-semibold transition ${p.highlight ? "bg-cyan-400 text-slate-900 hover:bg-cyan-300" : "border border-white/12 bg-white/[0.05] text-white hover:bg-white/10"}`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-5 text-white/30">
            All prices include 18% GST — what you see is what you pay, and every invoice shows the
            taxable value and GST split. Committed tiers bill extra GPU-hours below the ₹399 ad-hoc
            rate. Persistent NAS storage beyond your plan, or on its own, is ₹1,999/TB/month and is
            retained for as long as it is subscribed. Software is BYOL · Named-user licences work.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="text-slate-400 hover:text-white transition">← Home</Link>
          <Link href="/d5-render" className="text-slate-400 hover:text-white transition">D5 Render →</Link>
          <Link href="/lumion-cloud-gpu" className="text-slate-400 hover:text-white transition">Lumion →</Link>
          <Link href="/enscape-cloud-gpu" className="text-slate-400 hover:text-white transition">Enscape →</Link>
        </div>
      </main>
    </div>
  );
}
