"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { TESTIMONIALS, type Testimonial } from "@/lib/testimonials";
import { Reveal } from "@/components/home/redesign/reveal";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const TINTS = {
  blue: "bg-tint-blue",
  lilac: "bg-tint-lilac",
  mint: "bg-tint-mint",
  sand: "bg-tint-sand",
} as const;
const CYCLE = ["mint", "blue", "sand", "lilac"] as const;

const SPEED = 30; // px per second, desktop auto-scroll
const GAP = 20; // px, must match gap-5

/**
 * Customer words as a slow, continuous, seamless carousel (owner, 11 Oct
 * 2026): no arrows; pauses on hover and focus; drag or swipe with momentum,
 * then eases back to its slow drift; a sideways wheel or shift+wheel moves
 * it, a normal vertical wheel always scrolls the page. Controls copy the
 * workstation panel: dots (one per quote) and a small Pause/Play.
 * Reduced motion: no drift, one card at a time, crossfading every 6 s.
 * Renders NOTHING while lib/testimonials.ts is empty.
 */
export function Testimonials({
  items = TESTIMONIALS,
  title = "What freelancers and studio owners say",
  className = "py-24 sm:py-28",
}: {
  /** The approved quotes in the order to show them (lib/testimonials.ts,
   *  testimonialsFor). Never a new or edited quote. */
  items?: Testimonial[];
  title?: string;
  className?: string;
} = {}) {
  const reduce = usePrefersReducedMotion();
  if (items.length === 0) return null;
  return (
    <section className={`overflow-hidden ${className}`} role="region" aria-roledescription="carousel" aria-label="What customers say" data-cf-section="trust">
      <div className="cfh-wrap">
        <Reveal>
          <h2 className="cfh-h2">{title}</h2>
        </Reveal>
      </div>
      {reduce ? <FadeCarousel items={items} /> : <DriftCarousel items={items} />}
    </section>
  );
}

function Card({ t, i, n, hidden = false }: { t: Testimonial; i: number; n: number; hidden?: boolean }) {
  return (
    <figure
      aria-hidden={hidden || undefined}
      aria-roledescription="slide"
      aria-label={hidden ? undefined : `${i + 1} of ${n}`}
      className={`cfh-card grid w-[84vw] shrink-0 gap-6 select-none sm:w-[520px] ${t.photo ? "md:grid-cols-[1.2fr_0.8fr]" : ""} ${
        TINTS[t.tint ?? CYCLE[i % CYCLE.length]]
      }`}
    >
      <div>
        <span aria-hidden className="font-heading text-[56px] leading-none text-ink/80">
          &ldquo;
        </span>
        <blockquote className="mt-2 text-[18px] leading-[1.55] sm:text-[19px]">
          <strong className="font-semibold">{t.lead}</strong>
          {t.rest ? <> {t.rest}</> : null}
        </blockquote>
        <figcaption className="mt-6">
          <p className="text-[17px] font-semibold">{t.name}</p>
          <p className="text-[14px] text-ink-2">{t.role}</p>
        </figcaption>
      </div>
      {t.photo ? (
        <Image src={t.photo} alt={t.name} width={480} height={480} className="aspect-square w-full rounded-2xl object-cover" draggable={false} />
      ) : null}
    </figure>
  );
}

function Controls({ items, active, onDot, paused, onToggle }: { items: Testimonial[]; active: number; onDot: (i: number) => void; paused?: boolean; onToggle?: () => void }) {
  return (
    <div className="cfh-wrap mt-6 flex items-center gap-2">
      {items.map((t, i) => (
        <button
          key={t.name + i}
          type="button"
          aria-label={`Show quote ${i + 1}: ${t.name}`}
          aria-current={i === active || undefined}
          onClick={() => onDot(i)}
          className={`h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-ink" : "w-1.5 bg-ink/25"}`}
        />
      ))}
      {onToggle ? (
        <button
          type="button"
          onClick={onToggle}
          className="ml-auto inline-flex min-h-11 items-center px-2 text-[13px] font-semibold tracking-[0.06em] text-ink-2 uppercase hover:text-ink"
        >
          {paused ? "Play" : "Pause"}
        </button>
      ) : null}
    </div>
  );
}

/** The continuous version: a doubled track moved with transforms, wrapping seamlessly. */
function DriftCarousel({ items }: { items: Testimonial[] }) {
  const n = items.length;
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const x = useRef(0); // current offset in px (positive = scrolled left)
  const vel = useRef(SPEED); // px/s, eases back to SPEED
  const setW = useRef(1); // width of one full set of cards incl. gaps
  const cardW = useRef(1);
  const drag = useRef<{ id: number; lastX: number; lastT: number; v: number } | null>(null);
  const target = useRef<number | null>(null);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [active, setActive] = useState(0);
  const paused = hover || focus || userPaused;
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const measure = useCallback(() => {
    const first = track.current?.children[0] as HTMLElement | undefined;
    if (!first) return;
    cardW.current = first.offsetWidth + GAP;
    setW.current = cardW.current * n;
  }, [n]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!drag.current) {
        if (target.current !== null) {
          // jump to a dot: ease towards the target
          const d = target.current - x.current;
          x.current += d * Math.min(1, dt * 6);
          if (Math.abs(d) < 0.5) target.current = null;
        } else {
          const goal = pausedRef.current ? 0 : SPEED;
          // Hover/focus stops it quickly; after a drag or a pause the drift
          // comes back slowly. A fling decays at the same quick rate.
          const rate = pausedRef.current || Math.abs(vel.current) > SPEED * 1.5 ? 6 : 0.9;
          vel.current += (goal - vel.current) * Math.min(1, dt * rate);
          x.current += vel.current * dt;
        }
      }
      const W = setW.current;
      x.current = ((x.current % W) + W) % W;
      if (track.current) track.current.style.transform = `translate3d(${-x.current}px,0,0)`;
      const idx = Math.round(x.current / cardW.current) % n;
      setActive((a) => (a === idx ? a : idx));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [measure, n]);

  // Only sideways intent moves the carousel; a plain vertical wheel always scrolls the page.
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!dx) return;
      e.preventDefault();
      target.current = null;
      x.current += dx;
      vel.current = 0;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, lastX: e.clientX, lastT: performance.now(), v: 0 };
    target.current = null;
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const now = performance.now();
    const dx = e.clientX - d.lastX;
    x.current -= dx;
    d.v = (-dx / Math.max(1, now - d.lastT)) * 1000;
    d.lastX = e.clientX;
    d.lastT = now;
  };
  const onUp = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    vel.current = Math.max(-2400, Math.min(2400, d.v)); // fling, then decays back to the slow drift
    drag.current = null;
  };

  const cards = [...items, ...items];
  return (
    <>
      <div
        ref={viewport}
        className="mt-12 cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setFocus(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocus(false);
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div ref={track} className="cfh-track flex gap-5 pb-2 will-change-transform">
          {cards.map((t, i) => (
            <Card key={i} t={t} i={i % n} n={n} hidden={i >= n} />
          ))}
        </div>
      </div>
      <Controls
        items={items}
        active={active}
        onDot={(i) => {
          const W = setW.current;
          let goal = i * cardW.current;
          // take the short way round the loop
          if (goal - x.current > W / 2) goal -= W;
          if (x.current - goal > W / 2) goal += W;
          target.current = goal;
          vel.current = 0;
        }}
        paused={userPaused}
        onToggle={() => setUserPaused((p) => !p)}
      />
    </>
  );
}

/** Reduced motion: one card at a time, a gentle 6 s crossfade, same dots. */
function FadeCarousel({ items }: { items: Testimonial[] }) {
  const n = items.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % n), 6000);
    return () => clearInterval(id);
  }, [paused, n]);
  return (
    <>
      <div className="cfh-wrap mt-12">
        <div className="relative grid" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          {items.map((t, i) => (
            <div
              key={t.name + i}
              className={`[grid-area:1/1] transition-opacity duration-1000 ${i === active ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <Card t={t} i={i} n={n} hidden={i !== active} />
            </div>
          ))}
        </div>
      </div>
      <Controls items={items} active={active} onDot={setActive} />
    </>
  );
}
