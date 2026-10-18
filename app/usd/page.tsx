import type { Metadata } from "next";
import HomeView, { homeMetadata } from "@/app/home-view";

// The home page for a visitor outside India: proxy.ts rewrites / to this
// path, so the browser still shows / (and canonical stays /). A direct hit
// on /usd is redirected by proxy.ts.
export const metadata: Metadata = homeMetadata;

export default function HomePageUsd() {
  return <HomeView currency="USD" />;
}
