import { formatMoney } from "@/lib/money";
import type { RateCard } from "@/lib/rate-card";

/**
 * Studio prices for the Studio pages (/floor-plan-to-render and its 3BHK
 * worked example), in BOTH currencies, so the static HTML a crawler reads
 * carries the rupee and the dollar price whatever country it crawls from
 * (SEO/AEO review 18 Oct 2026, T2).
 *
 * Rupees: the live defaults in apps/tools/app/studio.py (CF_STUDIO_PRICE_*_INR:
 * edit 20, 2K 30, 4K 50; extra preview 10), GST included. The rate card does
 * not publish them, so they are typed here once for these pages; the pricing
 * page and components/home/redesign/offerings.tsx carry the same figures.
 *
 * Dollars: the rate card's `usd.studio` block when the control plane
 * publishes it (download_2k, download_4k, edit), else the approved values
 * (owner, 15 Oct 2026). The extra preview ($0.25) is not on the card yet and
 * is shown on /pricing too. No GST on dollar accounts (export of services).
 *
 * Free previews: 5 a day (apps/tools/app/config.py studio_free_previews_per_day).
 */
export const FREE_PREVIEWS_PER_DAY = 5;
export const MAX_DXF_MB = 30;

export type StudioPrices = {
  inr: { extraPreview: number; edit: number; k2: number; k4: number };
  usd: { extraPreview: number; edit: number; k2: number; k4: number };
};

const INR = { extraPreview: 10, edit: 20, k2: 30, k4: 50 };
const USD_FALLBACK = { extraPreview: 0.25, edit: 0.49, k2: 0.99, k4: 1.49 };

type UsdStudioBlock = { download_2k?: number | null; download_4k?: number | null; edit?: number | null };

function pos(v: number | null | undefined, fallback: number): number {
  return typeof v === "number" && v > 0 ? v : fallback;
}

export function studioPrices(card: RateCard | null): StudioPrices {
  const s = (card?.usd as { studio?: UsdStudioBlock } | undefined)?.studio;
  return {
    inr: INR,
    usd: {
      extraPreview: USD_FALLBACK.extraPreview,
      edit: pos(s?.edit, USD_FALLBACK.edit),
      k2: pos(s?.download_2k, USD_FALLBACK.k2),
      k4: pos(s?.download_4k, USD_FALLBACK.k4),
    },
  };
}

export const inr = (n: number) => formatMoney(n, "INR");
export const usd = (n: number) => formatMoney(n, "USD");

/**
 * schema.org Offers for the Studio WebApplication: the free preview and the
 * two downloads, once in rupees (India, GST included) and once in dollars
 * (everywhere else, no GST).
 */
export function studioOffers(p: StudioPrices, url: string) {
  const IN = { "@type": "Country", name: "IN" };
  const inrOffer = (name: string, price: number) => ({
    "@type": "Offer",
    name,
    price: String(price),
    priceCurrency: "INR",
    valueAddedTaxIncluded: true,
    eligibleRegion: IN,
    url,
  });
  const usdOffer = (name: string, price: number) => ({
    "@type": "Offer",
    name,
    price: price.toFixed(2).replace(/\.00$/, ""),
    priceCurrency: "USD",
    valueAddedTaxIncluded: false,
    ineligibleRegion: IN,
    url,
  });
  return [
    inrOffer(`Preview (three camera angles), up to ${FREE_PREVIEWS_PER_DAY} a day`, 0),
    usdOffer(`Preview (three camera angles), up to ${FREE_PREVIEWS_PER_DAY} a day`, 0),
    inrOffer("2K download", p.inr.k2),
    usdOffer("2K download", p.usd.k2),
    inrOffer("4K download", p.inr.k4),
    usdOffer("4K download", p.usd.k4),
  ];
}
