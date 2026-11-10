"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { formatMoney, type Currency } from "@/lib/money";
import { startGpu } from "@/lib/gpu-start";

/**
 * Pick a GPU, see its price, press Start (owner, 10 Nov 2026: price first,
 * account at "Start"; one big call to action per landing page). The cards are
 * a choice, not links: the page's one action is the Start button, which takes
 * the chosen card and the first top-up to sign-up and on to the payment step
 * (lib/gpu-start.ts). The same button appears in the hero, under the cards and
 * in the phone's sticky bar, with the same words.
 */

export type StartGpu = {
  slug: string;
  name: string;
  vram: number;
  ram: number | null;
  badge: string | null;
  /** Per hour in the page's currency, or null when on request. */
  rate: number | null;
  /** The first top-up's hours apply on this card. */
  intro: boolean;
  /** What the first top-up buys on this card, in hours (lib/gpu-start-server.ts). */
  hours: number | null;
};

let chosen: string | null = null;
const listeners = new Set<() => void>();

function choose(slug: string) {
  chosen = slug;
  listeners.forEach((l) => l());
}

function useChosen(fallback: string): string {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => chosen ?? fallback,
    () => fallback,
  );
}

export function startLabel(g: StartGpu | undefined): string {
  return g ? `Start on ${g.name}` : "Start a GPU workstation";
}

/** "₹1,000 = 8 hours" on the offer's own card; "≈" where the hours are worked out at the card's rate. */
export function amountWords(g: StartGpu, amount: number | null, introHours: number | null, cur: Currency): string | null {
  if (!amount || g.hours == null) return null;
  const exact = g.intro && introHours != null && g.hours === introHours;
  return `${formatMoney(amount, cur)} ${exact ? "=" : "≈"} ${g.hours} hours`;
}

export function GpuStartButton({
  gpus,
  defaultSlug,
  amount,
  where,
  className = "cf-btn-go w-full sm:w-auto sm:px-12",
}: {
  gpus: StartGpu[];
  defaultSlug: string;
  amount: number | null;
  where: string;
  className?: string;
}) {
  const slug = useChosen(defaultSlug);
  const g = gpus.find((x) => x.slug === slug) ?? gpus.find((x) => x.slug === defaultSlug);
  return (
    <button
      type="button"
      className={className}
      data-cf-cta={where}
      disabled={!g || g.rate == null}
      onClick={() => g && startGpu({ gpu: g.slug, amount }, where)}
    >
      {startLabel(g)} <span aria-hidden>→</span>
    </button>
  );
}

export function GpuPickCards({
  gpus,
  defaultSlug,
  amount,
  introHours,
  currency,
  where,
}: {
  gpus: StartGpu[];
  defaultSlug: string;
  amount: number | null;
  introHours: number | null;
  currency: Currency;
  where: string;
}) {
  const slug = useChosen(defaultSlug);
  const g = gpus.find((x) => x.slug === slug);
  return (
    <div>
      <ul role="radiogroup" aria-label="GPU" className="grid gap-3 sm:grid-cols-2">
        {gpus.map((x) => {
          const on = x.slug === slug;
          return (
            <li key={x.slug}>
              <button
                type="button"
                role="radio"
                aria-checked={on}
                disabled={x.rate == null}
                onClick={() => choose(x.slug)}
                className={`block w-full rounded-cf border px-4 py-3.5 text-left transition ${
                  on ? "border-blue bg-tint-blue outline-2 outline-offset-1 outline-blue" : "border-rule bg-paper-2 hover:border-blue/40"
                } disabled:opacity-60`}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-heading text-[17px] font-medium text-ink">{x.name}</span>
                  {x.badge ? (
                    <span className="shrink-0 rounded-full bg-tint-blue px-2.5 py-0.5 text-[11.5px] font-semibold tracking-[0.04em] text-blue-ink">
                      {x.badge}
                    </span>
                  ) : null}
                </span>
                <span className="mt-2 flex items-end justify-between gap-3">
                  <span className="text-[13.5px] leading-5 text-ink-2">
                    <b className="font-semibold text-ink">{x.vram} GB</b> VRAM{x.ram ? ` · ${x.ram} GB RAM` : ""}
                  </span>
                  <span className="text-[15px] leading-5 text-ink">
                    {x.rate != null ? (
                      <>
                        <b className="font-semibold">{formatMoney(x.rate, currency)}</b>
                        <span className="text-ink-3">/hr</span>
                      </>
                    ) : (
                      <span className="text-ink-3">On request</span>
                    )}
                  </span>
                </span>
                {on && amountWords(x, amount, introHours, currency) ? (
                  <span className="mt-1.5 block text-[13px] leading-5 text-blue-ink">
                    First top-up {amountWords(x, amount, introHours, currency)}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-4">
        <GpuStartButton gpus={gpus} defaultSlug={defaultSlug} amount={amount} where={where} />
        <p className="mt-2 text-[13.5px] leading-5 text-ink-3">
          {g ? `${g.name} chosen. ` : ""}You sign up when you press Start: your email and a WhatsApp code. You pay before any
          GPU time, then download Connect.
        </p>
      </div>
    </div>
  );
}

/** The phone's sticky bar: the same Start, once the hero button has scrolled away. */
export function GpuStartSticky({
  gpus,
  defaultSlug,
  amount,
  offer,
}: {
  gpus: StartGpu[];
  defaultSlug: string;
  amount: number | null;
  offer?: string;
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("cf-hero-cta");
    if (!hero || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setShow(e.intersectionRatio < 0.9), { threshold: [0, 0.9, 1] });
    io.observe(hero);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (show) document.body.dataset.cfSticky = "1";
    else delete document.body.dataset.cfSticky;
    return () => {
      delete document.body.dataset.cfSticky;
    };
  }, [show]);
  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-paper/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-300 lg:hidden ${show ? "translate-y-0" : "pointer-events-none translate-y-full"}`}
    >
      <div className="mx-auto flex max-w-[560px] items-center gap-3">
        {offer ? <p className="min-w-0 flex-1 text-[14px] leading-5 font-semibold text-ink">{offer}</p> : null}
        <GpuStartButton gpus={gpus} defaultSlug={defaultSlug} amount={amount} where="sticky" className="cf-btn-go shrink-0 px-6" />
      </div>
    </div>
  );
}

/** One "Launch" on a ladder row (components/pricing/gpu-ladder.tsx): that card, the first top-up. */
export function GpuLaunchButton({
  slug,
  name,
  amount,
  where,
  className,
}: {
  slug: string;
  name: string;
  amount: number | null;
  where: string;
  className?: string;
}) {
  return (
    <button type="button" className={className} aria-label={`Start on ${name}`} onClick={() => startGpu({ gpu: slug, amount }, where)}>
      Launch <span aria-hidden>→</span>
    </button>
  );
}
