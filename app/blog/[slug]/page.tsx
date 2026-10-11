import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRateCard } from "@/lib/rate-card";
import { BLOG_AUTHOR, formatDate, getVisiblePost, visiblePosts } from "@/lib/blog";
import { blogContext } from "@/lib/blog/context";
import type { BlogContext, BlogPost, Block, Faq } from "@/lib/blog/types";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE, breadcrumbList, faqPage } from "@/lib/seo";
import { ArticleBody } from "@/components/blog/article-body";
import { BlogCta } from "@/components/blog/blog-cta";
import { plainText } from "@/components/blog/rich-text";

/**
 * One blog post. Statically generated from lib/blog.
 *
 * Only the posts visible on THIS build get a page (see showDrafts() in
 * lib/blog/index.ts). dynamicParams = false makes every other slug a 404, so
 * on the production deployment a draft does not exist at all, rather than
 * existing with a noindex tag.
 */
export function generateStaticParams() {
  return visiblePosts().map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

/** Every word a reader sees in the article body, for wordCount and reading time. */
function articleWords(post: BlogPost, ctx: BlogContext): number {
  const texts: string[] = [post.answer(ctx)];
  for (const b of post.body(ctx)) {
    if (!b) continue;
    const blk = b as Block;
    if (blk.type === "p" || blk.type === "h2" || blk.type === "h3" || blk.type === "note") texts.push(blk.text);
    else if (blk.type === "ul" || blk.type === "ol") texts.push(...blk.items);
    else if (blk.type === "table") texts.push(...blk.head, ...blk.rows.flat());
    else if (blk.type === "spec") texts.push(...blk.rows.flat());
  }
  for (const f of post.faqs(ctx)) if (f) texts.push(f.q, f.a);
  return texts.map(plainText).join(" ").split(/\s+/).filter(Boolean).length;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getVisiblePost(slug);
  if (!post) return { title: "Page not found" };
  const url = `/blog/${post.slug}`;
  return {
    title: post.metaTitle ?? post.title,
    description: post.description,
    keywords: post.targetQueries,
    alternates: { canonical: url },
    // Drafts are noindex on every build that shows them (preview, local).
    // On production they are not built at all.
    ...(post.draft ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      // Explicit, because a page-level openGraph without `images` drops the
      // file-based one (see OG_IMAGE in lib/seo.ts). This is the per-post
      // card from ./opengraph-image.tsx.
      images: [{ url: `${url}/opengraph-image`, width: 1200, height: 630, alt: post.title }],
      title: post.title,
      description: post.description,
      url: `${SITE}${url}`,
      type: "article",
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified ?? post.datePublished,
      authors: [BLOG_AUTHOR],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getVisiblePost(slug);
  if (!post) notFound();

  const ctx = blogContext(await getRateCard());
  const answer = post.answer(ctx);
  const faqs = post.faqs(ctx).filter((f): f is Faq => Boolean(f));
  const words = articleWords(post, ctx);
  const minutes = Math.max(1, Math.round(words / 220));
  const url = `${SITE}/blog/${post.slug}`;

  const posting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: [`${SITE}${post.hero.src}`, `${url}/opengraph-image`],
    datePublished: post.datePublished,
    dateModified: post.dateModified ?? post.datePublished,
    inLanguage: "en-IN",
    wordCount: words,
    keywords: post.targetQueries.join(", "),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    author: {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "Coreframe Cloud",
      url: SITE,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "Coreframe Cloud",
      logo: { "@type": "ImageObject", url: `${SITE}/icon.png` },
    },
  };

  return (
    <div className="relative min-h-screen text-ink">
      <JsonLd data={posting} />
      <JsonLd
        data={breadcrumbList([
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      {faqs.length ? <JsonLd data={faqPage(faqs)} /> : null}

      {post.draft ? (
        <div className="bg-ink px-5 py-2.5 text-center font-mono text-[12px] tracking-[0.08em] text-white uppercase">
          Draft — not published. Visible on preview builds only, and not indexed.
        </div>
      ) : null}

      <section className="cf-section cf-pagehero px-5">
        <div className="cf-col">
              <nav aria-label="Breadcrumb" className="mb-6 font-mono text-[12px] tracking-[0.06em] text-ink-3">
                <Link href="/blog" className="hover:text-ink">
                  Blog
                </Link>
                <span aria-hidden> / </span>
                <span>{post.eyebrow}</span>
              </nav>
          
              <h1 className="cf-display">{post.title}</h1>
          
              <p className="mt-5 font-mono text-[12px] tracking-[0.06em] text-ink-3">
                {BLOG_AUTHOR} · <time dateTime={post.datePublished}>{formatDate(post.datePublished)}</time> ·{" "}
                {minutes} min read
              </p>
        </div>
      </section>
      <main className="cf-section px-5">
        <article className="cf-col">
          <figure className="mt-8">
            <Image
              src={post.hero.src}
              alt={post.hero.alt}
              width={post.hero.width}
              height={post.hero.height}
              priority
              sizes="(max-width: 720px) 100vw, 680px"
              className="h-auto w-full rounded-cf border border-rule bg-paper-2"
            />
            {post.hero.caption ? (
              <figcaption className="mt-2.5 text-[13px] leading-5 text-ink-3">{post.hero.caption}</figcaption>
            ) : null}
          </figure>

          <p className="cf-lead mt-8 text-ink">{plainText(answer)}</p>

          <ArticleBody blocks={post.body(ctx)} />

          {faqs.length ? (
            <section className="mt-16 border-t border-rule pt-10">
              <h2 className="cf-section-title">Questions</h2>
              <div className="mt-6 space-y-7">
                {faqs.map((f) => (
                  <div key={f.q}>
                    <h3 className="font-semibold text-ink">{f.q}</h3>
                    <p className="mt-2 leading-7 text-ink-2">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <BlogCta ctx={ctx} />

          <nav className="mt-14 border-t border-rule pt-8" aria-label="Related pages">
            <p className="cf-eyebrow mb-4">Related</p>
            <ul className="space-y-1">
              {post.related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="inline-flex min-h-[44px] items-center text-blue hover:underline">
                    {r.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </article>
      </main>
    </div>
  );
}
