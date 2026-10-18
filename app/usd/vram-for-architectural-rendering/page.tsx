import type { Metadata } from "next";
import VramView, { vramMetadata } from "@/app/vram-for-architectural-rendering/view";

// /vram-for-architectural-rendering for a visitor outside India: proxy.ts rewrites to this path, so the
// browser still shows /vram-for-architectural-rendering (and canonical stays /vram-for-architectural-rendering). A direct hit on
// /usd/vram-for-architectural-rendering is redirected by proxy.ts.
export const metadata: Metadata = vramMetadata();

export default function PageUsd() {
  return <VramView currency="USD" />;
}
