import type { Metadata } from "next";
import CfdView, { cfdMetadataLive } from "@/app/cfd/cfd-view";

// /cfd for a visitor outside India: proxy.ts rewrites to this path, so the
// browser still shows /cfd (and canonical stays /cfd). Prerendered like the
// INR copy. A direct hit on /usd/cfd is redirected by proxy.ts.
export async function generateMetadata(): Promise<Metadata> {
  return cfdMetadataLive("USD");
}

export default function CfdIntakePageUsd() {
  return <CfdView currency="USD" />;
}
