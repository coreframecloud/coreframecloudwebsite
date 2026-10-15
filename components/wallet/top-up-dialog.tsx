"use client";

/**
 * Wallet top-up, on the website.
 *
 * The Add Funds card here said "online recharge is coming soon" and offered a
 * mailto link — not because a flag was off, but because the web wallet was
 * never wired to the payment endpoints that the API and the Connect client
 * have had all along. This is that wiring.
 *
 * The flow is Razorpay's standard three steps, and every one of them is on the
 * server for a reason:
 *
 *   1. GET  /payments/config      -> is recharge configured, and the PUBLIC key
 *   2. POST /payments/create-order-> our order + topup row, amount decided server-side
 *   3. POST /payments/verify      -> signature checked, wallet credited, invoice raised
 *
 * The client never decides what to charge or whether a payment succeeded. It
 * hands Razorpay an order the server created and hands the result back for the
 * server to verify against its own secret.
 *
 * Billing COUNTRY is mandatory, and for India so is the STATE: the state code
 * decides CGST+SGST versus IGST on the tax invoice this payment raises, and an
 * invoice taxed wrongly can only be corrected by credit note. The list is
 * fetched from /public/gst-states rather than hardcoded, so three clients
 * cannot drift. Any other country is sent as GST state code 96 ("Outside
 * India (Foreign Country)") with a free-form postal code; per the owner
 * (10 Oct 2026) that is an export of services under LUT, so no GST is charged
 * on the same rupee amount.
 *
 * Paid-first onboarding (10 Oct 2026): the first top-up has a higher minimum
 * (`min_topup_rupees_now` from the wallet status) and may carry the intro
 * offer, badged on its preset with numbers from the rate card.
 *
 * Two currencies (owner, 15 Oct 2026). The ACCOUNT's currency, from
 * /payments/config, decides everything here -- never the visitor's IP. INR is
 * India (GST included); USD is every other billing country (no GST, export of
 * services; the address is always state 96 in the account's country, so no
 * Indian states are offered; no intro offer, no Studio starter). An account
 * with no country yet (`country_required`) chooses it FIRST, which fixes the
 * currency for good (POST /verification/location). The order carries `amount`
 * and `currency`; the server refuses a mismatch with 409 currency_mismatch.
 * Every legacy `*_rupees` field is in the account's currency.
 */

import { useCallback, useEffect, useState } from "react";
import { trackConversion } from "@/lib/analytics";
import { hoursLabel, type IntroOffer } from "@/lib/rate-card";
import { useRateCard } from "@/lib/use-rate-card";
import { formatMoney, parseCurrency, usdRates, type Currency } from "@/lib/money";
import {
  COUNTRIES,
  FOREIGN_STATE_CODE,
  INDIA,
  countryByIso,
  fetchCountries,
  withBundledCountries,
  type Country,
  fetchIndianGstStates,
  type GstState,
} from "@/lib/validation";
import { API_BASE } from "@/lib/api-base";

const API = API_BASE;

type PaymentsConfig = {
  enabled: boolean;
  key_id: string | null;
  /** In the ACCOUNT's currency, whatever the name says. */
  min_topup_rupees: number;
  max_topup_rupees: number;
  min_topup_rupees_now?: number | null;
  // 15 Oct 2026; absent on an older control plane, which is INR-only.
  currency?: string | null;
  country_required?: boolean;
  min_topup?: number | null;
  max_topup?: number | null;
  min_topup_now?: number | null;
};

// Razorpay attaches itself to window; typed loosely because we only ever call
// one constructor on it.
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const PRESET_LADDER = [500, 1000, 2000, 5000, 10000, 20000];
const PRESET_LADDER_USD = [20, 50, 100, 200, 500, 1000];

/** In the account's currency: `min`/`bonus` from 15 Oct 2026, the `_rupees`
 *  names kept for an older control plane. */
export type BulkTier = { min_rupees: number; percent: number; bonus_rupees: number; min?: number; bonus?: number };

const tierMin = (t: BulkTier) => t.min ?? t.min_rupees;
const tierBonus = (t: BulkTier) => t.bonus ?? t.bonus_rupees;

/** The bonus a top-up of `rupees` earns at the given tiers (0 below the first). */
function typedRupeesForBonus(amount: string): number {
  const v = Number(amount);
  return Number.isFinite(v) && v > 0 ? v : 0;
}

export function bulkBonusFor(rupees: number, tiers: BulkTier[] | null | undefined): number {
  let pct = 0;
  for (const t of tiers ?? []) if (rupees >= tierMin(t)) pct = t.percent;
  return Math.round(rupees * pct) / 100;
}

export default function TopUpDialog({
  open,
  onClose,
  onCredited,
  user,
  minTopupNow,
  introOffer,
  presetAmount,
  defaultCountry,
  isFirstTopup,
  bulkTiers,
  walletCurrency,
  studioStarter,
}: {
  open: boolean;
  onClose: () => void;
  onCredited: (newBalanceRupees: number) => void;
  user: { full_name?: string; email?: string; id?: string } | null;
  /** The smallest top-up THIS customer may make right now — higher on a first
   *  top-up. From the wallet status; absent on an older control plane. */
  minTopupNow?: number | null;
  /** Set only when this customer can still claim the intro offer. */
  introOffer?: IntroOffer | null;
  /** Amount to preselect when the dialog opens (the intro offer button). */
  presetAmount?: number | null;
  /** ISO-3166 alpha-2 from sign-up, when the API reports it. */
  defaultCountry?: string | null;
  /** True when this customer has never topped up (the wallet still offers the
   *  intro). A successful payment then also fires the first_topup conversion. */
  isFirstTopup?: boolean;
  /** Bulk top-up bonus tiers from the wallet status (13 Oct 2026): a paid
   *  top-up of at least min_rupees earns percent extra, usable on GPU, CFD and
   *  Studio. Never on the same top-up as the intro offer. */
  bulkTiers?: BulkTier[] | null;
  /** `wallet_currency` from the wallet status the tiers above came from. When
   *  it differs from the account currency /payments/config reports (the
   *  customer has just chosen a country here), those tiers are stale. */
  walletCurrency?: string | null;
  /** The Rs 99 Studio starter (13 Oct 2026): passed ONLY when the customer
   *  came from Studio (?studio=1) and the account can still take it. Rs 99,
   *  once per account, Rs 300 of Studio-only money; the only top-up below
   *  the usual minimum. */
  studioStarter?: { priceRupees: number; totalRupees: number } | null;
}) {
  const [config, setConfig] = useState<PaymentsConfig | null>(null);
  // The account's currency once /payments/config has answered. An older
  // control plane does not report one and is INR-only.
  const currency: Currency = parseCurrency(config?.currency) ?? "INR";
  const isUsd = currency === "USD";
  const money = (v: number) => formatMoney(v, currency);
  const countryRequired = Boolean(config?.country_required);
  // "Your account is billed in US dollars." -- shown once, right after the
  // customer's country choice fixed it.
  const [justFixedUsd, setJustFixedUsd] = useState(false);
  const [savingCountry, setSavingCountry] = useState(false);
  // Never offered to a USD account; the API should not send them, and this
  // makes sure.
  const starterOffer = isUsd ? null : studioStarter ?? null;
  const intro = isUsd ? null : introOffer ?? null;
  const [states, setStates] = useState<GstState[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [name, setName] = useState(user?.full_name ?? "");
  // Bundled list until the API answers; then the API's list (every country a
  // sign-up could have chosen) with the bundled ones kept, so it never shrinks.
  const [countries, setCountries] = useState<Country[]>(COUNTRIES);
  const [countryIso, setCountryIso] = useState(countryByIso(defaultCountry)?.iso ?? INDIA.iso);
  const isIndia = countryIso === "IN";
  const [stateCode, setStateCode] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<null | { credited: number; balance: number }>(null);
  // Starter mode: the order is the Rs 99 Studio starter, not a free amount.
  const [starterMode, setStarterMode] = useState(false);
  useEffect(() => {
    if (open && starterOffer) {
      setStarterMode(true);
      setAmount(String(starterOffer.priceRupees));
    }
    if (!starterOffer) setStarterMode(false);
  }, [open, starterOffer]);

  const loadConfig = useCallback(async (): Promise<PaymentsConfig | null> => {
    const token = localStorage.getItem("cf_customer_token");
    if (!token) return null;
    try {
      const r = await fetch(`${API}/payments/config`, { headers: { Authorization: `Bearer ${token}` } });
      const c: PaymentsConfig | null = r.ok ? await r.json() : null;
      if (!c) return null;
      // The effective floor is the higher of the gateway's minimum and this
      // customer's own (a first top-up starts at the intro price). The new
      // fields win; the wallet-status prop is for an older control plane.
      const min = c.min_topup ?? c.min_topup_rupees;
      const max = c.max_topup ?? c.max_topup_rupees;
      const now = c.min_topup_now ?? c.min_topup_rupees_now ?? minTopupNow ?? 0;
      const floor = Math.max(min, now);
      const fixed = { ...c, min_topup_rupees: floor, max_topup_rupees: max };
      setConfig(fixed);
      setAmount(String(presetAmount && presetAmount >= floor && presetAmount <= max ? presetAmount : floor));
      return fixed;
    } catch {
      setConfig({ enabled: false, key_id: null, min_topup_rupees: 500, max_topup_rupees: 50000 });
      return null;
    }
  }, [minTopupNow, presetAmount]);

  useEffect(() => {
    if (!open) return;
    const token = localStorage.getItem("cf_customer_token");
    if (!token) return;

    loadConfig();

    fetchIndianGstStates(API).then(setStates);
    fetchCountries(API).then((list) => setCountries(withBundledCountries(list)));

    loadRazorpay();
  }, [open, loadConfig]);

  // The sign-up country arrives with the wallet status, possibly after the
  // dialog mounted; adopt it until the customer picks one themselves.
  const [countryTouched, setCountryTouched] = useState(false);
  useEffect(() => {
    const code = defaultCountry?.toUpperCase();
    const iso = countries.find((c) => c.iso === code)?.iso;
    if (iso && !countryTouched) setCountryIso(iso);
  }, [defaultCountry, countryTouched, countries]);

  // A USD account bills to its own (foreign) country: India is not offered,
  // and the Indian default is dropped until the customer picks.
  const countryOptions = isUsd ? countries.filter((c) => c.iso !== INDIA.iso) : countries;
  useEffect(() => {
    if (isUsd && countryIso === INDIA.iso) {
      const own = defaultCountry?.toUpperCase();
      setCountryIso(own && own !== INDIA.iso ? own : "");
    }
  }, [isUsd, countryIso, defaultCountry]);

  // Bonus tiers in the account's currency. The wallet's are used while they
  // are in the same currency; otherwise (a USD account whose wallet status
  // predates its country choice) the USD ladder from the rate card.
  const rateCard = useRateCard(open && isUsd);
  const tiersMatch = (parseCurrency(walletCurrency) ?? "INR") === currency;
  const tiers: BulkTier[] | null =
    bulkTiers && bulkTiers.length && tiersMatch
      ? bulkTiers
      : isUsd
        ? usdRates(rateCard).bulk_topup_tiers.map((t) => ({
            min: t.min,
            bonus: t.bonus,
            percent: t.percent,
            min_rupees: t.min,
            bonus_rupees: t.bonus,
          }))
        : tiersMatch ? bulkTiers ?? null : null;

  const presets = (() => {
    const floor = config?.min_topup_rupees ?? minTopupNow ?? 500;
    const max = config?.max_topup_rupees ?? 50000;
    const ladder = (isUsd ? PRESET_LADDER_USD : PRESET_LADDER).filter((p) => p > floor && p <= max);
    return [floor, ...ladder].slice(0, 4);
  })();

  // First top-up of an account with no country yet: the country (and, in
  // India, the state) is saved first, which fixes the account's currency.
  const saveCountry = useCallback(async () => {
    setError("");
    const token = localStorage.getItem("cf_customer_token");
    if (!token) return setError("Please sign in again.");
    if (!countryIso) return setError("Select your country.");
    if (countryIso === INDIA.iso && !stateCode) {
      return setError("Select your state. It decides the GST split on your invoice.");
    }
    setSavingCountry(true);
    try {
      const r = await fetch(`${API}/verification/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          country_code: countryIso,
          state_code: countryIso === INDIA.iso ? stateCode : FOREIGN_STATE_CODE,
        }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => null);
        const d = body?.detail;
        throw new Error(typeof d === "string" ? d : d?.message ?? "We could not save your country. Try again.");
      }
      const c = await loadConfig();
      if (!c) throw new Error("We could not load your billing details. Reload the page and try again.");
      if (c.country_required) throw new Error("We could not save your country. Try again.");
      if (parseCurrency(c.currency) === "USD") setJustFixedUsd(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSavingCountry(false);
    }
  }, [countryIso, stateCode, loadConfig]);

  // THE LIMIT HAS TO ARRIVE WHILE THEY TYPE, NOT AFTER THEY COMMIT.
  //
  // It was already on screen -- "Rs 500 - Rs 50,000", 12px at 40% opacity,
  // folded into a sentence about GST -- and it was still possible to enter 100,
  // press Pay and feel refused by a form that had not said anything. Text that
  // is present and unread is not a message; it is an alibi.
  const typedRupees = Number(amount);
  const amountTooLow = !starterMode && Boolean(config) && amount.trim() !== "" &&
    Number.isFinite(typedRupees) && typedRupees < (config?.min_topup_rupees ?? 500);
  const amountTooHigh = !starterMode && Boolean(config) && amount.trim() !== "" &&
    Number.isFinite(typedRupees) && typedRupees > (config?.max_topup_rupees ?? 50000);

  const pay = useCallback(async () => {
    setError("");
    const token = localStorage.getItem("cf_customer_token");
    if (!token) return setError("Please sign in again.");
    if (!config?.enabled || !config.key_id) return setError("Online recharge is not available right now.");

    if (config.country_required) return setError("Choose your country first.");

    const rupees = starterMode && starterOffer ? starterOffer.priceRupees : Number(amount);
    if (!starterMode && (!Number.isFinite(rupees) || rupees < config.min_topup_rupees || rupees > config.max_topup_rupees)) {
      return setError(
        `Enter an amount between ${formatMoney(config.min_topup_rupees, currency)} and ${formatMoney(config.max_topup_rupees, currency)}.`,
      );
    }
    if (!countryIso) return setError("Select your country.");
    if (isUsd && isIndia) return setError("Your account is billed in US dollars. Select your country outside India.");
    if (isIndia) {
      if (!stateCode) return setError("Select your state. It decides the GST split on your invoice.");
      if (!/^\d{6}$/.test(pincode.trim())) return setError("Enter your 6-digit PIN code.");
    }

    setBusy(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Could not load the payment window. Check your connection and try again.");

      const orderRes = await fetch(`${API}/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          // `amount` and `currency` from 15 Oct 2026; `amount_rupees` (the same
          // number, in the account's currency) for an older server.
          amount: rupees,
          currency,
          amount_rupees: rupees,
          ...(starterMode ? { purpose: "studio_starter" } : {}),
          billing_address: {
            name: name.trim() || undefined,
            city: city.trim() || undefined,
            // Outside India is GST state 96 (foreign country): export, no GST.
            state_code: isIndia ? stateCode : FOREIGN_STATE_CODE,
            country_code: countryIso,
            pincode: pincode.trim() || undefined,
          },
        }),
      });
      const order = await orderRes.json();
      if (orderRes.status === 409 && order?.detail?.code === "currency_mismatch") {
        throw new Error(
          "Your account's billing currency has changed since this page loaded. Reload the page and try again.",
        );
      }
      if (!orderRes.ok) {
        const d = order?.detail;
        throw new Error(
          typeof d === "string" ? d
            : d?.message ?? (Array.isArray(d) ? d[0]?.msg : null) ?? "Could not start the payment.",
        );
      }

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay!({
          key: order.key_id,
          order_id: order.order_id,
          // Minor units of the order's currency: paise or cents.
          amount: order.amount_minor ?? order.amount_paise,
          currency: order.currency ?? currency,
          name: "Coreframe Cloud",
          description: `Wallet top-up ${formatMoney(rupees, currency)}`,
          prefill: { name: name || user?.full_name || "", email: user?.email || "" },
          theme: { color: "#22d3ee" },
          // Razorpay hands us three fields; the SERVER decides whether they
          // constitute a paid order. Nothing is credited on this side.
          handler: async (resp: Record<string, string>) => {
            try {
              const vr = await fetch(`${API}/payments/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                  razorpay_order_id: resp.razorpay_order_id,
                  razorpay_payment_id: resp.razorpay_payment_id,
                  razorpay_signature: resp.razorpay_signature,
                }),
              });
              const v = await vr.json();
              if (!vr.ok) throw new Error(v?.detail ?? "We could not confirm that payment.");
              // Since the money guard (15 Oct 2026) the server credits only a
              // payment whose currency and amount it has confirmed with
              // Razorpay. "pending" (not confirmed yet; the webhook credits it)
              // and "held_for_review" come back 200 with a message to show.
              if (v?.status && v.status !== "success") {
                throw new Error(v?.message ?? "Payment received; your wallet updates within a few minutes.");
              }
              // Server-confirmed payment, so this is a real purchase. Value is
              // what the customer paid (GST included), not the net credit; the
              // payment id deduplicates across GA4, Google Ads and Meta.
              trackConversion("purchase", {
                value: rupees,
                currency: order.currency ?? currency,
                transaction_id: resp.razorpay_payment_id,
                location: "wallet_topup",
              });
              if (isFirstTopup) {
                trackConversion("first_topup", {
                  value: rupees,
                  currency: order.currency ?? currency,
                  transaction_id: resp.razorpay_payment_id,
                  location: "wallet_topup",
                });
              }
              setDone({
                credited: v.net_wallet_credit_rupees ?? rupees,
                balance: v.wallet_balance_rupees ?? 0,
              });
              onCredited(v.wallet_balance_rupees ?? 0);
              resolve();
            } catch (e) {
              // The money may well have left their account — the webhook
              // credits it independently, so say that rather than implying
              // the payment failed.
              reject(e instanceof Error ? e : new Error("Verification failed."));
            }
          },
          modal: { ondismiss: () => reject(new Error("__dismissed__")) },
        });
        rzp.open();
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      if (msg === "__dismissed__") {
        setError("");
      } else if (msg.includes("confirm that payment")) {
        setError(
          "Your payment went through, but we couldn't confirm it here. It'll be credited automatically within a few minutes. Refresh this page, and contact us if it hasn't appeared.",
        );
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }, [amount, city, config, countryIso, currency, isFirstTopup, isIndia, isUsd, name, onCredited, pincode, stateCode, user, starterMode, starterOffer]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto overscroll-contain bg-ink/30 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Add funds"
    >
      <div
        className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto cf-glass p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center">
            <p className="cf-eyebrow">Paid</p>
            <p className="mt-2 font-display text-lg font-semibold text-ink">Wallet topped up.</p>
            <p className="mt-2 font-display text-3xl font-bold tabular-nums text-blue">
              {money(done.credited)}
            </p>
            <p className="mt-2 text-[15px] leading-6 text-ink-2">
              New balance {money(done.balance)}. Your invoice is in Payments below.
            </p>

            <button onClick={onClose} className="cf-btn-primary mt-6 w-full">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <h2 className="cf-section-title">Add funds.</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="-mr-2 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center text-ink-3 transition hover:text-ink"
              >
                ✕
              </button>
            </div>

            {config && !config.enabled ? (
              <div className="cf-glass-inset mt-4 border-l-2! border-l-blue! px-4 py-3">
                <p className="mb-2 font-mono text-[11.5px] leading-none font-medium tracking-[0.2em] uppercase text-ink-2">Action needed</p>
                <p className="text-sm leading-6 text-ink">
                  Online recharge is off right now.
                </p>
                <p className="mt-1 text-sm leading-6 text-ink-2">
                  Email{" "}
                  <a className="break-all text-blue underline" href="mailto:support@coreframecloud.com">
                    support@coreframecloud.com
                  </a>{" "}
                  and we will credit your wallet within one business day.
                </p>
              </div>
            ) : countryRequired ? (
              // No billing country on the account yet. It is chosen once, here,
              // before the first top-up, and it fixes the account's currency:
              // India is billed in rupees with GST, anywhere else in US dollars.
              <>
                <p className="mt-4 text-[15px] leading-6 text-ink-2">
                  First, where are you billed? This sets your account&apos;s currency for good: Indian rupees (GST
                  included) for India, US dollars (no GST) for every other country.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-3">
                  <div>
                    <label className="block cf-eyebrow">
                      Country <span className="text-blue">(required)</span>
                    </label>
                    <select
                      value={countryIso}
                      onChange={(e) => { setCountryIso(e.target.value); setCountryTouched(true); setError(""); }}
                      className="mt-1.5 h-11 w-full cursor-pointer rounded-cf border border-rule bg-paper px-3 text-base text-ink outline-none focus:border-blue md:h-10 md:text-sm"
                    >
                      {countryIso === "" && (
                        <option value="" className="bg-paper text-ink">
                          Select your country
                        </option>
                      )}
                      {countries.map((c) => (
                        <option key={c.iso} value={c.iso} className="bg-paper text-ink">
                          {c.country}
                        </option>
                      ))}
                    </select>
                  </div>
                  {isIndia && (
                    <div>
                      <label className="block cf-eyebrow">
                        State <span className="text-blue">(required)</span>
                      </label>
                      <select
                        value={stateCode}
                        onChange={(e) => { setStateCode(e.target.value); setError(""); }}
                        className="mt-1.5 h-11 w-full cursor-pointer rounded-cf border border-rule bg-paper px-3 text-base text-ink outline-none focus:border-blue md:h-10 md:text-sm"
                      >
                        <option value="" className="bg-paper text-ink">
                          Select your state
                        </option>
                        {states.map((s) => (
                          <option key={s.code} value={s.code} className="bg-paper text-ink">
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                {error && (
                  <p className="mt-4 rounded-cf border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm leading-6 break-words text-destructive">
                    {error}
                  </p>
                )}
                <button
                  onClick={saveCountry}
                  disabled={savingCountry || !countryIso || (isIndia && !stateCode)}
                  className="cf-btn-primary mt-5 w-full disabled:opacity-50"
                >
                  {savingCountry ? "Saving…" : "Continue"}
                </button>
              </>
            ) : (
              <>
                {justFixedUsd && (
                  <p className="mt-4 rounded-cf border border-blue/30 bg-blue-soft px-4 py-3 text-sm leading-6 text-ink">
                    Your account is billed in US dollars.
                  </p>
                )}
                {starterOffer && (
                  <div className={`mt-5 rounded-cf border px-4 py-3 ${starterMode ? "border-blue bg-blue-soft" : "border-rule bg-paper-2"}`}>
                    <p className="text-sm font-semibold text-ink">
                      Start with ₹{starterOffer.priceRupees.toLocaleString("en-IN")} — get ₹
                      {starterOffer.totalRupees.toLocaleString("en-IN")} of Studio renders (once per account)
                    </p>
                    <p className="mt-1 text-xs leading-5 text-ink-2">
                      For Studio only: downloads, edits and ray-traced renders. ₹
                      {(starterOffer.totalRupees - starterOffer.priceRupees).toLocaleString("en-IN")} of it is a
                      bonus that lasts 30 days.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setStarterMode(!starterMode);
                        setAmount(starterMode ? "" : String(starterOffer.priceRupees));
                      }}
                      className="mt-2 text-xs font-semibold text-blue underline"
                    >
                      {starterMode ? "Top up a different amount instead" : `Choose the ₹${starterOffer.priceRupees} starter`}
                    </button>
                  </div>
                )}
                {!starterMode && (<>
                <div className="mt-5 flex flex-wrap gap-2">
                  {presets.map((p) => {
                    const isIntro = intro && p === intro.priceRupees;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAmount(String(p))}
                        className={`inline-flex min-h-11 flex-col items-center justify-center rounded-cf border px-4 py-1 text-sm font-semibold tabular-nums transition ${
                          amount === String(p)
                            ? "border-blue bg-blue-soft text-blue"
                            : "border-rule bg-paper-2 text-ink-2 hover:text-ink"
                        }`}
                      >
                        {money(p)}
                        {isIntro && (
                          <span className="text-[11px] font-medium leading-4 text-blue">
                            Intro: {hoursLabel(intro.hours)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {tiers && tiers.length > 0 && (
                  <p className="mt-2 text-xs leading-5 text-ink-2">
                    {tiers
                      .map((t, i) => {
                        // Whole rupees as before; cents kept for dollars ($2.50).
                        const bonus = money(isUsd ? tierBonus(t) : Math.round(tierBonus(t)));
                        return i === 0
                          ? `Top up ${money(tierMin(t))}, get ${bonus} extra`
                          : `${money(tierMin(t))}, get ${bonus} extra`;
                      })
                      .join(" · ")}
                    {" "}({tiers.map((t) => `${t.percent}%`).join(" / ")}), usable on GPU time, CFD{isUsd ? "" : " and Studio"}
                    {intro ? ", from your second top-up — the first earns the intro offer" : ""}.
                    {!intro && bulkBonusFor(typedRupeesForBonus(amount), tiers) > 0 && (
                      <span className="font-semibold text-blue">
                        {" "}This top-up adds {money(bulkBonusFor(typedRupeesForBonus(amount), tiers))} extra.
                      </span>
                    )}
                  </p>
                )}
                {intro && (
                  <p className="mt-2 text-xs leading-5 text-ink-2">
                    Intro offer: your first top-up of ₹{intro.priceRupees.toLocaleString("en-IN")} buys{" "}
                    {hoursLabel(intro.hours)}
                    {intro.gpuName ? ` of ${intro.gpuName}` : ""}
                    {intro.validityDays ? `, to use within ${intro.validityDays} days` : ""}.
                  </p>
                )}

                </>)}
                {!starterMode && (<>
                <label className="mt-4 block cf-eyebrow">
                  Amount ({isUsd ? "$" : "₹"})
                </label>
                <input
                  type="number"
                  inputMode={isUsd ? "decimal" : "numeric"}
                  step={isUsd ? "0.01" : undefined}
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(""); }}
                  min={config?.min_topup_rupees ?? 500}
                  max={config?.max_topup_rupees ?? 50000}
                  className="mt-1.5 h-12 w-full rounded-cf border border-rule bg-paper px-4 text-base tabular-nums text-ink outline-none focus:border-blue md:h-11 md:text-sm"
                />
                {config && (amountTooLow || amountTooHigh) ? (
                  <div className="cf-glass-inset mt-2 border-l-2! border-l-blue! px-3 py-2.5">
                    <p className="mb-1.5 font-mono text-[11.5px] leading-none font-medium tracking-[0.2em] uppercase text-ink-2">Change the amount</p>
                    <p className="text-xs leading-5 text-ink">
                      {amountTooLow
                        ? `The smallest top-up is ${money(config.min_topup_rupees)}.`
                        : `The largest top-up is ${money(config.max_topup_rupees)}.`}
                    </p>
                  </div>
                ) : config ? (
                  <p className="mt-1.5 text-xs leading-5 text-ink-2">
                    Minimum {money(config.min_topup_rupees)}, maximum {money(config.max_topup_rupees)}.{" "}
                    {isUsd
                      ? "No GST (export of services). An invoice in US dollars is issued automatically."
                      : isIndia ? "GST included; a tax invoice is issued automatically." : "An invoice is issued automatically."}
                  </p>
                ) : null}
                </>)}

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block cf-eyebrow">
                      Name on the invoice
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-cf border border-rule bg-paper px-3 text-base text-ink outline-none focus:border-blue md:h-10 md:text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block cf-eyebrow">
                      Country <span className="text-blue">(required)</span>
                    </label>
                    <select
                      value={countryIso}
                      onChange={(e) => { setCountryIso(e.target.value); setCountryTouched(true); setError(""); }}
                      className="mt-1.5 h-11 w-full cursor-pointer rounded-cf border border-rule bg-paper px-3 text-base text-ink outline-none focus:border-blue md:h-10 md:text-sm"
                    >
                      {countryIso === "" && (
                        <option value="" className="bg-paper text-ink">
                          Select your country
                        </option>
                      )}
                      {countryOptions.map((c) => (
                        <option key={c.iso} value={c.iso} className="bg-paper text-ink">
                          {c.country}
                        </option>
                      ))}
                    </select>
                  </div>
                  {isIndia && (
                  <div className="sm:col-span-2">
                    <label className="block cf-eyebrow">
                      State <span className="text-blue">(required)</span>
                    </label>
                    <select
                      value={stateCode}
                      onChange={(e) => { setStateCode(e.target.value); setError(""); }}
                      className="mt-1.5 h-11 w-full cursor-pointer rounded-cf border border-rule bg-paper px-3 text-base text-ink outline-none focus:border-blue md:h-10 md:text-sm"
                    >
                      {/* Options carry their own colours: Chrome paints the
                          native dropdown itself, so each option states the
                          page's own paper and ink rather than inheriting. */}
                      <option value="" className="bg-paper text-ink">
                        Select your state
                      </option>
                      {states.map((s) => (
                        <option key={s.code} value={s.code} className="bg-paper text-ink">
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1.5 text-xs leading-5 text-ink-2">
                      Your state decides the GST split on the invoice, so it cannot be guessed.
                    </p>
                  </div>
                  )}
                  <div>
                    <label className="block cf-eyebrow">
                      City
                    </label>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-cf border border-rule bg-paper px-3 text-base text-ink outline-none focus:border-blue md:h-10 md:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block cf-eyebrow">
                      {isIndia ? (
                        <>PIN code <span className="text-blue">(required)</span></>
                      ) : (
                        "Postal code"
                      )}
                    </label>
                    <input
                      value={pincode}
                      onChange={(e) => { setPincode(e.target.value); setError(""); }}
                      inputMode={isIndia ? "numeric" : "text"}
                      maxLength={isIndia ? 6 : 12}
                      className="mt-1.5 h-11 w-full rounded-cf border border-rule bg-paper px-3 text-base tabular-nums text-ink outline-none focus:border-blue md:h-10 md:text-sm"
                    />
                  </div>
                </div>

                {error && (
                  <p className="mt-4 rounded-cf border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm leading-6 break-words text-destructive">
                    {error}
                  </p>
                )}

                <button
                  onClick={pay}
                  disabled={busy || !config || amountTooLow || amountTooHigh}
                  className="cf-btn-primary mt-5 w-full tabular-nums disabled:opacity-50"
                >
                  {busy ? "Opening payment…" : `Pay ${money(Number(amount || 0) || 0)}`}
                </button>
                <p className="mt-3 text-center text-xs leading-5 text-ink-2">
                  {/* Owner decision 10 Oct 2026: a customer billed outside India
                      is an export of services under LUT — zero-rated, no GST —
                      for the same rupee amount. */}
                  {isUsd
                    ? "International cards accepted. No GST (export of services). An invoice in US dollars is issued automatically."
                    : isIndia
                    ? "International cards accepted. Prices include 18% GST."
                    : "International cards accepted. International customers: no GST (export of services)."}
                  <br />
                  Payments are processed by Razorpay. We never see your card details.
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
