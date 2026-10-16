import { Reveal } from "@/components/home/redesign/reveal";
import { HeroBackdrop } from "@/components/home/redesign/depth";
import { HeroOfferingCards } from "@/components/home/redesign/offerings";

/**
 * Full-bleed hero on a living room rendered on our own machine (a RenderGrid
 * test render, 7 Oct 2026), darkened so the type reads. Only here since
 * 16 Oct 2026: /floor-plan-to-render has its own Studio export. Until 16 Oct 2026 it
 * was the Blender 4.1 splash scene, swapped out because its licence for
 * marketing use was never confirmed.
 *
 * 13 Oct 2026 (owner): the three services sit in the hero as equals: a line
 * about the company, then one card each for GPU workstations, CFD and Studio,
 * with its hook, a real image, a status badge and its own CTA. The chip
 * ticker and the single-product headline it carried were replaced by the
 * cards; the GPU hook ("Your laptop, with an RTX 5080 behind it.") lives on
 * in the GPU card.
 *
 * The intro offer line is passed in from the live rate card and disappears
 * when the offer is switched off. No workstation price is typed here.
 */
export function RedesignHero({ introLabel }: { introLabel: string | null }) {
  return (
    <section className="relative isolate overflow-hidden bg-night text-white">
      <HeroBackdrop
        src="/heroes/interior-rendergrid-2560.webp"
        alt="A calm living room with a white sofa, a woven leather chair, an olive tree and a garden through the windows"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0b0d11]/92 via-[#0b0d11]/70 to-[#0b0d11]/35" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-[#0b0d11]/85 to-transparent" />

      <div className="cfh-wrap pt-24 pb-8 sm:pt-28 sm:pb-12">
        <Reveal className="max-w-[56rem]">
          <p className="mb-4 inline-block rounded-md bg-white/12 px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase sm:mb-5 sm:text-[11.5px]">
            Coreframe Cloud · Bengaluru
          </p>
          <h1 className="font-heading text-[30px] leading-[1.1] font-medium tracking-[-0.02em] sm:text-[40px] lg:text-[46px]">
            Our machines do the heavy work.
            <br className="hidden sm:block" /> <span className="text-white/75">You keep the laptop you own.</span>
          </h1>
          <p className="mt-4 hidden max-w-[40rem] text-[16px] leading-[1.6] text-white/85 sm:block sm:text-[17px]">
            Rent an RTX 5080 workstation by the minute, send us a duct or pipe for CFD, or turn a floor
            plan into concept images. Three services, one team in Bengaluru.
          </p>
        </Reveal>

        <div className="mt-6 sm:mt-8">
          <HeroOfferingCards introLabel={introLabel} />
        </div>
      </div>
      <p className="cfh-wrap pb-20 text-[11.5px] text-white/70 sm:pb-28">
        Background: a living room rendered on Coreframe.
      </p>
    </section>
  );
}
