import type { Metadata } from "next";
import RenderTimeView, { renderTimeMetadata } from "@/app/tools/render-time/view";

// /tools/render-time for a visitor outside India: proxy.ts rewrites to this
// path, so the browser still shows /tools/render-time (and the canonical stays
// /tools/render-time). A direct hit on /usd/tools/render-time is redirected.
export const metadata: Metadata = renderTimeMetadata();

export default function RenderTimePageUsd() {
  return <RenderTimeView currency="USD" />;
}
