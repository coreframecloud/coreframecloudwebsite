import type { Metadata } from "next";
import ArchitectsView, { architectsMetadata } from "@/app/cloud-rendering-for-architects/view";

// /cloud-rendering-for-architects for a visitor outside India: proxy.ts rewrites to this path, so the
// browser still shows /cloud-rendering-for-architects (and canonical stays /cloud-rendering-for-architects). A direct hit on
// /usd/cloud-rendering-for-architects is redirected by proxy.ts.
export const metadata: Metadata = architectsMetadata();

export default function PageUsd() {
  return <ArchitectsView currency="USD" />;
}
