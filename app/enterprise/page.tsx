import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Monthly GPU Plans for Design Studios & Firms — India",
  description:
    "Committed monthly cloud GPU workstation plans for architecture and design studios. RTX 5080, persistent NAS storage, named seats, GPU-hours from ₹339 — cheaper than the ₹399 ad-hoc rate. Plans from ₹19,000/month, GST included. Hosted in Bengaluru, India.",
  keywords: [
    "cloud GPU plan India",
    "GPU workstation monthly plan India",
    "cloud rendering subscription India",
    "D5 Render monthly plan India",
    "architecture studio cloud GPU",
    "committed cloud GPU India",
  ],
  alternates: { canonical: "/enterprise" },
};

const ADHOC_RATE = "₹399";

const plans = [
  {
    name: "Studio",
    tagline: "Small teams · 3–5 people",
    price: "₹19,000",
    storage: "2 TB",
    retention: "30 days",
    seats: "5",
    includedHours: "40",
    extraRate: "₹379",
    extraNote: "₹20/hr under ad-hoc",
    dedicated: false,
    highlight: false,
  },
  {
    name: "Medium Firm",
    tagline: "Growing studios · 8–12 people",
    price: "₹53,000",
    storage: "5 TB",
    retention: "90 days",
    seats: "12",
    includedHours: "120",
    extraRate: "₹359",
    extraNote: "₹40/hr under ad-hoc",
    dedicated: false,
    highlight: true,
  },
  {
    name: "Big Firm",
    tagline: "Established practices · 15–25 people",
    price: "₹1,21,000",
    storage: "10 TB",
    retention: "365 days",
    seats: "25",
    includedHours: "300",
    extraRate: "₹339",
    extraNote: "₹60/hr under ad-hoc",
    dedicated: false,
    highlight: false,
  },
  {
    name: "Big Firm Dedicated",
    tagline: "A node reserved entirely for one practice",
    price: "₹1,89,000",
    storage: "10 TB",
    retention: "365 days",
    seats: "25",
    includedHours: "500",
    extraRate: "₹339",
    extraNote: "Reserved node",
    dedicated: true,
    highlight: false,
  },
];

const whatsapp = (plan: string) =>
  `https://wa.me/916366889488?text=${encodeURIComponent(
    `Hi Coreframe, I'd like to discuss the ${plan} committed plan for my studio.`
  )}`;

export default function EnterprisePage() {
  return (
    <div className="relative min-h-screen text-white">
      <BackgroundGlow />

      <main className="relative mx-auto max-w-6xl px-6 pb-28 pt-20 md:pt-28">

        {/* Header */}
        <div className="max-w-2xl">
          <div className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
            Committed Monthly Plans
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Render more. Pay less.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
            Committing is genuinely cheaper per hour. Every committed tier bills extra GPU-hours
            below the {ADHOC_RATE}/hr ad-hoc rate — {" "}
            <span className="text-white font-medium">₹379 on Studio, ₹359 on Medium Firm, ₹339 on Big Firm</span>
            {" "}— and you get persistent project storage and named render seats on top.
            Storage is billed openly at ₹1,999/TB/month, a rate you can compare line-for-line
            with AWS S3. Most studios find Medium Firm is where the value concentrates.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/45">
            All prices include 18% GST. What you see is what you pay, and every invoice shows the
            taxable value and GST split so you can claim input tax credit.
          </p>
        </div>

        {/* GPU badge */}
        <div className="mt-8 inline-flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/40">Every instance</span>
          <span className="text-sm font-bold text-white">RTX 5080 · 16 GB GDDR7 · 960 GB/s · 64 GB ECC RAM · 6-core EPYC</span>
        </div>

        {/* Plans */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-[28px] border p-8 ${
                plan.highlight
                  ? "border-cyan-400/30 bg-cyan-400/[0.05]"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {/*
                Badge uses `inset-x-0 flex justify-center`, NOT
                `left-1/2 -translate-x-1/2`. An absolutely positioned box
                shrink-to-fits within the space from its left edge to the
                container's right edge, so anchoring at 50% left it only half the
                card to lay out in — "MOST POPULAR" wrapped onto two lines and
                broke the pill. Spanning the full width and centring with flex
                removes the constraint; whitespace-nowrap prevents a regression.
              */}
              {plan.highlight && (
                <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                  <span className="whitespace-nowrap rounded-full bg-cyan-400 px-4 py-1 text-xs font-bold uppercase tracking-wider text-slate-900">
                    Most Popular
                  </span>
                </div>
              )}

              <div className={`text-xs font-semibold uppercase tracking-[0.22em] ${plan.highlight ? "text-cyan-300/70" : "text-white/40"}`}>
                {plan.name}
              </div>
              <div className="mt-1 text-sm text-white/50">{plan.tagline}</div>

              <div className="mt-5 flex items-end gap-1">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="mb-1 text-sm text-white/40">/ month</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-xs text-white/40">+ {plan.extraRate} / GPU-hr beyond included · incl. 18% GST</span>
                <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${plan.highlight ? "bg-cyan-400/15 text-cyan-300" : "bg-white/8 text-white/40"}`}>
                  {plan.extraNote}
                </span>
              </div>

              <div className="mt-7 space-y-3 border-t border-white/8 pt-6">
                {[
                  { label: "Persistent storage", value: plan.storage },
                  { label: "File retention", value: plan.retention },
                  { label: "Named render seats", value: plan.seats },
                  { label: "Included GPU-hrs / mo", value: plan.includedHours + " hrs" },
                  { label: "Extra GPU-hours", value: `${plan.extraRate} / hr` },
                  { label: "GPU", value: plan.dedicated ? "RTX 5080 (dedicated node)" : "RTX 5080" },
                  { label: "Minimum term", value: "1 month" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-white/50">{label}</span>
                    <span className={`font-medium ${label === "Extra GPU-hours" && plan.highlight ? "text-cyan-300" : "text-white"}`}>{value}</span>
                  </div>
                ))}
              </div>

              <a
                href={whatsapp(plan.name)}
                target="_blank"
                rel="noreferrer"
                className={`mt-8 flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                  plan.highlight
                    ? "bg-cyan-400 text-slate-900 hover:bg-cyan-300"
                    : "border border-white/15 bg-white/[0.06] text-white hover:bg-white/10"
                }`}
              >
                Get a quote on WhatsApp
              </a>
            </div>
          ))}
        </div>

        {/* Storage add-on — standalone, purchasable by anyone */}
        <div className="mt-8 rounded-[20px] border border-white/10 bg-white/[0.03] px-8 py-7 md:flex md:items-center md:justify-between md:gap-8">
          <div>
            <h2 className="text-base font-semibold text-white">Persistent NAS storage — add-on</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
              Extra storage beyond the capacity included in your plan, or storage on its own without a
              committed plan — anyone can buy it, including ad-hoc customers. Files are retained
              for as long as the storage subscription is active. Priced openly so you can compare
              it directly against AWS S3 and the rest of the market.
            </p>
          </div>
          <div className="mt-5 shrink-0 md:mt-0 md:text-right">
            <div className="text-4xl font-bold text-white">₹1,999</div>
            <div className="text-sm text-white/50">/ TB / month · incl. 18% GST</div>
          </div>
        </div>

        {/* Ad-hoc comparison */}
        <div className="mt-6 rounded-[20px] border border-white/8 bg-white/[0.02] px-8 py-7">
          <h2 className="text-base font-semibold text-white">Not ready to commit?</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/55">
            Ad-hoc is {ADHOC_RATE}/GPU-hour with no contract, billed per full hour, and includes 20 GB
            persistent storage free — 50 GB once you add credit, kept for 30 days. Session scratch is
            cleared when the session ends, so download your outputs first, or add persistent NAS above. Every committed tier bills extra hours below {ADHOC_RATE},
            so the more you render, the more the commitment pays for itself.
          </p>
        </div>

        {/* BYOL + licensing note */}
        <div className="mt-6 rounded-[20px] border border-white/8 bg-white/[0.02] px-8 py-7">
          <h2 className="text-base font-semibold text-white">Software licences — BYOL</h2>
          <p className="mt-3 text-sm leading-7 text-white/55">
            All software is <span className="text-white/80 font-medium">Bring Your Own Licence (BYOL)</span>.
            You install your existing licence on the workstation and it activates against your own seat —
            no bundled software fees, no surprises.
          </p>
          <p className="mt-3 text-sm leading-7 text-white/55">
            <span className="text-white/80 font-medium">Named-user licences work.</span>{" "}
            D5 Render, Lumion, Enscape, SolidWorks, 3ds Max, Rhino, SketchUp, and similar apps are all
            fully supported. If your licence is tied to a named user rather than a machine, you log in
            to the workstation as that user and activate normally.
          </p>
          <p className="mt-3 text-sm text-white/40">
            Questions about a specific application or licence type?{" "}
            <a href="mailto:admin@coreframecloud.com" className="text-cyan-400 hover:underline">
              Ask us →
            </a>
          </p>
        </div>

        {/* Compare with ad-hoc */}
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/#pricing"
            className="text-sm text-slate-400 hover:text-white transition"
          >
            ← Back to pricing
          </Link>
          <a
            href={whatsapp("committed")}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl bg-white/[0.07] border border-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            Talk to us on WhatsApp
          </a>
          <a
            href="mailto:admin@coreframecloud.com"
            className="text-sm text-slate-400 hover:text-white transition"
          >
            admin@coreframecloud.com
          </a>
        </div>

      </main>
    </div>
  );
}
