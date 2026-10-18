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
  introPrice,
} from "@/lib/rate-card";
import { formatMoney, usdRates, type Currency } from "@/lib/money";
import { storageTerms } from "@/lib/storage-terms";
import { replacementCost, replacementCostValue } from "@/lib/node-spec";
import type { BlogContext } from "./types";

/**
 * Resolve every money or terms figure an article may print, once, from the
 * live rate card. Anything the card cannot supply is null, and the articles
 * drop the sentence rather than print a stale or invented number.
 *
 * ONE CURRENCY PER VISITOR (owner, 18 Oct 2026): every figure is in
 * `currency` only. A post is rendered as /blog/<slug> (rupees) and
 * /usd/blog/<slug> (dollars, proxy.ts). The dollar view quotes the dollar
 * intro offer only while the API publishes usd.intro_offer, and the dollar
 * hardware estimate ($6,000, lib/node-spec), with break-even worked from the
 * rate card's dollar rate.
 */
export function blogContext(card: RateCard | null, currency: Currency = "INR"): BlogContext {
  const usd = currency === "USD";
  const rupeeRate = adhocRateValue(card);
  const rate = rupeeRate == null ? null : usd ? usdRates(card).gpu_hourly : rupeeRate;
  const intro = introOfferFor(card, currency);
  const money = (v: number) => (usd ? formatMoney(Math.round(v * 100) / 100, "USD") : rupees(v));
  const replacement = replacementCostValue(currency);
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
    introPrice: intro ? `${introPrice(intro)}${usd ? " (no GST)" : ""}` : null,
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
    // Hardware estimate over the hourly rate, both in the page's currency.
    breakEvenHours: rate ? Math.round(replacement / rate) : null,
    replacementCost: replacementCost(currency),
  };
}
