"use client";

/**
 * Where a customer came from, captured once and never rewritten.
 *
 * WHY THIS EXISTS. Nine columns — utm_source, utm_medium, utm_campaign,
 * utm_content, utm_term, fbclid, landing_path, referrer, first_seen_at —
 * have been sitting on the users table with nothing reading or writing them.
 * The schema drift check listed them as orphans and called them harmless,
 * which they were, in the sense that an unarmed smoke alarm is harmless.
 * The consequence is that every rupee of ad spend is judged on a guess.
 *
 * FIRST TOUCH, WITH ONE DELIBERATE REFINEMENT.
 *
 * The record is created on the first page of the first visit, and
 * landing_path, referrer and first_seen_at are frozen there — those describe
 * the introduction and rewriting them would turn "how they found us" into
 * "the last page they happened to refresh".
 *
 * The campaign fields behave slightly differently: they are filled the FIRST
 * TIME they are seen, which may be a later visit. Somebody who finds you
 * through a search, comes back a week later on an ad, and signs up then,
 * should not be recorded as having no campaign at all — strict first-touch
 * would credit nothing and quietly under-report every channel. Once a value
 * is set it is never changed.
 *
 * NOTHING HERE MAY THROW. Private windows, blocked storage and locked-down
 * browsers all fail on localStorage access, and a signup form must not break
 * because a marketing field could not be read.
 */

export type Attribution = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  fbclid: string | null;
  // Google Ads auto-tagging sends gclid and NO utm_* at all. Without it a
  // Google Ads visitor is indistinguishable from direct traffic.
  // gbraid / wbraid are what Google substitutes on iOS app-to-web clicks.
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  landing_path: string | null;
  referrer: string | null;
  first_seen_at: string | null;
};

const KEY = "cf_attribution";

// Comfortably under the narrowest plausible column. A utm_content longer than
// this is a tracking macro that did not expand, not information.
const MAX = 255;

const CAMPAIGN_KEYS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "fbclid", "gclid", "gbraid", "wbraid",
] as const;

function clean(v: string | null | undefined): string | null {
  if (!v) return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, MAX);
}

function empty(): Attribution {
  return {
    utm_source: null, utm_medium: null, utm_campaign: null,
    utm_content: null, utm_term: null, fbclid: null,
    gclid: null, gbraid: null, wbraid: null,
    landing_path: null, referrer: null, first_seen_at: null,
  };
}

function load(): Attribution | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Attribution>;
    if (!parsed || typeof parsed !== "object") return null;
    return { ...empty(), ...parsed };
  } catch {
    return null;
  }
}

function save(a: Attribution): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* private window, or storage disabled. Not worth a single line of UI. */
  }
}

/**
 * Call once per page load. Cheap, idempotent, and safe before hydration.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const existing = load();
    const a: Attribution = existing ?? empty();

    if (!existing) {
      // The introduction. Frozen from here.
      a.landing_path = clean(window.location.pathname + window.location.search);
      a.first_seen_at = new Date().toISOString();
      let ref: string | null = null;
      try {
        const r = document.referrer;
        // Same-origin means they simply clicked through our own site; that is
        // navigation, not a referral, and recording it would drown the real ones.
        if (r && new URL(r).host !== window.location.host) ref = r;
      } catch { /* malformed referrer */ }
      a.referrer = clean(ref);
    }

    // Campaign fields: first value wins, whenever it arrives.
    let touched = !existing;
    for (const k of CAMPAIGN_KEYS) {
      if (a[k]) continue;
      const v = clean(params.get(k));
      if (v) { a[k] = v; touched = true; }
    }

    if (touched) save(a);
  } catch {
    /* Never let analytics break a page. */
  }
}

/**
 * What to send with a signup. Returns null when there is genuinely nothing —
 * so the API can tell "we looked and found nothing" from "we never looked".
 */
export function readAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  const a = load();
  if (!a) return null;
  const hasAnything = Object.values(a).some((v) => v !== null && v !== "");
  return hasAnything ? a : null;
}
