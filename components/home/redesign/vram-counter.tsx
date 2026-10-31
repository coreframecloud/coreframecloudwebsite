"use client";

import { useRef, useState } from "react";
import { bubbleFont } from "@/lib/fonts-bubble";
import { vramRangeLabel } from "@/lib/rate-card";
import { Odometer, easeInOut, runTimeline, useReducedMotionFlag, useRollOnView } from "@/components/home/redesign/odometer";

/** Rest on each real card size. */
const HOLD_MS = 350;
/** Rolling time per segment: a base plus a little per GB (~2.5 s in all for 16/24/48). */
const roll = (from: number, to: number) => 520 + (to - from) * 24;

/**
 * The hero GPU card's memory counter (owner, 31 Oct 2026, v3: "big font,
 * scrolling, in our yellow highlight"). A mechanical odometer in #ffd43b on
 * the dark card: the reels roll up through 16, 17 ... 48, eased, resting
 * ~350 ms on each real public card size from the rate card. It starts
 * ~700 ms after the card is in view and the page + fonts have loaded, and
 * replays when the card scrolls back into view. No endless loop.
 *
 * - Server HTML: the final value ("48 GB") at rest, plus an sr-only copy.
 * - prefers-reduced-motion: the static yellow range ("16–48 GB").
 * - Yellow budget: the hero's "heavy work" underline was dropped for this
 *   (hero.tsx), so the hero's yellow is the Live badge and this number.
 */
export function VramCounter({ steps, className = "" }: { steps: number[]; className?: string }) {
  const last = steps[steps.length - 1];
  const [value, setValue] = useState(last);
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionFlag();

  useRollOnView(
    ref,
    steps.length > 1 && !reduce,
    (cancelled) => {
      const segs: { at: number; from: number; to: number; dur: number }[] = [];
      let t = HOLD_MS;
      for (let i = 1; i < steps.length; i++) {
        const dur = roll(steps[i - 1], steps[i]);
        segs.push({ at: t, from: steps[i - 1], to: steps[i], dur });
        t += dur + (i < steps.length - 1 ? HOLD_MS : 0);
      }
      runTimeline(
        t,
        (e) => {
          let v = steps[0];
          for (const s of segs) {
            if (e >= s.at + s.dur) v = s.to;
            else if (e >= s.at) return s.from + (s.to - s.from) * easeInOut((e - s.at) / s.dur);
            else break;
          }
          return v;
        },
        setValue,
        cancelled,
      );
    },
    () => setValue(last),
  );

  const intPlaces = String(last).length;
  const big = "font-[family-name:var(--font-bubble)] text-[56px] leading-none font-bold tracking-[-0.02em] text-hl sm:text-[60px] lg:text-[72px]";

  return (
    <div ref={ref} className={`${bubbleFont.variable} ${className}`}>
      {reduce && steps.length > 1 ? (
        <p className={`${big} tabular-nums`}>
          {vramRangeLabel(steps).replace(/\s*GB$/, "")}
          <span className="ml-1.5 text-[20px] font-semibold tracking-normal sm:text-[22px] lg:text-[26px]">GB</span>
        </p>
      ) : (
        <p className={`${big} flex items-baseline`}>
          <span className="sr-only">{last} GB</span>
          <Odometer value={value} intPlaces={intPlaces} />
          <span aria-hidden className="ml-1.5 text-[20px] font-semibold tracking-normal sm:text-[22px] lg:text-[26px]">
            GB
          </span>
        </p>
      )}
      <p className="mt-1.5 text-[13px] leading-[1.35] text-white/80">
        GPU memory, pick the card your scene needs
      </p>
    </div>
  );
}
