import type { Metadata } from "next";
import LumionView, { lumionMetadata } from "@/app/lumion-cloud-gpu/view";

// /lumion-cloud-gpu for a visitor outside India: proxy.ts rewrites to this path, so the
// browser still shows /lumion-cloud-gpu (and canonical stays /lumion-cloud-gpu). A direct hit on
// /usd/lumion-cloud-gpu is redirected by proxy.ts.
export const metadata: Metadata = lumionMetadata("USD");

export default function PageUsd() {
  return <LumionView currency="USD" />;
}
