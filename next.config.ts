import type { NextConfig } from "next";

/**
 * Security headers.
 *
 * These live here and not in the control plane's nginx.conf, which is the whole
 * point: this site is served by Vercel and nginx never sees a single request to
 * it. The control plane was fully hardened while this — the site that actually
 * holds a customer's access token in browser storage, runs the Razorpay
 * checkout and carries the DigiLocker verification flow — was sending no
 * security headers whatsoever.
 *
 * Deliberately NOT setting Content-Security-Policy yet. Next.js injects inline
 * scripts for hydration, so a CSP without a per-request nonce blanks the site,
 * and Razorpay's checkout pulls in further origins. Doing it properly means
 * nonces via middleware and testing the payment flow end to end — real work,
 * named here rather than half-done. Everything that does NOT need that is set
 * below, because CSP being hard is no reason to ship none of the rest.
 */
const securityHeaders = [
  {
    // Two years, and tell browsers to use HTTPS before the first request is
    // ever made. Vercel terminates TLS, so this is accurate here.
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // Stops a browser from second-guessing a Content-Type and executing a
    // response we served as data.
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Clickjacking. The site is never legitimately framed; it does the
    // framing (Razorpay), which this does not affect.
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Send the full URL only to ourselves. A verification or magic-link URL
    // must not leak to a third party through the Referer header.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      {
        source: "/d5-render",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
