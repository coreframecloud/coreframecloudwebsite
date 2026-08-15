/**
 * Signup validation — the browser half.
 *
 * Deliberately mirrors app/services/contact_validation.py on the server. The
 * server is the gate (this can be bypassed with curl); this exists so a
 * customer learns about a typo while their hands are still on the keyboard,
 * not after a round trip.
 *
 * The country list is fetched from GET /auth/countries so the picker and the
 * validator cannot drift apart; COUNTRIES below is only the offline fallback
 * for when that call fails.
 */

export type Country = {
  dial_code: string;
  country: string;
  lengths: number[];
};

/** Fallback only — the live list comes from the API. India first. */
export const COUNTRIES: Country[] = [
  { dial_code: "91", country: "India", lengths: [10] },
  { dial_code: "1", country: "United States / Canada", lengths: [10] },
  { dial_code: "44", country: "United Kingdom", lengths: [10] },
  { dial_code: "61", country: "Australia", lengths: [9] },
  { dial_code: "65", country: "Singapore", lengths: [8] },
  { dial_code: "971", country: "United Arab Emirates", lengths: [9] },
  { dial_code: "966", country: "Saudi Arabia", lengths: [9] },
  { dial_code: "60", country: "Malaysia", lengths: [9, 10] },
  { dial_code: "49", country: "Germany", lengths: [10, 11] },
  { dial_code: "33", country: "France", lengths: [9] },
  { dial_code: "31", country: "Netherlands", lengths: [9] },
  { dial_code: "27", country: "South Africa", lengths: [9] },
];

const INDIA_MOBILE_FIRST = ["6", "7", "8", "9"];

export type Validation = { ok: true; value: string } | { ok: false; error: string };

/** Digits only — what the length rules are actually counted against. */
export function digitsOnly(input: string): string {
  return (input || "").replace(/\D/g, "");
}

export function validatePhone(raw: string, country: Country): Validation {
  const national = digitsOnly(raw).replace(/^0+/, "");

  if (!national) return { ok: false, error: "Mobile number is required." };

  if (!country.lengths.includes(national.length)) {
    const expected = country.lengths.join(" or ");
    return {
      ok: false,
      error: `A ${country.country} number needs ${expected} digits — you have entered ${national.length}.`,
    };
  }

  // An OTP sent to a landline never arrives, and the customer has no way to
  // know why. Catch it at the field instead.
  if (country.dial_code === "91" && !INDIA_MOBILE_FIRST.includes(national[0])) {
    return {
      ok: false,
      error: "Enter a mobile number (starting 6, 7, 8 or 9) — we send a one-time code.",
    };
  }

  return { ok: true, value: `+${country.dial_code}${national}` };
}

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const GSTIN_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const VALID_STATE_CODES = new Set<string>([
  ...Array.from({ length: 38 }, (_, i) => String(i + 1).padStart(2, "0")),
  "97",
  "99",
]);

/**
 * The 15th character is a check digit over the first 14. The regex only proves
 * the shape, so a single mistyped character sails through it — this is what
 * catches that, before the GST register rejects it mid-verification and the
 * customer concludes we are broken.
 */
export function gstinChecksumOk(gstin: string): boolean {
  if (gstin.length !== 15) return false;
  let factor = 2;
  let total = 0;
  const modulus = GSTIN_ALPHABET.length; // 36

  for (let i = 13; i >= 0; i--) {
    const position = GSTIN_ALPHABET.indexOf(gstin[i]);
    if (position < 0) return false;
    const product = position * factor;
    factor = factor === 2 ? 1 : 2;
    total += Math.floor(product / modulus) + (product % modulus);
  }
  const expected = GSTIN_ALPHABET[(modulus - (total % modulus)) % modulus];
  return expected === gstin[14];
}

export function validateGstin(raw: string): Validation {
  const value = (raw || "").replace(/\s/g, "").toUpperCase();

  if (!value) return { ok: false, error: "GSTIN is required for a business account." };
  if (value.length !== 15) {
    return { ok: false, error: `A GSTIN is 15 characters — you have entered ${value.length}.` };
  }
  if (!GSTIN_RE.test(value)) {
    return {
      ok: false,
      error:
        "That does not look like a GSTIN. Format: 2 digits (state), 10 characters (PAN), 1 digit, 'Z', 1 check character.",
    };
  }
  if (!VALID_STATE_CODES.has(value.slice(0, 2))) {
    return { ok: false, error: `'${value.slice(0, 2)}' is not a valid GST state code.` };
  }
  if (!gstinChecksumOk(value)) {
    return {
      ok: false,
      error: "That GSTIN's check digit does not match — please re-read it from your certificate.",
    };
  }
  return { ok: true, value };
}

export async function fetchCountries(apiBase: string): Promise<Country[]> {
  try {
    const res = await fetch(`${apiBase}/auth/countries`);
    if (!res.ok) return COUNTRIES;
    const data = await res.json();
    return Array.isArray(data?.countries) && data.countries.length ? data.countries : COUNTRIES;
  } catch {
    return COUNTRIES;
  }
}
