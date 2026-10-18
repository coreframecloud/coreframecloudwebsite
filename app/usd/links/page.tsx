import type { Metadata } from "next";
import LinksView, { linksMetadata } from "@/app/links/view";

// /links for a visitor outside India: proxy.ts rewrites to this path, so the
// browser (and the canonical) stay on the public URL. A direct hit on
// /usd/links is redirected by proxy.ts.
export function generateMetadata(): Metadata {
  return linksMetadata("USD");
}

export default function LinksPageUsd() {
  return <LinksView currency="USD" />;
}
