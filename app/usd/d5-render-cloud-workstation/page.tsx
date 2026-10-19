import type { Metadata } from "next";
import D5View, { d5Metadata } from "@/app/d5-render-cloud-workstation/view";

// /d5-render-cloud-workstation for a visitor outside India: proxy.ts rewrites to this path, so the
// browser still shows /d5-render-cloud-workstation (and canonical stays /d5-render-cloud-workstation). A direct hit on
// /usd/d5-render-cloud-workstation is redirected by proxy.ts.
export const metadata: Metadata = d5Metadata();

export default function PageUsd() {
  return <D5View currency="USD" />;
}
