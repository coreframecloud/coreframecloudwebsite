/**
 * The package the API calls "validated" (key, field names and package id stay
 * as they are) is sold as "Verified" (owner, 16 Oct 2026): a GCI study is
 * verification (are the equations solved right), not validation (does the
 * result match experiments). Until every API sentence says so, rewrite the
 * capitalised word in the customer-facing STRING VALUES of a job response.
 * Keys are never touched, and lower-case "validation" (as in "pre-processing /
 * mesh validation", a different product) is left alone.
 */
export function customerWords<T>(v: T): T {
  if (typeof v === "string") return v.replace(/\bValidated\b/g, "Verified") as T;
  if (Array.isArray(v)) return v.map((x) => customerWords(x)) as T;
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) out[k] = customerWords(x);
    return out as T;
  }
  return v;
}
