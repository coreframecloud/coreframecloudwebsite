// Showing the mobile number back on the code screen (15 Nov 2026). Plain TS so tests can import it.
//
// A UK customer typed +44 7944 396988 for his real +44 7944 306988. Five codes
// went to a stranger while /verify showed "xxxxxx6988", the same last four as
// his real number, so he could not see the slip. The code screen now shows the
// WHOLE number (the API's phone_display) with "Wrong number? Change it" beside it.

type CountryLike = { iso: string; dial_code: string };

/** What the code screen shows: the full number, or the masked one from an older API. */
export function shownNumber(s: { phone_display?: string | null; phone_masked?: string | null } | null | undefined): string | null {
  return s?.phone_display || s?.phone_masked || null;
}

/** After this many sends (the first code and two resends) the page says
 *  "Still nothing? Check the number above". */
export const WRONG_NUMBER_HINT_AFTER_SENDS = 3;

export function showWrongNumberHint(sends: number): boolean {
  return sends >= WRONG_NUMBER_HINT_AFTER_SENDS;
}

export const WRONG_NUMBER_HINT = "Still nothing? Check the number above — one wrong digit is the usual cause.";

/**
 * Split "+44 7944 396988" into the dial-code country and the national digits,
 * to prefill the "change number" form. Longest dial code wins ("+1" must not
 * swallow "+1 868"); `preferIso` breaks ties between countries sharing one
 * (GB / Jersey / Guernsey all dial 44). Null for a masked or empty number.
 */
export function splitDisplayNumber<C extends CountryLike>(
  display: string | null | undefined,
  countries: C[],
  preferIso?: string | null,
): { country: C; national: string } | null {
  if (!display || !display.trim().startsWith("+")) return null;
  const digits = display.replace(/\D/g, "");
  if (!digits) return null;
  let best: C[] = [];
  let bestLen = 0;
  for (const c of countries) {
    const d = c.dial_code.replace(/\D/g, "");
    if (!d || !digits.startsWith(d) || d.length < bestLen) continue;
    if (d.length > bestLen) {
      best = [];
      bestLen = d.length;
    }
    best.push(c);
  }
  if (!best.length) return null;
  const want = (preferIso ?? "").toUpperCase();
  const country = best.find((c) => c.iso === want) ?? best[0];
  return { country, national: digits.slice(bestLen) };
}
