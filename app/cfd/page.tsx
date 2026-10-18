import type { Metadata } from "next";
import CfdView, { cfdMetadataLive } from "./cfd-view";

// Visitors outside India are rewritten to /usd/cfd by proxy.ts.
export async function generateMetadata(): Promise<Metadata> {
  return cfdMetadataLive("INR");
}

export default function CfdIntakePage() {
  return <CfdView currency="INR" />;
}
