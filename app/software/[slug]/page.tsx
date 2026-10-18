import type { Metadata } from "next";
import SoftwareView, { softwareMetadata, softwareStaticParams } from "./view";

// Visitors outside India are rewritten to /usd/software/<slug> by proxy.ts.
export function generateStaticParams() {
  return softwareStaticParams();
}

export const dynamicParams = false;

// Next.js 16 passes `params` as a Promise — await it or every lookup misses.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return softwareMetadata(slug, "INR");
}

export default async function SoftwareLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SoftwareView slug={slug} currency="INR" />;
}
