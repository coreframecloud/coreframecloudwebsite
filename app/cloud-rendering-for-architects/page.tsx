import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import {
  getRateCard,
  planTiers,
  adhocRateHourly,
  adhocRate,
  storageRatePerTb,
  billingSentence,
} from "@/lib/rate-card";
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

/**
 * Presentation only — which card is highlighted, and the copy for the ad-hoc
 * card, which is not a plan row. Every figure comes from the rate card.
 *
 * This table used to hold five hardcoded prices AND the sentence "Per full
 * hour, no commitment", which was never true: the API has billed per minute
 * since it was written.
 */
const PLAN_HIGHLIGHT = "Medium Firm";

const planWhatsapp = (plan: string) =>
  `https://wa.me/916366889488?text=${encodeURIComponent(
    `Hi Coreframe, I'd like to discuss the ${plan} plan for my architecture studio.`
  )}`;

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

export default async function ArchitectsPage() {
  const card = await getRateCard();
  const storageRate = storageRatePerTb(card);
  const adhoc = adhocRate(card);

  const plans = [
    {
      name: "Ad-hoc",
      price: adhocRateHourly(card) ?? "—",
      note:
        `${billingSentence(card)} No commitment. 20 GB persistent storage free, ` +
        "50 GB with credit · kept while your account is active. Session scratch cleared at session end — " +
        "download outputs first.",
      cta: "Get started",
      href: "/signup",
      highlight: false,
    },
    ...planTiers(card).map((t) => ({
      name: t.name,
      price: `₹${Math.round(t.monthly_fee_rupees).toLocaleString("en-IN")}/mo`,
      note: [
        t.included_storage_gb >= 1024
          ? `${Math.round(t.included_storage_gb / 1024)} TB NAS`
          : `${t.included_storage_gb} GB NAS`,
        t.file_retention_days ? `${t.file_retention_days}-day retention` : null,
        `${t.named_seats} seats`,
        `${Math.round(t.included_gpu_hours)} GPU-hrs`,
        t.overage_hourly_rate_rupees != null
          ? `₹${Math.round(t.overage_hourly_rate_rupees).toLocaleString("en-IN")}/hr extra`
          : null,
      ].filter(Boolean).join(" · "),
      cta: "Get a quote",
      href: planWhatsapp(t.name),
      highlight: t.name === PLAN_HIGHLIGHT,
    })),
  ];

  return (
    <div className="relative min-h-screen text-ink">
      <BackgroundGlow />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="relative mx-auto max-w-5xl px-6 pb-20 pt-16 md:pt-20">

        <div className="text-sm font-medium uppercase tracking-[0.25em] text-blue">
          Cloud Rendering · Architecture Studios · India
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Cloud GPU for Architecture Studios.<br className="hidden sm:block" /> RTX 5080. Hosted in India.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-2">
          Skip GPU hardware upgrades. Launch an RTX 5080 Windows workstation for D5 Render,
          Lumion, Enscape, or Revit. Persistent NAS storage keeps your team's projects accessible
          anytime. All data stays in Bengaluru.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/signup" className="rounded-full bg-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue transition">
            Get started →
          </Link>
          <Link href="/enterprise" className="rounded-full border border-rule px-5 py-2.5 text-sm text-ink hover:bg-paper-2 transition">
            Studio plans
          </Link>
        </div>

        {/* Use cases */}
        <div className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-3 mb-5">What architects use it for</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((u) => (
              <div key={u.title} className="rounded-[18px] border border-rule bg-paper-2 p-5">
                <div className="text-xl mb-2">{u.icon}</div>
                <h3 className="text-sm font-semibold text-ink">{u.title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-ink-2">{u.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow */}
        <div className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-3 mb-5">How it works</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {workflow.map((s) => (
              <div key={s.n} className="rounded-[18px] border border-rule bg-paper-2 p-5">
                <div className="text-xs font-bold text-ink-3 mb-1">{s.n}</div>
                <h3 className="text-sm font-semibold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-ink-2">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="mt-12">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-3 mb-5">Plans</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {plans.map((p) => (
              <div key={p.name} className={`relative rounded-[18px] border p-5 ${p.highlight ? "border-blue/25 bg-blue/[0.04]" : "border-rule bg-paper-2"}`}>
                {/* Same fix as the enterprise page: left-1/2 shrink-to-fit gives
                    the badge only half the card to lay out in. "Best value" is
                    short enough to survive that today, which is exactly why it
                    would break silently later. */}
                {p.highlight && (
                  <div className="absolute -top-3 inset-x-0 flex justify-center">
                    <span className="whitespace-nowrap rounded-full bg-blue px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Best value</span>
                  </div>
                )}
                <div className={`text-[10px] font-semibold uppercase tracking-wider ${p.highlight ? "text-blue/70" : "text-ink-3"}`}>{p.name}</div>
                <div className="mt-1 text-lg font-bold text-ink">{p.price}</div>
                <p className="mt-1.5 text-[11px] leading-4 text-ink-2">{p.note}</p>
                <Link
                  href={p.href}
                  target={p.href.startsWith("https://wa") ? "_blank" : undefined}
                  rel={p.href.startsWith("https://wa") ? "noreferrer" : undefined}
                  className={`mt-4 block w-full rounded-cf px-4 py-2 text-center text-xs font-semibold transition ${p.highlight ? "bg-blue text-white hover:bg-blue" : "border border-rule bg-paper-2 text-ink hover:bg-paper-2"}`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-5 text-ink-3">
            All prices include 18% GST — what you see is what you pay, and every invoice shows the
            taxable value and GST split.
            {adhoc ? ` Committed tiers bill extra GPU-hours below the ${adhoc} ad-hoc rate.` : ""}
            {storageRate ? ` Persistent NAS storage beyond your plan, or on its own, is ${storageRate}/TB/month and is retained for as long as it is subscribed.` : ""}
            {" "}Software is BYOL · Named-user licences work.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="text-ink-2 hover:text-ink transition">← Home</Link>
          <Link href="/d5-render-cloud-workstation" className="text-ink-2 hover:text-ink transition">D5 Render →</Link>
          <Link href="/lumion-cloud-gpu" className="text-ink-2 hover:text-ink transition">Lumion →</Link>
          <Link href="/enscape-cloud-gpu" className="text-ink-2 hover:text-ink transition">Enscape →</Link>
        </div>
      </main>
    </div>
  );
}
