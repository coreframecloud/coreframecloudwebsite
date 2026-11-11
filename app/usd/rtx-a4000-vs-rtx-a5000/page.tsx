import type { Metadata } from "next";
import CompareView, { compareMetadata } from "@/app/rtx-a4000-vs-rtx-a5000/view";

// /rtx-a4000-vs-rtx-a5000 for a visitor outside India: proxy.ts rewrites to this path, so the
// browser still shows /rtx-a4000-vs-rtx-a5000 (and the canonical stays there). A direct hit on
// /usd/rtx-a4000-vs-rtx-a5000 is redirected by proxy.ts.
export const metadata: Metadata = compareMetadata();

export default function PageUsd() {
  return <CompareView currency="USD" />;
}
