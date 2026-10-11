"use client";

import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Scroll depth for the homepage (owner, round 4). Transform and opacity only,
 * so nothing reflows. Under reduced motion every value is pinned to rest:
 * the markup is identical, it just doesn't move.
 */

/** The hero render: moves slower than the page and eases back as the sheet covers it. */
export function HeroBackdrop({ src, alt }: { src: string; alt: string }) {
  const reduce = usePrefersReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 900], reduce ? [0, 0] : [0, 260]);
  const scale = useTransform(scrollY, [0, 900], reduce ? [1, 1] : [1.06, 0.96]);
  const dim = useTransform(scrollY, [0, 700], reduce ? [0, 0] : [0, 0.35]);
  return (
    <motion.div className="absolute inset-0 -z-20 will-change-transform" style={{ y, scale }}>
      <Image src={src} alt={alt} fill preload sizes="100vw" className="object-cover object-center" />
      <motion.div className="absolute inset-0 bg-black" style={{ opacity: dim }} />
    </motion.div>
  );
}

/** A background image that drifts slowly behind a band. */
export function ParallaxBg({ src, className = "" }: { src: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-12%", "12%"]);
  return (
    <div ref={ref} className="absolute inset-0 -z-20 overflow-hidden">
      <motion.div className={`absolute -inset-y-[15%] inset-x-0 ${className}`} style={{ y }}>
        <Image src={src} alt="" fill sizes="100vw" className="object-cover" />
      </motion.div>
    </div>
  );
}

/** Content that drifts a few pixels against the scroll, for images inside cards. */
export function Drift({ children, amount = 14, className = "" }: { children: ReactNode; amount?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [amount, -amount]);
  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
