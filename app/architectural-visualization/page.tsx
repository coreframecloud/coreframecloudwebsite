import type { Metadata } from "next";
import ArchvizView, { archvizMetadata } from "./view";

// Visitors outside India are rewritten to /usd/architectural-visualization by proxy.ts.
export const metadata: Metadata = archvizMetadata;

export default function ArchvizPage() {
  return <ArchvizView currency="INR" />;
}
