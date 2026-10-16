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
  /** ISO-3166 alpha-2, e.g. "IN". */
  iso: string;
  dial_code: string;
  country: string;
  lengths: number[];
};

/**
 * Every country, India first, with its ISO-3166 alpha-2 code and dial code.
 * Paid-first onboarding (10 Oct 2026) opened sign-up to international
 * customers, and the control plane's /auth/countries listed only India while
 * KYC ran on DigiLocker. Since 10 Oct 2026 the signup pickers use the API's
 * own list (fetchCountries / countriesFromApi: every country the API accepts,
 * 243 in payment mode); this table is the OFFLINE FALLBACK, and the base an
 * older API without ISO codes is merged over (mergeCountries).
 *
 * `iso` is what the API stores as `country_code`; it is also the <option>
 * value, because dial codes are shared (+1 is the US and Canada, +7 Russia and
 * Kazakhstan). `lengths` empty means "no national rule known here": any
 * 4-14 digit national number is accepted in the browser and the server decides.
 */
const KNOWN_LENGTHS: Record<string, number[]> = {
  "91": [10], "1": [10], "44": [10], "61": [9], "65": [8], "971": [9],
  "966": [9], "60": [9, 10], "49": [10, 11], "33": [9], "31": [9], "27": [9],
};

const COUNTRY_TABLE: [iso: string, name: string, dial: string][] = [
  ["IN", "India", "91"], ["US", "United States", "1"], ["CA", "Canada", "1"],
  ["GB", "United Kingdom", "44"], ["AE", "United Arab Emirates", "971"],
  ["AU", "Australia", "61"], ["SG", "Singapore", "65"], ["SA", "Saudi Arabia", "966"],
  ["QA", "Qatar", "974"], ["OM", "Oman", "968"], ["KW", "Kuwait", "965"],
  ["BH", "Bahrain", "973"], ["NP", "Nepal", "977"], ["BD", "Bangladesh", "880"],
  ["LK", "Sri Lanka", "94"], ["MV", "Maldives", "960"], ["BT", "Bhutan", "975"],
  ["NZ", "New Zealand", "64"], ["MY", "Malaysia", "60"], ["DE", "Germany", "49"],
  ["FR", "France", "33"], ["NL", "Netherlands", "31"], ["ZA", "South Africa", "27"],
  ["AF", "Afghanistan", "93"], ["AL", "Albania", "355"], ["DZ", "Algeria", "213"],
  ["AD", "Andorra", "376"], ["AO", "Angola", "244"], ["AR", "Argentina", "54"],
  ["AM", "Armenia", "374"], ["AW", "Aruba", "297"], ["AT", "Austria", "43"],
  ["AZ", "Azerbaijan", "994"], ["BY", "Belarus", "375"], ["BE", "Belgium", "32"],
  ["BZ", "Belize", "501"], ["BJ", "Benin", "229"], ["BO", "Bolivia", "591"],
  ["BA", "Bosnia and Herzegovina", "387"], ["BW", "Botswana", "267"], ["BR", "Brazil", "55"],
  ["BN", "Brunei", "673"], ["BG", "Bulgaria", "359"], ["BF", "Burkina Faso", "226"],
  ["BI", "Burundi", "257"], ["KH", "Cambodia", "855"], ["CM", "Cameroon", "237"],
  ["CV", "Cape Verde", "238"], ["CF", "Central African Republic", "236"],
  ["TD", "Chad", "235"], ["CL", "Chile", "56"], ["CN", "China", "86"],
  ["CO", "Colombia", "57"], ["KM", "Comoros", "269"], ["CG", "Congo", "242"],
  ["CD", "Congo (DRC)", "243"], ["CR", "Costa Rica", "506"], ["CI", "Cote d'Ivoire", "225"],
  ["HR", "Croatia", "385"], ["CU", "Cuba", "53"], ["CY", "Cyprus", "357"],
  ["CZ", "Czechia", "420"], ["DK", "Denmark", "45"], ["DJ", "Djibouti", "253"],
  ["EC", "Ecuador", "593"], ["EG", "Egypt", "20"], ["SV", "El Salvador", "503"],
  ["GQ", "Equatorial Guinea", "240"], ["ER", "Eritrea", "291"], ["EE", "Estonia", "372"],
  ["SZ", "Eswatini", "268"], ["ET", "Ethiopia", "251"], ["FJ", "Fiji", "679"],
  ["FI", "Finland", "358"], ["GA", "Gabon", "241"], ["GM", "Gambia", "220"],
  ["GE", "Georgia", "995"], ["GH", "Ghana", "233"], ["GR", "Greece", "30"],
  ["GT", "Guatemala", "502"], ["GN", "Guinea", "224"], ["GW", "Guinea-Bissau", "245"],
  ["GY", "Guyana", "592"], ["HT", "Haiti", "509"], ["HN", "Honduras", "504"],
  ["HK", "Hong Kong", "852"], ["HU", "Hungary", "36"], ["IS", "Iceland", "354"],
  ["ID", "Indonesia", "62"], ["IR", "Iran", "98"], ["IQ", "Iraq", "964"],
  ["IE", "Ireland", "353"], ["IL", "Israel", "972"], ["IT", "Italy", "39"],
  ["JP", "Japan", "81"], ["JO", "Jordan", "962"], ["RU", "Russia", "7"],
  ["KZ", "Kazakhstan", "7"], ["KE", "Kenya", "254"], ["KI", "Kiribati", "686"],
  ["XK", "Kosovo", "383"], ["KG", "Kyrgyzstan", "996"], ["LA", "Laos", "856"],
  ["LV", "Latvia", "371"], ["LB", "Lebanon", "961"], ["LS", "Lesotho", "266"],
  ["LR", "Liberia", "231"], ["LY", "Libya", "218"], ["LI", "Liechtenstein", "423"],
  ["LT", "Lithuania", "370"], ["LU", "Luxembourg", "352"], ["MO", "Macau", "853"],
  ["MG", "Madagascar", "261"], ["MW", "Malawi", "265"], ["ML", "Mali", "223"],
  ["MT", "Malta", "356"], ["MH", "Marshall Islands", "692"], ["MR", "Mauritania", "222"],
  ["MU", "Mauritius", "230"], ["MX", "Mexico", "52"], ["FM", "Micronesia", "691"],
  ["MD", "Moldova", "373"], ["MC", "Monaco", "377"], ["MN", "Mongolia", "976"],
  ["ME", "Montenegro", "382"], ["MA", "Morocco", "212"], ["MZ", "Mozambique", "258"],
  ["MM", "Myanmar", "95"], ["NA", "Namibia", "264"], ["NR", "Nauru", "674"],
  ["NI", "Nicaragua", "505"], ["NE", "Niger", "227"], ["NG", "Nigeria", "234"],
  ["KP", "North Korea", "850"], ["MK", "North Macedonia", "389"], ["NO", "Norway", "47"],
  ["PK", "Pakistan", "92"], ["PW", "Palau", "680"], ["PS", "Palestine", "970"],
  ["PA", "Panama", "507"], ["PG", "Papua New Guinea", "675"], ["PY", "Paraguay", "595"],
  ["PE", "Peru", "51"], ["PH", "Philippines", "63"], ["PL", "Poland", "48"],
  ["PT", "Portugal", "351"], ["RO", "Romania", "40"], ["RW", "Rwanda", "250"],
  ["WS", "Samoa", "685"], ["SM", "San Marino", "378"], ["ST", "Sao Tome and Principe", "239"],
  ["SN", "Senegal", "221"], ["RS", "Serbia", "381"], ["SC", "Seychelles", "248"],
  ["SL", "Sierra Leone", "232"], ["SK", "Slovakia", "421"], ["SI", "Slovenia", "386"],
  ["SB", "Solomon Islands", "677"], ["SO", "Somalia", "252"], ["KR", "South Korea", "82"],
  ["SS", "South Sudan", "211"], ["ES", "Spain", "34"], ["SD", "Sudan", "249"],
  ["SR", "Suriname", "597"], ["SE", "Sweden", "46"], ["CH", "Switzerland", "41"],
  ["SY", "Syria", "963"], ["TW", "Taiwan", "886"], ["TJ", "Tajikistan", "992"],
  ["TZ", "Tanzania", "255"], ["TH", "Thailand", "66"], ["TL", "Timor-Leste", "670"],
  ["TG", "Togo", "228"], ["TO", "Tonga", "676"], ["TN", "Tunisia", "216"],
  ["TR", "Turkey", "90"], ["TM", "Turkmenistan", "993"], ["TV", "Tuvalu", "688"],
  ["UG", "Uganda", "256"], ["UA", "Ukraine", "380"], ["UY", "Uruguay", "598"],
  ["UZ", "Uzbekistan", "998"], ["VU", "Vanuatu", "678"], ["VE", "Venezuela", "58"],
  ["VN", "Vietnam", "84"], ["YE", "Yemen", "967"], ["ZM", "Zambia", "260"],
  ["ZW", "Zimbabwe", "263"],
];

/** Base list — the API's length rules are merged over it. India first. */
export const COUNTRIES: Country[] = COUNTRY_TABLE.map(([iso, country, dial_code]) => ({
  iso,
  dial_code,
  country,
  lengths: KNOWN_LENGTHS[dial_code] ?? [],
}));

/** India, the default everywhere. */
export const INDIA: Country = COUNTRIES[0];

export function countryByIso(iso: string | null | undefined): Country | undefined {
  if (!iso) return undefined;
  const code = iso.toUpperCase();
  return COUNTRIES.find((c) => c.iso === code);
}

/**
 * The full country list with the API's own length rules laid over it (the API
 * keys its list by dial code). Order stays this file's (India first).
 */
export function mergeCountries(fromApi: { dial_code: string; lengths?: number[] }[]): Country[] {
  const byCode = new Map(fromApi.map((c) => [c.dial_code, c]));
  return COUNTRIES.map((c) => {
    const api = byCode.get(c.dial_code);
    return api?.lengths?.length ? { ...c, lengths: api.lengths } : c;
  });
}

const INDIA_MOBILE_FIRST = ["6", "7", "8", "9"];

export type Validation = { ok: true; value: string } | { ok: false; error: string };

/** Digits only — what the length rules are actually counted against. */
export function digitsOnly(input: string): string {
  return (input || "").replace(/\D/g, "");
}

export function validatePhone(raw: string, country: Country): Validation {
  const national = digitsOnly(raw).replace(/^0+/, "");

  if (!national) return { ok: false, error: "Mobile number is required." };

  if (!country.lengths.length) {
    // No national rule known for this country: E.164 caps the whole number at
    // 15 digits including the country code. The server is the real gate.
    const max = 15 - country.dial_code.length;
    if (national.length < 4 || national.length > max) {
      return {
        ok: false,
        error: `Enter the mobile number without the +${country.dial_code} country code (4 to ${max} digits).`,
      };
    }
  } else if (!country.lengths.includes(national.length)) {
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

type ApiCountry = { iso2?: string; dial_code: string; country?: string; lengths?: number[] };

/**
 * The API's own list as Country rows. The API is the authority on which
 * countries a signup may choose (it validates against the same table), so when
 * it answers with ISO codes its list is used AS IS — including countries the
 * bundled COUNTRIES table does not carry. Returns null for an older API whose
 * rows have no `iso2`; the caller then falls back to mergeCountries.
 */
export function countriesFromApi(fromApi: ApiCountry[]): Country[] | null {
  const rows: Country[] = [];
  const seen = new Set<string>();
  for (const c of fromApi) {
    const iso = typeof c?.iso2 === "string" ? c.iso2.toUpperCase() : "";
    if (!/^[A-Z]{2}$/.test(iso) || !c.dial_code || seen.has(iso)) continue;
    seen.add(iso);
    rows.push({
      iso,
      dial_code: String(c.dial_code),
      country: c.country || countryByIso(iso)?.country || iso,
      lengths: Array.isArray(c.lengths) ? c.lengths : [],
    });
  }
  if (!rows.length) return null;
  // India first, whatever order the API used.
  rows.sort((a, b) => Number(b.iso === "IN") - Number(a.iso === "IN"));
  return rows;
}

/**
 * Countries for the signup pickers: the API's list when it is reachable (every
 * country it accepts, and only those), the bundled COUNTRIES otherwise.
 */
export async function fetchCountries(apiBase: string): Promise<Country[]> {
  try {
    const res = await fetch(`${apiBase}/auth/countries`);
    if (!res.ok) return COUNTRIES;
    const data = await res.json();
    if (!Array.isArray(data?.countries) || !data.countries.length) return COUNTRIES;
    return countriesFromApi(data.countries) ?? mergeCountries(data.countries);
  } catch {
    return COUNTRIES;
  }
}

/**
 * Bundled list plus anything the API knows that it does not — for places
 * (billing country) that must never SHRINK below the bundled list, e.g. when
 * the API is in KYC mode and lists India only.
 */
export function withBundledCountries(list: Country[]): Country[] {
  const have = new Set(list.map((c) => c.iso));
  return [...list, ...COUNTRIES.filter((c) => !have.has(c.iso))].sort(
    (a, b) =>
      Number(b.iso === "IN") - Number(a.iso === "IN") || a.country.localeCompare(b.country),
  );
}

export type GstState = { code: string; name: string };

/** GST state code for a customer outside India: "Outside India (Foreign
 *  Country)" — IGST applies and the postal code is free-form. */
export const FOREIGN_STATE_CODE = "96";

/**
 * Indian states and union territories from GET /public/gst-states — the
 * server's table, so the codes on an invoice cannot drift from the picker.
 * 96 (foreign country) and 97 (other territory) are not places in India and
 * are filtered out; outside India is chosen with the country picker instead.
 */
export async function fetchIndianGstStates(apiBase: string): Promise<GstState[]> {
  try {
    const res = await fetch(`${apiBase}/public/gst-states`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data)
      ? (data as GstState[]).filter((s) => s.code !== "96" && s.code !== "97")
      : [];
  } catch {
    return [];
  }
}

// ── Billing-country guard (owner, 16 Oct 2026) ──────────────────────────────
// The API refuses a non-+91 number on an Indian (rupee) account with this
// exact sentence; the forms say it before the customer submits.
export const INDIAN_MOBILE_HINT =
  "Indian accounts need an Indian (+91) mobile number. Outside India? Choose your country and you'll be billed in US dollars.";

/**
 * Cloudflare's country for this connection (GET /auth/ip-country), or null.
 * A hint for the "Are you in India?" confirm step only; never a gate.
 */
export async function fetchIpCountry(apiBase: string): Promise<string | null> {
  try {
    const res = await fetch(`${apiBase}/auth/ip-country`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const code = typeof data?.country_code === "string" ? data.country_code.toUpperCase() : "";
    return /^[A-Z0-9]{2}$/.test(code) ? code : null;
  } catch {
    return null;
  }
}

/** "Your connection looks like it's from <country>..." for India chosen from elsewhere. */
export function ipMismatchMessage(ipCountry: string): string {
  const name = ipCountry === "T1" ? "the Tor network" : countryByIso(ipCountry)?.country ?? ipCountry;
  return `Your connection looks like it's from ${name}. Accounts outside India are billed in US dollars. Are you in India?`;
}
