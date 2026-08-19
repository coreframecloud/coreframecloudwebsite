import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import Link from "next/link";
import {
  getRateCard,
  planTiers,
  adhocRate as adhocRateOf,
  bestOverageRate,
  entryPlanFee,
  storageRatePerTb,
  billingSentence,
  commitmentIsCheaper,
  type RateCardPlan,
} from "@/lib/rate-card";

export const metadata: Metadata = {
  title: "Monthly GPU Plans for Design Studios & Firms — India",
  description:
    // No prices in the meta description. A description is cached by search
    // engines and quoted by answer engines long after a rate changes, and it is
    // the one string on the page that cannot read the live rate card without
    // making metadata generation depend on a network call.
    "Committed monthly cloud GPU workstation plans for architecture and design studios: RTX 5080 workstations, persistent NAS storage, named render seats and included GPU-hours, with every tier billing extra hours below the ad-hoc rate. GST included. Hosted in Bengaluru, India.",
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

/**
 * PRESENTATION ONLY. Every number on this page — monthly fee, included hours,
 * seats, storage, retention and the overage rate — now comes from the `plans`
 * table via /public/rate-card. This map carries the things a database row has
 * no opinion about: which card wears the "Most Popular" badge, and which tier
 * is a dedicated node.
 *
 * Until 18 Aug 2026 the whole table was hardcoded here, and it was the reason
 * the plans table was invented: an operator could change a tier in the admin
 * panel and this page would keep quoting the old figures at the exact customer
 * about to sign for them. Unknown plan names fall through to the defaults, so a
 * new tier added in the admin panel appears here on its own.
 */
/**
 * Column count follows the number of plans.
 *
 * This was a fixed `xl:grid-cols-4` while the catalogue holds three tiers, so
 * each card got a quarter of the row and sat ~25% narrower than it needed to.
 * That narrowness is what wrapped "Included GPU-hrs / mo" onto two lines on
 * some cards and not others, which is what pushed every row below it out of
 * alignment. The cards looked randomly aligned; they were just different
 * heights for content reasons.
 *
 * Written as whole literal class strings, not composed at runtime: Tailwind
 * scans source text, so a class built by concatenation is a class that does not
 * exist in the stylesheet.
 */
const GRID_BY_COUNT: Record<number, string> = {
  1: "max-w-md",
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
};
const GRID_FALLBACK = "md:grid-cols-2 xl:grid-cols-4";

const PLAN_PRESENTATION: Record<string, { highlight?: boolean; dedicated?: boolean }> = {
  "Medium Firm": { highlight: true },
  "Big Firm Dedicated": { dedicated: true },
};

function inr(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

/** "₹20/hr under ad-hoc", or null when either figure is missing. */
function savingVsAdhoc(plan: RateCardPlan, adhoc: number | null): string | null {
  if (adhoc == null || plan.overage_hourly_rate_rupees == null) return null;
  const delta = Math.round(adhoc - plan.overage_hourly_rate_rupees);
  return delta > 0 ? `₹${delta}/hr under ad-hoc` : null;
}

const whatsapp = (plan: string) =>
  `https://wa.me/916366889488?text=${encodeURIComponent(
    `Hi Coreframe, I'd like to discuss the ${plan} committed plan for my studio.`
  )}`;

export default async function EnterprisePage() {
  const card = await getRateCard();
  const plans = planTiers(card);
  const adhocNumber =
    card?.gpus.find((g) => !g.quote_on_request && g.hourly_rate_rupees != null)
      ?.hourly_rate_rupees ?? null;
  const adhoc = adhocRateOf(card);
  const bestOverage = bestOverageRate(card);
  const fromFee = entryPlanFee(card);
  const storageRate = storageRatePerTb(card);
  const cheaper = commitmentIsCheaper(card);

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
            {/* Conditional on the comparison HOLDING, not on the numbers being
                present. Modelling an ad-hoc cut to ₹199 against the old tiers
                left this paragraph asserting that ₹379/hr was "cheaper" than
                ₹199/hr — on the page whose entire job is to sell the commitment. */}
            {cheaper && adhoc && bestOverage ? (
              <>
                Committing is genuinely cheaper per hour. Every committed tier bills GPU-hours
                below the ad-hoc rate — down to{" "}
                <span className="font-medium text-white">{bestOverage}/hr against {adhoc}/hr</span>,
                on included hours and extra ones alike
              </>
            ) : (
              <>
                A fixed monthly fee with GPU-hours, persistent project storage and named
                render seats included
              </>
            )}.
            {storageRate ? ` Storage is billed openly at ${storageRate}/TB/month, a rate you can compare line-for-line with AWS S3.` : ""}
            {fromFee ? ` Plans start at ${fromFee}/month.` : ""}
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
        {plans.length === 0 ? (
          /* The rate card is the only source for these figures, so when the
             control plane is unreachable this page has nothing true to print.
             It says so and offers the human channel, rather than rendering an
             empty grid or falling back to numbers nobody has verified. */
          <div className="mt-12 rounded-[24px] border border-white/10 bg-white/[0.03] px-8 py-10 text-center">
            <h2 className="text-lg font-semibold text-white">Plan pricing is briefly unavailable</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/55">
              We publish plan figures from one source so the page can never quote a
              number we do not charge, and that source is not answering right now.
              Message us and we will send the current tiers straight away.
            </p>
            <a
              href={whatsapp("committed")}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
            >
              Ask on WhatsApp
            </a>
          </div>
        ) : (
        <div className={`mt-12 grid items-stretch gap-6 ${GRID_BY_COUNT[plans.length] ?? GRID_FALLBACK}`}>
          {plans.map((raw) => {
            const presentation = PLAN_PRESENTATION[raw.name] ?? {};
            const plan = {
              name: raw.name,
              tagline: raw.tagline ?? "",
              price: inr(raw.monthly_fee_rupees),
              storage: raw.included_storage_gb >= 1024
                ? `${Math.round(raw.included_storage_gb / 1024)} TB`
                : `${raw.included_storage_gb} GB`,
              retention: raw.file_retention_days ? `${raw.file_retention_days} days` : "—",
              seats: String(raw.named_seats),
              includedHours: String(Math.round(raw.included_gpu_hours)),
              term: raw.commitment_months ? `${raw.commitment_months} months` : "1 month",
              extraRate: raw.overage_hourly_rate_rupees != null ? inr(raw.overage_hourly_rate_rupees) : null,
              extraNote: savingVsAdhoc(raw, adhocNumber) ?? (presentation.dedicated ? "Reserved node" : null),
              dedicated: Boolean(presentation.dedicated),
              highlight: Boolean(presentation.highlight),
            };
            return (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-[28px] border p-8 ${
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
              {/* Two lines reserved. "Small teams · 3–5 people" is one line and
                  "Established practices · 15–25 people" is two, so without this
                  the price below it sits at a different height on every card. */}
              <div className="mt-1 min-h-[2.5rem] text-sm leading-5 text-white/50">{plan.tagline}</div>

              <div className="mt-5 flex items-end gap-1">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="mb-1 text-sm text-white/40">/ month</span>
              </div>
              {/* Caption and pill on their own lines with the block height
                  reserved, so a tier with no saving to show does not pull its
                  divider up while its neighbours' stay down. */}
              <div className="mt-1 min-h-[3.25rem]">
                {plan.extraRate ? (
                  <p className="text-xs leading-5 text-white/40">
                    + {plan.extraRate} / GPU-hr beyond included · incl. 18% GST
                  </p>
                ) : null}
                {plan.extraNote ? (
                  <span className={`mt-1.5 inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${plan.highlight ? "bg-cyan-400/15 text-cyan-300" : "bg-white/8 text-white/40"}`}>
                    {plan.extraNote}
                  </span>
                ) : null}
              </div>

              <div className="mt-7 grow space-y-3 border-t border-white/8 pt-6">
                {[
                  { label: "Persistent storage", value: plan.storage },
                  { label: "File retention", value: plan.retention },
                  { label: "Named render seats", value: plan.seats },
                  { label: "Included GPU-hrs / mo", value: plan.includedHours + " hrs" },
                  { label: "Extra GPU-hours", value: plan.extraRate ? `${plan.extraRate} / hr` : "—" },
                  { label: "GPU", value: plan.dedicated ? "RTX 5080 (dedicated node)" : "RTX 5080" },
                  // The term is the thing being bought with the discount. It was
                  // hardcoded "1 month" on every card while the tiers differed by
                  // 15/10/15 percent for no stated commitment at all.
                  { label: "Minimum term", value: plan.term },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-baseline justify-between gap-3 text-sm">
                    {/* The label may wrap; the VALUE must not. A wrapped value
                        drops its row's height and takes every row under it with
                        it, which is most of what looked misaligned here. */}
                    <span className="min-w-0 leading-5 text-white/50">{label}</span>
                    <span className={`shrink-0 whitespace-nowrap font-medium ${label === "Extra GPU-hours" && plan.highlight ? "text-cyan-300" : "text-white"}`}>{value}</span>
                  </div>
                ))}
              </div>

              <a
                href={whatsapp(plan.name)}
                target="_blank"
                rel="noreferrer"
                className={`mt-8 flex w-full items-center justify-center whitespace-nowrap rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                  // `border border-transparent` on the highlighted variant is
                  // not decoration. The other two carry a 1px border, making
                  // them 2px taller, so without a matching border here the
                  // primary button sat 2px lower than its neighbours — small
                  // enough to read as "randomly aligned" rather than as a bug.
                  plan.highlight
                    ? "border border-transparent bg-cyan-400 text-slate-900 hover:bg-cyan-300"
                    : "border border-white/15 bg-white/[0.06] text-white hover:bg-white/10"
                }`}
              >
                Get a quote on WhatsApp
              </a>
            </div>
            );
          })}
        </div>
        )}

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
            <div className="text-4xl font-bold text-white">{storageRate ?? "—"}</div>
            <div className="text-sm text-white/50">/ TB / month · incl. 18% GST</div>
          </div>
        </div>

        {/* Ad-hoc comparison */}
        <div className="mt-6 rounded-[20px] border border-white/8 bg-white/[0.02] px-8 py-7">
          <h2 className="text-base font-semibold text-white">Not ready to commit?</h2>
          {/* This paragraph said "billed per full hour" until 18 Aug 2026. The
              API has always charged by the minute, so the page was quoting the
              customer a worse deal than the platform gives them. The sentence
              now comes from the rate card's own billing_granularity field. */}
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/55">
            Ad-hoc is {adhoc ? `${adhoc}/GPU-hour ` : ""}with no contract, and includes 20 GB
            persistent storage free — 50 GB once you add credit, kept for 30 days. {billingSentence(card)}
            {" "}Session scratch is cleared when the session ends, so download your outputs first,
            or add persistent NAS above.
            {cheaper && adhoc ? ` Every committed tier bills extra hours below ${adhoc}, so the more you render, the more the commitment pays for itself.` : ""}
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
