"use client";

import { useEffect, useRef, useSyncExternalStore, type RefObject } from "react";

/**
 * A mechanical odometer (owner, 31 Oct 2026: "big font, scrolling, in our
 * yellow"). Each digit is a vertical reel of 0-9 that slides; a reel only
 * turns while the reel to its right rolls over (9 -> 0), like a real counter.
 *
 * Driven by a continuous value (a float), so the reels glide between
 * integers instead of swapping text. The server renders the final value with
 * every reel at rest; the visible digits are aria-hidden and a plain-text
 * copy sits in an sr-only span, so crawlers and screen readers read
 * "48 GB" / "₹99.00", never a stack of ten digits.
 */

const REDUCE = "(prefers-reduced-motion: reduce)";
function subscribeReduce(cb: () => void) {
  const m = window.matchMedia(REDUCE);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}
/** Hydration-safe reduced-motion flag (server snapshot false). */
export function useReducedMotionFlag(): boolean {
  return useSyncExternalStore(subscribeReduce, () => window.matchMedia(REDUCE).matches, () => false);
}

export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

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
 * Runs `play` each time `ref` comes into view: the first time ~700 ms after
 * the element is visible AND the page + fonts have loaded (so a visitor sees
 * it, not hydration), then ~250 ms after each re-entry. `play` gets a cancel
 * signal and returns nothing; `rest` puts the display back on its final value
 * when the element leaves the viewport. Never loops on its own.
 */
export function useRollOnView(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  play: (isCancelled: () => boolean) => void,
  rest: () => void,
  { firstDelay = 700, replayDelay = 250, threshold = 0.6 } = {},
) {
  const playRef = useRef(play);
  const restRef = useRef(rest);
  useEffect(() => {
    playRef.current = play;
    restRef.current = rest;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || typeof IntersectionObserver === "undefined") return;
    let runs = 0;
    let token = 0;
    let timer = 0;
    let alive = true;
    const ready = pageReady();
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        token += 1;
        window.clearTimeout(timer);
        if (!visible) {
          restRef.current();
          return;
        }
        const mine = token;
        const delay = runs === 0 ? firstDelay : replayDelay;
        void ready.then(() => {
          if (!alive || mine !== token) return;
          timer = window.setTimeout(() => {
            runs += 1;
            playRef.current(() => !alive || mine !== token);
          }, delay);
        });
      },
      { threshold },
    );
    io.observe(el);
    return () => {
      alive = false;
      token += 1;
      window.clearTimeout(timer);
      io.disconnect();
    };
  }, [ref, enabled, firstDelay, replayDelay, threshold]);
}

/** Plays a timeline function t(ms) -> value with rAF until `duration`. */
export function runTimeline(
  duration: number,
  at: (ms: number) => number,
  set: (v: number) => void,
  isCancelled: () => boolean,
) {
  const t0 = performance.now();
  const frame = (now: number) => {
    if (isCancelled()) return;
    const e = Math.min(now - t0, duration);
    set(at(e));
    if (e < duration) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/** One reel: `pos` in [0, n), showing digits 0..n-1 and a trailing 0 for the wrap. */
function Reel({ pos, n = 10 }: { pos: number; n?: number }) {
  const cells = Array.from({ length: n + 1 }, (_, i) => i % n);
  return (
    // The strip sits in flow, so the reel is exactly one (tabular) digit wide.
    // Cells are 1.12em tall so a digit's full glyph fits and the next one
    // only shows while it is sliding in.
    <span className="inline-block h-[1.12em] overflow-hidden align-[-0.12em]">
      <span
        className="flex flex-col will-change-transform"
        style={{ transform: `translateY(${-pos * 1.12}em)` }}
      >
        {cells.map((d, i) => (
          <span key={i} className="block h-[1.12em] text-center leading-[1.12em]">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Reel positions for a value in units of the smallest place, e.g. 4825 for
 * 48.25 with two decimals. Place k turns only while everything to its right
 * is rolling from all-nines to zero.
 */
function reelPositions(units: number, places: number): number[] {
  const out: number[] = [];
  for (let k = 0; k < places; k++) {
    const p = Math.pow(10, k);
    const whole = Math.floor(units / p);
    const below = units - whole * p; // 0..p (float)
    // The lower places are all 9s once below > p - 1: carry the fraction.
    const carry = k === 0 ? below : Math.max(0, below - (p - 1));
    out.push((whole % 10) + carry);
  }
  return out.reverse(); // most significant first
}

/**
 * A rolling number. `intPlaces` integer reels (leading reels that read zero
 * fold away, so "₹5.00" never shows as "₹05.00"), `decimals` decimal reels.
 */
export function Odometer({
  value,
  intPlaces,
  decimals = 0,
  className = "",
}: {
  value: number;
  intPlaces: number;
  decimals?: number;
  className?: string;
}) {
  const scale = Math.pow(10, decimals);
  const units = Math.max(0, value * scale);
  const places = intPlaces + decimals;
  const pos = reelPositions(units, places);
  const intPart = Math.floor(value + 1e-9);
  return (
    <span className={`inline-flex tabular-nums ${className}`} aria-hidden>
      {pos.map((p, i) => {
        const placeFromRight = places - 1 - i; // 0 = smallest
        const isInt = placeFromRight >= decimals;
        const intPlace = placeFromRight - decimals; // 0 = units
        // Fold a leading integer reel while the number has not reached it.
        const folded = isInt && intPlace > 0 && intPart < Math.pow(10, intPlace) && p < 0.5;
        return (
          <span key={i} className="inline-flex">
            {decimals > 0 && placeFromRight === decimals - 1 ? <span>.</span> : null}
            <span
              className="inline-block overflow-hidden transition-[max-width] duration-200"
              style={{ maxWidth: folded ? 0 : "1em" }}
            >
              <Reel pos={p} />
            </span>
          </span>
        );
      })}
    </span>
  );
}
