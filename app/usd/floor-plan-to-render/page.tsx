import type { Metadata } from "next";
import FloorPlanToRenderView, { floorPlanMetadata } from "@/app/floor-plan-to-render/view";

// /floor-plan-to-render for a visitor outside India: proxy.ts rewrites to this
// path, so the browser (and the canonical) stay on the public URL. A direct
// hit on /usd/... is redirected by proxy.ts.
export async function generateMetadata(): Promise<Metadata> {
  return floorPlanMetadata("USD");
}

export default function FloorPlanToRenderPageUsd() {
  return <FloorPlanToRenderView currency="USD" />;
}
