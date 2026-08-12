"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const API = "https://control.coreframecloud.com/api";

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

interface PendingMember {
  user_id: number;
  full_name: string;
  email: string;
  requested_at: string | null;
  identity_verified: boolean;
  identity_name: string | null;
  account_status: string;
}

interface TeamMember {
  id: number;
  email: string;
  full_name: string;
  role: string;
  status: string;
  customer_type: string;
  identity_provider: string | null;
  enrolled_at: string;
  last_login_at: string | null;
  session_count: number;
  billable_hours: number;
  storage_bytes: number;
  wallet_balance_rupees: number;
}

function ago(ts: string | null): string {
  if (!ts) return "Never";
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "—";
  if (bytes < 1024 ** 3) return (bytes / 1024 ** 2).toFixed(1) + " MB";
  return (bytes / 1024 ** 3).toFixed(2) + " GB";
}

export default function OrgAdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  // Colleagues who signed up on the company email domain and are waiting on
  // this admin to say whether their usage should bill to the company.
  const [pending, setPending] = useState<PendingMember[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [decidingId, setDecidingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Invite modal state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<{ ok: boolean; text: string } | null>(null);

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

  const loadData = useCallback((tok: string) => {
    return Promise.all([
      fetch(`${API}/org-admin/me`, { headers: { Authorization: `Bearer ${tok}` } }),
      fetch(`${API}/org-admin/team`, { headers: { Authorization: `Bearer ${tok}` } }),
      fetch(`${API}/org-admin/pending-members`, { headers: { Authorization: `Bearer ${tok}` } }),
      fetch(`${API}/org-admin/usage`, { headers: { Authorization: `Bearer ${tok}` } }),
    ]).then(async ([meRes, teamRes, pendingRes, usageRes]) => {
      if (meRes.status === 401) throw new Error("token_expired");
      if (meRes.status === 403) throw new Error("access_denied");
      if (meRes.status === 404) throw new Error("not_deployed");
      if (!meRes.ok) throw new Error(`api_error_${meRes.status}`);
      const me: OrgInfo = await meRes.json();
      const members: TeamMember[] = teamRes.ok ? await teamRes.json() : [];
      setOrgInfo(me);
      setTeam(members);
      // Tolerate a 404 here so the page still works against an older API.
      const pendingBody = pendingRes.ok ? await pendingRes.json() : { pending: [] };
      setPending(Array.isArray(pendingBody.pending) ? pendingBody.pending : []);
      // Tolerated the same way as pending-members: a 404 here means the API
      // predates /usage, and the page should still show the team rather than
      // failing wholesale over a stat card.
      setUsage(usageRes.ok ? await usageRes.json() : null);
    });
  }, []);

  useEffect(() => {
    const tok = localStorage.getItem("cf_customer_token");
    if (!tok) { setLoading(false); return; }
    setToken(tok);
    loadData(tok).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [loadData]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setInviteLoading(true);
    setInviteMsg(null);
    try {
      const res = await fetch(`${API}/org-admin/invite`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), full_name: inviteName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed");
      setInviteMsg({ ok: true, text: data.message });
      setInviteEmail("");
      setInviteName("");
      loadData(token).catch(() => {});
    } catch (e: unknown) {
      setInviteMsg({ ok: false, text: e instanceof Error ? e.message : "Error" });
    } finally {
      setInviteLoading(false);
    }
  }

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
      const res = await fetch(`${API}/org-admin/wallet/topup-request`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
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
      loadData(token).catch(() => {});
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
      const res = await fetch(`${API}/org-admin/billing`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ gstin, billing_state: billingState || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed");
      setBillingMsg({ ok: true, text: "Billing profile saved" });
      loadData(token).catch(() => {});
      setTimeout(() => setShowBilling(false), 1200);
    } catch (e: unknown) {
      setBillingMsg({ ok: false, text: e instanceof Error ? e.message : "Error" });
    } finally {
      setBillingLoading(false);
    }
  }

  async function decideMembership(member: PendingMember, approve: boolean) {
    if (!token) return;
    const verb = approve ? "approve" : "decline";
    const note = window.prompt(
      approve
        ? `Approve ${member.full_name || member.email}?\n\nTheir usage will be billed to the company account.\n\nOptional note:`
        : `Decline ${member.full_name || member.email}?\n\nThey keep their own account and can pay for their own usage — this only stops company billing.\n\nOptional note:`
    );
    if (note === null) return;

    setDecidingId(member.user_id);
    try {
      const res = await fetch(
        `${API}/org-admin/members/${member.user_id}/${verb === "approve" ? "approve-membership" : "reject-membership"}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ note: note || null }),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Could not ${verb} this member.`);
      }
      setPending((prev) => prev.filter((p) => p.user_id !== member.user_id));
      await loadData(token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Could not ${verb} this member.`);
    } finally {
      setDecidingId(null);
    }
  }

  async function toggleMemberStatus(member: TeamMember) {
    if (!token) return;
    const newStatus = member.status === "active" ? "inactive" : "active";
    if (!confirm(`${newStatus === "inactive" ? "Deactivate" : "Reactivate"} ${member.full_name}?`)) return;
    try {
      const res = await fetch(`${API}/org-admin/members/${member.id}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) { const d = await res.json(); alert(d.detail || "Failed"); return; }
      loadData(token).catch(() => {});
    } catch {
      alert("Failed to update member status");
    }
  }

  const filtered = team.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return m.email.toLowerCase().includes(q) || m.full_name.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#03101d] flex items-center justify-center text-white/40 text-sm">
        Loading…
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#03101d] flex items-center justify-center flex-col gap-4 text-center px-4">
        <p className="text-white/60 text-sm">Sign in to access the org admin portal.</p>
        <Link href="/login" className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-cyan-300 transition">
          Sign in
        </Link>
      </div>
    );
  }

  if (error === "access_denied") {
    return (
      <div className="min-h-screen bg-[#03101d] flex items-center justify-center flex-col gap-3 text-center px-4">
        <p className="text-white/60 text-sm">This portal is only accessible to organization admins.</p>
        <p className="text-white/30 text-xs">Ask your Coreframe admin to grant you the org_admin role.</p>
        <Link href="/my-activity" className="text-cyan-400 text-sm hover:underline">← Back to My Activity</Link>
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
      <div className="min-h-screen bg-[#03101d] flex items-center justify-center flex-col gap-3 text-center px-4">
        <p className="text-amber-400 text-sm">Org portal API not yet available.</p>
        <p className="text-white/30 text-xs">Rebuild and deploy the API container to enable this feature.</p>
        <Link href="/my-activity" className="text-cyan-400 text-sm hover:underline">← Back</Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#03101d] flex items-center justify-center flex-col gap-3 text-center px-4">
        <p className="text-red-400 text-sm">Failed to load ({error}). Please sign in again.</p>
        <Link href="/login" className="text-cyan-400 text-sm hover:underline">Sign in</Link>
      </div>
    );
  }

  const totalHours = team.reduce((s, m) => s + m.billable_hours, 0);
  const activeCount = team.filter((m) => m.status === "active").length;
  const recentCount = team.filter((m) => m.last_login_at && Date.now() - new Date(m.last_login_at).getTime() < 7 * 86400000).length;

  return (
    <div className="min-h-screen bg-[#03101d] text-white">
      {/* Top bar */}
      <div className="border-b border-white/10 bg-[#05192e]/60 backdrop-blur px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-0.5">Org Admin Portal</p>
            <h1 className="text-lg font-semibold">{orgInfo?.org_name}</h1>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {orgInfo?.email_domain && (
              <span className="bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 px-2.5 py-1 rounded-full text-xs font-medium">
                @{orgInfo.email_domain}
              </span>
            )}
            {orgInfo?.gstin ? (
              <button
                onClick={() => { setBillingGstin(orgInfo.gstin || ""); setBillingState(orgInfo.billing_state || ""); setBillingMsg(null); setShowBilling(true); }}
                className="bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 px-2.5 py-1 rounded-full text-xs font-mono hover:bg-emerald-400/20 transition"
                title="Edit GSTIN"
              >
                GST: {orgInfo.gstin}
              </button>
            ) : (
              <button
                onClick={() => { setBillingGstin(orgInfo?.gstin || ""); setBillingState(orgInfo?.billing_state || ""); setBillingMsg(null); setShowBilling(true); }}
                className="text-amber-400/70 hover:text-amber-300 text-xs border border-amber-400/20 px-2 py-1 rounded-full transition"
              >
                + Add GSTIN
              </button>
            )}
            {/* billing_mode only. This used to render `org_plan`, which holds
                plan_type — an internal value like "monthly" that means nothing
                to a customer and was left over from an earlier design. No
                fallback: showing the legacy field when /usage is unavailable
                would put "monthly" back on the screen intermittently, which is
                worse than showing nothing. */}
            {usage?.billing_mode && (
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${usage.billing_mode === "postpaid" ? "bg-purple-400/10 text-purple-300 border-purple-400/20" : "bg-emerald-400/10 text-emerald-300 border-emerald-400/20"}`}>
                {usage.billing_mode}
              </span>
            )}
            <Link href="/my-activity" className="text-cyan-400 hover:text-cyan-300 transition text-xs">
              ← My Activity
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">

        {/* ── This month, and what is left ──────────────────────────────────
            The three questions an admin opens this page to answer: what have
            we spent, how much storage is left, and is anyone rendering now.
            Rendered only when /usage responded, so an older API degrades to
            the team table rather than to a row of dashes. */}
        {usage && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.05] px-5 py-4">
              <p className="text-[11px] text-white/40 mb-1">Month to date</p>
              <p className="text-2xl font-bold">
                ₹{usage.month_to_date.billed_rupees.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-[11px] text-white/40 mt-1">
                {usage.month_to_date.billable_hours.toFixed(1)} GPU-h · {usage.month_to_date.session_count} sessions
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <p className="text-[11px] text-white/40 mb-1">Storage used</p>
              <p className="text-2xl font-bold">
                {usage.storage.used_gb.toFixed(1)}
                <span className="text-base font-normal text-white/40">
                  {usage.storage.quota_gb ? ` / ${usage.storage.quota_gb} GB` : " GB"}
                </span>
              </p>
              {usage.storage.percent_used !== null && (
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${usage.storage.percent_used >= 90 ? "bg-red-400" : usage.storage.percent_used >= 75 ? "bg-amber-400" : "bg-cyan-400"}`}
                    style={{ width: `${Math.max(2, usage.storage.percent_used)}%` }}
                  />
                </div>
              )}
              {usage.storage.quota_gb === null && (
                <p className="text-[11px] text-white/30 mt-1">No quota set</p>
              )}
              {/* An estimate must not look like a measurement. When the NAS is
                  unreachable this figure is summed from upload records and
                  overstates anything since deleted, so it says so. */}
              {usage.storage.source === "estimate" && (
                <p className="text-[11px] text-amber-400/70 mt-1" title="Summed from upload history because the storage server could not be reached. Deleted files are still counted.">
                  Estimated · NAS unreachable
                </p>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <p className="text-[11px] text-white/40 mb-1">Rendering now</p>
              <p className="text-2xl font-bold">{usage.month_to_date.active_sessions}</p>
              <p className="text-[11px] text-white/40 mt-1">of {usage.member_count} members</p>
            </div>

            {/* Prepaid shows the shared balance; postpaid shows credit consumed
                against the limit. They are different questions and must not be
                shown with the same label. */}
            {usage.billing_mode === "postpaid" ? (
              <div className="rounded-xl border border-purple-400/20 bg-purple-400/[0.05] px-5 py-4">
                <p className="text-[11px] text-white/40 mb-1">Credit used</p>
                <p className="text-2xl font-bold">
                  ₹{(usage.credit_used_rupees ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  {usage.credit_limit_rupees != null && (
                    <span className="text-base font-normal text-white/40">
                      {" / "}₹{usage.credit_limit_rupees.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-white/40 mt-1">
                  {usage.credit_limit_rupees == null ? "No limit set · invoiced monthly" : "Invoiced monthly"}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] px-5 py-4">
                <p className="text-[11px] text-white/40 mb-1">Shared balance</p>
                <p className="text-2xl font-bold">
                  ₹{usage.balance_rupees.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </p>
                <p className="text-[11px] text-white/40 mt-1">Funds every member&apos;s sessions</p>
              </div>
            )}
          </div>
        )}

        {/* Stats + wallet row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Members", value: team.length },
            { label: "Active", value: activeCount },
            { label: "Active (7d)", value: recentCount },
            { label: "GPU Hours", value: totalHours.toFixed(1) + " h" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <p className="text-[11px] text-white/40 mb-1">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}

          {/* Wallet card */}
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-5 py-4 flex flex-col justify-between">
            <div>
              <p className="text-[11px] text-emerald-300/60 mb-1">Wallet Balance</p>
              <p className="text-2xl font-bold text-emerald-300">₹{(orgInfo?.wallet_balance_rupees ?? 0).toFixed(2)}</p>
            </div>
            <button
              onClick={() => { setShowTopup(true); setTopupMsg(null); }}
              className="mt-3 text-xs font-semibold text-emerald-300 border border-emerald-400/30 rounded-lg px-3 py-1.5 hover:bg-emerald-400/10 transition"
            >
              + Add Funds
            </button>
          </div>
        </div>

        {/* Wallet topup modal */}
        {showTopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1f35] p-6 shadow-2xl">
              <h2 className="text-base font-semibold mb-1">Record a bank transfer</h2>
              {/* States plainly that this is a claim, not a payment. A customer
                  who thinks the money is available and then has a session
                  refused concludes the platform is broken. */}
              <p className="text-xs text-white/40 mb-5">
                Transfer to the Coreframe account, then enter the details below.
                Your balance is credited once we confirm the transfer — usually
                within one business day.
              </p>
              <form onSubmit={handleTopup} className="space-y-3">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Amount transferred (₹)</label>
                  <input
                    type="number" min="1" step="1" required
                    value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-emerald-400/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Paid by</label>
                  <select
                    value={topupMethod} onChange={(e) => setTopupMethod(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400/50"
                  >
                    {["neft", "rtgs", "imps", "upi", "cheque", "other"].map((m) => (
                      <option key={m} value={m} className="bg-[#0d1f35]">{m.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  {/* Required, not optional. This is the string an admin searches
                      for in the bank statement — without it the claim cannot be
                      confirmed and the money cannot be credited. */}
                  <label className="text-xs text-white/50 mb-1 block">UTR / transaction reference</label>
                  <input
                    type="text" required minLength={4}
                    value={topupRef} onChange={(e) => setTopupRef(e.target.value)}
                    placeholder="e.g. SBIN0123456789"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-emerald-400/50 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Date of transfer</label>
                  <input
                    type="date"
                    value={topupPaidAt} onChange={(e) => setTopupPaidAt(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Note (optional)</label>
                  <input
                    type="text"
                    value={topupNote} onChange={(e) => setTopupNote(e.target.value)}
                    placeholder="Anything we should know"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-emerald-400/50"
                  />
                </div>
                {topupMsg && (
                  <p className={`text-xs rounded-lg px-3 py-2 ${topupMsg.ok ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"}`}>
                    {topupMsg.text}
                  </p>
                )}
                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={topupLoading}
                    className="flex-1 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-emerald-300 transition disabled:opacity-50">
                    {topupLoading ? "Submitting…" : "Submit for confirmation"}
                  </button>
                  <button type="button" onClick={() => setShowTopup(false)}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/60 hover:bg-white/5 transition">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invite modal */}
        {showInvite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1f35] p-6 shadow-2xl">
              <h2 className="text-base font-semibold mb-1">Invite Team Member</h2>
              {orgInfo?.email_domain && (
                <p className="text-xs text-white/40 mb-5">
                  Only <span className="text-cyan-300">@{orgInfo.email_domain}</span> addresses can be invited.
                </p>
              )}
              <form onSubmit={handleInvite} className="space-y-3">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Full Name</label>
                  <input
                    type="text" required
                    value={inviteName} onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-400/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Work Email</label>
                  <input
                    type="email" required
                    value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder={`jane@${orgInfo?.email_domain ?? "yourcompany.com"}`}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-400/50"
                  />
                </div>
                {inviteMsg && (
                  <p className={`text-xs rounded-lg px-3 py-2 ${inviteMsg.ok ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"}`}>
                    {inviteMsg.text}
                  </p>
                )}
                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={inviteLoading}
                    className="flex-1 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-cyan-300 transition disabled:opacity-50">
                    {inviteLoading ? "Sending…" : "Send Invite"}
                  </button>
                  <button type="button" onClick={() => { setShowInvite(false); setInviteMsg(null); }}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/60 hover:bg-white/5 transition">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Pending membership requests — only rendered when there are any, so
            the page is unchanged for an org with nothing waiting. */}
        {pending.length > 0 && (
          <div className="mb-6 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] overflow-hidden">
            <div className="px-5 py-3 border-b border-amber-400/20">
              <h2 className="text-sm font-semibold text-amber-200">
                Waiting for your approval ({pending.length})
              </h2>
              <p className="mt-1 text-xs text-amber-200/70">
                These people signed up with your company&apos;s email domain. Approving them
                bills their usage to the company account. They can already use Coreframe on
                their own wallet — this decision is only about who pays.
              </p>
            </div>
            <div className="divide-y divide-white/5">
              {pending.map((m) => (
                <div key={m.user_id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {m.full_name || m.email}
                      </span>
                      {m.identity_verified ? (
                        <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                          identity verified
                        </span>
                      ) : (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                          identity pending
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-white/50">{m.email}</div>
                    {m.identity_name && m.identity_name !== m.full_name && (
                      <div className="mt-0.5 text-xs text-white/40">
                        Verified as {m.identity_name}
                      </div>
                    )}
                    <div className="mt-0.5 text-[11px] text-white/35">
                      Requested {ago(m.requested_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decideMembership(m, true)}
                      disabled={decidingId === m.user_id}
                      className="rounded-lg bg-emerald-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {decidingId === m.user_id ? "…" : "Approve"}
                    </button>
                    <button
                      onClick={() => decideMembership(m, false)}
                      disabled={decidingId === m.user_id}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5 disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team table */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-white/10 flex-wrap">
            <h2 className="text-sm font-semibold">Team Members</h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search name / email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 w-48"
              />
              <button
                onClick={() => { setShowInvite(true); setInviteMsg(null); }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-400 px-3 py-1.5 text-sm font-semibold text-slate-900 hover:bg-cyan-300 transition"
              >
                + Invite
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-[11px] text-white/40 uppercase tracking-wide">
                  {/* Name and email in ONE column. Eleven columns overflowed
                      horizontally, and the two that identify the person were the
                      first to scroll out of view — leaving a table of numbers
                      with no way to tell whose they were. */}
                  {["Member", "Role", "Status", "Sign-in", "Enrolled", "Last Login", "Sessions", "GPU hrs", "Storage", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-white/30 text-sm">
                      {search ? "No members match your search." : "No team members yet. Use '+ Invite' to add someone."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((m) => (
                    <tr key={m.id} className={`hover:bg-white/[0.02] transition ${m.status !== "active" ? "opacity-50" : ""}`}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium">{m.full_name || "—"}</div>
                        <div className="text-xs text-white/50">{m.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${m.role === "org_admin" ? "bg-cyan-400/15 text-cyan-300 border-cyan-400/25" : "bg-white/10 text-white/60 border-white/10"}`}>
                          {m.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-block h-2 w-2 rounded-full mr-1.5 ${m.status === "active" ? "bg-emerald-400" : "bg-red-400"}`} />
                        <span className="text-white/60 text-xs">{m.status}</span>
                      </td>
                      <td className="px-4 py-3 text-white/40 text-xs capitalize">
                        {m.identity_provider === "google" ? "🔵 Google" : m.identity_provider === "local" || m.identity_provider === "invited" ? "📧 Email" : m.identity_provider ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                        {new Date(m.enrolled_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {m.last_login_at
                          ? <span className="text-white/60 text-xs">{ago(m.last_login_at)}</span>
                          : <span className="text-white/25 text-xs">Never</span>}
                      </td>
                      <td className="px-4 py-3 text-center text-white/60 text-xs">{m.session_count}</td>
                      <td className="px-4 py-3 text-center text-white/60 text-xs">{m.billable_hours.toFixed(1)}</td>
                      <td className="px-4 py-3 text-white/40 text-xs">{formatBytes(m.storage_bytes)}</td>
                      <td className="px-4 py-3">
                        {m.role !== "org_admin" && (
                          <button
                            onClick={() => toggleMemberStatus(m)}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition ${m.status === "active" ? "border-red-400/30 text-red-400 hover:bg-red-400/10" : "border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"}`}
                          >
                            {m.status === "active" ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-white/25 text-center">
          New users with <strong className="text-white/40">@{orgInfo?.email_domain}</strong> emails are auto-enrolled on signup.
          For billing or domain changes contact{" "}
          <a href="mailto:support@coreframecloud.com" className="text-cyan-400/60 hover:text-cyan-400">support@coreframecloud.com</a>.
        </p>
      </div>

      {/* ── Billing Profile Modal ─────────────────────────────────────────── */}
      {showBilling && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a1628] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-base font-semibold mb-1">GST Billing Profile</h3>
            <p className="text-white/40 text-xs mb-5">
              Your GSTIN appears on all invoices as the buyer. Required to claim GST input tax credit.
            </p>
            <form onSubmit={handleBillingUpdate} className="space-y-4">
              <div>
                <label className="block text-xs text-white/50 mb-1.5">GSTIN <span className="text-white/30">(optional)</span></label>
                <input
                  type="text"
                  value={billingGstin}
                  onChange={(e) => setBillingGstin(e.target.value.toUpperCase())}
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  maxLength={15}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-400/50 font-mono tracking-wider"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Billing State <span className="text-white/30">(for CGST/SGST vs IGST routing)</span></label>
                <select
                  value={billingState}
                  onChange={(e) => setBillingState(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#0a1628] px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400/50"
                >
                  <option value="">— Select state —</option>
                  {["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh","Chandigarh","Puducherry"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              {billingMsg && (
                <p className={`text-xs px-3 py-2 rounded-lg ${billingMsg.ok ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"}`}>
                  {billingMsg.text}
                </p>
              )}
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={billingLoading}
                  className="flex-1 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-cyan-300 transition disabled:opacity-50">
                  {billingLoading ? "Saving…" : "Save"}
                </button>
                <button type="button" onClick={() => { setShowBilling(false); setBillingMsg(null); }}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/60 hover:bg-white/5 transition">
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
