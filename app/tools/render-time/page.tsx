import type { Metadata } from "next";
import RenderTimeView, { renderTimeMetadata } from "./view";

// Visitors outside India are rewritten to /usd/tools/render-time by proxy.ts.
export const metadata: Metadata = renderTimeMetadata();

export default function RenderTimePage() {
  return <RenderTimeView currency="INR" />;
}
