import { NextResponse, type NextRequest } from "next/server";
import { newNonce, pageCsp } from "@/lib/csp";
import { CURRENCY_HEADER, currencyForCountry, parseCurrency } from "@/lib/money";

/**
 * Visitor currency — DISPLAY ONLY (owner, 15 Oct 2026).
 *
 * A visitor whose Cloudflare CF-IPCountry is anything but India (absent, "XX"
 * and "T1" count as India) is shown the US-dollar prices. What a customer is
 * CHARGED never depends on this: account currency is fixed at sign-up from
 * the billing country, and the top-up dialog reads it from the API.
 *
 * ONE CURRENCY PER VISITOR (owner, 18 Oct 2026): "for Indian users, only
 * Indian prices should be there, even the meter, even the GPU rates and
 * everything. And for a foreign customer, they should show it in dollars."
 * Every customer-visible price on a page is in the visitor's currency only:
 * no "$x outside India" beside a rupee price, no "₹x in India" on the dollar
 * copy, no two-currency table. (This replaces the 18 Oct SEO pass that put
 * both currencies in every price sentence so US-based crawlers would read
 * rupee prices.) Legal pages state the currency rules for everyone and are
 * the exception. The structured data keeps an INR Offer (India) and a USD
 * Offer (elsewhere) on both copies, since it is invisible and describes real
 * regional pricing; its TEXT fields (descriptions, FAQ and HowTo text) follow
 * the page's currency, as they must match what is visible.
 *
 * WHY A REWRITE, NOT headers() IN THE PAGE. Each priced page in PAGES is
 * rendered from a view component twice: the public route in rupees and
 * app/usd/<route> in dollars. This proxy rewrites a USD visitor to the
 * /usd copy; the URL in the browser stays the public one, and so does the
 * canonical. (Since the nonce CSP of 17 Oct every page renders per request
 * anyway, but the pages themselves stay free of request APIs.) Cloudflare does
 * not cache these HTML responses (cf-cache-status: DYNAMIC), so one URL
 * serving two variants is safe; if a Cloudflare "cache everything" rule is
 * ever added for them, it must key on the country. (A `Vary: CF-IPCountry`
 * header was tried and dropped: Next's renderer writes its own Vary on these
 * pages and replaces anything set here or in next.config.ts headers().)
 *
 * THE SITE CHROME (the intro-offer strip, the footer's tax line, the
 * layout's structured-data text) is in the root layout, which both copies
 * share, so it cannot be split by route. The proxy hands it the same
 * decision as the request header `x-cf-currency` (lib/display-currency.ts),
 * on every page, always overwritten so a client cannot set it.
 *
 * SEO: Googlebot and most crawlers crawl from the US and so index the dollar
 * copy. Accepted by the owner; do not work around it with visible dual prices.
 *
 * `?currency=USD|INR` overrides the country, for testing. A direct hit on
 * /usd/... is redirected to the public URL with ?currency=USD, so the variant
 * paths never become pages of their own (and they are not in the sitemap).
 */

const PAGES = new Set([
  "/",
  "/pricing",
  "/cfd",
  "/cfd/mesh-independence-study",
  "/cfd/room-airflow-hvac",
  "/cfd/hvac-simulation",
  "/floor-plan-to-render",
  "/floor-plan-to-render/3bhk-example",
  "/enterprise",
  "/about",
  "/links",
  "/compute-nodes",
  "/lumion-cloud-gpu",
  "/enscape-cloud-gpu",
  "/d5-render-cloud-workstation",
  "/d5-render-vs-local-gpu",
  "/coreframe-vs-irender",
  "/vram-for-architectural-rendering",
  "/cloud-rendering-for-architects",
  "/architectural-visualization",
  "/cloud-workstation-vs-render-farm",
  // The sign-up page quotes the intro offer and the hourly rate (18 Oct 2026).
  "/signup",
]);

/** Dynamic routes with a /usd copy: exactly one segment after the prefix, so
 *  a nested file route (/blog/<slug>/opengraph-image) is never rewritten. */
const PAGE_PATTERNS = [/^\/software\/[^/]+$/, /^\/blog\/[^/]+$/];

function hasUsdCopy(pathname: string): boolean {
  return PAGES.has(pathname) || PAGE_PATTERNS.some((re) => re.test(pathname));
}

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
  const currency =
    parseCurrency(request.nextUrl.searchParams.get("currency")) ??
    currencyForCountry(request.headers.get("cf-ipcountry"));
  headers.set(CURRENCY_HEADER, currency);
  if (currency === "USD" && hasUsdCopy(pathname)) {
    const target = request.nextUrl.clone();
    target.pathname = pathname === "/" ? "/usd" : `/usd${pathname}`;
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
