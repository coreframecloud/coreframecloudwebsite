import Link from "next/link";
import { Reveal } from "@/components/home/redesign/reveal";
import { HeroBackdrop } from "@/components/home/redesign/depth";
import { ChipTicker } from "@/components/home/redesign/chip-ticker";

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
      <HeroBackdrop
        src="/home/hero-interior.webp"
        alt="The Blender 4.1 splash interior, rendered in Cycles on a Coreframe RTX 5080"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0b0d11]/92 via-[#0b0d11]/60 to-[#0b0d11]/15" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[#0b0d11]/70 to-transparent" />

      <div className="cfh-wrap grid items-center gap-10 pt-32 pb-10 sm:pt-40 sm:pb-14 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal>
          <Link
            href="/cfd-intake"
            className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-[#8fb3ff] bg-[rgba(47,107,224,0.85)] px-4 py-2 text-[13.5px] font-semibold text-white shadow-[0_10px_30px_rgba(47,107,224,0.45)] transition-colors hover:bg-[#2f6be0]"
          >
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] tracking-[0.08em] text-[#2f6be0] uppercase">New</span>
            <span className="truncate">CFD for ducts and pipes: upload an STL, get a quote</span>
            <span aria-hidden="true">→</span>
          </Link>
          <br />
          <p className="mb-6 inline-block rounded-md bg-white/12 px-3 py-1.5 text-[11.5px] font-semibold tracking-[0.12em] uppercase">
            GPU workstations · Bengaluru
          </p>
          <h1 className="cfh-h1">
            Your laptop,
            <br />
            with an RTX&nbsp;5080 behind it.
          </h1>
          <p className="mt-6 max-w-[34rem] text-[17px] leading-[1.6] text-white/90 sm:text-[18px]">
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
            <p className="mt-6 text-[14px] text-white/85">
              First top-up: <span className="font-semibold text-white">{introLabel}</span>
            </p>
          ) : null}
        </Reveal>

        <Reveal delay={0.15} className="w-full">
          <ChipTicker />
        </Reveal>
      </div>
      <p className="cfh-wrap pb-24 text-[12px] text-white/80 sm:pb-32">
        Scene: Blender 4.1 splash, from the blender.org demo files. Rendered on our RTX&nbsp;5080.
      </p>
    </section>
  );
}
