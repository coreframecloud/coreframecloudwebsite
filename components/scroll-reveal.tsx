"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Site-wide fade-up: each direct child of a `.cf-section` (headings, cards,
 * fact blocks) fades up once as it scrolls into view. The homepage's own
 * sections use framer-motion (components/home/redesign/reveal) and carry no
 * .cf-section, so nothing animates twice. Off under reduced motion. Content
 * already on screen at load is revealed at once, never left hidden.
 */
export function ScrollReveal() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".cf-section > :not(.cf-col):not(.cf-wide), .cf-section > .cf-col > *, .cf-section > .cf-wide > *"),
    ).filter((el) => !el.closest(".cf-pagehero") && !el.classList.contains("cf-reveal"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("cf-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -60px 0px" },
    );
    for (const el of els) {
      if (el.getBoundingClientRect().top < window.innerHeight) continue; // already visible: leave alone
      el.classList.add("cf-reveal");
      io.observe(el);
    }
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
