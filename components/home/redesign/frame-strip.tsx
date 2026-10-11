"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Real frames from our walkthrough recording (marketing-20261010/walkthrough),
 * crossfading every 3 s. The first is the app's RTX 5080 tile, cropped tight
 * and Lanczos-upscaled from the 1080p frame. Pauses on hover or with the
 * button. With reduced motion the markup is the same and it still advances,
 * slower (every 5 s), as a plain crossfade.
 * Frames that showed the tester's email or name were left out.
 */
const FRAMES = [
  { src: "/home/wt-launch.webp", w: 1000, h: 698, cap: "Pick the RTX 5080 and launch", alt: "The Coreframe app's RTX 5080 tile with its Launch button" },
  { src: "/home/wt-file-on-workstation.webp", w: 1280, h: 720, cap: "Your file is already on the workstation", alt: "The uploaded Blender file open on the workstation" },
  { src: "/home/wt-render-starts.webp", w: 1280, h: 720, cap: "Render on the RTX 5080", alt: "A Cycles render starting, with Task Manager showing the GPU" },
  { src: "/home/wt-rendering.webp", w: 1280, h: 720, cap: "The GPU does the work", alt: "The render resolving with the GPU near full use" },
  { src: "/home/wt-save-to-nas.webp", w: 1280, h: 720, cap: "Save to your project drive", alt: "Saving the finished render to the project drive" },
];

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
            sizes="(max-width: 1024px) 100vw, 560px"
            className={`object-cover transition-opacity duration-700 ${i === 0 ? "object-center" : "object-[50%_40%]"} ${
              i === shown ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <p className="absolute bottom-3 left-3 rounded-lg bg-black/65 px-3 py-1.5 text-[13px] text-white backdrop-blur">
          {FRAMES[shown].cap}
        </p>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {FRAMES.map((f, i) => (
          <button
            key={f.src}
            type="button"
            aria-label={`Show frame ${i + 1}: ${f.cap}`}
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
