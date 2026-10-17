/**
 * /blog/rss.xml — RSS 2.0 feed of the published posts (GEO check 18 Oct 2026:
 * feed readers and some answer engines discover new articles through a feed).
 * Linked from every page's <head> in app/layout.tsx. Published posts only:
 * drafts never reach the feed, whatever the build.
 */
import { BLOG_AUTHOR, publishedPosts } from "@/lib/blog";

const SITE = "https://www.coreframecloud.com";

export const revalidate = 3600;

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** RFC 822 date at midnight India time. */
function rfc822(iso: string): string {
  return new Date(`${iso}T00:00:00+05:30`).toUTCString();
}

export async function GET(): Promise<Response> {
  const posts = [...publishedPosts()].sort((a, b) =>
    (b.dateModified ?? b.datePublished).localeCompare(a.dateModified ?? a.datePublished),
  );
  const newest = posts[0];
  const items = posts
    .map((p) => {
      const url = `${SITE}/blog/${p.slug}`;
      return [
        "    <item>",
        `      <title>${esc(p.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <description>${esc(p.description)}</description>`,
        `      <dc:creator>${esc(BLOG_AUTHOR)}</dc:creator>`,
        `      <category>${esc(p.eyebrow)}</category>`,
        `      <pubDate>${rfc822(p.datePublished)}</pubDate>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Coreframe Cloud blog</title>
    <link>${SITE}/blog</link>
    <atom:link href="${SITE}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <description>Guides from the Coreframe team: pressure drop and CFD verification, rendering hardware, cloud workstations and remote GPUs.</description>
    <language>en-IN</language>
${newest ? `    <lastBuildDate>${rfc822(newest.dateModified ?? newest.datePublished)}</lastBuildDate>\n` : ""}${items}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
