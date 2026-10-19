import type { MetadataRoute } from "next";
import { SOFTWARE_PAGES } from "@/lib/software-pages";
import { publishedPosts } from "@/lib/blog";
import { PAGE_UPDATED as UPDATED } from "@/lib/page-dates";
import { HVAC_PAGE, HVAC_SERVICE } from "@/lib/cfd-pages";

/**
 * Canonical host is www: the apex 308-redirects to it. Listing apex URLs here
 * meant every entry in the sitemap was a redirect — crawlers follow them, but
 * it spends crawl budget on hops and gives search engines two candidate URLs
 * per page to reconcile. Point straight at the destination.
 */
const BASE = "https://www.coreframecloud.com";

/** Fallback for a software page with no lastUpdated of its own. */
const SOFTWARE_DEFAULT = "2026-10-11";

function lm(path: string): Date {
  const d = UPDATED[path];
  if (!d) throw new Error(`sitemap: no content date for ${path}; add it to UPDATED`);
  // UTC midnight, so the sitemap prints the same calendar day (2026-10-18T00:00:00.000Z).
  return new Date(`${d}T00:00:00Z`);
}

/** "18 October 2026" (a software page's visible lastUpdated) or ISO -> Date. */
function parseDay(v: string | undefined, fallback: string): Date {
  const d = v ? new Date(/^\d{4}-/.test(v) ? `${v}T00:00:00Z` : `${v} 00:00 UTC`) : null;
  return d && !Number.isNaN(d.getTime()) ? d : new Date(`${fallback}T00:00:00Z`);
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Published posts only, never drafts, on every build. /blog itself is
  // listed once there is something on it; until then it 404s in production.
  const posts = publishedPosts();

  return [
    { url: `${BASE}/`, lastModified: lm("/"), changeFrequency: "weekly", priority: 1.0 },

    // Product pages — what people search for by name.
    // /d5-render is NOT here. next.config.ts 308-redirects it to the homepage,
    // so listing it asked Google to crawl a URL that has no page — the D5 page
    // that exists is /d5-render-cloud-workstation, served by app/[slug].
    { url: `${BASE}/lumion-cloud-gpu`, lastModified: lm("/lumion-cloud-gpu"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/enscape-cloud-gpu`, lastModified: lm("/enscape-cloud-gpu"), changeFrequency: "monthly", priority: 0.8 },
    // D5 queries are the best-ranking cluster in Search Console (positions
    // 4-10) and this page was left out, so it was found only by links.
    { url: `${BASE}/d5-render-cloud-workstation`, lastModified: lm("/d5-render-cloud-workstation"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/d5-render-vs-local-gpu`, lastModified: lm("/d5-render-vs-local-gpu"), changeFrequency: "monthly", priority: 0.7 },
    // Added 2 Oct 2026. Both answer a question people type verbatim, which is
    // what an answer engine can actually cite -- unlike a landing page, which
    // only describes a product. A page absent from here is a page crawlers
    // find late or not at all, so these two lines are not optional.
    { url: `${BASE}/coreframe-vs-irender`, lastModified: lm("/coreframe-vs-irender"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/vram-for-architectural-rendering`, lastModified: lm("/vram-for-architectural-rendering"), changeFrequency: "monthly", priority: 0.8 },
    // The architectural visualization hub (19 Oct 2026): every archviz tool page, grouped by job.
    { url: `${BASE}/architectural-visualization`, lastModified: lm("/architectural-visualization"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/cloud-rendering-for-architects`, lastModified: lm("/cloud-rendering-for-architects"), changeFrequency: "monthly", priority: 0.8 },
    // Added 10 Oct 2026: answers "render farm vs cloud workstation", a query
    // every result for which was a competitor's blog.
    { url: `${BASE}/cloud-workstation-vs-render-farm`, lastModified: lm("/cloud-workstation-vs-render-farm"), changeFrequency: "monthly", priority: 0.8 },
    // Video and animation rendering (19 Oct 2026): After Effects, Premiere, Blender animation, walkthroughs.
    { url: `${BASE}/video-animation-rendering`, lastModified: lm("/video-animation-rendering"), changeFrequency: "monthly", priority: 0.8 },

    // COREFRAME STUDIO. Missing entirely until now, which is most of why it is
    // in no index: /studio on this host is a permanent 301 to the app
    // subdomain, so the only Studio URL the site had was one it had given away.
    // This is the page that can actually rank -- prose, headings, FAQ schema --
    // and the app now carries a canonical link back to it.
    { url: `${BASE}/floor-plan-to-render`, lastModified: lm("/floor-plan-to-render"), changeFrequency: "monthly", priority: 0.9 },
    // The 3BHK worked example (SEO review 18 Oct 2026, action 17).
    { url: `${BASE}/floor-plan-to-render/3bhk-example`, lastModified: lm("/floor-plan-to-render/3bhk-example"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/enterprise`, lastModified: lm("/enterprise"), changeFrequency: "monthly", priority: 0.9 },
    // New route: pricing left the homepage anchor and became a page when the
    // landing page was rebuilt. High priority — it is the second thing anyone
    // looks for after what the product is.
    { url: `${BASE}/pricing`, lastModified: lm("/pricing"), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/compute-nodes`, lastModified: lm("/compute-nodes"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/solutions`, lastModified: lm("/solutions"), changeFrequency: "monthly", priority: 0.7 },

    // The two pages that answer "how does this actually work" — the questions
    // people ask before buying, and the ones AI assistants get asked most.
    { url: `${BASE}/how-to-use`, lastModified: lm("/how-to-use"), changeFrequency: "monthly", priority: 0.9 },

    // The identity page. Brand queries ("what is Coreframe Cloud") returned
    // five other companies and not us, because no page here answered the
    // question at all.
    { url: `${BASE}/about`, lastModified: lm("/about"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/apps`, lastModified: lm("/apps"), changeFrequency: "monthly", priority: 0.8 },
    // The Connect client's page. People search the app by name, and it had no
    // title, description or canonical of its own until 10 Oct 2026.
    { url: `${BASE}/download`, lastModified: lm("/download"), changeFrequency: "monthly", priority: 0.5 },

    // Per-application landing pages, generated from the same data the pages
    // render from — so a new page cannot be published and left out of here.
    ...SOFTWARE_PAGES.map((page) => ({
      url: `${BASE}/software/${page.slug}`,
      lastModified: parseDay(page.lastUpdated, SOFTWARE_DEFAULT),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),

    // The blog. lastModified is the post's own date, not the build time, so
    // a redeploy does not tell crawlers that every article changed.
    ...(posts.length
      ? [
          {
            url: `${BASE}/blog`,
            // The newest post's date: the index changes when a post does.
            lastModified: new Date(Math.max(...posts.map((p) => new Date(p.dateModified ?? p.datePublished).getTime()))),
            changeFrequency: "weekly" as const,
            priority: 0.6,
          },
        ]
      : []),
    ...posts.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: new Date(p.dateModified ?? p.datePublished),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),

    // The free IFC pre-CFD checker. Served from the control plane through a
    // rewrite in next.config.ts, so there is no page under app/ for Next to
    // discover -- it has to be listed by hand or it is never crawled at all.
    // /cfd is the conversion step behind it and was likewise missing.
    { url: `${BASE}/tools`, lastModified: lm("/tools"), changeFrequency: "monthly", priority: 0.8 },

    // The free DWG dimension checker, added 2 Oct 2026. Same situation as
    // /tools above: served from the control plane through a rewrite, so Next
    // has no page under app/ to discover and it is crawled only because this
    // line exists. Priority 0.9 -- it answers a question people type verbatim
    // ("find missing dimensions in DWG"), which is the kind of page an answer
    // engine can cite, rather than a landing page that describes a product.
    { url: `${BASE}/dwg-check`, lastModified: lm("/dwg-check"), changeFrequency: "monthly", priority: 0.9 },
    // One of the three services (13 Oct 2026), so it ranks with the other two.
    { url: `${BASE}/cfd`, lastModified: lm("/cfd"), changeFrequency: "weekly", priority: 0.9 },
    // The Verified package's page (16 Oct 2026): mesh independence study / GCI.
    { url: `${BASE}/cfd/mesh-independence-study`, lastModified: lm("/cfd/mesh-independence-study"), changeFrequency: "monthly", priority: 0.8 },
    // Room airflow / HVAC (SEO review 18 Oct 2026, action 13).
    { url: `${BASE}${HVAC_PAGE.path}`, lastModified: lm(HVAC_PAGE.path), changeFrequency: "monthly", priority: 0.8 },
    // The HVAC simulation service page (19 Oct 2026); the guide above supports it.
    { url: `${BASE}${HVAC_SERVICE.path}`, lastModified: lm(HVAC_SERVICE.path), changeFrequency: "monthly", priority: 0.8 },
    // Case study (13 Oct 2026): HVAC airflow on a real clinic floor.
    { url: `${BASE}/cfd/projects/clinic-floor-hvac`, lastModified: lm("/cfd/projects/clinic-floor-hvac"), changeFrequency: "monthly", priority: 0.7 },

    // /contact is NOT here: it is a redirect to /request-demo, and a sitemap
    // should list destinations, not hops.
    { url: `${BASE}/request-demo`, lastModified: lm("/request-demo"), changeFrequency: "yearly", priority: 0.5 },

    { url: `${BASE}/privacy-policy`, lastModified: lm("/privacy-policy"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms-of-service`, lastModified: lm("/terms-of-service"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/refund-policy`, lastModified: lm("/refund-policy"), changeFrequency: "yearly", priority: 0.3 },
  ];
}
