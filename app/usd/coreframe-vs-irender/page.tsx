import type { Metadata } from "next";
import VsIrenderView, { vsIrenderMetadata } from "@/app/coreframe-vs-irender/view";

// /coreframe-vs-irender for a visitor outside India: proxy.ts rewrites to this path, so the
// browser still shows /coreframe-vs-irender (and canonical stays /coreframe-vs-irender). A direct hit on
// /usd/coreframe-vs-irender is redirected by proxy.ts.
export const metadata: Metadata = vsIrenderMetadata("USD");

export default function PageUsd() {
  return <VsIrenderView currency="USD" />;
}
