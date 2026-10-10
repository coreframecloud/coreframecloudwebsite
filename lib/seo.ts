/**
 * Structured-data helpers shared by the landing pages.
 *
 * BreadcrumbList is emitted per page rather than from the layout because only
 * the page knows where it sits. The trail is always Home -> (section) -> page,
 * written as site-relative paths and resolved against SITE here, so a page
 * cannot emit an apex or http:// URL by accident (the canonical host is www).
 */

export const SITE = "https://www.coreframecloud.com";

export type Crumb = { name: string; path: string };

export function breadcrumbList(trail: Crumb[]) {
  const full: Crumb[] = [{ name: "Home", path: "/" }, ...trail];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: full.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.path === "/" ? SITE : `${SITE}${c.path}`,
    })),
  };
}

export function faqPage(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/**
 * The site-wide share image (app/opengraph-image.tsx), for pages that set
 * their own `openGraph`. Next replaces an inherited openGraph object rather
 * than merging it, and a page-level openGraph without `images` drops the
 * file-based image too -- which is how the D5, iRender, VRAM and every
 * /software page shipped with no og:image at all.
 */
export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Coreframe Cloud: Windows RTX 5080 workstations, rented by the minute",
};
