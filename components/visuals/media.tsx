import Image from "next/image";

/**
 * Pictures that replace paragraphs.
 *
 * Marketing scenes (people, studios) from Gemini (public/visuals/gen-*.webp)
 * go through <GenImage>. Owner, 11 Oct 2026: no "generated" badge on these;
 * the alt text simply describes the scene. They are still NEVER called a
 * render, "rendered on our RTX 5080" or a customer. Studio product output
 * keeps its "generated image" label (components/visuals/studio-compare).
 *
 * Parallax is gentle (±24px) and switched off under reduced motion. Since
 * 18 Oct 2026 it is a CSS scroll-driven animation (app/motion.css), not
 * framer-motion, so these are server components and ship no JavaScript.
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
  return (
    <figure className={`relative overflow-hidden rounded-[24px] bg-paper-2 ${parallax ? "cf-px-scope" : ""} ${className}`}>
      <div className={parallax ? "cf-px-drift-lg -my-6" : ""}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          preload={priority}
          className="h-auto w-full object-cover"
        />
      </div>
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
