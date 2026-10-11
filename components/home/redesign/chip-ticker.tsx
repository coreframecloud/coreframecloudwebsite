"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * SiteGround-style vertical feature ticker for the hero. The chip in the
 * middle is bright and full-size; the ones above and below shrink and fade.
 * It advances every 2 s with a smooth ease and pauses on hover or focus.
 * Phones see three chips, larger screens five. With reduced motion the markup
 * is the same and it still advances, every 3.5 s, as a gentle crossfade of the
 * centre chip with no sliding (the owner expects motion, never a frozen list).
 *
 * The list and its wording are the owner's, verbatim (11 Oct 2026); each is
 * a fact the site already states. Price-bearing chips arrive as props from
 * the live rate card, never typed here.
 */
type Chip = { text: string; highlight?: boolean };

const FACTS: Chip[] = [
  { text: "RTX 5080 · 16 GB" },
  { text: "8 Core · 64 GB RAM" },
  { text: "1 TB NVMe" },
  { text: "4K at 60 fps" },
  { text: "D5 · Lumion · Blender · Twinmotion" },
  { text: "After Effects & Premiere" },
  { text: "Billed by the minute" },
  { text: "International cards accepted" },
  { text: "No paperwork, just email and mobile" },
  // The owner's highlight (11 Oct 2026): accent glass, a "Studios" tag, and
  // the loop starts here and dwells on it twice as long.
  { text: "Shared cloud storage for studio teams", highlight: true },
  { text: "Save to your project drive" },
  { text: "Studio: DXF to room image" },
];
const HIGHLIGHT = FACTS.findIndex((f) => f.highlight);

export function ChipTicker({ extra = [] }: { extra?: string[] }) {
  const items: Chip[] = [...FACTS, ...extra.map((text) => ({ text }))];
  const n = items.length;
  const reduce = usePrefersReducedMotion();
  const [cur, setCur] = useState(HIGHLIGHT);
  const [paused, setPaused] = useState(false);

  const dwell = (items[cur]?.highlight ? 2 : 1) * (reduce ? 3500 : 2000);
  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => setCur((c) => (c + 1) % n), dwell);
    return () => clearTimeout(id);
  }, [reduce, paused, n, cur, dwell]);

  return (
    <div
      className="relative h-[156px] w-full overflow-hidden [--slot:52px] sm:h-[300px] sm:[--slot:60px] lg:[--origin:right_center]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-label="What you get"
      role="list"
    >
      {items.map((t, i) => {
        let d = (i - cur + n) % n;
        if (d > n / 2) d -= n;
        const far = Math.abs(d);
        const scale = reduce ? 1 : far === 0 ? 1 : far === 1 ? 0.88 : 0.76;
        const opacity = reduce ? (far === 0 ? 1 : 0) : far === 0 ? 1 : far === 1 ? 0.5 : far === 2 ? 0.18 : 0;
        const offset = reduce ? 0 : d;
        return (
          <div
            key={t.text}
            role="listitem"
            aria-hidden={far !== 0}
            className={`absolute top-1/2 left-0 flex w-full justify-start ease-[cubic-bezier(0.22,1,0.36,1)] lg:justify-end ${
              reduce ? "transition-opacity duration-1000" : "transition-[transform,opacity] duration-700"
            } ${
              far === 2 ? "max-sm:!opacity-0" : ""
            }`}
            style={{
              transform: `translateY(calc(-50% + var(--slot) * ${offset})) scale(${scale})`,
              opacity,
              transformOrigin: "var(--origin, left center)",
            }}
          >
            <span
              className={`cfh-chip whitespace-nowrap ${t.highlight ? "cfh-chip-hl" : far === 0 ? "bg-white/20 text-white" : ""}`}
            >
              {t.highlight ? (
                <span className="mr-2 rounded bg-blue px-1.5 py-0.5 text-[10.5px] font-semibold tracking-[0.08em] text-white uppercase">
                  Studios
                </span>
              ) : null}
              {t.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
