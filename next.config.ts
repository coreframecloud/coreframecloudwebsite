import type { NextConfig } from "next";
import { STUDIO_CSP } from "./lib/csp";

// The control-plane API origin(s) the browser may call. The production origin
// is ALWAYS allowed; a valid NEXT_PUBLIC_CONTROL_PLANE_API (see lib/api-base.ts
// for what counts as valid) adds its own origin for staging / local testing.
// Unset -> exactly the production policy, unchanged.
// The Content-Security-Policy lives in lib/csp.ts (security review 17 Oct
// 2026): pages rendered by Next get it per request, with a nonce, from
// proxy.ts; the pages Vercel rewrites from the control plane (Studio, the IFC
// and DWG checkers, shared reports) get STUDIO_CSP below. Neither allows
// inline scripts.
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
  // Marketing images the owner hosts on our own R2 bucket (custom domain),
  // e.g. the workstation frames in lib/workstation-frames.ts.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "media.coreframecloud.com" }],
    // 90 for the app screenshots in the workstation card: at the default 75 the
    // small UI text in them goes soft.
    qualities: [75, 90],
    // AVIF first, WebP fallback (16 Oct 2026): the full-bleed page-hero
    // pictures (components/page-hero-bg.tsx) are the LCP element on their
    // pages, and AVIF roughly halves them at the same quality.
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      /**
       * Share cards (26 Oct 2026): public marketing images that other sites and mail apps
       * embed by design (WhatsApp/LinkedIn previews, the sign-up follow-up emails). The
       * catch-all's CORP same-site made mail apps that load images directly (Apple Mail,
       * Outlook) show a broken picture. Only /og/*; everything else keeps same-site.
       * Listed after the catch-all so this value wins.
       */
      { source: "/og/:path*", headers: [{ key: "Cross-Origin-Resource-Policy", value: "cross-origin" }] },
      /**
       * The CFD job page (16 Oct 2026): private to whoever holds the job's link.
       * Never cached, never indexed, and no Referer leaves it (the job token is
       * in the #fragment, which browsers do not send anyway; this is belt and
       * braces for the path). Listed after the catch-all so its Referrer-Policy
       * wins.
       */
      {
        source: "/cfd/jobs/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      /**
       * Studio, the app (16 Oct 2026): its page loads Google Fonts, and it is
       * a signed-in application page -- never cached at the edge, never
       * indexed (it canonicals to /floor-plan-to-render, which should rank).
       */
      {
        source: "/studio",
        headers: [
          { key: "Content-Security-Policy", value: STUDIO_CSP },
          { key: "Cache-Control", value: "private, no-cache, must-revalidate" },
          { key: "X-Robots-Tag", value: "noindex, follow" },
        ],
      },
      {
        source: "/studio/:path*",
        headers: [{ key: "Content-Security-Policy", value: STUDIO_CSP }],
      },
      // The other control-plane pages www rewrites: no inline script either.
      // /tools/render-time is a page of this site (28 Oct 2026) with the
      // nonce CSP from proxy.ts, so it is left out of the control plane's policy.
      ...["/tools", "/tools/:path((?!render-time$).*)", "/dwg-check", "/r/:token"].map((source) => ({
        source,
        headers: [{ key: "Content-Security-Policy", value: STUDIO_CSP }],
      })),
      /**
       * Only www.coreframecloud.com may be indexed (12 Oct 2026). Vercel marks
       * per-commit PREVIEW deployments noindex by itself, but the production
       * aliases on vercel.app (coreframecloudwebsite.vercel.app,
       * coreframe-site.vercel.app) served the whole live site with no
       * X-Robots-Tag at all. The canonical tags point at www, which mostly
       * saves us, but a canonical is a hint and a header is an instruction.
       * The apex is listed so its redirect is never tagged.
       */
      {
        source: "/:path*",
        missing: [{ type: "host", value: "(www\\.)?coreframecloud\\.com" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  async rewrites() {
    return [
      // the checker page and the shared-report view
      { source: "/tools", destination: `${CONTROL_PLANE}/tools` },
      { source: "/tools/:path*", destination: `${CONTROL_PLANE}/tools/:path*` },
      // the free DWG dimension checker. Its API already arrives through the
      // /api/tools/:path* rule below, so only the page needs a rule here.
      { source: "/dwg-check", destination: `${CONTROL_PLANE}/dwg-check` },
      { source: "/r/:token", destination: `${CONTROL_PLANE}/r/:token` },
      // its API. Scoped to /api/tools so nothing else on /api is proxied.
      { source: "/api/tools/:path*", destination: `${CONTROL_PLANE}/api/tools/:path*` },
      // STUDIO IS BACK ON THIS SITE (16 Oct 2026, owner: one account, one
      // sign-in, one dashboard). Only the PAGE and its small static files come
      // through Vercel: the page then calls control.coreframecloud.com/api/
      // studio/* directly with this site's bearer token, so DXF uploads and
      // rendered images still go Cloudflare -> our nginx with no Vercel
      // body-size or proxy-timeout limit (the reason it moved to its own host
      // on 13 Oct). Because the page runs on www's origin it reads the same
      // `cf_customer_token` as every other page here: no second login.
      // studio.coreframecloud.com/studio now 302s back here.
      { source: "/studio", destination: `${CONTROL_PLANE}/studio` },
      { source: "/studio/:path*", destination: `${CONTROL_PLANE}/studio/:path*` },
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
      /**
       * The bring-your-own-licence CFD page is retired (owner, 13 Oct 2026):
       * CFD is the managed duct/pipe service now. Permanent, so its search
       * signal goes to the page that replaced it.
       */
      {
        source: "/ansys-cfd-gpu",
        destination: "/cfd",
        permanent: true,
      },
      /**
       * The CFD page moved from /cfd-intake to /cfd (owner, 13 Oct 2026).
       * Query strings (UTMs on the Instagram bio link, ads) pass through
       * automatically and the browser keeps the #fragment on a 308, so
       * /cfd-intake#sample lands on /cfd#sample. Old sign-in links carrying
       * next=/cfd-intake are mapped to /cfd in lib/return-path.ts.
       */
      {
        source: "/cfd-intake",
        destination: "/cfd",
        permanent: true,
      },
      {
        source: "/cfd-intake/:path*",
        destination: "/cfd/:path*",
        permanent: true,
      },
      {
        source: "/d5-render",
        destination: "/",
        permanent: true,
      },
      /**
       * Short legal URLs (SEO review 18 Oct 2026, T6). Google crawled /terms
       * and got a 404; the page is /terms-of-service. One hop, permanent.
       */
      { source: "/terms", destination: "/terms-of-service", permanent: true },
      { source: "/privacy", destination: "/privacy-policy", permanent: true },
      { source: "/refund", destination: "/refund-policy", permanent: true },

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
      /*
       * The /studio -> studio.coreframecloud.com redirects (13 Oct 2026) are
       * gone: Studio is served at /studio again, see rewrites() above. They
       * were sent with Cache-Control max-age=0, must-revalidate, so browsers
       * revalidate and pick up the change rather than holding the old 308.
       */
    ];
  },
};

export default nextConfig;
