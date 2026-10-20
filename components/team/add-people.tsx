"use client";

import { useId, useState } from "react";
import type { Currency } from "@/lib/money";
import {
  errMsg,
  errorText,
  inputCls,
  jsonBody,
  money,
  okMsg,
  parseLimit,
  readJson,
  roleLabel,
  shortDate,
  solidBtn,
  quietBtn,
  teamApi,
  teamCurrency,
  type TeamInvite,
  type TeamRole,
} from "@/lib/team";

/**
 * Org Portal, "Add people" (Teams v2, 20 Oct 2026): invite by any email with
 * a monthly limit and a role, how a colleague can ask to join instead, and
 * the invites still waiting to be accepted (revocable).
 */
export default function AddPeople({
  currency,
  adminEmail,
  invites,
  onChanged,
}: {
  currency: Currency;
  adminEmail: string | null;
  invites: TeamInvite[];
  onChanged: () => void;
}) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [limit, setLimit] = useState("");
  const [role, setRole] = useState<TeamRole>("member");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [revoking, setRevoking] = useState<TeamInvite["id"] | null>(null);
  const [listErr, setListErr] = useState<string | null>(null);
  const sym = currency === "USD" ? "$" : "₹";

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const lim = parseLimit(limit);
    if (lim === undefined) {
      setMsg({ ok: false, text: "Enter the limit as a number, or leave it empty for no limit." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await teamApi(
        "/org-admin/invite",
        jsonBody("POST", { email: email.trim(), role, monthly_spend_limit: lim }),
      );
      const body = await readJson(res);
      if (res.status === 409) {
        throw new Error(errorText(body, "That person is already in your team."));
      }
      if (!res.ok) throw new Error(errorText(body, "The invite didn't go through. Try again."));
      setMsg({ ok: true, text: `Invite sent to ${email.trim()}.` });
      setEmail("");
      setLimit("");
      setRole("member");
      onChanged();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "The invite didn't go through." });
    } finally {
      setBusy(false);
    }
  }

  async function revoke(inv: TeamInvite) {
    if (!window.confirm(`Revoke the invite to ${inv.email}?`)) return;
    setRevoking(inv.id);
    setListErr(null);
    try {
      const res = await teamApi(`/org-admin/invites/${encodeURIComponent(String(inv.id))}`, { method: "DELETE" });
      if (!res.ok && res.status !== 404) {
        throw new Error(errorText(await readJson(res), "Couldn't revoke that invite."));
      }
      onChanged();
    } catch (err) {
      setListErr(err instanceof Error ? err.message : "Couldn't revoke that invite.");
    } finally {
      setRevoking(null);
    }
  }

  return (
    <section className="cf-glass p-5 sm:p-6" aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="cf-section-title">Add people.</h2>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={send} className="cf-glass-inset p-4 sm:p-5" aria-labelledby={`${id}-inv`}>
          <h3 id={`${id}-inv`} className="text-[15px] font-semibold text-ink">Invite a colleague</h3>
          <p className="mt-1.5 text-[13px] leading-5 text-ink-2">
            Any email works, Gmail too. If they already have a Coreframe account, the invite shows up
            in Connect and on their account page. If not, they sign up with that email and land in
            your team.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1.5fr_1fr_0.9fr]">
            <div>
              <label htmlFor={`${id}-email`} className="mb-1.5 block text-xs font-medium text-ink-2">
                Their email
              </label>
              <input
                id={`${id}-email`}
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor={`${id}-limit`} className="mb-1.5 block text-xs font-medium text-ink-2">
                Monthly spending limit ({sym})
              </label>
              <input
                id={`${id}-limit`}
                type="number"
                inputMode="decimal"
                min="1"
                step="any"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                aria-describedby={`${id}-limit-hint`}
                className={`${inputCls} tabular-nums`}
              />
            </div>
            <div>
              <label htmlFor={`${id}-role`} className="mb-1.5 block text-xs font-medium text-ink-2">
                Role
              </label>
              <select
                id={`${id}-role`}
                value={role}
                onChange={(e) => setRole(e.target.value === "org_admin" ? "org_admin" : "member")}
                className={`${inputCls} cursor-pointer`}
              >
                <option value="member">Member</option>
                <option value="org_admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p id={`${id}-limit-hint`} className="text-xs leading-5 text-ink-3">
              Leave the limit empty for no limit. You can change it any time.
            </p>
            <button type="submit" disabled={busy} className={`${solidBtn} w-full sm:w-auto`}>
              {busy ? "Sending…" : "Send invite"}
            </button>
          </div>
          <div aria-live="polite">{msg && <p className={`mt-3 ${msg.ok ? okMsg : errMsg}`}>{msg.text}</p>}</div>
        </form>

        <div className="rounded-cf border border-rule bg-paper-2 p-4 sm:p-5">
          <h3 className="text-[15px] font-semibold text-ink">Or they ask to join</h3>
          <p className="mt-1.5 text-[13px] leading-5 text-ink-2">
            A colleague with their own account picks <span className="font-semibold text-ink">Connect with my team</span>{" "}
            in Connect or on their account page and types your email
            {adminEmail ? (
              <>
                , <span className="break-all text-ink">{adminEmail}</span>
              </>
            ) : null}
            . The request appears here and by email, and you approve it with a spending limit.
          </p>
          <p className="mt-3 text-xs leading-5 text-ink-3">
            Nobody joins without you or another admin saying yes.
          </p>
        </div>
      </div>

      {invites.length > 0 && (
        <div className="mt-6">
          <h3 className="text-[15px] font-semibold text-ink">
            Invites not accepted yet <span className="font-normal text-ink-3">({invites.length})</span>
          </h3>
          {listErr && <p className={`mt-2 ${errMsg}`} role="alert">{listErr}</p>}
          <ul className="mt-2 divide-y divide-rule rounded-cf border border-rule">
            {invites.map((inv) => {
              const cur = teamCurrency(inv.currency, currency);
              return (
                <li key={inv.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium break-all text-ink">{inv.email}</p>
                    <p className="mt-0.5 text-xs text-ink-2">
                      {roleLabel(inv.role)} ·{" "}
                      {inv.monthly_spend_limit != null
                        ? `${money(inv.monthly_spend_limit, cur)} a month`
                        : "No limit"}
                      {inv.invited_by_name ? ` · from ${inv.invited_by_name}` : ""}
                      {inv.expires_at ? ` · expires ${shortDate(inv.expires_at)}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void revoke(inv)}
                    disabled={revoking === inv.id}
                    className={`${quietBtn} w-full sm:w-auto`}
                    aria-label={`Revoke the invite to ${inv.email}`}
                  >
                    {revoking === inv.id ? "Revoking…" : "Revoke"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
