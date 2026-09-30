import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  SOFTWARE_PAGES,
  SOFTWARE_PAGES_BY_SLUG,
  type SoftwarePage,
} from "@/lib/software-pages";

/**
 * One landing page per application, rendered from lib/software-pages.ts.
 *
 * Deliberately a separate route from the older top-level [slug] pages: those
 * are short SEO stubs, these are full answers with FAQ schema. Keeping them
 * apart means the stub renderer does not have to grow conditionals, and a
 * future consolidation is a data move rather than a rewrite.
 *
 * Statically generated — these change when we edit the data, not per request,
 * and a crawler should never wait on a render.
 */

export function generateStaticParams() {
  return SOFTWARE_PAGES.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

// Next.js 16 passes `params` as a Promise — await it or every lookup misses.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = SOFTWARE_PAGES_BY_SLUG[slug];
  if (!page) return { title: "Page not found" };
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/software/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.description,
      type: "article",
    },
  };
}

function faqSchema(page: SoftwarePage) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export default async function SoftwareLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = SOFTWARE_PAGES_BY_SLUG[slug];
  if (!page) notFound();

  const related = page.related
    .map((slug) => SOFTWARE_PAGES_BY_SLUG[slug])
    .filter(Boolean) as SoftwarePage[];

  return (
    <main className="cf-section px-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(page)) }}
      />

      <div className="cf-col">
        <h1 className="cf-display">{page.title}</h1>
        <p className="cf-lead mt-[22px]">{page.intro}</p>
      </div>

      <section className="cf-col mt-16">
        <p className="cf-eyebrow mb-4">The problem</p>
        <p className="cf-section-copy break-words">{page.problem}</p>
      </section>

      <section className="cf-col mt-16">
        <h2 className="cf-section-title">Why rent a GPU for this.</h2>
        <ul className="mt-6 space-y-3">
          {page.why.map((point) => (
            <li key={point} className="flex gap-3 leading-7 break-words text-ink-2">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue/70" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {page.sections?.length ? (
        <div className="cf-col mt-16 space-y-14">
          {page.sections.map((section) => (
            <section key={section.h2}>
              <h2 className="cf-section-title">{section.h2}</h2>
              {section.body.map((para) => (
                <p key={para} className="cf-section-copy mt-4 break-words">
                  {para}
                </p>
              ))}
            </section>
          ))}
        </div>
      ) : null}

      <section className="cf-col mt-16">
        <h2 className="cf-section-title">Licensing.</h2>
        <div className="cf-note mt-6">
          <p className="cf-section-copy break-words">{page.licence}</p>
          <Link
            href="/apps"
            className="mt-3 inline-flex min-h-[44px] items-center text-sm text-blue underline underline-offset-4"
          >
            See everything that is preinstalled →
          </Link>
        </div>
      </section>

      <section className="cf-col mt-16">
        <h2 className="cf-section-title">Questions.</h2>
        <div className="mt-8 space-y-7">
          {page.faqs.map((faq) => (
            <div key={faq.q}>
              <h3 className="font-semibold text-ink">{faq.q}</h3>
              <p className="mt-2 leading-7 break-words text-ink-2">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="cf-col mt-16 flex flex-wrap gap-3">
        <Link href="/login" className="cf-btn-primary">
          Start free
        </Link>
        <Link href="/how-to-use" className="cf-btn-secondary">
          How it works
        </Link>
        <Link href="/pricing" className="cf-btn-secondary">
          Pricing
        </Link>
      </div>

      {related.length > 0 && (
        <section className="cf-col mt-16 border-t border-rule pt-8">
          <p className="cf-eyebrow mb-4">Related</p>
          <ul className="space-y-1">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/software/${r.slug}`}
                  className="inline-flex min-h-[44px] items-center break-words text-blue underline-offset-4 hover:underline"
                >
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
