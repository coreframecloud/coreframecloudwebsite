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

/** The Organization node in the layout's @graph; every page's schema points at it. */
export const ORG_ID = `${SITE}/#organization`;

const INDIA = { "@type": "Country", name: "IN" } as const;

/**
 * The same thing for sale in both currencies (SEO review 18 Oct 2026, T2):
 * an INR Offer eligible in India, GST included unless said otherwise, and a
 * USD Offer for everywhere else, never GST. Crawlers read the page from the
 * US and used to see one currency only; with both Offers every crawler gets
 * the same structured data whatever copy of the page it was served.
 */
export function regionalOffers(o: {
  name: string;
  inr: number;
  usd: number;
  url: string;
  description?: string;
  /** Default true. Verified is quoted "+ GST", so it passes false. */
  inrTaxIncluded?: boolean;
  /** A "from" price: adds a PriceSpecification with minPrice. */
  from?: boolean;
  /** Per month, per hour...: adds a UnitPriceSpecification. */
  unit?: { unitText: string; billingDuration?: string };
}) {
  const one = (price: number, currency: "INR" | "USD", vat: boolean) => ({
    "@type": "Offer",
    name: o.name,
    url: o.url,
    price: String(price),
    priceCurrency: currency,
    ...(o.description ? { description: o.description } : {}),
    ...(currency === "INR"
      ? { eligibleRegion: INDIA }
      : { eligibleRegion: { "@type": "Place", name: "Worldwide" }, ineligibleRegion: INDIA }),
    ...(o.from || o.unit
      ? {
          priceSpecification: {
            "@type": o.unit ? "UnitPriceSpecification" : "PriceSpecification",
            ...(o.from ? { minPrice: price } : { price }),
            priceCurrency: currency,
            valueAddedTaxIncluded: vat,
            ...(o.unit ? { unitText: o.unit.unitText } : {}),
            ...(o.unit?.billingDuration ? { billingDuration: o.unit.billingDuration } : {}),
          },
        }
      : {}),
    valueAddedTaxIncluded: vat,
  });
  return [one(o.inr, "INR", o.inrTaxIncluded ?? true), one(o.usd, "USD", false)];
}

/** areaServed for a service sold in India and abroad. */
export const AREA_SERVED_WORLD = [
  { "@type": "Country", name: "India" },
  { "@type": "Place", name: "Worldwide" },
];

/** HowTo from plain steps (name + text). */
export function howTo(name: string, steps: { title: string; body: string }[], extra: object = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    ...extra,
    step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.body })),
  };
}
