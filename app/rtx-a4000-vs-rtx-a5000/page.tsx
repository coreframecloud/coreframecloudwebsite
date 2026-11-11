import type { Metadata } from "next";
import CompareView, { compareMetadata } from "./view";

// Visitors outside India are rewritten to /usd/rtx-a4000-vs-rtx-a5000 by proxy.ts.
export const metadata: Metadata = compareMetadata();

export default function Page() {
  return <CompareView currency="INR" />;
}
