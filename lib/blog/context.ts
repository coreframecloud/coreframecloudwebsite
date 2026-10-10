import {
  adhocRateHourly,
  adhocRateValue,
  billingSentence,
  getIntroOffer,
  hoursLabel,
  perMinuteRate,
  planTiers,
  rupees,
  type RateCard,
} from "@/lib/rate-card";
import { storageTerms } from "@/lib/storage-terms";
import { WORKSTATION_REPLACEMENT_COST } from "@/lib/node-spec";
import type { BlogContext } from "./types";

const REPLACEMENT_RUPEES = Number(WORKSTATION_REPLACEMENT_COST.replace(/[^\d]/g, ""));

/**
 * Resolve every money or terms figure an article may print, once, from the
 * live rate card. Anything the card cannot supply is null, and the articles
 * drop the sentence rather than print a stale or invented number.
 */
export function blogContext(card: RateCard | null): BlogContext {
  const rate = adhocRateValue(card);
  const intro = getIntroOffer(card);
  return {
    hourly: adhocRateHourly(card),
    rate,
    perMinute: perMinuteRate(card),
    // Written here rather than reusing billingSentence(), whose wording is
    // landing-page copy; the facts are the same fields of the same card.
    billing:
      card?.billing_granularity === "per_minute"
        ? "It's billed per minute from the moment the stream starts, and preparing the machine, uploading files and failed connections cost nothing." +
          (card.minimum_billable_minutes > 1 ? ` There is a ${card.minimum_billable_minutes}-minute minimum.` : "")
        : billingSentence(card),
    intro,
    introPrice: intro ? rupees(intro.priceRupees) : null,
    introHours: intro ? hoursLabel(intro.hours) : null,
    storageGb: storageTerms(card).paidGb,
    plans: planTiers(card),
    cost: (hours: number) => (rate ? rupees(rate * hours) : null),
    breakEvenHours: rate ? Math.round(REPLACEMENT_RUPEES / rate) : null,
    replacementCost: WORKSTATION_REPLACEMENT_COST,
  };
}
