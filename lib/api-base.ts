/**
 * The ONE place the site learns where the control-plane API lives.
 *
 * Every page used to carry its own copy of "https://control.coreframecloud.com/api".
 * Pointing the site at a staging or local control plane meant editing a dozen
 * files. Now it is one env var:
 *
 *   NEXT_PUBLIC_CONTROL_PLANE_API=https://staging.example.com/api
 *
 * Unset, empty or invalid -> the production API, exactly as before. So this is
 * not a security change: a production build with no env var behaves identically.
 *
 * Accepted values:
 *   - any https:// URL
 *   - http://localhost[:port] or http://127.0.0.1[:port], ONLY when NODE_ENV is
 *     not "production" (i.e. `next dev`). `next build` always sets production,
 *     so a built site can never be pointed at plain http.
 * Anything else silently falls back to production.
 *
 * Kept free of imports so next.config.ts can use it to build the CSP
 * connect-src from the same value.
 */

export const PRODUCTION_API_BASE = "https://control.coreframecloud.com/api";

export function resolveApiBase(raw: string | undefined, nodeEnv: string | undefined): string {
  const value = (raw ?? "").trim();
  if (!value) return PRODUCTION_API_BASE;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return PRODUCTION_API_BASE;
  }
  // No credentials, query or fragment in a base URL.
  if (url.username || url.password || url.search || url.hash) return PRODUCTION_API_BASE;
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  const ok =
    url.protocol === "https:" ||
    (url.protocol === "http:" && isLocal && nodeEnv !== "production");
  if (!ok) return PRODUCTION_API_BASE;
  return (url.origin + url.pathname).replace(/\/+$/, "");
}

/** Origin of an API base, for CSP connect-src. */
export function apiOrigin(base: string): string {
  return new URL(base).origin;
}

// process.env.NEXT_PUBLIC_CONTROL_PLANE_API must be written out literally so
// Next inlines it into client bundles.
export const API_BASE = resolveApiBase(
  process.env.NEXT_PUBLIC_CONTROL_PLANE_API,
  process.env.NODE_ENV,
);
