import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { ORG_ID, SITE, breadcrumbList, faqPage, regionalOffers } from "@/lib/seo";
import { formatMoney, type Currency } from "@/lib/money";
import { PageByline } from "@/components/seo/page-byline";
import Link from "next/link";
import { NODE } from "@/lib/node-spec";
import {
  getRateCard,
  planTiers,
  quotePlans,
  entryPlanFee,
  storageRatePerTb,
  planStorageIsFree,
  taxWords,
  type RateCardPlan,
} from "@/lib/rate-card";
import { Clock, Cloud, UserRound, ReceiptText } from "lucide-react";
import { GenImage } from "@/components/visuals/media";
import { TeamStorageDiagram } from "@/components/visuals/diagrams";

const TITLE = "Team Plans: Shared RTX 5080 Hours for Studios | Coreframe";
const KEYWORDS = [
  "team GPU plan India",
  "cloud GPU plan India",
  "GPU workstation monthly plan India",
  "cloud rendering subscription India",
  "D5 Render monthly plan India",
  "architecture studio cloud GPU",
];

/** "2–5 TB" across the priced plans, from the rate card. */
function storageRange(plans: RateCardPlan[]): string | null {
  const tb = plans.map((p) => p.included_storage_gb / 1024).filter((n) => n > 0);
  if (!tb.length) return null;
  const lo = Math.min(...tb), hi = Math.max(...tb);
  const f = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
  return lo === hi ? `${f(lo)} TB` : `${f(lo)}–${f(hi)} TB`;
}

/**
 * Title, description and canonical (SEO review 18 Oct 2026, 3.7). The entry
 * fee in the description is read from the rate card at render time (the page
 * renders per request); without a rate card the description carries no price
 * rather than a typed one. In the page's currency only (owner, 18 Oct 2026):
 * this view renders /enterprise in rupees and /usd/enterprise in dollars
 * (proxy.ts rewrites a visitor outside India).
 */
export async function enterpriseMetadata(currency: Currency): Promise<Metadata> {
  const card = await getRateCard();
  const fee = entryPlanFee(card, currency);
  const storage = storageRange(planTiers(card));
  const description =
    `Monthly team plans for design studios: one shared pool of RTX 5080 hours, ${storage ? `${storage} shared storage` : "shared storage"}, ` +
    `a login per person and one ${currency === "USD" ? "invoice, no GST" : "GST invoice"}.${fee ? ` From ${fee}/month.` : ""}`;
  return {
    title: { absolute: TITLE },
    description,
    keywords: KEYWORDS,
    alternates: { canonical: "/enterprise" },
  };
}

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

// Team plans, renamed from "Studio plans" 18 Oct 2026. getRateCard() already
// maps the old names, but both spellings stay here so the badge survives either
// side of the plans-table migration whatever path the name took.
const PLAN_PRESENTATION: Record<string, { highlight?: boolean; dedicated?: boolean }> = {
  "Medium Team": { highlight: true },
  "Medium Firm": { highlight: true },
  "Large Team (Dedicated)": { dedicated: true },
  "Big Firm Dedicated": { dedicated: true },
};

function inr(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}



/**
 * /enterprise, rewritten 11 Oct 2026 for studio owners (owner's brief): plain
 * words, short lines, pictures instead of paragraphs. Four ideas, the plan
 * cards (every figure from the live rate card), a short FAQ and sign-up.
 * No protocol or storage internals on this page.
 */
const IDEAS = [
  { icon: Clock, title: "One shared pool of hours", line: "The hours belong to the studio. Whoever is on deadline uses them." },
  { icon: Cloud, title: "Shared cloud storage", line: "One big studio drive. Every project, texture and library in one place." },
  { icon: UserRound, title: "A login for each person", line: "Everyone signs in as themselves. The admin approves who joins." },
  { icon: ReceiptText, title: "One bill, one admin", line: "One GST invoice for the whole team. See who used what." },
];

export default async function EnterpriseView({ currency }: { currency: Currency }) {
  const usdView = currency === "USD";
  const ideas = usdView
    ? IDEAS.map((i) => (i.icon === ReceiptText ? { ...i, line: "One invoice for the whole team. See who used what." } : i))
    : IDEAS;
  const card = await getRateCard();
  const priced = planTiers(card);
  const plans = [...priced, ...quotePlans(card)];
  const storageRateNumber = card?.storage_rate_rupees_per_tb_month ?? null;
  const adhocNumber =
    card?.gpus.find((g) => !g.quote_on_request && g.hourly_rate_rupees != null)
      ?.hourly_rate_rupees ?? null;
  const fromFee = entryPlanFee(card, currency);
  const storageRate = storageRatePerTb(card, currency);

  // The answer-first passage and the per-plan Offers (SEO review 18 Oct 2026, 3.7).
  const entry = priced[0];
  const adhocText = adhocNumber != null ? inr(adhocNumber) : null;
  const teamLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE}/enterprise#team-plans`,
    name: "Team plans: shared RTX 5080 hours for studios",
    serviceType: "Monthly cloud GPU workstation plan",
    provider: { "@id": ORG_ID },
    url: `${SITE}/enterprise`,
    isRelatedTo: { "@id": `${SITE}/#gpu-workstation-service` },
    offers: priced.flatMap((p) =>
      p.usd_monthly_fee
        ? regionalOffers({
            name: `Team plan: ${p.name}`,
            inr: p.monthly_fee_rupees,
            usd: p.usd_monthly_fee,
            url: `${SITE}/enterprise#plans`,
            description: `${p.included_gpu_hours} GPU-hours a month, ${p.named_seats} logins, ${Math.round(p.included_storage_gb / 1024)} TB storage${p.commitment_months ? `, ${p.commitment_months}-month commitment` : ""}.`,
            unit: { unitText: "month", billingDuration: "P1M" },
          })
        : [],
    ),
  };

  const faqs = [
    { q: "How many people can use one plan?", a: "Each plan includes a set number of team logins, shown on its card. Everyone signs in with their own account." },
    { q: "What if we use more hours than the plan includes?", a: "You keep working. Extra hours are charged at the plan's lower hourly rate, shown on each card." },
    { q: "Do we need our own software licences?", a: "For paid software, yes: Lumion and similar tools run on your own licence. D5 Render, Blender and Twinmotion come installed." },
    usdView
      ? { q: "Is there GST?", a: "No. Plans billed in US dollars carry no GST (export of services), and the invoice is in US dollars." }
      : { q: "Is GST included?", a: "Yes. Every price includes 18% GST, and the invoice shows the split so you can claim input tax credit." },
    ...(storageRate ? [{ q: "Can we add more storage?", a: `Yes, at ${storageRate} per TB a month, ${taxWords(currency)}.` }] : []),
  ];

  return (
    <div className="relative min-h-screen bg-paper text-ink">
      <JsonLd data={breadcrumbList([{ name: "Team plans", path: "/enterprise" }])} />
      <JsonLd data={faqPage(faqs)} />
      {teamLd.offers.length ? <JsonLd data={teamLd} /> : null}

      <main className="relative">
        <section className="cf-section cf-pagehero px-5">
          <div className="cf-wide grid items-center gap-10 lg:grid-cols-[1fr_1.05fr]">
            <div className="min-w-0">
              <div className="cf-eyebrow">Team plans</div>
              <h1 className="cf-display mt-3">One account for the whole studio.</h1>
              <p className="cf-lead mt-5">
                Shared hours. Shared storage. A login for everyone. One bill.
              </p>
              {/* Answer-first, every figure from the rate card (SEO review 18 Oct 2026, 3.7). */}
              {usdView ? (
                fromFee ? (
                  <p className="mt-4 max-w-[52ch] text-[15.5px] leading-7 text-ink-2">
                    Team plans give a studio one shared pool of {NODE.gpu} hours, shared cloud storage and one invoice.
                    Plans start at {fromFee} a month, no GST
                    {entry?.usd_overage_hourly_rate ? `, with extra hours at ${formatMoney(entry.usd_overage_hourly_rate, "USD")}` : ""}.
                  </p>
                ) : null
              ) : fromFee ? (
                <p className="mt-4 max-w-[52ch] text-[15.5px] leading-7 text-ink-2">
                  Team plans give a studio one shared pool of {NODE.gpu} hours, shared cloud storage and one GST invoice. Plans
                  start at {fromFee} a month incl. GST
                  {entry?.effective_included_hourly_rupees != null && adhocText
                    ? ` (about ${inr(entry.effective_included_hourly_rupees)} per included hour against ${adhocText} pay-as-you-go)`
                    : ""}
                  {entry?.overage_hourly_rate_rupees != null ? `, with extra hours at ${inr(entry.overage_hourly_rate_rupees)}` : ""}.
                </p>
              ) : null}
              <PageByline path="/enterprise" className="mt-3 text-ink-3" />
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup" className="cf-btn-primary">Sign up your studio</Link>
                <a href="#plans" className="cf-btn-secondary">See plans</a>
              </div>
            </div>
            {/* HERO IMAGE SLOT. Gemini-generated (owner, 11 Oct 2026): the whole
                studio on one shared storage. Always labelled as generated. */}
            <GenImage
              src="/visuals/gen-studio-shared-storage-photo-16x9.webp"
              alt="A design studio where every laptop connects to one shared storage"
              width={1600}
              height={914}
              sizes="(max-width: 1024px) 100vw, 520px"
              parallax
              priority
            />
          </div>
        </section>

        {/* The four ideas */}
        <section className="cf-section px-5">
          <div className="cf-wide">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {ideas.map((f) => (
                <div key={f.title} className="cf-card cfh-lift">
                  <f.icon aria-hidden className="h-7 w-7 text-blue" strokeWidth={1.6} />
                  <h2 className="mt-4 font-heading text-[18px] leading-6 font-medium text-ink">{f.title}</h2>
                  <p className="mt-2 text-[14.5px] leading-6 text-ink-2">{f.line}</p>
                </div>
              ))}
            </div>

            <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
              <div className="rounded-[24px] bg-tint-blue p-6 sm:p-8">
                <TeamStorageDiagram />
              </div>
              <div>
                <h2 className="cf-section-title">Everyone works from the same files.</h2>
                <p className="cf-section-copy mt-3">No copying drives around. Open a project, and the whole team sees the latest version.</p>
                <GenImage
                  src="/visuals/gen-studio-shared-storage-iso-16x9.webp"
                  alt="Five desks working from one cloud storage above them"
                  width={1600}
                  height={914}
                  className="mt-6"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Plans */}
        <section id="plans" className="cf-section scroll-mt-24 px-5 pt-0">
          <div className="cf-wide">
            <h2 className="cf-section-title">Pick a plan.</h2>
            <p className="cf-section-copy mt-2">Every plan runs on the same {NODE.gpu} workstations in {NODE.location}.</p>
            {plans.length === 0 ? (
              /* Figures only ever come from the rate card. If it is unreachable
                 the page says so rather than inventing numbers. */
              <div className="mt-10 rounded-[24px] bg-paper-2 px-6 py-8 sm:px-8">
                <h3 className="font-heading text-[22px] font-medium">Plan prices are briefly unavailable.</h3>
                <p className="cf-section-copy mt-2">Please check back in a few minutes, or sign up and we&rsquo;ll be in touch.</p>
                <Link href="/signup" className="cf-btn-primary mt-6">Sign up</Link>
              </div>
            ) : (
              <div className={`mt-10 grid grid-cols-1 items-stretch gap-6 ${GRID_BY_COUNT[plans.length] ?? GRID_FALLBACK}`}>
                {plans.map((raw) => (
                  <PlanCard key={raw.name} raw={raw} adhoc={adhocNumber} storageRate={storageRateNumber} currency={currency} />
                ))}
              </div>
            )}
            {storageRate ? (
              <p className="mt-8 text-[15px] text-ink-2">
                Need more storage? <span className="font-semibold text-ink">{storageRate}</span> per TB a month, {taxWords(currency)}.
              </p>
            ) : null}
          </div>
        </section>

        {/* FAQ */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-col">
            <h2 className="cf-section-title">Questions</h2>
            <div className="mt-6 divide-y divide-rule rounded-[24px] border border-rule">
              {faqs.map((f) => (
                <details key={f.q} className="group px-6 py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                    {f.q}
                    <span aria-hidden className="text-ink-3 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-[15px] leading-6 text-ink-2">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <div className="relative isolate overflow-hidden rounded-[32px] bg-night px-7 py-14 text-white sm:px-14">
              <h2 className="font-heading text-[30px] leading-tight font-medium sm:text-[38px]">Bring the whole studio.</h2>
              <p className="mt-3 max-w-md text-white/70">Sign up, add your team, and start on the plan that fits.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup" className="cfh-pill-light">Sign up</Link>
                <Link href="/pricing" className="cfh-pill-ghost">Pricing</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/**
 * One plan. USD (a visitor outside India): the plan's own dollar fee and
 * extra-hour rate from the rate card (usd_monthly_fee, usd_overage_hourly_rate);
 * the per-included-hour comparison is a rupee figure with no dollar
 * counterpart on the card, so the dollar card leaves it out. A plan without a
 * dollar fee shows "Price on request" rather than a rupee price.
 */
function PlanCard({
  raw,
  adhoc,
  storageRate,
  currency,
}: {
  raw: RateCardPlan;
  adhoc: number | null;
  storageRate: number | null;
  currency: Currency;
}) {
  const usdView = currency === "USD";
  const usdFee = raw.usd_monthly_fee != null && raw.usd_monthly_fee > 0 ? raw.usd_monthly_fee : null;
  const quote = Boolean(raw.quote_on_request) || (usdView && usdFee == null);
  const presentation = PLAN_PRESENTATION[raw.name] ?? {};
  const storage = raw.included_storage_gb >= 1024 ? `${Math.round(raw.included_storage_gb / 1024)} TB` : `${raw.included_storage_gb} GB`;
  const extraRate = usdView
    ? raw.usd_overage_hourly_rate != null && raw.usd_overage_hourly_rate > 0
      ? formatMoney(raw.usd_overage_hourly_rate, "USD")
      : null
    : raw.overage_hourly_rate_rupees != null
      ? inr(raw.overage_hourly_rate_rupees)
      : null;
  // What an hour inside the allowance actually costs, from the rate card
  // (effective_included_hourly_rupees). The fee alone, without the storage it
  // includes, read as dearer than pay-as-you-go (owner, 11 Oct 2026).
  const effective =
    !usdView && raw.effective_included_hourly_rupees != null ? Math.round(raw.effective_included_hourly_rupees) : null;
  const storageFree = !quote && planStorageIsFree(raw);
  // The fee includes the storage at the published per-TB rate; the hourly
  // figure above is the fee less that (owner, 11 Oct 2026).
  const storageWorth =
    storageRate != null && storageRate > 0 ? Math.round((raw.included_storage_gb / 1024) * storageRate) : null;
  const savePct = effective != null && adhoc != null && adhoc > 0 ? Math.round((1 - effective / adhoc) * 100) : null;
  const note = presentation.dedicated ? "Reserved machine" : null;
  const rows = [
    { label: "Shared cloud storage", value: storage },
    { label: "Team logins", value: String(raw.named_seats) },
    { label: "Shared hours / month", value: `${Math.round(raw.included_gpu_hours)} hrs` },
    { label: "Extra hours", value: quote ? "On request" : extraRate ? `${extraRate} / hr` : "—" },
    { label: "Files kept", value: raw.file_retention_days ? `${raw.file_retention_days} days` : "—" },
    { label: "Minimum term", value: raw.commitment_months ? `${raw.commitment_months} months` : "1 month" },
  ];
  return (
    <div
      className={`cfh-lift relative flex min-w-0 flex-col rounded-[24px] p-7 sm:p-8 ${
        presentation.highlight ? "bg-ink text-white" : "bg-paper-2"
      }`}
    >
      {presentation.highlight ? (
        <span className="absolute top-6 right-6 rounded-full bg-blue px-3 py-1 text-[11px] font-semibold tracking-[0.06em] text-white uppercase">
          Most popular
        </span>
      ) : null}
      <p className="font-heading text-[19px] font-medium">{raw.name}</p>
      <p className={`mt-1 min-h-[2.5rem] text-[14px] ${presentation.highlight ? "text-white/65" : "text-ink-2"}`}>{raw.tagline ?? ""}</p>
      <p className="mt-4 flex items-end gap-2">
        {quote ? (
          <span className="font-heading text-[30px] leading-none font-medium">Price on request</span>
        ) : (
          <>
            <span className="font-heading text-[36px] leading-none font-medium">
              {usdView && usdFee != null ? formatMoney(usdFee, "USD") : inr(raw.monthly_fee_rupees)}
            </span>
            <span className={presentation.highlight ? "text-white/60" : "text-ink-3"}>/ month</span>
          </>
        )}
      </p>
      {effective != null ? (
        <div className={`mt-4 rounded-2xl px-4 py-3 ${presentation.highlight ? "bg-white/10" : "bg-tint-blue"}`}>
          <p className="font-heading text-[20px] leading-7 font-medium">
            ≈ {inr(effective)} per hour{savePct != null && savePct > 0 ? ` · ${savePct}% less` : ""}
          </p>
          <p className={`text-[13px] ${presentation.highlight ? "text-white/70" : "text-ink-2"}`}>
            {storageFree
              ? `${storage} shared storage included, free`
              : storageWorth != null
                ? `after the ${storage} storage included (worth ${inr(storageWorth)})`
                : `${storage} storage included`}
            {adhoc != null ? ` · pay as you go is ${inr(adhoc)}/hr` : ""}
          </p>
        </div>
      ) : null}
      <p className="mt-2 min-h-[1.5rem]">
        {note ? (
          <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${presentation.highlight ? "bg-white/15" : "bg-tint-blue text-blue-ink"}`}>{note}</span>
        ) : null}
      </p>
      <dl className={`mt-6 grow space-y-3 border-t pt-6 text-[14px] ${presentation.highlight ? "border-white/15" : "border-rule"}`}>
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-3">
            <dt className={presentation.highlight ? "text-white/65" : "text-ink-2"}>{r.label}</dt>
            <dd className="shrink-0 font-medium">{r.value}</dd>
          </div>
        ))}
      </dl>
      <Link href="/signup" className={`mt-8 w-full ${presentation.highlight ? "cfh-pill-light" : "cf-btn-primary"}`}>
        Sign up
      </Link>
    </div>
  );
}
