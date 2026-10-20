"use client";

import { useId, useState } from "react";
import type { Currency } from "@/lib/money";
import {
  ago,
  errMsg,
  errorText,
  inputCls,
  jsonBody,
  parseLimit,
  quietBtn,
  readJson,
  solidBtn,
  teamApi,
} from "@/lib/team";

export interface PendingMember {
  user_id: number;
  full_name: string | null;
  email: string;
  requested_at: string | null;
  phone_verified?: boolean;
}

/**
 * "Waiting for your approval" (Teams v2): people who asked to join, each with
 * a monthly limit field, Approve and Decline. Renders nothing when empty.
 */
export default function Approvals({
  pending,
  currency,
  onChanged,
}: {
  pending: PendingMember[];
  currency: Currency;
  onChanged: () => void;
}) {
  const id = useId();
  const [limits, setLimits] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sym = currency === "USD" ? "$" : "₹";

  if (pending.length === 0) return null;

  async function decide(m: PendingMember, approve: boolean) {
    const who = m.full_name || m.email;
    let body: Record<string, unknown> = {};
    if (approve) {
      const lim = parseLimit(limits[m.user_id] ?? "");
      if (lim === undefined) {
        setError(`Enter ${who}'s limit as a number, or leave it empty for no limit.`);
        return;
      }
      body = { monthly_spend_limit: lim };
    } else if (
      !window.confirm(`Decline ${who}? They keep their own account and pay for their own use.`)
    ) {
      return;
    }
    setBusy(m.user_id);
    setError(null);
    try {
      const res = await teamApi(
        `/org-admin/members/${m.user_id}/${approve ? "approve-membership" : "reject-membership"}`,
        jsonBody("POST", body),
      );
      if (!res.ok) {
        throw new Error(errorText(await readJson(res), `Couldn't ${approve ? "approve" : "decline"} ${who}.`));
      }
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't go through.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="cf-glass overflow-hidden border-l-2! border-l-blue!" aria-labelledby={`${id}-h`}>
      <div className="px-4 pt-4 sm:px-5">
        <h2 id={`${id}-h`} className="text-[15px] font-semibold text-ink">
          Waiting for your approval{" "}
          <span className="ml-1 rounded-full bg-hl/40 px-2 py-0.5 text-xs font-semibold text-ink">{pending.length}</span>
        </h2>
        <p className="mt-1 text-[13px] leading-5 text-ink-2">
          Approving bills their workstation time to the company wallet, up to the limit you set.
        </p>
        {error && <p className={`mt-3 ${errMsg}`} role="alert">{error}</p>}
      </div>
      <ul className="mt-2 divide-y divide-rule">
        {pending.map((m) => {
          const fid = `${id}-lim-${m.user_id}`;
          return (
            <li key={m.user_id} className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-5">
              <div className="min-w-0 flex-1 basis-56">
                <p className="text-sm font-medium break-words text-ink">{m.full_name || m.email}</p>
                <p className="mt-0.5 text-xs break-all text-ink-2">
                  {m.email}
                  {m.phone_verified ? " · mobile verified" : ""}
                  {m.requested_at ? ` · asked ${ago(m.requested_at)}` : ""}
                </p>
              </div>
              <div className="flex w-full flex-wrap items-end gap-2 sm:w-auto sm:flex-nowrap sm:items-center">
                <div className="w-full sm:w-36">
                  <label htmlFor={fid} className="mb-1 block text-xs text-ink-2 sm:sr-only">
                    Monthly limit ({sym}), empty for no limit
                  </label>
                  <input
                    id={fid}
                    type="number"
                    inputMode="decimal"
                    min="1"
                    step="any"
                    placeholder={`Limit (${sym})`}
                    value={limits[m.user_id] ?? ""}
                    onChange={(e) => setLimits((p) => ({ ...p, [m.user_id]: e.target.value }))}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void decide(m, false)}
                  disabled={busy === m.user_id}
                  className={`${quietBtn} flex-1 sm:flex-none`}
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => void decide(m, true)}
                  disabled={busy === m.user_id}
                  className={`${solidBtn} flex-1 sm:flex-none`}
                >
                  {busy === m.user_id ? "…" : "Approve"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
