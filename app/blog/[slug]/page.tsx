import type { Metadata } from "next";
import BlogPostView, { blogMetadata, blogStaticParams } from "./view";

// Visitors outside India are rewritten to /usd/blog/<slug> by proxy.ts.
export function generateStaticParams() {
  return blogStaticParams();
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return blogMetadata(slug, "INR");
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BlogPostView slug={slug} currency="INR" />;
}
