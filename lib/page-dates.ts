import { CFD_DEMO, CFD_HOME, CLINIC_CASE, HVAC_PAGE, HVAC_SERVICE, MESH_STUDY } from "@/lib/cfd-pages";

/**
 * When each page's CONTENT last changed (SEO review 18 Oct 2026, T8). One
 * list for the sitemap's lastmod, the visible "Updated" byline and the
 * WebPage dateModified (components/seo/page-byline.tsx), so they agree. It used
 * to be `new Date()` on almost every URL, which tells crawlers the whole site
 * changes on every deploy, so they learn to ignore lastmod. Bump a date when
 * that page's wording or numbers change; pages built from lib/ data carry
 * their own (lib/cfd-pages.ts, blog posts, software pages).
 */
export const PAGE_UPDATED: Record<string, string> = {
  "/": "2026-10-22",
  "/lumion-cloud-gpu": "2026-10-18",
  "/enscape-cloud-gpu": "2026-10-18",
  "/d5-render-cloud-workstation": "2026-10-22",
  "/d5-render-vs-local-gpu": "2026-10-18",
  "/coreframe-vs-irender": "2026-10-13",
  "/vram-for-architectural-rendering": "2026-10-11",
  "/cloud-rendering-for-architects": "2026-10-18",
  "/architectural-visualization": "2026-10-19",
  "/cloud-workstation-vs-render-farm": "2026-10-11",
  "/video-animation-rendering": "2026-10-19",
  "/floor-plan-to-render": "2026-10-18",
  "/floor-plan-to-render/3bhk-example": "2026-10-18",
  "/enterprise": "2026-10-18",
  "/pricing": "2026-10-18",
  "/compute-nodes": "2026-10-15",
  "/solutions": "2026-10-18",
  "/how-to-use": "2026-10-18",
  "/about": "2026-10-18",
  "/apps": "2026-10-11",
  "/download": "2026-10-17",
  "/tools": "2026-10-18",
  "/tools/render-time": "2026-10-28",
  "/dwg-check": "2026-10-18",
  "/request-demo": "2026-10-11",
  "/privacy-policy": "2026-10-18",
  "/terms-of-service": "2026-10-18",
  "/refund-policy": "2026-10-18",
  "/support": "2026-10-26",
  [CFD_HOME.path]: CFD_HOME.updated,
  [CFD_DEMO.path]: CFD_DEMO.updated,
  [MESH_STUDY.path]: MESH_STUDY.updated,
  [HVAC_PAGE.path]: HVAC_PAGE.updated,
  [HVAC_SERVICE.path]: HVAC_SERVICE.updated,
  [CLINIC_CASE.path]: CLINIC_CASE.updated,
};

/** The ISO content date of a page, or null if it has none listed. */
export function pageUpdated(path: string): string | null {
  return PAGE_UPDATED[path] ?? null;
}

/** Visible content date of a software page without its own lastUpdated (last edited 11 Oct 2026). */
export const SOFTWARE_CONTENT_DATE = "22 October 2026";
