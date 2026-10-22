"use client";

import { useSyncExternalStore } from "react";
import { readIntroVariant } from "@/lib/attribution";
import { hoursLabel, introPrice, type IntroOffer } from "@/lib/rate-card";

/**
 * The one line of the first top-up A/B a logged-out page may show (owner
 * approved 22 Oct 2026): "or start with ₹500 = 3 hours", under the standing
 * price line on /go/*, and only to a visitor this browser drew into the
 * "intro500" arm on landing (lib/attribution.ts). That same flag is posted
 * with the sign-up, and the API honours it for paid traffic, so the line is
 * only ever shown to someone whose account will get exactly that offer.
 *
 * The numbers come from the rate card's `intro_offer.intro500` block (the
 * page passes them in); nothing here types a price. The server renders
 * nothing (it cannot know the arm and must not guess); the browser fills it
 * in after hydration, like KeepQueryLink does with the query string.
 */
const noop = () => () => {};

export function IntroAltLine({ offer }: { offer: IntroOffer | null }) {
  const variant = useSyncExternalStore(noop, readIntroVariant, () => null);
  if (!offer || variant !== "intro500") return null;
  return (
    <span className="mt-1 block text-[13.5px] leading-5 text-ink-2">
      Or start with <b className="font-semibold text-ink">{introPrice(offer)} = {hoursLabel(offer.hours)}</b>
      {offer.gpuName ? " on the same card" : ""}.
    </span>
  );
}
