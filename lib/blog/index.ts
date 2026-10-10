import type { BlogPost } from "./types";
import { blenderInteriorRender } from "./posts/blender-interior-render";
import { laptopD5Lumion } from "./posts/laptop-d5-lumion";
import { costWorkstationFarmBuy } from "./posts/cost-workstation-farm-buy";
import { afterEffectsRemoteGpu } from "./posts/after-effects-remote-gpu";

/** Newest first. Same date today, so this order is the editorial order. */
export const POSTS: BlogPost[] = [
  laptopD5Lumion,
  costWorkstationFarmBuy,
  blenderInteriorRender,
  afterEffectsRemoteGpu,
];

/**
 * Are draft posts visible on THIS build?
 *
 * Gated on the Vercel environment, not NODE_ENV, because the owner reviews on
 * a Vercel PREVIEW deployment, and a preview is a production `next build`
 * just like the live site. The rules:
 *
 *   VERCEL_ENV=production  -> hidden. Always. No env var overrides this, so
 *                             merging a branch with drafts in it cannot
 *                             publish them.
 *   VERCEL_ENV=preview     -> visible (with a draft banner, still noindex).
 *   VERCEL_ENV=development -> visible (`vercel dev`).
 *   no VERCEL_ENV:
 *     `next dev`           -> visible.
 *     `next build/start`   -> hidden, unless BLOG_SHOW_DRAFTS=1 is set
 *                             explicitly. A local production build should
 *                             behave like the live site by default.
 *
 * Read at build time: every blog route is statically generated, so this
 * decides which pages exist in the build at all.
 */
export function showDrafts(): boolean {
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === "production") return false;
  if (vercelEnv === "preview" || vercelEnv === "development") return true;
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.BLOG_SHOW_DRAFTS === "1";
}

/** Posts that exist on this build: published ones, plus drafts where allowed. */
export function visiblePosts(): BlogPost[] {
  const drafts = showDrafts();
  return POSTS.filter((p) => !p.draft || drafts);
}

/** Posts that are live and indexable everywhere. Used by the sitemap and footer. */
export function publishedPosts(): BlogPost[] {
  return POSTS.filter((p) => !p.draft);
}

export function getVisiblePost(slug: string): BlogPost | undefined {
  return visiblePosts().find((p) => p.slug === slug);
}

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export const BLOG_AUTHOR = "Coreframe team";

/** "10 October 2026", in India time. */
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}
