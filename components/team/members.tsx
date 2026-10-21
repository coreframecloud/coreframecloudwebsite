"use client";

import { Fragment, useId, useState } from "react";
import type { Currency } from "@/lib/money";
import SpendBar from "@/components/team/spend-bar";
import {
  errMsg,
  errorCode,
  errorText,
  inputCls,
  jsonBody,
  money,
  okMsg,
  parseLimit,
  quietBtn,
  readJson,
  roleLabel,
  solidBtn,
  teamApi,
  teamCurrency,
} from "@/lib/team";

export interface TeamMember {
  id: number;
  email: string;
  full_name: string;
  role: string;
  status: string;
  billable_hours?: number;
  storage_bytes?: number;
  session_count?: number;
  last_session_at?: string | null;
  /** Teams v2 (20 Oct 2026). Optional so an older API still renders. */
  monthly_spend_limit?: number | null;
  spend_this_month?: number | null;
  currency?: string | null;
}

function formatBytes(bytes: number | undefined): string {
  if (!bytes) return "—";
  if (bytes < 1024 ** 3) return (bytes / 1024 ** 2).toFixed(1) + " MB";
  return (bytes / 1024 ** 3).toFixed(2) + " GB";
}

function RoleBadge({ role }: { role: string }) {
  const admin = role === "org_admin";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${admin ? "border-blue/25 bg-blue-soft text-blue" : "border-rule-strong bg-paper-2 text-ink-2"}`}
    >
      {roleLabel(role)}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === "active";
  const label = active ? "Active" : status === "inactive" ? "Deactivated" : status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${active ? "border-rule-strong bg-paper text-ink-2" : "border-destructive/30 bg-destructive/5 text-destructive"}`}
    >
      {label}
    </span>
  );
}

/** Make admin / member, edit the monthly limit, remove from the team (or activate someone
 *  an admin deactivated before 21 Oct 2026). */
function ManagePanel({
  m,
  isSelf,
  currency,
  onChanged,
  onClose,
}: {
  m: TeamMember;
  isSelf: boolean;
  currency: Currency;
  onChanged: () => void;
  onClose: () => void;
}) {
  const id = useId();
  const [limit, setLimit] = useState(m.monthly_spend_limit != null ? String(m.monthly_spend_limit) : "");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const name = m.full_name || m.email;
  const sym = currency === "USD" ? "$" : "₹";
  const isAdmin = m.role === "org_admin";

  async function run(key: string, path: string, init: RequestInit, done: string, fail: string) {
    setBusy(key);
    setMsg(null);
    try {
      const res = await teamApi(path, init);
      const body = await readJson(res);
      if (res.status === 409 && errorCode(body) === "last_admin") {
        throw new Error("A team always needs at least one admin. Make someone else an admin first.");
      }
      if (!res.ok) throw new Error(errorText(body, fail));
      setMsg({ ok: true, text: done });
      onChanged();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : fail });
    } finally {
      setBusy(null);
    }
  }

  function changeRole() {
    const role = isAdmin ? "member" : "org_admin";
    if (isSelf && isAdmin && !window.confirm("Make yourself a member? You will lose access to this portal.")) return;
    void run(
      "role",
      `/org-admin/members/${m.id}/role`,
      jsonBody("PATCH", { role }),
      `${name} is now ${role === "org_admin" ? "an admin" : "a member"}.`,
      "Couldn't change the role.",
    );
  }

  function saveLimit(e: React.FormEvent) {
    e.preventDefault();
    const lim = parseLimit(limit);
    if (lim === undefined) {
      setMsg({ ok: false, text: "Enter the limit as a number, or leave it empty for no limit." });
      return;
    }
    void run(
      "limit",
      `/org-admin/members/${m.id}/limit`,
      jsonBody("PATCH", { monthly_spend_limit: lim }),
      lim == null ? `${name} has no limit now.` : `${name}'s limit is ${money(lim, currency)} a month.`,
      "Couldn't save the limit.",
    );
  }

  // Remove from the team, not "Deactivate" (review M9, 21 Oct 2026): deactivating disabled
  // the person's whole Coreframe account, their own wallet and files included. Removing ends
  // their team session and moves them to a personal account they keep.
  function removeFromTeam() {
    if (
      !window.confirm(
        `Remove ${name} from the team? They can no longer use the company wallet or files drive. Their own account, wallet and personal files stay theirs.`,
      )
    )
      return;
    void run(
      "status",
      `/org-admin/members/${m.id}/remove`,
      { method: "POST" },
      `${name} is no longer in the team.`,
      "Couldn't remove this member.",
    );
  }

  function activate() {
    if (!window.confirm(`Activate ${name}?`)) return;
    void run(
      "status",
      `/org-admin/members/${m.id}/status`,
      jsonBody("PATCH", { status: "active" }),
      `${name} is active again.`,
      "Couldn't update the status.",
    );
  }

  return (
    <div className="space-y-4 bg-paper-2/60 px-4 py-4 sm:px-5">
      <form onSubmit={saveLimit} className="flex flex-wrap items-end gap-2">
        <div className="w-full sm:w-48">
          <label htmlFor={`${id}-lim`} className="mb-1.5 block text-xs font-medium text-ink-2">
            Monthly spending limit ({sym})
          </label>
          <input
            id={`${id}-lim`}
            type="number"
            inputMode="decimal"
            min="1"
            step="any"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            aria-describedby={`${id}-lim-hint`}
            className={`${inputCls} tabular-nums`}
          />
        </div>
        <button type="submit" disabled={busy !== null} className={`${solidBtn} w-full sm:w-auto`}>
          {busy === "limit" ? "Saving…" : "Save limit"}
        </button>
        <p id={`${id}-lim-hint`} className="w-full text-xs text-ink-3">
          Empty means no limit.
        </p>
      </form>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={changeRole} disabled={busy !== null} className={`${quietBtn} flex-1 sm:flex-none`}>
          {busy === "role" ? "Saving…" : isAdmin ? "Make member" : "Make admin"}
        </button>
        {!isSelf && (
          <button
            type="button"
            onClick={m.status === "active" ? removeFromTeam : activate}
            disabled={busy !== null}
            className={`${quietBtn} flex-1 sm:flex-none ${m.status === "active" ? "text-destructive! hover:bg-destructive/5" : ""}`}
          >
            {busy === "status" ? "Saving…" : m.status === "active" ? "Remove from team" : "Activate"}
          </button>
        )}
        <button type="button" onClick={onClose} className={`${quietBtn} flex-1 sm:flex-none`}>
          Done
        </button>
      </div>
      <div aria-live="polite">{msg && <p className={msg.ok ? okMsg : errMsg}>{msg.text}</p>}</div>
    </div>
  );
}

/**
 * Org Portal members (Teams v2): role, status, spend this month against the
 * limit, and a Manage panel per person. A table from md up, cards on a phone.
 */
export default function Members({
  members,
  selfId,
  currency,
  onChanged,
}: {
  members: TeamMember[];
  selfId: number | null;
  currency: Currency;
  onChanged: () => void;
}) {
  const id = useId();
  const [open, setOpen] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const shown = q
    ? members.filter((m) => m.email.toLowerCase().includes(q) || (m.full_name || "").toLowerCase().includes(q))
    : members;

  const manageBtn = (m: TeamMember, where: "m" | "t") => (
    <button
      type="button"
      onClick={() => setOpen((o) => (o === m.id ? null : m.id))}
      aria-expanded={open === m.id}
      aria-controls={`${id}-${where}-panel-${m.id}`}
      className={quietBtn}
    >
      {open === m.id ? "Close" : "Manage"}
      <span className="sr-only"> {m.full_name || m.email}</span>
    </button>
  );

  const nameCell = (m: TeamMember) => (
    <>
      <p className="font-medium break-words text-ink">
        {m.full_name || m.email}
        {m.id === selfId && <span className="font-normal text-ink-3"> (you)</span>}
      </p>
      <p className="text-xs break-all text-ink-2">{m.email}</p>
    </>
  );

  const spend = (m: TeamMember) =>
    m.status !== "active" && !m.spend_this_month ? (
      <span className="text-sm text-ink-3">—</span>
    ) : (
      <SpendBar spend={m.spend_this_month} limit={m.monthly_spend_limit} currency={teamCurrency(m.currency, currency)} />
    );

  return (
    <section className="cf-glass overflow-hidden" aria-labelledby={`${id}-h`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-4 py-4 sm:px-5">
        <div>
          <h2 id={`${id}-h`} className="cf-section-title">Members.</h2>
          <p className="mt-1 text-xs text-ink-2">Spend this month, from the company wallet.</p>
        </div>
        <div className="w-full sm:w-56">
          <label htmlFor={`${id}-q`} className="sr-only">Search members by name or email</label>
          <input
            id={`${id}-q`}
            type="search"
            placeholder="Search name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-ink-3">
          {q ? "No members match your search." : "No members yet. Invite someone above."}
        </p>
      ) : (
        <>
          {/* Phone: one card per person. */}
          <ul className="divide-y divide-rule md:hidden">
            {shown.map((m) => (
              <li key={m.id} className={m.status !== "active" ? "opacity-70" : ""}>
                <div className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">{nameCell(m)}</div>
                    {manageBtn(m, "m")}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <RoleBadge role={m.role} />
                    <StatusBadge status={m.status} />
                  </div>
                  <div className="mt-3">{spend(m)}</div>
                </div>
                {open === m.id && (
                  <div id={`${id}-m-panel-${m.id}`}>
                    <ManagePanel
                      m={m}
                      isSelf={m.id === selfId}
                      currency={teamCurrency(m.currency, currency)}
                      onChanged={onChanged}
                      onClose={() => setOpen(null)}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Tablet and up: the table. */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-rule text-left font-mono text-[11px] tracking-[0.14em] text-ink-3 uppercase">
                  <th scope="col" className="px-4 py-3 font-medium">Name</th>
                  <th scope="col" className="px-4 py-3 font-medium">Role</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 font-medium">This month</th>
                  <th scope="col" className="px-4 py-3 font-medium whitespace-nowrap">GPU hrs</th>
                  <th scope="col" className="px-4 py-3 font-medium">Storage</th>
                  <th scope="col" className="px-4 py-3 font-medium"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {shown.map((m) => (
                  <Fragment key={m.id}>
                    <tr className={`align-middle ${m.status !== "active" ? "opacity-70" : ""}`}>
                      <td className="px-4 py-3">{nameCell(m)}</td>
                      <td className="px-4 py-3"><RoleBadge role={m.role} /></td>
                      <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                      <td className="px-4 py-3">{spend(m)}</td>
                      <td className="px-4 py-3 text-xs tabular-nums text-ink-2">{(m.billable_hours ?? 0).toFixed(1)}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap tabular-nums text-ink-2">{formatBytes(m.storage_bytes)}</td>
                      <td className="px-4 py-3 text-right">{manageBtn(m, "t")}</td>
                    </tr>
                    {open === m.id && (
                      <tr id={`${id}-t-panel-${m.id}`}>
                        <td colSpan={7} className="p-0">
                          <ManagePanel
                            m={m}
                            isSelf={m.id === selfId}
                            currency={teamCurrency(m.currency, currency)}
                            onChanged={onChanged}
                            onClose={() => setOpen(null)}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
