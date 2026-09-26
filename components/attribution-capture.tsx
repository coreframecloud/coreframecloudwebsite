"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/**
 * Records where a visitor came from, once, on their first landing.
 *
 * Renders nothing. Mounted in the root layout so it runs on every entry
 * point — an ad can land on any page, and the pricing page and a software
 * page are as likely a first touch as the home page. Putting this on the
 * signup form instead would only ever capture people who arrived directly
 * at signup, which is close to nobody.
 *
 * Deliberately not tied to GA or Clarity. Those answer "what happened on the
 * site"; this answers "which spend produced this customer", it has to survive
 * an ad blocker, and it has to still be readable at the moment the signup
 * form posts.
 */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
