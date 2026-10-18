import {
  adhocRateHourly,
  adhocRateValue,
  billingSentence,
  hoursLabel,
  introOfferFor,
  perMinuteRate,
  planTiers,
  rupees,
  type RateCard,
  type RateCardPlan,
} from "@/lib/rate-card";
import { formatMoney, usdRates, type Currency } from "@/lib/money";
import { storageTerms } from "@/lib/storage-terms";
import { replacementCost } from "@/lib/node-spec";
import type { BlogContext } from "./types";

/** Rupees in the estimate, or null on the dollar view (there is no dollar estimate). */
function replacementRupees(cur: Currency): number | null {
  const c = replacementCost(cur);
  return c ? Number(c.replace(/[^\d]/g, "")) : null;
}

/**
 * Resolve every money or terms figure an article may print, once, from the
 * live rate card. Anything the card cannot supply is null, and the articles
 * drop the sentence rather than print a stale or invented number.
 *
 * ONE CURRENCY PER VISITOR (owner, 18 Oct 2026): every figure is in
 * `currency` only. A post is rendered as /blog/<slug> (rupees) and
 * /usd/blog/<slug> (dollars, proxy.ts). The dollar view has no intro offer
 * (it is a rupee first top-up) and no purchase-price estimate (rupees only),
 * so the sentences that need them drop out.
 */
export function blogContext(card: RateCard | null, currency: Currency = "INR"): BlogContext {
  const usd = currency === "USD";
  const rupeeRate = adhocRateValue(card);
  const rate = rupeeRate == null ? null : usd ? usdRates(card).gpu_hourly : rupeeRate;
  const intro = introOfferFor(card, currency);
  const money = (v: number) => (usd ? formatMoney(Math.round(v * 100) / 100, "USD") : rupees(v));
  const replacement = replacementRupees(currency);
  const planOverage = (p: RateCardPlan): number | null =>
    usd ? (p.usd_overage_hourly_rate && p.usd_overage_hourly_rate > 0 ? p.usd_overage_hourly_rate : null) : p.overage_hourly_rate_rupees;
  const plans = planTiers(card);
  return {
    currency,
    taxIncl: usd ? "with no GST" : "with GST included",
    taxShort: usd ? "no GST" : "GST included",
    hourly: adhocRateHourly(card, currency),
    rate,
    perMinute: perMinuteRate(card, currency),
    // Written here rather than reusing billingSentence(), whose wording is
    // landing-page copy; the facts are the same fields of the same card.
    billing:
      card?.billing_granularity === "per_minute"
        ? "It's billed per minute from the moment the stream starts, and preparing the machine, uploading files and failed connections cost nothing." +
          (card.minimum_billable_minutes > 1 ? ` There is a ${card.minimum_billable_minutes}-minute minimum.` : "")
        : billingSentence(card, currency),
    intro,
    introPrice: intro ? rupees(intro.priceRupees) : null,
    introHours: intro ? hoursLabel(intro.hours) : null,
    storageGb: storageTerms(card).paidGb,
    plans,
    planFee: (p) => {
      const fee = usd ? p.usd_monthly_fee : p.monthly_fee_rupees;
      return fee != null && fee > 0 ? money(fee) : null;
    },
    planOverage: (p) => {
      const v = planOverage(p);
      return v != null ? money(v) : null;
    },
    plansBelowAdhoc:
      rate != null && plans.length > 0 && plans.every((p) => { const v = planOverage(p); return v != null && v < rate; }),
    cost: (hours: number) => (rate ? money(rate * hours) : null),
    breakEvenHours: rupeeRate && replacement ? Math.round(replacement / rupeeRate) : null,
    replacementCost: replacementCost(currency),
  };
}
