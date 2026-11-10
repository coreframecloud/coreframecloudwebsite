"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import type { CfdServiceId, CfdServiceTile } from "@/lib/cfd-services";
import { CfxFigure } from "@/components/cfd-explainer/figure";

/**
 * The three CFD service tiles (lib/cfd-services.ts builds their words on the
 * server, in the page's currency). Two places, one choice:
 *
 *   variant "overview" (#services): Start selects the service and jumps to
 *     the form (#cfd-form);
 *   variant "picker" (#start): Start selects the service and the form below
 *     opens for it (CfdStart reads the same choice).
 *
 * The choice lives in this module (both copies share it) and in
 * sessionStorage, so it survives the sign-up round trip back to /cfd#start.
 *
 * FORM FIRST (owner, 10 Nov 2026): the form is never an empty "choose a tile"
 * box any more. Standard is chosen until the visitor picks another: its ducts
 * form is also the Verified form (Verified is picked on the quote), every CFD
 * job so far was a duct job, and /go/cfd sent 146 of the 152 ad visitors (the
 * Rooms page /go/hvac, 6). A link can choose with ?service=standard|verified|rooms
 * (/go/cfd, /go/hvac, the mesh-independence page).
 */

const KEY = "cf_cfd_service";
const IDS: CfdServiceId[] = ["standard", "verified", "rooms"];
/** The tile the form opens on when nothing was chosen (see the note above). */
export const DEFAULT_SERVICE: CfdServiceId = "standard";
let current: CfdServiceId | undefined; // undefined: not read from the URL / storage yet
const listeners = new Set<() => void>();

function read(): CfdServiceId {
  if (current === undefined) {
    current = DEFAULT_SERVICE;
    try {
      const fromUrl = new URLSearchParams(window.location.search).get("service") as CfdServiceId | null;
      const v = fromUrl && IDS.includes(fromUrl) ? fromUrl : (sessionStorage.getItem(KEY) as CfdServiceId | null);
      if (v && IDS.includes(v)) current = v;
      if (fromUrl && IDS.includes(fromUrl)) sessionStorage.setItem(KEY, fromUrl);
    } catch {
      /* storage blocked: the default */
    }
  }
  return current;
}

export function selectService(id: CfdServiceId) {
  current = id;
  try {
    sessionStorage.setItem(KEY, id);
  } catch {
    /* storage blocked: the choice still holds for this page view */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useSelectedService(): CfdServiceId {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_SERVICE);
}

function scrollToForm() {
  const el = document.getElementById("cfd-form");
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

const TINT: Record<CfdServiceId, string> = {
  standard: "bg-tint-mint",
  verified: "bg-tint-lilac",
  rooms: "bg-tint-blue",
};

export function ServiceTiles({ tiles, variant }: { tiles: CfdServiceTile[]; variant: "overview" | "picker" }) {
  const selected = useSelectedService();
  const picker = variant === "picker";
  return (
    <ul className="grid grid-cols-1 gap-5 md:grid-cols-3" aria-label="CFD services">
      {tiles.map((t) => {
        const on = picker && selected === t.id;
        return (
          <li
            key={t.id}
            className={`flex min-w-0 flex-col rounded-[24px] p-6 sm:p-7 ${TINT[t.id]} ${
              on ? "outline-2 outline-offset-2 outline-ink" : ""
            }`}
          >
            <p className="cf-card-label">{t.area}</p>
            <h3 className="font-heading text-[20px] leading-[1.25] font-medium text-ink">{t.name}</h3>
            <p className="mt-1 text-[15px] leading-6 text-ink">{t.purpose}</p>
            <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[15px] leading-6 text-ink-2">
              {t.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            {t.validation ? (
              <details className="group mt-4 text-[13.5px] leading-5 text-ink-3">
                <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  {t.validation.short}{" "}
                  <span className="whitespace-nowrap font-medium text-ink-2 underline underline-offset-2">
                    Details<span aria-hidden className="ml-1 inline-block group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-2">{t.validation.full}</p>
              </details>
            ) : null}
            <div className="cfx-figs mt-5 border-t border-dashed border-ink/25 pt-4">
              <CfxFigure label="Price" {...t.price} />
              <CfxFigure label="Turnaround" tone="coral" {...t.turnaround} />
            </div>
            <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[14px] leading-6">
              {t.sample.pdf ? (
                <a href={t.sample.href} target="_blank" rel="noopener" className="text-ink underline underline-offset-4">
                  {t.sample.label}
                </a>
              ) : (
                <Link href={t.sample.href} className="text-ink underline underline-offset-4">
                  {t.sample.label}
                </Link>
              )}
              {t.details.href.startsWith("#") ? (
                <a href={t.details.href} className="text-ink-2 underline underline-offset-4">
                  {t.details.label}
                </a>
              ) : (
                <Link href={t.details.href} className="text-ink-2 underline underline-offset-4">
                  {t.details.label}
                </Link>
              )}
            </p>
            <div className="mt-auto pt-5">
              {picker ? (
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    selectService(t.id);
                    scrollToForm();
                  }}
                  className={`${on ? "cf-btn-primary" : "cf-btn-secondary"} w-full sm:w-auto`}
                >
                  {on ? "Selected" : "Start"}
                  <span className="sr-only">: {t.area}, {t.name}</span>
                </button>
              ) : (
                <a href="#cfd-form" onClick={() => selectService(t.id)} className="cf-btn-secondary w-full sm:w-auto">
                  Start<span className="sr-only">: {t.area}, {t.name}</span>
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The compact switcher above the form (owner, 10 Nov 2026: the form opens at
 * once, the other services one click away). The full tiles stay in #services.
 */
export function ServiceSwitch({ tiles }: { tiles: CfdServiceTile[] }) {
  const selected = useSelectedService();
  // A client-side visit (next/link) to /cfd?service=... after the choice was first read.
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("service") as CfdServiceId | null;
    if (v && IDS.includes(v) && v !== current) selectService(v);
  }, []);
  return (
    <div role="radiogroup" aria-label="CFD service" className="grid grid-cols-3 gap-2">
      {tiles.map((t) => {
        const on = selected === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => selectService(t.id)}
            className={`min-w-0 rounded-cf border px-2.5 py-2.5 text-left transition sm:px-4 sm:py-3 ${TINT[t.id]} ${
              on ? "border-ink outline-2 outline-offset-1 outline-ink" : "border-transparent hover:border-rule-strong"
            }`}
          >
            <span className="hidden text-[12.5px] leading-5 text-ink-3 sm:block">{t.area}</span>
            <span className="block font-heading text-[14.5px] leading-5 font-medium text-ink sm:text-[16px] sm:leading-6">{t.name}</span>
            <span className="mt-0.5 block text-[12.5px] leading-5 text-ink-2 sm:text-[13px]">
              {t.price.pre ? `${t.price.pre} ` : ""}
              {t.price.figure}
            </span>
          </button>
        );
      })}
    </div>
  );
}
