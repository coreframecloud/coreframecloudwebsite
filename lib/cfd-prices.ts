import { cellsLabel, formatMoney, type Currency, type UsdRateCard } from "@/lib/money";
import { VERIFIED } from "@/lib/cfd-verified";

/**
 * CFD prices in BOTH currencies, for every page a crawler reads (SEO review
 * 18 Oct 2026, T2).
 *
 * proxy.ts shows a visitor outside India the USD copy of /cfd, /pricing and
 * /cfd/mesh-independence-study. Googlebot, Bingbot and the AI crawlers crawl
 * from the US, so they only ever saw dollars, for an India-first business,
 * with nothing on the page saying the price depends on the country. Every
 * price sentence built here therefore carries both currencies: the visitor's
 * own first, the other one after it. The visitor currency still decides which
 * comes first; it never decides what is CHARGED (lib/money.ts).
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

/**
 * "₹599 incl. GST in India, $15 elsewhere (no GST)" — the visitor's currency
 * first. The one phrase every crawler-visible CFD price sentence uses.
 */
export function preprocessFeeBoth(primary: Currency, usd: UsdRateCard): string {
  const inr = `${formatMoney(CFD_PREPROCESS_INR.small, "INR")} incl. GST in India`;
  const usdText = `${formatMoney(usd.cfd_quote_fee_small, "USD")} outside India (no GST)`;
  return primary === "USD" ? `${usdText}, ${inr}` : `${inr}, ${usdText}`;
}

/** The very-large-model sentence in both currencies. */
export function preprocessLargeBoth(primary: Currency, usd: UsdRateCard): string {
  const cells = cellsLabel(usd.cfd_quote_fee_small_max_cells);
  const inr = `${formatMoney(CFD_PREPROCESS_INR.large, "INR")} incl. GST`;
  const usdText = `${formatMoney(usd.cfd_quote_fee_large, "USD")}`;
  return primary === "USD"
    ? `Very large models (over ${cells} cells): ${usdText}, or ${inr} in India.`
    : `Very large models (over ${cells} cells): ${inr}, or ${usdText} outside India.`;
}

/** "from ₹5,999 + GST in India, from $99 elsewhere" — the visitor's first. */
export function verifiedFromBoth(primary: Currency): string {
  const inr = `from ${formatMoney(VERIFIED.fromInr, "INR")} + GST in India`;
  const usdText = `from ${formatMoney(VERIFIED.fromUsd, "USD")} outside India (no GST)`;
  return primary === "USD" ? `${usdText}, ${inr}` : `${inr}, ${usdText}`;
}

/** The other currency's Verified floor, for a line under the visitor's own. */
export function verifiedOtherCurrency(primary: Currency): string {
  return primary === "USD"
    ? `In India: from ${formatMoney(VERIFIED.fromInr, "INR")} + GST.`
    : `Outside India: from ${formatMoney(VERIFIED.fromUsd, "USD")}, no GST.`;
}
