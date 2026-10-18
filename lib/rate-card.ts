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
   * Legacy key: the same number as `cpu_cores`. It was labelled "vCPU", but a
   * Coreframe rental is a whole machine with dedicated physical cores (owner,
   * 12 Oct 2026). Print it through `cpuSpec()`, never as "vCPU" by hand.
   */
  vcpu: number;
  /** Added 12 Oct 2026. Absent on an older API; `cpuSpec()` falls back. */
  cpu_cores?: number;
  cpu_kind?: string;
  /** e.g. "CPU cores". */
  cpu_label?: string;
  ram_gb: number;
  storage_gb: number;
  pricing_type: string;
  hourly_rate_rupees: number | null;
  quote_on_request: boolean;
  tax_breakdown?: { taxable_rupees: number; gst_rupees: number };
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
 * The intro offer, resolved for display: what you pay, how many hours of which
 * GPU it buys. Every field comes from the rate card.
 */
export type IntroOffer = {
  priceRupees: number;
  hours: number;
  bonusRupees: number | null;
  validityDays: number | null;
  onePerCustomer: boolean;
  gpuName: string | null;
};

/**
 * The first-top-up offer, or null when there is nothing honest to advertise.
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
  const gpu = card?.gpus.find((g) => !g.quote_on_request && g.hourly_rate_rupees != null);
  return {
    priceRupees: io.price_rupees,
    hours,
    bonusRupees: io.bonus_rupees ?? null,
    validityDays: io.validity_days ?? null,
    onePerCustomer: io.one_per_customer ?? true,
    gpuName: gpu?.name ?? null,
  };
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
 * The intro offer for a visitor shown `cur` prices: null for USD. The offer
 * is a rupee first top-up and is never offered to an account billed in US
 * dollars (components/wallet/top-up-dialog.tsx), so a page in dollars must
 * not advertise it (owner, 18 Oct 2026: one currency per visitor).
 */
export function introOfferFor(card: RateCard | null, cur: Currency = "INR"): IntroOffer | null {
  return cur === "USD" ? null : getIntroOffer(card);
}

/** "₹1,000 = 8 hours of RTX 5080", or null when no offer is live (always null for USD). */
export function introOfferHeadline(card: RateCard | null, cur: Currency = "INR"): string | null {
  const o = introOfferFor(card, cur);
  if (!o) return null;
  return `${rupees(o.priceRupees)} = ${hoursLabel(o.hours)}${o.gpuName ? ` of ${o.gpuName}` : ""}`;
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
    getIntroOffer(card)?.priceRupees ??
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
      `Yes. Your first top-up of ${rupees(o.priceRupees)} buys ${hoursLabel(o.hours)}` +
      `${o.gpuName ? ` on an ${o.gpuName}` : ""}${o.validityDays ? `, to use within ${o.validityDays} days` : ""}, ` +
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

/** "₹399/hr, GST included" — or without the clause if the card says otherwise. */
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

/**
 * "₹399/hr" / "$5.99/hr", or "On request" where no public price is set.
 *
 * The USD block publishes ONE GPU rate (`usd.gpu_hourly`), which is the rate
 * of the one publicly priced GPU; a USD view of any other priced GPU would be
 * a number we never set, so it says "On request".
 */
export function formatHourly(gpu: RateCardGpu, cur: Currency = "INR", card: RateCard | null = null): string {
  if (gpu.hourly_rate_rupees == null) return "On request";
  if (cur === "USD") {
    const first = card?.gpus.find((g) => !g.quote_on_request && g.hourly_rate_rupees != null);
    return card && first?.slug === gpu.slug ? `${formatMoney(usdRates(card).gpu_hourly, "USD")}/hr` : "On request";
  }
  return `₹${Math.round(gpu.hourly_rate_rupees).toLocaleString("en-IN")}/hr`;
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
 * "₹399" (INR) / "$5.99" (USD, the rate card's `usd.gpu_hourly`) — the
 * cheapest publicly-priced GPU, or null if none has a price.
 */
export function adhocRate(card: RateCard | null, cur: Currency = "INR"): string | null {
  const gpu = card?.gpus.find((g) => !g.quote_on_request && g.hourly_rate_rupees != null);
  if (!gpu || gpu.hourly_rate_rupees == null) return null;
  if (cur === "USD") return formatMoney(usdRates(card).gpu_hourly, "USD");
  return `₹${Math.round(gpu.hourly_rate_rupees).toLocaleString("en-IN")}`;
}

/** "₹399/hr" / "$5.99/hr", or null. */
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

/** "$5.99" — the best overage rate across plans in US dollars, or null. */
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
  return (
    "Billed per minute from the moment the stream starts, not per whole hour. " +
    `Provisioning, uploads and failed connections are free.${minimum}`
  );
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
export function adhocRateValue(card: RateCard | null): number | null {
  const gpu = card?.gpus.find((g) => !g.quote_on_request && g.hourly_rate_rupees != null);
  return gpu?.hourly_rate_rupees ?? null;
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
  const adhoc = adhocRateValue(card);
  if (adhoc == null || card?.billing_granularity !== "per_minute") return null;
  if (cur === "USD") return `$${(usdRates(card).gpu_hourly / 60).toFixed(2)}`;
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
  const adhoc = adhocRateValue(card);
  if (adhoc == null || card?.billing_granularity !== "per_minute") return null;
  // Dollars to the cent: "$2", "$1.20". Whole rupees for INR (see above).
  if (cur === "USD") {
    return { minutes, cost: formatMoney(Math.round((usdRates(card).gpu_hourly / 60) * minutes * 100) / 100, "USD") };
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
 * "8 CPU cores" from the rate card. Uses the label the API publishes; an older
 * API without `cpu_label` gets the old "vCPU" wording rather than a made-up one.
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
export function otherCurrencyLine(cur: Currency): string {
  return cur === "USD"
    ? "Billed in India? You'll see and pay prices in rupees, GST included."
    : "Billed from outside India? You'll see and pay prices in US dollars.";
}
