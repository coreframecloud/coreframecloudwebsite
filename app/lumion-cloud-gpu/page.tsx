import type { Metadata } from "next";
import LumionView, { lumionMetadata } from "./view";

// Visitors outside India are rewritten to /usd/lumion-cloud-gpu by proxy.ts.
export const metadata: Metadata = lumionMetadata("INR");

export default function Page() {
  return <LumionView currency="INR" />;
}
