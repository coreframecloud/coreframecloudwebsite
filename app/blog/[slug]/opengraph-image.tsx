import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { getVisiblePost, visiblePosts } from "@/lib/blog";

/**
 * Per-post share card, 1200x630, in the same layout as the site-wide one
 * (app/opengraph-image.tsx): logo, the post's title, the domain.
 *
 * NO PRICE ON THE IMAGE, for the reason given in the site-wide file: share
 * cards are cached by WhatsApp and LinkedIn for weeks.
 *
 * Built only for posts visible on this build, so a draft's title cannot leak
 * through its image URL on production.
 */
export const alt = "Coreframe Cloud blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return visiblePosts().map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getVisiblePost(slug);
  if (!post) notFound();
  const logo = await readFile(join(process.cwd(), "app/icon.png"), "base64");
  const long = post.title.length > 70;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "72px 80px",
          color: "#101113",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <img src={`data:image/png;base64,${logo}`} width={80} height={80} alt="" />
          <div style={{ fontSize: 34, fontWeight: 700 }}>Coreframe Cloud</div>
          <div style={{ fontSize: 26, color: "#5b6068", marginLeft: 8 }}>· Blog</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 24, color: "#2f6be0", letterSpacing: 3, textTransform: "uppercase" }}>
            {post.eyebrow}
          </div>
          <div style={{ fontSize: long ? 52 : 62, fontWeight: 700, lineHeight: 1.1 }}>{post.title}</div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#2f6be0" }}>www.coreframecloud.com/blog</div>
      </div>
    ),
    size,
  );
}
