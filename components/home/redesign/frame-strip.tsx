"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { WORKSTATION_FRAMES } from "@/lib/workstation-frames";

/**
 * Real product frames, listed in lib/workstation-frames.ts (swap them there),
 * crossfading every 3 s. Pauses on hover or with the
 * button. With reduced motion the markup is the same and it still advances,
 * slower (every 5 s), as a plain crossfade.
 * Customer details in the frames are blurred at source.
 */
const FRAMES = WORKSTATION_FRAMES;

export function FrameStrip() {
  const reduce = usePrefersReducedMotion();
  const [cur, setCur] = useState(0);
  const [hover, setHover] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const paused = hover || userPaused;

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setCur((c) => (c + 1) % FRAMES.length), reduce ? 5000 : 3000);
    return () => clearInterval(id);
  }, [reduce, paused]);

  const shown = cur;
  return (
    <div
      className="group relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-rule bg-night shadow-[0_20px_60px_rgba(16,17,19,0.18)]">
        {FRAMES.map((f, i) => (
          <Image
            key={f.src}
            src={f.src}
            alt={f.alt}
            fill
            quality={90}
            sizes="(max-width: 1024px) 100vw, 560px"
            className={`object-cover object-center transition-opacity duration-700 ${
              i === shown ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <p className="absolute bottom-3 left-3 rounded-lg bg-black/65 px-3 py-1.5 text-[13px] text-white backdrop-blur">
          {FRAMES[shown].caption}
        </p>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {FRAMES.map((f, i) => (
          <button
            key={f.src}
            type="button"
            aria-label={`Show frame ${i + 1}: ${f.caption}`}
            onClick={() => setCur(i)}
            className={`h-1.5 rounded-full transition-all ${i === shown ? "w-6 bg-ink" : "w-1.5 bg-ink/25"}`}
          />
        ))}
        <button
          type="button"
          onClick={() => setUserPaused((p) => !p)}
          className="ml-auto text-[12px] font-semibold tracking-[0.06em] text-ink-2 uppercase hover:text-ink"
        >
          {userPaused ? "Play" : "Pause"}
        </button>
      </div>
    </div>
  );
}
