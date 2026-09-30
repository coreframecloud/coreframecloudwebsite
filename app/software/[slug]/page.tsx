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
    <main className="mx-auto max-w-4xl px-6 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(page)) }}
      />

      <h1 className="text-3xl font-semibold text-ink sm:text-4xl">{page.title}</h1>
      <p className="mt-6 text-lg leading-8 text-ink-2">{page.intro}</p>

      <section className="mt-12 rounded-cf border border-rule bg-paper-2 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-ink-3">
          The problem
        </h2>
        <p className="mt-3 leading-7 text-ink-2">{page.problem}</p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-ink">Why rent a GPU for this</h2>
        <ul className="mt-5 space-y-3">
          {page.why.map((point) => (
            <li key={point} className="flex gap-3 leading-7 text-ink-2">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue/70" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {page.sections?.length ? (
        <div className="mt-12 space-y-12">
          {page.sections.map((section) => (
            <section key={section.h2}>
              <h2 className="text-2xl font-semibold text-ink">{section.h2}</h2>
              {section.body.map((para) => (
                <p key={para} className="mt-4 leading-8 text-ink-2">
                  {para}
                </p>
              ))}
            </section>
          ))}
        </div>
      ) : null}

      <section className="mt-12 rounded-cf border border-blue/20 bg-blue/[0.05] p-6">
        <h2 className="text-lg font-semibold text-ink">Licensing</h2>
        <p className="mt-3 leading-7 text-ink-2">{page.licence}</p>
        <Link
          href="/apps"
          className="mt-4 inline-block text-sm text-blue underline underline-offset-4 hover:text-blue"
        >
          See everything that is preinstalled →
        </Link>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-ink">Questions</h2>
        <div className="mt-6 space-y-6">
          {page.faqs.map((faq) => (
            <div key={faq.q}>
              <h3 className="font-semibold text-ink">{faq.q}</h3>
              <p className="mt-2 leading-7 text-ink-2">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-12 flex flex-wrap gap-4">
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
        <section className="mt-16 border-t border-rule pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-ink-3">
            Related
          </h2>
          <ul className="mt-4 space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/software/${r.slug}`}
                  className="text-blue hover:text-blue hover:underline underline-offset-4"
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
