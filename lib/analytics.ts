"use client";

type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(
  eventName: string,
  params: EventParams = {}
): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("event", eventName, params);
}

export function trackClarityEvent(tag: string): void {
  if (typeof window === "undefined") return;
  if (typeof window.clarity !== "function") return;

  window.clarity("event", tag);
}

/* ──────────────────────────────────────────────────────────────────────────
 * CONVERSIONS — the events an ad platform is allowed to optimise for.
 *
 * Everything above is a behaviour event: signup_click, nav_click and friends
 * say what someone pressed, not what they became. Google Ads was counting
 * ~196 "Sign-ups" a week off events like that, which is a button, not an
 * account. The three below fire ONLY on an outcome the server confirmed:
 *
 *   sign_up        -> Meta CompleteRegistration  an account row was created
 *   generate_lead  -> Meta Contact               a WhatsApp chat was opened
 *   purchase       -> Meta Purchase              /payments/verify said paid
 *
 * Each goes to GA4 (recommended event names, so they can be marked as key
 * events and imported into Google Ads), to the Meta pixel when it is loaded,
 * and straight to Google Ads when a conversion label for it is configured.
 * Every sink is optional: an ad blocker or an unset env var means that sink
 * silently gets nothing, and the page never breaks for it.
 *
 * NEXT_PUBLIC_* values are inlined at build time, which only works for a
 * literal `process.env.NEXT_PUBLIC_X` — so these are spelled out, not looked
 * up by a computed key.
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * first_topup (12 Oct 2026): the FIRST paid wallet top-up (the intro offer).
 * It fires alongside `purchase`, never instead of it, so revenue is not double
 * counted in GA4 (first_topup carries no value there). It is the conversion a
 * Google Ads search campaign should bid on: a sign-up costs nothing to make,
 * the first top-up is the moment someone became a customer.
 */
export type ConversionName = "sign_up" | "generate_lead" | "purchase" | "first_topup";

// first_topup has no Meta standard event; the Purchase that fires with it
// already reaches Meta.
const META_EVENT: Record<ConversionName, string | null> = {
  sign_up: "CompleteRegistration",
  generate_lead: "Contact",
  purchase: "Purchase",
  first_topup: null,
};

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const GOOGLE_ADS_LABEL: Record<ConversionName, string | undefined> = {
  sign_up: process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_SIGNUP,
  generate_lead: process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_LEAD,
  purchase: process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_PURCHASE,
  first_topup: process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_FIRST_TOPUP,
};

export interface ConversionParams {
  /** Rupees. Required for purchase; omitted elsewhere. */
  value?: number;
  /** Defaults to INR whenever a value is given. */
  currency?: string;
  /** A stable id for this exact conversion (a payment id). Deduplicates
   *  across GA4, Google Ads and Meta if the same event fires twice. */
  transaction_id?: string;
  /** sign_up only: "magic_link", "email_code", ... */
  method?: string;
  /** Where on the site it happened. GA4 only; Meta has no use for it. */
  location?: string;
  /** Meta eventID, when the conversion has no payment id. The server-side
   *  Conversions API must send the SAME id for Meta to deduplicate:
   *  sign-up = `signup_<user id>`, purchase = the Razorpay payment id. */
  event_id?: string;
}

export function trackConversion(name: ConversionName, params: ConversionParams = {}): void {
  if (typeof window === "undefined") return;

  const money: { value?: number; currency?: string } =
    typeof params.value === "number" && Number.isFinite(params.value)
      ? { value: params.value, currency: params.currency ?? "INR" }
      : {};

  // GA4 — recommended event names, so GA reports and Ads imports know them.
  // first_topup goes to GA4 without a value: the purchase beside it carries
  // the revenue, and GA4 would otherwise count the same rupees twice.
  const ga4Money = name === "first_topup" ? {} : money;
  trackEvent(name, {
    ...ga4Money,
    transaction_id: params.transaction_id,
    method: params.method,
    location: params.location,
  });

  // A plain dataLayer event as well, for a Google Tag Manager container if
  // one is ever added (GTM triggers listen for `event` keys, not gtag calls).
  // No PII: the only identifier is the payment id.
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: `cf_${name}`,
      cf_conversion: name,
      ...money,
      transaction_id: params.transaction_id,
      method: params.method,
      location: params.location,
    });
  } catch {
    // never let analytics break the page
  }

  // Google Ads — only when an AW- id AND a label for this conversion exist.
  // Without a label, import the GA4 key event in Google Ads instead.
  const label = GOOGLE_ADS_LABEL[name];
  if (GOOGLE_ADS_ID && label && typeof window.gtag === "function") {
    window.gtag("event", "conversion", {
      send_to: `${GOOGLE_ADS_ID}/${label}`,
      ...money,
      transaction_id: params.transaction_id,
    });
  }

  // Meta pixel — standard events. eventID lets Meta dedupe a later
  // server-side (Conversions API) copy of the same purchase.
  // A WhatsApp tap stays Meta "Contact" (the event existing custom
  // conversions are built on); a submitted form is a "Lead".
  const metaEvent =
    name === "generate_lead" && params.method && params.method !== "whatsapp"
      ? "Lead"
      : META_EVENT[name];
  if (metaEvent && typeof window.fbq === "function") {
    const metaParams: Record<string, string | number> = {};
    if (money.value !== undefined) {
      metaParams.value = money.value;
      metaParams.currency = money.currency ?? "INR";
    }
    if (name === "sign_up") metaParams.status = "registered";
    window.fbq(
      "track",
      metaEvent,
      metaParams,
      params.event_id ?? params.transaction_id
        ? { eventID: params.event_id ?? params.transaction_id }
        : undefined,
    );
  }

  trackClarityEvent(`conversion_${name}`);
}

/* ── WhatsApp leads ─────────────────────────────────────────────────────────
 * Every WhatsApp entry point on the site, whatever builds the URL. Anchors are
 * caught centrally by components/analytics/whatsapp-click-tracker.tsx; code
 * that opens WhatsApp with window.open calls trackWhatsAppLead itself. */

const WHATSAPP_URL = /^(https?:\/\/)?(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com|(www\.)?whatsapp\.com\/send)|^whatsapp:/i;

export function isWhatsAppUrl(href: string | null | undefined): boolean {
  return Boolean(href && WHATSAPP_URL.test(href.trim()));
}

export function trackWhatsAppLead(location: string): void {
  trackConversion("generate_lead", { location, method: "whatsapp" });
}

/* ── Sign-up completion ─────────────────────────────────────────────────────
 * The account is created by the control plane when a NEW person's magic link
 * is redeemed (/auth/verify-magic-link, the branch that calls
 * _create_org_and_user). The response carries no "this was new" flag today,
 * so the browser remembers that it asked for a new account (the details step
 * of the sign-up form) and fires sign_up when that same email's link is
 * redeemed. If the API ever adds `is_new_user: true` to the auth response it
 * is honoured as well, which also covers Google sign-ups and a link opened on
 * a different device.
 *
 * Fires at most once per account per browser. */

const PENDING_SIGNUP_KEY = "cf_pending_signup";
const TRACKED_SIGNUP_KEY = "cf_signup_tracked";
const PENDING_SIGNUP_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function markPendingSignup(email: string): void {
  try {
    localStorage.setItem(
      PENDING_SIGNUP_KEY,
      JSON.stringify({ email: email.trim().toLowerCase(), at: Date.now() }),
    );
  } catch {
    // storage blocked: the signup still works, it just is not counted
  }
}

export function trackSignupIfNew(
  data: { is_new_user?: boolean; user?: { id?: number | string; email?: string } | null },
  method: string,
): void {
  try {
    const email = data.user?.email?.trim().toLowerCase();
    const id = data.user?.id != null ? String(data.user.id) : email;
    if (!id) return;

    let pendingMatches = false;
    const raw = localStorage.getItem(PENDING_SIGNUP_KEY);
    if (raw) {
      const pending = JSON.parse(raw) as { email?: string; at?: number };
      const fresh = typeof pending.at === "number" && Date.now() - pending.at < PENDING_SIGNUP_MAX_AGE_MS;
      pendingMatches = fresh && !!email && pending.email === email;
      if (pendingMatches || !fresh) localStorage.removeItem(PENDING_SIGNUP_KEY);
    }

    if (!(data.is_new_user === true || pendingMatches)) return;
    if (localStorage.getItem(TRACKED_SIGNUP_KEY) === id) return;
    localStorage.setItem(TRACKED_SIGNUP_KEY, id);

    trackConversion("sign_up", {
      method,
      // Only a numeric/opaque account id, never the email (the fallback id).
      event_id: data.user?.id != null ? `signup_${data.user.id}` : undefined,
    });
  } catch {
    // never let analytics break a sign-in
  }
}

/* ── ViewContent ────────────────────────────────────────────────────────────
 * One per product landing page view, so Meta can build "viewed the D5 page"
 * audiences and optimise toward people who read a product page, and GA4 gets
 * the matching recommended `view_item`. No value: viewing is not revenue. */
export function trackViewContent(contentName: string, contentCategory: string): void {
  if (typeof window === "undefined") return;
  trackEvent("view_item", { item_name: contentName, item_category: contentCategory });
  if (typeof window.fbq === "function") {
    window.fbq("track", "ViewContent", {
      content_name: contentName,
      content_category: contentCategory,
      content_type: "product",
    });
  }
}
