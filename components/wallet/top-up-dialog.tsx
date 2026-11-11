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
 * invoice taxed wrongly can only be corrected by credit note. The PIN code is
 * optional (owner, 16 Oct 2026): it decides no tax, the API has always taken
 * it as optional, and the invoice omits it cleanly; if one is typed it must be
 * six digits. The list is
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
 * Indian states are offered; the Studio starter is $3 -> $9; the intro offer is the dollar
 * one, $20 = 8 hours, owner 18 Oct 2026, only while the API publishes it and
 * reports this account can still claim it). An account
 * with no country yet (`country_required`) chooses it FIRST, which fixes the
 * currency for good (POST /verification/location). The order carries `amount`
 * and `currency`; the server refuses a mismatch with 409 currency_mismatch.
 * Every legacy `*_rupees` field is in the account's currency.
 */

import { apiFetch, sessionMarker } from "@/lib/session";
import { useCallback, useEffect, useState } from "react";
import { trackConversion } from "@/lib/analytics";
import { flush as flushWebEvents, track as trackWebEvent } from "@/lib/web-events";
import { hoursLabel, type IntroOffer } from "@/lib/rate-card";
import { useRateCard } from "@/lib/use-rate-card";
import { formatMoney, parseCurrency, usdRates, type Currency } from "@/lib/money";
import {
  COUNTRIES,
  FOREIGN_STATE_CODE,
  INDIA,
  countryByIso,
  fetchCountries,
  fetchIpCountry,
  ipMismatchMessage,
  withBundledCountries,
  type Country,
  fetchIndianGstStates,
  type GstState,
} from "@/lib/validation";
import { API_BASE } from "@/lib/api-base";
import {
  bonusMoney,
  bulkBonusFor,
  tierMin,
  type BulkTier,
} from "@/components/wallet/bonus-ladder";

export { bulkBonusFor, type BulkTier };

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
  /** The bonus ladder in the account's currency, straight from the server
   *  (topup_bonus.public_tiers); empty when the bonus is switched off. */
  bulk_topup_tiers?: BulkTier[] | null;
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
// Four amount cards plus "Other" (owner, 5 Nov 2026: one row of cards, the
// bonus on the cards, no separate tiles), so the row fits one line.
const MAX_PRESETS = 4;

/** The amount cards: the customer's floor, every bonus tier in range (so each
 *  tier is one tap away and carries its "+₹500"), then the usual ladder until
 *  there are four. */
function presetAmounts(floor: number, max: number, ladder: number[], tierMins: number[]): number[] {
  const inRange = (p: number) => p > floor && p <= max;
  const out = new Set<number>([floor, ...tierMins.filter(inRange)]);
  for (const p of ladder.filter(inRange)) {
    if (out.size >= MAX_PRESETS) break;
    out.add(p);
  }
  return [...out].sort((a, b) => a - b).slice(0, MAX_PRESETS);
}

export default function TopUpDialog({
  open,
  onClose,
  onCredited,
  onPending,
  user,
  minTopupNow,
  introOffer,
  presetAmount,
  defaultCountry,
  isFirstTopup,
  bulkTiers,
  walletCurrency,
  studioStarter,
  forGpu,
}: {
  open: boolean;
  onClose: () => void;
  onCredited: (newBalanceRupees: number) => void;
  /** The payment went through but the server has not credited it yet
   *  ("pending" / "held_for_review"; the webhook settles it). The page uses
   *  this to re-read the wallet a few times instead of waiting for a reload. */
  onPending?: () => void;
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
  /** The card chosen before sign-up (lib/gpu-start.ts, 10 Nov 2026): named
   *  here, and "Download Connect" for it once paid. */
  forGpu?: { name: string; href: string } | null;
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
  // India chosen (which fixes rupees for good) from a connection Cloudflare
  // places elsewhere: ask once, "Are you in India?" (owner, 16 Oct 2026).
  // Never a block; the API alerts the owner either way.
  const [ipCountry, setIpCountry] = useState<string | null>(null);
  const [askIndia, setAskIndia] = useState(false);
  useEffect(() => {
    if (open && countryRequired) fetchIpCountry(API).then(setIpCountry);
  }, [open, countryRequired]);
  // The Studio starter in the account's own currency (owner, 18 Oct 2026:
  // dollar accounts get $3 -> $9 too). The wallet status prices it in the
  // wallet's currency, so it is shown only while that matches the account's;
  // a rupee starter never reaches a dollar account, or back. The intro offer
  // follows the same rule.
  const starterOffer =
    studioStarter && (parseCurrency(walletCurrency) ?? "INR") === currency ? studioStarter : null;
  const intro = introOffer && introOffer.currency === currency ? introOffer : null;
  const [states, setStates] = useState<GstState[]>([]);
  const [amount, setAmount] = useState<string>("");
  // Funnel: the dialog opened (the step after mobile verification).
  useEffect(() => {
    if (open) trackWebEvent("topup_dialog_open", { first: Boolean(isFirstTopup), currency: walletCurrency ?? undefined });
  }, [open, isFirstTopup, walletCurrency]);
  const pickAmount = (v: number | string, preset: boolean) => {
    setAmount(String(v));
    setError("");
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) trackWebEvent("topup_amount_selected", { amount: n, currency: walletCurrency ?? undefined, preset });
  };
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
    const token = sessionMarker();
    if (!token) return null;
    try {
      const r = await apiFetch(`${API}/payments/config`);
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
    const token = sessionMarker();
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
    config?.bulk_topup_tiers
      ? config.bulk_topup_tiers
      : bulkTiers && bulkTiers.length && tiersMatch
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

  const presets = presetAmounts(
    config?.min_topup_rupees ?? minTopupNow ?? 500,
    config?.max_topup_rupees ?? 50000,
    isUsd ? PRESET_LADDER_USD : PRESET_LADDER,
    (tiers ?? []).map(tierMin),
  );

  // First top-up of an account with no country yet: the country (and, in
  // India, the state) is saved first, which fixes the account's currency.
  const saveCountry = useCallback(async (confirmedIndia = false) => {
    setError("");
    const token = sessionMarker();
    if (!token) return setError("Please sign in again.");
    if (!countryIso) return setError("Select your country.");
    if (countryIso === INDIA.iso && !stateCode) {
      return setError("Select your state. It decides the GST split on your invoice.");
    }
    if (countryIso === INDIA.iso && ipCountry && ipCountry !== INDIA.iso && !confirmedIndia) {
      return setAskIndia(true);
    }
    setAskIndia(false);
    setSavingCountry(true);
    try {
      const r = await apiFetch(`${API}/verification/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
  }, [countryIso, stateCode, loadConfig, ipCountry]);

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
    const token = sessionMarker();
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
      // Optional (owner, 16 Oct 2026): checked only when one is typed.
      if (pincode.trim() && !/^\d{6}$/.test(pincode.trim())) {
        return setError("A PIN code has 6 digits. Correct it, or leave it empty.");
      }
    }

    setBusy(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Could not load the payment window. Check your connection and try again.");

      const orderRes = await apiFetch(`${API}/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      // Funnel: the checkout is about to open (the API writes the same step
      // when the order is created; a visitor counts once). Flushed now: the
      // Razorpay window takes the page's attention.
      trackWebEvent("topup_amount_selected", { amount: rupees, currency, preset: presets.includes(rupees) });
      trackWebEvent("payment_started", { provider: "razorpay", amount: rupees, currency, first: Boolean(isFirstTopup) });
      flushWebEvents();
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
          // UPI FIRST FOR RUPEE PAYMENTS (funnel audit, 22 Oct 2026). Of the
          // last four Indian first top-ups that reached this window, two were
          // closed unpaid; the two that paid, paid by UPI. Razorpay's checkout
          // otherwise opens on whatever method it last saw, so a phone shows
          // cards first. The block pins UPI to the top and leaves every other
          // method below it (show_default_blocks). Dollar orders are card-only
          // and get Razorpay's default layout.
          ...(isUsd
            ? {}
            : {
                config: {
                  display: {
                    blocks: {
                      upi: { name: "Pay by UPI", instruments: [{ method: "upi" }] },
                    },
                    sequence: ["block.upi"],
                    preferences: { show_default_blocks: true },
                  },
                },
              }),
          // Razorpay hands us three fields; the SERVER decides whether they
          // constitute a paid order. Nothing is credited on this side.
          handler: async (resp: Record<string, string>) => {
            try {
              const vr = await apiFetch(`${API}/payments/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
                trackWebEvent("payment_result", { result: String(v.status), amount: rupees, currency });
                onPending?.();
                throw new Error(v?.message ?? "Payment received; your wallet updates within a few minutes.");
              }
              trackWebEvent("payment_result", { result: "paid", amount: rupees, currency });
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
          modal: {
            ondismiss: () => {
              // Closed without paying: the leak the funnel audit found (6 of
              // 13 orders in 30 days). Flushed: the dialog may be closed next.
              trackWebEvent("payment_result", { result: "closed", amount: rupees, currency });
              flushWebEvents();
              reject(new Error("__dismissed__"));
            },
          },
        });
        rzp.open();
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      if (msg === "__dismissed__") {
        setError("");
      } else if (msg.includes("confirm that payment")) {
        trackWebEvent("payment_result", { result: "unconfirmed", amount: rupees, currency });
        onPending?.();
        setError(
          "Your payment went through, but we couldn't confirm it here. It'll be credited automatically within a few minutes. Refresh this page, and contact us if it hasn't appeared.",
        );
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }, [amount, city, config, countryIso, currency, isFirstTopup, isIndia, isUsd, name, onCredited, onPending, pincode, presets, stateCode, user, starterMode, starterOffer]);

  // "Other": a free amount typed in place of a card. The limits show while the
  // field has focus, and an out-of-range amount says so in the same slot.
  const [otherMode, setOtherMode] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);
  const isOther = !starterMode && (otherMode || (amount !== "" && !presets.includes(Number(amount))));
  // Country search: a text field over the country list. While typing, the
  // typed text shows; an exact name selects that country; leaving the field
  // puts back the selected country's name.
  const [countryText, setCountryText] = useState<string | null>(null);

  if (!open) return null;

  const fieldCls =
    "h-11 w-full rounded-cf border border-rule bg-paper px-3 text-base text-ink outline-none transition-colors focus:border-blue md:text-sm";
  const labelCls = "block text-sm leading-5 font-medium text-ink";
  const helperCls = "mt-1 text-[13px] leading-5 text-ink-2";

  const countryField = (options: Country[]) => (
    <div className="min-w-0">
      <label htmlFor="cf-topup-country" className={labelCls}>Country</label>
      <input
        id="cf-topup-country"
        list="cf-topup-countries"
        autoComplete="country-name"
        placeholder="Search your country"
        value={countryText ?? options.find((c) => c.iso === countryIso)?.country ?? ""}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          const v = e.target.value;
          setCountryText(v);
          const hit = options.find((c) => c.country.toLowerCase() === v.trim().toLowerCase());
          if (hit) {
            setCountryIso(hit.iso);
            setCountryTouched(true);
            setError("");
          }
        }}
        onBlur={() => setCountryText(null)}
        className={`mt-2 ${fieldCls}`}
      />
      <datalist id="cf-topup-countries">
        {options.map((c) => (
          <option key={c.iso} value={c.country} />
        ))}
      </datalist>
    </div>
  );

  const stateField = (
    <div className="min-w-0">
      <label htmlFor="cf-topup-state" className={labelCls}>State</label>
      <select
        id="cf-topup-state"
        value={stateCode}
        onChange={(e) => { setStateCode(e.target.value); setError(""); }}
        className={`mt-2 cursor-pointer ${fieldCls}`}
      >
        {/* Options carry their own colours: Chrome paints the native
            dropdown itself, so each option states the page's paper and ink. */}
        <option value="" className="bg-paper text-ink">Select</option>
        {states.map((s) => (
          <option key={s.code} value={s.code} className="bg-paper text-ink">
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );

  const errorLine = error ? (
    <p role="alert" className="mt-6 text-sm leading-5 break-words text-destructive">
      {error}
    </p>
  ) : null;

  // What each card adds. On a first top-up the intro offer takes the place of
  // the bulk bonus at every amount (they never stack; topup_bonus on the API):
  // the intro card shows its hours, the others the intro's GPU credit.
  const sortedTiers = [...(tiers ?? [])].sort((a, b) => tierMin(a) - tierMin(b));
  const bestTierMin = sortedTiers.length ? tierMin(sortedTiers[sortedTiers.length - 1]) : null;
  const introLabel = intro ? `${hoursLabel(intro.hours, true).replace(" hrs", " h").replace(" hr", " h")}${intro.gpuName ? ` ${intro.gpuName}` : ""}` : "";
  const cardNote = (p: number): string => {
    if (intro) {
      if (p === intro.price) return introLabel;
      return p > intro.price && intro.bonus ? `+${bonusMoney(intro.bonus, currency)} GPU` : "";
    }
    const b = bulkBonusFor(p, tiers);
    return b > 0 ? `+${bonusMoney(b, currency)}` : "";
  };

  // The live summary under the cards: what you pay, what the wallet gets.
  const paying = Number(amount);
  const payingOk = Number.isFinite(paying) && paying > 0 && !amountTooLow && !amountTooHigh;
  let summary: React.ReactNode = null;
  if (payingOk) {
    if (intro && paying === intro.price) {
      summary = (
        <>
          You pay <b className="font-semibold text-ink">{money(paying)}</b> · {hoursLabel(intro.hours)}
          {intro.gpuName ? ` of ${intro.gpuName}` : ""}
          {intro.validityDays ? `, use within ${intro.validityDays} days` : ""}
          {forGpu && intro.gpuName && !intro.gpuName.includes(forGpu.name) && !forGpu.name.includes(intro.gpuName)
            ? `. The same credit works on your ${forGpu.name}, at its own hourly rate.`
            : ""}
        </>
      );
    } else if (intro && paying > intro.price && intro.bonus) {
      summary = (
        <>
          You pay <b className="font-semibold text-ink">{money(paying)}</b> · wallet gets{" "}
          <b className="font-semibold text-ink">{money(paying + intro.bonus)}</b> (incl. {bonusMoney(intro.bonus, currency)} GPU credit
          {intro.validityDays ? `, ${intro.validityDays} days` : ""})
        </>
      );
    } else {
      const b = intro ? 0 : bulkBonusFor(paying, tiers);
      summary = (
        <>
          You pay <b className="font-semibold text-ink">{money(paying)}</b> · wallet gets{" "}
          <b className="font-semibold text-ink">{bonusMoney(paying + b, currency)}</b>
        </>
      );
    }
  }

  const trustLine = isUsd
    ? "Secure payment by Razorpay · international cards · no GST (export of services)"
    : isIndia
      ? "Secure payment by Razorpay · UPI, cards, netbanking · GST included"
      : // Owner decision 16 Oct 2026: on a rupee account, a billing country
        // outside India is an export (no GST) only when the card was issued
        // outside India; otherwise GST is included in the same rupee amount.
        "Secure payment by Razorpay · GST included unless your card was issued outside India";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-stretch justify-center overflow-y-auto overscroll-contain bg-ink/30 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cf-topup-title"
    >
      <div
        className="cf-glass min-h-dvh w-full overflow-y-auto p-5 max-sm:rounded-none max-sm:border-0 max-sm:bg-paper max-sm:shadow-none sm:min-h-0 sm:max-h-[calc(100dvh-2rem)] sm:max-w-xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center">
            <p id="cf-topup-title" className="text-sm leading-5 font-medium text-ink-2">Paid</p>
            <p className="mt-2 font-heading text-[26px] leading-8 font-medium text-ink">Wallet topped up</p>
            <p className="mt-2 font-display text-3xl font-bold tabular-nums text-blue">
              {money(done.credited)}
            </p>
            <p className="mt-2 text-[15px] leading-6 text-ink-2">
              New balance {money(done.balance)}. Your invoice is in Activity below.
            </p>

            {forGpu ? (
              <a href={forGpu.href} className="cf-btn-primary mt-6 w-full">
                Download Connect for your {forGpu.name}
              </a>
            ) : (
            <button onClick={onClose} className="cf-btn-primary mt-6 w-full">
              Done
            </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 id="cf-topup-title" className="font-heading text-[26px] leading-8 font-medium tracking-[-0.01em] text-ink">
                Add funds
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="-mr-3 inline-flex h-11 w-11 shrink-0 items-center justify-center text-ink-3 transition hover:text-ink"
              >
                ✕
              </button>
            </div>
            {forGpu ? (
              <p className="mt-1 text-[14px] leading-5 text-ink-2">
                For your {forGpu.name} workstation. You pay first, then download Connect and start it.
              </p>
            ) : null}

            {config && !config.enabled ? (
              <div className="mt-6 rounded-cf border border-rule px-4 py-3">
                <p className="text-sm leading-6 text-ink">Online recharge is off right now.</p>
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
                <p className="mt-2 text-sm leading-6 text-ink-2">
                  Where are you billed? This sets your currency for good: rupees in India, US dollars elsewhere.
                </p>
                <div className={`mt-6 grid grid-cols-1 gap-5 ${isIndia ? "sm:grid-cols-2 sm:gap-x-3" : ""}`}>
                  {countryField(countries)}
                  {isIndia && stateField}
                </div>
                {isIndia && <p className={helperCls}>For the GST invoice</p>}
                {errorLine}
                {askIndia && ipCountry ? (
                  <div className="mt-6 rounded-cf border border-rule px-4 py-3">
                    <p className="text-sm leading-6 text-ink">{ipMismatchMessage(ipCountry)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => saveCountry(true)}
                        disabled={savingCountry}
                        className="cf-btn-primary disabled:opacity-50"
                      >
                        {savingCountry ? "Saving…" : "Yes, I'm in India"}
                      </button>
                      <button
                        onClick={() => { setAskIndia(false); setCountryIso(""); setCountryTouched(true); }}
                        className="min-h-11 px-3 text-[13px] text-ink-2 hover:text-ink"
                      >
                        No, change my country
                      </button>
                    </div>
                  </div>
                ) : (
                <button
                  onClick={() => saveCountry()}
                  disabled={savingCountry || !countryIso || (isIndia && !stateCode)}
                  className="cf-btn-primary mt-6 w-full disabled:opacity-50"
                >
                  {savingCountry ? "Saving…" : "Continue"}
                </button>
                )}
              </>
            ) : (
              <>
                {justFixedUsd && (
                  <p className="mt-2 text-sm leading-6 text-ink-2">Your account is billed in US dollars.</p>
                )}

                {/* 1. Amount */}
                {starterOffer && (
                  <div className={`mt-6 rounded-cf border px-4 py-3 ${starterMode ? "border-blue bg-blue-soft" : "border-rule"}`}>
                    <p className="text-sm leading-5 font-semibold text-ink">
                      {money(starterOffer.priceRupees)} gets {money(starterOffer.totalRupees)} of Studio renders
                    </p>
                    <p className="mt-1 text-[13px] leading-5 text-ink-2">
                      Once per account. Studio only; {money(starterOffer.totalRupees - starterOffer.priceRupees)} of it
                      lasts 30 days.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setStarterMode(!starterMode);
                        setAmount(starterMode ? "" : String(starterOffer.priceRupees));
                      }}
                      className="mt-2 min-h-11 text-[13px] font-semibold text-blue underline underline-offset-2"
                    >
                      {starterMode ? "Top up a different amount" : `Choose the ${money(starterOffer.priceRupees)} starter`}
                    </button>
                  </div>
                )}

                {!starterMode && (
                  <fieldset className="mt-6 min-w-0">
                    <legend className={labelCls}>Amount</legend>
                    <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {presets.map((p) => {
                        const selected = !isOther && amount === String(p);
                        const note = cardNote(p);
                        // The view's one yellow: the intro card on a first
                        // top-up, otherwise the best-value tier's bonus.
                        const yellow = intro ? p === intro.price : p === bestTierMin;
                        return (
                          <button
                            key={p}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => { setOtherMode(false); pickAmount(p, true); }}
                            className={`flex min-h-16 min-w-0 flex-col items-center justify-center rounded-cf border px-1 py-2 tabular-nums transition-colors ${
                              selected ? "border-blue bg-blue-soft" : "border-rule bg-paper hover:border-blue/60"
                            }`}
                          >
                            <span className={`text-base leading-6 font-semibold ${selected ? "text-blue-ink" : "text-ink"}`}>
                              {money(p)}
                            </span>
                            <span
                              className={`mt-0.5 text-[13px] leading-5 whitespace-nowrap ${
                                yellow && note ? "rounded-[4px] bg-hl px-1 font-semibold text-hl-ink" : "text-ink-2"
                              }`}
                            >
                              {note || " "}
                            </span>
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        aria-pressed={isOther}
                        onClick={() => { setOtherMode(true); setError(""); }}
                        className={`flex min-h-16 min-w-0 flex-col items-center justify-center rounded-cf border px-1 py-2 transition-colors ${
                          presets.length % 3 === 2 ? "col-span-1" : presets.length % 3 === 1 ? "col-span-2 sm:col-span-1" : ""
                        } ${isOther ? "border-blue bg-blue-soft" : "border-rule bg-paper hover:border-blue/60"}`}
                      >
                        <span className={`text-base leading-6 font-semibold ${isOther ? "text-blue-ink" : "text-ink"}`}>Other</span>
                        <span className="mt-0.5 text-[13px] leading-5 text-ink-2">Any amount</span>
                      </button>
                    </div>

                    {isOther && (
                      <div className="mt-2">
                        <label htmlFor="cf-topup-amount" className="sr-only">
                          Amount in {isUsd ? "US dollars" : "rupees"}
                        </label>
                        <div className="relative">
                          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-base text-ink-2 md:text-sm">
                            {isUsd ? "$" : "₹"}
                          </span>
                          <input
                            id="cf-topup-amount"
                            type="number"
                            autoFocus={otherMode}
                            inputMode={isUsd ? "decimal" : "numeric"}
                            step={isUsd ? "0.01" : undefined}
                            value={amount}
                            onChange={(e) => { setAmount(e.target.value); setError(""); }}
                            onFocus={() => setAmountFocused(true)}
                            onBlur={() => setAmountFocused(false)}
                            min={config?.min_topup_rupees ?? 500}
                            max={config?.max_topup_rupees ?? 50000}
                            aria-invalid={amountTooLow || amountTooHigh}
                            className={`${(amountTooLow || amountTooHigh ? fieldCls.replace("border-rule", "border-destructive").replace("focus:border-blue", "focus:border-destructive") : fieldCls)} pl-7 tabular-nums`}
                          />
                        </div>
                        {config && (amountTooLow || amountTooHigh) ? (
                          <p className="mt-1 text-[13px] leading-5 text-destructive">
                            {amountTooLow
                              ? `The smallest top-up is ${money(config.min_topup_rupees)}.`
                              : `The largest top-up is ${money(config.max_topup_rupees)}.`}
                          </p>
                        ) : config && amountFocused ? (
                          <p className={helperCls}>
                            {money(config.min_topup_rupees)} to {money(config.max_topup_rupees)}
                          </p>
                        ) : null}
                      </div>
                    )}

                    <p className={`text-sm leading-5 text-ink-2 tabular-nums ${summary ? "mt-3" : ""}`} aria-live="polite">
                      {summary}
                    </p>
                  </fieldset>
                )}

                {/* 2. Billing: country (and state in India) for the invoice. */}
                <div className={`mt-6 grid grid-cols-1 gap-5 ${isIndia ? "sm:grid-cols-[3fr_2fr] sm:gap-x-3" : ""}`}>
                  {countryField(countryOptions)}
                  {isIndia && stateField}
                </div>
                <p className={helperCls}>{isIndia ? "For the GST invoice" : "For your invoice"}</p>

                {/* Funnel review, 3 Nov 2026: only country and (in India) state
                    are needed for the invoice's tax, so the rest is optional
                    and folded away. */}
                <details className="group mt-5">
                  <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 text-sm leading-5 font-medium text-blue-ink">
                    <span aria-hidden="true" className="inline-block transition-transform group-open:rotate-90">›</span>
                    Add company details <span className="font-normal text-ink-2">(optional)</span>
                  </summary>
                  <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-[2fr_1.4fr_1fr]">
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="cf-topup-name" className={labelCls}>Company or name</label>
                      <input
                        id="cf-topup-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`mt-2 ${fieldCls}`}
                      />
                    </div>
                    <div>
                      <label htmlFor="cf-topup-city" className={labelCls}>City</label>
                      <input
                        id="cf-topup-city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={`mt-2 ${fieldCls}`}
                      />
                    </div>
                    <div>
                      <label htmlFor="cf-topup-pin" className={labelCls}>{isIndia ? "PIN code" : "Postal code"}</label>
                      <input
                        id="cf-topup-pin"
                        value={pincode}
                        onChange={(e) => { setPincode(e.target.value); setError(""); }}
                        inputMode={isIndia ? "numeric" : "text"}
                        maxLength={isIndia ? 6 : 12}
                        className={`mt-2 tabular-nums ${fieldCls}`}
                      />
                    </div>
                  </div>
                </details>

                {errorLine}

                {/* 3. Pay */}
                <button
                  onClick={pay}
                  disabled={busy || !config || amountTooLow || amountTooHigh}
                  className="cf-btn-primary mt-6 w-full tabular-nums disabled:opacity-50"
                >
                  {busy ? "Opening payment…" : `Pay ${money(Number(amount || 0) || 0)}`}
                </button>
                <p className="mt-3 text-center text-[13px] leading-5 text-ink-2">{trustLine}</p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
