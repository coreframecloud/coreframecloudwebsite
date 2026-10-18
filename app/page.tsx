import type { Metadata } from "next";
import HomeView, { homeMetadata } from "./home-view";

// Visitors outside India are rewritten to /usd by proxy.ts.
export const metadata: Metadata = homeMetadata;

export default function Page() {
  return <HomeView currency="INR" />;
}
