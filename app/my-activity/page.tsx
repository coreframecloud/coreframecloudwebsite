"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import TopUpDialog, { type BulkTier } from "@/components/wallet/top-up-dialog";
import { BonusLadder } from "@/components/wallet/bonus-ladder";
import ActivityList, {
  type LedgerRow,
  type PaymentRow,
  type SessionRow,
} from "@/components/wallet/activity-list";
import { announceWallet } from "@/components/wallet/wallet-events";
import MyCfdJobs from "@/components/cfd/my-cfd-jobs";
import MyStudioProjects from "@/components/studio/my-studio-projects";
import SignInSecurity from "@/components/account/sign-in-security";
import MyTeamCard from "@/components/team/my-team-card";
import { apiFetch, forgetLocalSession, isSignedIn, rememberUser, sessionMarker } from "@/lib/session";
import { trackEvent } from "@/lib/analytics";
import {
  introOfferFor,
  introOfferForAccount,
  hoursLabel,
  minFirstTopup,
  rupees,
  type IntroOffer,
  introPrice,
} from "@/lib/rate-card";
import { useRateCard } from "@/lib/use-rate-card";
import { API_BASE } from "@/lib/api-base";
import { formatMoney, parseCurrency, type Currency } from "@/lib/money";

const API = API_BASE;

interface WalletData {
  wallet_balance_rupees: number;
  // Unified wallet (13 Oct 2026): one wallet for GPU, CFD and Studio. The
  // intro bonus inside the balance is for GPU time only, so the part usable
  // everywhere is sent too. Optional: an older control plane omits them.
  spendable_everywhere_rupees?: number;
  gpu_only_bonus_rupees?: number;
  gpu_only_bonus_expires_at?: string | null;
  bulk_topup_tiers?: BulkTier[];
  // The Rs 99 Studio starter (13 Oct 2026): the whole wallet, the Studio-only
  // part of it, and whether the starter can still be bought.
  wallet_total_rupees?: number;
  studio_only_rupees?: number;
  studio_only_bonus_expires_at?: string | null;
  studio_starter_available?: boolean;
  studio_starter_price_rupees?: number;
  studio_starter_total_rupees?: number;
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
  /** First top-up A/B (22 Oct 2026): this account's own offer — the arm and
   *  the price / hours / bonus it is served. The intro card and the top-up
   *  dialog show these, never the public rate card's numbers. Absent on an
   *  older control plane, which then means the rate card's offer. */
  intro_variant?: string | null;
  intro_offer_price_rupees_now?: number | null;
  intro_offer_hours_now?: number | null;
  intro_offer_bonus_rupees_now?: number | null;
  /** ISO-3166 alpha-2 from sign-up; preselects the billing country. */
  country_code?: string | null;
  /** 15 Oct 2026: "INR" | "USD" (null: no country yet). Every `*_rupees`
   *  money field here is in THIS currency, whatever its name says. Absent on
   *  an older control plane, which is INR-only. */
  wallet_currency?: string | null;
  /** The currency of the wallet that PAYS: the organisation's for a member
   *  of one, else the same as wallet_currency. The balance is in it. */
  billing_currency?: string | null;
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
  const cur: Currency = parseCurrency(wallet.wallet_currency) ?? "INR";
  // Only the offer in the account's own currency.
  const introLive = wallet.intro_offer_available === true && offer != null && offer.currency === cur;
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
          {introPrice(offer)} <span className="text-blue">→</span>{" "}
          {hoursLabel(offer.hours)}
          {offer.gpuName ? <span className="text-ink-2"> of {offer.gpuName}</span> : null}
        </p>
        <p className="mt-2 text-sm leading-6 text-ink-2">
          {needsPayment
            ? "Your account is ready, and your first top-up unlocks sessions. It\u2019s "
            : "Your first top-up is "}
          one per customer and billed per minute of streaming.{" "}
          {cur === "USD"
            ? "Pay by card in US dollars, with no GST."
            : "Pay by card, UPI or netbanking; international cards work too."}
        </p>
        <button
          type="button"
          onClick={() => onAdd(offer.price, "intro_offer")}
          className="cf-btn-primary mt-5 w-full sm:w-auto"
        >
          Add {introPrice(offer)} · {hoursLabel(offer.hours, true)}
        </button>
      </section>
    );
  }

  // fallbackMin is the rate card's rupee minimum: no use to a USD account.
  const min = wallet.min_topup_rupees_now ?? (cur === "USD" ? null : fallbackMin);
  const fmt = (v: number) => (cur === "USD" ? formatMoney(v, "USD") : rupees(v));
  return (
    <section className="cf-glass border-l-2! border-l-blue! p-5 sm:p-6">
      <h2 className="cf-eyebrow">Ready when you are</h2>
      <p className="mt-3 font-display text-2xl leading-tight font-bold text-ink">
        {min ? `Add ${fmt(min)} to start.` : "Add funds to start."}
      </p>
      <p className="mt-2 text-sm leading-6 text-ink-2">
        Your account is set up. Sessions start once your wallet has its first top-up, and
        they&rsquo;re billed per minute of streaming.
      </p>
      <button
        type="button"
        onClick={() => onAdd(min, "first_topup")}
        className="cf-btn-primary mt-5 w-full sm:w-auto"
      >
        {min ? `Add ${fmt(min)}` : "Add funds"}
      </button>
    </section>
  );
}

/** Disk usage. The free-minutes half of this panel went with the trial. */
function UsageCards({ wallet }: { wallet: WalletData | null }) {
  if (!wallet) return null;
  // Storage is billed in the account's currency (wallet_currency).
  const sym = parseCurrency(wallet.wallet_currency) === "USD" ? "$" : "₹";
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
                <b>{sym}{(wallet.storage_daily_charge_rupees ?? 0).toFixed(2)} a day</b> for the{" "}
                {(wallet.storage_billable_gb ?? 0).toFixed(1)} GB above your{" "}
                {wallet.storage_allowance_gb ?? 50} GB
              </span>
              <span className="font-mono text-xs whitespace-nowrap tabular-nums text-ink-2">
                {sym}{(wallet.storage_month_to_date_rupees ?? 0).toFixed(2)} this month
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-ink-2">
              {wallet.storage_rate_rupees_per_tb_month != null
                ? `Taken from your wallet each morning at ${sym}${wallet.storage_rate_rupees_per_tb_month}/TB/month.`
                : "Taken from your wallet each morning at the published storage rate."}{" "}
              Delete what you
              don&rsquo;t need and the charge stops the same day. There&rsquo;s nothing to cancel.
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
                  top-up. The space stays yours whatever your balance does
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

function formatRupees(x: number, currency: Currency = "INR"): string {
  if (currency === "USD") return formatMoney(Math.abs(x), "USD");
  const whole = Math.abs(x - Math.round(x)) < 0.005;
  return `₹${Math.abs(x).toLocaleString("en-IN", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  })}`;
}

interface UserInfo {
  full_name: string;
  email: string;
  id: string;
  role?: string;
  customer_type?: string;
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

const LEDGER_FIRST = 100;
const LEDGER_MAX = 500; // the API's own cap on `limit`

interface ActivityData {
  wallet: WalletData | null;
  sessions: SessionRow[];
  payments: PaymentRow[];
  ledger: LedgerRow[] | null;
  pooled: boolean;
  limit: number;
}

/** Everything the page shows, in one go. Throws "auth_failed" on 401 and
 *  "forbidden" on 403; anything else (network, a missing endpoint) reads as
 *  empty, so one failing list never blanks the page. */
async function fetchActivity(_session: string, ledgerLimit: number): Promise<ActivityData> {
  const authFetch = async (url: string) => {
    try {
      // no-store: the browser must never answer these from its cache, or a
      // re-read after a top-up shows the balance from before it. The session
      // is the HttpOnly cookie (lib/session.ts), renewed once on a 401.
      const r = await apiFetch(url, { cache: "no-store" });
      // 401 = the token is bad; sign them out.
      // 403 = the token is fine but this account may not use the page. That
      // USED to mean "not verified" and always went to /verify; now only a
      // pending account belongs there (checked by the caller), and a suspended
      // or otherwise refused one is told so instead of looping through /verify.
      // 402 = paid access required; the page itself still renders.
      if (r.status === 401) throw new Error("auth_failed");
      if (r.status === 403) throw new Error("forbidden");
      if (!r.ok) return null;
      return r.json();
    } catch (err: unknown) {
      if (err instanceof Error && ["auth_failed", "forbidden"].includes(err.message)) throw err;
      return null;
    }
  };
  const [w, s, p, l] = await Promise.all([
    authFetch(`${API}/me/wallet`),
    authFetch(`${API}/me/sessions`),
    authFetch(`${API}/payments/history`),
    authFetch(`${API}/me/wallet/ledger?limit=${ledgerLimit}`),
  ]);
  return {
    wallet: w ?? null,
    sessions: Array.isArray(s) ? s : [],
    payments: Array.isArray(p) ? p : [],
    ledger: Array.isArray(l?.rows) ? l.rows : null,
    pooled: l?.pooled === true,
    limit: ledgerLimit,
  };
}

/** The invoice PDF endpoint needs the session, so it is fetched with the
 *  cookie and opened as a blob. Revoked after a beat so the tab keeps working. */
async function openInvoice(invoiceId: number) {
  if (!isSignedIn()) return;
  const res = await apiFetch(`${API}/invoices/${invoiceId}/pdf`);
  if (!res.ok) {
    alert("That invoice could not be opened. Please contact support@coreframecloud.com.");
    return;
  }
  const url = URL.createObjectURL(await res.blob());
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export default function MyActivityPage() {
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  // The account's currency (wallet_currency); every wallet amount is in it.
  const cur: Currency = parseCurrency(wallet?.wallet_currency) ?? "INR";
  const sym = cur === "USD" ? "$" : "₹";
  // A member's balance is the organisation's wallet, in its currency.
  const balSym = (parseCurrency(wallet?.billing_currency) ?? cur) === "USD" ? "$" : "₹";
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [ledgerPooled, setLedgerPooled] = useState(false);
  // The ledger has no offset or cursor (16 Oct 2026), only `limit` (max 500):
  // "Show more" past what is loaded asks again with a bigger limit.
  const ledgerLimit = useRef(LEDGER_FIRST);
  const [ledgerMore, setLedgerMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const tokenRef = useRef<string | null>(null);
  const lastRefresh = useRef(0);
  const pendingTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // The header's wallet chip links to /my-activity#add-funds, so arriving with
  // that hash opens the dialog straight away rather than landing the customer
  // on a page and making them hunt for the button they just clicked.
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpPreset, setTopUpPreset] = useState<number | null>(null);
  // Arrived from Studio (?studio=1): the top-up offers the Rs 99 Studio starter.
  const [studioCtx, setStudioCtx] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);
  const card = useRateCard();
  // The offer in the ACCOUNT's currency: the rupee one, or the dollar one
  // ($20 = 8 hours, owner 18 Oct 2026) while the API publishes it. Shown only
  // when the wallet status says this account can still claim it -- and with
  // THIS account's own price and hours (first top-up A/B, 22 Oct 2026: an
  // intro500 account sees ₹500 = 3 hours; everyone else the standing offer).
  const introOffer = introOfferForAccount(introOfferFor(card, cur), wallet);

  const apply = useCallback((d: ActivityData) => {
    if (d.wallet) {
      setWallet(d.wallet);
      // The header's wallet pill reads the same status; hand it over.
      announceWallet(d.wallet);
    }
    setSessions(d.sessions);
    setPayments(d.payments);
    if (d.ledger) {
      setLedger(d.ledger);
      setLedgerMore(d.ledger.length >= d.limit && d.limit < LEDGER_MAX);
    }
    setLedgerPooled(d.pooled);
  }, []);

  /** Re-read the wallet, its history, sessions and payments in place: after a
   *  top-up, after the dialog closes, and when the tab comes back into view.
   *  No skeleton: the page stays as it is and the numbers change. */
  const refresh = useCallback(async () => {
    const t = tokenRef.current;
    if (!t) return;
    lastRefresh.current = Date.now();
    try {
      apply(await fetchActivity(t, ledgerLimit.current));
    } catch (err) {
      if (err instanceof Error && err.message === "auth_failed") {
        forgetLocalSession();
        setToken(null);
      }
    }
  }, [apply]);

  const loadMoreLedger = useCallback(async () => {
    const t = tokenRef.current;
    if (!t || loadingMore) return;
    ledgerLimit.current = Math.min(LEDGER_MAX, ledgerLimit.current + LEDGER_FIRST);
    setLoadingMore(true);
    try {
      apply(await fetchActivity(t, ledgerLimit.current));
    } catch {
      /* keep what is on screen */
    } finally {
      setLoadingMore(false);
    }
  }, [apply, loadingMore]);

  // Back on the tab (paid in another tab, used Connect, ran a CFD job): re-read,
  // at most every 10 s so switching windows quickly does not hammer the API.
  useEffect(() => {
    const onBack = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastRefresh.current < 10_000) return;
      void refresh();
    };
    document.addEventListener("visibilitychange", onBack);
    window.addEventListener("focus", onBack);
    const timers = pendingTimers.current;
    return () => {
      document.removeEventListener("visibilitychange", onBack);
      window.removeEventListener("focus", onBack);
      timers.forEach(clearTimeout);
    };
  }, [refresh]);

  function openTopUp(amount: number | null, source: "intro_offer" | "first_topup" | "add_funds") {
    setTopUpPreset(amount);
    setTopUpOpen(true);
    // Intent, not a conversion: the purchase conversion fires only when
    // /payments/verify confirms the money (top-up dialog).
    if (source !== "add_funds") {
      trackEvent("begin_checkout", {
        value: amount ?? undefined,
        currency: cur,
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
      if (params.get("studio") === "1") setStudioCtx(true);
    }
    const t = sessionMarker();
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

    tokenRef.current = t;

    fetchActivity(t, ledgerLimit.current)
      .then(apply)
      .catch(async (err) => {
        if (err.message === "forbidden") {
          // Keep the session. Ask the one endpoint a scoped token may call
          // whether sign-up is unfinished; only then is /verify the answer.
          try {
            const r = await apiFetch(`${API}/verification/status`);
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
          forgetLocalSession();
          setToken(null);
        }
        // other errors: still render the page with whatever loaded
      })
      .finally(() => {
        lastRefresh.current = Date.now();
        setLoading(false);
      });
  }, [apply]);

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
                <span className="font-normal break-words text-ink-3"> · {user.full_name}</span>
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
                </span>,
                the drive labelled <span className="font-semibold text-ink">Coreframe Datalake</span>.
                It&rsquo;s already mapped when the desktop appears, and it&rsquo;s the only
                place that survives the session.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="cf-glass-inset p-4">
                  <p className="font-mono text-[11.5px] leading-none font-medium tracking-[0.2em] uppercase text-blue">Kept</p>
                  <p className="mt-2 text-sm leading-6 text-ink-2">
                    Anything under <span className="font-mono text-ink">N:\</span>. It&rsquo;ll be
                    waiting next session, and you can download it from here any time.
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
                    Keep the whole project folder on N:, not just the scene file. D5, Twinmotion
                    and 3ds Max break if textures move.
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
                {balSym}{wallet ? wallet.wallet_balance_rupees.toFixed(2) : "0.00"}
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
                Wallet
              </h2>
              <p className="font-display text-3xl font-bold tabular-nums text-blue">
                {wallet
                  ? cur === "USD"
                    ? formatMoney(wallet.wallet_total_rupees ?? wallet.wallet_balance_rupees, "USD")
                    : `₹${(wallet.wallet_total_rupees ?? wallet.wallet_balance_rupees).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                  : `${sym}0.00`}
              </p>
              {/* ONE WALLET (13 Oct 2026): the same money pays for all three
                  services. The intro bonus is the one part that is GPU-only,
                  so it gets its own line rather than a footnote. */}
              <p className="mt-1 text-xs text-ink-2">
                Pays for GPU workstations, CFD and Studio.
              </p>
              {(wallet?.gpu_only_bonus_rupees ?? 0) > 0 && (
                <p className="mt-2 text-xs tabular-nums text-ink-2">
                  Includes a welcome bonus of {formatRupees(wallet!.gpu_only_bonus_rupees!, cur)} for GPU time
                  {wallet!.gpu_only_bonus_expires_at
                    ? `, until ${new Date(wallet!.gpu_only_bonus_expires_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}`
                    : ""}
                  . {formatRupees(wallet!.spendable_everywhere_rupees ?? 0, cur)} is usable on CFD and Studio too.
                </p>
              )}
              {(wallet?.studio_only_rupees ?? 0) > 0 && (
                <p className="mt-2 text-xs tabular-nums text-ink-2">
                  Includes Studio-only {formatRupees(wallet!.studio_only_rupees!, cur)} from the Studio starter
                  {wallet!.studio_only_bonus_expires_at
                    ? `; its bonus lasts until ${new Date(wallet!.studio_only_bonus_expires_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}`
                    : ""}
                  .
                </p>
              )}
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
                  ? cur === "USD"
                    ? `GPU time from ${formatMoney(wallet.gpu_rate_from_rupees, "USD")}/hr · no GST`
                    : `GPU time from ₹${Math.round(wallet.gpu_rate_from_rupees)}/hr · GST included`
                  : "Rates unavailable right now"}
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
                  {cur === "USD"
                    ? formatMoney(wallet.next_expiry.amount_rupees, "USD")
                    : `₹${Math.round(wallet.next_expiry.amount_rupees).toLocaleString("en-IN")}`} expires on{" "}
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
                {/* The bulk bonus, drawn (owner, 16 Oct 2026). Tiers from the
                    wallet status, in the account's currency; a tile opens the
                    dialog with that amount. */}
                {(wallet?.bulk_topup_tiers?.length ?? 0) > 0 && (
                  <>
                    <p className="mb-3 font-display text-xl leading-7 font-semibold text-ink">
                      Top up more, get more.
                    </p>
                    <BonusLadder
                      tiers={wallet!.bulk_topup_tiers!}
                      currency={cur}
                      onPick={(v) => openTopUp(v, "add_funds")}
                    />
                    <p className="mt-3 text-xs leading-5 text-ink-2">
                      Bonus credit on top of what you pay, for GPU time{cur === "USD" ? " and CFD" : ", CFD and Studio"}
                      {wallet?.intro_offer_available ? ", from your second top-up" : ""}.
                    </p>
                  </>
                )}
                <p className={`text-sm leading-6 text-ink-2 ${(wallet?.bulk_topup_tiers?.length ?? 0) > 0 ? "mt-2" : ""}`}>
                  {cur === "USD"
                    ? "Top up by card, in US dollars. No GST (export of services); an invoice is issued automatically."
                    : "Top up by card, UPI or netbanking. A GST invoice is issued automatically."}
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
              {balSym}{wallet ? wallet.wallet_balance_rupees.toFixed(2) : "0.00"}
            </p>
            <p className="mt-1 text-xs text-ink-2">Managed by your org admin</p>
          </div>
        )}

        {/* Teams v2 (20 Oct 2026): "Your team" for a member, "Connect with my
            team" for anyone in no team, and invites with Accept / Decline.
            Joining or leaving changes which wallet pays, so it refreshes. */}
        <MyTeamCard
          onTeamChanged={(t) => {
            // The cached account says which wallet layout to show; a team
            // joined here makes this a company (b2b) account with that role.
            if (t?.organization && user) {
              const next = { ...user, role: t.role ?? user.role, customer_type: "b2b" };
              setUser(next);
              rememberUser(next);
            }
            void refresh();
          }}
        />

        {/* Disk. Rendered for every segment: a B2B engineer on the org's
            pooled wallet still has their own storage. */}
        <UsageCards wallet={wallet} />

        {/* CFD jobs (16 Oct 2026): the account's simulations, each opening its
            job page with the session. Above Activity: a job waiting on the
            customer matters more than a ledger line. */}
        <MyCfdJobs token={token} />

        {/* Studio projects (16 Oct 2026): the same account's floor plans in
            Studio, each opening the project at /studio. */}
        <MyStudioProjects token={token} />

        {/* Activity: ONE list (owner, 16 Oct 2026). Wallet history, Recent
            sessions and Payment history showed the same charges two or three
            times, each in its own scrolling table. See activity-list.tsx. */}
        <ActivityList
          ledger={ledger}
          sessions={sessions}
          payments={payments}
          pooled={ledgerPooled}
          currency={cur}
          moreOnServer={ledgerMore}
          loadingMore={loadingMore}
          onLoadMore={loadMoreLedger}
          onOpenInvoice={openInvoice}
        />
      </div>

      <div className="mt-6">
        <SignInSecurity />
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
          // Whatever happened in the dialog, the page re-reads the wallet.
          void refresh();
        }}
        onCredited={() => {
          // The verify response's balance is the GPU mirror, not the whole
          // wallet the card shows (wallet_total_rupees), so it is not written
          // into the card: that is how the card kept saying ₹399.63 after a
          // ₹2,000 top-up. Flip the onboarding flags now, then re-read
          // everything from the server.
          setWallet((w) =>
            w
              ? {
                  ...w,
                  paid_access: w.paid_access === undefined ? undefined : true,
                  intro_offer_available: false,
                }
              : w,
          );
          void refresh();
        }}
        onPending={() => {
          // Paid, not credited yet: the webhook usually lands within a minute.
          pendingTimers.current.forEach(clearTimeout);
          pendingTimers.current = [10_000, 30_000, 90_000].map((ms) =>
            setTimeout(() => void refresh(), ms),
          );
        }}
        user={user}
        minTopupNow={wallet?.min_topup_rupees_now ?? null}
        introOffer={wallet?.intro_offer_available ? introOffer : null}
        isFirstTopup={wallet?.intro_offer_available === true}
        presetAmount={topUpPreset ?? (wallet?.intro_offer_available ? introOffer?.price ?? null : null)}
        defaultCountry={wallet?.country_code ?? null}
        bulkTiers={wallet?.bulk_topup_tiers ?? null}
        walletCurrency={wallet?.wallet_currency ?? null}
        studioStarter={
          studioCtx && wallet?.studio_starter_available
            ? {
                priceRupees: wallet.studio_starter_price_rupees ?? 99,
                totalRupees: wallet.studio_starter_total_rupees ?? 300,
              }
            : null
        }
      />
    </main>
  );
}
