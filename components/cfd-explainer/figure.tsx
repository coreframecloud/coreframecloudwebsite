import type { ReactNode } from "react";

/**
 * A price or a turnaround as the thing you see first (owner, 19 Oct 2026: "The
 * price is buried in the same text font and style, even the delivery time ...
 * Use the same watercolor theme to highlight these costs."). The number is
 * large, the word before it ("from", "within") and the qualifier under it are
 * small, and a soft watercolour wash sits behind the number (.cfx-fig in
 * globals.css: the section-numeral wash, no images, no motion). Not the
 * yellow highlighter: that stays one per view.
 */
export function CfxFigure({
  label,
  pre,
  figure,
  after,
  tone = "aqua",
  size = "lg",
}: {
  label?: string;
  pre?: string;
  figure: ReactNode;
  after?: ReactNode;
  tone?: "aqua" | "coral";
  size?: "lg" | "sm";
}) {
  return (
    <div className={`cfx-fig cfx-fig--${tone}${size === "sm" ? " cfx-fig--sm" : ""}`}>
      {label ? <p className="cfx-fig-label">{label}</p> : null}
      <p className="cfx-fig-line">
        {pre ? <span className="cfx-fig-pre">{pre} </span> : null}
        <span className="cfx-fig-num">{figure}</span>
      </p>
      {after ? <p className="cfx-fig-after">{after}</p> : null}
    </div>
  );
}
