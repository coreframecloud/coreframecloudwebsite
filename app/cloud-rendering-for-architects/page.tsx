import type { Metadata } from "next";
import ArchitectsView, { architectsMetadata } from "./view";

// Visitors outside India are rewritten to /usd/cloud-rendering-for-architects by proxy.ts.
export const metadata: Metadata = architectsMetadata();

export default function Page() {
  return <ArchitectsView currency="INR" />;
}
