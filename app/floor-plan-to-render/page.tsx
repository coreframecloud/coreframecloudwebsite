import type { Metadata } from "next";
import FloorPlanToRenderView, { floorPlanMetadata } from "./view";

// Visitors outside India are rewritten to /usd/floor-plan-to-render by proxy.ts.
export async function generateMetadata(): Promise<Metadata> {
  return floorPlanMetadata("INR");
}

export default function FloorPlanToRenderPage() {
  return <FloorPlanToRenderView currency="INR" />;
}
