import { headers } from "next/headers";
import { CURRENCY_HEADER, parseCurrency, type Currency } from "@/lib/money";

/**
 * The visitor's display currency, for the ROOT LAYOUT only (the intro-offer
 * strip, the footer's tax line, the layout's structured-data text).
 *
 * proxy.ts decides it once per request (?currency= override, else
 * CF-IPCountry) and sets this request header on every page, overwriting
 * anything the client sent. Pages do not read it: a priced page is rendered
 * twice from a view component, the public route in rupees and app/usd/<route>
 * in dollars, and the proxy rewrites to the right one. The layout is shared by
 * both copies, so it is the one place that has to ask the request.
 *
 * DISPLAY ONLY, like everything visitor-currency (lib/money.ts): what an
 * account is charged is its own currency, fixed at sign-up.
 */
export async function requestCurrency(): Promise<Currency> {
  return parseCurrency((await headers()).get(CURRENCY_HEADER)) ?? "INR";
}
