/**
 * The website's Content-Security-Policy (security review 17 Oct 2026, #3).
 *
 * NO 'unsafe-inline' FOR SCRIPTS ANY MORE. Every page carries a per-request
 * nonce (proxy.ts). Next.js stamps it on its own inline hydration scripts and
 * bundles, app/layout.tsx puts it on the Google tag, the Meta pixel and
 * Clarity, and 'strict-dynamic' lets the scripts those load (gtag.js,
 * fbevents.js, the Clarity tag, Razorpay's checkout, Vercel's insights) run
 * because a nonce'd script created them. An injected inline script, or a
 * <script src> an attacker writes into the page, has no nonce and is refused.
 *
 * THE PRICE, CHOSEN DELIBERATELY (owner, 17 Oct 2026: "let's close it"):
 * reading the nonce makes every page render per request instead of being
 * prerendered (see node_modules/next/dist/docs/01-app/02-guides/
 * content-security-policy.md). Measure TTFB and Lighthouse after deploy.
 *
 * The host lists stay for browsers that do not understand 'strict-dynamic'
 * (they ignore the nonce-less fallback otherwise); modern browsers ignore
 * host lists when 'strict-dynamic' is present.
 *
 * /studio is the one page that is NOT rendered by Next (Vercel rewrites it
 * from the control plane), so it cannot carry this nonce. It has no inline
 * script at all any more (its code is /studio/app.js), and gets STUDIO_CSP
 * from next.config.ts: script-src 'self' plus the listed hosts, no inline.
 */
import { PRODUCTION_API_BASE, apiOrigin, resolveApiBase } from "./api-base";

const API_ORIGINS = Array.from(
  new Set([
    apiOrigin(PRODUCTION_API_BASE),
    apiOrigin(resolveApiBase(process.env.NEXT_PUBLIC_CONTROL_PLANE_API, process.env.NODE_ENV)),
  ]),
).join(" ");

const SCRIPT_HOSTS =
  "https://www.googletagmanager.com https://www.clarity.ms https://*.clarity.ms " +
  "https://va.vercel-scripts.com https://static.cloudflareinsights.com " +
  "https://checkout.razorpay.com https://cdn.razorpay.com https://connect.facebook.net";

const REST = [
  `connect-src 'self' ${API_ORIGINS} https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://www.google.com https://*.clarity.ms https://c.bing.com https://va.vercel-scripts.com https://cloudflareinsights.com https://static.cloudflareinsights.com https://api.razorpay.com https://lumberjack.razorpay.com https://lumberjack-cx.razorpay.com https://www.facebook.com https://connect.facebook.net https://googleads.g.doubleclick.net https://www.googleadservices.com`,
  "img-src 'self' data: blob: https:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data: https://cdn.razorpay.com",
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://api.razorpay.com https://checkout.razorpay.com https://www.facebook.com https://td.doubleclick.net",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self' https://www.facebook.com",
];

/** The policy for a page rendered by Next, with this request's nonce. */
export function pageCsp(nonce: string, isDev = process.env.NODE_ENV === "development"): string {
  const script =
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${SCRIPT_HOSTS}` + (isDev ? " 'unsafe-eval'" : "");
  return ["default-src 'self'", script, ...REST].join("; ") + ";";
}

/** /studio: no nonce available (not rendered by Next) and no inline script needed. */
export const STUDIO_CSP =
  ["default-src 'self'", `script-src 'self' ${SCRIPT_HOSTS}`, ...REST]
    .join("; ")
    .replace("style-src 'self' 'unsafe-inline'", "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com")
    .replace("font-src 'self' data:", "font-src 'self' data: https://fonts.gstatic.com") + ";";

/** A fresh, unguessable nonce (128 bits, base64). */
export function newNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
