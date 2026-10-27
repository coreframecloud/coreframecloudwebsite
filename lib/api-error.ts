/**
 * What the customer reads when an API call fails (27 Oct 2026). Never a status
 * code or "[object Object]": a FastAPI validation list used to reach the sign-in
 * form as "[object Object]", a proxy's HTML error page as a JSON parse error,
 * and a dropped connection as "Failed to fetch".
 *
 * Keep in step with ApiClient.errorMessage in the Connect app
 * (coreframe-control-plane apps/desktop-client/src/api/client.js).
 */

type FieldError = { loc?: unknown[]; msg?: unknown };

const FIELD_TEXT: Array<[RegExp, string]> = [
  [/email/, "Enter a full email address, like name@gmail.com."],
  [/^(code|otp|otp_code)$/, "Enter the 6-digit code from your email."],
  [/phone|mobile/, "Enter your mobile number with the country code, like +91 98765 43210."],
  [/gstin/, "Check the GSTIN - it is 15 characters, like 29ABCDE1234F1Z5."],
  [/full_name|name/, "Enter your full name."],
];

/** A sentence for the person, from a response status and its parsed body. */
export function apiErrorText(status: number, body: unknown): string {
  const d = (body as { detail?: unknown } | null)?.detail;
  if (typeof d === "string") {
    const t = d.trim();
    if (t && !t.startsWith("<") && t.length <= 300) return t;
  } else if (Array.isArray(d)) {
    const first = (d[0] ?? {}) as FieldError;
    const loc = Array.isArray(first.loc) ? first.loc : [];
    const field = String(loc[loc.length - 1] ?? "").toLowerCase();
    for (const [re, text] of FIELD_TEXT) if (re.test(field)) return text;
    return "Please check what you entered and try again.";
  } else if (d && typeof d === "object") {
    const m = (d as { message?: unknown; safe_reason?: unknown }).message
      ?? (d as { safe_reason?: unknown }).safe_reason;
    if (typeof m === "string" && m.trim()) return m.trim();
  }
  if (status === 400 || status === 422) return "Please check what you entered and try again.";
  if (status === 401) return "Please sign in again.";
  if (status === 403) return "Your account does not have access to that.";
  if (status === 404) return "We could not find that. Please refresh and try again.";
  if (status === 409) return "That clashes with something that already exists. Please refresh and try again.";
  if (status === 429) return "Too many attempts. Please wait a minute and try again.";
  if (status >= 500) return "Coreframe is having trouble right now. Please try again in a moment.";
  return `Something went wrong (error ${status}). Please try again.`;
}

/** The parsed JSON body, or null for an empty or non-JSON body (a proxy page). */
export async function readBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/** The text for a caught error: network failures get a plain sentence. */
export function caughtErrorText(err: unknown, fallback: string): string {
  if (err instanceof TypeError) return "Network connection was interrupted. Check your internet and try again.";
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

/** Same check the Connect app runs before sending: something@something.tld */
export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
