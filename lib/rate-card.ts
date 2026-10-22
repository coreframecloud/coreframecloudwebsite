/**
 * Live rate card, fetched from the control plane.
 *
 * The website used to hardcode prices in a dozen components. They drifted apart
 * from each other and from what billing actually charged — the hero said one
 * number, the FAQ another "charged per full hour", and sessions billed a third
 * per minute. Whatever a page shows now comes from the same `gpu_profiles` rows
 * the admin rate card edits and the billing code charges.
 *
 * Revalidated hourly, so a rate change in the admin panel reaches the site
 * within the hour without a redeploy. Session pricing is unaffected by the
 * cache: the API is authoritative and a session snapshots its rate at launch.
 */

import { API_BASE } from "@/lib/api-base";
import { formatMoney, usdRates, type Currency, type UsdRateCard } from "@/lib/money";

const API = API_BASE;

/** Tag for on-demand invalidation. The control plane POSTs to
 *  /api/revalidate-rate-card whenever a rate or plan changes. */
export const RATE_CARD_TAG = "rate-card";

/**
 * Changes per deployment, so a build can never reuse a cached rate-card
 * response from a previous one.
 *
 * This exists because of a real incident on 19 Aug 2026. The ad-hoc rate was
 * changed to Rs 299 in the admin panel and the API served it correctly — but
 * every page on the site went on showing Rs 399, with plan tiers derived from
 * Rs 399, for hours. Next persists its fetch cache to .next/cache and Vercel
 * restores that directory between deploys, so a redeploy rebaked the OLD
 * response. The give-away was that the plan STRUCTURE was new (it only exists
 * after that morning's deploy) while the NUMBERS were old: the code shipped and
 * the data did not.
 *
 * VERCEL_GIT_COMMIT_SHA is set at build time on Vercel and absent locally,
 * where the fetch cache is not restored anyway. FastAPI ignores the unknown
 * query parameter. Within a single deployment the URL is constant, so ISR and
 * the tag both behave normally.
 */
const BUILD_ID = process.env.VERCEL_GIT_COMMIT_SHA ?? "";
const RATE_CARD_URL = `${API}/public/rate-card${BUILD_ID ? `?b=${BUILD_ID}` : ""}`;

export type RateCardGpu = {
  slug: string;
  name: string;
  gpu_model: string;
  gpu_count: number;
  vram_gb: number;
  /**
   * Legacy key: the same number as `cpu_cores`. Print it through `cpuSpec()`,
   * which uses whatever label the API publishes ("vCPU" since the GPU ladder
   * of 21 Oct 2026; "CPU cores" on the API before it), never a label typed
   * by hand.
   */
  vcpu: number;
  /** Added 12 Oct 2026. Absent on an older API; `cpuSpec()` falls back. */
  cpu_cores?: number;
  cpu_kind?: string;
  /** e.g. "vCPU". */
  cpu_label?: string;
  ram_gb: number;
  storage_gb: number;
  pricing_type: string;
  hourly_rate_rupees: number | null;
  quote_on_request: boolean;
  tax_breakdown?: { taxable_rupees: number; gst_rupees: number };
  /**
   * The GPU ladder (owner, 21 Oct 2026). All three are optional because the
   * API before the ladder does not send them: gpuSpecChips() then omits the
   * architecture and CUDA chips, and usdHourlyValue() falls back to the one
   * global `usd.gpu_hourly` for the cheapest public GPU only.
   */
  /** e.g. "Blackwell". */
  architecture?: string | null;
  /** e.g. 10752. */
  cuda_cores?: number | null;
  /** This profile's own US-dollar rate per hour (no GST), e.g. 3.49; null
   *  when quote-on-request. */
  usd_hourly_rate?: number | null;
  /** May the intro offer's hours be spent on this GPU? True for the offer's
   *  reference GPU and every cheaper public card; false for a dearer one,
   *  which bills at list from the first minute (owner, 21 Oct 2026). */
  intro_eligible?: boolean;
  /** The one-phrase tag the control plane publishes for the card (gpu_profiles.badge):
   *  "Entry", "More memory", "Fast rendering", "Big scenes". Shown as given, never typed here. */
  badge?: string | null;
};

export type TrialTerms = {
  enabled: boolean;
  gpu_minutes: number;
  gpu_validity_days: number;
  storage_gb: number;
  storage_validity_days: number;
  requires_identity_verification: boolean;
  one_per_person: boolean;
  first_topup_bonus_percent: number;
  first_topup_bonus_cap_rupees: number;
};

/**
 * The first-top-up offer, as the control plane publishes it: pay
 * `price_rupees` once and `bonus_rupees` more is credited, which together buy
 * `hours` of the cheapest GPU at the ad-hoc rate.
 */
export type IntroOfferApi = {
  enabled: boolean;
  price_rupees: number;
  hours?: number;
  bonus_rupees?: number;
  validity_days?: number;
  one_per_customer?: boolean;
  /** The GPU the hours are counted on (owner, 21 Oct 2026), and every GPU
   *  the hours may be spent on, cheapest first. Optional until deployed. */
  gpu_name?: string | null;
  eligible_gpus?: string[];
  eligible_slugs?: string[];
};

/** How an account becomes usable. Replaced KYC on 10 Oct 2026: email + mobile
 *  OTP, then paying is the filter. */
export type Onboarding = {
  mode: string;
  requires_identity_verification: boolean;
  requires_mobile_otp: boolean;
  international: boolean;
};

export type B2cStorage = {
  trial_gb: number;
  paid_gb: number;
  retention_days: number;
  retention_active_minutes: number;
  scratch_gb: number;
  scratch_cleared_at_session_end: boolean;
};

export type RateCardPlan = {
  code: string;
  name: string;
  tagline: string | null;
  /** How far below the ad-hoc rate this tier bills, and what the customer
   *  commits to for it. Both null on a legacy or negotiated plan. */
  discount_percent: number | null;
  commitment_months: number | null;
  /** What an hour INSIDE the allowance actually costs — monthly fee less the
   *  bundled storage, divided by included hours. Published because it is the
   *  number a studio works out for itself, and the one that was quietly above
   *  the ad-hoc rate on every tier until 19 Aug 2026. */
  effective_included_hourly_rupees: number | null;
  monthly_fee_rupees: number;
  included_gpu_hours: number;
  included_storage_gb: number;
  named_seats: number;
  overage_hourly_rate_rupees: number | null;
  /** For organisations billed in US dollars, derived from the rupee figures
   *  (INR / 96 x 1.5, up to .99; owner, 15 Oct 2026). Absent on an older API. */
  usd_monthly_fee?: number | null;
  usd_overage_hourly_rate?: number | null;
  file_retention_days: number | null;
  /** Priced per customer (Large Team, was Big Firm; 11 Oct 2026). Its fee and rates come back
   *  null; planTiers() leaves it out, quotePlans() returns it. Optional so an
   *  older control plane does not break the build. */
  quote_on_request?: boolean;
};

export type RateCard = {
  currency: string;
  prices_include_gst: boolean;
  gst_rate_percent: number;
  sac_code: string;
  billing_granularity: string;
  billing_starts: string;
  /** Owner, 21 Oct 2026: a ready workstation nobody connects to shuts down
   *  after this many minutes, and those minutes are charged. Optional: a
   *  control plane from before the rule omits it. */
  no_connect_timeout_minutes?: number;
  minimum_billable_minutes: number;
  wallet: {
    min_topup_rupees: number;
    max_topup_rupees: number;
    /** Always 0 — the one-time setup fee is retired. */
    one_time_setup_fee_rupees: number;
    /** The smallest FIRST top-up — the intro offer price while it runs.
     *  Optional: a control plane from before paid-first onboarding omits it. */
    min_first_topup_rupees?: number;
  };
  // Paid-first onboarding (10 Oct 2026). Both optional so a control plane that
  // predates them does not break the build; see getIntroOffer/getOnboarding.
  intro_offer?: IntroOfferApi;
  onboarding?: Onboarding;
  // Optional so an older control plane that predates this field does not break
  // the build — callers treat a missing block as "no trial to advertise".
  trial?: TrialTerms;
  // Optional so a control plane predating this field does not break the build —
  // storageTerms() falls back to constants when it is absent.
  b2c_storage?: B2cStorage;
  // The control plane has served these since the plans table replaced the
  // hardcoded JSX; the site simply never declared them, so every page went on
  // printing its own copy of the tiers. Optional for the same reason as the
  // fields above — an older control plane must not break the build.
  plans?: RateCardPlan[];
  storage_rate_rupees_per_tb_month?: number;
  /** True once the control plane has actually started charging for storage.
   *  False means the rate above is published but nobody is billed by it. */
  storage_billing_active?: boolean;
  gpus: RateCardGpu[];
  /** USD prices for accounts billed outside India (15 Oct 2026). Optional:
   *  an older control plane omits it and usdRates() in lib/money.ts falls back
   *  to the approved constants. */
  usd?: Partial<UsdRateCard>;
};

/**
 * Returns null when the control plane is unreachable.
 *
 * Callers must handle null by hiding the price rather than substituting a
 * hardcoded one. A stale fallback price is worse than no price: it is the exact
 * failure this module exists to remove, and it would quote a number we might
 * not honour.
 */
export async function getRateCard(): Promise<RateCard | null> {
  try {
    const res = await fetch(RATE_CARD_URL, {
      // Tagged so a price change propagates in seconds instead of waiting out
      // the hour. The hour remains as the backstop for a missed webhook.
      next: { revalidate: 3600, tags: [RATE_CARD_TAG] },
    });
    if (!res.ok) {
      // Log loudly, and log WHO refused. This used to `return null` in silence,
      // so a failed build-time fetch produced a homepage with a blank price and
      // no trace anywhere.
      //
      // The status alone is not enough: a bare 403 was chased through three
      // wrong theories — a stale build cache, a WAF managed rule, and bot
      // protection — because nothing said which layer produced it. Cloudflare
      // block pages carry a Ray ID and a numbered error (1020 = firewall rule,
      // 1010 = browser integrity, 1006/1007 = IP access rule), and `server`
      // distinguishes a Cloudflare refusal from an nginx one. That names the
      // culprit in one build instead of one per hypothesis.
      const body = (await res.text().catch(() => "")).slice(0, 400).replace(/\s+/g, " ");
      console.error(
        `[rate-card] ${RATE_CARD_URL} returned ${res.status} ${res.statusText} — ` +
          `prices and trial terms will be hidden on this build\n` +
          `[rate-card]   server=${res.headers.get("server") ?? "?"} ` +
          `cf-ray=${res.headers.get("cf-ray") ?? "none"} ` +
          `cf-mitigated=${res.headers.get("cf-mitigated") ?? "none"}\n` +
          `[rate-card]   body: ${body}`,
      );
      return null;
    }
    return withTeamPlanNames((await res.json()) as RateCard);
  } catch (err) {
    console.error(`[rate-card] could not reach ${RATE_CARD_URL} —`, err);
    return null;
  }
}

/**
 * Team plans were "Studio plans" until 18 Oct 2026 (owner): "Studio" is also
 * the floor-plan render product, so the committed monthly tiers became Small /
 * Medium / Large Team. The names live in the `plans` table and are renamed by a
 * control-plane migration; until that has run, the API still serves the old
 * names. Mapping them here makes the site correct on either side of the
 * migration, in any deploy order. Exact old names only, so a name an admin sets
 * later passes through untouched. Safe to delete once the migration is live.
 */
const LEGACY_TEAM_PLAN_NAMES: Record<string, string> = {
  Studio: "Small Team",
  "Medium Firm": "Medium Team",
  "Big Firm": "Large Team",
  "Big Firm Dedicated": "Large Team (Dedicated)",
};

export function teamPlanName(name: string): string {
  return LEGACY_TEAM_PLAN_NAMES[name] ?? name;
}

export function withTeamPlanNames(card: RateCard): RateCard {
  if (!card || !Array.isArray(card.plans)) return card;
  return { ...card, plans: card.plans.map((p) => ({ ...p, name: teamPlanName(p.name) })) };
}

/**
 * Trial terms, or null when there is nothing honest to advertise.
 *
 * Null on three counts: the control plane is unreachable, the field predates
 * this deploy, or trials are switched off. All three mean the same thing to a
 * caller — say nothing. Advertising a trial the platform will not grant costs
 * more than not advertising one, because the customer finds out after signing
 * up.
 *
 * Paid-first onboarding (10 Oct 2026) retired the free trial; the site no
 * longer advertises one anywhere. This stays so an API that still reports
 * `trial.enabled` does not break a build, and it is hidden when false.
 */
export function getTrialTerms(card: RateCard | null): TrialTerms | null {
  if (!card?.trial?.enabled) return null;
  if (!card.trial.gpu_minutes) return null;
  return card.trial;
}

/**
 * The intro offer, resolved for display: what you pay (in `currency`), how
 * many hours of which GPU it buys. Every field comes from the rate card: the
 * rupee offer from `intro_offer`, the dollar offer from `usd.intro_offer`.
 */
export type IntroOffer = {
  currency: Currency;
  /** What the customer pays, in `currency`. */
  price: number;
  hours: number;
  /** Credited on top of `price`, in `currency`. */
  bonus: number | null;
  validityDays: number | null;
  onePerCustomer: boolean;
  /** The GPU the hours are counted on. */
  gpuName: string | null;
  /** Every GPU the hours may be spent on, cheapest first (includes gpuName).
   *  Empty on an API that predates the ladder. */
  eligibleGpus: string[];
};

/** The GPUs the intro hours also apply to, besides the one they are counted on. */
export function introOfferMoreGpus(o: IntroOffer): string[] {
  return o.eligibleGpus.filter((n) => n !== o.gpuName);
}

/**
 * " (more hours on the RTX A4000, RTX A5000)" when the intro hours may be
 * spent on cheaper GPUs too, else "". Built from the rate card, never typed.
 */
export function introMoreGpusNote(o: IntroOffer): string {
  const more = introOfferMoreGpus(o).map(shortGpuName);
  return more.length ? ` (more hours on the ${more.join(", ")})` : "";
}

/**
 * "NVIDIA RTX A4000 16 GB" -> "RTX A4000". The rate card names a profile
 * with its maker and memory so the ladder rows are self-contained; inside a
 * sentence that is three nouns too many (funnel audit, 22 Oct 2026: the
 * sign-up offer line ran to four lines on a phone). The VRAM is shown where
 * the GPUs are listed as cards, never dropped from there.
 */
export function shortGpuName(name: string): string {
  return name.replace(/^NVIDIA\s+/i, "").replace(/\s+\d+\s*GB$/i, "").trim() || name;
}

/** Names of the public GPUs the intro hours may be spent on, cheapest first. */
function eligibleGpuNames(card: RateCard | null, api: { eligible_gpus?: string[] } | null | undefined): string[] {
  if (api?.eligible_gpus?.length) return api.eligible_gpus;
  return publicGpus(card).filter((g) => g.intro_eligible === true).map((g) => g.name);
}

/** Is this GPU one the intro hours (in `cur`) may be spent on? */
export function gpuIntroEligible(gpu: RateCardGpu, card: RateCard | null, cur: Currency = "INR"): boolean {
  const o = introOfferFor(card, cur);
  if (!o) return false;
  if (gpu.intro_eligible != null) return gpu.intro_eligible;
  return o.eligibleGpus.includes(gpu.name);
}

/**
 * The RUPEE first-top-up offer, or null when there is nothing honest to
 * advertise. For a page in either currency use introOfferFor().
 *
 * Null when the control plane is unreachable, predates `intro_offer`, or has
 * the offer switched off. Callers then show NO offer numbers — never a typed
 * "Rs 1,000 = 8 hours", which is exactly the hardcoded figure the drift checks
 * exist to catch.
 *
 * `hours` is normally published. If an API omits it, it is derived from what
 * the customer gets (price + bonus) over the live ad-hoc rate — and only when
 * both of those exist; otherwise null.
 */
export function getIntroOffer(card: RateCard | null): IntroOffer | null {
  const io = card?.intro_offer;
  if (!io?.enabled || !io.price_rupees || io.price_rupees <= 0) return null;
  let hours = io.hours ?? null;
  if (!hours) {
    const rate = adhocRateValue(card);
    if (rate && rate > 0) {
      hours = Math.floor(((io.price_rupees + (io.bonus_rupees ?? 0)) / rate) * 10) / 10;
    }
  }
  if (!hours || hours <= 0) return null;
  // The reference GPU: published since the ladder; derived from the credit
  // on an older API.
  const gpuName = io.gpu_name ?? introOfferGpu(card, io.price_rupees + (io.bonus_rupees ?? 0), hours)?.name ?? null;
  return {
    currency: "INR",
    price: io.price_rupees,
    hours,
    bonus: io.bonus_rupees ?? null,
    validityDays: io.validity_days ?? null,
    onePerCustomer: io.one_per_customer ?? true,
    gpuName,
    eligibleGpus: eligibleGpuNames(card, io),
  };
}

/**
 * The US-dollar first-top-up offer (owner, 18 Oct 2026: $20 = 8 hours), or
 * null. Read ONLY from `usd.intro_offer` on the rate card, which the control
 * plane publishes while it is crediting the offer to USD accounts; there is
 * deliberately no fallback constant (unlike usdRates()), so the site can
 * never advertise a dollar offer the API is not granting.
 */
export function getUsdIntroOffer(card: RateCard | null): IntroOffer | null {
  const io = card?.usd?.intro_offer;
  if (!io || !(io.price > 0) || !(io.hours > 0)) return null;
  const gpuName = io.gpu_name ?? introOfferGpu(card, io.price + (io.bonus ?? 0), io.hours, "USD")?.name ?? null;
  return {
    currency: "USD",
    price: io.price,
    hours: io.hours,
    bonus: io.bonus ?? null,
    validityDays: io.validity_days ?? null,
    onePerCustomer: true,
    gpuName,
    eligibleGpus: eligibleGpuNames(card, io),
  };
}

/**
 * Which GPU the intro offer's hours are counted on: the public GPU whose
 * hourly rate times the offer's hours equals what is credited (price +
 * bonus), within rounding. The control plane prices the offer on one profile
 * and publishes the credit, not the profile, so with a ladder of several
 * GPUs this is how the site names the right one ("8 hours of RTX 5080", not
 * of the cheapest). Falls back to the cheapest public GPU when nothing
 * matches (an API without the bonus field, or a credit that fits no rate).
 */
function introOfferGpu(card: RateCard | null, credited: number, hours: number, cur: Currency = "INR"): RateCardGpu | null {
  const gpus = publicGpus(card).filter(isPricedGpu);
  if (!gpus.length) return null;
  const target = credited / hours;
  let best: { gpu: RateCardGpu; off: number } | null = null;
  for (const g of gpus) {
    const rate = hourlyValue(g, cur, card);
    if (rate == null || rate <= 0) continue;
    const off = Math.abs(rate - target) / rate;
    if (!best || off < best.off) best = { gpu: g, off };
  }
  // Within 2%: the hours are a rounded figure (floor to 0.1 h) on the API.
  return best && best.off <= 0.02 ? best.gpu : cheapestGpu(card);
}

/** "₹1,000" / "$20": the offer's price in its own currency. */
export function introPrice(o: IntroOffer): string {
  return formatMoney(o.price, o.currency);
}

/** "₹1,000" */
export function rupees(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

/** "8 hours" / "7.5 hours" / "1 hour" */
export function hoursLabel(hours: number, short = false): string {
  const n = Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
  if (short) return `${n} hr${hours === 1 ? "" : "s"}`;
  return `${n} hour${hours === 1 ? "" : "s"}`;
}

/**
 * The intro offer for a page shown in `cur`: the rupee offer on a rupee page,
 * the dollar offer (`usd.intro_offer`, only while the API publishes it) on a
 * dollar page. Never the other currency's offer (owner, 18 Oct 2026: one
 * currency per visitor).
 */
export function introOfferFor(card: RateCard | null, cur: Currency = "INR"): IntroOffer | null {
  return cur === "USD" ? getUsdIntroOffer(card) : getIntroOffer(card);
}

/** "₹1,000 = 8 hours of <cheapest GPU>" / "$20 = 8 hours of <cheapest GPU>", or null when no offer is live. */
export function introOfferHeadline(card: RateCard | null, cur: Currency = "INR"): string | null {
  const o = introOfferFor(card, cur);
  if (!o) return null;
  return `${introPrice(o)} = ${hoursLabel(o.hours)}${o.gpuName ? ` of ${o.gpuName}` : ""}${introMoreGpusNote(o)}`;
}

/**
 * How sign-up works. Falls back to the owner's 10 Oct 2026 decision (email +
 * mobile OTP, pay to start, international welcome) when the control plane does
 * not publish the block yet — the site no longer offers any identity-document
 * route, so describing one would be describing a screen that does not exist.
 */
export function getOnboarding(card: RateCard | null): Onboarding {
  return (
    card?.onboarding ?? {
      mode: "payment",
      requires_identity_verification: false,
      requires_mobile_otp: true,
      international: true,
    }
  );
}

/**
 * Smallest first top-up: the published `min_first_topup_rupees`, else the
 * intro offer price, else the ordinary wallet minimum. Null when unreachable.
 */
export function minFirstTopup(card: RateCard | null): number | null {
  return (
    card?.wallet?.min_first_topup_rupees ??
    getIntroOffer(card)?.price ??
    card?.wallet?.min_topup_rupees ??
    null
  );
}

/**
 * The new-customer FAQ entry, for pages with FAQPage JSON-LD. Null when no
 * offer is live, so the question is dropped rather than answered with a blank.
 * No render-time claim: what 8 hours covers depends on the scene.
 */
export function introOfferFaq(card: RateCard | null, cur: Currency = "INR"): { q: string; a: string } | null {
  const o = introOfferFor(card, cur);
  if (!o) return null;
  return {
    q: "Is there an offer for new customers?",
    a:
      `Yes. Your first top-up of ${introPrice(o)}${o.currency === "USD" ? " (no GST)" : ""} buys ${hoursLabel(o.hours)}` +
      `${o.gpuName ? ` on ${withArticle(o.gpuName)}` : ""}${introMoreGpusNote(o)}${o.validityDays ? `, to use within ${o.validityDays} days` : ""}, ` +
      "one per customer. You sign up with an email and a WhatsApp code to your mobile, with no ID documents, " +
      "and international cards work. We won't say what you can finish in that time, because it " +
      "depends entirely on your scene.",
  };
}

export type FirstTopupBonus = { percent: number; capRupees: number };

/**
 * The first-top-up bonus, INDEPENDENT of whether free trials are running.
 *
 * The API nests these two fields inside `trial`, but they answer to their own
 * kill switch (`first_topup_bonus_enabled`) and are zeroed by it. Reading them
 * through getTrialTerms() would tie them to `trial.enabled` instead: switch
 * off free minutes and a live promotion silently disappears from the site
 * while billing carries on granting it. The reverse of the usual failure and
 * just as bad -- money going out with nothing advertising it.
 *
 * Returns null when the bonus is off or the control plane is unreachable, so
 * callers render nothing rather than a number nobody is honouring.
 */
/**
 * The lowest hourly figure we actually publish, and which plan it belongs to.
 *
 * EXISTS BECAUSE SOMEONE NEARLY PUBLISHED "AS LOW AS ₹220 ON STUDIO" (1 Oct
 * 2026). Both halves were wrong. The lowest effective rate on the card was
 * ₹278.36, and it is on Big Firm -- Studio is the SHORTEST commitment and
 * therefore the most expensive per hour, not the cheapest. A "from ₹X" claim
 * computed by hand will always eventually say something the billing system
 * does not do; this computes it from the card or returns null.
 *
 * Uses effective_included_hourly_rupees, which is what an hour inside the
 * allowance actually costs. Dividing the monthly fee by included hours is NOT
 * the same number and is not the one to quote.
 */
export function lowestPublishedHourly(
  card: RateCard | null,
): { rupees: number; planName: string } | null {
  const tiers = (card?.plans ?? []).filter(
    (p) => p.effective_included_hourly_rupees != null,
  );
  if (!tiers.length) return null;
  const best = tiers.reduce((a, b) =>
    a.effective_included_hourly_rupees! <= b.effective_included_hourly_rupees! ? a : b,
  );
  return { rupees: best.effective_included_hourly_rupees!, planName: best.name };
}

/** "₹229/hr, GST included" — or without the clause if the card says otherwise. */
export function gstClause(card: RateCard | null): string | null {
  if (!card) return null;
  return card.prices_include_gst
    ? `all prices include ${card.gst_rate_percent}% GST`
    : null;
}

export function firstTopupBonus(card: RateCard | null): FirstTopupBonus | null {
  const percent = card?.trial?.first_topup_bonus_percent ?? 0;
  const cap = card?.trial?.first_topup_bonus_cap_rupees ?? 0;
  if (!percent || !cap) return null;
  return { percent, capRupees: cap };
}

/* ────────────────────────────────────────────────────────────────────────────
 * The GPU ladder (owner, 21 Oct 2026).
 *
 * The API's /public/rate-card lists only the profiles an admin has made
 * public, so `gpus[]` is the ladder as customers may see it: one GPU today,
 * five once the others go public. Nothing here names a GPU; every list on the
 * site renders whatever the card returns, cheapest first.
 * ──────────────────────────────────────────────────────────────────────────── */

/** True for a GPU the site may quote a rupee price for. */
export function isPricedGpu(gpu: RateCardGpu): boolean {
  return !gpu.quote_on_request && gpu.hourly_rate_rupees != null;
}

/**
 * The public ladder, cheapest rupee rate first; quote-on-request profiles
 * last, in the API's order. Empty when the control plane is unreachable.
 */
export function publicGpus(card: RateCard | null): RateCardGpu[] {
  const gpus = card?.gpus ?? [];
  const priced = gpus.filter(isPricedGpu).sort((a, b) => a.hourly_rate_rupees! - b.hourly_rate_rupees!);
  const onRequest = gpus.filter((g) => !isPricedGpu(g));
  return [...priced, ...onRequest];
}

/** The cheapest publicly priced GPU: the one "from ₹X" and the intro offer refer to. */
export function cheapestGpu(card: RateCard | null): RateCardGpu | null {
  return publicGpus(card).find(isPricedGpu) ?? null;
}

/**
 * This GPU's US-dollar rate per hour, or null.
 *
 * Each public profile carries its own `usd_hourly_rate` since the ladder. An
 * older API publishes one global `usd.gpu_hourly` only, which was the rate of
 * the one public GPU, so on that API it is used for the CHEAPEST public GPU
 * and nothing else: a dollar price for any other GPU would be a number we
 * never set.
 */
export function usdHourlyValue(gpu: RateCardGpu, card: RateCard | null): number | null {
  if (!isPricedGpu(gpu)) return null;
  if (gpu.usd_hourly_rate != null && gpu.usd_hourly_rate > 0) return gpu.usd_hourly_rate;
  const anyOwnRate = (card?.gpus ?? []).some((g) => g.usd_hourly_rate != null && g.usd_hourly_rate > 0);
  if (anyOwnRate) return null;
  return cheapestGpu(card)?.slug === gpu.slug ? usdRates(card).gpu_hourly : null;
}

/** The hourly rate as a number in `cur`, or null. */
export function hourlyValue(gpu: RateCardGpu, cur: Currency, card: RateCard | null): number | null {
  if (!isPricedGpu(gpu)) return null;
  return cur === "USD" ? usdHourlyValue(gpu, card) : gpu.hourly_rate_rupees;
}

/**
 * "₹229/hr" / "$3.49/hr", or "On request" where no public price is set in
 * that currency.
 */
export function formatHourly(gpu: RateCardGpu, cur: Currency = "INR", card: RateCard | null = null): string {
  const v = hourlyValue(gpu, cur, card);
  if (v == null) return "On request";
  return cur === "USD" ? `${formatMoney(v, "USD")}/hr` : `₹${Math.round(v).toLocaleString("en-IN")}/hr`;
}

/** "₹229" / "$3.49" (no unit), or null. */
export function formatHourlyBare(gpu: RateCardGpu, cur: Currency = "INR", card: RateCard | null = null): string | null {
  const v = hourlyValue(gpu, cur, card);
  if (v == null) return null;
  return cur === "USD" ? formatMoney(v, "USD") : `₹${Math.round(v).toLocaleString("en-IN")}`;
}

/** "10,752 CUDA cores" style thousands grouping, locale-neutral for specs. */
function groupThousands(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

/**
 * The spec chips for one ladder row, in the owner's order (21 Oct 2026):
 * architecture, CUDA cores, VRAM, vCPU, RAM. The first two are omitted when
 * the API does not publish them, so an older control plane still renders a
 * correct, shorter line.
 */
export function gpuSpecChips(gpu: RateCardGpu): string[] {
  const chips: string[] = [];
  if (gpu.architecture) chips.push(gpu.architecture);
  if (gpu.cuda_cores != null && gpu.cuda_cores > 0) chips.push(`${groupThousands(gpu.cuda_cores)} CUDA cores`);
  chips.push(`${gpu.vram_gb} GB VRAM`);
  chips.push(cpuSpec(gpu));
  chips.push(`${gpu.ram_gb} GB RAM`);
  return chips;
}

/** "Blackwell · 10,752 CUDA cores · 16 GB VRAM · 16 vCPU · 64 GB RAM". */
export function gpuSpecLine(gpu: RateCardGpu): string {
  return gpuSpecChips(gpu).join(" · ");
}

/**
 * "RTX 5080" with one public GPU; "RTX A4000 to RTX PRO 6000" with more.
 * Names only what the card actually publishes, so the site never promises a
 * GPU that is not yet public. Null without a rate card.
 */
export function gpuRangeLabel(card: RateCard | null): string | null {
  return ladderRanges(card)?.gpu ?? null;
}

/**
 * The ladder summarised as ranges, for spec tables and fact tiles that have
 * one line per attribute rather than one row per GPU: "16 to 96 GB" VRAM,
 * "16 to 32 vCPU", "64 to 176 GB" RAM. With one public GPU each is just that
 * GPU's figure. Null without a rate card, so a page falls back to saying
 * nothing (or NODE, the base node) rather than inventing a range.
 */
export type LadderRanges = {
  count: number;
  /** "RTX 5080" / "RTX A4000 to RTX PRO 6000". */
  gpu: string;
  /** "16 GB" / "16 to 96 GB". */
  vram: string;
  /** "16 vCPU" / "16 to 32 vCPU". */
  cpu: string;
  /** "64 GB" / "64 to 176 GB". */
  ram: string;
};

export function ladderRanges(card: RateCard | null): LadderRanges | null {
  const gpus = publicGpus(card);
  if (!gpus.length) return null;
  const range = (vals: number[], unit: string) => {
    const lo = Math.min(...vals), hi = Math.max(...vals);
    return lo === hi ? `${lo} ${unit}` : `${lo} to ${hi} ${unit}`;
  };
  const cpuLabel = gpus[0].cpu_label ?? "vCPU";
  return {
    count: gpus.length,
    gpu: gpus.length === 1 ? gpus[0].name : `${gpus[0].name} to ${gpus[gpus.length - 1].name}`,
    vram: range(gpus.map((g) => g.vram_gb), "GB"),
    cpu: range(gpus.map((g) => g.cpu_cores ?? g.vcpu), cpuLabel),
    ram: range(gpus.map((g) => g.ram_gb), "GB"),
  };
}

/**
 * The ladder as spec-table rows (GPU, VRAM, CPU, System RAM), from
 * ladderRanges(). Empty without a rate card, so a page's table simply has no
 * GPU rows rather than a typed GPU.
 */
export function ladderSpecRows(card: RateCard | null): [string, string][] {
  const l = ladderRanges(card);
  if (!l) return [];
  return [
    ["GPU", l.gpu],
    ["VRAM", l.vram],
    ["CPU", l.cpu],
    ["System RAM", l.ram],
  ];
}

/**
 * "an RTX 5080 with 16 GB of VRAM, 64 GB of RAM and 16 vCPU" / "your choice
 * of GPU from the RTX A4000 to the RTX PRO 6000, with 16 to 96 GB of VRAM,
 * 64 to 176 GB of RAM and 16 to 32 vCPU": the machine in one phrase, for FAQ
 * answers. Null without a rate card.
 */
export function ladderPhrase(card: RateCard | null): string | null {
  const l = ladderRanges(card);
  if (!l) return null;
  const gpus = publicGpus(card);
  if (l.count === 1) {
    return `${withArticle(l.gpu)} with ${l.vram} of VRAM, ${l.ram} of RAM and ${l.cpu}`;
  }
  return `your choice of GPU from the ${gpus[0].name} to the ${gpus[gpus.length - 1].name}, with ${l.vram} of VRAM, ${l.ram} of RAM and ${l.cpu}`;
}

/** "an RTX 5080" / "a Quadro": the article English wants before a GPU name. */
export function withArticle(name: string): string {
  return /^(RTX|A\d|[AEIOU]|[FHLMNRSX]\b)/i.test(name) ? `an ${name}` : `a ${name}`;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Derived figures.
 *
 * Every one of these returns null rather than a fallback when the control plane
 * is unreachable, and callers are expected to render nothing in that case. That
 * rule is not stylistic. On 18 Aug 2026 a sweep found ₹399 typed by hand into
 * fourteen files, ₹339/₹379/₹359 and ₹19,000 into several more, and three pages
 * describing ad-hoc sessions as "charged per full hour" while the billing code
 * had always charged per minute. None of it was caught by a build, a test or a
 * review, because a hardcoded number is indistinguishable from a correct one
 * until somebody changes the price.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * "₹229" (INR) / "$3.49" (USD) — the cheapest publicly-priced GPU in that
 * currency (the "from" price of the ladder), or null if none has a price.
 */
export function adhocRate(card: RateCard | null, cur: Currency = "INR"): string | null {
  const v = adhocRateValue(card, cur);
  if (v == null) return null;
  if (cur === "USD") return formatMoney(v, "USD");
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}

/** "₹229/hr" / "$3.49/hr", or null. */
export function adhocRateHourly(card: RateCard | null, cur: Currency = "INR"): string | null {
  const r = adhocRate(card, cur);
  return r ? `${r}/hr` : null;
}

/** Active PRICED plans, cheapest monthly fee first. Empty when none are
 *  published. Price-on-request tiers are left out, so every sentence built from
 *  a fee or a rate stays true; quotePlans() has them. */
export function planTiers(card: RateCard | null): RateCardPlan[] {
  return (card?.plans ?? [])
    .filter((p) => !p.quote_on_request && p.monthly_fee_rupees != null)
    .sort((a, b) => a.monthly_fee_rupees - b.monthly_fee_rupees);
}

/** Tiers priced per customer, in the API's order. */
export function quotePlans(card: RateCard | null): RateCardPlan[] {
  return (card?.plans ?? []).filter((p) => p.quote_on_request);
}

/** "₹19,000" — the entry monthly plan, or null when no plans are published.
 *  USD: entryPlanFeeUsd(). */
export function entryPlanFee(card: RateCard | null, cur: Currency = "INR"): string | null {
  if (cur === "USD") return entryPlanFeeUsd(card);
  const first = planTiers(card)[0];
  return first ? `₹${Math.round(first.monthly_fee_rupees).toLocaleString("en-IN")}` : null;
}

/** "₹339" — the best overage rate across plans, or null. USD: bestOverageRateUsd(). */
export function bestOverageRate(card: RateCard | null, cur: Currency = "INR"): string | null {
  if (cur === "USD") return bestOverageRateUsd(card);
  const rates = planTiers(card)
    .map((p) => p.overage_hourly_rate_rupees)
    .filter((r): r is number => r != null);
  if (!rates.length) return null;
  return `₹${Math.round(Math.min(...rates)).toLocaleString("en-IN")}`;
}

/** "$239.99" — the entry monthly plan in US dollars, or null (older API). */
export function entryPlanFeeUsd(card: RateCard | null): string | null {
  const first = planTiers(card)[0];
  const fee = first?.usd_monthly_fee;
  return fee != null && fee > 0 ? formatMoney(fee, "USD") : null;
}

/** "$4.99" — the best overage rate across plans in US dollars, or null. */
export function bestOverageRateUsd(card: RateCard | null): string | null {
  const rates = planTiers(card)
    .map((p) => p.usd_overage_hourly_rate)
    .filter((r): r is number => r != null && r > 0);
  return rates.length ? formatMoney(Math.min(...rates), "USD") : null;
}

/** "₹1,999" / "$15.99" per TB per month, or null. */
export function storageRatePerTb(card: RateCard | null, cur: Currency = "INR"): string | null {
  if (cur === "USD") {
    const u = card ? usdRates(card).storage_rate_per_tb_month : null;
    return u != null && u > 0 ? formatMoney(u, "USD") : null;
  }
  const r = card?.storage_rate_rupees_per_tb_month;
  if (r == null || r <= 0) return null;
  return `₹${Math.round(r).toLocaleString("en-IN")}`;
}

/**
 * How billing works, in one sentence, from the control plane's own answer.
 *
 * `billing_granularity` is a published field precisely so no page has to assert
 * it from memory. Three pages used to say "charged per full hour" — which the
 * API has never done — and the only reason nobody noticed is that the claim was
 * prose rather than a number.
 */
export function billingSentence(card: RateCard | null, cur: Currency = "INR"): string {
  if (card?.billing_granularity !== "per_minute") {
    return cur === "USD"
      ? "Billed for the time your session actually runs, with no GST."
      : "Billed for the time your session actually runs, with GST included.";
  }
  const min = card.minimum_billable_minutes;
  const minimum = min && min > 1 ? ` There is a ${min}-minute minimum.` : "";
  const noConnect = noConnectSentence(card);
  return (
    "Billed per minute from when you connect, not per whole hour. " +
    "Preparing the workstation and uploads are free." +
    (noConnect ? ` ${noConnect}` : "") +
    ` If a connection fails on our side, nothing is charged.${minimum}`
  );
}

/** The no-connect window from the rate card, or null when the API omits it or it is off. */
export function noConnectMinutes(card: RateCard | null): number | null {
  const n = Number(card?.no_connect_timeout_minutes);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

/**
 * The no-connect rule in one sentence (owner, 21 Oct 2026), or "" when the
 * rate card does not carry it. Same words as Connect and the terms.
 */
export function noConnectSentence(card: RateCard | null): string {
  const n = noConnectMinutes(card);
  return n
    ? `If you don't connect within ${n} minutes of your workstation being ready, it shuts down and those ${n} minutes are charged.`
    : "";
}

/**
 * The "how much does this cost" FAQ answer, for the FAQPage JSON-LD on the SEO
 * landing pages.
 *
 * Structured data is where a stale price does the most damage — Google and the
 * answer engines quote it directly, so a wrong number outlives the page that
 * produced it. Three landing pages carried this answer with "₹399/GPU-hour,
 * charged per full hour" hardcoded, which was wrong about the price the day it
 * changed and wrong about the billing unit from the day it was written.
 *
 * Returns null when there is no live price, so the caller drops the question
 * from the FAQ entirely rather than publishing an answer with a blank in it.
 */
export function pricingFaqAnswer(card: RateCard | null, cur: Currency = "INR"): string | null {
  const adhoc = adhocRate(card, cur);
  if (!adhoc) return null;
  const fee = entryPlanFee(card, cur);
  const best = bestOverageRate(card, cur);
  const tiers =
    cur === "USD"
      ? planTiers(card)
          .filter((p) => p.usd_overage_hourly_rate != null && p.usd_overage_hourly_rate > 0)
          .map((p) => `${formatMoney(p.usd_overage_hourly_rate!, "USD")}/hr on ${p.name}`)
      : planTiers(card)
          .filter((p) => p.overage_hourly_rate_rupees != null)
          .map((p) => `₹${Math.round(p.overage_hourly_rate_rupees!).toLocaleString("en-IN")}/hr on ${p.name}`);

  const billing = billingSentence(card, cur);
  const parts = [`Ad-hoc sessions are ${adhoc} per GPU-hour, ${billing.charAt(0).toLowerCase()}${billing.slice(1)}`];
  if (fee && best) {
    parts.push(
      `Committed monthly plans start at ${fee}/month and bill extra hours below the ad-hoc rate at every tier` +
        (tiers.length ? `: ${tiers.join(", ")}.` : "."),
    );
  }
  parts.push(
    cur === "USD"
      ? "Prices in US dollars carry no GST (export of services), and the invoice is in US dollars."
      : "All prices include 18% GST, and a GST invoice showing the tax split is issued.",
  );
  return parts.join(" ");
}


/**
 * The ad-hoc rate as a number, not a formatted string.
 *
 * Everything above returns display strings, which is right for rendering and
 * useless for comparing. `bestOverageRate()` returning "₹339" and `adhocRate()`
 * returning "₹299" cannot be compared without parsing rupee symbols and commas,
 * so the comparison simply was not made — and the site asserted "every tier
 * bills below the ad-hoc rate" on the strength of both strings merely existing.
 */
export function adhocRateValue(card: RateCard | null, cur: Currency = "INR"): number | null {
  const gpu = cheapestGpu(card);
  if (!gpu) return null;
  if (cur === "INR") return gpu.hourly_rate_rupees;
  // USD: the lowest own rate across the public priced GPUs; on an API before
  // the ladder, the one global rate (usdHourlyValue handles both).
  const rates = publicGpus(card)
    .map((g) => usdHourlyValue(g, card))
    .filter((v): v is number => v != null && v > 0);
  return rates.length ? Math.min(...rates) : null;
}

/**
 * Is committing genuinely cheaper — on BOTH counts a customer checks?
 *
 * The overage rate is the obvious one. The other is the monthly fee divided by
 * the included hours, which is what a studio actually computes, and which was
 * above the ad-hoc rate on every published tier when a cut to ₹299 was modelled.
 *
 * The API now refuses to publish a tier that fails either test, so this should
 * always be true. It is checked here anyway: this is the sentence the site puts
 * in a customer's face, and it should be conditional on the claim rather than on
 * the API having behaved.
 */
export function commitmentIsCheaper(card: RateCard | null): boolean {
  const adhoc = adhocRateValue(card);
  const tiers = planTiers(card);
  if (adhoc == null || !tiers.length) return false;
  return tiers.every((t) => {
    const overageOk = t.overage_hourly_rate_rupees != null && t.overage_hourly_rate_rupees < adhoc;
    const includedOk =
      t.effective_included_hourly_rupees == null || t.effective_included_hourly_rupees < adhoc;
    return overageOk && includedOk;
  });
}

/**
 * "₹4.98" — the per-minute rate, to two places.
 *
 * Per minute is the mechanism, not the headline. Every competitor quotes per
 * hour, so quoting only per minute forces a buyer to do arithmetic to compare
 * us, and a buyer doing arithmetic to compare a price assumes that is the point.
 * The hourly figure stays the headline; this goes underneath it as the reason
 * the headline is not what most sessions cost.
 */
export function perMinuteRate(card: RateCard | null, cur: Currency = "INR"): string | null {
  const adhoc = adhocRateValue(card, cur);
  if (adhoc == null || card?.billing_granularity !== "per_minute") return null;
  if (cur === "USD") return `$${(adhoc / 60).toFixed(2)}`;
  return `₹${(adhoc / 60).toFixed(2)}`;
}

/**
 * A worked example, because "billed per minute" is abstract and "₹100" is not.
 *
 * Rounded to whole rupees: this is illustrative, and quoting paise would imply a
 * precision the example does not have.
 */
export function sessionCostExample(
  card: RateCard | null,
  minutes = 20,
  cur: Currency = "INR",
): { minutes: number; cost: string } | null {
  const adhoc = adhocRateValue(card, cur);
  if (adhoc == null || card?.billing_granularity !== "per_minute") return null;
  // Dollars to the cent: "$2", "$1.20". Whole rupees for INR (see above).
  if (cur === "USD") {
    return { minutes, cost: formatMoney(Math.round((adhoc / 60) * minutes * 100) / 100, "USD") };
  }
  return {
    minutes,
    cost: `₹${Math.round((adhoc / 60) * minutes).toLocaleString("en-IN")}`,
  };
}

/**
 * Is the storage bundled with this plan free?
 *
 * The rate card has no explicit flag. From 11 Oct 2026 the owner made
 * bundled storage free on some tiers (the fee is then just the included hours
 * at the effective rate) and kept it inside the fee on others. So: storage is
 * free when the included hours at effective_included_hourly_rupees account
 * for the whole fee, within ₹999 of rounding. Without an effective rate, fall
 * back to the overage rate: the hours alone at overage would cover the fee.
 * Never typed per plan, so a re-price on the card flips the wording by itself.
 */
export function planStorageIsFree(plan: RateCardPlan): boolean {
  const fee = plan.monthly_fee_rupees;
  const hours = plan.included_gpu_hours;
  if (!fee || !hours) return false;
  const TOLERANCE = 999;
  if (plan.effective_included_hourly_rupees != null) {
    return Math.abs(plan.effective_included_hourly_rupees * hours - fee) <= TOLERANCE;
  }
  if (plan.overage_hourly_rate_rupees != null) {
    return plan.overage_hourly_rate_rupees * hours >= fee - TOLERANCE;
  }
  return false;
}

/**
 * "16 vCPU" from the rate card. Uses the label the API publishes ("vCPU"
 * since the GPU ladder, "CPU cores" on the API before it); an API without
 * `cpu_label` at all gets "vCPU" rather than a made-up label.
 */
export function cpuSpec(gpu: Pick<RateCardGpu, "vcpu" | "cpu_cores" | "cpu_label">): string {
  const count = gpu.cpu_cores ?? gpu.vcpu;
  return gpu.cpu_label ? `${count} ${gpu.cpu_label}` : `${count} vCPU`;
}

/** "1 TB" / "500 GB" from `storage_gb` (decimal TB, as drives are sold). */
export function storageSpec(storageGb: number): string {
  return storageGb >= 1000 && storageGb % 1000 === 0 ? `${storageGb / 1000} TB` : `${storageGb} GB`;
}

/* ────────────────────────────────────────────────────────────────────────────
 * One currency per visitor (owner, 18 Oct 2026).
 *
 * "For Indian users, only Indian prices ... and for a foreign customer, they
 * should show it in dollars." A page shows the visitor's currency and only
 * that one (proxy.ts picks the copy). These are the shared tax words, so no
 * page types its own.
 * ──────────────────────────────────────────────────────────────────────────── */

/** "GST included" / "no GST". */
export function taxWords(cur: Currency): string {
  return cur === "USD" ? "no GST" : "GST included";
}

/** The whole-sentence version, for a note under a price block. */
export function taxSentence(cur: Currency): string {
  return cur === "USD"
    ? "Prices in US dollars carry no GST (export of services), and the invoice is in US dollars."
    : "All prices include 18% GST, so what you see is what you pay. You get a GST invoice showing the taxable value and the tax split.";
}

/**
 * The ONE neutral line a page may carry about the other currency (pricing,
 * CFD): it states the policy and quotes no price in the other currency.
 */
export function otherCurrencyLine(cur: Currency, opts: { tax?: boolean } = {}): string {
  // CFD surfaces pass tax: false (owner, 19 Oct 2026: one all-in price, no
  // tax words on CFD pages; the terms page says it once).
  return cur === "USD"
    ? opts.tax === false
      ? "Billed in India? You'll see and pay prices in rupees."
      : "Billed in India? You'll see and pay prices in rupees, GST included."
    : "Billed from outside India? You'll see and pay prices in US dollars.";
}
