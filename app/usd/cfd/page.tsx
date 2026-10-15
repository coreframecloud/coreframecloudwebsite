import type { Metadata } from "next";
import CfdView, { cfdMetadata } from "@/app/cfd/cfd-view";

// /cfd for a visitor outside India: proxy.ts rewrites to this path, so the
// browser still shows /cfd (and canonical stays /cfd). Prerendered like the
// INR copy. A direct hit on /usd/cfd is redirected by proxy.ts.
export const metadata: Metadata = cfdMetadata;

export default function CfdIntakePageUsd() {
  return <CfdView currency="USD" />;
}
