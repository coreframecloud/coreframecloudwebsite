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
 * block (usdRates()). Quick and Standard run prices are never published:
 * they are on the quote after the mesh check.
 */
export const CFD_PREPROCESS_INR = {
  small: 599,
  large: 1499,
  smallMaxCells: 5_000_000,
} as const;

/** Express: results in 1–2 hours at this multiple of the package price. */
export const CFD_EXPRESS = { multiple: 3, hours: "1–2" } as const;

/** Normal delivery, hours after payment. */
export const CFD_NORMAL_HOURS = 24;

/** "₹599 incl. GST" / "$15 (no GST)" for the usual model size. */
export function preprocessFee(cur: Currency, usd: UsdRateCard): string {
  return cur === "USD"
    ? `${formatMoney(usd.cfd_quote_fee_small, "USD")} (no GST)`
    : `${formatMoney(CFD_PREPROCESS_INR.small, "INR")} incl. GST`;
}

/** The very-large-model sentence: "Very large models (over 5 million cells): ₹1,499 incl. GST." / "...: $39." */
export function preprocessLarge(cur: Currency, usd: UsdRateCard): string {
  const cells = cellsLabel(usd.cfd_quote_fee_small_max_cells);
  return cur === "USD"
    ? `Very large models (over ${cells} cells): ${formatMoney(usd.cfd_quote_fee_large, "USD")}.`
    : `Very large models (over ${cells} cells): ${formatMoney(CFD_PREPROCESS_INR.large, "INR")} incl. GST.`;
}
