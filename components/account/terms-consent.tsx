"use client";

/* The two boxes shown when an account is CREATED (28 Oct 2026).

   1. Terms of Service + Fair Use Policy: required, unticked; the create button
      stays disabled until it is ticked, and the API refuses the sign-up
      (409 terms_required) without it.
   2. WhatsApp offers: optional, unticked (DPDP / GDPR: a pre-ticked box is not
      consent). Payment and session alerts on WhatsApp are part of the service
      and covered by the Terms; this box is only for offers.

   Phones: each row is a full-width label at least 44px tall, the text wraps at
   360px, and the two links open in a new tab without toggling the box. */

export function TermsConsent({
  terms,
  onTerms,
  offers,
  onOffers,
  idPrefix = "signup",
}: {
  terms: boolean;
  onTerms: (v: boolean) => void;
  offers: boolean;
  onOffers: (v: boolean) => void;
  idPrefix?: string;
}) {
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
    </div>
  );
}

export { isTermsRequired, TERMS_REQUIRED_TEXT } from "@/lib/signup-consent";
