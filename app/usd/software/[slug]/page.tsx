import type { Metadata } from "next";
import SoftwareView, { softwareMetadata, softwareStaticParams } from "@/app/software/[slug]/view";

// /software/<slug> for a visitor outside India: proxy.ts rewrites to this
// path, so the browser (and the canonical) stay on the public URL. A direct
// hit on /usd/... is redirected by proxy.ts.
export function generateStaticParams() {
  return softwareStaticParams();
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return softwareMetadata(slug, "USD");
}

export default async function SoftwareLandingPageUsd({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SoftwareView slug={slug} currency="USD" />;
}
