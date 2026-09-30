"use client";

import { useEffect, useRef } from "react";

/**
 * The four benefits, as a problem crossed out and replaced.
 *
 * WHY NOT A CAROUSEL. A carousel shows one of four things and hides the rest
 * behind a timer, which is the opposite of "understandable at a glance" — and
 * on a page people scroll rather than sit on, three of the four would never be
 * seen at all. Everything here is visible at once.
 *
 * WHY NOT FLOATING BUBBLES. The design language is hairline rules, mono labels
 * and 3px corners. Nothing on this site floats or pops; a bubble treatment
 * would read as a different website pasted into the middle of this one.
 *
 * So: the old way is written out and struck through, and the answer sits under
 * it. The strike is the whole idea — it is the only animation on the page, it
 * draws once when the block scrolls into view, and it says "this problem is
 * cancelled" without a word of copy spent explaining that.
 *
 * The animation is decoration, not meaning: the line is drawn with a CSS
 * transform on a pseudo-element, so with JavaScript off, with the observer
 * unsupported, or under prefers-reduced-motion, the text is still struck
 * through and the content still reads correctly. It never gates the message.
 */

const PAIRS: { old: string; now: string }[] = [
  {
    old: "One render desk. Everyone waits their turn.",
    now: "Four people, four machines, four laptops. Nobody queues.",
  },
  {
    old: "Your PC is hostage until the render finishes.",
    now: "It renders somewhere else. You keep working on yours.",
  },
  {
    old: "Latest file is on a pen drive. Or someone's desktop.",
    now: "One drive, mapped into every session. Same work, any laptop.",
  },
  {
    old: "The machine is at the office. You're not.",
    now: "Open it from a site visit, a client's office, your sofa.",
  },
];

export function OldWayNewWay() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    // No IntersectionObserver (or an old browser): show the finished state
    // rather than leaving the block mid-animation forever.
    if (typeof IntersectionObserver === "undefined") {
      root.classList.add("is-struck");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            root.classList.add("is-struck");
            io.disconnect();
          }
        }
      },
      { threshold: 0.35 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="cf-strike-grid grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2">
      {PAIRS.map((p, i) => (
        <div
          key={p.old}
          className="cf-strike-item border-t border-rule pt-5"
          style={{ ["--cf-strike-delay" as string]: `${i * 140}ms` }}
        >
          <p className="cf-strike-old text-[15px] leading-[1.5] text-ink-3">{p.old}</p>
          <p className="cf-strike-now mt-2.5 text-[16px] leading-[1.55] font-medium text-ink">
            {p.now}
          </p>
        </div>
      ))}
    </div>
  );
}
