import { NextResponse, type NextRequest } from "next/server";
import { newNonce, pageCsp } from "@/lib/csp";
import { currencyForCountry, parseCurrency } from "@/lib/money";

/**
 * Visitor currency for /pricing, /cfd and /cfd/mesh-independence-study — DISPLAY ONLY (owner, 15 Oct 2026).
 *
 * A visitor whose Cloudflare CF-IPCountry is anything but India (absent, "XX"
 * and "T1" count as India) is shown the US-dollar prices. What a customer is
 * CHARGED never depends on this: account currency is fixed at sign-up from
 * the billing country, and the top-up dialog reads it from the API.
 *
 * WHY A REWRITE, NOT headers() IN THE PAGE. Both pages are prerendered and
 * served from Vercel's cache (`x-nextjs-prerender: 1`). Reading headers() in
 * the page would make every request render on the server. Instead this proxy
 * rewrites a USD visitor to a second prerendered copy at /usd/<page>; the URL
 * in the browser stays /pricing or /cfd, both copies stay static and ISR, and
 * the proxy is the only per-request work. Cloudflare does not cache these HTML
 * responses (cf-cache-status: DYNAMIC), so one URL serving two variants is
 * safe; if a Cloudflare "cache everything" rule is ever added for them, it must
 * key on the country.
 *
 * SEO (18 Oct 2026, T2): crawlers crawl from the US and so read the USD copy.
 * Every price sentence on these pages now carries BOTH currencies and the
 * structured data has an INR Offer (India) and a USD Offer (elsewhere) on both
 * copies, so what is indexed does not depend on where the crawler is. (A
 * `Vary: CF-IPCountry` header was tried and dropped: Next's renderer writes
 * its own Vary on these pages and replaces anything set here or in
 * next.config.ts headers().)
 *
 * `?currency=USD|INR` overrides the country, for testing. A direct hit on
 * /usd/... is redirected to the public URL with ?currency=USD, so the variant
 * paths never become pages of their own.
 */

const PAGES = new Set(["/pricing", "/cfd", "/cfd/mesh-independence-study"]);

/**
 * EVERY PAGE GETS A NONCE CSP (security review 17 Oct 2026, #3; lib/csp.ts).
 * The nonce goes on the request (Next reads it from the CSP request header and
 * stamps its own inline scripts; app/layout.tsx reads x-nonce for the tags)
 * and the policy on the response. A response without our CSP would be one
 * where an injected inline script runs, so every exit path below carries it.
 */
function withCsp(request: NextRequest): { headers: Headers; csp: string } {
  const nonce = newNonce();
  const csp = pageCsp(nonce);
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  return { headers, csp };
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/usd" || pathname.startsWith("/usd/")) {
    const target = request.nextUrl.clone();
    target.pathname = pathname.slice(4) || "/";
    target.searchParams.set("currency", "USD");
    return NextResponse.redirect(target, 307);
  }

  const { headers, csp } = withCsp(request);
  let response: NextResponse;
  const currency = PAGES.has(pathname)
    ? (parseCurrency(request.nextUrl.searchParams.get("currency")) ??
      currencyForCountry(request.headers.get("cf-ipcountry")))
    : null;
  if (currency === "USD") {
    const target = request.nextUrl.clone();
    target.pathname = `/usd${pathname}`;
    response = NextResponse.rewrite(target, { request: { headers } });
  } else {
    response = NextResponse.next({ request: { headers } });
  }
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    /*
     * Every page. Not: API routes, Next's static files and images, /studio
     * (rewritten from the control plane, its own policy in next.config.ts),
     * the IFC checker and report rewrites, and anything with a file
     * extension (robots.txt, sitemap.xml, images, fonts).
     */
    {
      source:
        "/((?!api/|_next/static|_next/image|studio|tools|r/|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
