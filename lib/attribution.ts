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
  // Added 12 Oct 2026. The API ignores unknown fields (pydantic default), so
  // these ride along harmlessly until AttributionIn learns them.
  /** utm_id: the ad platform's numeric campaign id ({{campaign.id}} on Meta,
   *  {campaignid} on Google), which survives a campaign being renamed. */
  utm_id: string | null;
  /** The most recent campaign touch. First touch says who introduced them;
   *  this says which ad brought them back to sign up, which is what a 20-day
   *  test is judged on. Rewritten on every visit that carries campaign params. */
  last_touch: LastTouch | null;
  /** Meta's browser ids (_fbp / _fbc cookies), read at sign-up. Not personal
   *  data on their own; the Conversions API matches on them. */
  fbp?: string | null;
  fbc?: string | null;
};

export type LastTouch = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  utm_id: string | null;
  gclid: string | null;
  fbclid: string | null;
  at: string;
};

const KEY = "cf_attribution";
/** First-party cookie mirror of KEY, shared by every *.coreframecloud.com host
 *  (the Studio app lives on a subdomain) and kept when localStorage is not. */
const COOKIE = "cf_attr";
const COOKIE_MAX_AGE_S = 90 * 24 * 60 * 60;

// Comfortably under the narrowest plausible column. A utm_content longer than
// this is a tracking macro that did not expand, not information.
const MAX = 255;

const CAMPAIGN_KEYS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "fbclid", "gclid", "gbraid", "wbraid", "utm_id",
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
    utm_id: null, last_touch: null,
  };
}

function readCookie(name: string): string | null {
  try {
    const hit = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
    return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
  } catch {
    return null;
  }
}

function writeCookie(value: string): void {
  try {
    const host = window.location.hostname;
    const domain = host === "coreframecloud.com" || host.endsWith(".coreframecloud.com")
      ? "; domain=.coreframecloud.com"
      : "";
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie =
      `${COOKIE}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE_S}; SameSite=Lax${domain}${secure}`;
  } catch {
    /* cookies disabled */
  }
}

function load(): Attribution | null {
  try {
    let raw: string | null = null;
    try { raw = window.localStorage.getItem(KEY); } catch { /* blocked */ }
    if (!raw) raw = readCookie(COOKIE);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Attribution>;
    if (!parsed || typeof parsed !== "object") return null;
    return { ...empty(), ...parsed };
  } catch {
    return null;
  }
}

function save(a: Attribution): void {
  const json = JSON.stringify(a);
  try {
    window.localStorage.setItem(KEY, json);
  } catch {
    /* private window, or storage disabled. Not worth a single line of UI. */
  }
  writeCookie(json);
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

    // Last touch: any visit that arrives with campaign params replaces it.
    const p = (k: string) => clean(params.get(k));
    if (CAMPAIGN_KEYS.some((k) => params.get(k))) {
      a.last_touch = {
        utm_source: p("utm_source"), utm_medium: p("utm_medium"),
        utm_campaign: p("utm_campaign"), utm_content: p("utm_content"),
        utm_term: p("utm_term"), utm_id: p("utm_id"),
        gclid: p("gclid"), fbclid: p("fbclid"),
        at: new Date().toISOString(),
      };
      touched = true;
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
  // Meta's own first-party ids, set by the pixel. Read now, not at landing:
  // the pixel loads lazily and may not have written them on the first page.
  a.fbp = clean(readCookie("_fbp"));
  a.fbc = clean(readCookie("_fbc"));
  const hasAnything = Object.values(a).some((v) => v !== null && v !== "");
  return hasAnything ? a : null;
}
