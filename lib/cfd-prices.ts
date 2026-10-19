import { cellsLabel, formatMoney, type Currency, type UsdRateCard } from "@/lib/money";

/**
 * CFD prices, in ONE currency per page: the visitor's (owner, 18 Oct 2026).
 *
 * proxy.ts shows a visitor outside India the USD copy of the CFD pages and
 * everyone else the rupee copy; every price sentence built here takes that
 * currency and names no other. (The 18 Oct SEO pass that put both currencies
 * in every sentence was overruled the same day.) Display only: what is
 * CHARGED is the account's currency (lib/money.ts).
 *
 * The rupee pre-processing fee is the control plane's
 * cfd_quote_fee_small_inr_incl_gst / _large_ (apps/api/app/core/config.py);
 * the rate card publishes only the dollar block, so the rupee figures are
 * typed here, once. The dollar figures always come from the rate card's `usd`
 * block (usdRates()). Draft and Standard run prices are never published:
 * they are on the quote after the mesh check.
 *
 * ONE all-in price (owner, 19 Oct 2026: "Include it all in one price and deduct
 * from wallet. No mention of GST at all. We already provide a GST invoice").
 * Every rupee figure on the site is what the wallet is charged; nothing says
 * "incl. GST", "+ GST" or "no GST" (the terms page says it once). Figures the
 * API keeps ex-tax (the Verified minimum, the continue rate) go through
 * inrAllIn(). Display only: no price or billing changes.
 */
export const CFD_PREPROCESS_INR = {
  small: 599,
  large: 1499,
  smallMaxCells: 5_000_000,
} as const;

/** The GST rate on rupee accounts (18 %), used only to show ex-tax API figures all-in. */
export const CFD_GST_RATE = 0.18;

/** An ex-tax rupee figure as the all-in amount the wallet is charged, to the rupee (5,999 -> 7,079). */
export function inrAllIn(exTax: number, rate: number = CFD_GST_RATE): number {
  return Math.round(exTax * (1 + rate));
}

/** Express: results in 1–2 hours at this multiple of the package price. */
export const CFD_EXPRESS = { multiple: 3, hours: "1–2" } as const;

/** Normal delivery, hours after payment. */
export const CFD_NORMAL_HOURS = 24;

/** "₹599" / "$15" for the usual model size: the all-in amount. */
export function preprocessFee(cur: Currency, usd: UsdRateCard): string {
  return cur === "USD"
    ? formatMoney(usd.cfd_quote_fee_small, "USD")
    : formatMoney(CFD_PREPROCESS_INR.small, "INR");
}

/** The very-large-model sentence: "Very large models (over 5 million cells): ₹1,499." / "...: $39." */
export function preprocessLarge(cur: Currency, usd: UsdRateCard): string {
  const cells = cellsLabel(usd.cfd_quote_fee_small_max_cells);
  return cur === "USD"
    ? `Very large models (over ${cells} cells): ${formatMoney(usd.cfd_quote_fee_large, "USD")}.`
    : `Very large models (over ${cells} cells): ${formatMoney(CFD_PREPROCESS_INR.large, "INR")}.`;
}
