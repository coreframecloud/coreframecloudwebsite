import type { Metadata } from "next";
import HvacSimulationView, { hvacSimulationMetadata } from "@/app/cfd/hvac-simulation/view";

// /cfd/hvac-simulation for a visitor outside India: proxy.ts rewrites to
// this path, so the browser (and the canonical) stay on the public URL.
// A direct hit on /usd/... is redirected by proxy.ts.
export const metadata: Metadata = hvacSimulationMetadata;

export default function HvacSimulationPageUsd() {
  return <HvacSimulationView currency="USD" />;
}
