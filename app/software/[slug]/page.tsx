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

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const page = SOFTWARE_PAGES_BY_SLUG[params.slug];
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

export default function SoftwareLandingPage({ params }: { params: { slug: string } }) {
  const page = SOFTWARE_PAGES_BY_SLUG[params.slug];
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

      <h1 className="text-3xl font-semibold text-white sm:text-4xl">{page.title}</h1>
      <p className="mt-6 text-lg leading-8 text-white/70">{page.intro}</p>

      <section className="mt-12 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">
          The problem
        </h2>
        <p className="mt-3 leading-7 text-white/70">{page.problem}</p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-white">Why rent a GPU for this</h2>
        <ul className="mt-5 space-y-3">
          {page.why.map((point) => (
            <li key={point} className="flex gap-3 leading-7 text-white/70">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/70" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-6">
        <h2 className="text-lg font-semibold text-white">Licensing</h2>
        <p className="mt-3 leading-7 text-white/70">{page.licence}</p>
        <Link
          href="/apps"
          className="mt-4 inline-block text-sm text-cyan-300 underline underline-offset-4 hover:text-cyan-200"
        >
          See everything that is preinstalled →
        </Link>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-white">Questions</h2>
        <div className="mt-6 space-y-6">
          {page.faqs.map((faq) => (
            <div key={faq.q}>
              <h3 className="font-semibold text-white">{faq.q}</h3>
              <p className="mt-2 leading-7 text-white/60">{faq.a}</p>
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
        <Link href="/#pricing" className="cf-btn-secondary">
          Pricing
        </Link>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-white/[0.08] pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">
            Related
          </h2>
          <ul className="mt-4 space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/software/${r.slug}`}
                  className="text-cyan-300 hover:text-cyan-200 hover:underline underline-offset-4"
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
