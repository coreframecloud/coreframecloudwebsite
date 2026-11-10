"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  CONSENT_EVENT,
  CONSENT_OPEN_EVENT,
  readConsent,
  setConsent,
  type ConsentChoice,
} from "@/lib/consent";

/**
 * The consent bar (owner decision 10 Nov 2026), on every page.
 *
 * Small and quiet, at the bottom, plain words, two buttons of EQUAL weight:
 * "Accept" and "Only essential". Shown until the visitor chooses (the choice
 * is the cf_consent cookie, 6 months, lib/consent.ts) and again whenever the
 * footer's "Cookie settings" asks for it. Nothing non-essential runs before
 * Accept: the tags in app/layout.tsx, the cf_vid id (lib/web-events.ts) and
 * stored attribution (lib/attribution.ts) all wait for it.
 *
 * It never covers a call to action: while it is open its height is published
 * as --cf-consent-h, the page gets that much bottom padding, and the fixed
 * bottom controls (.cf-consent-lift: the WhatsApp button, the /go sticky CTA)
 * sit above it. No focus trap: the page stays usable, the bar is one Tab
 * stop away and is focused when reopened from the footer.
 *
 * Deliberately not .cf-btn-primary: the funnel beacon counts those as CTA
 * clicks, and the two choices must look the same.
 */
function subscribe(cb: () => void): () => void {
  window.addEventListener(CONSENT_EVENT, cb);
  return () => window.removeEventListener(CONSENT_EVENT, cb);
}
// "ssr" on the server and during hydration: render nothing until the browser
// has read the cookie, so server and client markup agree.
const serverSnapshot = (): ConsentChoice | null | "ssr" => "ssr";

export function ConsentBanner() {
  const current = useSyncExternalStore<ConsentChoice | null | "ssr">(subscribe, readConsent, serverSnapshot);
  const [reopenedOpen, setReopenedOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const firstBtn = useRef<HTMLButtonElement>(null);
  const reopened = useRef(false);
  const open = current !== "ssr" && (current === null || reopenedOpen);

  useEffect(() => {
    const reopen = () => {
      reopened.current = true;
      setReopenedOpen(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  // Publish the bar's height so nothing important hides under it.
  useEffect(() => {
    const root = document.documentElement;
    if (!open || !ref.current) {
      root.style.removeProperty("--cf-consent-h");
      root.classList.remove("cf-consent-open");
      return;
    }
    const el = ref.current;
    const set = () => root.style.setProperty("--cf-consent-h", `${Math.ceil(el.getBoundingClientRect().height)}px`);
    set();
    root.classList.add("cf-consent-open");
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(set) : null;
    ro?.observe(el);
    if (reopened.current) {
      reopened.current = false;
      firstBtn.current?.focus();
    }
    return () => {
      ro?.disconnect();
      root.style.removeProperty("--cf-consent-h");
      root.classList.remove("cf-consent-open");
    };
  }, [open]);

  const choose = useCallback((c: ConsentChoice) => {
    setConsent(c);
    setReopenedOpen(false);
  }, []);

  if (!open) return null;

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Cookie choice"
      className="cf-consent fixed inset-x-0 bottom-0 z-[60] border-t border-white/40 bg-paper/70 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl backdrop-saturate-150"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-3 lg:px-8">
        <p className="text-[13px] leading-5 font-medium text-ink sm:flex-1">
          We use cookies to improve your experience and analyse site traffic.
          <span className="hidden sm:inline"> Essential cookies for sign-in and payments are always on.</span>{" "}
          <a href="/privacy-policy#cookies" className="whitespace-nowrap text-ink underline underline-offset-2 hover:text-blue">
            How we use cookies
          </a>
          {current ? (
            <span className="text-ink-3"> · Now: {current === "granted" ? "accepted" : "only essential"}</span>
          ) : null}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
          <button type="button" onClick={() => choose("denied")} className="cf-consent-btn">
            Only essential
          </button>
          <button
            ref={firstBtn}
            type="button"
            onClick={() => choose("granted")}
            className="cf-consent-btn cf-consent-btn-primary"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

/** The footer's "Cookie settings" link: reopens the bar. */
export function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        try {
          window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
        } catch {
          /* nothing to do */
        }
      }}
    >
      Cookie settings
    </button>
  );
}
