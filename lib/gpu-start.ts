/**
 * GPU: price first, account at "Start" (owner, 10 Nov 2026).
 *
 * Evidence (web_events, 30 days, distinct visitors): catalog_view 945,
 * cta_click 380, signup_view 321, mobile_verified 101, topup_dialog_open 113,
 * payment_started 29, payment_result 26, first_session 17. The card a visitor
 * had picked was lost at sign-up (/signup took no GPU), so they arrived at an
 * empty wallet screen and had to find their way to paying and to Connect.
 *
 * Now the visitor sees every card's price without an account, picks one, and
 * only "Start" asks for sign-up and WhatsApp. The choice is carried as
 * URL-safe, non-personal state (the GPU's public slug and the top-up amount)
 * in the sign-up return path and in this browser's localStorage
 * (`cf_gpu_choice`, essential: it is what the visitor asked for; not cf_vid,
 * no identifier), and they land on the payment step pre-filled
 * (/my-activity?topup=1&gpu=..&amount=..). After payment: /download?gpu=..,
 * with that card shown. Pay-first is unchanged: no GPU time before payment.
 */
import { trackEvent } from "@/lib/analytics";
import { rememberReturnPath } from "@/lib/return-path";
import { isSignedIn } from "@/lib/session";
import { flush as flushWebEvents, track as trackWebEvent } from "@/lib/web-events";

const KEY = "cf_gpu_choice";
const TTL_MS = 24 * 60 * 60 * 1000;
const SLUG_OK = /^[a-z0-9][a-z0-9-]{0,63}$/;

export type GpuChoice = { gpu: string; amount: number | null };

export function cleanSlug(v: string | null | undefined): string | null {
  return v && SLUG_OK.test(v) ? v : null;
}

function cleanAmount(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 && n <= 1_000_000 ? Math.round(n * 100) / 100 : null;
}

/** The payment step, pre-filled. */
export function paymentPath(c: GpuChoice): string {
  const amount = cleanAmount(c.amount);
  return `/my-activity?topup=1&gpu=${encodeURIComponent(c.gpu)}${amount ? `&amount=${amount}` : ""}`;
}

/** After payment: Connect, with the card shown. */
export function downloadPath(gpu: string | null): string {
  const g = cleanSlug(gpu);
  return g ? `/download?gpu=${encodeURIComponent(g)}` : "/download";
}

export function saveGpuChoice(c: GpuChoice): void {
  const gpu = cleanSlug(c.gpu);
  if (!gpu) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ gpu, amount: cleanAmount(c.amount), at: Date.now() }));
  } catch {
    /* storage blocked: the URL still carries it */
  }
}

export function readGpuChoice(): GpuChoice | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as { gpu?: string; amount?: number; at?: number };
    if (!v.at || Date.now() - v.at > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    const gpu = cleanSlug(v.gpu);
    return gpu ? { gpu, amount: cleanAmount(v.amount) } : null;
  } catch {
    return null;
  }
}

export function clearGpuChoice(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}

/**
 * "Start" on a card: signed in, straight to the payment step; signed out,
 * sign-up (email + WhatsApp), which comes back to the payment step.
 */
export function startGpu(c: GpuChoice, where: string): void {
  const gpu = cleanSlug(c.gpu);
  if (!gpu) return;
  const choice = { gpu, amount: cleanAmount(c.amount) };
  saveGpuChoice(choice);
  trackWebEvent("session_launch_click", { gpu, where });
  flushWebEvents();
  const pay = paymentPath(choice);
  if (isSignedIn()) {
    window.location.assign(pay);
    return;
  }
  trackEvent("signup_click", { location: where, label: "Start", gpu });
  rememberReturnPath(pay);
  window.location.assign(`/signup?next=${encodeURIComponent(pay)}`);
}
