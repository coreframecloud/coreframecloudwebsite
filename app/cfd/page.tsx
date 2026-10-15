import type { Metadata } from "next";
import CfdView, { cfdMetadata } from "./cfd-view";

// Visitors outside India are rewritten to /usd/cfd by proxy.ts.
export const metadata: Metadata = cfdMetadata;

export default function CfdIntakePage() {
  return <CfdView currency="INR" />;
}
