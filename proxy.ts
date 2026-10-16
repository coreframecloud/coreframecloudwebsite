import { NextResponse, type NextRequest } from "next/server";
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
 * `?currency=USD|INR` overrides the country, for testing. A direct hit on
 * /usd/... is redirected to the public URL with ?currency=USD, so the variant
 * paths never become pages of their own.
 */

const PAGES = new Set(["/pricing", "/cfd", "/cfd/mesh-independence-study"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/usd" || pathname.startsWith("/usd/")) {
    const target = request.nextUrl.clone();
    target.pathname = pathname.slice(4) || "/";
    target.searchParams.set("currency", "USD");
    return NextResponse.redirect(target, 307);
  }

  if (!PAGES.has(pathname)) return NextResponse.next();

  const currency =
    parseCurrency(request.nextUrl.searchParams.get("currency")) ??
    currencyForCountry(request.headers.get("cf-ipcountry"));
  if (currency !== "USD") return NextResponse.next();

  const target = request.nextUrl.clone();
  target.pathname = `/usd${pathname}`;
  return NextResponse.rewrite(target);
}

export const config = {
  matcher: ["/pricing", "/cfd", "/cfd/mesh-independence-study", "/usd", "/usd/:path*"],
};
