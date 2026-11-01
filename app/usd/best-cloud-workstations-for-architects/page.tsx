import type { Metadata } from "next";
import CloudWorkstationsRoundupView, { roundupMetadata } from "@/app/best-cloud-workstations-for-architects/view";

// /best-cloud-workstations-for-architects for a visitor outside India: proxy.ts rewrites to this
// path, so the browser still shows the public URL (and canonical stays the public URL).
// A direct hit on /usd/best-cloud-workstations-for-architects is redirected by proxy.ts.
export const metadata: Metadata = roundupMetadata();

export default function PageUsd() {
  return <CloudWorkstationsRoundupView currency="USD" />;
}
