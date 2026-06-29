"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API = "https://control.coreframecloud.com/api";

interface OrgInfo {
  user_id: number;
  email: string;
  full_name: string;
  role: string;
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

function roleBadge(role: string) {
  const colors: Record<string, string> = {
    org_admin: "bg-cyan-400/15 text-cyan-300 border-cyan-400/25",
    engineer: "bg-white/10 text-white/60 border-white/10",
    admin: "bg-purple-400/15 text-purple-300 border-purple-400/25",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${colors[role] ?? colors.engineer}`}>
      {role}
    </span>
  );
}

function statusDot(status: string) {
  return (
    <span className={`inline-block h-2 w-2 rounded-full mr-1.5 ${status === "active" ? "bg-emerald-400" : "bg-red-400"}`} />
  );
}

export default function OrgAdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const tok = localStorage.getItem("cf_customer_token");
    if (!tok) {
      setLoading(false);
      return;
    }
    setToken(tok);

    Promise.all([
      fetch(`${API}/org-admin/me`, { headers: { Authorization: `Bearer ${tok}` } }),
      fetch(`${API}/org-admin/team`, { headers: { Authorization: `Bearer ${tok}` } }),
    ])
      .then(async ([meRes, teamRes]) => {
        if (meRes.status === 403) throw new Error("access_denied");
        if (!meRes.ok) throw new Error("auth_failed");
        const me: OrgInfo = await meRes.json();
        const members: TeamMember[] = teamRes.ok ? await teamRes.json() : [];
        setOrgInfo(me);
        setTeam(members);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = team.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.email.toLowerCase().includes(q) ||
      m.full_name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q)
    );
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
        <p className="text-white/60 text-sm">You need to sign in to view the org admin portal.</p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-cyan-300 transition"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (error === "access_denied") {
    return (
      <div className="min-h-screen bg-[#03101d] flex items-center justify-center flex-col gap-3 text-center px-4">
        <p className="text-white/60 text-sm">This portal is only accessible to organization admins.</p>
        <Link href="/my-activity" className="text-cyan-400 text-sm hover:underline">← Back to My Activity</Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#03101d] flex items-center justify-center flex-col gap-3 text-center px-4">
        <p className="text-red-400 text-sm">Failed to load. Please sign in again.</p>
        <Link href="/login" className="text-cyan-400 text-sm hover:underline">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#03101d] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#05192e]/60 backdrop-blur px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-0.5">Org Admin Portal</p>
            <h1 className="text-lg font-semibold text-white">{orgInfo?.org_name}</h1>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/50">
            {orgInfo?.email_domain && (
              <span className="bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 px-2.5 py-1 rounded-full text-xs font-medium">
                @{orgInfo.email_domain}
              </span>
            )}
            <span>{orgInfo?.member_count} member{orgInfo?.member_count !== 1 ? "s" : ""}</span>
            <span className="text-white/30">|</span>
            <span>{orgInfo?.org_plan}</span>
            <span className="text-white/30">|</span>
            <Link href="/my-activity" className="text-cyan-400 hover:text-cyan-300 transition text-xs">
              ← My Activity
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Members", value: team.length },
            { label: "Active", value: team.filter((m) => m.status === "active").length },
            {
              label: "Logged in (7d)",
              value: team.filter((m) => {
                if (!m.last_login_at) return false;
                return Date.now() - new Date(m.last_login_at).getTime() < 7 * 86400 * 1000;
              }).length,
            },
            {
              label: "Total GPU Hours",
              value: team.reduce((s, m) => s + m.billable_hours, 0).toFixed(1) + " h",
            },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <p className="text-xs text-white/40 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Team table */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-white/10 flex-wrap">
            <h2 className="text-sm font-semibold text-white">Team Members</h2>
            <input
              type="text"
              placeholder="Search name / email / role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 w-56"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-white/40 uppercase tracking-wide">
                  {["Name", "Email", "Role", "Status", "Sign-in", "Enrolled", "Last Login", "Sessions", "GPU hrs", "Storage"].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-white/30 text-sm">
                      {search ? "No members match your search." : "No team members yet."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((m) => (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition">
                      <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{m.full_name}</td>
                      <td className="px-4 py-3 text-white/60 text-xs">{m.email}</td>
                      <td className="px-4 py-3">{roleBadge(m.role)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {statusDot(m.status)}
                        <span className="text-white/60 text-xs">{m.status}</span>
                      </td>
                      <td className="px-4 py-3 text-white/40 text-xs capitalize">
                        {m.identity_provider === "google" ? "🔵 Google" : m.identity_provider === "local" ? "📧 Email" : m.identity_provider ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                        {new Date(m.enrolled_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {m.last_login_at ? (
                          <span className="text-white/60 text-xs">{ago(m.last_login_at)}</span>
                        ) : (
                          <span className="text-white/25 text-xs">Never</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-white/60 text-xs">{m.session_count}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-white/60 text-xs">{m.billable_hours.toFixed(1)}</span>
                      </td>
                      <td className="px-4 py-3 text-white/40 text-xs">
                        {formatBytes(m.storage_bytes)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-xs text-white/25 text-center">
          Users with <strong className="text-white/40">@{orgInfo?.email_domain}</strong> email addresses are automatically added to this organization when they sign up.
          Contact <a href="mailto:support@coreframecloud.com" className="text-cyan-400/60 hover:text-cyan-400">support@coreframecloud.com</a> to update your domain or plan.
        </p>
      </div>
    </div>
  );
}
