// Sign-up consent and pay-link helpers (28 Oct 2026). Plain TS so tests can import them.

/** The API's answer when the Terms box was not ticked on a NEW account (409). */
export function isTermsRequired(data: unknown): boolean {
  const d = (data as { detail?: unknown } | null)?.detail;
  return typeof d === "object" && d !== null && (d as { code?: string }).code === "terms_required";
}

export const TERMS_REQUIRED_TEXT =
  "Please tick the box to agree to the Terms of Service and Fair Use Policy.";

/** /my-activity with the top-up dialog open and this amount preselected. */
export function topUpHref(amount: number): string {
  const v = Number.isFinite(amount) && amount > 0 ? String(amount) : "";
  return `/my-activity?topup=1${v ? `&amount=${encodeURIComponent(v)}` : ""}`;
}
