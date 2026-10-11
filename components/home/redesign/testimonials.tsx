"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { TESTIMONIALS } from "@/lib/testimonials";
import { Reveal } from "@/components/home/redesign/reveal";

const TINTS = {
  blue: "bg-tint-blue",
  lilac: "bg-tint-lilac",
  mint: "bg-tint-mint",
  sand: "bg-tint-sand",
} as const;
const CYCLE = ["mint", "blue", "sand", "lilac"] as const;

/**
 * Customer words, as big quote cards in a horizontal scroller with arrows.
 * Renders NOTHING while lib/testimonials.ts is empty: no placeholders, no
 * invented quotes.
 */
export function Testimonials() {
  const track = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  if (TESTIMONIALS.length === 0) return null;

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section className="py-24 sm:py-28">
      <div className="cfh-wrap">
        <Reveal>
          <h2 className="cfh-h2">What freelancers and studio owners say</h2>
        </Reveal>
      </div>
      <div
        ref={track}
        className="cfh-track mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none]"
      >
        {TESTIMONIALS.map((t, i) => (
          <motion.figure
            key={t.name + i}
            initial={{ opacity: 0, x: reduce ? 0 : 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: reduce ? 0.5 : 0.8, delay: reduce ? 0 : Math.min(i, 3) * 0.12, ease: [0.22, 1, 0.36, 1] }}
            className={`cfh-card grid w-[88vw] shrink-0 snap-start gap-8 sm:w-[min(980px,80vw)] ${
              t.photo ? "md:grid-cols-[1.2fr_0.8fr]" : ""
            } ${TINTS[t.tint ?? CYCLE[i % CYCLE.length]]}`}
          >
            <div>
              <span aria-hidden className="font-heading text-[56px] leading-none text-ink/80">
                &ldquo;
              </span>
              <blockquote className="mt-2 text-[19px] leading-[1.55] sm:text-[21px]">
                <strong className="font-semibold">{t.lead}</strong>
                {t.rest ? <> {t.rest}</> : null}
              </blockquote>
              <figcaption className="mt-7">
                <p className="text-[17px] font-semibold">{t.name}</p>
                <p className="text-[14px] text-ink-2">{t.role}</p>
              </figcaption>
            </div>
            {t.photo ? (
              <Image
                src={t.photo}
                alt={t.name}
                width={480}
                height={480}
                className="aspect-square w-full rounded-2xl object-cover"
              />
            ) : null}
          </motion.figure>
        ))}
      </div>
      {TESTIMONIALS.length > 1 ? (
        <div className="cfh-wrap mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Previous"
            className="grid h-14 w-14 place-items-center rounded-full border border-rule-strong text-[22px] hover:bg-paper-2"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Next"
            className="grid h-14 w-14 place-items-center rounded-full border border-ink text-[22px] hover:bg-paper-2"
          >
            →
          </button>
        </div>
      ) : null}
    </section>
  );
}
