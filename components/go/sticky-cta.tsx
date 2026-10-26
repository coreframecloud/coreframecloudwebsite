"use client";

import { useEffect, useState } from "react";
import { KeepQueryLink } from "./keep-query-link";

/**
 * A phone-only bar pinned to the bottom of a paid landing page, with the offer
 * and the button (owner, 26 Oct 2026: 93% of ad visitors scrolled past the one
 * button at the top and never came back to it). It shows once the hero button
 * (#cf-hero-cta) has scrolled out of view, so the two never sit on screen
 * together, and sets body[data-cf-sticky] so the WhatsApp bubble lifts above it.
 */
export function StickyCta({ href, label, offer }: { href: string; label: string; offer?: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("cf-hero-cta");
    if (!hero || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(hero);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (show) document.body.dataset.cfSticky = "1";
    else delete document.body.dataset.cfSticky;
    return () => { delete document.body.dataset.cfSticky; };
  }, [show]);
  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-paper/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-300 lg:hidden ${show ? "translate-y-0" : "pointer-events-none translate-y-full"}`}
    >
      <div className="mx-auto flex max-w-[560px] items-center gap-3">
        {offer ? <p className="min-w-0 flex-1 text-[14px] leading-5 font-semibold text-ink">{offer}</p> : null}
        <KeepQueryLink href={href} event="go_gpu_cta_sticky" cta="sticky" className="cf-btn-go shrink-0 px-6">
          {label}
        </KeepQueryLink>
      </div>
    </div>
  );
}
