import type { Metadata } from "next";
import CfdLandingView, { cfdLandingMetadata } from "@/app/go/cfd/view";

// /go/cfd for a visitor outside India: proxy.ts rewrites to this path, so the
// browser stays on the public URL. A direct hit on /usd/go/cfd is redirected.
export async function generateMetadata(): Promise<Metadata> {
  return cfdLandingMetadata("USD");
}

export default function CfdLandingPageUsd() {
  return <CfdLandingView currency="USD" />;
}
