import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/home/redesign/reveal";

/**
 * CFD for ducts and pipes, launched 13 Oct 2026. Owner: "why is it not on the
 * hero section and highlighted". The first band under the hero, so it is the
 * second thing anyone sees. Claims match /cfd-intake exactly; no prices beyond
 * the published quote fee, no time promises.
 */
export function CfdSpotlight() {
  const points = [
    "Upload one closed STL of the fluid volume",
    "We mesh it and email you a quote",
    "Pressure drop, loss coefficient, PDF report, 3D viewer and data files",
  ];
  return (
    <section id="cfd" className="cfh-wrap pt-16 pb-16 sm:pt-20 sm:pb-20">
      <Reveal className="grid items-center gap-10 overflow-hidden rounded-[32px] bg-night p-7 text-white sm:p-12 lg:grid-cols-[1fr_1fr]">
        <div className="min-w-0">
          <p className="mb-5 inline-flex items-center gap-2 rounded-md bg-[#2f6be0] px-3 py-1.5 text-[11.5px] font-semibold tracking-[0.12em] uppercase">
            New · CFD for ducts and pipes
          </p>
          <h2 className="cfh-h2">Pressure drop for your duct or pipe, from one STL.</h2>
          <p className="mt-5 max-w-[32rem] text-[17px] leading-[1.6] text-white/85">
            OpenFOAM runs on our machines, so you need no CFD licence and no workstation. You pay
            for the run only if you accept the quote.
          </p>
          <ul className="mt-7 space-y-3">
            {points.map((t) => (
              <li key={t} className="flex items-start gap-3 text-[15.5px] text-white/90">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8fb3ff]" />
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/cfd-intake" className="cfh-pill-light">
              Start a CFD job
            </Link>
            <Link href="/cfd-intake#sample" className="cfh-pill-ghost">
              See a sample report
            </Link>
          </div>
          <p className="mt-6 text-[14px] text-white/75">Quote fee ₹499 + GST.</p>
        </div>
        <figure className="min-w-0">
          <div className="overflow-hidden rounded-[24px] bg-white">
            <Image
              src="/cfd/bend-slice-p-zoom.webp"
              alt="Static pressure through a 90° pipe bend, from one of our CFD test runs"
              width={1316}
              height={889}
              className="h-auto w-full"
              sizes="(min-width: 1024px) 540px, 100vw"
            />
          </div>
          <figcaption className="mt-3 text-[12.5px] text-white/70">
            Static pressure through a 90° bend, water at 4 m/s. One of our own test runs.
          </figcaption>
        </figure>
      </Reveal>
    </section>
  );
}
