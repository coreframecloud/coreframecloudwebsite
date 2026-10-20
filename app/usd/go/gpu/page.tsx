import type { Metadata } from "next";
import GpuLandingView, { gpuLandingMetadata } from "@/app/go/gpu/view";

// /go/gpu for a visitor outside India: proxy.ts rewrites to this path, so the
// browser stays on the public URL. A direct hit on /usd/go/gpu is redirected.
export async function generateMetadata(): Promise<Metadata> {
  return gpuLandingMetadata("USD");
}

export default function GpuLandingPageUsd() {
  return <GpuLandingView currency="USD" />;
}
