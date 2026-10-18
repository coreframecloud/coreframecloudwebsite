import type { Metadata } from "next";
import AboutView, { aboutMetadata } from "./view";

// Visitors outside India are rewritten to /usd/about by proxy.ts.
export const metadata: Metadata = aboutMetadata;

export default function AboutPage() {
  return <AboutView currency="INR" />;
}
