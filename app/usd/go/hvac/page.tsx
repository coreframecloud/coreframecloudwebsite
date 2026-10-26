import type { Metadata } from "next";
import HvacLandingView, { hvacLandingMetadata } from "@/app/go/hvac/view";

// /go/hvac for a visitor outside India: proxy.ts rewrites to this path, so the
// browser stays on the public URL. A direct hit on /usd/go/hvac is redirected.
export async function generateMetadata(): Promise<Metadata> {
  return hvacLandingMetadata("USD");
}

export default function HvacLandingPageUsd() {
  return <HvacLandingView currency="USD" />;
}
