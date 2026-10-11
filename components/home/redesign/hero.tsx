import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/home/redesign/reveal";

/**
 * Full-bleed hero on a real Cycles render from our own machine (the interior
 * from the Blender walkthrough), darkened so the type reads. The chips float
 * over it like SiteGround's task cards; on phones they drop to a row.
 *
 * The intro offer line is passed in from the live rate card and disappears
 * when the offer is switched off. No price is typed here.
 */
export function RedesignHero({ introLabel }: { introLabel: string | null }) {
  return (
    <section className="relative isolate overflow-hidden bg-night text-white">
      <Image
        src="/home/hero-interior.webp"
        alt="An interior rendered in Blender Cycles on a Coreframe RTX 5080 workstation"
        fill
        preload
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0b0d11]/95 via-[#0b0d11]/75 to-[#0b0d11]/35" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[#0b0d11]/70 to-transparent" />

      <div className="cfh-wrap grid items-center gap-10 pt-20 pb-32 sm:pt-28 sm:pb-44 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal>
          <p className="mb-6 inline-block rounded-md bg-white/12 px-3 py-1.5 text-[11.5px] font-semibold tracking-[0.12em] uppercase">
            GPU workstations · Bengaluru
          </p>
          <h1 className="cfh-h1">
            Your laptop,
            <br />
            with an RTX&nbsp;5080 behind it.
          </h1>
          <p className="mt-6 max-w-[34rem] text-[17px] leading-[1.6] text-white/80 sm:text-[18px]">
            Rent a Windows workstation by the minute and open D5, Lumion, Blender or Twinmotion from
            the laptop you already own, streamed in 4K. Close it and billing stops.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="cfh-pill-light">
              Sign up
            </Link>
            <Link href="/pricing" className="cfh-pill-ghost">
              See pricing
            </Link>
          </div>
          {introLabel ? (
            <p className="mt-6 text-[14px] text-white/70">
              First top-up: <span className="font-semibold text-white">{introLabel}</span>
            </p>
          ) : null}
        </Reveal>

        <Reveal delay={0.15} className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
          <span className="cfh-chip">RTX 5080 · 16 GB</span>
          <span className="cfh-chip lg:mr-10">D5 · Lumion · Blender · Twinmotion · After Effects</span>
          <span className="cfh-chip">Billed by the minute, GST included</span>
          <span className="cfh-chip lg:mr-6">Streamed in 4K at 60 fps</span>
        </Reveal>
      </div>
    </section>
  );
}
