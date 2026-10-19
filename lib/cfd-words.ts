import { inrAllIn } from "@/lib/cfd-prices";

/**
 * The package the API calls "validated" (key, field names and package id stay
 * as they are) is sold as "Verified" (owner, 16 Oct 2026): a GCI study is
 * verification (are the equations solved right), not validation (does the
 * result match experiments). Until every API sentence says so, rewrite the
 * capitalised word in the customer-facing STRING VALUES of a job response.
 * Keys are never touched. The pre-processing fee was renamed "mesh check"
 * (owner, 17 Oct 2026); older API text saying "mesh validation" is rewritten too.
 * The "quick" package is sold as "Draft" (owner, 19 Oct 2026); the API key stays
 * "quick", and any API text still saying "Quick" is rewritten.
 *
 * One all-in price, no tax words (owner, 19 Oct 2026): API sentences that still
 * say "incl. GST", "+GST", "plus GST" or "no GST (export of services)" lose those
 * words, and the one ex-tax figure in them (the continue rate, "Rs 650 per
 * million cells per 1,000 iterations (+GST)") is shown all-in. The API is being
 * changed to match (control plane branch package-draft-20261019).
 */
function noTaxWords(s: string): string {
  return s
    .replace(/Rs\s?([\d,]+(?:\.\d+)?) per million cells per 1,000 iterations \(\+\s?GST\)/g, (_m, r: string) =>
      `Rs ${inrAllIn(Number(r.replace(/,/g, ""))).toLocaleString("en-IN")} per million cells per 1,000 iterations`)
    .replace(/Rs\s?[\d.,]+ \+ GST Rs\s?[\d.,]+ = (Rs\s?[\d.,]+)/g, "$1")
    .replace(/ \(Rs\s?[\d.,]+ \+ GST Rs\s?[\d.,]+\)/g, "")
    .replace(/ \((?:incl\. GST|\+\s?GST|no GST: export of services|no GST)\)/g, "")
    .replace(/,? no GST \(export of services\)/g, "")
    .replace(/No GST \(export of services\)\.\s?/g, "")
    .replace(/ incl\. GST\b/g, "")
    .replace(/,? plus GST\b/g, "");
}

export function customerWords<T>(v: T): T {
  if (typeof v === "string")
    return noTaxWords(
      v.replace(/\bValidated\b/g, "Verified").replace(/\b([Mm])esh validation\b/g, "$1esh check").replace(/\bQuick\b/g, "Draft"),
    ) as T;
  if (Array.isArray(v)) return v.map((x) => customerWords(x)) as T;
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) out[k] = customerWords(x);
    return out as T;
  }
  return v;
}
