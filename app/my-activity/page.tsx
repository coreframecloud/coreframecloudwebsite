"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TopUpDialog from "@/components/wallet/top-up-dialog";
import { trackEvent } from "@/lib/analytics";
import {
  getIntroOffer,
  hoursLabel,
  minFirstTopup,
  rupees,
  type IntroOffer,
} from "@/lib/rate-card";
import { useRateCard } from "@/lib/use-rate-card";

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
  trial_granted_minutes: number;
  trial_granted_at: string | null;
  trial_expires_at: string | null;
  trial_storage_gb: number;
  trial_storage_expires_at: string | null;
  storage_used_bytes: number;
  storage_quota_bytes: number | null;
  storage_quota_gb: number;
  storage_free_gb: number;
  storage_free_tier_gb: number;
  storage_billing_active?: boolean;
  storage_allowance_gb?: number;
  storage_billable_gb?: number;
  storage_daily_charge_rupees?: number;
  storage_month_to_date_rupees?: number;
  storage_rate_rupees_per_tb_month?: number;
  storage_dunning_stage?: string;
  storage_paid_cap_gb: number;
  storage_paid_unlocked: boolean;
  storage_retention_days: number;
  storage_retention_active_minutes: number;
  // Paid-first onboarding (10 Oct 2026). Optional: an older control plane
  // omits them, and then neither the intro card nor the "add funds to start"
  // state is shown — the page reads exactly as it did before.
  paid_access?: boolean;
  intro_offer_available?: boolean;
  min_topup_rupees_now?: number;
  /** ISO-3166 alpha-2 from sign-up; preselects the billing country. */
  country_code?: string | null;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 GB";
  const gb = bytes / 1024 ** 3;
  if (gb < 0.1) return `${(bytes / 1024 ** 2).toFixed(0)} MB`;
  return `${gb.toFixed(gb < 10 ? 1 : 0)} GB`;
}

/**
 * The first thing a signed-in customer without paid access needs: how to get
 * it. Paid-first onboarding (10 Oct 2026) replaced the free-minutes card with
 * this. Every number is from the rate card or the wallet status — the intro
 * card renders nothing it cannot source, and the "add funds to start" state
 * drops the amount rather than typing one.
 */
function StartCard({
  wallet,
  offer,
  fallbackMin,
  onAdd,
}: {
  wallet: WalletData | null;
  offer: IntroOffer | null;
  fallbackMin: number | null;
  onAdd: (amount: number | null, source: "intro_offer" | "first_topup") => void;
}) {
  if (!wallet) return null;
  const introLive = wallet.intro_offer_available === true && offer != null;
  const needsPayment = wallet.paid_access === false;
  if (!introLive && !needsPayment) return null;

  if (introLive) {
    return (
      <section className="cf-glass border-l-2! border-l-blue! p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="cf-eyebrow">Intro offer</h2>
          {offer.validityDays ? (
            <span className="font-mono text-[11px] whitespace-nowrap text-ink-2">
              Use within {offer.validityDays} days
            </span>
          ) : null}
        </div>
        <p className="mt-3 font-display text-3xl leading-tight font-bold text-ink">
          {rupees(offer.priceRupees)} <span className="text-blue">→</span>{" "}
          {hoursLabel(offer.hours)}
          {offer.gpuName ? <span className="text-ink-2"> of {offer.gpuName}</span> : null}
        </p>
        <p className="mt-2 text-sm leading-6 text-ink-2">
          {needsPayment
            ? "Your account is ready. Your first top-up unlocks sessions — "
            : "Your first top-up — "}
          one per customer, billed per minute of streaming. Card, UPI or netbanking;
          international cards accepted.
        </p>
        <button
          type="button"
          onClick={() => onAdd(offer.priceRupees, "intro_offer")}
          className="cf-btn-primary mt-5 w-full sm:w-auto"
        >
          Add {rupees(offer.priceRupees)} · {hoursLabel(offer.hours, true)}
        </button>
      </section>
    );
  }

  const min = wallet.min_topup_rupees_now ?? fallbackMin;
  return (
    <section className="cf-glass border-l-2! border-l-blue! p-5 sm:p-6">
      <h2 className="cf-eyebrow">Ready when you are</h2>
      <p className="mt-3 font-display text-2xl leading-tight font-bold text-ink">
        {min ? `Add ${rupees(min)} to start.` : "Add funds to start."}
      </p>
      <p className="mt-2 text-sm leading-6 text-ink-2">
        Your account is set up. Sessions start once your wallet has its first top-up —
        billed per minute of streaming, GST included.
      </p>
      <button
        type="button"
        onClick={() => onAdd(min, "first_topup")}
        className="cf-btn-primary mt-5 w-full sm:w-auto"
      >
        {min ? `Add ${rupees(min)}` : "Add funds"}
      </button>
    </section>
  );
}

/** Disk usage. The free-minutes half of this panel went with the trial. */
function UsageCards({ wallet }: { wallet: WalletData | null }) {
  if (!wallet) return null;
  const quotaGb =
    wallet.storage_quota_gb ||
    (wallet.storage_quota_bytes ? Math.round(wallet.storage_quota_bytes / 1024 ** 3) : 0);
  // What is included without a top-up. Trial storage is retired, so a missing
  // figure is 0 — not the old "20" — and the bar then shows one zone.
  const freeTier = wallet.storage_free_tier_gb ?? 0;
  const capGb = wallet.storage_paid_cap_gb || quotaGb || 0;
  // Fraction of the CAP, not of the current quota, so the fill sits in the
  // same place on the bar whether or not the paid tier is unlocked.
  const usedFrac = capGb > 0 ? Math.min(1, (wallet.storage_used_bytes ?? 0) / (capGb * 1024 ** 3)) : 0;
  const freeFrac = capGb > 0 ? Math.min(1, freeTier / capGb) : 0;

  return (
    <div className="mt-4 grid grid-cols-1 gap-4">
      {/* USAGE is the headline. The previous version made "20 GB free" the big
          number and pushed actual usage into small text above the panel, so a
          full-width allocation bar read as a full disk. Now the number answers
          "how much have I used", and the bar is a real meter: tinted ZONES
          behind showing the allowance split, a solid FILL in front showing
          consumption, and a tick where the free tier ends. */}
      <div className="cf-glass p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 className="cf-eyebrow">
            Storage
          </h2>
          {wallet.storage_allowance_gb ? (
            <span className="font-mono text-[11px] whitespace-nowrap text-ink-2">
              {wallet.storage_allowance_gb} GB included
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-end gap-2">
          <span className="font-display text-4xl leading-none font-bold tabular-nums text-ink">
            {formatBytes(wallet.storage_used_bytes ?? 0)}
          </span>
          <span className="pb-0.5 text-sm font-medium whitespace-nowrap text-ink-2">used of {quotaGb} GB</span>
        </div>

        {/* THE STANDING DAILY CHARGE, ON SCREEN BEFORE IT HAS TAKEN ANYTHING.
            A customer who tops up for GPU time and finds out months later that
            storage drank it is a customer lost for the price of a line of text.
            Shown whenever there is a charge, and not shown at all when there
            is nothing to say. */}
        {(wallet.storage_daily_charge_rupees ?? 0) > 0 && (
          <div className="cf-glass-inset mt-4 border-l-2! border-l-blue! px-4 py-3">
            <p className="mb-2 font-mono text-[11.5px] leading-none font-medium tracking-[0.2em] uppercase text-ink-2">Storage billing</p>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="text-sm text-ink">
                <b>₹{(wallet.storage_daily_charge_rupees ?? 0).toFixed(2)} a day</b> for the{" "}
                {(wallet.storage_billable_gb ?? 0).toFixed(1)} GB above your{" "}
                {wallet.storage_allowance_gb ?? 50} GB
              </span>
              <span className="font-mono text-xs whitespace-nowrap tabular-nums text-ink-2">
                ₹{(wallet.storage_month_to_date_rupees ?? 0).toFixed(2)} this month
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-ink-2">
              Taken from your wallet each morning at ₹
              {wallet.storage_rate_rupees_per_tb_month ?? 1999}/TB/month. Delete what you
              do not need and it stops the same day — there is nothing to cancel.
            </p>
          </div>
        )}

        {/* An open storage bill. Says what is true and what is NOT true, because
            the natural fear on seeing this is that files are already gone. */}
        {wallet.storage_dunning_stage && wallet.storage_dunning_stage !== "current" && (
          <div className="cf-glass-inset mt-3 border-l-2! border-l-blue! px-4 py-3">
            <p className="mb-2 font-mono text-[11.5px] leading-none font-medium tracking-[0.2em] uppercase text-ink-2">Payment failed</p>
            <p className="text-sm font-semibold text-ink">
              A storage charge could not be taken.
            </p>
            <p className="mt-1 text-xs leading-5 text-ink-2">
              {wallet.storage_dunning_stage === "read_only"
                ? "Your storage is read-only for now. Every file is still there and still downloadable."
                : wallet.storage_dunning_stage === "sessions_blocked"
                ? "New GPU sessions are paused until this clears. Your files are untouched and still downloadable."
                : "Nothing has been deleted. Add funds and it clears on the next daily charge."}{" "}
              Your first {wallet.storage_allowance_gb ?? 50} GB is never affected.
            </p>
          </div>
        )}

        <div className="relative mt-4 h-3.5 w-full overflow-hidden rounded-full bg-ink/10">
          {/* Zones: what the allowance is made of. Faint - this is the track. */}
          <div className="absolute inset-0 flex">
            <div className="h-full bg-blue/20" style={{ width: `${freeFrac * 100}%` }} />
            <div
              className={`h-full ${wallet.storage_paid_unlocked ? "bg-blue/20" : "bg-transparent"}`}
              style={{ width: `${(1 - freeFrac) * 100}%` }}
            />
          </div>
          {/* Where the included tier ends, when there is one. */}
          {freeFrac > 0 && freeFrac < 1 && (
            <div
              className="absolute top-0 h-full w-px bg-ink/25"
              style={{ left: `${freeFrac * 100}%` }}
            />
          )}
          {/* Consumption. A minimum sliver so "a little" never looks like none. */}
          {usedFrac > 0 && (
            <div
              className={`absolute left-0 top-0 h-full rounded-full ${
                usedFrac > 0.9 ? "bg-destructive" : usedFrac > 0.75 ? "bg-blue-ink" : "bg-blue"
              }`}
              style={{ width: `${Math.max(1.5, usedFrac * 100)}%` }}
            />
          )}
        </div>

        {/* Scale, so the tick means something without hovering. */}
        <div className="mt-1 flex font-mono text-[10px] tabular-nums text-ink-3">
          <span style={{ width: `${freeFrac * 100}%` }}>0</span>
          <span className="flex-1">{freeFrac > 0 && freeFrac < 1 ? `${freeTier} GB` : ""}</span>
          <span>{capGb} GB</span>
        </div>

        <div className="mt-4 space-y-1.5 text-xs">
          {freeTier > 0 && (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-blue" />
              <span className="text-ink-2">
                <b className="text-ink">{freeTier} GB included</b> · not billed
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                wallet.storage_paid_unlocked ? "bg-blue" : "bg-ink/15"
              }`}
            />
            <span className={wallet.storage_paid_unlocked ? "text-ink-2" : "text-ink-2"}>
              {wallet.storage_paid_unlocked ? (
                <>
                  <b className="text-blue">{freeTier > 0 ? "+" : ""}{capGb - freeTier} GB unlocked</b> by your
                  top-up — the space is yours whatever your balance does
                </>
              ) : (
                <>
                  <b className="text-ink-2">{freeTier > 0 ? "+" : ""}{capGb - freeTier} GB</b> unlocks with your
                  first top-up, and stays unlocked
                </>
              )}
            </span>
          </div>
        </div>

        <div className="cf-glass-inset mt-3 flex items-start gap-2 px-3 py-2.5">
          <span className="mt-0.5 text-sm text-blue" aria-hidden="true">↻</span>
          <p className="text-xs leading-5 text-ink-2">
            <b className="text-ink">Your files stay put.</b> Everything on your drive is
            kept between sessions while your account is active. We do not clear it on a timer,
            and we will always tell you before anything changes.
          </p>
        </div>
        <p className="mt-2 text-xs text-ink-3">
          The workstation itself is wiped after every session. Only this drive persists.
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
  let cls = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap capitalize ";
  // "paid" belongs here: a successful payment was rendering in the red
  // failure style, which is an alarming way to confirm someone's money
  // arrived. "created" is a top-up that never reached the gateway.
  if (s === "ended" || s === "completed" || s === "paid" || s === "captured") {
    cls += "bg-blue/10 text-blue border border-blue/20";
  } else if (s === "active" || s === "provisioning" || s === "created" || s === "pending") {
    cls += "bg-paper-2 text-ink-2 border border-rule-strong";
  } else {
    cls += "bg-destructive/5 text-destructive border border-destructive/30";
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
  const [topUpPreset, setTopUpPreset] = useState<number | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);
  const card = useRateCard();
  const introOffer = getIntroOffer(card);

  function openTopUp(amount: number | null, source: "intro_offer" | "first_topup" | "add_funds") {
    setTopUpPreset(amount);
    setTopUpOpen(true);
    // Intent, not a conversion: the purchase conversion fires only when
    // /payments/verify confirms the money (top-up dialog).
    if (source !== "add_funds") {
      trackEvent("begin_checkout", {
        value: amount ?? undefined,
        currency: "INR",
        location: source === "intro_offer" ? "my_activity_intro_offer" : "my_activity_first_topup",
      });
    }
  }

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      // #add-funds from the header's wallet chip; ?topup=1 from the end of
      // sign-up and the header's "Add ₹… · … hrs" button.
      const params = new URLSearchParams(window.location.search);
      if (window.location.hash === "#add-funds" || params.get("topup") === "1") {
        setTopUpOpen(true);
      }
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
        // 403 = the token is fine but this account may not use the page. That
        // USED to mean "not verified" and always went to /verify; now only a
        // pending account belongs there (checked below), and a suspended or
        // otherwise refused one is told so instead of looping through /verify.
        // 402 = paid access required; the page itself still renders.
        if (r.status === 401) throw new Error("auth_failed");
        if (r.status === 403) throw new Error("forbidden");
        if (!r.ok) return null;
        return r.json();
      } catch (err: unknown) {
        if (err instanceof Error && ["auth_failed", "forbidden"].includes(err.message)) throw err;
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
      .catch(async (err) => {
        if (err.message === "forbidden") {
          // Keep the session. Ask the one endpoint a scoped token may call
          // whether sign-up is unfinished; only then is /verify the answer.
          try {
            const r = await fetch(`${API}/verification/status`, { headers });
            const st = r.ok ? await r.json() : null;
            const pending =
              st?.account_status === "pending_approval" ||
              (st && st.account_active === false && st.next_step && st.next_step !== "done");
            if (pending) {
              window.location.href = "/verify";
              return;
            }
          } catch {
            /* fall through to the message */
          }
          setBlocked(
            "Your account cannot use this page right now. Contact support@coreframecloud.com and we will sort it out.",
          );
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
      <main className="relative min-h-screen text-ink">
        <div className="cf-aurora" />
        <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
          <div className="cf-glass p-6 text-center sm:p-8">
            <h1 className="font-display text-2xl leading-tight font-semibold text-ink">
              Sign in to see your activity.
            </h1>
            <p className="mt-2 text-[15px] leading-6 text-ink-2">
              Your wallet, sessions and invoices live behind your account.
            </p>
            <a href="/login" className="cf-btn-primary mt-6 w-full sm:w-auto">
              Sign in
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="relative min-h-screen text-ink">
        <div className="cf-aurora" />
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded-cf bg-ink/10" />
            <div className="h-4 w-64 rounded bg-ink/10" />
            <div className="mt-8 h-32 rounded-glass bg-ink/5" />
            <div className="h-48 rounded-glass bg-ink/5" />
          </div>
        </div>
      </main>
    );
  }

  if (blocked) {
    return (
      <main className="relative min-h-screen text-ink">
        <div className="cf-aurora" />
        <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
          <div className="cf-glass p-6 sm:p-8">
            <h1 className="font-display text-2xl leading-tight font-semibold text-ink">
              Account on hold.
            </h1>
            <p className="mt-2 text-[15px] leading-6 text-ink-2">{blocked}</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="relative min-h-screen text-ink">
        <div className="cf-aurora" />
        <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
          <p className="rounded-cf border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm break-words text-destructive">
            {error}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen text-ink">
      <div className="cf-aurora" />
      <div className="mx-auto max-w-4xl space-y-10 px-4 py-12 sm:px-6 sm:py-16">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="cf-eyebrow mb-2">
              Account
            </p>
            <h1 className="cf-section-title">
              My activity.
              {user?.full_name && (
                <span className="font-normal break-words text-ink-3"> — {user.full_name}</span>
              )}
            </h1>
          </div>
          {/* Permanent and unconditional. Connect is unlocked by verification,
              not by payment, and someone signing in from a different machine
              needs the installer again — so this is not onboarding that should
              disappear once they have used it. */}
          <Link
            href="/download"
            className="cf-btn-secondary w-full gap-2 sm:w-auto"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M10 2a1 1 0 0 1 1 1v8.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L9 11.586V3a1 1 0 0 1 1-1Z" />
              <path d="M3 15a1 1 0 0 1 1 1v1h12v-1a1 1 0 1 1 2 0v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1a1 1 0 0 1 1-1Z" />
            </svg>
            Download Coreframe Connect
          </Link>
        </div>

        {/* Saving your work. Above the wallet on purpose: a customer who
            loses a project cares about nothing else on this page. Named the
            drive explicitly after a customer ended a session unsure which
            location survived — "your NAS drive" is not an instruction, "N:" is. */}
        <section className="cf-glass border-l-2! border-l-blue! p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                 className="mt-0.5 h-5 w-5 shrink-0 text-blue">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 1.5a1 1 0 0 1 .87.5l8 14A1 1 0 0 1 18 17.5H2a1 1 0 0 1-.87-1.5l8-14a1 1 0 0 1 .87-.5Zm0 5a.9.9 0 0 0-.9.98l.35 3.87a.55.55 0 0 0 1.1 0l.35-3.87A.9.9 0 0 0 10 6.5Zm0 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
            </svg>
            <div className="min-w-0">
              <h2 className="cf-section-title">Where your work is saved.</h2>
              <p className="mt-2 text-[15px] leading-7 text-ink-2">
                Inside a session, save everything to{" "}
                <span className="rounded-cf border border-rule-strong bg-paper-2 px-1.5 py-0.5 font-mono text-sm font-semibold whitespace-nowrap text-ink">
                  N:
                </span>{" "}
                — the drive labelled <span className="font-semibold text-ink">Coreframe Datalake</span>.
                It is already mapped when the desktop appears, and it is the only
                place that survives the session.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="cf-glass-inset p-4">
                  <p className="font-mono text-[11.5px] leading-none font-medium tracking-[0.2em] uppercase text-blue">Kept</p>
                  <p className="mt-2 text-sm leading-6 text-ink-2">
                    Anything under <span className="font-mono text-ink">N:\</span>. Waiting for you
                    next session, and downloadable from here any time.
                  </p>
                </div>
                <div className="cf-glass-inset p-4">
                  <p className="font-mono text-[11.5px] leading-none font-medium tracking-[0.2em] uppercase text-destructive">Erased</p>
                  <p className="mt-2 text-sm leading-6 text-ink-2">
                    Desktop, Documents, Downloads, <span className="font-mono text-ink">C:\</span>,
                    and anything you installed. Wiped when the session ends.
                  </p>
                </div>
                <div className="cf-glass-inset p-4">
                  <p className="font-mono text-[11.5px] leading-none font-medium tracking-[0.2em] uppercase text-blue">Linked assets</p>
                  <p className="mt-2 text-sm leading-6 text-ink-2">
                    Keep the <span className="font-semibold text-ink">whole project folder</span> on
                    N:, not just the scene file — D5, Twinmotion and 3ds Max break if textures move.
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-ink-2">
                Working from a local copy? Save to <span className="font-mono text-ink">N:</span> before
                you finish, or use <span className="text-ink">Save As</span> and point it there at the
                start so every later save lands in the right place.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a href="/how-to-use#saving-your-work" className="cf-btn-secondary w-full sm:w-auto">
                  Read the full guide
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* How to start: the intro offer, or "add funds to start" when the
            account has no paid access yet. Retail only — an org's wallet is
            the org admin's to fund. */}
        {user?.customer_type !== "b2b" && user?.role !== "org_admin" && (
          <StartCard
            wallet={wallet}
            offer={introOffer}
            fallbackMin={minFirstTopup(card)}
            onAdd={openTopUp}
          />
        )}

        {/* Wallet section — layout depends on role */}
        {user?.role === "org_admin" ? (
          /* B2B Org admin: balance card + link to org portal */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="cf-glass border-l-2! border-l-blue! p-5 sm:p-6">
              <h2 className="cf-eyebrow mb-4">
                Org wallet balance
              </h2>
              <p className="font-display text-3xl font-bold tabular-nums text-blue">
                ₹{wallet ? wallet.wallet_balance_rupees.toFixed(2) : "0.00"}
              </p>
              <p className="mt-1 text-xs text-ink-2">Shared across your organisation</p>
            </div>
            <div className="cf-glass flex flex-col justify-between p-5 sm:p-6">
              <div>
                <h2 className="cf-eyebrow mb-2">
                  Team and wallet
                </h2>
                <p className="text-sm leading-6 text-ink-2">
                  Top up the org wallet, invite people and read usage in the org portal.
                </p>
              </div>
              <a href="/org-admin" className="cf-btn-primary mt-6 w-full sm:w-auto">
                Go to org portal
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
            <div className="cf-glass border-l-2! border-l-blue! p-5 sm:p-6">
              <h2 className="cf-eyebrow mb-4">
                Wallet balance
              </h2>
              <p className="font-display text-3xl font-bold tabular-nums text-blue">
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
              <p className="mt-1 text-xs text-ink-2">
                {wallet?.gpu_rate_from_rupees != null
                  ? `GPU time from ₹${Math.round(wallet.gpu_rate_from_rupees)}/hr · GST included`
                  : "— rates unavailable"}
              </p>
              {/* Minutes granted before the trial was retired (10 Oct 2026)
                  are still the customer's; say so while any remain. */}
              {(wallet?.trial_minutes_remaining ?? 0) > 0 && (
                <p className="mt-2 text-xs tabular-nums text-ink-2">
                  Plus {wallet!.trial_minutes_remaining} earlier-granted GPU minutes
                  {wallet!.trial_expires_at ? `, until ${formatDate(wallet!.trial_expires_at)}` : ""}
                </p>
              )}
              {wallet?.next_expiry && (
                <p className="mt-2 text-xs tabular-nums text-ink-2">
                  ₹{Math.round(wallet.next_expiry.amount_rupees).toLocaleString("en-IN")} expires on{" "}
                  {new Date(wallet.next_expiry.expires_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              )}
            </div>
            <div id="add-funds" className="cf-glass flex flex-col justify-between p-5 sm:p-6">
              <div>
                <h2 className="cf-eyebrow mb-2">
                  Add funds
                </h2>
                {/* This card used to say "online recharge is coming soon" and
                    offer a mailto link. Nothing was gating it — the web wallet
                    had simply never been wired to the payment endpoints the API
                    and the Connect client already had. The dialog asks the
                    server whether recharge is configured and falls back to the
                    contact route only if it says no. */}
                <p className="text-sm leading-6 text-ink-2">
                  Top up by card, UPI or netbanking. A GST invoice is issued automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openTopUp(null, "add_funds")}
                className="cf-btn-primary mt-6 w-full sm:w-auto"
              >
                Add funds
              </button>
            </div>
          </div>
        ) : (
          /* B2B engineer: balance only, managed by org admin */
          <div className="cf-glass p-5 sm:p-6">
            <h2 className="cf-eyebrow mb-4">
              Wallet balance
            </h2>
            <p className="font-display text-3xl font-bold tabular-nums text-blue">
              ₹{wallet ? wallet.wallet_balance_rupees.toFixed(2) : "0.00"}
            </p>
            <p className="mt-1 text-xs text-ink-2">Managed by your org admin</p>
          </div>
        )}

        {/* Disk. Rendered for every segment: a B2B engineer on the org's
            pooled wallet still has their own storage. */}
        <UsageCards wallet={wallet} />

        {/* Recent Sessions */}
        <div className="cf-glass overflow-hidden">
          <div className="border-b border-rule px-4 py-4 sm:px-6">
            <h2 className="cf-section-title">Recent sessions.</h2>
          </div>
          {sessions.length === 0 ? (
            <p className="px-4 py-8 text-sm text-ink-3 sm:px-6">No sessions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[360px] text-sm">
                <thead>
                  <tr className="border-b border-rule">
                    <th className="px-4 py-3 text-left font-mono text-[11px] leading-none font-medium tracking-[0.14em] whitespace-nowrap text-ink-3 uppercase sm:px-6">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-mono text-[11px] leading-none font-medium tracking-[0.14em] whitespace-nowrap text-ink-3 uppercase sm:px-6">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left font-mono text-[11px] leading-none font-medium tracking-[0.14em] whitespace-nowrap text-ink-3 uppercase sm:px-6">
                      Cost
                    </th>
                    <th className="px-4 py-3 text-left font-mono text-[11px] leading-none font-medium tracking-[0.14em] whitespace-nowrap text-ink-3 uppercase sm:px-6">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {sessions.map((s) => (
                    <tr key={s.id} className="transition hover:bg-paper-2">
                      <td className="px-4 py-3.5 whitespace-nowrap text-ink sm:px-6">
                        {formatDate(s.login_time)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap tabular-nums text-ink sm:px-6">
                        {formatDuration(s.billable_minutes)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap tabular-nums text-ink sm:px-6">
                        ₹{s.billed_amount_rupees.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 sm:px-6">
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
        <div className="cf-glass overflow-hidden">
          <div className="border-b border-rule px-4 py-4 sm:px-6">
            <h2 className="cf-section-title">Payment history.</h2>
          </div>
          {payments.length === 0 ? (
            <p className="px-4 py-8 text-sm text-ink-3 sm:px-6">No payments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[380px] text-sm">
                <thead>
                  <tr className="border-b border-rule">
                    <th className="px-4 py-3 text-left font-mono text-[11px] leading-none font-medium tracking-[0.14em] whitespace-nowrap text-ink-3 uppercase sm:px-6">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-mono text-[11px] leading-none font-medium tracking-[0.14em] whitespace-nowrap text-ink-3 uppercase sm:px-6">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left font-mono text-[11px] leading-none font-medium tracking-[0.14em] whitespace-nowrap text-ink-3 uppercase sm:px-6">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-mono text-[11px] leading-none font-medium tracking-[0.14em] whitespace-nowrap text-ink-3 uppercase sm:px-6">
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {payments.map((p) => (
                    <tr key={p.id} className="transition hover:bg-paper-2">
                      <td className="px-4 py-3.5 whitespace-nowrap text-ink sm:px-6">
                        {formatDate(p.paid_at ?? p.created_at)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap tabular-nums text-ink sm:px-6">
                        ₹{p.amount_rupees.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 sm:px-6">
                        {statusBadge(p.status)}
                      </td>
                      <td className="px-4 py-3.5 sm:px-6">
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
                            className="text-xs font-medium break-all text-blue transition hover:text-blue-ink"
                          >
                            {p.invoice_number ?? "Invoice"} ↗
                          </button>
                        ) : p.invoice_short_url ? (
                          <a
                            href={p.invoice_short_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-blue transition hover:text-blue-ink"
                          >
                            Download ↗
                          </a>
                        ) : (
                          <span className="text-xs text-ink-3">—</span>
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
          setTopUpPreset(null);
          // Clear the deep link so a refresh does not reopen the dialog.
          if (
            typeof window !== "undefined" &&
            (window.location.hash === "#add-funds" || window.location.search.includes("topup="))
          ) {
            window.history.replaceState(null, "", window.location.pathname);
          }
        }}
        onCredited={(balance) =>
          setWallet((w) =>
            w
              ? {
                  ...w,
                  wallet_balance_rupees: balance,
                  // Paid now. The server is authoritative on the next load;
                  // this only stops the "add funds to start" card lingering.
                  paid_access: w.paid_access === undefined ? undefined : true,
                  intro_offer_available: false,
                }
              : w,
          )
        }
        user={user}
        minTopupNow={wallet?.min_topup_rupees_now ?? null}
        introOffer={wallet?.intro_offer_available ? introOffer : null}
        presetAmount={topUpPreset ?? (wallet?.intro_offer_available ? introOffer?.priceRupees ?? null : null)}
        defaultCountry={wallet?.country_code ?? null}
      />
    </main>
  );
}
