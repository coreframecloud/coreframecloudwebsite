import type { Metadata } from "next";
import BlogPostView, { blogMetadata, blogStaticParams } from "@/app/blog/[slug]/view";

// /blog/<slug> for a visitor outside India: proxy.ts rewrites to this path,
// so the browser (and the canonical) stay on the public URL. A direct hit on
// /usd/... is redirected by proxy.ts. No opengraph-image here: the public
// one is used by both copies.
export function generateStaticParams() {
  return blogStaticParams();
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return blogMetadata(slug, "USD");
}

export default async function BlogPostPageUsd({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BlogPostView slug={slug} currency="USD" />;
}
