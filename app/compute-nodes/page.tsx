import type { Metadata } from "next";
import ComputeNodesView, { computeNodesMetadata } from "./view";

// Visitors outside India are rewritten to /usd/compute-nodes by proxy.ts.
export function generateMetadata(): Metadata {
  return computeNodesMetadata("INR");
}

export default function ComputeNodesPage() {
  return <ComputeNodesView currency="INR" />;
}
