"use client";

/**
 * The visitor's analytics choice (owner decision 10 Nov 2026: a consent
 * banner, then first-party attribution; no fingerprinting).
 *
 * One essential cookie, `cf_consent`, holds the choice: "granted" (Accept) or
 * "denied" (Only essential), for 6 months, on .coreframecloud.com so the API
 * (control.coreframecloud.com) sees the same answer at sign-up. No cookie = no
 * choice yet, which behaves exactly like "denied": no Google / Meta / Clarity
 * tag, no cf_vid, nothing stored about where the visitor came from.
 *
 * Changing the choice fires a `cf-consent` window event (detail = the choice);
 * the tag loader in app/layout.tsx, the beacon (lib/web-events.ts) and the
 * attribution capture (lib/attribution.ts) listen for it. `openConsentSettings`
 * reopens the banner (the footer's "Cookie settings").
 *
 * Nothing here may throw into a page.
 */

export type ConsentChoice = "granted" | "denied";

export const CONSENT_COOKIE = "cf_consent";
export const CONSENT_EVENT = "cf-consent";
export const CONSENT_OPEN_EVENT = "cf-consent-open";
const MAX_AGE_S = 182 * 24 * 60 * 60; // 6 months

function cookieDomain(): string {
  try {
    const host = window.location.hostname;
    return host === "coreframecloud.com" || host.endsWith(".coreframecloud.com") ? "; domain=.coreframecloud.com" : "";
  } catch {
    return "";
  }
}

export function readConsent(): ConsentChoice | null {
  if (typeof document === "undefined") return null;
  try {
    const hit = document.cookie.split("; ").find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
    const v = hit ? hit.slice(CONSENT_COOKIE.length + 1) : "";
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function hasConsent(): boolean {
  return readConsent() === "granted";
}

/** Cookies and storage the non-essential tags and our attribution leave
 *  behind. Cleared when the visitor chooses "Only essential". */
const NON_ESSENTIAL_COOKIES = [/^cf_vid$/, /^cf_attr$/, /^_ga/, /^_gid$/, /^_gat/, /^_gcl_/, /^_fbp$/, /^_fbc$/,
  /^_clck$/, /^_clsk$/, /^_uetsid$/, /^_uetvid$/, /^li_fat_id$/];

function clearNonEssential(): void {
  try {
    const names = document.cookie.split("; ").map((c) => c.split("=")[0]).filter(Boolean);
    const host = window.location.hostname;
    const domains = ["", `; domain=${host}`, "; domain=.coreframecloud.com", `; domain=.${host.split(".").slice(-2).join(".")}`];
    for (const n of names) {
      if (!NON_ESSENTIAL_COOKIES.some((re) => re.test(n))) continue;
      for (const d of domains) document.cookie = `${n}=; path=/; max-age=0${d}`;
    }
  } catch {
    /* cookies blocked */
  }
  try {
    for (const k of ["cf_attribution", "cf_meta_queue"]) window.localStorage.removeItem(k);
  } catch {
    /* storage blocked */
  }
  try {
    window.sessionStorage.removeItem("cf_sid");
  } catch {
    /* storage blocked */
  }
}

export function setConsent(choice: ConsentChoice): void {
  if (typeof document === "undefined") return;
  const before = readConsent();
  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${CONSENT_COOKIE}=${choice}; path=/; max-age=${MAX_AGE_S}; SameSite=Lax${cookieDomain()}${secure}`;
  } catch {
    /* cookies blocked: the choice lasts for this page only */
  }
  if (choice === "denied") clearNonEssential();
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
  } catch {
    /* very old browser */
  }
  // Tags already running on this page cannot be unloaded; a reload is the
  // only honest way to stop them after a change of mind.
  if (before === "granted" && choice === "denied") {
    try {
      window.location.reload();
    } catch {
      /* nothing to do */
    }
  }
}

export function onConsentChange(fn: (choice: ConsentChoice) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const h = (e: Event) => {
    const d = (e as CustomEvent).detail;
    if (d === "granted" || d === "denied") fn(d);
  };
  window.addEventListener(CONSENT_EVENT, h);
  return () => window.removeEventListener(CONSENT_EVENT, h);
}

export function openConsentSettings(): void {
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
  } catch {
    /* nothing to do */
  }
}
