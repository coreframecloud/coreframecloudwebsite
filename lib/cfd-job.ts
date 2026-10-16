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
import { ACCOUNT_ACCESS, tokenQuery } from "@/lib/cfd-my-jobs";

export const JOB_TOKEN_PREFIX = "cf_cfd_job_token:";
const JOB_TOKEN_TTL_MS = 30 * 24 * 3600 * 1000;
const SESSION_KEY = "cf_customer_token";

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
}

export interface NormalDeliveryPkg {
  package: string;
  label: string;
  starts_text?: string;
  results_text?: string;
}

export interface ExpressDeliveryPkg {
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
    normal?: { text: string; turnaround?: string; starts_text?: string; packages?: NormalDeliveryPkg[] };
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
  schedule?: { starts_text?: string; results_text?: string; waiting_for_batch?: boolean } | null;
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
  stop_basis?: string;
  report_url?: string;
  view3d_url?: string;
  results_url?: string;
  results_available?: boolean;
  convergence_state?: string | null;
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

/**
 * "Fri 23 Oct, 13:40 IST" for an INR account. A USD account sees its own
 * browser's time zone, named the same way ("Fri 23 Oct, 09:10 BST").
 */
export function fmtDate(iso: string | null | undefined, cur: Currency): string {
  const d = parseApiDate(iso);
  if (!d) return "";
  const timeZone = cur === "INR" ? "Asia/Kolkata" : undefined;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: cur === "INR" ? undefined : "short",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const tz = cur === "INR" ? "IST" : get("timeZoneName");
  return `${get("weekday")} ${get("day")} ${get("month")}, ${get("hour")}:${get("minute")}${tz ? ` ${tz}` : ""}`;
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

// ─── the signed-in session (the site's usual bearer) ─────────────────────────

function tokenExpired(tok: string): boolean {
  try {
    const payload = JSON.parse(atob(tok.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function sessionToken(): string | null {
  try {
    const t = localStorage.getItem(SESSION_KEY);
    return t && !tokenExpired(t) ? t : null;
  } catch {
    return null;
  }
}

// ─── API calls ───────────────────────────────────────────────────────────────

export interface ApiResult<T = unknown> {
  status: number;
  body: T;
}

export function jobUrl(ref: string, path: string, jobToken: string): string {
  const q = tokenQuery(jobToken);
  return `${API_BASE}/cfd-jobs/${encodeURIComponent(ref)}${path}${q ? `?${q}` : ""}`;
}

export async function fetchJob(ref: string, jobToken: string): Promise<ApiResult<CfdJob | null>> {
  // Signed in: the bearer goes too, so the job's own account still gets in when
  // the kept email key has been retired (the API accepts the token OR the owner).
  const bearer = sessionToken();
  const res = await fetch(jobUrl(ref, "/status", jobToken), {
    cache: "no-store",
    headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
  });
  const body = res.ok ? ((await res.json()) as CfdJob) : null;
  return { status: res.status, body };
}

/** POST a job action with the job token and, when signed in, the account's bearer. */
export async function postJob(
  ref: string,
  jobToken: string,
  path: string,
  body?: unknown,
): Promise<ApiResult<CfdJob & { detail?: unknown }>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const bearer = sessionToken();
  if (bearer) headers.Authorization = `Bearer ${bearer}`;
  try {
    const res = await fetch(jobUrl(ref, path, jobToken), {
      method: "POST",
      headers,
      body: JSON.stringify(body ?? {}),
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, body: json };
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
  const bearer = sessionToken();
  if (!bearer) return "signed_out";
  try {
    const res = await fetch(`${API_BASE}/customer/me/wallet`, {
      headers: { Authorization: `Bearer ${bearer}` },
      cache: "no-store",
    });
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
  "Quote fee",
  "Mesh & quote",
  "Paid",
  "Running",
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
