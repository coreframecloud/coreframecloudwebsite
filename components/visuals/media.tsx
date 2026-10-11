"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Pictures that replace paragraphs.
 *
 * GENERATED IMAGES ARE ALWAYS LABELLED. Anything from Gemini (public/visuals/
 * gen-*.webp) goes through <GenImage>, which prints "Illustration (generated)"
 * on the picture and says so in the alt text. Never call one a render.
 *
 * Parallax is gentle (±24px) and switched off under reduced motion; the
 * markup is the same either way, so hydration always matches.
 */
export function GenImage({
  src,
  alt,
  width,
  height,
  className = "",
  sizes = "(max-width: 768px) 100vw, 560px",
  parallax = false,
  priority = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  parallax?: boolean;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], parallax && !reduce ? [24, -24] : [0, 0]);
  return (
    <figure ref={ref} className={`relative overflow-hidden rounded-[24px] bg-paper-2 ${className}`}>
      <motion.div style={{ y }} className={parallax ? "-my-6" : ""}>
        <Image
          src={src}
          alt={`${alt} (illustration, generated)`}
          width={width}
          height={height}
          sizes={sizes}
          preload={priority}
          className="h-auto w-full object-cover"
        />
      </motion.div>
      <figcaption className="absolute right-3 bottom-3 rounded-md bg-black/55 px-2 py-1 text-[10.5px] tracking-[0.04em] text-white/90 backdrop-blur">
        Illustration (generated)
      </figcaption>
    </figure>
  );
}

/** A real screenshot or render of ours, framed the same way (no label). */
export function OwnImage({
  src,
  alt,
  width,
  height,
  caption,
  className = "",
  sizes = "(max-width: 768px) 100vw, 560px",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-[24px] border border-rule bg-paper-2 shadow-[0_20px_60px_-24px_rgba(16,17,19,0.35)]">
        <Image src={src} alt={alt} width={width} height={height} sizes={sizes} className="h-auto w-full" />
      </div>
      {caption ? <figcaption className="mt-2.5 text-[13px] text-ink-3">{caption}</figcaption> : null}
    </figure>
  );
}
