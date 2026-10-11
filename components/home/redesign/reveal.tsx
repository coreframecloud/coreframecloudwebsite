"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Fade-up on first scroll into view: the one entrance the homepage uses. The
 * markup is identical with reduced motion (no hydration mismatch); there the
 * content only fades, it never slides.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  tilt = false,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Rise with a slight 3D tilt and scale-in (bento cards). */
  tilt?: boolean;
}) {
  const reduce = usePrefersReducedMotion();
  return (
    <motion.div
      className={className}
      initial={tilt ? { opacity: 0, y: 48, rotateX: 9, scale: 0.96, transformPerspective: 1200 } : { opacity: 0, y: 28 }}
      whileInView={tilt ? { opacity: 1, y: 0, rotateX: 0, scale: 1, transformPerspective: 1200 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={
        reduce
          ? { opacity: { duration: 0.5, delay }, y: { duration: 0 }, rotateX: { duration: 0 }, scale: { duration: 0 } }
          : { duration: tilt ? 0.9 : 0.7, delay, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {children}
    </motion.div>
  );
}
