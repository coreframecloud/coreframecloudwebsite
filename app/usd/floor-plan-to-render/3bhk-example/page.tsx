import type { Metadata } from "next";
import ThreeBhkExampleView, { threeBhkMetadata } from "@/app/floor-plan-to-render/3bhk-example/view";

// /floor-plan-to-render/3bhk-example for a visitor outside India: proxy.ts
// rewrites to this path, so the browser (and the canonical) stay on the
// public URL. A direct hit on /usd/... is redirected by proxy.ts.
export const metadata: Metadata = threeBhkMetadata;

export default function ThreeBhkExamplePageUsd() {
  return <ThreeBhkExampleView currency="USD" />;
}
