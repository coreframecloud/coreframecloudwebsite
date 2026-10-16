/**
 * The signed-in account's CFD jobs (16 Oct 2026): GET /me/cfd-jobs, and the
 * "account access" that opens a job page without the emailed #t= token.
 *
 * Before this a signed-in customer could not find their jobs anywhere: the job
 * page opened only from the private link in an email. The API now lets the
 * job's own account open the page and use every action with its session
 * (control plane apps/api/app/api/cfd_owner.py), and lists the account's jobs.
 * The list never carries a job token.
 */
import { API_BASE } from "@/lib/api-base";
import { customerWords } from "@/lib/cfd-words";

/**
 * Stands in for the job token when the page is opened by its signed-in owner.
 * Never sent: jobUrl() leaves the token off and the bearer goes instead.
 */
export const ACCOUNT_ACCESS = "@account";

export function isAccountAccess(token: string | null | undefined): boolean {
  return token === ACCOUNT_ACCESS;
}

/** `token=…` for a job URL, or "" when the session opens the job. */
export function tokenQuery(token: string): string {
  return isAccountAccess(token) ? "" : `token=${encodeURIComponent(token)}`;
}

export interface MyCfdJob {
  ref: string;
  name: string;
  status: string;
  status_label: string;
  tone: "attention" | "active" | "done" | "ended";
  created_at: string | null;
  updated_at: string | null;
  completed_at: string | null;
  currency: string;
  quote_fee_paid: string;
  held: string;
  charged: string;
  credited: string;
  spent: string;
  headline: { pressure_drop_pa?: number } | null;
  needs_action: { code: string; label: string } | null;
}

export interface MyCfdJobsPage {
  jobs: MyCfdJob[];
  next_cursor: string | null;
}

export async function fetchMyCfdJobs(
  bearer: string,
  opts: { limit?: number; cursor?: string | null } = {},
): Promise<MyCfdJobsPage | "signed_out" | null> {
  const q = new URLSearchParams({ limit: String(opts.limit ?? 10) });
  if (opts.cursor) q.set("cursor", opts.cursor);
  try {
    const res = await fetch(`${API_BASE}/me/cfd-jobs?${q}`, {
      headers: { Authorization: `Bearer ${bearer}` },
      cache: "no-store",
    });
    if (res.status === 401) return "signed_out";
    if (!res.ok) return null;
    return customerWords((await res.json()) as MyCfdJobsPage);
  } catch {
    return null;
  }
}
