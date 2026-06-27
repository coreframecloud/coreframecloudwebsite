"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API = "https://control.coreframecloud.com/api";

interface WalletData {
  wallet_balance_rupees: number;
  hourly_rate_rupees_per_hour: number;
  trial_credit_hours: number;
}

interface Session {
  id: string;
  status: string;
  login_time: string;
  logout_time: string | null;
  billable_minutes: number;
  billed_amount_rupees: number;
}

interface Payment {
  id: string;
  amount_rupees: number;
  status: string;
  paid_at: string | null;
  invoice_short_url: string | null;
  created_at: string;
}

interface UserInfo {
  full_name: string;
  email: string;
  id: string;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function statusBadge(status: string) {
  const s = status.toLowerCase();
  let cls = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ";
  if (s === "ended" || s === "completed") {
    cls += "bg-emerald-400/10 text-emerald-300 border border-emerald-400/20";
  } else if (s === "active" || s === "provisioning") {
    cls += "bg-amber-400/10 text-amber-300 border border-amber-400/20";
  } else {
    cls += "bg-red-400/10 text-red-300 border border-red-400/20";
  }
  return <span className={cls}>{status}</span>;
}

export default function MyActivityPage() {
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const t = localStorage.getItem("cf_customer_token");
    const uRaw = localStorage.getItem("cf_customer_user");

    if (!t || !uRaw) {
      setToken(null);
      setLoading(false);
      return;
    }

    let u: UserInfo;
    try {
      u = JSON.parse(uRaw);
    } catch {
      setLoading(false);
      return;
    }

    setToken(t);
    setUser(u);

    const headers = { Authorization: `Bearer ${t}` };

    const authFetch = (url: string) =>
      fetch(url, { headers }).then(async (r) => {
        if (r.status === 401 || r.status === 403) throw new Error("auth_failed");
        if (!r.ok) return null; // non-auth errors return null, don't clear token
        return r.json();
      });

    Promise.all([
      authFetch(`${API}/me/wallet`),
      authFetch(`${API}/me/sessions`),
      authFetch(`${API}/payments/history`),
    ])
      .then(([w, s, p]) => {
        if (w) setWallet(w);
        setSessions(Array.isArray(s) ? s : []);
        setPayments(Array.isArray(p) ? p : []);
      })
      .catch((err) => {
        if (err.message === "auth_failed") {
          localStorage.removeItem("cf_customer_token");
          localStorage.removeItem("cf_customer_user");
          setToken(null);
        } else {
          setError("Failed to load activity data. Please try again.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (!mounted) return null;

  if (!token) {
    return (
      <main className="min-h-screen bg-[#03101d] text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="cf-section-copy text-white/60 mb-6">
            Please sign in to view your activity.
          </p>
          <a
            href="https://control.coreframecloud.com/customer/"
            className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-6 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
          >
            Sign in to Dashboard
          </a>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#03101d] text-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded-lg bg-white/10" />
            <div className="h-4 w-64 rounded bg-white/5" />
            <div className="mt-8 h-32 rounded-xl bg-white/5" />
            <div className="h-48 rounded-xl bg-white/5" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#03101d] text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-red-300">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#03101d] text-white">
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">

        {/* Header */}
        <div>
          <p className="cf-eyebrow text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-2">
            Account
          </p>
          <h1 className="cf-section-title text-3xl font-bold text-white">
            My Activity
            {user?.full_name && (
              <span className="text-white/40 font-normal"> — {user.full_name}</span>
            )}
          </h1>
        </div>

        {/* Wallet summary card */}
        {wallet && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">
              Wallet
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-2xl font-bold text-emerald-300">
                  ₹{wallet.wallet_balance_rupees.toFixed(2)}
                </p>
                <p className="text-xs text-white/50 mt-0.5">Current balance</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  ₹{wallet.hourly_rate_rupees_per_hour.toFixed(2)}
                  <span className="text-sm font-normal text-white/40">/hr</span>
                </p>
                <p className="text-xs text-white/50 mt-0.5">Hourly rate</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {wallet.trial_credit_hours}
                  <span className="text-sm font-normal text-white/40"> hrs</span>
                </p>
                <p className="text-xs text-white/50 mt-0.5">Trial credit remaining</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">Recent Sessions</h2>
          </div>
          {sessions.length === 0 ? (
            <p className="px-6 py-8 text-sm text-white/40">No sessions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition">
                      <td className="px-6 py-3.5 text-white/80">
                        {formatDate(s.login_time)}
                      </td>
                      <td className="px-6 py-3.5 text-white/80">
                        {formatDuration(s.billable_minutes)}
                      </td>
                      <td className="px-6 py-3.5 text-white/80">
                        ₹{s.billed_amount_rupees.toFixed(2)}
                      </td>
                      <td className="px-6 py-3.5">
                        {statusBadge(s.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">Payment History</h2>
          </div>
          {payments.length === 0 ? (
            <p className="px-6 py-8 text-sm text-white/40">No payments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition">
                      <td className="px-6 py-3.5 text-white/80">
                        {formatDate(p.paid_at ?? p.created_at)}
                      </td>
                      <td className="px-6 py-3.5 text-white/80">
                        ₹{p.amount_rupees.toFixed(2)}
                      </td>
                      <td className="px-6 py-3.5">
                        {statusBadge(p.status)}
                      </td>
                      <td className="px-6 py-3.5">
                        {p.invoice_short_url ? (
                          <a
                            href={p.invoice_short_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 transition text-xs font-medium"
                          >
                            Download ↗
                          </a>
                        ) : (
                          <span className="text-white/30 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center">
          <p className="cf-section-copy text-white/60 max-w-sm">
            Ready to run your next simulation? Launch a cloud session with one click.
          </p>
          <a
            href="https://control.coreframecloud.com/customer/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-6 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
          >
            Launch a Session →
          </a>
        </div>

      </div>
    </main>
  );
}
