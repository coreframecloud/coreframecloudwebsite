import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_AUTHOR, formatDate, publishedPosts, visiblePosts } from "@/lib/blog";
import { JsonLd } from "@/components/seo/json-ld";
import { OG_IMAGE, breadcrumbList } from "@/lib/seo";

/**
 * /blog. Lists the posts visible on this build.
 *
 * While every post is a draft, the production build has nothing to list and
 * this page 404s, so merging the blog cannot put an empty or draft-only page
 * on the live site. On a preview it lists the drafts, badged, and the page is
 * noindex until at least one post is published.
 */
const hasPublished = publishedPosts().length > 0;

export const metadata: Metadata = {
  title: "Blog: rendering, GPUs and cloud workstations",
  description:
    "Guides from the Coreframe team on rendering hardware, cloud workstations, costs in India, and running D5, Lumion, Blender and After Effects on a remote RTX GPU.",
  alternates: { canonical: "/blog" },
  ...(hasPublished ? {} : { robots: { index: false, follow: false } }),
  openGraph: {
    images: [OG_IMAGE],
    title: "Coreframe blog",
    description:
      "Guides on rendering hardware, cloud workstations and running design software on a remote RTX GPU.",
    url: "https://www.coreframecloud.com/blog",
    type: "website",
  },
};

export default function BlogIndexPage() {
  const posts = visiblePosts();
  if (!posts.length) notFound();

  return (
    <div className="relative min-h-screen text-ink">
      <JsonLd data={breadcrumbList([{ name: "Blog", path: "/blog" }])} />
      <main className="cf-section px-5">
        <div className="cf-wide">
          <p className="cf-eyebrow mb-5">Blog</p>
          <h1 className="cf-display max-w-[16ch]">Notes on rendering and remote GPUs.</h1>
          <p className="cf-lead mt-5 max-w-[60ch]">
            What actually needs a GPU, what it costs to own one or rent one in India, and step-by-step
            sessions on a cloud RTX workstation. Written by the {BLOG_AUTHOR.toLowerCase()}.
          </p>

          <ul className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2">
            {posts.map((p) => (
              <li key={p.slug} className="cf-card">
                <Link href={`/blog/${p.slug}`} className="group block">
                  <div className="overflow-hidden rounded-cf border border-rule bg-paper-2">
                    <Image
                      src={p.hero.src}
                      alt=""
                      width={p.hero.width}
                      height={p.hero.height}
                      sizes="(max-width: 640px) 100vw, 460px"
                      className="aspect-[16/9] h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                  <p className="cf-card-label mt-5">
                    {p.eyebrow}
                    {p.draft ? <span className="ml-2 rounded-cf bg-ink px-1.5 py-0.5 text-white">Draft</span> : null}
                  </p>
                  <h2 className="font-display text-[24px] leading-[1.2] font-semibold text-ink group-hover:text-blue-ink">
                    {p.title}
                  </h2>
                  <p className="mt-3 text-[15px] leading-6 text-ink-2">{p.description}</p>
                  <p className="mt-3 font-mono text-[12px] tracking-[0.06em] text-ink-3">
                    <time dateTime={p.datePublished}>{formatDate(p.datePublished)}</time>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
