import type { CSSProperties } from "react";

/**
 * A quiet, text-only marquee (the look of React Bits' LogoLoop,
 * https://reactbits.dev, MIT + Commons Clause, (c) 2026 David Haz; rebuilt as
 * pure CSS, no logos, no script). The list is rendered twice so the loop is
 * seamless; the copy is aria-hidden, so screen readers and crawlers read it
 * once. Pauses on hover or focus; under reduced motion it is one still,
 * wrapped list. Styles: app/motion.css, section 6.
 */
export function Marquee({
  items,
  label,
  seconds = 48,
  className = "",
}: {
  items: string[];
  label: string;
  seconds?: number;
  className?: string;
}) {
  return (
    <div className={`cf-marquee ${className}`} style={{ "--cf-marquee-speed": `${seconds}s` } as CSSProperties}>
      <div className="cf-marquee-track">
        <ul className="cf-marquee-list" aria-label={label}>
          {items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <ul className="cf-marquee-list" aria-hidden="true">
          {items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
