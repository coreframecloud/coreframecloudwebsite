import type { Metadata } from "next";
import EnscapeView, { enscapeMetadata } from "./view";

// Visitors outside India are rewritten to /usd/enscape-cloud-gpu by proxy.ts.
export const metadata: Metadata = enscapeMetadata("INR");

export default function Page() {
  return <EnscapeView currency="INR" />;
}
