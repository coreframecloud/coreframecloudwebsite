"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { bubbleFont } from "@/lib/fonts-bubble";
import { vramRangeLabel } from "@/lib/rate-card";

/** Wait after the card is visible AND the page has loaded (first run). */
const START_DELAY_MS = 700;
/** Wait on a replay (the card scrolled out and back in). */
const REPLAY_DELAY_MS = 250;
/** Rest on each real card size. */
const HOLD_MS = 350;
/** Rolling time per segment: a base plus a little per GB, so 16->24 is
 *  quicker than 24->48 and the whole run lands near 2.5-3 s. */
const roll = (from: number, to: number) => 520 + (to - from) * 24;

const REDUCE = "(prefers-reduced-motion: reduce)";
function subscribeReduce(cb: () => void) {
  const m = window.matchMedia(REDUCE);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Resolves once the document has loaded and its fonts are ready. */
function pageReady(): Promise<void> {
  const loaded =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true }));
  const fonts = document.fonts?.ready ? document.fonts.ready.then(() => undefined) : Promise.resolve();
  return Promise.all([loaded, fonts]).then(() => undefined);
}

/**
 * The hero GPU card's memory counter (owner, 31 Oct 2026). A rolling count
 * through the integers (16, 17, 18 ... 48 GB), eased, resting ~350 ms on
 * each real public card size from the rate card. It starts ~700 ms after the
 * card is in view and the page has loaded (fonts included), so a visitor
 * actually sees it, and replays each time the card scrolls back into view.
 *
 * - The server HTML carries the final value, so crawlers and no-JS visitors
 *   read "48 GB" (or whatever the largest public card is).
 * - prefers-reduced-motion: no count, the static range ("16–48 GB") instead.
 * - Tabular figures, so the width does not jump between numbers.
 * - No yellow: the hero keeps its two yellow touches (the "heavy work"
 *   underline and the Live badge).
 */
export function VramCounter({ steps, className = "" }: { steps: number[]; className?: string }) {
  const last = steps[steps.length - 1];
  const [value, setValue] = useState(last);
  const ref = useRef<HTMLParagraphElement>(null);
  // Server snapshot false: the HTML always carries the final value.
  const reduce = useSyncExternalStore(subscribeReduce, () => window.matchMedia(REDUCE).matches, () => false);

  useEffect(() => {
    const el = ref.current;
    if (!el || steps.length < 2 || reduce || typeof IntersectionObserver === "undefined") return;

    let raf = 0;
    let timer = 0;
    let runs = 0;
    let alive = true;
    const ready = pageReady();

    const stop = () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };

    const play = () => {
      // Timeline: hold on the first size, then roll to each next size and hold.
      const segs: { at: number; from: number; to: number; dur: number }[] = [];
      let t = HOLD_MS;
      for (let i = 1; i < steps.length; i++) {
        const dur = roll(steps[i - 1], steps[i]);
        segs.push({ at: t, from: steps[i - 1], to: steps[i], dur });
        t += dur + (i < steps.length - 1 ? HOLD_MS : 0);
      }
      const end = t;
      const t0 = performance.now();
      const frame = (now: number) => {
        const e = now - t0;
        let v = steps[0];
        for (const s of segs) {
          if (e >= s.at + s.dur) v = s.to;
          else if (e >= s.at) {
            v = Math.round(s.from + (s.to - s.from) * easeInOut((e - s.at) / s.dur));
            break;
          } else break;
        }
        setValue(v);
        if (e < end) raf = requestAnimationFrame(frame);
        else setValue(last);
      };
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        stop();
        if (!visible) {
          // Out of view: rest on the final value, ready to replay.
          setValue(last);
          return;
        }
        const delay = runs === 0 ? START_DELAY_MS : REPLAY_DELAY_MS;
        void ready.then(() => {
          if (!alive) return;
          timer = window.setTimeout(() => {
            runs += 1;
            setValue(steps[0]);
            play();
          }, delay);
        });
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      alive = false;
      io.disconnect();
      stop();
    };
  }, [steps, reduce, last]);

  return (
    <div className={`${bubbleFont.variable} ${className}`}>
      <p
        ref={ref}
        className="font-[family-name:var(--font-bubble)] text-[26px] leading-none font-bold tracking-[-0.02em] text-white tabular-nums sm:text-[30px]"
      >
        {reduce && steps.length > 1 ? vramRangeLabel(steps) : `${value} GB`}
      </p>
      <p className="mt-1.5 text-[12.5px] leading-[1.35] text-white/80 sm:text-[13px]">
        GPU memory, pick the card your scene needs
      </p>
    </div>
  );
}
