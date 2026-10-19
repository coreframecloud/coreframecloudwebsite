import type { Metadata } from "next";
import HvacSimulationView, { hvacSimulationMetadata } from "./view";

// Visitors outside India are rewritten to /usd/cfd/hvac-simulation by proxy.ts.
export const metadata: Metadata = hvacSimulationMetadata;

export default function HvacSimulationPage() {
  return <HvacSimulationView currency="INR" />;
}
