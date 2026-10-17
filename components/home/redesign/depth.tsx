import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Scroll depth for the homepage (owner, round 4). Transform and opacity only,
 * so nothing reflows.
 *
 * 18 Oct 2026: CSS scroll-driven animations (app/motion.css, section 8)
 * replace framer-motion's useScroll, so these are server components and ship
 * no JavaScript. Same distances as before. Browsers without
 * animation-timeline, and anyone with reduced motion, see a still image.
 */

/** The hero render: moves slower than the page and eases back as the sheet covers it. */
export function HeroBackdrop({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="cf-px-hero absolute inset-0 -z-20">
      <Image src={src} alt={alt} fill preload sizes="100vw" className="object-cover object-center" />
      <div className="cf-px-dim absolute inset-0 bg-black opacity-0" />
    </div>
  );
}

/** A background image that drifts slowly behind a band. */
export function ParallaxBg({ src, className = "" }: { src: string; className?: string }) {
  return (
    <div className="cf-px-scope absolute inset-0 -z-20 overflow-hidden">
      <div className={`cf-px-band absolute -inset-y-[15%] inset-x-0 ${className}`}>
        <Image src={src} alt="" fill sizes="100vw" className="object-cover" />
      </div>
    </div>
  );
}

/** Content that drifts a few pixels against the scroll, for images inside cards. */
export function Drift({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`cf-px-scope ${className}`}>
      <div className="cf-px-drift">{children}</div>
    </div>
  );
}
