import type { Metadata } from "next";
import ComputeNodesView, { computeNodesMetadata } from "@/app/compute-nodes/view";

// /compute-nodes for a visitor outside India: proxy.ts rewrites to this path, so the
// browser (and the canonical) stay on the public URL. A direct hit on
// /usd/compute-nodes is redirected by proxy.ts.
export function generateMetadata(): Metadata {
  return computeNodesMetadata("USD");
}

export default function ComputeNodesPageUsd() {
  return <ComputeNodesView currency="USD" />;
}
