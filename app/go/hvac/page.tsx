import type { Metadata } from "next";
import HvacLandingView, { hvacLandingMetadata } from "./view";

// Visitors outside India are rewritten to /usd/go/hvac by proxy.ts.
export async function generateMetadata(): Promise<Metadata> {
  return hvacLandingMetadata("INR");
}

export default function HvacLandingPage() {
  return <HvacLandingView currency="INR" />;
}
