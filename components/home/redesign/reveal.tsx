import type { CSSProperties, ReactNode } from "react";

/**
 * Fade-up on first scroll into view: the one entrance the homepage uses.
 *
 * 18 Oct 2026: no longer framer-motion. This is plain markup (usable from
 * server and client components alike); the site's motion runtime
 * (components/scroll-reveal.tsx) hides it only if it is below the fold when
 * the page loads, then reveals it with app/motion.css. So the server HTML is
 * always fully visible (the old version shipped the hero headline at
 * opacity 0), and with reduced motion nothing moves at all.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  tilt = false,
  spot = false,
}: {
  children: ReactNode;
  /** Seconds. */
  delay?: number;
  className?: string;
  /** Rise with a slight 3D tilt and scale-in (bento cards). */
  tilt?: boolean;
  /** A soft light follows the pointer (dark cards that are not .cfh-card). */
  spot?: boolean;
}) {
  return (
    <div
      className={className}
      data-cf-reveal={tilt ? "tilt" : "up"}
      data-cf-spot={spot ? "" : undefined}
      style={delay ? ({ "--cf-d": `${delay}s` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
