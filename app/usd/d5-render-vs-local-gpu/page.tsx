import type { Metadata } from "next";
import D5VsLocalView, { d5VsLocalMetadata } from "@/app/d5-render-vs-local-gpu/view";

// /d5-render-vs-local-gpu for a visitor outside India: proxy.ts rewrites to this path, so the
// browser still shows /d5-render-vs-local-gpu (and canonical stays /d5-render-vs-local-gpu). A direct hit on
// /usd/d5-render-vs-local-gpu is redirected by proxy.ts.
export const metadata: Metadata = d5VsLocalMetadata("USD");

export default function PageUsd() {
  return <D5VsLocalView currency="USD" />;
}
