import type { Metadata } from "next";
import LinksView, { linksMetadata } from "./view";

// Visitors outside India are rewritten to /usd/links by proxy.ts.
export function generateMetadata(): Metadata {
  return linksMetadata("INR");
}

export default function LinksPage() {
  return <LinksView currency="INR" />;
}
