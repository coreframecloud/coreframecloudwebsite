import type { Metadata } from "next";
import D5VsLocalView, { d5VsLocalMetadata } from "./view";

// Visitors outside India are rewritten to /usd/d5-render-vs-local-gpu by proxy.ts.
export const metadata: Metadata = d5VsLocalMetadata("INR");

export default function Page() {
  return <D5VsLocalView currency="INR" />;
}
