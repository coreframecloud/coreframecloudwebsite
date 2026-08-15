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
