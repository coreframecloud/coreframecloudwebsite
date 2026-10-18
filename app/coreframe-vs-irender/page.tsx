import type { Metadata } from "next";
import VsIrenderView, { vsIrenderMetadata } from "./view";

// Visitors outside India are rewritten to /usd/coreframe-vs-irender by proxy.ts.
export const metadata: Metadata = vsIrenderMetadata("INR");

export default function Page() {
  return <VsIrenderView currency="INR" />;
}
