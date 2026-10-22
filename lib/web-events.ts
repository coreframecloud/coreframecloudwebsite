"use client";

/**
 * First-party funnel beacon (owner, 22 Oct 2026: "where is the customer
 * dropping must be logged"). Batches events and sends them to the control
 * plane's POST /events/web with navigator.sendBeacon (fetch keepalive as the
 * fallback) every 5 s and on pagehide / tab hidden. The allow-list, the
 * privacy rules and how to read the report: plans/web-events-20261022.md.
 *
 * Visitor id: first-party cookie cf_vid (1 year, SameSite=Lax, shared by
 * *.coreframecloud.com so the API sees it on sign-in and copies it to the
 * account). In the Consent Mode v2 denied regions (EEA, UK, CH; the layout
 * passes the flag) no cookie is set and batches go out marked `anon`, so the
 * API stores nothing that identifies the visitor. Cookies blocked: a per
 * page-load id, so the page's own events still chain.
 *
 * Nothing here may throw into a page, and nothing waits on the network.
 */
import { API_BASE } from "@/lib/api-base";

type Props = Record<string, string | number | boolean | undefined>;
type Ev = { n: string; p: string; props?: Props; t: number };

const URL = `${API_BASE}/events/web`;
const COOKIE = "cf_vid";
const queue: Ev[] = [];
let vid = "";
let sid = "";
let anon = false;
let started = false;
let timer: ReturnType<typeof setTimeout> | undefined;

function rnd(): string {
  try {
    const a = new Uint8Array(10);
    crypto.getRandomValues(a);
    return "v" + Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return "v" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
  }
}

function readCookie(name: string): string | null {
  try {
    const hit = document.cookie.split("; ").find((c) => c.startsWith(name + "="));
    return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
  } catch {
    return null;
  }
}

function setCookie(value: string): void {
  try {
    const host = location.hostname;
    const domain = host === "coreframecloud.com" || host.endsWith(".coreframecloud.com") ? "; domain=.coreframecloud.com" : "";
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${COOKIE}=${value}; path=/; max-age=31536000; SameSite=Lax${domain}${secure}`;
  } catch {
    /* cookies disabled */
  }
}

/** Attribution as the site stored it (lib/attribution.ts), trimmed to what
 *  a row carries. Click ids are sent as a flag: the API keeps only the kind. */
function attribution(): Record<string, string> | undefined {
  let raw: string | null = null;
  try { raw = localStorage.getItem("cf_attribution"); } catch { /* blocked */ }
  if (!raw) raw = readCookie("cf_attr");
  if (!raw) return undefined;
  try {
    const a = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "landing_path", "referrer", "intro_variant"]) {
      if (typeof a[k] === "string" && a[k]) out[k] = (a[k] as string).slice(0, 200);
    }
    for (const k of ["gclid", "fbclid", "gbraid", "wbraid"]) if (a[k]) out[k] = "1";
    return out;
  } catch {
    return undefined;
  }
}

/** Once per page load, from the root layout. `denied` = consent region. */
export function init(denied: boolean): void {
  if (started || typeof window === "undefined") return;
  started = true;
  anon = denied;
  if (!denied) {
    vid = readCookie(COOKIE) || "";
    if (!vid || !/^[A-Za-z0-9_-]{8,40}$/.test(vid)) {
      vid = rnd();
      setCookie(vid);
    }
  } else {
    vid = rnd();
  }
  try {
    sid = sessionStorage.getItem("cf_sid") || "";
    if (!sid) { sid = rnd(); sessionStorage.setItem("cf_sid", sid); }
  } catch {
    sid = rnd();
  }
  const hide = () => { if (document.visibilityState === "hidden") flush(); };
  document.addEventListener("visibilitychange", hide);
  window.addEventListener("pagehide", flush);
}

/** Queue one event. Sent within 5 s, or at once when the page goes away. */
export function track(n: string, props?: Props): void {
  if (typeof window === "undefined") return;
  try {
    queue.push({ n, p: location.pathname, props, t: Date.now() });
    if (queue.length >= 25) flush();
    else if (!timer) timer = setTimeout(flush, 5000);
  } catch {
    /* never break the page */
  }
}

/** Send what is queued now (sendBeacon, else fetch keepalive). */
export function flush(): void {
  if (timer) { clearTimeout(timer); timer = undefined; }
  if (!queue.length || !started) return;
  try {
    const now = Date.now();
    while (queue.length) {
      const e = queue.splice(0, 25).map((x) => ({ n: x.n, p: x.p, props: x.props, dt: now - x.t }));
      const body = JSON.stringify({ v: 1, vid, sid, anon: anon || undefined, a: attribution(), e });
      // A string body is text/plain: no CORS preflight, which a page being
      // unloaded never gets to finish. Cookies travel (same site).
      if (!(navigator.sendBeacon && navigator.sendBeacon(URL, body))) {
        fetch(URL, { method: "POST", body, keepalive: true, credentials: "include", headers: { "content-type": "text/plain" } }).catch(() => {});
      }
    }
  } catch {
    /* nothing to do */
  }
}
