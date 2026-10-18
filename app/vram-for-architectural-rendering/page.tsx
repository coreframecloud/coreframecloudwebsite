import type { Metadata } from "next";
import VramView, { vramMetadata } from "./view";

// Visitors outside India are rewritten to /usd/vram-for-architectural-rendering by proxy.ts.
export const metadata: Metadata = vramMetadata();

export default function Page() {
  return <VramView currency="INR" />;
}
