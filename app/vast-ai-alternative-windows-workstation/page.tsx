import type { Metadata } from "next";
import VastAlternativeView, { vastAlternativeMetadata } from "./view";

// Visitors outside India are rewritten to /usd/vast-ai-alternative-windows-workstation by proxy.ts.
export const metadata: Metadata = vastAlternativeMetadata();

export default function Page() {
  return <VastAlternativeView currency="INR" />;
}
