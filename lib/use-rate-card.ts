"use client";

import { useEffect, useState } from "react";
import type { RateCard } from "@/lib/rate-card";
import { API_BASE } from "@/lib/api-base";

const API = API_BASE;

/**
 * The live rate card, in the browser.
 *
 * Signed-in screens (header, My Activity, the top-up dialog) are client
 * components and cannot use the server's cached getRateCard(). They need the
 * same numbers — the intro offer above all — so this reads the same public
 * endpoint once per page load and shares the answer. null while loading or
 * when unreachable (or not `enabled`); callers then show no offer numbers rather than typed ones.
 */
let pending: Promise<RateCard | null> | null = null;

function load(): Promise<RateCard | null> {
  if (!pending) {
    pending = fetch(`${API}/public/rate-card`)
      .then((r) => (r.ok ? (r.json() as Promise<RateCard>) : null))
      .catch(() => null);
  }
  return pending;
}

export function useRateCard(enabled = true): RateCard | null {
  const [card, setCard] = useState<RateCard | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    load().then((c) => {
      if (live) setCard(c);
    });
    return () => {
      live = false;
    };
  }, [enabled]);
  return card;
}
