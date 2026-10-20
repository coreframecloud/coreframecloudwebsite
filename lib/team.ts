/**
 * Teams v2 (owner approved 20 Oct 2026): types and small helpers shared by
 * the Org Portal (/org-admin) and the member's team card on /my-activity.
 *
 * Money here is always in the ORGANISATION's wallet currency, which the API
 * sends as `currency` on every money-bearing object. One currency per page.
 */
import { API_BASE } from "@/lib/api-base";
import { apiFetch } from "@/lib/session";
import { formatMoney, parseCurrency, type Currency } from "@/lib/money";

export type TeamRole = "member" | "org_admin";

/** POST /org-admin/invite -> {invite}; GET /org-admin/invites -> {invites}. */
export interface TeamInvite {
  id: number | string;
  email: string;
  role: TeamRole;
  monthly_spend_limit: number | null;
  currency?: string | null;
  invited_by_name?: string | null;
  created_at?: string | null;
  expires_at?: string | null;
  status?: string;
}

/** GET /me/team */
export interface MyTeam {
  organization: { name: string; account_number?: string | null } | null;
  role: string | null;
  is_admin: boolean;
  admins: { full_name: string | null; email: string }[];
  monthly_spend_limit: number | null;
  spend_this_month: number | null;
  currency: string | null;
  pending_request: { sent_to_email: string; requested_at: string | null } | null;
  invites: {
    id: number | string;
    organization_name: string;
    invited_by_name: string | null;
    role: TeamRole;
    monthly_spend_limit: number | null;
    currency: string | null;
    expires_at: string | null;
  }[];
}

export const teamApi = (path: string, init?: RequestInit) =>
  apiFetch(`${API_BASE}${path}`, init);

export const jsonBody = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: body === undefined ? undefined : JSON.stringify(body),
});

/**
 * The API's error code, if any: `detail` as a bare string ("last_admin") or
 * as {code, message}.
 */
export function errorCode(body: unknown): string | null {
  const d = (body as { detail?: unknown } | null)?.detail;
  if (typeof d === "string") return d;
  if (d && typeof d === "object" && "code" in d && typeof (d as { code: unknown }).code === "string") {
    return (d as { code: string }).code;
  }
  return null;
}

/** A sentence for the person, from whatever shape the API's error came in. */
export function errorText(body: unknown, fallback: string): string {
  const d = (body as { detail?: unknown } | null)?.detail;
  if (typeof d === "string" && d.includes(" ")) return d;
  if (d && typeof d === "object" && !Array.isArray(d)) {
    const m = (d as { message?: unknown }).message;
    if (typeof m === "string" && m) return m;
  }
  if (Array.isArray(d) && d[0] && typeof d[0].msg === "string") return d[0].msg;
  return fallback;
}

export async function readJson(res: Response): Promise<unknown> {
  return res.json().catch(() => null);
}

export const teamCurrency = (v: unknown, fallback: Currency = "INR"): Currency =>
  parseCurrency(v) ?? fallback;

export const money = (v: number | null | undefined, cur: Currency) =>
  formatMoney(v ?? 0, cur);

/**
 * Parse a limit field: "" means no limit (null); otherwise a positive number.
 * Returns undefined for something that is not a valid amount.
 */
export function parseLimit(raw: string): number | null | undefined {
  const s = raw.replace(/[,\s₹$]/g, "");
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.round(n * 100) / 100;
}

/** Share of the limit used, 0..100, or null with no limit. */
export function limitPercent(spend: number | null | undefined, limit: number | null | undefined): number | null {
  if (limit == null || limit <= 0) return null;
  return Math.min(100, Math.max(0, ((spend ?? 0) / limit) * 100));
}

export function roleLabel(role: string | null | undefined): string {
  return role === "org_admin" ? "Admin" : "Member";
}

export function ago(ts: string | null | undefined): string {
  if (!ts) return "";
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} days ago`;
}

export function shortDate(ts: string | null | undefined): string {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Shared input style (matches the Org Portal's existing fields). */
export const inputCls =
  "h-11 w-full rounded-cf border border-rule bg-paper px-3 text-base text-ink outline-none placeholder:text-ink-3 focus:border-blue md:h-10 md:text-sm";

/** Quiet outline button, the page's secondary action size. */
export const quietBtn =
  "inline-flex min-h-11 items-center justify-center rounded-cf border border-rule-strong px-4 text-xs font-semibold whitespace-nowrap text-ink-2 transition hover:bg-paper-2 disabled:opacity-50";

/** The one solid action in a block. */
export const solidBtn =
  "inline-flex min-h-11 items-center justify-center rounded-cf bg-blue px-4 text-xs font-semibold whitespace-nowrap text-white transition hover:bg-blue-ink disabled:opacity-50";

export const okMsg = "rounded-cf border border-blue/25 bg-blue-soft px-3 py-2 text-xs leading-5 break-words text-blue";
export const errMsg =
  "rounded-cf border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs leading-5 break-words text-destructive";
