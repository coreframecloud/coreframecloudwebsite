import type { Metadata } from "next";
import ThreeBhkExampleView, { threeBhkMetadata } from "./view";

// Visitors outside India are rewritten to /usd/floor-plan-to-render/3bhk-example by proxy.ts.
export const metadata: Metadata = threeBhkMetadata;

export default function ThreeBhkExamplePage() {
  return <ThreeBhkExampleView currency="INR" />;
}
