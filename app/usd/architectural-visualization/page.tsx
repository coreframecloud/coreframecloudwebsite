import type { Metadata } from "next";
import ArchvizView, { archvizMetadata } from "@/app/architectural-visualization/view";

// /architectural-visualization for a visitor outside India: proxy.ts rewrites
// to this path, so the browser (and the canonical) stay on the public URL.
// A direct hit on /usd/... is redirected by proxy.ts.
export const metadata: Metadata = archvizMetadata;

export default function ArchvizPageUsd() {
  return <ArchvizView currency="USD" />;
}
