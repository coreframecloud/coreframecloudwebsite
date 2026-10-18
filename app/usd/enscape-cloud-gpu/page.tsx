import type { Metadata } from "next";
import EnscapeView, { enscapeMetadata } from "@/app/enscape-cloud-gpu/view";

// /enscape-cloud-gpu for a visitor outside India: proxy.ts rewrites to this path, so the
// browser still shows /enscape-cloud-gpu (and canonical stays /enscape-cloud-gpu). A direct hit on
// /usd/enscape-cloud-gpu is redirected by proxy.ts.
export const metadata: Metadata = enscapeMetadata("USD");

export default function PageUsd() {
  return <EnscapeView currency="USD" />;
}
