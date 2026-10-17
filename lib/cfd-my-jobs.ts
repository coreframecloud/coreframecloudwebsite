/**
 * The signed-in account's CFD jobs (16 Oct 2026): GET /me/cfd-jobs.
 *
 * A job page opens only for the account that owns it (17 Oct 2026: the
 * emailed "private link" was removed), so this list on /my-activity is where
 * a customer finds their jobs. The list never carries a job token.
 */
import { API_BASE } from "@/lib/api-base";
import { apiFetch } from "@/lib/session";
import { customerWords } from "@/lib/cfd-words";

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
  _session: string,
  opts: { limit?: number; cursor?: string | null } = {},
): Promise<MyCfdJobsPage | "signed_out" | null> {
  const q = new URLSearchParams({ limit: String(opts.limit ?? 10) });
  if (opts.cursor) q.set("cursor", opts.cursor);
  try {
    const res = await apiFetch(`${API_BASE}/me/cfd-jobs?${q}`, { cache: "no-store" });
    if (res.status === 401) return "signed_out";
    if (!res.ok) return null;
    return customerWords((await res.json()) as MyCfdJobsPage);
  } catch {
    return null;
  }
}
