import type { MetadataRoute } from "next";
import { SOFTWARE_PAGES } from "@/lib/software-pages";

/**
 * Canonical host is www: the apex 308-redirects to it. Listing apex URLs here
 * meant every entry in the sitemap was a redirect — crawlers follow them, but
 * it spends crawl budget on hops and gives search engines two candidate URLs
 * per page to reconcile. Point straight at the destination.
 */
const BASE = "https://www.coreframecloud.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },

    // Product pages — what people search for by name.
    { url: `${BASE}/d5-render`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/lumion-cloud-gpu`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/enscape-cloud-gpu`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/ansys-cfd-gpu`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/cloud-rendering-for-architects`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/enterprise`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/compute-nodes`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/solutions`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // The two pages that answer "how does this actually work" — the questions
    // people ask before buying, and the ones AI assistants get asked most.
    { url: `${BASE}/how-to-use`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/apps`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },

    // Per-application landing pages, generated from the same data the pages
    // render from — so a new page cannot be published and left out of here.
    ...SOFTWARE_PAGES.map((page) => ({
      url: `${BASE}/software/${page.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),

    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/request-demo`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },

    { url: `${BASE}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms-of-service`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/refund-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
