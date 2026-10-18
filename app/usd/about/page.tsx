import type { Metadata } from "next";
import AboutView, { aboutMetadata } from "@/app/about/view";

// /about for a visitor outside India: proxy.ts rewrites to this path, so the
// browser (and the canonical) stay on the public URL. A direct hit on
// /usd/about is redirected by proxy.ts.
export const metadata: Metadata = aboutMetadata;

export default function AboutPageUsd() {
  return <AboutView currency="USD" />;
}
