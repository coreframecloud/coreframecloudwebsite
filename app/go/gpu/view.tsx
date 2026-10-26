import type { Metadata } from "next";
import Link from "next/link";
import { preload } from "react-dom";
import { CoreframeWordmarkAtlas } from "@/components/brand/coreframe-wordmark-atlas";
import { ViewContent } from "@/components/analytics/view-content";
import { buildFaq } from "@/components/home/explainer-faq";
import type { Currency } from "@/lib/money";
import { storageTerms } from "@/lib/storage-terms";
import { GpuCards } from "@/components/go/gpu-cards";
import { IntroAltLine } from "@/components/go/intro-alt-line";
import { KeepQueryLink } from "@/components/go/keep-query-link";
import { StickyCta } from "@/components/go/sticky-cta";
import { adhocRate, adhocRateHourly, getRateCard, introOfferFor, introOfferShort, introOfferVariant, introPrice, ladderRanges, shortGpuName } from "@/lib/rate-card";

/**
 * /go/gpu — the paid landing page for the GPU workstation ads. Paid traffic
 * only, so noindex.
 *
 * Rebuilt 26 Oct 2026 (owner): the weekly digest showed 572 of 612 landings
 * (93%) never tapped the button. The old page opened with a paragraph, small
 * print and bullets, and its one button sat above the GPU cards where people
 * actually decide. Owner: "once someone has come to sign up, they already
 * decided they want to try. We just have to show them the way to do it."
 *
 * So, in order: the result the ads promise (the real 1:28 Blender render, with
 * Blender's own timer strip as proof), the first top-up offer in big type, one
 * big button, three steps, the GPU cards (each one a link to sign-up), the
 * reel, three questions. On a phone a bar with the button follows the reader
 * once the hero button has scrolled away (components/go/sticky-cta.tsx).
 *
 * The render: a real Coreframe session on an RTX 5080, Blender Cycles, 600
 * samples, Time 01:28.58 (marketing-20261025-zoomtext/SOURCES.md). No
 * resolution claim. Prices and hours come from the live rate card only.
 *
 * Rendered twice like every priced page: /go/gpu in rupees and app/usd/go/gpu
 * in dollars (proxy.ts); each plays the reel cut with its own price card.
 */

const FAQ_PICK = ["Is this a render farm?", "Do I need to install anything?", "What internet speed do I need?"];
const SIGNUP = "/signup";

export async function gpuLandingMetadata(currency: Currency): Promise<Metadata> {
  const card = await getRateCard();
  const offer = introOfferFor(card, currency);
  return {
    title: "A living room, rendered in 1:28 | Coreframe",
    description: offer
      ? `A real Blender render in 1:28 on an RTX 5080, streamed to the laptop you own. First top-up ${introOfferShort(offer).main}.`
      : "A real Blender render in 1:28 on an RTX 5080, streamed to the laptop you own.",
    robots: { index: false, follow: false },
  };
}

export default async function GpuLandingView({ currency }: { currency: Currency }) {
  const card = await getRateCard();
  const intro = introOfferFor(card, currency);
  const hourly = adhocRateHourly(card, currency);
  const ladder = ladderRanges(card);
  const faq = buildFaq(storageTerms(card), intro, adhocRate(card, currency) ?? undefined, currency).filter((f) =>
    FAQ_PICK.includes(f.q),
  );
  // First top-up A/B (owner approved 22 Oct 2026), rupee page only: the
  // "intro500" arm's line, shown after mount to visitors in that arm.
  const alt = currency === "INR" && intro ? introOfferVariant(card) : null;
  const short = intro ? introOfferShort(intro) : null;

  // The render is the page's LCP element on a phone.
  preload("/go/lr1-render.webp", { as: "image", fetchPriority: "high" });

  return (
    <div className="relative min-h-screen overflow-x-clip text-ink">
      <div className="cf-aurora" />
      <ViewContent name="Ad landing: GPU workstation" category="workstation" />
      <main className="relative mx-auto w-full max-w-[1120px] px-4 pt-3 pb-28 sm:px-5 sm:pt-8 lg:px-8 lg:pb-12">
        <div className="flex items-center" aria-label="Coreframe Cloud">
          <CoreframeWordmarkAtlas iconSize={32} animated={false} />
        </div>

        <div className="mt-3 grid gap-4 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-start lg:gap-14">
          {/* The result first: the ads promise it, so the page opens on it. */}
          <figure className="relative overflow-hidden rounded-[20px] bg-night shadow-[0_24px_60px_-28px_rgba(16,17,19,0.55)] lg:order-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/go/lr1-render.webp"
              alt="A living-room interior rendered in Blender Cycles on a Coreframe RTX 5080 workstation"
              width={1200}
              height={900}
              className="aspect-[16/10] w-full object-cover lg:aspect-[4/3]"
              fetchPriority="high"
            />
            <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 bg-gradient-to-t from-black/75 to-transparent px-3 pt-8 pb-2.5">
              {/* Blender's own status strip from the session: the proof. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/go/lr1-timer.png" alt="Blender status bar: Frame 0, Time 01:28.58" width={300} height={42} className="h-[18px] w-auto self-start rounded-[4px]" />
              <span className="text-[11.5px] font-medium text-white/85">Blender Cycles · RTX 5080 · 600 samples · real session</span>
            </figcaption>
          </figure>

          <section data-cf-section="hero" className="lg:order-1">
            <h1 className="font-heading text-[clamp(30px,6vw,56px)] leading-[1.05] font-medium tracking-[-0.02em] text-ink [text-wrap:balance]">
              A living room, rendered in <span className="cfx-hl">1:28</span>.
            </h1>
            <p className="mt-2 text-[16px] leading-[1.4] text-ink-2 sm:text-[19px]">
              On an RTX 5080 workstation, streamed to the laptop you already own.
            </p>

            {intro && short ? (
              <div className="mt-3 rounded-[16px] border border-rule bg-paper-2 px-4 py-3 sm:mt-5 sm:px-5 sm:py-4" data-cf-section="offer">
                <p className="text-[12px] font-semibold tracking-[0.06em] text-ink-3 uppercase">Your first top-up</p>
                <p className="font-heading text-[28px] leading-tight font-semibold text-ink sm:text-[34px]">
                  {introPrice(intro)} = {intro.hours} hours
                </p>
                <p className="text-[14.5px] leading-5 text-ink-2">
                  {intro.gpuName ? `on ${shortGpuName(intro.gpuName)}` : null}
                  {short.alt ? `, ${short.alt}` : null}
                </p>
                <IntroAltLine offer={alt} />
              </div>
            ) : hourly ? (
              <p className="mt-5 text-[22px] font-semibold text-ink">{hourly}, billed by the minute</p>
            ) : null}

            <div id="cf-hero-cta" className="mt-3 sm:mt-4">
              <KeepQueryLink href={SIGNUP} event="go_gpu_cta" cta="hero" className="cf-btn-go w-full sm:w-auto sm:px-12">
                Get started <span aria-hidden>→</span>
              </KeepQueryLink>
              <p className="mt-2 text-center text-[13.5px] text-ink-3 sm:text-left">
                No monthly plan · billed per minute{hourly ? ` · ${ladder && ladder.count > 1 ? "from " : ""}${hourly} after` : ""}
              </p>
            </div>
          </section>
        </div>

        {/* Show the way: what happens after the tap. */}
        <section className="mt-10 max-w-[760px]" data-cf-section="steps">
          <h2 className="font-heading text-[22px] leading-tight font-medium text-ink">How to start</h2>
          <ol className="mt-4 grid gap-2.5 sm:grid-cols-3">
            {["Sign up with your email", "Verify your phone with a code", "Top up and launch your GPU"].map((s, i) => (
              <li key={s} className="flex items-center gap-3 rounded-cf border border-rule bg-paper-2 px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue text-[15px] font-bold text-white">{i + 1}</span>
                <span className="text-[15.5px] leading-snug font-medium text-ink">{s}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10 max-w-[760px]" data-cf-section="ladder">
          <h2 className="font-heading text-[22px] leading-tight font-medium text-ink">Pick your GPU</h2>
          <p className="mt-1 text-[14.5px] text-ink-2">D5, Twinmotion, Unreal and Blender are already installed on every one.</p>
          <div className="mt-4">
            <GpuCards card={card} currency={currency} href={SIGNUP} showIntro={false} />
          </div>
        </section>

        <section className="mt-10 grid max-w-[760px] gap-4" data-cf-section="reel">
          <h2 className="font-heading text-[22px] leading-tight font-medium text-ink">The full render, start to finish</h2>
          <video
            className="mx-auto aspect-[9/16] w-full max-w-[360px] rounded-[20px] bg-night object-cover"
            src={currency === "USD" ? "/go/lr1-reel-usd.mp4" : "/go/lr1-reel-inr.mp4"}
            poster="/go/lr1-poster.webp"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            aria-label="The living-room render on a Coreframe RTX 5080 workstation: render time 1:28, then the laptop streaming the workstation."
          />
        </section>

        {faq.length ? (
          <section className="mt-12 max-w-[760px]" data-cf-section="faq">
            <h2 className="font-heading text-[22px] leading-tight font-medium text-ink">Questions</h2>
            <div className="mt-4 flex flex-col gap-2.5">
              {faq.map((f) => (
                <details key={f.q} className="group rounded-cf border border-rule bg-paper-2 px-5 py-4 transition open:border-blue/25">
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

        <div className="mt-10 max-w-[760px]">
          <KeepQueryLink href={SIGNUP} event="go_gpu_cta_end" cta="end" className="cf-btn-go w-full sm:w-auto sm:px-12">
            Get started <span aria-hidden>→</span>
          </KeepQueryLink>
          <p className="mt-3 text-[12.5px] leading-5 text-ink-3">
            Signed Windows app · {currency === "USD" ? "Indian company, invoice in US dollars" : "Indian company, GST invoice"} · failed connections are never charged
          </p>
        </div>
      </main>

      <footer className="relative border-t border-rule">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-x-5 gap-y-1 px-5 pt-5 pb-28 text-[12.5px] text-ink-3 lg:px-8 lg:pb-5">
          <span>© {new Date().getFullYear()} Coreframe Compute Labs Private Limited</span>
          <Link href="/privacy-policy" className="inline-flex min-h-11 items-center hover:text-ink">Privacy</Link>
          <Link href="/terms-of-service" className="inline-flex min-h-11 items-center hover:text-ink">Terms</Link>
          <Link href="/refund-policy" className="inline-flex min-h-11 items-center hover:text-ink">Refunds</Link>
        </div>
      </footer>

      <StickyCta href={SIGNUP} label="Get started" offer={intro ? `${introPrice(intro)} = ${intro.hours} h` : hourly ?? undefined} />
    </div>
  );
}
