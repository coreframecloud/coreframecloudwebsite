/**
 * Pure helpers for the Meta pixel + Conversions API pairing (24 Nov 2026).
 * No imports, no window access at module load: tests/meta-ids.test.ts runs
 * this file directly under node.
 *
 * EVENT IDS. The browser's eventID and the server's event_id must be the same
 * string for Meta to keep one copy. The server (control plane,
 * services/meta_capi.py) builds the same shapes:
 *
 *   PageView              pv.<uuid>              browser makes it; beacon `px` mirrors it
 *   ViewContent           vc.<uuid>              browser makes it; beacon `px` mirrors it
 *   Lead                  lead.<uuid>            browser makes it; beacon `px` mirrors it
 *   AddPaymentInfo        payinfo_<topup id>     browser; beacon `px` mirrors it
 *   InitiateCheckout      checkout_<topup id>    server sends its own; same id
 *   CompleteRegistration  signup_<user id>       server sends its own; same id
 *   Purchase              <razorpay payment id>  server sends its own; same id
 */

export type MetaPrefix = "pv" | "vc" | "lead";

function uuid(): string {
  try {
    const c = (globalThis as { crypto?: Crypto }).crypto;
    if (c && typeof c.randomUUID === "function") return c.randomUUID();
    if (c && typeof c.getRandomValues === "function") {
      const a = new Uint8Array(16);
      c.getRandomValues(a);
      a[6] = (a[6] & 0x0f) | 0x40;
      a[8] = (a[8] & 0x3f) | 0x80;
      const h = Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
      return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
    }
  } catch {
    /* fall through */
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 14)}`;
}

/** A fresh browser-made event id: `pv.<uuid>`, `vc.<uuid>`, `lead.<uuid>`. */
export function newEventId(prefix: MetaPrefix): string {
  return `${prefix}.${uuid()}`;
}

/** Ids tied to a top-up order. Null when the order id is not a positive integer. */
export function checkoutEventId(topupId: unknown): string | null {
  return typeof topupId === "number" && Number.isInteger(topupId) && topupId > 0 ? `checkout_${topupId}` : null;
}

export function payInfoEventId(topupId: unknown): string | null {
  return typeof topupId === "number" && Number.isInteger(topupId) && topupId > 0 ? `payinfo_${topupId}` : null;
}

/**
 * Is this page view a LANDING? Only the first page view of a page load
 * counts, and only when the visitor arrived from nowhere (typed, bookmark,
 * app) or from another site. No storage is read: it is the document's own
 * referrer, so it works for visitors who chose "Only essential".
 */
export function isLanding(first: boolean, referrer: string | null | undefined, host: string): boolean {
  if (!first) return false;
  if (!referrer) return true;
  try {
    return new URL(referrer).host !== host;
  } catch {
    return true;
  }
}

export type PxProps = { e: string; id: string; cn?: string; cc?: string; v?: number; cur?: string };

const PX_EVENTS = new Set(["PageView", "ViewContent", "Lead", "AddPaymentInfo"]);

/** The beacon's `px` mirror props, clamped to what the API accepts. Null for
 *  an event the server does not mirror (it sends the others itself). */
export function pxProps(
  event: string,
  id: string | undefined,
  extra: { content_name?: unknown; content_category?: unknown; value?: unknown; currency?: unknown } = {},
): PxProps | null {
  if (!PX_EVENTS.has(event) || !id) return null;
  const out: PxProps = { e: event, id: id.slice(0, 80) };
  if (typeof extra.content_name === "string" && extra.content_name) out.cn = extra.content_name.slice(0, 120);
  if (typeof extra.content_category === "string" && extra.content_category) out.cc = extra.content_category.slice(0, 40);
  if (typeof extra.value === "number" && Number.isFinite(extra.value)) out.v = extra.value;
  if (extra.currency === "INR" || extra.currency === "USD") out.cur = extra.currency;
  return out;
}

/** A sign-up intent from a click target's href (the cta_click delegate). */
export function isSignupHref(href: string | null | undefined): boolean {
  if (!href) return false;
  return href === "/signup" || href.startsWith("/signup?") || href.startsWith("/signup#");
}
