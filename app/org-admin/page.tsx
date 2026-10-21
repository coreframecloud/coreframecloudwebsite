"use client";

import { apiFetch, sessionMarker } from "@/lib/session";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/api-base";
import { parseCurrency, type Currency } from "@/lib/money";
import AddPeople from "@/components/team/add-people";
import Approvals, { type PendingMember } from "@/components/team/approvals";
import Members, { type TeamMember } from "@/components/team/members";
import type { TeamInvite } from "@/lib/team";

const API = API_BASE;

interface OrgInfo {
  user_id: number;
  email: string;
  full_name: string;
  role: string;
  wallet_balance_rupees: number;
  org_id: number;
  org_name: string;
  org_code: string;
  org_plan: string;
  org_status: string;
  email_domain: string | null;
  gstin: string | null;
  billing_state: string | null;
  member_count: number;
}

interface Usage {
  billing_mode: string;
  credit_limit_rupees: number | null;
  credit_used_rupees: number | null;
  balance_rupees: number;
  month_to_date: {
    period_start: string;
    billed_rupees: number;
    billable_hours: number;
    session_count: number;
    active_sessions: number;
  };
  storage: {
    used_bytes: number;
    used_gb: number;
    quota_gb: number | null;
    percent_used: number | null;
    source?: "zfs" | "estimate";
  };
  member_count: number;
}

export default function OrgAdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  // People who asked to join (Teams v2: "Connect with my team") and are
  // waiting on an admin to approve them with a spending limit.
  const [pending, setPending] = useState<PendingMember[]>([]);
  // Invites sent and not accepted yet (Teams v2, 20 Oct 2026).
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wallet topup modal state
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupNote, setTopupNote] = useState("");
  const [topupRef, setTopupRef] = useState("");
  const [topupMethod, setTopupMethod] = useState("neft");
  const [topupPaidAt, setTopupPaidAt] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupMsg, setTopupMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Billing profile (GSTIN) modal state
  const [showBilling, setShowBilling] = useState(false);
  const [billingGstin, setBillingGstin] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingMsg, setBillingMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // The organisation's currency. Teams v2 sends it as `currency` on every
  // member and invite; before that, the admin's own wallet is the one that
  // pays, so its `billing_currency` (an older API: INR). Every amount on this
  // page is in it (owner, 18 Oct 2026).
  const [orgCur, setOrgCur] = useState<Currency>("INR");
  const sym = orgCur === "USD" ? "$" : "₹";
  const locale = orgCur === "USD" ? "en-US" : "en-IN";

  const loadData = useCallback(() => {
    return Promise.all([
      apiFetch(`${API}/org-admin/me`),
      apiFetch(`${API}/org-admin/team`),
      apiFetch(`${API}/org-admin/pending-members`),
      apiFetch(`${API}/org-admin/usage`),
      apiFetch(`${API}/me/wallet`).catch(() => null),
      apiFetch(`${API}/org-admin/invites`).catch(() => null),
    ]).then(async ([meRes, teamRes, pendingRes, usageRes, walletRes, invitesRes]) => {
      if (meRes.status === 401) throw new Error("token_expired");
      if (meRes.status === 403) throw new Error("access_denied");
      if (meRes.status === 404) throw new Error("not_deployed");
      if (!meRes.ok) throw new Error(`api_error_${meRes.status}`);
      const me: OrgInfo = await meRes.json();
      // A list; tolerate a {members: [...]} wrapper too.
      const teamBody = teamRes.ok ? await teamRes.json().catch(() => []) : [];
      const members: TeamMember[] = Array.isArray(teamBody)
        ? teamBody
        : Array.isArray(teamBody?.members) ? teamBody.members : [];
      setOrgInfo(me);
      setTeam(members);
      // Tolerate a 404 here so the page still works against an older API.
      const pendingBody = pendingRes.ok ? await pendingRes.json() : { pending: [] };
      setPending(Array.isArray(pendingBody.pending) ? pendingBody.pending : []);
      // Tolerated the same way as pending-members: a 404 here means the API
      // predates /usage, and the page should still show the team rather than
      // failing wholesale over a stat card.
      setUsage(usageRes.ok ? await usageRes.json() : null);
      const w = walletRes?.ok ? await walletRes.json().catch(() => null) : null;
      const invBody = invitesRes?.ok ? await invitesRes.json().catch(() => null) : null;
      const invList: TeamInvite[] = Array.isArray(invBody?.invites) ? invBody.invites : [];
      setInvites(invList.filter((i) => !i.status || i.status === "pending"));
      setOrgCur(
        parseCurrency(members.find((m) => m.currency)?.currency) ??
          parseCurrency(w?.billing_currency) ??
          parseCurrency(w?.wallet_currency) ??
          "INR",
      );
    });
  }, []);

  useEffect(() => {
    const tok = sessionMarker();
    if (!tok) { setLoading(false); return; }
    setToken(tok);
    loadData().catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [loadData]);

  async function handleTopup(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const amt = parseFloat(topupAmount);
    if (!amt || amt <= 0) { setTopupMsg({ ok: false, text: "Enter a valid amount" }); return; }
    if (topupRef.trim().length < 4) {
      // The reference is what an admin searches for in the bank statement. A
      // claim without one cannot be confirmed, so it cannot be accepted.
      setTopupMsg({ ok: false, text: "Enter the UTR / transaction reference from your bank" });
      return;
    }
    setTopupLoading(true);
    setTopupMsg(null);
    try {
      // /wallet/topup-request, NOT /wallet/topup. The old endpoint credited the
      // caller's own wallet with no payment confirmation and was removed — this
      // button had been calling a 404 ever since. Submitting now RECORDS a claim;
      // the balance moves only when Coreframe confirms the transfer.
      const res = await apiFetch(`${API}/org-admin/wallet/topup-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount_rupees: amt,
          payment_method: topupMethod,
          payment_reference: topupRef.trim(),
          paid_at: topupPaidAt ? new Date(topupPaidAt).toISOString() : null,
          note: topupNote.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed");
      // Never claim the money is available. It is not, until an admin confirms.
      setTopupMsg({ ok: true, text: data.message });
      setTopupAmount("");
      setTopupRef("");
      setTopupNote("");
      loadData().catch(() => {});
    } catch (e: unknown) {
      setTopupMsg({ ok: false, text: e instanceof Error ? e.message : "Error" });
    } finally {
      setTopupLoading(false);
    }
  }

  async function handleBillingUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const gstin = billingGstin.trim().toUpperCase() || null;
    if (gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin)) {
      setBillingMsg({ ok: false, text: "Invalid GSTIN format (15 chars, e.g. 29ABCDE1234F1Z5)" });
      return;
    }
    setBillingLoading(true);
    setBillingMsg(null);
    try {
      const res = await apiFetch(`${API}/org-admin/billing`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gstin, billing_state: billingState || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed");
      setBillingMsg({ ok: true, text: "Billing profile saved" });
      loadData().catch(() => {});
      setTimeout(() => setShowBilling(false), 1200);
    } catch (e: unknown) {
      setBillingMsg({ ok: false, text: e instanceof Error ? e.message : "Error" });
    } finally {
      setBillingLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center text-sm text-ink-3">
        <div className="cf-aurora" />
        Loading…
      </div>
    );
  }

  if (!token) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="cf-aurora" />
        <div className="cf-glass w-full max-w-md p-6 text-center sm:p-8">
          <h1 className="font-display text-2xl leading-tight font-semibold text-ink">
            Sign in to open the org portal.
          </h1>
          <p className="mt-2 text-[15px] leading-6 text-ink-2">
            Your team, wallet and usage sit behind your account.
          </p>
          <Link href="/login" className="cf-btn-primary mt-6 w-full sm:w-auto">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (error === "access_denied") {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="cf-aurora" />
        <div className="cf-glass w-full max-w-md p-6 text-center sm:p-8">
          <p className="cf-eyebrow">Access needed</p>
          <h1 className="mt-2 font-display text-2xl leading-tight font-semibold text-ink">
            This portal is for org admins.
          </h1>
          <p className="mt-2 text-[15px] leading-6 text-ink-2">
            Ask your Coreframe admin to give you the org_admin role.
          </p>
          <Link href="/my-activity" className="cf-btn-secondary mt-6 w-full sm:w-auto">
            Back to my activity
          </Link>
        </div>
      </div>
    );
  }

  if (error === "token_expired") {
    // Clear stale token and redirect to login
    if (typeof window !== "undefined") {
      localStorage.removeItem("cf_customer_token");
      localStorage.removeItem("cf_customer_user");
      window.location.href = "/login";
    }
    return null;
  }

  if (error === "not_deployed") {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="cf-aurora" />
        <div className="cf-glass w-full max-w-md p-6 text-center sm:p-8">
          <p className="cf-eyebrow">Not available</p>
          <h1 className="mt-2 font-display text-2xl leading-tight font-semibold text-ink">
            The org portal API is not up yet.
          </h1>
          <p className="mt-2 text-[15px] leading-6 text-ink-2">
            Rebuild and deploy the API container to turn this on.
          </p>
          <Link href="/my-activity" className="cf-btn-secondary mt-6 w-full sm:w-auto">
            Back
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="cf-aurora" />
        <div className="cf-glass w-full max-w-md p-6 text-center sm:p-8">
          <p className="rounded-cf border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm break-words text-destructive">
            This did not load ({error}). Sign in again.
          </p>
          <Link href="/login" className="cf-btn-primary mt-6 w-full sm:w-auto">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const totalHours = team.reduce((s, m) => s + (m.billable_hours ?? 0), 0);
  const activeCount = team.filter((m) => m.status === "active").length;

  return (
    <div className="relative min-h-screen text-ink">
      <div className="cf-aurora" />
      {/* Top bar */}
      <div className="border-b border-rule px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="cf-eyebrow mb-1.5">Org admin portal</p>
            <h1 className="cf-section-title break-words">{orgInfo?.org_name}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {orgInfo?.gstin ? (
              <button
                onClick={() => { setBillingGstin(orgInfo.gstin || ""); setBillingState(orgInfo.billing_state || ""); setBillingMsg(null); setShowBilling(true); }}
                className="rounded-full border border-blue/25 bg-blue-soft px-2.5 py-1 font-mono text-xs break-all text-blue transition hover:bg-blue/10"
                title="Edit GSTIN"
              >
                GST: {orgInfo.gstin}
              </button>
            ) : (
              <button
                onClick={() => { setBillingGstin(orgInfo?.gstin || ""); setBillingState(orgInfo?.billing_state || ""); setBillingMsg(null); setShowBilling(true); }}
                className="rounded-full border border-rule-strong px-2.5 py-1 text-xs font-medium text-ink-2 transition hover:border-blue hover:text-blue"
              >
                Add GSTIN
              </button>
            )}
            {/* billing_mode only. This used to render `org_plan`, which holds
                plan_type — an internal value like "monthly" that means nothing
                to a customer and was left over from an earlier design. No
                fallback: showing the legacy field when /usage is unavailable
                would put "monthly" back on the screen intermittently, which is
                worse than showing nothing. */}
            {usage?.billing_mode && (
              <span className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${usage.billing_mode === "postpaid" ? "border-rule-strong bg-paper-2 text-ink-2" : "border-blue/25 bg-blue-soft text-blue"}`}>
                {usage.billing_mode}
              </span>
            )}
            <Link href="/my-activity" className="text-xs font-medium text-blue transition hover:text-blue-ink">
              ← My activity
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">

        {/* ── This month, and what is left ──────────────────────────────────
            The three questions an admin opens this page to answer: what have
            we spent, how much storage is left, and is anyone rendering now.
            Rendered only when /usage responded, so an older API degrades to
            the team table rather than to a row of dashes. */}
        {usage && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="cf-glass border-l-2! border-l-blue! px-5 py-4">
              <p className="cf-eyebrow mb-2">Month to date</p>
              <p className="font-display text-2xl font-bold tabular-nums whitespace-nowrap">
                {sym}{usage.month_to_date.billed_rupees.toLocaleString(locale, { maximumFractionDigits: 0 })}
              </p>
              <p className="mt-1 text-[11px] tabular-nums text-ink-2">
                {usage.month_to_date.billable_hours.toFixed(1)} GPU-h · {usage.month_to_date.session_count} sessions
              </p>
            </div>

            <div className="cf-glass px-5 py-4">
              <p className="cf-eyebrow mb-2">Storage used</p>
              <p className="font-display text-2xl font-bold tabular-nums whitespace-nowrap">
                {usage.storage.used_gb.toFixed(1)}
                <span className="text-base font-normal text-ink-3">
                  {usage.storage.quota_gb ? ` / ${usage.storage.quota_gb} GB` : " GB"}
                </span>
              </p>
              {usage.storage.percent_used !== null && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                  <div
                    className={`h-full rounded-full ${usage.storage.percent_used >= 90 ? "bg-destructive" : usage.storage.percent_used >= 75 ? "bg-blue-ink" : "bg-blue"}`}
                    style={{ width: `${Math.max(2, usage.storage.percent_used)}%` }}
                  />
                </div>
              )}
              {usage.storage.quota_gb === null && (
                <p className="mt-1 text-[11px] text-ink-2">No quota set</p>
              )}
              {/* An estimate must not look like a measurement. When the NAS is
                  unreachable this figure is summed from upload records and
                  overstates anything since deleted, so it says so. */}
              {usage.storage.source === "estimate" && (
                <p className="mt-1 text-[11px] font-medium text-ink-2" title="Summed from upload history because the storage server could not be reached. Deleted files are still counted.">
                  Estimated · NAS unreachable
                </p>
              )}
            </div>

            <div className="cf-glass px-5 py-4">
              <p className="cf-eyebrow mb-2">Rendering now</p>
              <p className="font-display text-2xl font-bold tabular-nums">{usage.month_to_date.active_sessions}</p>
              <p className="mt-1 text-[11px] tabular-nums text-ink-2">of {usage.member_count} members</p>
            </div>

            {/* Prepaid shows the shared balance; postpaid shows credit consumed
                against the limit. They are different questions and must not be
                shown with the same label. */}
            {usage.billing_mode === "postpaid" ? (
              <div className="cf-glass border-l-2! border-l-blue! px-5 py-4">
                <p className="cf-eyebrow mb-2">Credit used</p>
                <p className="font-display text-2xl font-bold tabular-nums whitespace-nowrap">
                  {sym}{(usage.credit_used_rupees ?? 0).toLocaleString(locale, { maximumFractionDigits: 0 })}
                  {usage.credit_limit_rupees != null && (
                    <span className="text-base font-normal text-ink-3">
                      {" / "}{sym}{usage.credit_limit_rupees.toLocaleString(locale, { maximumFractionDigits: 0 })}
                    </span>
                  )}
                </p>
                <p className="mt-1 text-[11px] text-ink-2">
                  {usage.credit_limit_rupees == null ? "No limit set · invoiced monthly" : "Invoiced monthly"}
                </p>
              </div>
            ) : (
              <div className="cf-glass border-l-2! border-l-blue! px-5 py-4">
                <p className="cf-eyebrow mb-2">Shared balance</p>
                <p className="font-display text-2xl font-bold tabular-nums whitespace-nowrap">
                  {sym}{usage.balance_rupees.toLocaleString(locale, { maximumFractionDigits: 0 })}
                </p>
                <p className="mt-1 text-[11px] text-ink-2">Funds every member&apos;s sessions</p>
              </div>
            )}
          </div>
        )}

        {/* Stats + wallet row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Members", value: team.length },
            { label: "Active", value: activeCount },
            { label: "Waiting for you", value: pending.length },
            { label: "GPU Hours", value: totalHours.toFixed(1) + " h" },
          ].map((s) => (
            <div key={s.label} className="cf-glass px-5 py-4">
              <p className="cf-eyebrow mb-2">{s.label}</p>
              <p className="font-display text-2xl font-bold tabular-nums whitespace-nowrap">{s.value}</p>
            </div>
          ))}

          {/* Wallet card */}
          <div className="cf-glass flex flex-col justify-between border-l-2! border-l-blue! px-5 py-4">
            <div>
              <p className="cf-eyebrow mb-2">Wallet balance</p>
              <p className="font-display text-2xl font-bold tabular-nums whitespace-nowrap text-blue">{sym}{(orgInfo?.wallet_balance_rupees ?? 0).toFixed(2)}</p>
            </div>
            <button
              onClick={() => { setShowTopup(true); setTopupMsg(null); }}
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-cf border border-blue/30 px-3 text-xs font-semibold text-blue transition hover:bg-blue-soft"
            >
              Add funds
            </button>
          </div>
        </div>

        {/* Wallet topup modal */}
        {showTopup && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-ink/30 px-4 py-6 backdrop-blur-sm sm:items-center">
            <div className="cf-glass max-h-[calc(100dvh-3rem)] w-full max-w-sm overflow-y-auto p-5 sm:p-6">
              <h2 className="cf-section-title mb-1">Record a bank transfer.</h2>
              {/* States plainly that this is a claim, not a payment. A customer
                  who thinks the money is available and then has a session
                  refused concludes the platform is broken. */}
              <p className="mb-5 text-[13px] leading-5 text-ink-2">
                Transfer to the Coreframe account, then enter the details below.
                Your balance is credited once we confirm the transfer — usually
                within one business day.
              </p>
              <form onSubmit={handleTopup} className="space-y-3">
                <div>
                  <label className="mb-1.5 block cf-eyebrow">Amount transferred ({sym})</label>
                  <input
                    type="number" min="1" step="1" required
                    value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="h-11 w-full rounded-cf border border-rule bg-paper px-4 text-base text-ink outline-none placeholder:text-ink-3 focus:border-blue md:h-10 md:text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block cf-eyebrow">Paid by</label>
                  <select
                    value={topupMethod} onChange={(e) => setTopupMethod(e.target.value)}
                    className="h-11 w-full rounded-cf border border-rule bg-paper px-4 text-base text-ink outline-none placeholder:text-ink-3 focus:border-blue md:h-10 md:text-sm cursor-pointer"
                  >
                    {["neft", "rtgs", "imps", "upi", "cheque", "other"].map((m) => (
                      <option key={m} value={m} className="bg-paper text-ink">{m.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  {/* Required, not optional. This is the string an admin searches
                      for in the bank statement — without it the claim cannot be
                      confirmed and the money cannot be credited. */}
                  <label className="mb-1.5 block cf-eyebrow">UTR / transaction reference</label>
                  <input
                    type="text" required minLength={4}
                    value={topupRef} onChange={(e) => setTopupRef(e.target.value)}
                    placeholder="e.g. SBIN0123456789"
                    className="h-11 w-full rounded-cf border border-rule bg-paper px-4 text-base text-ink outline-none placeholder:text-ink-3 focus:border-blue md:h-10 md:text-sm font-mono tracking-wide"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block cf-eyebrow">Date of transfer</label>
                  <input
                    type="date"
                    value={topupPaidAt} onChange={(e) => setTopupPaidAt(e.target.value)}
                    className="h-11 w-full rounded-cf border border-rule bg-paper px-4 text-base text-ink outline-none placeholder:text-ink-3 focus:border-blue md:h-10 md:text-sm cursor-pointer"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block cf-eyebrow">Note (optional)</label>
                  <input
                    type="text"
                    value={topupNote} onChange={(e) => setTopupNote(e.target.value)}
                    placeholder="Anything we should know"
                    className="h-11 w-full rounded-cf border border-rule bg-paper px-4 text-base text-ink outline-none placeholder:text-ink-3 focus:border-blue md:h-10 md:text-sm"
                  />
                </div>
                {topupMsg && (
                  <p className={`rounded-cf px-3 py-2 text-xs leading-5 break-words ${topupMsg.ok ? "border border-blue/25 bg-blue-soft text-blue" : "border border-destructive/30 bg-destructive/5 text-destructive"}`}>
                    {topupMsg.text}
                  </p>
                )}
                <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                  <button type="submit" disabled={topupLoading}
                    className="cf-btn-primary w-full sm:flex-1 disabled:opacity-50">
                    {topupLoading ? "Submitting…" : "Submit for confirmation"}
                  </button>
                  <button type="button" onClick={() => setShowTopup(false)}
                    className="cf-btn-secondary w-full sm:w-auto">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Teams v2 (owner approved 20 Oct 2026): invite anyone with a
            monthly limit and a role, approve people who asked to join, and
            manage roles, limits and access. */}
        <AddPeople
          currency={orgCur}
          adminEmail={orgInfo?.email ?? null}
          invites={invites}
          onChanged={() => void loadData().catch(() => {})}
        />

        <Approvals
          pending={pending}
          currency={orgCur}
          onChanged={() => void loadData().catch(() => {})}
        />

        <Members
          members={team}
          selfId={orgInfo?.user_id ?? null}
          currency={orgCur}
          onChanged={() => void loadData().catch(() => {})}
        />

        <p className="text-center text-xs leading-5 text-ink-2">
          Nobody joins the team without an admin&apos;s yes. For billing changes email{" "}
          <a href="mailto:support@coreframecloud.com" className="break-all text-blue hover:text-blue-ink">support@coreframecloud.com</a>.
        </p>
      </div>

      {/* ── Billing Profile Modal ─────────────────────────────────────────── */}
      {showBilling && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-ink/30 p-4 backdrop-blur-sm sm:items-center">
          <div className="cf-glass max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto p-5 sm:p-6">
            <h3 className="cf-section-title mb-1">GST billing profile.</h3>
            <p className="mb-5 text-[13px] leading-5 text-ink-2">
              Your GSTIN appears on all invoices as the buyer. Required to claim GST input tax credit.
            </p>
            <form onSubmit={handleBillingUpdate} className="space-y-4">
              <div>
                <label className="mb-1.5 block cf-eyebrow">GSTIN <span className="text-ink-3">(optional)</span></label>
                <input
                  type="text"
                  value={billingGstin}
                  onChange={(e) => setBillingGstin(e.target.value.toUpperCase())}
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  maxLength={15}
                  className="h-11 w-full rounded-cf border border-rule bg-paper px-3 font-mono text-base tracking-wider text-ink outline-none placeholder:text-ink-3 focus:border-blue md:h-10 md:text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block cf-eyebrow">Billing state <span className="text-ink-3">(for CGST/SGST vs IGST routing)</span></label>
                <select
                  value={billingState}
                  onChange={(e) => setBillingState(e.target.value)}
                  className="h-11 w-full cursor-pointer rounded-cf border border-rule bg-paper px-3 text-base text-ink outline-none focus:border-blue md:h-10 md:text-sm"
                >
                  <option value="">— Select state —</option>
                  {["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh","Chandigarh","Puducherry"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              {billingMsg && (
                <p className={`rounded-cf px-3 py-2 text-xs leading-5 break-words ${billingMsg.ok ? "border border-blue/25 bg-blue-soft text-blue" : "border border-destructive/30 bg-destructive/5 text-destructive"}`}>
                  {billingMsg.text}
                </p>
              )}
              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <button type="submit" disabled={billingLoading}
                  className="cf-btn-primary w-full sm:flex-1 disabled:opacity-50">
                  {billingLoading ? "Saving…" : "Save"}
                </button>
                <button type="button" onClick={() => { setShowBilling(false); setBillingMsg(null); }}
                  className="cf-btn-secondary w-full sm:w-auto">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
