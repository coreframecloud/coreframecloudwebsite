import Image, { getImageProps } from "next/image";
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

/**
 * The hero render: moves slower than the page and eases back as the sheet covers it.
 * `mobile` (1 Nov 2026): a portrait crop for phones, so a tall phone hero is not a
 * small slice of the wide file blown up. Same <picture> pattern as PageHeroBg.
 */
export function HeroBackdrop({
  src,
  alt,
  width = 2560,
  height = 1440,
  mobile,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  mobile?: { src: string; width: number; height: number };
}) {
  if (mobile) {
    const common = { alt, sizes: "100vw", quality: 75 };
    const {
      props: { srcSet: desktop, ...rest },
    } = getImageProps({ ...common, src, width, height });
    const phone = getImageProps({ ...common, src: mobile.src, width: mobile.width, height: mobile.height }).props.srcSet;
    return (
      <div className="cf-px-hero absolute inset-0 -z-20">
        <picture>
          <source media="(max-width: 639px)" srcSet={phone} sizes="100vw" />
          <source media="(min-width: 640px)" srcSet={desktop} sizes="100vw" />
          <img
            {...rest}
            srcSet={desktop}
            alt={alt}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </picture>
        <div className="cf-px-dim absolute inset-0 bg-black opacity-0" />
      </div>
    );
  }
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
