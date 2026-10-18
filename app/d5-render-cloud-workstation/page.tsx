import type { Metadata } from "next";
import D5View, { d5Metadata } from "./view";

// Visitors outside India are rewritten to /usd/d5-render-cloud-workstation by proxy.ts.
export const metadata: Metadata = d5Metadata("INR");

export default function Page() {
  return <D5View currency="INR" />;
}
