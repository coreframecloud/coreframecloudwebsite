import type { Metadata } from "next";
import CfdLandingView, { cfdLandingMetadata } from "./view";

// Visitors outside India are rewritten to /usd/go/cfd by proxy.ts.
export async function generateMetadata(): Promise<Metadata> {
  return cfdLandingMetadata("INR");
}

export default function CfdLandingPage() {
  return <CfdLandingView currency="INR" />;
}
