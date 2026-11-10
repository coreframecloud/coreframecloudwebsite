/**
 * CFD drafts: form first, account at payment (owner, 10 Nov 2026).
 *
 * A visitor without an account fills the /cfd form and uploads the model; the
 * control plane keeps it as a draft (apps/api/app/api/cfd_drafts.py) against an
 * HttpOnly first-party cookie it sets itself (cf_cfd_draft: essential, not the
 * consent-gated cf_vid; this script never sees it). The visitor sees the check
 * and the price, and signs up only at "Pay". Signed in, the draft is claimed
 * into a normal job and they land on its page at the payment step.
 */
import { API_BASE } from "@/lib/api-base";
import { apiFetch } from "@/lib/session";
import type { Currency } from "@/lib/money";
import type { CfdServiceId } from "@/lib/cfd-services";

export interface DraftProblem {
  code: string;
  message: string;
  fix?: string;
}

export interface DraftPackageEstimate {
  package: string;
  label: string;
  low: string;
  high: string;
}

export interface DraftView {
  status: "open" | "claimed";
  service: CfdServiceId;
  currency: Currency;
  expires_at: string;
  job: Record<string, unknown>;
  file: { name: string; size_bytes: number; uploaded_at: string | null } | null;
  check: {
    status: "none" | "pending" | "complete" | "problem";
    problems: DraftProblem[];
    /** Asked on the job page after sign-in, free, before the fee: the inlet, the units. */
    confirm_after_sign_in?: DraftProblem[];
  };
  rejection: DraftProblem[] | null;
  size_estimate: { text?: string; note?: string | null; verdict?: string } | null;
  quote_fee: {
    currency: Currency;
    label: string;
    small: string;
    large: string;
    small_max_cells: number | null;
    total?: string;
    tier?: string;
    tier_text?: string;
  } | null;
  run_estimate: { currency: Currency; default_package: string | null; packages: DraftPackageEstimate[]; note: string } | null;
  pay_requested: boolean;
  claimed_ref_id: string | null;
  can_pay: boolean;
}

export class DraftError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const r = await apiFetch(`${API_BASE}/cfd-drafts${path}`, init);
  const body = (await r.json().catch(() => ({}))) as { detail?: unknown } & T;
  if (!r.ok) {
    const d = body.detail as { message?: string; code?: string } | string | undefined;
    const msg = typeof d === "string" ? d : d?.message || `HTTP ${r.status}`;
    throw new DraftError(msg, r.status, typeof d === "object" ? d?.code : undefined);
  }
  return body;
}

/** This browser's draft, or null when there is none. */
export async function getDraft(): Promise<DraftView | null> {
  try {
    return await call<DraftView>("/current");
  } catch (e) {
    if (e instanceof DraftError && e.status === 404) return null;
    throw e;
  }
}

export function saveDraft(service: CfdServiceId, currency: Currency, job: Record<string, unknown>): Promise<DraftView> {
  return call<DraftView>("", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service, currency, job }),
  });
}

export function uploadDraftFile(file: File): Promise<DraftView> {
  const fd = new FormData();
  fd.append("file", file);
  return call<DraftView>("/current/upload", { method: "POST", body: fd });
}

/** "Pay" pressed: what is needed next. */
export function payDraft(): Promise<{ next: "claim" | "sign_in" | "verify" }> {
  return call("/current/pay", { method: "POST" });
}

/** Signed in with a complete account: the draft becomes a job; its page is the payment step. */
export function claimDraft(): Promise<{ ref_id: string }> {
  return call("/current/claim", { method: "POST" });
}

export function discardDraft(): Promise<unknown> {
  return call("/current", { method: "DELETE" });
}

/** Where sign-up / sign-in bring the visitor back to: the draft, ready to pay. */
export const DRAFT_RETURN = "/cfd?resume=1#start";
