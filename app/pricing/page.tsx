import type { Metadata } from "next";
import PricingView, { pricingMetadata } from "./pricing-view";

// Visitors outside India are rewritten to /usd/pricing by proxy.ts.
export const metadata: Metadata = pricingMetadata;

export default function PricingPage() {
  return <PricingView currency="INR" />;
}
