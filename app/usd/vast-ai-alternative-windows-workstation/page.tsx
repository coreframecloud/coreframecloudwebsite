import type { Metadata } from "next";
import VastAlternativeView, { vastAlternativeMetadata } from "@/app/vast-ai-alternative-windows-workstation/view";

// /vast-ai-alternative-windows-workstation for a visitor outside India: proxy.ts rewrites to this
// path, so the browser still shows the public URL (and canonical stays the public URL).
// A direct hit on /usd/vast-ai-alternative-windows-workstation is redirected by proxy.ts.
export const metadata: Metadata = vastAlternativeMetadata();

export default function PageUsd() {
  return <VastAlternativeView currency="USD" />;
}
