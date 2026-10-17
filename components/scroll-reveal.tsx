"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * The site's one motion runtime (18 Oct 2026; plan: plans/site-motion-20261018.md).
 * Mounted once in the root layout. Everything it drives is styled in
 * app/motion.css; this file only decides WHEN.
 *
 *  1. Reveal: elements marked `data-cf-reveal` (the homepage's <Reveal>) and,
 *     on every other page, each direct child of a `.cf-section` column fade up
 *     once as they scroll in. Card grids and `data-cf-steps` lists stagger
 *     their children instead (React Bits' AnimatedList / Stepper look).
 *  2. Spotlight: a soft light follows a fine pointer over cards (React Bits'
 *     SpotlightCard look) and over the /pricing dot grid.
 *
 * Never hidden without JS: only this script adds .cf-reveal, and only to
 * elements that are below the fold when it runs, so whatever is on screen at
 * load (the LCP headline, the hero image) never animates in. Under
 * prefers-reduced-motion it does nothing at all. The classes come off again
 * once an entrance has finished, so hover effects never inherit its delays.
 */
const REDUCE = "(prefers-reduced-motion: reduce)";
const GENERIC =
  ".cf-section > :not(.cf-col):not(.cf-wide), .cf-section > .cf-col > *, .cf-section > .cf-wide > *";
const SPOT = ".cf-card, .cfh-card, [data-cf-spot], [data-cf-dots]";

function isStaggerGroup(el: HTMLElement) {
  if (el.hasAttribute("data-cf-steps")) return true;
  const kids = el.children;
  if (kids.length < 2) return false;
  let cards = 0;
  for (const k of Array.from(kids)) if (k.classList.contains("cf-card") || k.classList.contains("cf-card-sm")) cards++;
  return cards >= 2 && cards >= kids.length - 1;
}

export function ScrollReveal() {
  const pathname = usePathname();

  // 1. Reveal
  useEffect(() => {
    if (window.matchMedia(REDUCE).matches || typeof IntersectionObserver === "undefined") return;
    const timers: number[] = [];
    const done = (el: HTMLElement) => {
      const n = el.classList.contains("cf-stagger") ? el.children.length : 1;
      const delay = parseFloat(el.style.getPropertyValue("--cf-d") || "0") * 1000;
      timers.push(
        window.setTimeout(() => {
          el.classList.remove("cf-reveal", "cf-in", "cf-stagger");
        }, 1300 + delay + n * 140),
      );
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.classList.add("cf-in");
          io.unobserve(el);
          done(el);
        }
      },
      { rootMargin: "0px 0px -60px 0px" },
    );

    const seen = new Set<HTMLElement>();
    const candidates = [
      ...Array.from(document.querySelectorAll<HTMLElement>("[data-cf-reveal], [data-cf-steps]")),
      ...Array.from(document.querySelectorAll<HTMLElement>(GENERIC)),
    ];
    const fold = window.innerHeight;
    for (const el of candidates) {
      if (seen.has(el)) continue;
      seen.add(el);
      if (el.closest(".cf-pagehero") || el.classList.contains("cf-reveal")) continue;
      if (el.getBoundingClientRect().top < fold) continue; // on screen at load: never hidden
      if (isStaggerGroup(el)) {
        el.classList.add("cf-stagger");
        Array.from(el.children).forEach((k, i) => (k as HTMLElement).style.setProperty("--cf-i", String(i)));
      }
      el.classList.add("cf-reveal");
      io.observe(el);
    }
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [pathname]);

  // 2. Spotlight: one delegated, rAF-throttled pointer listener.
  useEffect(() => {
    if (window.matchMedia(REDUCE).matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    let last: PointerEvent | null = null;
    const paint = () => {
      raf = 0;
      const e = last;
      if (!e || !(e.target instanceof Element)) return;
      const el = e.target.closest<HTMLElement>(SPOT);
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${Math.round(e.clientX - r.left)}px`);
      el.style.setProperty("--my", `${Math.round(e.clientY - r.top)}px`);
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
