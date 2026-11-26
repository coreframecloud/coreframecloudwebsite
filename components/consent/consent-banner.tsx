"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  CONSENT_EVENT,
  CONSENT_OPEN_EVENT,
  readConsent,
  setConsent,
  type ConsentChoice,
  type ConsentState,
} from "@/lib/consent";

/**
 * The cookie choice (owner decisions 10 Nov and 26 Nov 2026), on every page.
 *
 * 26 Nov 2026: the quiet bottom bar became a centred prompt. The bar was easy
 * to ignore, and no choice counts as "no", so only about 1 page view in 5 came
 * from a visitor who had chosen at all. The prompt asks once, in plain words,
 * with ONE reason, and two buttons of EQUAL weight, side by side: "Only essential"
 * and "Accept" (DPDP Act / GDPR: refusing is exactly as easy as accepting, nothing
 * is pre-selected, and the website works the same either way). It is never a
 * cookie wall: "Only essential" is right there and opens the page just the same.
 *
 * Visitors in India are not asked (owner decision 26 Nov 2026, "notice" in
 * lib/consent.ts): the tags run by default and "Cookie settings" opens this
 * prompt so they can choose "Only essential".
 *
 * Shown until the visitor chooses (the cf_consent cookie, 6 months,
 * lib/consent.ts) and again whenever the footer's "Cookie settings" asks for it.
 * Nothing non-essential runs before Accept: the tags in app/layout.tsx, the
 * cf_vid id (lib/web-events.ts) and stored attribution (lib/attribution.ts)
 * all wait for it.
 *
 * While it is open the page behind is dimmed and not clickable, focus moves to
 * the prompt and Tab stays inside it. Escape does nothing on purpose: closing
 * without a choice is not a choice.
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
const serverSnapshot = (): ConsentState | null | "ssr" => "ssr";

export function ConsentBanner() {
  const current = useSyncExternalStore<ConsentState | null | "ssr">(subscribe, readConsent, serverSnapshot);
  const [reopenedOpen, setReopenedOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const open = current !== "ssr" && (current === null || reopenedOpen);

  useEffect(() => {
    const reopen = () => setReopenedOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  // While open: no page scroll behind, focus on the prompt, Tab kept inside.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const before = document.activeElement as HTMLElement | null;
    root.classList.add("cf-consent-open");
    // Focus the prompt itself, not a button: a ring on one choice would single it out.
    ref.current?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !ref.current) return;
      const items = Array.from(ref.current.querySelectorAll<HTMLElement>("a[href], button"));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      root.classList.remove("cf-consent-open");
      try {
        before?.focus?.();
      } catch {
        /* nothing to do */
      }
    };
  }, [open]);

  const choose = useCallback((c: ConsentChoice) => {
    setConsent(c);
    setReopenedOpen(false);
  }, []);

  if (!open) return null;

  return (
    <div className="cf-consent fixed inset-0 z-[1000] flex items-center justify-center bg-ink/45 px-4 py-6">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cf-consent-title"
        aria-describedby="cf-consent-text"
        tabIndex={-1}
        className="w-full max-w-[420px] rounded-[20px] border border-white/60 bg-paper p-5 shadow-[0_24px_64px_rgba(0,0,0,0.22)] outline-none sm:p-6"
      >
        <h2 id="cf-consent-title" className="text-[18px] leading-6 font-semibold text-ink">
          Cookies on Coreframe
        </h2>
        <p id="cf-consent-text" className="mt-2 text-[14px] leading-[21px] text-ink-2">
          {/* Owner-approved wording, 24 Nov 2026 (the desktop line, now on every screen size). */}
          Accept analytics and ad cookies? They tell us which pages and ads help people find us, so we can keep prices
          low and show fewer irrelevant ads. Sign-in and payments work the same either way.{" "}
          <a href="/privacy-policy#cookies" className="whitespace-nowrap text-ink underline underline-offset-2 hover:text-blue">
            How we use cookies
          </a>
          {current ? (
            <span className="text-ink-3">
              {" "}· Now: {current === "granted" ? "accepted" : current === "notice" ? "on by default" : "only essential"}
            </span>
          ) : null}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => choose("denied")} className="cf-consent-btn">
            Only essential
          </button>
          <button type="button" onClick={() => choose("granted")} className="cf-consent-btn">
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
