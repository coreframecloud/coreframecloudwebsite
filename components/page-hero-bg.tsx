import { getImageProps } from "next/image";
import type { CSSProperties } from "react";

/**
 * A page's own picture behind its .cf-pagehero (16 Oct 2026).
 *
 * Put it as a DIRECT child of the hero <section>: globals.css keys off
 * `.cf-pagehero:has(> .cf-pagehero-bg)` to drop the site-wide faint interior
 * and add the scrim (dark under the text, open on the right). On the paper
 * variant (`cf-pagehero--paper`, CFD) there is no scrim and the sketch sits on
 * the right half instead.
 *
 * Art direction: a separate mobile crop below 900px, so the subject is not
 * cropped away on a phone. Both go through the image optimiser (AVIF/WebP,
 * see next.config.ts). It is the LCP element on these pages, so it loads
 * eagerly with fetchPriority high; `preload` is not usable with <picture>
 * (it would fetch both crops).
 *
 * `pos` / `posMobile` are CSS object-position values: where the subject is,
 * so `cover` keeps it in frame at every width.
 */
export type HeroImage = {
  src: string;
  w: number;
  h: number;
  mobile?: { src: string; w: number; h: number };
  alt: string;
  pos?: string;
  posMobile?: string;
  /** A darker scrim, for a picture whose left side is pale (16 Oct 2026). */
  strongScrim?: boolean;
  /** Short truthful credit, bottom right. Omit for none. */
  credit?: string;
};

export function PageHeroBg({ image, sizes = "100vw" }: { image: HeroImage; sizes?: string }) {
  const common = { alt: image.alt, sizes, quality: 75 };
  const {
    props: { srcSet: desktop, ...rest },
  } = getImageProps({ ...common, src: image.src, width: image.w, height: image.h });
  const mobile = image.mobile
    ? getImageProps({ ...common, sizes: "100vw", src: image.mobile.src, width: image.mobile.w, height: image.mobile.h }).props
        .srcSet
    : undefined;
  const style = {
    "--hero-pos": image.pos,
    "--hero-pos-m": image.posMobile ?? image.pos,
  } as CSSProperties;
  return (
    <>
      <picture className={`cf-pagehero-bg${image.strongScrim ? " cf-pagehero-bg--strong" : ""}`} style={style}>
        {mobile ? <source media="(max-width: 899px)" srcSet={mobile} sizes="100vw" /> : null}
        <source media="(min-width: 900px)" srcSet={desktop} sizes={sizes} />
        <img {...rest} srcSet={desktop} alt={image.alt} loading="eager" fetchPriority="high" decoding="async" />
      </picture>
      {image.credit ? <span className="cf-pagehero-credit">{image.credit}</span> : null}
    </>
  );
}
