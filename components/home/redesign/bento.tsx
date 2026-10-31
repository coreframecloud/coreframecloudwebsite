import Link from "next/link";
import { NODE } from "@/lib/node-spec";
import type { LadderRanges } from "@/lib/rate-card";
import { Reveal } from "@/components/home/redesign/reveal";
import { FrameStrip } from "@/components/home/redesign/frame-strip";
import { Drift } from "@/components/home/redesign/depth";
import { walkthroughVideoObject } from "@/components/home/landing/walkthrough-section";
import { MinuteTicker } from "@/components/home/redesign/minute-ticker";
import type { Currency } from "@/lib/money";

/** The lowest live hourly rate for the "By the minute" ticker, or null. */
export type TickerRate = { hourly: number; currency: Currency; taxNote?: string } | null;

/**
 * The GPU workstation in detail, as glass cards in the cinema panel (16 Oct 2026; were soft tints) with real screenshots
 * cropped inside (the SiteGround "bento"). Studio left this grid on 13 Oct
 * 2026: it has its own band above (components/home/redesign/offerings.tsx).
 */
export function Bento({ youtubeId, ladder = null, ticker = null }: { youtubeId: string; ladder?: LadderRanges | null; ticker?: TickerRate }) {
  return (
    // The GPU family's cinema panel (owner, 16 Oct 2026): .cf-cine in globals.css.
    <section className="cf-cine cf-cine--band mt-16 sm:mx-3">
      <div className="cfh-wrap">
      <Reveal className="mx-auto max-w-[44rem] text-center">
        <p className="cf-eyebrow-dot text-[13px] font-semibold tracking-[0.1em] text-ink-2 uppercase">GPU workstations, in detail</p>
        <h2 className="cfh-h2 mt-3">
          A real workstation,
          <br className="hidden sm:block" /> <span className="cf-hl-underline">without buying one</span>
        </h2>
        <p className="mt-4 text-[17px] leading-[1.6] text-ink-2">
          Everything runs on our machines, with all infrastructure and data in India. You bring the laptop and the project.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 lg:grid-cols-2">
        {/* Workstation */}
        <Reveal tilt className="cfh-card flex flex-col bg-tint-blue lg:row-span-2">
          <h3 className="cfh-h3">The workstation</h3>
          <p className="mt-3 max-w-[30rem] text-[16px] leading-[1.6] text-ink-2">
            {/* Owner, 31 Oct 2026: Windows 11 or Windows Server, depending on the card. */}
            A full Windows machine, Windows 11 or Windows Server depending on the card, that&rsquo;s
            yours for the session, opened from the Coreframe app.
          </p>
          {/* The GPU ladder from the live rate card (owner, 21 Oct 2026); the
              disk is a fixed fact of every node. No GPU name is typed here. */}
          <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-2.5 text-[15px] sm:grid-cols-2">
            {ladder ? (
              <>
                <li>
                  <span className="font-semibold">{ladder.gpu}</span> · {ladder.vram} VRAM
                </li>
                <li>
                  <span className="font-semibold">{ladder.ram}</span> system RAM
                </li>
                <li>
                  <span className="font-semibold">{ladder.cpu}</span>
                </li>
              </>
            ) : (
              <li>
                <span className="font-semibold">A dedicated GPU</span> · the ladder is on the pricing page
              </li>
            )}
            <li>
              <span className="font-semibold">{NODE.disk}</span> working disk
            </li>
          </ul>
          <Drift className="mt-8 lg:mt-auto lg:pt-8">
            <FrameStrip />
          </Drift>
        </Reveal>

        <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-1">
          {/* Team plans */}
          <Reveal tilt delay={0.16} className="cfh-card bg-tint-mint">
            <h3 className="cfh-h3">For studios</h3>
            <ul className="mt-4 space-y-2 text-[15px] leading-[1.5] text-ink-2">
              <li className="font-semibold text-ink">Shared cloud storage for the whole team</li>
              <li>One shared pool of hours</li>
              <li>A login for each person</li>
              <li>One bill, one admin</li>
            </ul>
            <Link href="/enterprise" className="cfh-link mt-5 text-ink">
              Team plans <span aria-hidden>↗</span>
            </Link>
          </Reveal>

          {/* Billing */}
          <Reveal tilt delay={0.24} className="cfh-card flex flex-col bg-tint-sand">
            <h3 className="cfh-h3">By the minute</h3>
            <p className="mt-3 text-[15px] leading-[1.55] text-ink-2">
              No monthly plan and nothing to cancel. The meter runs only while you are connected, and every session shows what it cost.
            </p>
            {/* The old billing screenshot was removed 31 Oct 2026 (owner): a
                live-style ticker at the lowest live rate instead. */}
            {ticker ? <MinuteTicker hourly={ticker.hourly} currency={ticker.currency} taxNote={ticker.taxNote} /> : null}
          </Reveal>
        </div>

        {/* The walkthrough, full width */}
        <Reveal tilt delay={0.1} className="cfh-card bg-night text-white lg:col-span-2">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(walkthroughVideoObject(youtubeId)) }}
          />
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-[13px] font-semibold tracking-[0.1em] text-white/80 uppercase">
                Walkthrough
              </p>
              <h3 className="cfh-h3 mt-3">Watch a real session, start to finish</h3>
              <p className="mt-3 text-[16px] leading-[1.6] text-white/85">
                Sign in, launch a workstation, load a Blender scene, render it and pull the result
                back down. Recorded on our RTX 5080 node in Bengaluru, condensed to under five minutes.
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <iframe
                className="aspect-video w-full"
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                title="Coreframe Cloud: a full session, start to finish"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </Reveal>
      </div>
      </div>
    </section>
  );
}
