import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Committed Plans for Studios & Firms",
  description:
    "Committed monthly GPU compute plans for design and visualisation studios. Persistent storage, named render seats, and the best per-hour rate — hosted in India.",
  alternates: { canonical: "/enterprise" },
};

const plans = [
  {
    name: "Studio",
    tagline: "Small teams · 3–5 people",
    price: "₹16,000",
    storage: "2 TB",
    seats: "5",
    includedHours: "40",
    highlight: false,
  },
  {
    name: "Medium Firm",
    tagline: "Growing studios · 8–12 people",
    price: "₹38,000",
    storage: "5 TB",
    seats: "12",
    includedHours: "120",
    highlight: true,
  },
  {
    name: "Big Firm",
    tagline: "Established practices · 15–25 people",
    price: "₹85,000",
    storage: "10 TB",
    seats: "25",
    includedHours: "300",
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
            Lock in a monthly plan and get persistent project storage, named render seats,
            and the best GPU-hour rate available — <span className="text-white font-medium">₹250/hr</span> vs ₹400/hr ad-hoc.
            Extra hours beyond your included allocation are billed at ₹250/hr.
          </p>
        </div>

        {/* GPU badge */}
        <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/40">Every instance</span>
          <span className="text-sm font-bold text-white">RTX 5070 Ti · 16 GB GDDR7 · 64 GB ECC RAM · 6-core EPYC</span>
        </div>

        {/* Plans */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-[28px] border p-8 ${
                plan.highlight
                  ? "border-cyan-400/30 bg-cyan-400/[0.05]"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-cyan-400 px-4 py-1 text-xs font-bold uppercase tracking-wider text-slate-900">
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
              <div className="mt-1 text-xs text-white/40">+ ₹250 / GPU-hour beyond included · Excl. GST</div>

              <div className="mt-7 space-y-3 border-t border-white/8 pt-6">
                {[
                  { label: "Persistent storage", value: plan.storage },
                  { label: "Named render seats", value: plan.seats },
                  { label: "Included GPU-hrs / mo", value: plan.includedHours + " hrs" },
                  { label: "Extra GPU-hours", value: "₹250 / hr" },
                  { label: "GPU", value: "RTX 5070 Ti" },
                  { label: "Minimum term", value: "1 month" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-white/50">{label}</span>
                    <span className="font-medium text-white">{value}</span>
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

        {/* BYOL + licensing note */}
        <div className="mt-12 rounded-[20px] border border-white/8 bg-white/[0.02] px-8 py-7">
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
