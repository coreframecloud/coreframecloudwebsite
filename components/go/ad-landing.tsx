import Link from "next/link";
import { CoreframeWordmarkAtlas } from "@/components/brand/coreframe-wordmark-atlas";
import { ViewContent } from "@/components/analytics/view-content";
import { KeepQueryLink } from "./keep-query-link";

/**
 * The shell of a paid landing page (/go/gpu, /go/cfd). Owner, 20 Oct 2026,
 * after a funnel lesson: "send ad traffic to a page with ONE job — clear
 * promise, short video, one button; no menu/blog/careers".
 *
 * So: no header, no promo strip, no footer menu and no floating chat button
 * (components/layout/bare-on-landing.tsx drops all of them for these paths);
 * one promise, the ad's own reel, three proof points, the price once, ONE
 * primary button, at most three questions, and the legal links.
 *
 * Mobile first. On a 390 x 844 phone the button sits above the fold, and the
 * video comes after it, so it can never push the button down or cover it.
 * On a wide screen the video moves to the right of the text.
 *
 * Every claim and price is passed in by the page, from the same sources the
 * live pages use. Nothing here types a number.
 */

export type LandingFaq = { q: string; a: string };

export function AdLanding({
  eyebrow,
  title,
  lead,
  points,
  price,
  cta,
  ctaNote,
  video,
  faq,
  viewContent,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead: string;
  points: string[];
  /** The page's one price line, in the visitor's currency only. */
  price: React.ReactNode | null;
  cta: { href: string; label: string; event: string };
  ctaNote?: string;
  video: { src: string; poster: string; label: string };
  faq: LandingFaq[];
  viewContent: { name: string; category: string };
}) {
  return (
    <div className="relative min-h-screen overflow-x-clip text-ink">
      <div className="cf-aurora" />
      <ViewContent name={viewContent.name} category={viewContent.category} />
      <main className="relative mx-auto w-full max-w-[1120px] px-5 pt-5 pb-10 sm:pt-8 lg:px-8">
        <div className="flex items-center" aria-label="Coreframe Cloud">
          <CoreframeWordmarkAtlas iconSize={44} animated={false} />
        </div>

        <div className="mt-6 grid gap-8 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-center lg:gap-14">
          <section>
            <p className="cf-eyebrow">{eyebrow}</p>
            <h1 className="mt-4 font-heading text-[clamp(30px,5vw,52px)] leading-[1.1] font-medium tracking-[-0.02em] text-ink [text-wrap:balance]">
              {title}
            </h1>
            <p className="mt-4 max-w-[52ch] text-[16.5px] leading-[1.55] text-ink-2 sm:text-[18px]">{lead}</p>

            {price ? (
              <p className="mt-5 text-[15.5px] leading-6 text-ink">{price}</p>
            ) : null}

            <div className="mt-5 flex flex-col items-start gap-2">
              <KeepQueryLink href={cta.href} event={cta.event} className="cf-btn-primary">
                {cta.label}
              </KeepQueryLink>
              {ctaNote ? <p className="text-[13px] leading-5 text-ink-3">{ctaNote}</p> : null}
            </div>

            <ul className="mt-8 grid gap-3 sm:max-w-[560px]">
              {points.map((p) => (
                <li key={p} className="flex gap-3 text-[15px] leading-6 text-ink-2">
                  <span aria-hidden className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>

          <figure className="mx-auto w-full max-w-[420px]">
            {/* Muted, inline, looping: the ad's own reel, so the page continues
                the story the visitor just watched. aspect-[4/5] reserves the
                box before the file loads (no layout shift). */}
            <video
              className="aspect-[4/5] w-full rounded-[20px] bg-night object-cover shadow-[0_24px_60px_-28px_rgba(16,17,19,0.55)]"
              src={video.src}
              poster={video.poster}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={video.label}
            />
          </figure>
        </div>

        {faq.length ? (
          <section className="mt-14 max-w-[760px]">
            <h2 className="font-heading text-[22px] leading-tight font-medium text-ink">Questions</h2>
            <div className="mt-4 flex flex-col gap-2.5">
              {faq.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-cf border border-rule bg-paper-2 px-5 py-4 transition open:border-blue/25"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-[15.5px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span aria-hidden className="shrink-0 text-xl font-light leading-none text-blue">
                      <span className="group-open:hidden">+</span>
                      <span className="hidden group-open:inline">−</span>
                    </span>
                  </summary>
                  <p className="mt-3 max-w-[68ch] text-[14.5px] leading-6 text-ink-2">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      {/* Legal links only. The site footer (menus, blog, guides) is hidden on
          these paths. */}
      <footer className="relative border-t border-rule">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-x-5 gap-y-1 px-5 py-5 text-[12.5px] text-ink-3 lg:px-8">
          <span>© {new Date().getFullYear()} Coreframe Compute Labs Private Limited</span>
          <Link href="/privacy-policy" className="inline-flex min-h-11 items-center hover:text-ink">Privacy</Link>
          <Link href="/terms-of-service" className="inline-flex min-h-11 items-center hover:text-ink">Terms</Link>
          <Link href="/refund-policy" className="inline-flex min-h-11 items-center hover:text-ink">Refunds</Link>
        </div>
      </footer>
    </div>
  );
}
