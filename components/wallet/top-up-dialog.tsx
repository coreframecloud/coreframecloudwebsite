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
 * Billing state is MANDATORY, not a nicety: the state code is what decides
 * CGST+SGST versus IGST on the tax invoice this payment raises, and an invoice
 * taxed wrongly can only be corrected by credit note. The list is fetched from
 * /public/gst-states rather than hardcoded, so three clients cannot drift.
 */

import { useCallback, useEffect, useState } from "react";

const API = "https://control.coreframecloud.com/api";

type GstState = { code: string; name: string };

type PaymentsConfig = {
  enabled: boolean;
  key_id: string | null;
  min_topup_rupees: number;
  max_topup_rupees: number;
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

const PRESETS = [500, 1000, 2000, 5000];

export default function TopUpDialog({
  open,
  onClose,
  onCredited,
  user,
}: {
  open: boolean;
  onClose: () => void;
  onCredited: (newBalanceRupees: number) => void;
  user: { full_name?: string; email?: string; id?: string } | null;
}) {
  const [config, setConfig] = useState<PaymentsConfig | null>(null);
  const [states, setStates] = useState<GstState[]>([]);
  const [amount, setAmount] = useState<string>("500");
  const [name, setName] = useState(user?.full_name ?? "");
  const [stateCode, setStateCode] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<null | { credited: number; balance: number }>(null);

  useEffect(() => {
    if (!open) return;
    const token = localStorage.getItem("cf_customer_token");
    if (!token) return;

    fetch(`${API}/payments/config`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((c) => { if (c) { setConfig(c); setAmount(String(c.min_topup_rupees)); } })
      .catch(() => setConfig({ enabled: false, key_id: null, min_topup_rupees: 500, max_topup_rupees: 50000 }));

    fetch(`${API}/public/gst-states`)
      .then((r) => (r.ok ? r.json() : []))
      .then((s) => setStates(Array.isArray(s) ? s : []))
      .catch(() => setStates([]));

    loadRazorpay();
  }, [open]);

  // THE LIMIT HAS TO ARRIVE WHILE THEY TYPE, NOT AFTER THEY COMMIT.
  //
  // It was already on screen -- "Rs 500 - Rs 50,000", 12px at 40% opacity,
  // folded into a sentence about GST -- and it was still possible to enter 100,
  // press Pay and feel refused by a form that had not said anything. Text that
  // is present and unread is not a message; it is an alibi.
  const typedRupees = Number(amount);
  const amountTooLow = Boolean(config) && amount.trim() !== "" &&
    Number.isFinite(typedRupees) && typedRupees < (config?.min_topup_rupees ?? 500);
  const amountTooHigh = Boolean(config) && amount.trim() !== "" &&
    Number.isFinite(typedRupees) && typedRupees > (config?.max_topup_rupees ?? 50000);

  const pay = useCallback(async () => {
    setError("");
    const token = localStorage.getItem("cf_customer_token");
    if (!token) return setError("Please sign in again.");
    if (!config?.enabled || !config.key_id) return setError("Online recharge is not available right now.");

    const rupees = Number(amount);
    if (!Number.isFinite(rupees) || rupees < config.min_topup_rupees || rupees > config.max_topup_rupees) {
      return setError(
        `Enter an amount between ₹${config.min_topup_rupees.toLocaleString("en-IN")} and ₹${config.max_topup_rupees.toLocaleString("en-IN")}.`,
      );
    }
    if (!stateCode) return setError("Select your state — it decides the GST split on your invoice.");
    if (pincode && !/^\d{6}$/.test(pincode.trim())) return setError("PIN code must be 6 digits.");

    setBusy(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Could not load the payment window. Check your connection and try again.");

      const orderRes = await fetch(`${API}/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          amount_rupees: rupees,
          billing_address: {
            name: name.trim() || undefined,
            city: city.trim() || undefined,
            state_code: stateCode,
            pincode: pincode.trim() || undefined,
          },
        }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order?.detail ?? "Could not start the payment.");

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay!({
          key: order.key_id,
          order_id: order.order_id,
          amount: order.amount_paise,
          currency: order.currency ?? "INR",
          name: "Coreframe Cloud",
          description: `Wallet top-up ₹${rupees.toLocaleString("en-IN")}`,
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
          "Your payment went through but we could not confirm it here. It will be credited automatically within a few minutes — refresh this page, and contact us if it has not appeared.",
        );
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }, [amount, city, config, name, onCredited, pincode, stateCode, user]);

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
              ₹{done.credited.toLocaleString("en-IN")}
            </p>
            <p className="mt-2 text-[15px] leading-6 text-ink-2">
              New balance ₹{done.balance.toLocaleString("en-IN")}. Your GST invoice is in Payments below.
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
            ) : (
              <>
                <div className="mt-5 flex flex-wrap gap-2">
                  {PRESETS.filter((p) => !config || (p >= config.min_topup_rupees && p <= config.max_topup_rupees)).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAmount(String(p))}
                      className={`inline-flex min-h-11 items-center justify-center rounded-cf border px-4 text-sm font-semibold tabular-nums transition ${
                        amount === String(p)
                          ? "border-blue bg-blue-soft text-blue"
                          : "border-rule bg-paper-2 text-ink-2 hover:text-ink"
                      }`}
                    >
                      ₹{p.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>

                <label className="mt-4 block cf-eyebrow">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
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
                        ? `The smallest top-up is ₹${config.min_topup_rupees.toLocaleString("en-IN")}.`
                        : `The largest top-up is ₹${config.max_topup_rupees.toLocaleString("en-IN")}.`}
                    </p>
                  </div>
                ) : config ? (
                  <p className="mt-1.5 text-xs leading-5 text-ink-2">
                    Minimum ₹{config.min_topup_rupees.toLocaleString("en-IN")}, maximum ₹
                    {config.max_topup_rupees.toLocaleString("en-IN")}. GST included; a tax invoice is issued
                    automatically.
                  </p>
                ) : null}

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
                      PIN code
                    </label>
                    <input
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      inputMode="numeric"
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
                  {busy ? "Opening payment…" : `Pay ₹${Number(amount || 0).toLocaleString("en-IN")}`}
                </button>
                <p className="mt-3 text-center text-xs leading-5 text-ink-2">
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
