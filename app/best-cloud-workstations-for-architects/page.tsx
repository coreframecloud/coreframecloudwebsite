import type { Metadata } from "next";
import CloudWorkstationsRoundupView, { roundupMetadata } from "./view";

// Visitors outside India are rewritten to /usd/best-cloud-workstations-for-architects by proxy.ts.
export const metadata: Metadata = roundupMetadata();

export default function Page() {
  return <CloudWorkstationsRoundupView currency="INR" />;
}
