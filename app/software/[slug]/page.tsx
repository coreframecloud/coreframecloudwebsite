import type { Metadata } from "next";
import { ViewContent } from "@/components/analytics/view-content";
import Link from "next/link";
import { GenImage, OwnImage } from "@/components/visuals/media";
import { PageHeroBg } from "@/components/page-hero-bg";
import { StreamDiagram, FileSyncDiagram } from "@/components/visuals/diagrams";
import { notFound } from "next/navigation";
import {
  SOFTWARE_PAGES,
  SOFTWARE_PAGES_BY_SLUG,
  type SoftwarePage,
} from "@/lib/software-pages";
import { getRateCard, introOfferFaq, pricingFaqAnswer } from "@/lib/rate-card";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbList, faqPage, OG_IMAGE } from "@/lib/seo";
import { GpuCineBand } from "@/components/gpu-cine-band";
import { GPU_HEROES } from "@/lib/gpu-heroes";

/**
 * `related` may name a top-level landing page as well as a /software slug.
 *
 * Until 10 Oct 2026 it could only resolve /software slugs, and three pages
 * listed "d5-render-cloud-workstation" -- which lives at the top level -- so
 * the link was silently filtered out. The strongest page on the site (D5
 * ranks 4-10 in Search Console) was getting no links from its siblings.
 */
const LANDING_LINKS: Record<string, string> = {
  "d5-render-cloud-workstation": "D5 Render cloud workstation",
  "lumion-cloud-gpu": "Lumion on a cloud RTX 5080",
  "enscape-cloud-gpu": "Enscape on a cloud RTX 5080",
  "cloud-rendering-for-architects": "Cloud rendering for architects",
  "d5-render-vs-local-gpu": "Renting a workstation vs buying one",
  "vram-for-architectural-rendering": "Is 8 GB of VRAM enough?",
  "cloud-workstation-vs-render-farm": "Cloud workstation vs render farm",
  "coreframe-vs-irender": "Coreframe vs iRender",
};

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
    title: page.metaTitle ?? page.title,
    description: page.description,
    alternates: { canonical: `/software/${page.slug}` },
    openGraph: {
      images: [OG_IMAGE],
      title: page.title,
      description: page.description,
      type: "article",
    },
  };
}


/**
 * One picture per software page. Generated images (Gemini) are labelled by
 * GenImage.
 */
/** Side picture for a page without its own sci-fi hero (lib/gpu-heroes.ts
 *  covers every slug today; this stays as the fallback). */
type Hero = { src: string; alt: string; w: number; h: number; generated: boolean; caption?: string };
const G = (src: string, alt: string): Hero => ({ src: `/visuals/${src}`, alt, w: 1600, h: 914, generated: true });

const HERO_BY_SLUG: Record<string, Hero> = {
  "revit-cloud-workstation": G("gen-architect-client-walkthrough-16x9.webp", "An architect walking clients through a 3D model"),
  "3ds-max-cloud-workstation": G("gen-visualiser-home-16x9.webp", "A 3D visualiser working on a laptop at home"),
  "sketchup-cloud-workstation": G("gen-designer-cafe-laptop-16x9.webp", "An interior designer working on a laptop in a cafe"),
  "blender-cloud-workstation": G("gen-motion-designer-desk-16x9.webp", "A motion designer at his desk"),
  "twinmotion-cloud-workstation": G("gen-architects-big-screen-16x9.webp", "Two architects discussing a building walkthrough on a wall screen"),
  "vray-cloud-rendering": G("gen-visualisers-review-16x9.webp", "Two visualisers reviewing stills together at a studio desk"),
  "rhino-cloud-workstation": { src: "/visuals/gen-student-architecture-4x5.webp", alt: "An architecture student with a laptop and models", w: 1000, h: 1286, generated: true },
  "after-effects-premiere-cloud-workstation": G("gen-motion-designer-desk-16x9.webp", "A motion designer at his desk"),
  default: G("gen-designer-cafe-laptop-16x9.webp", "A designer working on a thin laptop"),
};

export default async function SoftwareLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = SOFTWARE_PAGES_BY_SLUG[slug];
  if (!page) notFound();

  const related = page.related
    .map((slug): { href: string; label: string } | null => {
      const sw: SoftwarePage | undefined = SOFTWARE_PAGES_BY_SLUG[slug];
      if (sw) return { href: `/software/${sw.slug}`, label: sw.title };
      if (LANDING_LINKS[slug]) return { href: `/${slug}`, label: LANDING_LINKS[slug] };
      return null;
    })
    .filter((r): r is { href: string; label: string } => r !== null);

  // The price and the intro offer come from the live rate card, never from
  // the page data, and are dropped (not blanked) when it is unreachable.
  const card = await getRateCard();
  const priceAnswer = pricingFaqAnswer(card);
  const intro = introOfferFaq(card);
  const faqs = [
    ...page.faqs,
    ...(priceAnswer ? [{ q: "How much does a Coreframe workstation cost?", a: priceAnswer }] : []),
    ...(intro ? [intro] : []),
  ];

  const hero = HERO_BY_SLUG[page.slug] ?? HERO_BY_SLUG.default;
  const heroBg = GPU_HEROES[page.slug];
  return (
    <>
    <section className="cf-section cf-pagehero px-5">
      {heroBg ? <PageHeroBg image={heroBg} /> : null}
      <div className={heroBg ? "cf-wide" : "cf-wide grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]"}>
        <div className={heroBg ? "min-w-0 max-w-[620px]" : "min-w-0"}>
          <h1 className="cf-display">{page.title}</h1>
          <p className="cf-lead mt-[22px]">{page.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="cf-btn-primary">Sign up</Link>
            <Link href="/pricing" className="cf-btn-secondary">Pricing</Link>
          </div>
        </div>
        {heroBg ? null : hero.generated ? (
          <GenImage src={hero.src} alt={hero.alt} width={hero.w} height={hero.h} sizes="(max-width: 1024px) 100vw, 480px" parallax priority />
        ) : (
          <OwnImage src={hero.src} alt={hero.alt} width={hero.w} height={hero.h} caption={hero.caption} sizes="(max-width: 1024px) 100vw, 480px" />
        )}
      </div>
    </section>
    {/* The cinema band (owner, 16 Oct 2026): the sci-fi hero's look carried
        down the page. Details and FAQ below stay light. */}
    <GpuCineBand page={page.slug}>
      <section className="cf-wide">
        <h2 className="cf-section-title">Why rent a GPU for this.</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {page.why.map((point) => (
            <div key={point} className="cf-card cfh-lift text-[15px] leading-6 break-words text-ink-2">
              {point}
            </div>
          ))}
        </div>
      </section>

      {/* How it works, as two animated diagrams instead of paragraphs. */}
      <section className="cf-wide mt-14 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] bg-tint-blue p-6">
          <p className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-ink-2 uppercase">Your laptop, our workstation</p>
          <StreamDiagram />
        </div>
        <div className="rounded-[24px] bg-tint-mint p-6">
          <p className="mb-3 text-[13px] font-semibold tracking-[0.06em] text-ink-2 uppercase">Files wait on your drive</p>
          <FileSyncDiagram />
        </div>
      </section>

    </GpuCineBand>
    <main className="cf-gpu-page cf-section px-5">
      <ViewContent name={page.metaTitle ?? page.title} category="workstation" />
      <JsonLd data={faqPage(faqs)} />
      <JsonLd data={breadcrumbList([{ name: page.metaTitle ?? page.title, path: `/software/${page.slug}` }])} />

      {page.sections?.length ? (
        <section className="cf-col mt-16">
          <h2 className="cf-section-title">The details.</h2>
          <div className="mt-6 divide-y divide-rule rounded-[24px] border border-rule">
            {page.sections.map((section) => (
              <details key={section.h2} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                  {section.h2}
                  <span aria-hidden className="text-ink-3 transition group-open:rotate-45">+</span>
                </summary>
                {section.body.map((para) => (
                  <p key={para} className="mt-3 text-[15px] leading-6 break-words text-ink-2">
                    {para}
                  </p>
                ))}
              </details>
            ))}
          </div>
        </section>
      ) : null}

      <section className="cf-col mt-16">
        <div className="cf-note">
          <p className="text-[15px] leading-6 break-words text-ink-2"><span className="font-semibold text-ink">Licensing. </span>{page.licence}</p>
          <Link href="/apps" className="mt-2 inline-flex min-h-[44px] items-center text-sm text-blue underline underline-offset-4">
            See what is preinstalled →
          </Link>
        </div>
      </section>

      <section className="cf-col mt-16">
        <h2 className="cf-section-title">Questions.</h2>
        <div className="mt-6 divide-y divide-rule rounded-[24px] border border-rule">
          {faqs.map((faq) => (
            <details key={faq.q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                {faq.q}
                <span aria-hidden className="text-ink-3 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[15px] leading-6 break-words text-ink-2">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="cf-col mt-16 flex flex-wrap gap-3">
        <Link href="/signup" className="cf-btn-primary">
          Sign up
        </Link>
        <Link href="/how-to-use" className="cf-btn-secondary">
          How it works
        </Link>
      </div>

      {related.length > 0 && (
        <section className="cf-col mt-16 border-t border-rule pt-8">
          <p className="cf-eyebrow mb-4">Related</p>
          <ul className="space-y-1">
            {related.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="inline-flex min-h-[44px] items-center break-words text-blue underline-offset-4 hover:underline"
                >
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
    </>
  );
}
