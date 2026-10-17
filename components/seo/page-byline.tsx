import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { ORG_ID, SITE } from "@/lib/seo";
import { pageUpdated } from "@/lib/page-dates";
import { updatedLabel } from "@/lib/cfd-pages";

/**
 * Who wrote the page and when it last changed, visibly and in schema (GEO
 * check 18 Oct 2026, G-DATES and G-BYLINE: Google asks "who created the
 * content", and answer engines weigh freshness). The date is the page's
 * content date from lib/page-dates.ts, the same one the sitemap's lastmod
 * uses, never the build time.
 *
 * The visible line inherits the surrounding text colour (dark heroes too).
 * The schema is a WebPage node: author and publisher are the Organization in
 * the layout's @graph.
 */
export function PageByline({
  path,
  updated,
  published,
  className = "opacity-75",
}: {
  path: string;
  /** ISO date; defaults to the page's entry in lib/page-dates.ts. */
  updated?: string;
  /** ISO date, shown as "Published ..." when given. */
  published?: string;
  className?: string;
}) {
  const iso = updated ?? pageUpdated(path);
  if (!iso) return null;
  const url = path === "/" ? SITE : `${SITE}${path}`;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${url}#webpage`,
          url,
          inLanguage: "en-IN",
          isPartOf: { "@id": `${SITE}/#website` },
          ...(published ? { datePublished: published } : {}),
          dateModified: iso,
          author: { "@id": ORG_ID },
          publisher: { "@id": ORG_ID },
        }}
      />
      <p className={`text-[13px] leading-5 ${className}`}>
        By the{" "}
        <Link href="/about" className="underline underline-offset-2">
          Coreframe Cloud team
        </Link>
        {published ? (
          <>
            {" "}· Published <time dateTime={published}>{updatedLabel(published)}</time>
          </>
        ) : null}{" "}
        · Updated <time dateTime={iso}>{updatedLabel(iso)}</time>
      </p>
    </>
  );
}
