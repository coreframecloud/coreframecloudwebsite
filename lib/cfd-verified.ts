import { formatMoney, type Currency } from "@/lib/money";
import { inrAllIn } from "@/lib/cfd-prices";

/**
 * VERIFIED: the CFD mesh-independence study (owner, 16 Oct 2026).
 *
 * Built and switched on in the control plane as the "validated" package
 * (services/cfd_validated.py; API key, field names and package id stay
 * "validated"). Customers see "Verified", subline "mesh-independence study
 * (GCI)", because a grid convergence index study is VERIFICATION (are the
 * equations solved right on this mesh) and not VALIDATION (does the model match
 * experiments). Never call the package "Validated" on the site.
 *
 * What it is: the same case on three meshes (coarse / medium / fine, refinement
 * ratio r = 1.3), GCI per Celik et al. 2008 with Fs = 1.25; three meshes whose
 * answers oscillate are judged on 1.25 x half their spread (Stern et al. 2001).
 * Verdict: "Mesh-independent: static pressure drop = X Pa ± Y % (GCI, fine mesh)".
 * Internal flow only (pipes, ducts, fittings, manifolds), quoted meshes up to
 * about 6 M cells, results within 24 hours, never express.
 *
 * Prices (owner, 16 Oct 2026; minimum raised 17 Oct 2026; the API's
 * cfd_packages.validated min_charge and usd_min_charge): India from ₹5,999 ex-tax,
 * scaling with the cells (about ₹10,734 ex-tax at 2 M cells); outside India from
 * $99. Shown all-in (owner, 19 Oct 2026): VERIFIED_INR_ALL_IN. Pre-processing /
 * mesh check is a separate charge, as for every package. Never publish how
 * the price is built, our costs or margins.
 *
 * The two validation records below are OUR test runs (fine to cite as ours).
 */

export const VERIFIED = {
  name: "Verified",
  subline: "mesh-independence study (GCI)",
  /** The one sentence every Verified surface carries. */
  meaning: "Mesh-independent means the mesh error is small; it does not mean the result matches experiments.",
  maxMcells: 6,
  deliveryHours: 24,
  fromInr: 5999,
  inrAt2M: 10734,
  fromUsd: 99,
  path: "/cfd/mesh-independence-study",
} as const;

/** The rupee figures as the wallet is charged them (fromInr / inrAt2M are the API's ex-tax figures). */
export const VERIFIED_INR_ALL_IN = {
  from: inrAllIn(VERIFIED.fromInr),
  at2M: inrAllIn(VERIFIED.inrAt2M),
} as const;

/** "₹7,079" / "$99": the starting amount alone, for a big figure. */
export function verifiedFromAmount(cur: Currency): string {
  return cur === "USD" ? formatMoney(VERIFIED.fromUsd, "USD") : formatMoney(VERIFIED_INR_ALL_IN.from, "INR");
}

/** "from ₹7,079" / "from $99". */
export function verifiedFrom(cur: Currency): string {
  return cur === "USD" ? `from ${formatMoney(VERIFIED.fromUsd, "USD")}` : `from ${formatMoney(VERIFIED_INR_ALL_IN.from, "INR")}`;
}

/** The price sentence with the scaling note and the tax words. */
export function verifiedPriceLine(cur: Currency): string {
  return cur === "USD"
    ? `From ${formatMoney(VERIFIED.fromUsd, "USD")}. The price scales with the cells in your mesh and is on your quote, next to the single-mesh packages.`
    : `From ${formatMoney(VERIFIED_INR_ALL_IN.from, "INR")}. The price scales with the cells in your mesh: about ${formatMoney(VERIFIED_INR_ALL_IN.at2M, "INR")} at 2 million cells. It is on your quote, next to the single-mesh packages.`;
}

/**
 * Our own bend test, a live Verified run (17 Oct 2026, job CF-MA2WOW): air,
 * 4 m/s, D 50 mm, R/D 1.5; meshes r = 1.3. Replaced the 16 Oct run
 * (12.20 Pa ± 0.85 %, indicative) on 18 Oct 2026; the running ads quote this one.
 * The band (0.13 %) is the solver's own iteration-to-iteration change, which is
 * larger than the GCI (0.08 %), so the band, not the GCI, is the number we quote.
 */
export const BEND_RECORD = {
  case: "90° bend, R/D 1.5, air at 4 m/s, D = 50 mm",
  meshes: [
    { level: "Coarse", mcells: 0.25, dp: 12.234, iterations: 663, converged: "residual targets" },
    { level: "Medium", mcells: 0.54, dp: 12.292, iterations: 1500, converged: "engineering criterion" },
    { level: "Fine", mcells: 1.21, dp: 12.297, iterations: 2400, converged: "steady periodic solution" },
  ],
  resultPa: 12.3,
  bandPct: 0.13,
  gciPct: 0.08,
  verdict: "Mesh-independent: 12.30 Pa ± 0.13 %",
} as const;

/** Our own straight-pipe test (16 Oct 2026): 72 D long. Oscillatory, judged by Stern et al. 2001. */
export const PIPE_RECORD = {
  case: "Straight pipe, 72 diameters long",
  lengthD: 72,
  dps: [19.94, 20.07, 19.97],
  spreadPct: 0.63,
  frictionGciPct: 0.6,
  vsHaalandPct: -4.8,
} as const;
