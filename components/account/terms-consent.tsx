"use client";
import { useSyncExternalStore } from "react";
import { CONSENT_EVENT, readConsent } from "@/lib/consent";

function subscribeConsent(cb: () => void): () => void {
  window.addEventListener(CONSENT_EVENT, cb);
  return () => window.removeEventListener(CONSENT_EVENT, cb);
}

/* The two boxes shown when an account is CREATED (28 Oct 2026).

   1. Terms of Service + Fair Use Policy: required, unticked; the create button
      stays disabled until it is ticked, and the API refuses the sign-up
      (409 terms_required) without it.
   2. WhatsApp offers: optional, unticked (DPDP / GDPR: a pre-ticked box is not
      consent). Payment and session alerts on WhatsApp are part of the service
      and covered by the Terms; this box is only for offers.

   3. Ad measurement (26 Nov 2026): optional, unticked, shown only when the
      visitor has not already pressed Accept on the cookie prompt. Ticking it is
      the same choice as Accept (lib/consent.ts), applied when the form is
      sent, so the account records it and Meta / Google can see which ad or
      link brought this sign-up. Unticked changes nothing.
   Phones: each row is a full-width label at least 44px tall, the text wraps at
   360px, and the two links open in a new tab without toggling the box. */

export function TermsConsent({
  terms,
  onTerms,
  offers,
  onOffers,
  measure = false,
  onMeasure,
  idPrefix = "signup",
}: {
  terms: boolean;
  onTerms: (v: boolean) => void;
  offers: boolean;
  onOffers: (v: boolean) => void;
  measure?: boolean;
  onMeasure?: (v: boolean) => void;
  idPrefix?: string;
}) {
  // The cookie is not visible on the server: "ssr" until the browser has read it.
  const consentNow = useSyncExternalStore(subscribeConsent, readConsent, () => "ssr" as const);
  // Only for someone with no choice yet or who rejected; not for Accept or the India default.
  const askMeasure = Boolean(onMeasure) && (consentNow === null || consentNow === "denied");
  const box =
    "mt-[3px] h-5 w-5 shrink-0 cursor-pointer rounded border-rule-strong accent-[var(--color-blue,#2f6bff)]";
  const row = "flex min-h-11 w-full min-w-0 cursor-pointer items-start gap-3 py-1.5 text-[14px] leading-6 text-ink-2";
  return (
    <div className="grid gap-1" data-testid="terms-consent">
      <label htmlFor={`${idPrefix}-terms`} className={row}>
        <input
          id={`${idPrefix}-terms`}
          type="checkbox"
          className={box}
          checked={terms}
          onChange={(e) => onTerms(e.target.checked)}
          aria-required="true"
        />
        <span className="min-w-0 break-words">
          I agree to the{" "}
          <a
            href="/terms-of-service"
            target="_blank"
            rel="noopener"
            className="text-blue underline-offset-2 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/fair-use-policy"
            target="_blank"
            rel="noopener"
            className="text-blue underline-offset-2 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Fair Use Policy
          </a>
          .
        </span>
      </label>
      <label htmlFor={`${idPrefix}-offers`} className={row}>
        <input
          id={`${idPrefix}-offers`}
          type="checkbox"
          className={box}
          checked={offers}
          onChange={(e) => onOffers(e.target.checked)}
        />
        <span className="min-w-0 break-words">Send me offers and updates on WhatsApp (optional).</span>
      </label>
      {askMeasure && onMeasure ? (
        <label htmlFor={`${idPrefix}-measure`} className={row}>
          <input
            id={`${idPrefix}-measure`}
            type="checkbox"
            className={box}
            checked={measure}
            onChange={(e) => onMeasure(e.target.checked)}
          />
          <span className="min-w-0 break-words">
            Accept analytics cookies, so we can see which ad or link brought me here (optional).
          </span>
        </label>
      ) : null}
    </div>
  );
}

export { isTermsRequired, TERMS_REQUIRED_TEXT } from "@/lib/signup-consent";
