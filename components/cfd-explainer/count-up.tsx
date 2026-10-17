"use client";

/*
 * CountUp, adapted from React Bits (https://reactbits.dev, "Count Up",
 * src/ts-tailwind/TextAnimations/CountUp/CountUp.tsx).
 *
 * Copyright (c) 2026 David Haz. MIT + Commons Clause License Condition v1.0:
 * permission to use, copy, modify, merge, publish and distribute the Software
 * as part of an application, website or product, including for commercial
 * purposes, provided the components themselves are not sold, sublicensed or
 * redistributed (alone, in a bundle or as a port). The copyright notice and
 * permission notice must be kept with substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 *
 * What we kept: the "count" mode, its once-in-view trigger, the easeOut curve
 * (cubic-bezier 0.33, 1, 0.68, 1), the decimals/prefix/suffix formatting and
 * the reduced-motion bail-out. What we changed (18 Oct 2026 trial):
 *   - no `motion/react`: a requestAnimationFrame loop and one
 *     IntersectionObserver instead, so the component adds about 1 kB and no
 *     dependency;
 *   - the server HTML carries the FINAL number, so crawlers, no-JS readers,
 *     reduced-motion visitors and anyone who lands with it already on screen
 *     see the real value and nothing moves;
 *   - the box width is pinned to the final number's width while it counts, so
 *     the label beside it never moves (no layout shift);
 *   - renders a <b> so it drops straight into .cfx-ministat (whose `span` rule
 *     would restyle a span), the "roll" mode and hover replay were dropped.
 */

import { useEffect, useRef } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

// React Bits' easeOut: cubic-bezier(0.33, 1, 0.68, 1), solved numerically.
function easeOut(t: number) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const x1 = 0.33, y1 = 1, x2 = 0.68, y2 = 1;
  const bx = (u: number) => 3 * x1 * u * (1 - u) ** 2 + 3 * x2 * u ** 2 * (1 - u) + u ** 3;
  const by = (u: number) => 3 * y1 * u * (1 - u) ** 2 + 3 * y2 * u ** 2 * (1 - u) + u ** 3;
  let lo = 0, hi = 1, u = t;
  for (let i = 0; i < 24; i++) {
    u = (lo + hi) / 2;
    if (bx(u) < t) lo = u;
    else hi = u;
  }
  return by(u);
}

export function CountUp({
  to,
  from = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.6,
  delay = 0.15,
  className,
}: {
  to: number;
  from?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Seconds. */
  duration?: number;
  /** Seconds after it scrolls into view. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const format = (v: number) => `${prefix}${v.toFixed(decimals)}${suffix}`;
  const finalText = format(to);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.(QUERY).matches) return;

    let raf = 0;
    let timer = 0;
    let first = true;
    const fmt = (v: number) => `${prefix}${v.toFixed(decimals)}${suffix}`;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (first) {
          first = false;
          // Already on screen when the page loads: leave the real number alone.
          if (entry.isIntersecting) {
            io.disconnect();
            return;
          }
          // Below the fold: pin the width, show the start value, wait.
          el.style.width = `${el.getBoundingClientRect().width}px`;
          el.textContent = fmt(from);
          return;
        }
        if (!entry.isIntersecting) return;
        io.disconnect();
        timer = window.setTimeout(() => {
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / (duration * 1000));
            el.textContent = fmt(from + (to - from) * easeOut(p));
            if (p < 1) raf = requestAnimationFrame(tick);
            else el.style.width = "";
          };
          raf = requestAnimationFrame(tick);
        }, delay * 1000);
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      el.textContent = fmt(to);
      el.style.width = "";
    };
  }, [to, from, decimals, prefix, suffix, duration, delay]);

  return (
    <b ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {finalText}
    </b>
  );
}
