import type { Metadata } from "next";
import PricingView, { pricingMetadata } from "@/app/pricing/pricing-view";

// /pricing for a visitor outside India: proxy.ts rewrites to this path, so the
// browser still shows /pricing (and canonical stays /pricing). Rendered like
// the INR copy. A direct hit on /usd/pricing is redirected by proxy.ts.
export async function generateMetadata(): Promise<Metadata> {
  return pricingMetadata("USD");
}

export default function PricingPageUsd() {
  return <PricingView currency="USD" />;
}
