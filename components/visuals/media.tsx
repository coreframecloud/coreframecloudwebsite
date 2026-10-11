"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Pictures that replace paragraphs.
 *
 * Marketing scenes (people, studios) from Gemini (public/visuals/gen-*.webp)
 * go through <GenImage>. Owner, 11 Oct 2026: no "generated" badge on these;
 * the alt text simply describes the scene. They are still NEVER called a
 * render, "rendered on our RTX 5080" or a customer. Studio product output
 * keeps its "generated image" label (components/visuals/studio-compare).
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
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          preload={priority}
          className="h-auto w-full object-cover"
        />
      </motion.div>
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
