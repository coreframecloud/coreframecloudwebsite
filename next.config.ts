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
 * THIS SITE NOW SENDS A CSP, and it still carries 'unsafe-inline' in
 * script-src. That is a decision, not an omission. Two things here need it:
 *
 *   1. Next.js writes its hydration payload into inline <script> tags.
 *   2. GA4 and Microsoft Clarity in app/layout.tsx are inline <Script> blocks
 *      that go on to inject script elements of their own.
 *
 * The fix for both is a per-request nonce from a middleware.ts — and on the
 * App Router, reading that nonce opts the page OUT of static prerendering.
 * Every marketing page here is prerendered today (`x-nextjs-prerender: 1` on
 * the live response), so the real price of removing 'unsafe-inline' from this
 * site is turning the whole marketing site dynamic. That is a trade to make
 * deliberately, with the SEO and TTFB cost measured, not in passing — so it is
 * named here rather than half-done.
 *
 * WHAT THIS STILL BUYS, given that caveat. 'unsafe-inline' means an injected
 * inline script runs. It does not mean everything else does: script-src still
 * refuses a script fetched from an origin not on the list, form-action refuses
 * a form posting anywhere but here, base-uri refuses an injected <base>
 * repointing every relative URL on the page, and object-src closes
 * <object>/<embed>. Before this, the site sent no policy at all and every one
 * of those was open.
 *
 * FOR CONTRAST: control.coreframecloud.com, which serves the customer portal
 * and the admin app, has NO 'unsafe-inline'. nginx serves those pages from
 * disk and stamps a real per-request nonce into each one. This file is only
 * about the marketing site.
 */
const CSP = [
  "default-src 'self'",
  // Read the note above before touching 'unsafe-inline' on this line.
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms https://*.clarity.ms https://va.vercel-scripts.com https://static.cloudflareinsights.com",
  // No 'unsafe-eval' anywhere on purpose: nothing here needs it.
  // static.cloudflareinsights.com is Cloudflare Web Analytics, and it is on
  // this list because a browser against the LIVE site refused it -- Cloudflare
  // injects that beacon at the edge, after Vercel, so it is invisible in the
  // repository and in any local run. Without it the analytics simply stop
  // recording, silently.
  // va.vercel-scripts.com is @vercel/speed-insights' fallback host. On a
  // Vercel deployment it loads from /_vercel/speed-insights/script.js, which
  // is same-origin and needs nothing here; the fallback is what a preview or a
  // non-Vercel environment uses, and leaving it out would mean web-vitals
  // reporting that works in production and not in preview.
  // GA4 does NOT post its hits to google-analytics.com alone. A Chromium run
  // against this exact policy caught it refusing analytics.google.com,
  // stats.g.doubleclick.net and www.google.com/g/collect - three origins that
  // are not obvious from the tag snippet and would have taken every pageview
  // with them, silently, on the first deploy.
  "connect-src 'self' https://control.coreframecloud.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://www.google.com https://*.clarity.ms https://c.bing.com https://va.vercel-scripts.com https://cloudflareinsights.com https://static.cloudflareinsights.com",
  "img-src 'self' data: blob: https:",
  // Next and Tailwind both emit inline <style>. There is no nonce-free way
  // around this one, and its blast radius is far smaller than script's.
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  // The embedded product videos.
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join("; ") + ";";

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
  {
    // same-origin-ALLOW-POPUPS, not same-origin: the Google sign-in flow opens
    // a cross-origin popup and reads its result back through window.opener,
    // which plain same-origin severs. The allow-popups variant still stops a
    // cross-origin page from holding a handle on this one, which is the attack
    // COOP exists for.
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin-allow-popups",
  },
  {
    // same-site, not same-origin: control.coreframecloud.com and
    // studio.coreframecloud.com are siblings and do load from here. What this
    // refuses is a genuinely cross-site page embedding our resources.
    key: "Cross-Origin-Resource-Policy",
    value: "same-site",
  },
  {
    // Deprecated, and 0 is the correct value rather than the absence of the
    // header. The "1; mode=block" this replaces was actively harmful in the
    // browsers that honoured it: the auditor it switched on could be steered
    // into revealing cross-origin content a page at a time (XS-Leaks). Chrome
    // and Firefox removed it entirely; the CSP is the real defence.
    key: "X-XSS-Protection",
    value: "0",
  },
  {
    key: "Content-Security-Policy",
    value: CSP,
  },
  // CROSS-ORIGIN-EMBEDDER-POLICY IS DELIBERATELY ABSENT. Scanners list it as
  // an "upcoming header", which is not a reason to set it: COEP: require-corp
  // refuses every third-party subresource that does not itself send CORP, and
  // exists to unlock SharedArrayBuffer and high-resolution timers. Nothing
  // here uses either, while YouTube embeds, GA4 and Clarity would all have to
  // start sending CORP for the site to keep working.
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
