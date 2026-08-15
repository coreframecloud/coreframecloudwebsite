"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TopUpDialog from "@/components/wallet/top-up-dialog";

const API = "https://control.coreframecloud.com/api";

interface WalletData {
  wallet_balance_rupees: number;
  // Per-customer override, NOT_NULL DEFAULT 99. Do not display it — since rates
  // moved to the rate card it is a number nobody is billed, and showing it as
  // "₹99/hr GPU rate" next to a real ₹399 charge is how billing disputes start.
  hourly_rate_rupees_per_hour: number;
  trial_credit_hours: number;
  // Cheapest live rate for this customer's segment. This is the one to show.
  gpu_rate_from_rupees: number | null;
  next_expiry: { expires_at: string; amount_rupees: number } | null;
  credit_validity_days: number;
  // Spendable NOW, from the server. Not `trial_credit_hours`, which keeps its
  // granted value after expiry so support can explain where credit went.
  trial_minutes_remaining: number;
  trial_expires_at: string | null;
  trial_storage_gb: number;
  trial_storage_expires_at: string | null;
  storage_used_bytes: number;
  storage_quota_bytes: number | null;
  storage_quota_gb: number;
  storage_free_gb: number;
  storage_free_tier_gb: number;
  storage_paid_cap_gb: number;
  storage_paid_unlocked: boolean;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 GB";
  const gb = bytes / 1024 ** 3;
  if (gb < 0.1) return `${(bytes / 1024 ** 2).toFixed(0)} MB`;
  return `${gb.toFixed(gb < 10 ? 1 : 0)} GB`;
}

/** Free minutes and disk both run out, and both were invisible to customers —
 *  the wallet chip only ever showed money. A trial that expires unannounced
 *  reads as the product silently taking something away. */
function UsageCards({ wallet }: { wallet: WalletData | null }) {
  if (!wallet) return null;
  const mins = wallet.trial_minutes_remaining ?? 0;
  const quotaGb =
    wallet.storage_quota_gb ||
    (wallet.storage_quota_bytes ? Math.round(wallet.storage_quota_bytes / 1024 ** 3) : 0);
  // The free tier's SIZE, not how much of it is currently in force: a paid
  // account whose trial-storage clock has run out still got 20 GB free, and
  // the bar must keep saying so.
  const freeTier = wallet.storage_free_tier_gb || 20;
  const capGb = wallet.storage_paid_cap_gb || 50;
  const usedPct =
    quotaGb > 0
      ? Math.min(100, (wallet.storage_used_bytes / (quotaGb * 1024 ** 3)) * 100)
      : null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
          Free GPU minutes
        </h2>
        {mins > 0 ? (
          <>
            <p className="text-3xl font-bold text-cyan-300">{mins}</p>
            <p className="text-xs text-white/40 mt-1">
              remaining
              {wallet.trial_expires_at
                ? ` · expires ${formatDate(wallet.trial_expires_at)}`
                : ""}
            </p>
            <p className="text-xs text-white/30 mt-2">
              Free minutes are spent before wallet money.
            </p>
          </>
        ) : (
          <>
            <p className="text-3xl font-bold text-white/30">0</p>
            <p className="text-xs text-white/40 mt-1">
              {wallet.trial_expires_at
                ? `Trial ended ${formatDate(wallet.trial_expires_at)}. Sessions now bill from your wallet.`
                : "Sessions bill from your wallet."}
            </p>
          </>
        )}
      </div>

      {/* The allowance is CAPPED, not additive: 20 GB free, or the 50 GB cap
          once a payment lands — never 70. A single "0 GB / 50 GB" bar hid the
          gift completely and read as though 50 GB only exists after paying.
          So the bar is SEGMENTED at the free-tier boundary and both segments
          are labelled: the free 20 GB is visibly a permanent part of the
          total, and the paid segment is visibly the part a recharge adds. */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
            Storage
          </h2>
          <span className="text-xs text-white/40">
            {formatBytes(wallet.storage_used_bytes ?? 0)} used of {quotaGb} GB
          </span>
        </div>

        <div className="mt-4 flex items-end gap-1.5">
          <span className="text-4xl font-bold leading-none text-cyan-300">{freeTier}</span>
          <span className="text-lg font-semibold leading-none text-cyan-300/80">GB</span>
          <span className="ml-1 pb-0.5 text-sm font-medium text-white/50">free, always</span>
        </div>

        {/* One bar, two zones, drawn to scale against the 50 GB cap so the
            free share is proportionally honest rather than decorative. */}
        <div className="mt-4 flex h-3 w-full gap-0.5 overflow-hidden rounded-full">
          <div
            className="relative h-full rounded-l-full bg-cyan-400/70"
            style={{ width: `${(freeTier / capGb) * 100}%` }}
            title={`${freeTier} GB free`}
          />
          <div
            className={`relative h-full rounded-r-full ${
              wallet.storage_paid_unlocked
                ? "bg-emerald-400/70"
                : "border border-dashed border-white/25 bg-white/[0.04]"
            }`}
            style={{ width: `${((capGb - freeTier) / capGb) * 100}%` }}
            title={`${capGb - freeTier} GB unlocked by a recharge`}
          />
        </div>

        <div className="mt-3 space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-400/70" />
            <span className="text-white/70">
              <b className="text-white">{freeTier} GB free on us</b>
              {!wallet.storage_paid_unlocked && wallet.trial_storage_expires_at
                ? ` · during your trial, until ${formatDate(wallet.trial_storage_expires_at)}`
                : " · included, not billed"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                wallet.storage_paid_unlocked ? "bg-emerald-400/70" : "bg-white/20"
              }`}
            />
            <span className={wallet.storage_paid_unlocked ? "text-white/70" : "text-white/45"}>
              {wallet.storage_paid_unlocked ? (
                <>
                  <b className="text-emerald-300">+{capGb - freeTier} GB unlocked</b> by your
                  recharge — permanently, even if your balance runs down
                </>
              ) : (
                <>
                  <b className="text-white/70">+{capGb - freeTier} GB</b> unlocks with any wallet
                  recharge, and stays unlocked for good
                </>
              )}
            </span>
          </div>
        </div>

        {usedPct != null && usedPct > 0 && (
          <p className="mt-3 text-xs text-white/40">
            You have used {usedPct.toFixed(usedPct < 1 ? 1 : 0)}% of your {quotaGb} GB.
          </p>
        )}
        <p className="mt-3 text-xs text-white/30">
          Project files persist between sessions. The workstation itself is wiped each time.
        </p>
      </div>
    </div>
  );
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
  // Razorpay's field, permanently null since we retired Razorpay invoicing —
  // one company must have ONE consecutive invoice series. Kept for old rows.
  invoice_short_url: string | null;
  // Ours. This is the GST invoice, rendered on demand from the invoice row.
  invoice_id: number | null;
  invoice_number: string | null;
  created_at: string;
}

interface UserInfo {
  full_name: string;
  email: string;
  id: string;
  role?: string;
  customer_type?: string;
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

/** The invoice PDF endpoint requires the bearer token, so it cannot be a link.
 *  Fetch it, open the blob. Revoked after a beat so the tab keeps working. */
async function openInvoice(invoiceId: number) {
  const token = localStorage.getItem("cf_customer_token");
  if (!token) return;
  const res = await fetch(`${API}/invoices/${invoiceId}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    alert("That invoice could not be opened. Please contact support@coreframecloud.com.");
    return;
  }
  const url = URL.createObjectURL(await res.blob());
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function statusBadge(status: string) {
  const s = status.toLowerCase();
  let cls = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ";
  // "paid" belongs here: a successful payment was rendering in the red
  // failure style, which is an alarming way to confirm someone's money
  // arrived. "created" is a top-up that never reached the gateway.
  if (s === "ended" || s === "completed" || s === "paid" || s === "captured") {
    cls += "bg-emerald-400/10 text-emerald-300 border border-emerald-400/20";
  } else if (s === "active" || s === "provisioning" || s === "created" || s === "pending") {
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
  // The header's wallet chip links to /my-activity#add-funds, so arriving with
  // that hash opens the dialog straight away rather than landing the customer
  // on a page and making them hunt for the button they just clicked.
  const [topUpOpen, setTopUpOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && window.location.hash === "#add-funds") {
      setTopUpOpen(true);
    }
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

    const authFetch = async (url: string) => {
      try {
        const r = await fetch(url, { headers });
        // 401 = the token is bad; sign them out.
        // 403 = the token is FINE but the account is not verified yet — it is a
        // verification-scoped token, which is supposed to be refused here.
        // Deleting it on 403 signed people out while the header still showed
        // them as logged in, which is where the contradiction came from.
        if (r.status === 401) throw new Error("auth_failed");
        if (r.status === 403) throw new Error("needs_verification");
        if (!r.ok) return null;
        return r.json();
      } catch (err: unknown) {
        if (err instanceof Error && ["auth_failed", "needs_verification"].includes(err.message)) throw err;
        return null; // network errors or missing endpoints → treat as empty
      }
    };

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
        if (err.message === "needs_verification") {
          // Keep the session; send them to finish verifying.
          window.location.href = "/verify";
          return;
        }
        if (err.message === "auth_failed") {
          localStorage.removeItem("cf_customer_token");
          localStorage.removeItem("cf_customer_user");
          setToken(null);
        }
        // other errors: still render the page with whatever loaded
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
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-6 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
          >
            Sign in
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

        {/* Wallet section — layout depends on role */}
        {user?.role === "org_admin" ? (
          /* B2B Org admin: balance card + link to org portal */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6">
              <h2 className="text-xs font-semibold text-emerald-300/60 uppercase tracking-wider mb-4">
                Org Wallet Balance
              </h2>
              <p className="text-3xl font-bold text-emerald-300">
                ₹{wallet ? wallet.wallet_balance_rupees.toFixed(2) : "0.00"}
              </p>
              <p className="text-xs text-white/40 mt-1">Shared across your organization</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                  Manage Team &amp; Wallet
                </h2>
                <p className="text-sm text-white/50">
                  Top up your org wallet, invite team members, and view usage from the Org Portal.
                </p>
              </div>
              <a
                href="/org-admin"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-cyan-400 text-slate-900 px-5 py-2.5 text-sm font-semibold hover:bg-cyan-300 transition"
              >
                Go to Org Portal →
              </a>
            </div>
          </div>
        ) : user?.customer_type !== "b2b" ? (
          /* `role === "r_customer"` — a role deleted in the roles refresh and
             mapped to `member`. This condition was therefore false for every
             user, so no B2C customer saw their wallet or recharge option here
             at all. Keyed on customer_type now: retail is a SEGMENT, not a
             capability, which is the whole reason the role was removed. */
          /* B2C retail customer: balance + recharge coming soon */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6">
              <h2 className="text-xs font-semibold text-emerald-300/60 uppercase tracking-wider mb-4">
                Wallet Balance
              </h2>
              <p className="text-3xl font-bold text-emerald-300">
                ₹{wallet ? wallet.wallet_balance_rupees.toFixed(2) : "0.00"}
              </p>
              {/*
                "from ₹X/hr", because there is no single rate any more — it
                depends which workstation you launch. This reads the cheapest
                live rate for the customer's segment from the rate card.

                It previously showed `hourly_rate_rupees_per_hour`, the
                per-customer override, which defaults to 99 and is charged to
                nobody. A customer seeing "₹99/hr" here and then a ₹399 line on
                their invoice has every reason to dispute it.

                No hardcoded fallback: an em-dash beats a wrong price.
              */}
              <p className="text-xs text-white/40 mt-1">
                {wallet?.gpu_rate_from_rupees != null
                  ? `GPU time from ₹${Math.round(wallet.gpu_rate_from_rupees)}/hr · GST included`
                  : "— rates unavailable"}
              </p>
              {wallet?.next_expiry && (
                <p className="text-xs text-amber-300/80 mt-2">
                  ₹{Math.round(wallet.next_expiry.amount_rupees).toLocaleString("en-IN")} expires on{" "}
                  {new Date(wallet.next_expiry.expires_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              )}
            </div>
            <div id="add-funds" className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                  Add Funds
                </h2>
                {/* This card used to say "online recharge is coming soon" and
                    offer a mailto link. Nothing was gating it — the web wallet
                    had simply never been wired to the payment endpoints the API
                    and the Connect client already had. The dialog asks the
                    server whether recharge is configured and falls back to the
                    contact route only if it says no. */}
                <p className="text-sm text-white/50">
                  Top up instantly by card, UPI or netbanking. A GST invoice is issued automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTopUpOpen(true)}
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-cyan-400 text-slate-900 px-5 py-2.5 text-sm font-semibold hover:bg-cyan-300 transition"
              >
                Add Funds →
              </button>
            </div>
          </div>
        ) : (
          /* B2B engineer: balance only, managed by org admin */
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
              Wallet Balance
            </h2>
            <p className="text-3xl font-bold text-emerald-300">
              ₹{wallet ? wallet.wallet_balance_rupees.toFixed(2) : "0.00"}
            </p>
            <p className="text-xs text-white/50 mt-1">Managed by your organization admin</p>
          </div>
        )}

        {/* Free minutes and disk. Rendered for every segment: a B2B engineer
            on the org's pooled wallet still has their own storage and their
            own trial clock. */}
        <UsageCards wallet={wallet} />

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
                        {/* Our GST invoice. It cannot be a plain href: the PDF
                            endpoint is authenticated, so it is fetched with the
                            bearer token and opened as a blob. The old cell read
                            `invoice_short_url`, a Razorpay field that has been
                            null since we took invoicing in-house — so every
                            paid row showed a dash while the invoice existed. */}
                        {p.invoice_id ? (
                          <button
                            type="button"
                            onClick={() => openInvoice(p.invoice_id!)}
                            title={p.invoice_number ?? undefined}
                            className="text-cyan-400 hover:text-cyan-300 transition text-xs font-medium"
                          >
                            {p.invoice_number ?? "Invoice"} ↗
                          </button>
                        ) : p.invoice_short_url ? (
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


      </div>

      <TopUpDialog
        open={topUpOpen}
        onClose={() => {
          setTopUpOpen(false);
          // Clear the deep-link hash so a refresh does not reopen the dialog.
          if (typeof window !== "undefined" && window.location.hash === "#add-funds") {
            window.history.replaceState(null, "", window.location.pathname);
          }
        }}
        onCredited={(balance) =>
          setWallet((w) => (w ? { ...w, wallet_balance_rupees: balance } : w))
        }
        user={user}
      />
    </main>
  );
}
