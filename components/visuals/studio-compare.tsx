"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Coreframe Studio in one picture: the real 3BHK plan Studio ships
 * (apps/tools/web/plan-sample.png, served lossless so the line art stays
 * crisp), then a room as Studio returns it, labelled the way Studio labels
 * it: "Shell" (your walls and openings, rendered in Cycles) and "Furnished"
 * (generated). The divider sweeps on its own until someone drags it.
 * Reduced motion: same markup, a slower sweep.
 */
export const PLAN_ALT =
  "An architectural floor plan of a three-bedroom flat: three bedrooms with beds and wardrobes, three bathrooms with fixtures and floor drains, a kitchen with a counter run and appliances, a dining table for six, a living area and a planted balcony, with door swings and window openings marked.";

export function PlanImage({ className = "", caption = "The plan (real drawing)" }: { className?: string; caption?: string }) {
  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-[20px] border border-rule bg-white p-3">
        <Image src="/home/plan-3bhk.webp" alt={PLAN_ALT} width={1800} height={1642} unoptimized className="h-auto w-full" />
      </div>
      <figcaption className="mt-2 text-[12.5px] text-ink-3">{caption}</figcaption>
    </figure>
  );
}

export function ShellFurnished({
  className = "",
  caption = "Shell: your walls and openings, ray-traced from your drawing. Furnished: a generated image.",
}: {
  className?: string;
  caption?: string;
}) {
  const reduce = usePrefersReducedMotion();
  const [pos, setPos] = useState(50);
  const [touched, setTouched] = useState(false);
  const t0 = useRef(0);

  useEffect(() => {
    if (touched) return;
    let raf = 0;
    const tick = (t: number) => {
      if (!t0.current) t0.current = t;
      const period = reduce ? 14000 : 6000;
      setPos(50 + 38 * Math.sin(((t - t0.current) / period) * Math.PI * 2));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [touched, reduce]);

  return (
    <figure className={className}>
      <div className="relative aspect-video overflow-hidden rounded-[20px] bg-paper-2">
        <Image src="/home/studio-furnished-room.webp" alt="The same room, furnished (generated image)" fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Image src="/home/studio-shell-room.webp" alt="A room shell ray-traced from the drawing: walls, windows, light" fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" />
        </div>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)]" style={{ left: `${pos}%` }} />
        <span className="absolute top-3 left-3 rounded-md bg-black/60 px-2 py-1 text-[11px] font-semibold text-white">Shell</span>
        <span className="absolute top-3 right-3 rounded-md bg-black/60 px-2 py-1 text-[11px] font-semibold text-white">Furnished</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(pos)}
          onChange={(e) => {
            setTouched(true);
            setPos(Number(e.target.value));
          }}
          aria-label="Compare: drag left for the shell, right for the furnished image"
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <figcaption className="mt-2 text-[12.5px] text-ink-3">{caption}</figcaption>
    </figure>
  );
}
