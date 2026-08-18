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

const API = process.env.NEXT_PUBLIC_CONTROL_PLANE_API ?? "https://control.coreframecloud.com/api";

export type RateCardGpu = {
  slug: string;
  name: string;
  gpu_model: string;
  gpu_count: number;
  vram_gb: number;
  vcpu: number;
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
  monthly_fee_rupees: number;
  included_gpu_hours: number;
  included_storage_gb: number;
  named_seats: number;
  overage_hourly_rate_rupees: number | null;
  file_retention_days: number | null;
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
  };
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
  gpus: RateCardGpu[];
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
    const res = await fetch(`${API}/public/rate-card`, {
      next: { revalidate: 3600 },
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
        `[rate-card] ${API}/public/rate-card returned ${res.status} ${res.statusText} — ` +
          `prices and trial terms will be hidden on this build\n` +
          `[rate-card]   server=${res.headers.get("server") ?? "?"} ` +
          `cf-ray=${res.headers.get("cf-ray") ?? "none"} ` +
          `cf-mitigated=${res.headers.get("cf-mitigated") ?? "none"}\n` +
          `[rate-card]   body: ${body}`,
      );
      return null;
    }
    return (await res.json()) as RateCard;
  } catch (err) {
    console.error(`[rate-card] could not reach ${API}/public/rate-card —`, err);
    return null;
  }
}

/**
 * Trial terms, or null when there is nothing honest to advertise.
 *
 * Null on three counts: the control plane is unreachable, the field predates
 * this deploy, or trials are switched off. All three mean the same thing to a
 * caller — say nothing. Advertising a trial the platform will not grant costs
 * more than not advertising one, because the customer finds out after signing
 * up and handing over their Aadhaar.
 */
export function getTrialTerms(card: RateCard | null): TrialTerms | null {
  if (!card?.trial?.enabled) return null;
  if (!card.trial.gpu_minutes) return null;
  return card.trial;
}

/** "₹399/hr", or "On request" where no public price is set. */
export function formatHourly(gpu: RateCardGpu): string {
  if (gpu.hourly_rate_rupees == null) return "On request";
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

/** "₹399" — the cheapest publicly-priced GPU, or null if none has a price. */
export function adhocRate(card: RateCard | null): string | null {
  const gpu = card?.gpus.find((g) => !g.quote_on_request && g.hourly_rate_rupees != null);
  if (!gpu || gpu.hourly_rate_rupees == null) return null;
  return `₹${Math.round(gpu.hourly_rate_rupees).toLocaleString("en-IN")}`;
}

/** "₹399/hr", or null. */
export function adhocRateHourly(card: RateCard | null): string | null {
  const r = adhocRate(card);
  return r ? `${r}/hr` : null;
}

/** Active plans, cheapest monthly fee first. Empty when none are published. */
export function planTiers(card: RateCard | null): RateCardPlan[] {
  return [...(card?.plans ?? [])].sort((a, b) => a.monthly_fee_rupees - b.monthly_fee_rupees);
}

/** "₹19,000" — the entry monthly plan, or null when no plans are published. */
export function entryPlanFee(card: RateCard | null): string | null {
  const first = planTiers(card)[0];
  return first ? `₹${Math.round(first.monthly_fee_rupees).toLocaleString("en-IN")}` : null;
}

/** "₹339" — the best overage rate across plans, or null. */
export function bestOverageRate(card: RateCard | null): string | null {
  const rates = planTiers(card)
    .map((p) => p.overage_hourly_rate_rupees)
    .filter((r): r is number => r != null);
  if (!rates.length) return null;
  return `₹${Math.round(Math.min(...rates)).toLocaleString("en-IN")}`;
}

/** "₹1,999" per TB per month, or null. */
export function storageRatePerTb(card: RateCard | null): string | null {
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
export function billingSentence(card: RateCard | null): string {
  if (card?.billing_granularity !== "per_minute") {
    return "Billed for the time your session actually runs, with GST included.";
  }
  const min = card.minimum_billable_minutes;
  const minimum = min && min > 1 ? ` There is a ${min}-minute minimum.` : "";
  return (
    "Billed per minute from the moment the stream starts, not per whole hour — " +
    `provisioning, uploads and failed connections are free.${minimum}`
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
export function pricingFaqAnswer(card: RateCard | null): string | null {
  const adhoc = adhocRate(card);
  if (!adhoc) return null;
  const fee = entryPlanFee(card);
  const best = bestOverageRate(card);
  const tiers = planTiers(card)
    .filter((p) => p.overage_hourly_rate_rupees != null)
    .map((p) => `₹${Math.round(p.overage_hourly_rate_rupees!).toLocaleString("en-IN")}/hr on ${p.name}`);

  const parts = [`Ad-hoc sessions are ${adhoc} per GPU-hour, ${billingSentence(card).charAt(0).toLowerCase()}${billingSentence(card).slice(1)}`];
  if (fee && best) {
    parts.push(
      `Committed monthly plans start at ${fee}/month and bill extra hours below the ad-hoc rate at every tier` +
        (tiers.length ? ` — ${tiers.join(", ")}.` : "."),
    );
  }
  parts.push("All prices include 18% GST, and a GST invoice showing the tax split is issued.");
  return parts.join(" ");
}
