/**
 * robots.txt — hand-written, because Next's MetadataRoute.Robots helper cannot
 * emit `Content-Signal:` lines and those are the whole point here.
 *
 * Replaces BOTH the old app/robots.ts and Cloudflare's Managed robots.txt.
 * Running those together produced two `User-agent: *` groups in one file, which
 * is ambiguous for parsers and meant nobody owned the policy. One file, one
 * owner, in git.
 *
 * The policy, in one sentence: AI systems may read us to ANSWER a user's
 * question right now, and may not keep us to train on.
 *
 * Those are different uses and they need different answers:
 *
 *   ai-input=yes  — retrieval, grounding, live generative search answers. This
 *                   is how an architect asking "where can I rent a GPU for
 *                   Lumion in India" ends up seeing us. Previously UNSET, which
 *                   the Content Signals spec defines as neither granted nor
 *                   restricted — silence, on the one permission we most want to
 *                   grant.
 *   ai-train=no   — no keeping our copy to train a model. Costs us no
 *                   visibility: a training crawl never sends anyone here.
 *   search=yes    — ordinary search indexing.
 *   use=reference — quote and cite us, do not reproduce us wholesale.
 *
 * Enforcement note: this file is a REQUEST. Cloudflare's Bot Fight Mode is what
 * actually refuses connections, and on 15 Aug 2026 it 403'd 156 of 221 AI
 * crawler requests — including well-behaved ones this file invites. Inviting a
 * crawler here and blocking it at the edge is the contradiction to watch; keep
 * the search bots below allowed in AI Crawl Control.
 */

// Crawlers that exist to TRAIN models. Blocking them costs no traffic.
const AI_TRAINING_BOTS = [
  "Amazonbot",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "ClaudeBot",
  "cohere-ai",
  "Diffbot",
  "FacebookBot",
  "Google-Extended",
  "GPTBot",
  "ImagesiftBot",
  "Meta-ExternalAgent",
  "meta-externalagent",
  "omgili",
  "Timpibot",
  "Webzio-Extended",
];

// Crawlers that fetch a page BECAUSE a user just asked something, and cite it
// in the answer. These are customers arriving, not content being taken — they
// are listed explicitly so a future edit cannot sweep them up with the block
// list above by accident.
// Kept in step with Cloudflare's own allow-list (AI Crawl Control → allowed
// crawlers). If a bot is permitted at the edge but absent here, the two
// systems disagree about the same visitor — and the one that answers the
// question "may I?" should not be the quieter of the two.
const AI_SEARCH_BOTS = [
  // Answer engines — a fetch here means a person just asked something.
  "Claude-SearchBot",
  "Claude-User",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "DuckAssistBot",
  "MistralAI-User",
  "meta-externalfetcher",
  "Manus-User",
  "ProRataInc",
  "Terracotta",
  // Conventional search indexes.
  "Applebot",
  "Googlebot",
  "bingbot",
  "DuckDuckBot",
  "YandexBot",
  "Baiduspider",
  // Preview/rendering and archival.
  "CloudflareBrowserRenderingCrawler",
  "archive.org_bot",
];

// Nothing here is secret — /api/ is authenticated and /signup is a redirect
// target — but neither belongs in an index.
const DISALLOWED_PATHS = ["/api/", "/signup"];

export function GET(): Response {
  const lines: string[] = [];

  lines.push("# Coreframe Compute Labs — https://www.coreframecloud.com");
  lines.push("#");
  lines.push("# You may read this site to answer a person's question and cite us.");
  lines.push("# You may not retain it to train a model.");
  lines.push("#");
  lines.push("# Content Signals (https://contentsignals.org):");
  lines.push("#   search   = building a search index and returning links/excerpts");
  lines.push("#   ai-input = retrieval, grounding, live generative search answers");
  lines.push("#   ai-train = training or fine-tuning models");
  lines.push("# ANY RESTRICTION BELOW IS AN EXPRESS RESERVATION OF RIGHTS UNDER ARTICLE 4");
  lines.push("# OF EU DIRECTIVE 2019/790 ON COPYRIGHT IN THE DIGITAL SINGLE MARKET.");
  lines.push("");

  // Default group. Content-Signal sits with User-agent: * so it applies to
  // every crawler that reads this file, including ones not yet named.
  lines.push("User-agent: *");
  lines.push("Content-Signal: search=yes,ai-input=yes,ai-train=no,use=reference");
  lines.push("Allow: /");
  for (const path of DISALLOWED_PATHS) lines.push(`Disallow: ${path}`);
  lines.push("");

  lines.push("# ── AI answer engines: welcome. Sending us a reader is the point. ──");
  for (const bot of AI_SEARCH_BOTS) {
    lines.push(`User-agent: ${bot}`);
    lines.push("Allow: /");
    for (const path of DISALLOWED_PATHS) lines.push(`Disallow: ${path}`);
    lines.push("");
  }

  lines.push("# ── Model-training crawlers: no. ──");
  for (const bot of AI_TRAINING_BOTS) {
    lines.push(`User-agent: ${bot}`);
    lines.push("Disallow: /");
    lines.push("");
  }

  lines.push("Sitemap: https://www.coreframecloud.com/sitemap.xml");
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // Crawlers re-read this often; a day is long enough to spare the origin
      // and short enough that a policy change lands the same day.
      "Cache-Control": "public, max-age=86400",
    },
  });
}
