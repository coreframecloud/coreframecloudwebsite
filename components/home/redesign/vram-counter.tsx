"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { bubbleFont } from "@/lib/fonts-bubble";
import { vramRangeLabel } from "@/lib/rate-card";

/** Per step, ms (owner brief: 350-450). */
const STEP_MS = 400;

const REDUCE = "(prefers-reduced-motion: reduce)";
function subscribeReduce(cb: () => void) {
  const m = window.matchMedia(REDUCE);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}

/**
 * The hero GPU card's memory counter (owner, 31 Oct 2026): steps once
 * through the real public card sizes (16 -> 24 -> 48 ... GB, from the rate
 * card) when it comes into view, then rests on the largest.
 *
 * - The server HTML carries the final value, so crawlers and no-JS visitors
 *   read "48 GB" (or whatever the largest public card is).
 * - prefers-reduced-motion: no count, the static range ("16–48 GB") instead.
 * - Tabular figures, so the width does not jump between steps.
 * - No yellow: the hero keeps its two yellow touches (the "heavy work"
 *   underline and the Live badge).
 */
export function VramCounter({ steps, className = "" }: { steps: number[]; className?: string }) {
  const last = steps[steps.length - 1];
  const [text, setText] = useState(`${last} GB`);
  const ref = useRef<HTMLParagraphElement>(null);
  // Server snapshot false: the HTML always carries the final value.
  const reduce = useSyncExternalStore(subscribeReduce, () => window.matchMedia(REDUCE).matches, () => false);

  useEffect(() => {
    const el = ref.current;
    if (!el || steps.length < 2 || reduce) return;
    if (typeof IntersectionObserver === "undefined") return;
    let timer: number | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        let i = 0;
        setText(`${steps[0]} GB`);
        timer = window.setInterval(() => {
          i += 1;
          setText(`${steps[i]} GB`);
          if (i >= steps.length - 1) window.clearInterval(timer);
        }, STEP_MS);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) window.clearInterval(timer);
    };
  }, [steps, reduce]);

  return (
    <div className={`${bubbleFont.variable} ${className}`}>
      <p
        ref={ref}
        className="font-[family-name:var(--font-bubble)] text-[26px] leading-none font-bold tracking-[-0.02em] text-white tabular-nums sm:text-[30px]"
      >
        {reduce && steps.length > 1 ? vramRangeLabel(steps) : text}
      </p>
      <p className="mt-1.5 text-[12.5px] leading-[1.35] text-white/80 sm:text-[13px]">
        GPU memory, pick the card your scene needs
      </p>
    </div>
  );
}
