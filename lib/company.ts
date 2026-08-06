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
