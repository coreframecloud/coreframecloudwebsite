/**
 * Registered company identity — the single source for anything legal on the site.
 *
 * Transcribed field-for-field from Form GST REG-06, registration 29AANCC8401D1ZO
 * issued 25/06/2026. Do not reword these strings. The address printed on the
 * website, on an invoice and on the GST certificate has to match character for
 * character; a mismatch is what gets a customer's input credit questioned, and
 * it is also what fails a code-signing or payment-gateway verification.
 *
 * The footer previously showed the co-working building name and a misspelt
 * street, neither of which appears on the registration.
 *
 * There is NO trade name on the registration, so the full legal name is the only
 * name that may be used in a legal context. "Coreframe" is a brand, not a name.
 */

export const COMPANY = {
  legalName: "COREFRAME COMPUTE LABS PRIVATE LIMITED",
  displayName: "Coreframe Compute Labs Private Limited",
  brand: "Coreframe",
  cin: "U63119KA2026PTC220789",
  gstin: "29AANCC8401D1ZO",
  constitution: "Private Limited Company",

  // Address of Principal Place of Business, exactly as registered.
  address: {
    building: "No 32/2, 34/1",
    street: "Kadabisanahalli",
    locality: "Vartur",
    city: "Bengaluru",
    district: "Bengaluru Urban",
    state: "Karnataka",
    stateCode: "29",
    pincode: "560087",
    country: "India",
  },

  email: "admin@coreframecloud.com",
  phone: "+91 6366889488",
  whatsapp: "https://wa.me/916366889488",
} as const;

/** One-line address for footers and compact contexts. */
export const COMPANY_ADDRESS_LINE = [
  COMPANY.address.building,
  COMPANY.address.street,
  COMPANY.address.locality,
  COMPANY.address.city,
  `${COMPANY.address.state} ${COMPANY.address.pincode}`,
].join(", ");

/**
 * The same office, written the way a visitor needs it.
 *
 * The GST registration identifies the plot by survey number (No 32/2, 34/1);
 * the building standing on that plot is Innov8 inside Prestige Tech Platina.
 * Same address, two vocabularies — which is how the site ended up carrying four
 * spellings of one office (footer, privacy policy, about page and the Instagram
 * bio all disagreed, and the bio said Marathahalli, which is a different
 * suburb entirely).
 *
 * Use THIS one anywhere a human is trying to arrive: footer contact, the map
 * link, the about page. Use COMPANY_ADDRESS_LINE / _FULL anywhere the string is
 * matched against the GST certificate: invoices, the privacy policy's legal
 * entity block, payment-gateway and code-signing forms.
 *
 * Never invent a third wording. If one of these needs to change, change it here.
 */
export const COMPANY_VISITING_ADDRESS_LINE =
  "Innov8, Prestige Tech Platina, 11th Floor, No. 32/2, 34/1, Kadubeesanahalli, Bengaluru, Karnataka 560087";

/**
 * Google Business Profile for the Bengaluru office.
 *
 * This is a share shortlink. Swap it for the canonical
 * `https://www.google.com/maps/place/...` (or `https://maps.google.com/?cid=...`)
 * URL from the Business Profile manager when convenient — a canonical place URL
 * is a stronger `sameAs` entity signal than a redirect, and shortlinks can be
 * retired. One constant, one edit: the footer and the Organization schema both
 * read it from here.
 */
export const COMPANY_MAPS_URL = "https://share.google/BGmHZp7ySfl8Ae90l";

/** Full postal address, for legal pages and invoices. */
export const COMPANY_ADDRESS_FULL = [
  COMPANY.address.building,
  COMPANY.address.street,
  COMPANY.address.locality,
  COMPANY.address.city,
  COMPANY.address.district,
  `${COMPANY.address.state} ${COMPANY.address.pincode}`,
  COMPANY.address.country,
].join(", ");
