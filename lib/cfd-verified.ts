import { formatMoney, type Currency } from "@/lib/money";

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
 * Prices (owner, 16 Oct 2026; the API's cfd_packages.validated min_charge and
 * usd_min_charge): India from ₹2,499 + GST, scaling with the cells (about
 * ₹5,493 + GST at 1 M cells); outside India from $99, no GST. Pre-processing /
 * mesh validation is a separate charge, as for every package. Never publish how
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
  fromInr: 2499,
  inrAt1M: 5493,
  fromUsd: 99,
  path: "/cfd/mesh-independence-study",
} as const;

/** "from ₹2,499 + GST" / "from $99". */
export function verifiedFrom(cur: Currency): string {
  return cur === "USD" ? `from ${formatMoney(VERIFIED.fromUsd, "USD")}` : `from ${formatMoney(VERIFIED.fromInr, "INR")} + GST`;
}

/** The price sentence with the scaling note and the tax words. */
export function verifiedPriceLine(cur: Currency): string {
  return cur === "USD"
    ? `From ${formatMoney(VERIFIED.fromUsd, "USD")}, no GST (export of services). The price scales with the cells in your mesh and is on your quote, next to the single-mesh packages.`
    : `From ${formatMoney(VERIFIED.fromInr, "INR")} + GST. The price scales with the cells in your mesh: about ${formatMoney(VERIFIED.inrAt1M, "INR")} + GST at 1 million cells. It is on your quote, next to the single-mesh packages.`;
}

/** Our own bend test (16 Oct 2026): air, 4 m/s, D 50 mm, R/D 1.5. Monotone convergence. */
export const BEND_RECORD = {
  case: "90° bend, R/D 1.5, air at 4 m/s, D = 50 mm",
  meshes: [
    { level: "Coarse", mcells: 0.25, dp: 12.247 },
    { level: "Medium", mcells: 0.54, dp: 12.24 },
    { level: "Fine", mcells: 1.21, dp: 12.205 },
  ],
  verdict: "Mesh-independent (indicative): 12.20 Pa ± 0.85 %",
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
