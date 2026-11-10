"use client";

/**
 * First-party funnel beacon (owner, 22 Oct 2026: "where is the customer
 * dropping must be logged"). Batches events and sends them to the control
 * plane's POST /events/web with navigator.sendBeacon (fetch keepalive as the
 * fallback) every 5 s and on pagehide / tab hidden. The allow-list, the
 * privacy rules and how to read the report: plans/web-events-20261022.md and
 * plans/visitor-attribution-20261110.md.
 *
 * CONSENT (owner decision 10 Nov 2026; lib/consent.ts). Until the visitor
 * presses Accept on the banner there is no cf_vid, no session id and no
 * stored attribution: the beacon sends page views only, marked `anon`, with
 * this page load's landing source held in memory, and the API turns them
 * into an anonymous daily count per source (no row, no id). Every other
 * event is dropped. After Accept: a random UUID in the first-party cookie
 * cf_vid (13 months, SameSite=Lax, Secure, shared by *.coreframecloud.com so
 * the API sees it at sign-in), batches marked `c: 1`, and the stored first
 * and last touch go with them. In the Consent Mode v2 regions (EEA, UK, CH;
 * the layout passes the flag) the visitor stays anonymous even after Accept,
 * as before.
 *
 * Nothing here may throw into a page, and nothing waits on the network.
 */
import { API_BASE } from "@/lib/api-base";
import { landingSource } from "@/lib/attribution";
import { hasConsent, onConsentChange } from "@/lib/consent";

type Props = Record<string, string | number | boolean | undefined>;
type Ev = { n: string; p: string; props?: Props; t: number };

const URL = `${API_BASE}/events/web`;
const COOKIE = "cf_vid";
const VID_MAX_AGE_S = 395 * 24 * 60 * 60; // 13 months
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const queue: Ev[] = [];
let vid = "";
let sid = "";
let regionDenied = false;
let identified = false;
let started = false;
let timer: ReturnType<typeof setTimeout> | undefined;

function uuid(): string {
  try {
    if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
    const a = new Uint8Array(16);
    crypto.getRandomValues(a);
    a[6] = (a[6] & 0x0f) | 0x40;
    a[8] = (a[8] & 0x3f) | 0x80;
    const h = Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  } catch {
    return "";
  }
}

function rnd(): string {
  try {
    const a = new Uint8Array(10);
    crypto.getRandomValues(a);
    return "s" + Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return "s" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
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
    document.cookie = `${COOKIE}=${value}; path=/; max-age=${VID_MAX_AGE_S}; SameSite=Lax${domain}${secure}`;
  } catch {
    /* cookies disabled */
  }
}

/** Become (or stop being) an identified visitor, per the banner's choice. */
function identify(): void {
  identified = !regionDenied && hasConsent();
  if (!identified) {
    vid = "";
    sid = "";
    return;
  }
  vid = readCookie(COOKIE) || "";
  if (!UUID.test(vid)) {
    // A pre-banner "v…" id, or none: a fresh random UUID.
    vid = uuid();
    if (!vid) { identified = false; return; }
    setCookie(vid);
  }
  try {
    sid = sessionStorage.getItem("cf_sid") || "";
    if (!sid) { sid = rnd(); sessionStorage.setItem("cf_sid", sid); }
  } catch {
    sid = rnd();
  }
}

/** The stored first touch and last touch (lib/attribution.ts), consented only. */
function touches(): { a?: Record<string, string>; l?: Record<string, string> } {
  let raw: string | null = null;
  try { raw = localStorage.getItem("cf_attribution"); } catch { /* blocked */ }
  if (!raw) raw = readCookie("cf_attr");
  if (!raw) return {};
  try {
    const x = JSON.parse(raw) as Record<string, unknown>;
    const a: Record<string, string> = {};
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id",
      "landing_path", "referrer", "intro_variant", "first_seen_at",
      "gclid", "fbclid", "gbraid", "wbraid", "msclkid", "li_fat_id"]) {
      if (typeof x[k] === "string" && x[k]) a[k] = (x[k] as string).slice(0, 200);
    }
    const out: { a?: Record<string, string>; l?: Record<string, string> } = Object.keys(a).length ? { a } : {};
    const lt = x.last_touch as Record<string, unknown> | null | undefined;
    if (lt && typeof lt === "object") {
      const l: Record<string, string> = {};
      for (const [k, v] of Object.entries(lt)) if (typeof v === "string" && v) l[k] = v.slice(0, 200);
      if (Object.keys(l).length) out.l = l;
    }
    return out;
  } catch {
    return {};
  }
}

/** Once per page load, from the root layout. `denied` = consent region. */
export function init(denied: boolean): void {
  if (started || typeof window === "undefined") return;
  started = true;
  regionDenied = denied;
  identify();
  onConsentChange(() => {
    identify();
    // Without consent only page views ever leave this page.
    if (!identified) {
      for (let i = queue.length - 1; i >= 0; i--) if (queue[i].n !== "page_view") queue.splice(i, 1);
    }
  });
  const hide = () => { if (document.visibilityState === "hidden") flush(); };
  document.addEventListener("visibilitychange", hide);
  window.addEventListener("pagehide", flush);
}

/** Queue one event. Sent within 5 s, or at once when the page goes away.
 *  Without consent: page_view only. */
export function track(n: string, props?: Props): void {
  if (typeof window === "undefined") return;
  try {
    // Before a choice, keep funnel events in the queue for a moment: an
    // Accept within the 5 s window sends them; otherwise flush drops them.
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
      const chunk = queue.splice(0, 25);
      let body: string;
      if (identified && vid) {
        const e = chunk.map((x) => ({ n: x.n, p: x.p, props: x.props, dt: now - x.t }));
        body = JSON.stringify({ v: 1, c: 1, vid, sid, ...touches(), e });
      } else {
        // Anonymous: page views only, no id, no props beyond nothing.
        const e = chunk.filter((x) => x.n === "page_view").map((x) => ({ n: x.n, p: x.p }));
        if (!e.length) continue;
        body = JSON.stringify({ v: 1, anon: true, a: landingSource(), e });
      }
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
