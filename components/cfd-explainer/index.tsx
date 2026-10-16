import Image from "next/image";
import type { ReactNode } from "react";

/**
 * The CFD explainer blocks (owner approved 16 Oct 2026). Styles: the "cfx"
 * section of app/globals.css. Used by /cfd and by blog rich text
 * (components/blog/rich-text.tsx) so posts can explain in the same voice.
 *
 * Keep the house rules: one <Hl> per view; stamps and labels are HTML (our
 * words), never painted into a picture; sketches are illustrations, so their
 * alt text says "sketch" and never passes for a result.
 */

type Tint = "teal" | "blue" | "coral";

/** The yellow highlighter. ONE per view. */
export function Hl({ children }: { children: ReactNode }) {
  return <span className="cfx-hl">{children}</span>;
}

/** Outlined numeral + title card. `as` sets the heading level (h2 default). */
export function SectionHead({
  n,
  tint = "teal",
  eyebrow,
  title,
  children,
  as: H = "h2",
}: {
  n?: number | string;
  tint?: Tint;
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  as?: "h2" | "h3";
}) {
  return (
    <div className="cfx-sechead">
      {n !== undefined ? (
        <div className={`cfx-numeral cfx-numeral--${tint}`} aria-hidden>
          {n}
        </div>
      ) : null}
      <div className="cfx-titlecard" style={n === undefined ? { gridColumn: "1 / -1" } : undefined}>
        {eyebrow ? <p className="cfx-eyebrow">{eyebrow}</p> : null}
        <H className="cfx-h2">{title}</H>
        {children ? <p>{children}</p> : null}
      </div>
    </div>
  );
}

/** A quote-mark card for the one sentence a section is about. */
export function Callout({ children, source }: { children: ReactNode; source?: string }) {
  return (
    <div className="cfx-callout">
      <p>{children}</p>
      {source ? <p className="cfx-src">{source}</p> : null}
    </div>
  );
}

/** One big outlined figure with a caption under it. */
export function Statement({ big, caption }: { big: ReactNode; caption?: string }) {
  return (
    <div className="cfx-statement">
      <div className="text-center">
        <div className="cfx-big">{big}</div>
        {caption ? <p className="cfx-cap">{caption}</p> : null}
      </div>
    </div>
  );
}

/** A rubber stamp in our own words. Decorative when the text says it too. */
export function Stamp({ children, soft = false, decorative = false }: { children: ReactNode; soft?: boolean; decorative?: boolean }) {
  return (
    <span className={`cfx-stamp${soft ? " cfx-stamp--soft" : ""}`} aria-hidden={decorative || undefined}>
      {children}
    </span>
  );
}

/**
 * An ink-and-watercolour sketch on the grid paper. `overlay` is an absolutely
 * positioned SVG (or anything) drawn over the picture, `stamp` sits bottom
 * right, `labels` are the two mono labels under a before/after picture.
 */
export function ExplainFigure({
  src,
  alt,
  width,
  height,
  caption,
  maxWidth,
  sizes = "(max-width: 900px) 100vw, 480px",
  overlay,
  stamp,
  labels,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: ReactNode;
  maxWidth?: number;
  sizes?: string;
  overlay?: ReactNode;
  stamp?: ReactNode;
  labels?: [string, string];
}) {
  return (
    <figure className="cfx-figure">
      <div className="relative mx-auto" style={maxWidth ? { maxWidth } : undefined}>
        <Image src={src} alt={alt} width={width} height={height} sizes={sizes} className="cfx-art h-auto w-full" />
        {overlay}
        {stamp ? <div className="cfx-figstamp">{stamp}</div> : null}
      </div>
      {labels ? (
        <div className="cfx-labels">
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
        </div>
      ) : null}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

/** One check: a figure on one side, the question and the answer on the other. */
export function CheckRow({
  q,
  title,
  figure,
  flip = false,
  children,
}: {
  q: string;
  title: ReactNode;
  figure: ReactNode;
  flip?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`cfx-check${flip ? " cfx-check--flip" : ""}`}>
      {figure}
      <div>
        <p className="cfx-q">{q}</p>
        <h3 className="cfx-h3">{title}</h3>
        {children}
      </div>
    </div>
  );
}
