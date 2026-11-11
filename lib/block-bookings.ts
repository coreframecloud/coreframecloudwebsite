/**
 * Day, week and month passes (gpu-product-1110, item 5; owner, 11 Nov 2026).
 *
 * Shapes from the API contract: the public rate card's optional
 * `block_bookings` (offers keyed by currency) and the signed-in
 * GET /customer/gpu-extras `block_bookings` (offers in the account's currency).
 * The API sends every number; nothing here is a typed price.
 */

import { formatMoney, type Currency } from "@/lib/money";

export type BlockPack = {
  key: string;
  label: string;
  hours: number;
  window_hours: number;
  discount_pct: number;
};

export type BlockOfferPack = BlockPack & {
  price: number;
  list_price: number;
  saving: number;
};

export type BlockOffer = {
  profile_slug: string;
  profile_name: string;
  hourly_rate: number;
  packs: BlockOfferPack[];
};

export type Booking = {
  id: number;
  profile_slug: string;
  profile_name: string;
  pack: string;
  label: string;
  hours: number;
  hours_used: number;
  hours_left: number;
  price_paid: number;
  currency: string;
  starts_at: string;
  expires_at: string;
  status: "active" | "used_up" | "expired" | "refunded" | string;
};

/** The rate card's block (only while BLOCK_BOOKINGS_ENABLED on the API). */
export type RateCardBlockBookings = {
  terms: string[];
  packs: BlockPack[];
  offers: Partial<Record<Currency, BlockOffer[]>>;
};

/** "24 hours", "7 days", "30 days". */
export function windowLabel(windowHours: number): string {
  if (windowHours > 24 && windowHours % 24 === 0) {
    const d = windowHours / 24;
    return `${d} day${d === 1 ? "" : "s"}`;
  }
  return `${windowHours} hour${windowHours === 1 ? "" : "s"}`;
}

/** "8 hours", "1.5 hours". */
export function passHours(hours: number): string {
  const n = Math.round(hours * 10) / 10;
  return `${n} hour${n === 1 ? "" : "s"}`;
}

/** What one hour of the pass works out at, in the offer's currency. */
export function effectiveHourly(pack: BlockOfferPack, cur: Currency): string | null {
  if (!pack.hours) return null;
  return formatMoney(Math.round((pack.price / pack.hours) * 100) / 100, cur);
}

/** The visitor's currency list from the rate card; [] when absent. */
export function rateCardOffers(block: RateCardBlockBookings | null | undefined, cur: Currency): BlockOffer[] {
  const list = block?.offers?.[cur];
  return Array.isArray(list) ? list.filter((o) => Array.isArray(o.packs) && o.packs.length > 0) : [];
}
