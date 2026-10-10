import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbList } from "@/lib/seo";
import { BackgroundGlow } from "@/components/home/background-glow";
import Link from "next/link";
import { NODE, WORKSTATION_REPLACEMENT_COST } from "@/lib/node-spec";
import {
  getRateCard,
  planTiers,
  adhocRate as adhocRateOf,
  entryPlanFee,
  storageRatePerTb,
  billingSentence,
  commitmentIsCheaper,
  type RateCardPlan,
} from "@/lib/rate-card";
import { storageTerms } from "@/lib/storage-terms";

export const metadata: Metadata = {
  title: "Monthly GPU Plans for Design Studios",
  description:
    // No prices in the meta description. A description is cached by search
    // engines and quoted by answer engines long after a rate changes, and it is
    // the one string on the page that cannot read the live rate card without
    // making metadata generation depend on a network call.
    "Studio plans for architecture and design firms: one shared pool of RTX 5080 hours, a shared studio drive with far more storage, and logins for the whole team. GST included, Bengaluru.",
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
 * exist in the stylesheet. Every one of them starts at one column — a phone
 * gets a single stack whatever the catalogue holds.
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
  const storage = storageTerms(card);
  const adhocNumber =
    card?.gpus.find((g) => !g.quote_on_request && g.hourly_rate_rupees != null)
      ?.hourly_rate_rupees ?? null;
  const adhoc = adhocRateOf(card);
  const fromFee = entryPlanFee(card);
  const storageRate = storageRatePerTb(card);
  const cheaper = commitmentIsCheaper(card);

  return (
    <div className="relative min-h-screen bg-paper text-ink">
      <JsonLd data={breadcrumbList([{ name: "Monthly plans for studios", path: "/enterprise" }])} />
      <BackgroundGlow />

      <main className="relative">
        <section className="cf-section px-5">
          <div className="cf-wide">
            {/* Header */}
            <div className="max-w-[680px]">
              <div className="cf-eyebrow">Studio plans</div>
              <h1 className="cf-display mt-3">One account for the whole studio.</h1>
              {/* The firm plans are sold on what a team gets, not on hours per
                  rupee: a pooled allowance, a shared drive and logins for every
                  member. Owner's call, 10 Oct 2026. Do not lead with a per-hour
                  comparison against pay-as-you-go here. */}
              <p className="cf-lead mt-5">
                A studio plan isn&rsquo;t just a bigger bag of hours. Your team shares one pool of
                GPU time, works off one shared drive with far more storage than a single account
                gets, and everyone signs in as themselves. You get one bill for all of it.
                {fromFee ? ` Plans start at ${fromFee} a month.` : ""}
              </p>
              <p className="cf-section-copy mt-4">
                Every plan runs on the same machine: {NODE.gpu}, {NODE.vram}, {NODE.ram} of RAM, an{" "}
                {NODE.cpu}, in {NODE.location}. Buying one lands at about{" "}
                {WORKSTATION_REPLACEMENT_COST}, and then it&rsquo;s yours to depreciate, insure and
                replace.
              </p>
              <p className="cf-section-copy mt-4">
                {/* NOT "compare line-for-line with AWS S3". S3 is OBJECT storage —
                    you cannot mount a bucket as a drive inside a Windows session.
                    The equivalent to what we actually sell is managed FILE storage
                    (EFS, Azure Files, Filestore), which costs multiples of this.
                    The old line anchored us against a cheaper category we happened
                    to still beat, and threw away the better argument.

                    Deliberately no competitor NUMBER here. Their prices move —
                    Wasabi went up in July 2026 — and a figure we do not control is
                    a figure we cannot keep true. The claim is categorical, and it
                    stays true across a repricing. */}
                {storageRate
                  ? `Storage is ${storageRate} per TB per month. It's an SMB share your workstation mounts and renders onto, so compare it with managed file storage, not an object-storage archive bucket. There's no egress charge, so pulling your own files back costs nothing.`
                  : ""}
              </p>
              <p className="mt-4 text-sm leading-6 text-ink-2">
                All prices include 18% GST, so the number you see is the number you pay. Every
                invoice shows the taxable value and the GST split, so you can claim input tax
                credit.
              </p>
            </div>

            {/* What a studio plan adds */}
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "One shared pool of hours",
                  body: "The plan's GPU-hours belong to the studio, not to one login. Whoever is on deadline this week uses them, and nobody's personal wallet runs dry mid-render.",
                },
                {
                  title: "A shared studio drive",
                  body: "Much bigger storage than a single account, mounted in every member's session as one drive. Projects, textures and asset libraries live in one place for the whole team.",
                },
                {
                  title: "A login for each person",
                  body: "Each person signs in with their own account, so licences tied to a person keep working. Members ask to join the company account and the admin approves them.",
                },
                {
                  title: "One bill, one admin",
                  body: "Usage from every member lands on the company account with one GST invoice. The admin sees who used what in the portal, and you can ask to be invoiced monthly.",
                },
              ].map((f) => (
                <div key={f.title} className="min-w-0 rounded-cf border border-rule bg-paper-2 p-6">
                  <h2 className="text-base font-semibold text-ink">{f.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink-2">{f.body}</p>
                </div>
              ))}
            </div>

            {/* Plans */}
            {plans.length === 0 ? (
              /* The rate card is the only source for these figures, so when the
                 control plane is unreachable this page has nothing true to print.
                 It says so and offers the human channel, rather than rendering an
                 empty grid or falling back to numbers nobody has verified. */
              <div className="mt-12 rounded-cf border border-rule bg-paper-2 px-6 py-8 sm:px-8 sm:py-10">
                <h2 className="cf-section-title">Plan pricing is briefly unavailable.</h2>
                <p className="cf-section-copy mt-3 max-w-[560px]">
                  Plan figures only come from the source our billing uses, so we never quote a
                  number we don&rsquo;t charge, and that source isn&rsquo;t answering right now.
                  Message us and we&rsquo;ll send you the current tiers.
                </p>
                <a
                  href={whatsapp("committed")}
                  target="_blank"
                  rel="noreferrer"
                  className="cf-btn-primary mt-6 min-h-[44px]"
                >
                  Ask on WhatsApp
                </a>
              </div>
            ) : (
              <div
                className={`mt-12 grid grid-cols-1 items-stretch gap-6 ${
                  GRID_BY_COUNT[plans.length] ?? GRID_FALLBACK
                }`}
              >
                {plans.map((raw) => {
                  const presentation = PLAN_PRESENTATION[raw.name] ?? {};
                  const plan = {
                    name: raw.name,
                    tagline: raw.tagline ?? "",
                    price: inr(raw.monthly_fee_rupees),
                    storage:
                      raw.included_storage_gb >= 1024
                        ? `${Math.round(raw.included_storage_gb / 1024)} TB`
                        : `${raw.included_storage_gb} GB`,
                    retention: raw.file_retention_days ? `${raw.file_retention_days} days` : "—",
                    seats: String(raw.named_seats),
                    includedHours: String(Math.round(raw.included_gpu_hours)),
                    term: raw.commitment_months ? `${raw.commitment_months} months` : "1 month",
                    extraRate:
                      raw.overage_hourly_rate_rupees != null
                        ? inr(raw.overage_hourly_rate_rupees)
                        : null,
                    extraNote:
                      savingVsAdhoc(raw, adhocNumber) ??
                      (presentation.dedicated ? "Reserved node" : null),
                    dedicated: Boolean(presentation.dedicated),
                    highlight: Boolean(presentation.highlight),
                  };
                  return (
                    <div
                      key={plan.name}
                      className={`relative flex min-w-0 flex-col rounded-cf border p-6 sm:p-8 ${
                        plan.highlight ? "border-blue bg-blue-soft" : "border-rule bg-paper-2"
                      }`}
                    >
                      {/*
                        Badge uses `inset-x-0 flex justify-center`, NOT
                        `left-1/2 -translate-x-1/2`. An absolutely positioned box
                        shrink-to-fits within the space from its left edge to the
                        container's right edge, so anchoring at 50% left it only half the
                        card to lay out in — "MOST POPULAR" wrapped onto two lines and
                        broke the pill. Spanning the full width and centring with flex
                        removes the constraint; whitespace-nowrap on two short words
                        prevents a regression.
                      */}
                      {plan.highlight && (
                        <div className="absolute inset-x-0 -top-3 flex justify-center">
                          <span className="rounded-cf bg-blue px-3 py-1 font-mono text-[10px] leading-none font-semibold tracking-[0.14em] whitespace-nowrap text-white uppercase">
                            Most popular
                          </span>
                        </div>
                      )}

                      <div className={`cf-eyebrow ${plan.highlight ? "text-blue" : ""}`}>
                        {plan.name}
                      </div>
                      {/* Two lines reserved. "Small teams · 3–5 people" is one line and
                          "Established practices · 15–25 people" is two, so without this
                          the price below it sits at a different height on every card. */}
                      <div className="mt-2 min-h-[2.5rem] text-sm leading-5 break-words text-ink-2">
                        {plan.tagline}
                      </div>

                      <div className="mt-5 flex flex-wrap items-end gap-x-2">
                        <span className="text-[34px] leading-none font-semibold text-ink">
                          {plan.price}
                        </span>
                        <span className="text-sm text-ink-3">/ month</span>
                      </div>
                      {/* Caption and pill on their own lines with the block height
                          reserved, so a tier with no saving to show does not pull its
                          divider up while its neighbours' stay down. */}
                      <div className="mt-2 min-h-[3.25rem]">
                        {plan.extraRate ? (
                          <p className="text-xs leading-5 text-ink-3">
                            + {plan.extraRate} per GPU-hour beyond the allowance, GST included
                          </p>
                        ) : null}
                        {plan.extraNote ? (
                          <span
                            className={`mt-1.5 inline-block rounded-cf px-2 py-0.5 text-[10px] font-semibold ${
                              plan.highlight ? "bg-blue text-white" : "bg-paper text-ink-2"
                            }`}
                          >
                            {plan.extraNote}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-7 grow space-y-3 border-t border-rule pt-6">
                        {[
                          { label: "Shared studio storage", value: plan.storage },
                          { label: "File retention", value: plan.retention },
                          { label: "Team logins", value: plan.seats },
                          { label: "Shared GPU-hrs / mo", value: plan.includedHours + " hrs" },
                          {
                            label: "Extra GPU-hours",
                            value: plan.extraRate ? `${plan.extraRate} / hr` : "—",
                          },
                          {
                            label: "GPU",
                            value: plan.dedicated ? `${NODE.gpu} (dedicated node)` : NODE.gpu,
                          },
                          // The term is the thing being bought with the discount. It was
                          // hardcoded "1 month" on every card while the tiers differed by
                          // 15/10/15 percent for no stated commitment at all.
                          { label: "Minimum term", value: plan.term },
                        ].map(({ label, value }) => (
                          <div
                            key={label}
                            className="flex items-baseline justify-between gap-3 text-sm"
                          >
                            {/* The label may wrap; the VALUE must not. A wrapped value
                                drops its row's height and takes every row under it with
                                it, which is most of what looked misaligned here. The
                                values are short by construction — a fee, an hour count,
                                a card name — so this cannot run off a phone. */}
                            <span className="min-w-0 leading-5 text-ink-2">{label}</span>
                            <span
                              className={`shrink-0 text-right font-medium ${
                                label === "Extra GPU-hours" && plan.highlight
                                  ? "text-blue"
                                  : "text-ink"
                              }`}
                            >
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>

                      <a
                        href={whatsapp(plan.name)}
                        target="_blank"
                        rel="noreferrer"
                        className={`mt-8 min-h-[44px] w-full ${
                          plan.highlight ? "cf-btn-primary" : "cf-btn-secondary"
                        }`}
                      >
                        Get a quote
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <div className="cf-rule" />

        {/* Storage add-on — standalone, purchasable by anyone */}
        <section className="cf-section px-5">
          <div className="cf-wide">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto] md:items-end">
              <div className="min-w-0">
                <h2 className="cf-section-title">Persistent NAS storage, on its own.</h2>
                <p className="cf-section-copy mt-4 max-w-[560px]">
                  Add storage beyond what your plan includes, or buy it with no plan at all. Ad-hoc
                  customers can have it too. Files stay for as long as the storage subscription is
                  active. It&rsquo;s a drive your session mounts and renders onto, so compare it with
                  managed file storage rather than an archive bucket. Pull a finished project back as
                  often as you like. There&rsquo;s no egress charge.
                </p>
              </div>
              <div className="min-w-0">
                <div className="text-[34px] leading-none font-semibold text-ink">
                  {storageRate ?? "—"}
                </div>
                <div className="mt-2 text-sm text-ink-2">per TB per month, GST included</div>
              </div>
            </div>
          </div>
        </section>

        <div className="cf-rule" />

        {/* Ad-hoc comparison */}
        <section className="cf-section px-5">
          <div className="cf-col">
            <h2 className="cf-section-title">Not ready to commit?</h2>
            {/* This paragraph said "billed per full hour" until 18 Aug 2026. The
                API has always charged by the minute, so the page was quoting the
                customer a worse deal than the platform gives them. The sentence
                now comes from the rate card's own billing_granularity field. */}
            <p className="cf-section-copy mt-4">
              Ad-hoc is {adhoc ? `${adhoc} per GPU-hour ` : ""}with no contract. It comes with{" "}
              {storage.paidGb} GB of persistent storage included, kept while your account is
              active. {billingSentence(card)} Session scratch is cleared when the session ends,
              so pull your outputs down first, or add persistent NAS storage.
              {cheaper && adhoc
                ? ` Every committed tier bills extra hours below ${adhoc}, so the more you render, the more the commitment pays back.`
                : ""}
            </p>

            <h2 className="cf-section-title mt-14">Licences stay yours.</h2>
            <p className="cf-section-copy mt-4">
              You bring your own licence for all software. Install your existing seat on the
              workstation and it activates against your own account. We don&rsquo;t charge a
              software fee on top.
            </p>
            <p className="cf-section-copy mt-4">
              Named-user licences work. D5 Render, Lumion, Enscape, SolidWorks, 3ds Max, Rhino and
              SketchUp all run here. If your licence is tied to a person rather than a machine, you
              sign in to the workstation as that person and activate as normal.
            </p>
            <p className="cf-section-copy mt-4">
              Got a specific application or licence type in mind? Email{" "}
              <a
                href="mailto:admin@coreframecloud.com"
                className="break-words text-blue underline underline-offset-4"
              >
                admin@coreframecloud.com
              </a>
              .
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href={whatsapp("committed")}
                target="_blank"
                rel="noreferrer"
                className="cf-btn-primary min-h-[44px]"
              >
                Talk to us on WhatsApp
              </a>
              <Link href="/pricing" className="cf-btn-secondary min-h-[44px]">
                Back to pricing
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
