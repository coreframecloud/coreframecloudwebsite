import Image from "next/image";
import Link from "next/link";
import { NODE } from "@/lib/node-spec";
import { Reveal } from "@/components/home/redesign/reveal";
import { FrameStrip } from "@/components/home/redesign/frame-strip";
import { Drift } from "@/components/home/redesign/depth";
import { PlanImage, ShellFurnished } from "@/components/visuals/studio-compare";
import { walkthroughVideoObject } from "@/components/home/landing/walkthrough-section";

/**
 * The products as soft-tinted cards, each with a real screenshot or image
 * cropped inside (the SiteGround "bento"). Studio images are GENERATED, and
 * the card says so: only the empty shell is a render.
 */
export function Bento({ youtubeId }: { youtubeId: string }) {
  return (
    <section className="cfh-wrap pt-20 pb-24 sm:pt-28">
      <Reveal className="mx-auto max-w-[44rem] text-center">
        <h2 className="cfh-h2">
          A real workstation,
          <br className="hidden sm:block" /> without buying one
        </h2>
        <p className="mt-4 text-[17px] leading-[1.6] text-ink-2">
          Everything runs on our machines in Bengaluru. You bring the laptop and the project.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 lg:grid-cols-2">
        {/* Workstation */}
        <Reveal tilt className="cfh-card flex flex-col bg-tint-blue lg:row-span-2">
          <h3 className="cfh-h3">The workstation</h3>
          <p className="mt-3 max-w-[30rem] text-[16px] leading-[1.6] text-ink-2">
            A full Windows 11 machine that&rsquo;s yours for the session, opened from the Coreframe
            app.
          </p>
          <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-2.5 text-[15px] sm:grid-cols-2">
            <li>
              <span className="font-semibold">{NODE.gpu}</span> · {NODE.vram}
            </li>
            <li>
              <span className="font-semibold">{NODE.ram}</span> system RAM
            </li>
            <li>
              <span className="font-semibold">{NODE.cpuShort}</span> CPU
            </li>
            <li>
              <span className="font-semibold">{NODE.disk}</span> working disk
            </li>
          </ul>
          <Drift className="mt-8 lg:mt-auto lg:pt-8">
            <FrameStrip />
          </Drift>
        </Reveal>

        {/* Studio */}
        <Reveal tilt delay={0.08} className="cfh-card bg-tint-lilac">
          <div className="grid gap-6 sm:grid-cols-[0.9fr_1.1fr] sm:items-center">
            <div>
              <h3 className="cfh-h3">Coreframe Studio</h3>
              <p className="mt-3 text-[16px] leading-[1.6] text-ink-2">
                Upload a DXF floor plan. We render the exact room shell, then generate a furnished
                image from it.
              </p>
              <Link href="/floor-plan-to-render" className="cfh-link mt-5 text-ink">
                Try Studio <span aria-hidden>↗</span>
              </Link>
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-3">
              <Drift amount={10}>
                <PlanImage caption="Your plan (real drawing)" />
              </Drift>
              <Drift amount={16}>
                <ShellFurnished caption="Shell (rendered) · Furnished (generated)" />
              </Drift>
            </div>
          </div>
        </Reveal>

        <div className="grid min-w-0 gap-5 sm:grid-cols-2">
          {/* Studio plans */}
          <Reveal tilt delay={0.16} className="cfh-card bg-tint-mint">
            <h3 className="cfh-h3">For studios</h3>
            <ul className="mt-4 space-y-2 text-[15px] leading-[1.5] text-ink-2">
              <li className="font-semibold text-ink">Shared cloud storage for the whole team</li>
              <li>One shared pool of hours</li>
              <li>A login for each person</li>
              <li>One bill, one admin</li>
            </ul>
            <Link href="/enterprise" className="cfh-link mt-5 text-ink">
              Studio plans <span aria-hidden>↗</span>
            </Link>
          </Reveal>

          {/* Billing */}
          <Reveal tilt delay={0.24} className="cfh-card flex flex-col bg-tint-sand">
            <h3 className="cfh-h3">By the minute</h3>
            <p className="mt-3 text-[15px] leading-[1.55] text-ink-2">
              No monthly plan and nothing to cancel. Every session shows what it cost.
            </p>
            <div className="mt-5 -mr-7 -mb-7 overflow-hidden rounded-tl-xl border border-rule sm:-mr-9 sm:-mb-9">
              <Image
                src="/home/app-billing.webp"
                alt="Recent sessions with their duration and cost"
                width={725}
                height={342}
                sizes="(max-width: 640px) 100vw, 280px"
                className="h-auto w-full"
              />
            </div>
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
              <p className="text-[11.5px] font-semibold tracking-[0.12em] text-white/80 uppercase">
                Walkthrough
              </p>
              <h3 className="cfh-h3 mt-3">Watch a real session, start to finish</h3>
              <p className="mt-3 text-[16px] leading-[1.6] text-white/85">
                Sign in, launch a workstation, load a Blender scene, render it and pull the result
                back down. Recorded on our RTX 5080 in Bengaluru, condensed to under five minutes.
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
    </section>
  );
}
