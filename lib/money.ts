/**
 * Two currencies, and only two (owner, 15 Oct 2026): INR for India, USD for
 * every other billing country.
 *
 * Two different questions use this module and must never be confused:
 *
 *   - ACCOUNT currency: fixed at sign-up from the billing country, reported by
 *     the API (`/payments/config` -> currency, `/customer/me/wallet` ->
 *     wallet_currency). It decides what a customer is charged. Never inferred
 *     from an IP address.
 *   - VISITOR currency: DISPLAY ONLY, from Cloudflare's CF-IPCountry header on
 *     /cfd and /pricing (see proxy.ts). It decides which prices a stranger is
 *     shown, nothing more.
 *
 * USD prices carry no GST (export of services, zero-rated under LUT); INR
 * prices include GST.
 */

export type Currency = "INR" | "USD";

/** Request header proxy.ts sets to the visitor currency on every page
 *  (read by the root layout through lib/display-currency.ts). */
export const CURRENCY_HEADER = "x-cf-currency";

/** "INR" / "USD" from anything the API or a query string might hand us. */
export function parseCurrency(v: unknown): Currency | null {
  if (typeof v !== "string") return null;
  const c = v.trim().toUpperCase();
  return c === "USD" || c === "INR" ? c : null;
}

/**
 * Visitor currency from a CF-IPCountry value. Absent, "IN", "XX" (unknown) and
 * "T1" (Tor) all mean INR: when in doubt, show the home market's prices.
 */
export function currencyForCountry(country: string | null | undefined): Currency {
  const c = (country ?? "").trim().toUpperCase();
  if (!c || c === "IN" || c === "XX" || c === "T1") return "INR";
  return "USD";
}

/**
 * "₹1,499" (en-IN) / "$5.99", "$15" (en-US).
 *
 * Whole amounts print without decimals; a fractional amount prints two places
 * ("$5.99", "₹4.98"). Never rounds a fractional price to a whole one: "$6"
 * for a $5.99 rate would be a price we do not charge.
 */
export function formatMoney(value: number, currency: Currency): string {
  const cents = Math.round(value * 100);
  const whole = cents % 100 === 0;
  const opts: Intl.NumberFormatOptions = whole
    ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  const n = cents / 100;
  return currency === "USD"
    ? `$${n.toLocaleString("en-US", opts)}`
    : `₹${n.toLocaleString("en-IN", opts)}`;
}

export type UsdBulkTier = { min: number; percent: number; bonus: number };

/** The `usd` block of GET /public/rate-card. */
export type UsdRateCard = {
  currency: "USD";
  gpu_hourly: number;
  cfd_quote_fee_small: number;
  cfd_quote_fee_large: number;
  cfd_quote_fee_small_max_cells: number;
  topup_min_first: number;
  topup_min: number;
  topup_max: number;
  bulk_topup_tiers: UsdBulkTier[];
  /** Storage above the allowance, per TB per month (approved 15 Oct 2026). */
  storage_rate_per_tb_month: number;
  /** Team per-seat fee per month, derived from the rupee fee (INR / 96 x 1.5, up to .99). */
  b2b_per_user_monthly_fee: number;
  gst_included: boolean;
};

/**
 * The approved USD prices (owner, 15 Oct 2026), used ONLY when the control
 * plane does not publish its `usd` block yet. This is the one place they are
 * typed; everything else reads usdRates().
 */
export const USD_FALLBACK: UsdRateCard = {
  currency: "USD",
  gpu_hourly: 5.99,
  cfd_quote_fee_small: 15,
  cfd_quote_fee_large: 39,
  cfd_quote_fee_small_max_cells: 5_000_000,
  topup_min_first: 20,
  topup_min: 20,
  topup_max: 1000,
  bulk_topup_tiers: [
    { min: 50, percent: 5, bonus: 2.5 },
    { min: 100, percent: 10, bonus: 10 },
    { min: 200, percent: 15, bonus: 30 },
  ],
  storage_rate_per_tb_month: 15.99,
  b2b_per_user_monthly_fee: 0.99,
  gst_included: false,
};

/** The published USD block, field by field over the fallback. */
export function usdRates(card: { usd?: Partial<UsdRateCard> | null } | null | undefined): UsdRateCard {
  const u = card?.usd;
  if (!u) return USD_FALLBACK;
  return {
    ...USD_FALLBACK,
    ...Object.fromEntries(Object.entries(u).filter(([, v]) => v != null)),
    currency: "USD",
  } as UsdRateCard;
}

/** "5 million" from 5000000, for the quote-fee threshold sentence. */
export function cellsLabel(cells: number): string {
  return cells % 1_000_000 === 0 ? `${cells / 1_000_000} million` : cells.toLocaleString("en-US");
}
