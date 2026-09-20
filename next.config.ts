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


/**
 * The free IFC pre-CFD checker runs on the control plane, not here.
 *
 * It is standard-library Python holding a whole IFC in memory (~200 MB and ~6 s
 * for a 100 MB model), which is a poor fit for Vercel's serverless limits and a
 * natural fit next to the API, where the supervision and logging already exist.
 *
 * Proxied rather than linked to a subdomain so the tool stays on
 * coreframecloud.com. A free tool whose whole job is to earn trust should not
 * bounce the visitor to a hostname they have to evaluate separately.
 *
 * Returned as a plain ARRAY on purpose. Array rewrites are checked after the
 * filesystem but BEFORE dynamic routes, so `app/[slug]` cannot swallow /tools
 * or /r/:token. In `beforeFiles` they would instead override real pages, which
 * is not what we want.
 *
 * UPLOAD CEILING: Cloudflare caps request bodies at 100 MB on Free and Pro
 * (200 MB on Business) and control.coreframecloud.com is proxied, so an upload
 * above that dies at the edge showing a Cloudflare page rather than our error.
 * The checker therefore refuses at 95 MB and the browser checks the size before
 * sending. Do not raise one limit without the other.
 */
const CONTROL_PLANE = "https://control.coreframecloud.com";

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    return [
      // the checker page and the shared-report view
      { source: "/tools", destination: `${CONTROL_PLANE}/tools` },
      { source: "/tools/:path*", destination: `${CONTROL_PLANE}/tools/:path*` },
      { source: "/r/:token", destination: `${CONTROL_PLANE}/r/:token` },
      // its API. Scoped to /api/tools so nothing else on /api is proxied.
      { source: "/api/tools/:path*", destination: `${CONTROL_PLANE}/api/tools/:path*` },
      // The AI studio MOVED to studio.coreframecloud.com. Its page rewrites are
      // gone -- see redirects() below for where they went and why.
      //
      // These two API rewrites STAY, on purpose and temporarily. A browser tab
      // that was already open on coreframecloud.com/studio when we cut over is
      // still running the old page, and its fetches are relative, so they still
      // arrive here. Redirecting an in-flight POST would lose its body; proxying
      // it keeps that tab working until the person reloads. Delete both once the
      // logs show nothing hitting them.
      { source: "/api/studio/:path*", destination: `${CONTROL_PLANE}/api/studio/:path*` },
      // Studio sign-in. NARROW on purpose: only /api/auth/studio/*, not all of
      // /api/auth/*. The site's own signup calls the control host directly and
      // rewriting every auth route through Vercel would change how that
      // traffic is routed for no reason connected to the Studio.
      //
      // It has to be here at all because the Studio page is PROXIED to this
      // origin by the two rules above, so its relative fetches resolve against
      // www. Without this rule the sign-in call 404s on a page that is
      // otherwise working, which reads as "the code never arrived".
      { source: "/api/auth/studio/:path*", destination: `${CONTROL_PLANE}/api/auth/studio/:path*` },
    ];
  },
  async redirects() {
    return [
      {
        source: "/d5-render",
        destination: "/",
        permanent: true,
      },

      /**
       * Retired app/[slug] stubs. Each was 40-60 words of generic copy on a URL
       * nobody linked to and Google never indexed, competing for the same
       * intent as a real page. Consolidated rather than deleted: a 301 hands
       * whatever little signal they had to the page that deserves it.
       */
      {
        source: "/revit-d5-cloud-workflow",
        destination: "/software/revit-cloud-workstation",
        permanent: true,
      },
      {
        source: "/gpu-rendering-service-india",
        destination: "/software/gpu-workstation-rental-india",
        permanent: true,
      },

      /**
       * ENSCAPE HAD TWO PAGES. /enscape-cloud-gpu (specs, live pricing, FAQ
       * schema) and /software/enscape-cloud-workstation (a short entry in the
       * software list) both targeted "Enscape cloud rendering". Search Console
       * on 20 Sep 2026 showed the outcome of splitting the signal: the thin one
       * indexed at position 39.9, the good one unknown to Google entirely.
       * One URL now, and it is the better page.
       */
      {
        source: "/software/enscape-cloud-workstation",
        destination: "/enscape-cloud-gpu",
        permanent: true,
      },
      /**
       * The Studio now lives on its own host.
       *
       * WHY IT MOVED. It used to be proxied through here, which meant every DXF
       * upload and every rendered PNG travelled Cloudflare -> Vercel -> our own
       * box and back. That is a bandwidth bill and a set of edge limits on
       * request body size and response time that we neither need nor control,
       * for a hop that ends at a server we already own. studio.coreframecloud.com
       * is Cloudflare straight to nginx.
       *
       * PERMANENT, so the move is recorded once in every browser cache and
       * search index rather than re-litigated on every visit. That is also why
       * this cannot be reverted casually: a 301 is cached hard, so unwinding
       * this means serving a 301 back the other way, not just deleting these.
       *
       * BOTH PATHS ARE KEPT ON THE NEW HOST as well, so the destination here is
       * the same path on a different name -- /studio/guide.pdf still resolves,
       * and the link on the home page and anything already posted keeps working.
       *
       * ONE THING THIS DOES COST: sign-in state. The Studio token is in browser
       * storage, which is per-origin, so anyone signed in on coreframecloud.com
       * lands on the new host signed out and has to enter an emailed code once.
       * Their projects are keyed to the account, not the browser, so nothing is
       * lost -- but it will look like a logout to them the first time.
       */
      {
        source: "/studio",
        destination: "https://studio.coreframecloud.com/studio",
        permanent: true,
      },
      {
        source: "/studio/:path*",
        destination: "https://studio.coreframecloud.com/studio/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
