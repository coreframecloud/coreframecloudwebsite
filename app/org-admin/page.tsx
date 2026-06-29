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
  member_count: number;
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
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupMsg, setTopupMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const loadData = useCallback((tok: string) => {
    return Promise.all([
      fetch(`${API}/org-admin/me`, { headers: { Authorization: `Bearer ${tok}` } }),
      fetch(`${API}/org-admin/team`, { headers: { Authorization: `Bearer ${tok}` } }),
    ]).then(async ([meRes, teamRes]) => {
      if (meRes.status === 401) throw new Error("token_expired");
      if (meRes.status === 403) throw new Error("access_denied");
      if (meRes.status === 404) throw new Error("not_deployed");
      if (!meRes.ok) throw new Error(`api_error_${meRes.status}`);
      const me: OrgInfo = await meRes.json();
      const members: TeamMember[] = teamRes.ok ? await teamRes.json() : [];
      setOrgInfo(me);
      setTeam(members);
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
    setTopupLoading(true);
    setTopupMsg(null);
    try {
      const res = await fetch(`${API}/org-admin/wallet/topup`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ amount_rupees: amt, note: topupNote.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed");
      setTopupMsg({ ok: true, text: `₹${amt.toFixed(0)} added. New balance: ₹${data.new_balance_rupees.toFixed(2)}` });
      setTopupAmount("");
      setTopupNote("");
      loadData(token).catch(() => {});
    } catch (e: unknown) {
      setTopupMsg({ ok: false, text: e instanceof Error ? e.message : "Error" });
    } finally {
      setTopupLoading(false);
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
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${orgInfo?.org_plan === "postpaid" ? "bg-purple-400/10 text-purple-300 border-purple-400/20" : "bg-emerald-400/10 text-emerald-300 border-emerald-400/20"}`}>
              {orgInfo?.org_plan}
            </span>
            <Link href="/my-activity" className="text-cyan-400 hover:text-cyan-300 transition text-xs">
              ← My Activity
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">

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
              <h2 className="text-base font-semibold mb-1">Add Funds to Wallet</h2>
              <p className="text-xs text-white/40 mb-5">Contact support after transfer to confirm. Balance will be credited within 1 business day.</p>
              <form onSubmit={handleTopup} className="space-y-3">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Amount (₹)</label>
                  <input
                    type="number" min="1" step="1" required
                    value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-emerald-400/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Reference / Note (optional)</label>
                  <input
                    type="text"
                    value={topupNote} onChange={(e) => setTopupNote(e.target.value)}
                    placeholder="UTR / transaction ID"
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
                    {topupLoading ? "Processing…" : "Submit Request"}
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
                  {["Name", "Email", "Role", "Status", "Sign-in", "Enrolled", "Last Login", "Sessions", "GPU hrs", "Storage", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-white/30 text-sm">
                      {search ? "No members match your search." : "No team members yet. Use '+ Invite' to add someone."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((m) => (
                    <tr key={m.id} className={`hover:bg-white/[0.02] transition ${m.status !== "active" ? "opacity-50" : ""}`}>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{m.full_name}</td>
                      <td className="px-4 py-3 text-white/60 text-xs">{m.email}</td>
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
    </div>
  );
}
