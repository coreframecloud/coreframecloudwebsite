/**
 * The customer's CFD job page on www (16 Oct 2026): types, money/date words,
 * the job token and the calls to the control-plane API.
 *
 * Until 16 Oct the job page was served by the API itself
 * (control.coreframecloud.com/api/cfd-jobs/<ref>/view?token=…, plain dark HTML).
 * It now lives at /cfd/jobs/<ref> on the site and calls the same JSON endpoints
 * (apps/api/app/api/cfd_jobs.py in the control plane). The API redirects old
 * links here.
 *
 * THE JOB TOKEN NEVER TRAVELS IN A URL THE SERVER OR ANALYTICS SEES. Links carry
 * it in the #fragment (/cfd/jobs/CF-XXXXXX#t=…), which the browser never sends
 * to Vercel or in a Referer. An inline script in page.tsx reads it, keeps it in
 * this origin's localStorage (30 days, per job) and strips it from the address
 * bar before any analytics tag loads. Download links are buttons, not hrefs, so
 * the tokenised API URLs are not in the DOM either.
 */
import { API_BASE } from "@/lib/api-base";
import { type Currency } from "@/lib/money";
import { ACCOUNT_ACCESS, jobTokenHeaders } from "@/lib/cfd-my-jobs";
import { apiFetch, sessionMarker } from "@/lib/session";
import { customerWords } from "@/lib/cfd-words";

export { customerWords };

export const JOB_TOKEN_PREFIX = "cf_cfd_job_token:";
const JOB_TOKEN_TTL_MS = 30 * 24 * 3600 * 1000;

/** Statuses as the API names them (cfd_jobs.py _CUSTOMER_STAGE). */
export type JobStatus =
  | "new"
  | "quote_fee_due"
  | "meshing_queued"
  | "meshing"
  | "quoted"
  | "mesh_failed"
  | "rejected"
  | "approved"
  | "running"
  | "completed"
  | "not_converged"
  | "failed"
  | "cancelled";

export type Money = string | number;

export interface Problem {
  code?: string;
  message: string;
  fix?: string;
}

export interface Cap {
  id: string;
  role: "inlet" | "outlet" | null;
  area_m2?: number | null;
  hydraulic_diameter_m?: number | null;
}

export interface QuotePackage {
  package: string;
  label: string;
  tier?: string;
  compute_label?: string;
  iterations: number;
  convergence: string;
  base_fee: Money;
  compute_ex_gst: Money;
  min_charge: Money;
  price_ex_gst: Money;
  gst: Money;
  total: Money;
  hold: Money;
  list_price_ex_gst?: Money | null;
  list_total?: Money | null;
  discount_percent?: number | null;
  estimated_compute_hours: { low: number; high: number; label: string };
  /** "residuals below 10⁻³" (16 Oct 2026). */
  convergence_short?: string;
  /** The full calculation, from the API (never recomputed here). */
  breakdown?: PriceBreakdown;
  /** Verified, API key "validated" (mesh-independence study, 16 Oct 2026): what it adds, and the three meshes it is priced on. */
  adds?: string;
  levels_text?: string;
  levels?: ValidatedLevelQuote[];
  gci_threshold_pct?: number;
}

/** One mesh of the Verified study on the quote (cfd_validated.quote_view_extra). */
export interface ValidatedLevelQuote {
  level: "coarse" | "medium" | "fine" | string;
  cells: number;
  mcells: number;
  iterations: number;
  /** true: the coarse / fine size is estimated from the quoted (medium) mesh */
  estimate: boolean;
  compute: Money;
}

/** The job page's mesh-independence block (cfd_validated.results_view). */
export interface ValidatedResults {
  verdict?: string | null;
  independent: boolean;
  computed: boolean;
  status?: string | null;
  threshold_pct?: number | null;
  delivered_level?: string | null;
  levels: {
    level: string;
    status?: string | null;
    cells?: number | null;
    pressure_drop_pa?: number | null;
    total_pressure_drop_pa?: number | null;
    loss_coefficient_k?: number | null;
    iterations?: number | null;
    reason?: string | null;
  }[];
  quantities: Record<
    string,
    {
      apparent_order: number | null;
      order_used: number | null;
      extrapolated: number | null;
      gci_fine_pct: number | null;
      gci_fine_celik_pct: number | null;
      convergence?: string | null;
      fine: number | null;
    }
  >;
  refinement_ratios?: { r21?: number | null; r32?: number | null };
}

/** cfd_jobs.py _price_breakdown: base + compute (+ adjustment) = subtotal − discount = price before GST. */
export interface PriceBreakdown {
  currency: string;
  base_fee: Money;
  compute: Money;
  compute_formula: {
    mcells: number;
    iterations: number;
    rate_per_mcell_per_kiter: Money | null;
    rate_after_discount?: Money | null;
    factor: number;
  };
  adjustment: Money | null;
  adjustment_kind: "minimum" | "rounding" | null;
  subtotal: Money;
  discount: Money | null;
  discount_percent: number | null;
  price_ex_gst: Money;
  gst: Money;
  gst_percent: number;
  total: Money;
  hold: Money;
  minimum_charge: Money;
  minimum_applies: boolean;
}

/** Times are ISO-8601 UTC ("…Z"); the page shows them in the viewer's own zone. */
export interface Times {
  start_now?: boolean;
  start_at?: string | null;
  results_at?: string | null;
  promise_at?: string | null;
}

export interface NormalDeliveryPkg extends Times {
  package: string;
  label: string;
  starts_text?: string;
  results_text?: string;
}

export interface ExpressDeliveryPkg extends Times {
  package: string;
  label: string;
  hold: Money;
  total?: Money;
  list_total?: Money | null;
  eta_text?: string;
  eta_minutes?: number;
}

export interface Quote {
  delivery?: {
    normal?: {
      text: string;
      turnaround?: string;
      starts_text?: string;
      packages?: NormalDeliveryPkg[];
      promise_hours?: number;
    };
    express?: {
      available?: boolean;
      text?: string;
      turnaround?: string;
      multiplier?: number;
      packages: ExpressDeliveryPkg[];
      unavailable?: string | null;
    } | null;
  };
  cells?: number;
  mesh_quality?: {
    mesh_ok?: boolean;
    max_non_orthogonality?: number | null;
    max_skewness?: number | null;
    wall_layers?: { used?: string; coverage_pct?: number; fallback?: boolean } | null;
    warnings?: string[];
  };
  bounding_box_m?: number[] | null;
  physics?: string;
  gst_rate_percent?: number;
  currency?: string;
  packages: QuotePackage[];
  /** Why the Verified study (API: validated) is not offered for this model (null when it is, or when it is switched off). */
  validated_unavailable?: string | null;
  default_package?: string;
  settle_option?: { default?: boolean; text: string; detail?: string } | null;
  pay_line?: string;
  outcomes?: Record<string, string>;
  expires_at?: string | null;
  expired?: boolean;
}

export interface CfdJob {
  ref_id: string;
  project_name?: string | null;
  status: JobStatus | string;
  status_text: string;
  currency?: string;
  submitted_at?: string | null;
  completed_at?: string | null;
  geometry_problems?: Problem[];
  units_confirmation?: { options: string[]; suggested?: string | null; reason?: string | null } | null;
  openings?: { status: string; confirmed: boolean; caps: Cap[] } | null;
  preview_url?: string;
  rejection?: { problems?: Problem[] } | null;
  review_reasons?: string[];
  size_estimate?: { text: string; note?: string | null } | null;
  dimensions_option?: { dimensions?: string; text: string } | null;
  mesh_failure?: { message: string; fix?: string; charged?: boolean; charge_text?: string } | null;
  quote_fee?: { total: Money; ex_gst?: Money; gst?: Money; text: string; tier_text?: string } | null;
  payment?: { account_email?: string; how?: string; topup_url?: string } | null;
  delivery?: "normal" | "express";
  turnaround?: string;
  schedule?:
    | (Times & { starts_text?: string; results_text?: string; waiting_for_batch?: boolean; started?: boolean })
    | null;
  /** queued | starting (machine being prepared, solver not started) | running (solver started). */
  run_state?: "queued" | "starting" | "running";
  /** What cancelling now would do (absent: cannot be cancelled now). */
  cancel_option?: CancelOption | null;
  cancel_closed_text?: string;
  cancellation?: Cancellation | null;
  express_notice?: string;
  stage?: string | null;
  iteration?: number | null;
  quote?: Quote | null;
  billing?: {
    package?: string | null;
    on_hold_inr: Money;
    charged_inr: Money;
    credited_inr: Money;
    quote_fee?: { amount_inr?: Money | null; state?: string | null; incl_gst?: boolean } | null;
  } | null;
  stop_when_settled?: boolean;
  continue_option?: {
    max_iterations: number;
    note: string;
    express?: { text: string; multiplier?: number } | null;
  } | null;
  headline?: Record<string, number | string>;
  /** Verified package (API key "validated"): the mesh-independence (GCI) result. */
  validated?: ValidatedResults | null;
  stop_basis?: string;
  report_url?: string;
  /** One-page Mesh report (PDF) of pre-processing / mesh check, once the quote exists. */
  mesh_report_url?: string;
  view3d_url?: string;
  results_url?: string;
  results_available?: boolean;
  convergence_state?: string | null;
}

export interface CancelOption {
  when: "before_payment" | "before_start";
  release: Money | null;
  quote_fee_refund: Money | null;
  quote_fee_kept: Money | null;
  currency?: string;
  text: string;
}

export interface Cancellation {
  at: string;
  when: "before_payment" | "before_start";
  released: Money | null;
  quote_fee_refunded: Money | null;
  quote_fee_kept: Money | null;
}

export function jobCurrency(job: Pick<CfdJob, "currency"> | null | undefined): Currency {
  return job?.currency === "USD" ? "USD" : "INR";
}

const num = (v: Money | null | undefined): number => Number(v ?? 0) || 0;

/** ₹3,439.70 / ₹599 (Indian grouping) or $41.99. */
export function money(v: Money | null | undefined, cur: Currency): string {
  const n = num(v);
  const cents = Math.round(n * 100);
  const opts: Intl.NumberFormatOptions =
    cents % 100 === 0
      ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
      : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  return cur === "USD"
    ? `$${(cents / 100).toLocaleString("en-US", opts)}`
    : `₹${(cents / 100).toLocaleString("en-IN", opts)}`;
}

export function moneyValue(v: Money | null | undefined): number {
  return num(v);
}

/**
 * The API's sentences still say "Rs 599" (they are shared with the emails).
 * On the page every INR amount is written with the rupee sign.
 */
export function rupeeWords(text: string | null | undefined): string {
  if (!text) return "";
  return text.replace(/\bRs\.?\s?(?=\d)/g, "₹");
}

/** 5,003 / 0.6266 / 7.64e-3 — never 5.003e+3. */
export function fmtNumber(x: number | string): string {
  const v = Number(x);
  if (!Number.isFinite(v) || v === 0) return String(x);
  if (Math.abs(v) >= 1000) return Math.round(v).toLocaleString("en-IN");
  if (Math.abs(v) >= 0.001) return String(Number(v.toPrecision(4)));
  return v.toExponential(2);
}

/** The API sends naive UTC ("2026-10-23T08:10:32"). */
export function parseApiDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const s = /[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** The viewer's zone label: "IST" for India (browsers say "GMT+5:30"), else the short name ("CEST"). */
function zoneLabel(d: Date, timeZone?: string): string {
  const zone = timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (zone === "Asia/Kolkata" || zone === "Asia/Calcutta") return "IST";
  const short = (locale: string) =>
    new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: "short" })
      .formatToParts(d)
      .find((x) => x.type === "timeZoneName")?.value ?? "";
  // en-GB names European zones (CEST, BST); en-US names the Americas (EDT, PDT)
  let name = short("en-GB");
  if (/^GMT[+-]/.test(name)) {
    const us = short("en-US");
    if (/^[A-Z]{2,5}$/.test(us)) name = us;
  }
  return name === "GMT" && zone === "UTC" ? "UTC" : name.replace(/^GMT(?=[+-])/, "UTC");
}

/**
 * "Fri 16 Oct, 15:00 CEST": every time in the viewer's own browser zone (owner,
 * 16 Oct 2026), with the zone named; India reads IST. Call it only in the
 * browser (the job page renders after mount, so server and client never differ).
 * `_cur` is kept for old callers; the zone no longer depends on the currency.
 */
export function fmtDate(iso: string | null | undefined, _cur?: Currency, timeZone?: string): string {
  const d = parseApiDate(iso);
  if (!d) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const tz = zoneLabel(d, timeZone);
  return `${get("weekday")} ${get("day")} ${get("month")}, ${get("hour")}:${get("minute")}${tz ? ` ${tz}` : ""}`;
}

/** "in about 3 h" / "in about 40 min" for a future time; "" when it is past or under 5 minutes away. */
export function fromNow(iso: string | null | undefined, now: number = Date.now()): string {
  const d = parseApiDate(iso);
  if (!d) return "";
  const min = (d.getTime() - now) / 60000;
  if (min < 5) return "";
  if (min < 60) return `in about ${Math.round(min / 5) * 5 || 5} min`;
  const h = min / 60;
  if (h < 10) {
    const r = Math.round(h * 2) / 2;
    return `in about ${r % 1 ? r.toFixed(1) : r} h`;
  }
  return `in about ${Math.round(h)} h`;
}

// ─── the job token ───────────────────────────────────────────────────────────

/** The token page.tsx's inline script picked up (and stripped) on this load, or the kept one. */
export function readJobToken(ref: string): string | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { __cfJobToken?: { ref: string; t: string } };
  if (w.__cfJobToken && w.__cfJobToken.ref === ref) return w.__cfJobToken.t;
  try {
    const kept = JSON.parse(localStorage.getItem(JOB_TOKEN_PREFIX + ref) || "null") as
      | { t?: string; at?: number }
      | null;
    if (kept?.t && kept.at && Date.now() - kept.at < JOB_TOKEN_TTL_MS) return kept.t;
  } catch {
    /* storage blocked: only the emailed link works */
  }
  // No emailed key here, but signed in: the job's own account opens it with its
  // session (16 Oct 2026). Another account gets the same "not found" as before.
  return sessionToken() ? ACCOUNT_ACCESS : null;
}

// ─── the signed-in session (an HttpOnly cookie: lib/session.ts) ──────────────

/** "cookie" when this browser is signed in, else null. Never a credential. */
export function sessionToken(): string | null {
  return sessionMarker();
}

// ─── API calls ───────────────────────────────────────────────────────────────


export interface ApiResult<T = unknown> {
  status: number;
  body: T;
}

/** A job API URL. The job token never goes in it: see jobTokenHeaders. */
export function jobUrl(ref: string, path: string): string {
  return `${API_BASE}/cfd-jobs/${encodeURIComponent(ref)}${path}`;
}

export async function fetchJob(ref: string, jobToken: string): Promise<ApiResult<CfdJob | null>> {
  // Signed in: the bearer goes too, so the job's own account still gets in when
  // the kept email key has been retired (the API accepts the token OR the owner).
  const res = await apiFetch(jobUrl(ref, "/status"), {
    cache: "no-store",
    headers: jobTokenHeaders(jobToken),
  });
  const body = res.ok ? customerWords((await res.json()) as CfdJob) : null;
  return { status: res.status, body };
}

/** POST a job action with the job token and, when signed in, the account's bearer. */
export async function postJob(
  ref: string,
  jobToken: string,
  path: string,
  body?: unknown,
): Promise<ApiResult<CfdJob & { detail?: unknown }>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...jobTokenHeaders(jobToken),
  };
  try {
    const res = await apiFetch(jobUrl(ref, path), {
      method: "POST",
      headers,
      body: JSON.stringify(body ?? {}),
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, body: customerWords(json) };
  } catch {
    return { status: 0, body: { detail: "We could not reach Coreframe. Check your connection and try again." } as never };
  }
}

/** The API's error words, or a plain fallback. */
export function errorText(res: ApiResult<{ detail?: unknown }>): string {
  const d = res.body?.detail as { message?: string } | string | undefined;
  if (d && typeof d === "object" && d.message) return rupeeWords(d.message);
  if (typeof d === "string") return rupeeWords(d);
  if (res.status === 401) return "Sign in to the account that submitted this job to continue.";
  return "Something went wrong. Please try again.";
}

export interface WalletLine {
  usable: number;
  bonus: number;
  bonusExpires: string | null;
  currency: Currency;
}

export async function fetchWallet(): Promise<WalletLine | null | "signed_out"> {
  if (!sessionToken()) return "signed_out";
  try {
    const res = await apiFetch(`${API_BASE}/customer/me/wallet`, { cache: "no-store" });
    if (res.status === 401) return "signed_out";
    if (!res.ok) return null;
    const w = (await res.json()) as {
      spendable_everywhere_rupees?: number;
      wallet_balance_rupees?: number;
      gpu_only_bonus_rupees?: number;
      gpu_only_bonus_expires_at?: string | null;
      wallet_currency?: string | null;
    };
    return {
      usable: Number(w.spendable_everywhere_rupees ?? w.wallet_balance_rupees ?? 0) || 0,
      bonus: Number(w.gpu_only_bonus_rupees ?? 0) || 0,
      bonusExpires: w.gpu_only_bonus_expires_at ?? null,
      currency: w.wallet_currency === "USD" ? "USD" : "INR",
    };
  } catch {
    return null;
  }
}

// ─── the stepper ─────────────────────────────────────────────────────────────

export const STEPS = [
  "Submitted",
  "Geometry checked",
  "Pre-processing",
  "Mesh & quote",
  "Paid",
  "Queue & run",
  "Results",
] as const;

/**
 * Where the job is on the seven steps: `at` is the step in progress (all before
 * it are done); `stopped` marks it as the step where the job stopped.
 */
export function stepOf(status: string): { at: number; stopped?: boolean } {
  switch (status) {
    case "new":
      return { at: 1 };
    case "rejected":
      return { at: 1, stopped: true };
    case "quote_fee_due":
      return { at: 2 };
    case "meshing_queued":
    case "meshing":
      return { at: 3 };
    case "mesh_failed":
      return { at: 3, stopped: true };
    case "quoted":
      return { at: 4 };
    case "approved":
    case "running":
      return { at: 5 };
    case "failed":
      return { at: 5, stopped: true };
    case "cancelled":
      return { at: 4, stopped: true };
    case "completed":
    case "not_converged":
      return { at: 7 };
    default:
      return { at: 0 };
  }
}

/** Statuses in which a new geometry upload is accepted (cfd_jobs.py _REUPLOAD_OK). */
export const REUPLOAD_OK = new Set(["new", "quote_fee_due", "meshing_queued", "quoted", "mesh_failed", "rejected"]);

/** Statuses that change on their own: the page re-reads them. */
export const LIVE = new Set(["new", "meshing_queued", "meshing", "approved", "running"]);

/** Labels for the results headline (cfd_job_view.js labels, kept in step). */
export const HEADLINE_LABELS: Record<string, [string, string]> = {
  pressure_drop_pa: ["Static pressure drop", "Pa"],
  total_pressure_drop_pa: ["Total pressure drop", "Pa"],
  loss_coefficient_k: ["Loss coefficient K (inlet velocity)", ""],
  loss_coefficient_k_outlet: ["Loss coefficient K (outlet velocity)", ""],
  flow_rate_m3_s: ["Flow rate", "m³/s"],
  drag_coefficient: ["Drag coefficient Cd", ""],
  lift_coefficient: ["Lift coefficient Cl", ""],
  drag_force_n: ["Drag force", "N"],
  lift_force_n: ["Lift force", "N"],
  hvac_air_speed_1_1m_mean_m_s: ["Air speed at 1.1 m (seated head), mean", "m/s"],
  hvac_air_speed_1_1m_max_m_s: ["Air speed at 1.1 m, highest", "m/s"],
  hvac_air_speed_0_1m_max_m_s: ["Air speed at 0.1 m (ankle), highest", "m/s"],
  hvac_vertical_temperature_difference_k: ["Head-ankle temperature difference, worst (ISO 7730 B: below 3 K)", "K"],
  hvac_adpi_pct: ["ADPI (cooling)", "%"],
  hvac_pmv_mean: ["PMV at 1.1 m, mean (ISO 7730)", ""],
  hvac_ppd_mean_pct: ["PPD at 1.1 m, mean", "%"],
  hvac_air_change_effectiveness: ["Air-change effectiveness at 1.1 m (1 = fully mixed)", ""],
  hvac_air_speed_1_1m_max_range_m_s: ["Air speed at 1.1 m, highest (range over the final reads: unsteady)", "m/s"],
  hvac_air_speed_0_1m_max_range_m_s: ["Air speed at 0.1 m, highest (range over the final reads: unsteady)", "m/s"],
  hvac_vertical_temperature_difference_range_k: [
    "Head-ankle temperature difference, worst (range over the final reads: unsteady)",
    "K",
  ],
  hvac_iso7730_vertical_dt_check: ["ISO 7730 B head-ankle check (below 3 K)", ""],
  hvac_tier: ["Analysis", ""],
};

/** The one headline number that leads the results (the first the job has). */
export const LEAD_HEADLINE = [
  "pressure_drop_pa",
  "drag_coefficient",
  "hvac_air_speed_1_1m_mean_m_s",
  "hvac_pmv_mean",
];

/** First sentence of an API paragraph: the one line a package card shows. */
export function firstSentence(text: string | null | undefined): string {
  if (!text) return "";
  const m = text.match(/^(.+?\.)(\s|$)/);
  return m ? m[1] : text;
}
