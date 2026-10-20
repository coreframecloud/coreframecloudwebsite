import type { Metadata } from "next";
import GpuLandingView, { gpuLandingMetadata } from "./view";

// Visitors outside India are rewritten to /usd/go/gpu by proxy.ts.
export async function generateMetadata(): Promise<Metadata> {
  return gpuLandingMetadata("INR");
}

export default function GpuLandingPage() {
  return <GpuLandingView currency="INR" />;
}
