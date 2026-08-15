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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Add funds"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a1524] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center">
            <p className="text-lg font-semibold text-white">Wallet topped up</p>
            <p className="mt-2 text-3xl font-bold text-emerald-300">
              ₹{done.credited.toLocaleString("en-IN")}
            </p>
            <p className="mt-2 text-sm text-white/50">
              New balance ₹{done.balance.toLocaleString("en-IN")}. Your GST invoice is in Payments below.
            </p>

            {/* The moment someone has credit is the moment they want to USE it,
                and they cannot without the desktop client. Sending them back to
                a dashboard to hunt for it wastes the one moment their intent is
                highest. */}
            <div className="mt-6 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] p-4 text-left">
              <p className="text-sm font-semibold text-white">Next: install Coreframe Connect</p>
              <p className="mt-1 text-xs leading-5 text-white/55">
                The Windows app that launches your workstation and streams it here. Sign in
                with this same email and press Connect.
              </p>
              <a
                href="/download"
                className="mt-3 inline-flex items-center justify-center rounded-lg bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-cyan-300"
              >
                Download for Windows →
              </a>
            </div>

            <button
              onClick={onClose}
              className="mt-3 w-full rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/70 hover:bg-white/5"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-white">Add funds</h2>
              <button onClick={onClose} aria-label="Close" className="text-white/40 hover:text-white">
                ✕
              </button>
            </div>

            {config && !config.enabled ? (
              <p className="mt-4 text-sm text-amber-300/90">
                Online recharge is not available right now. Email{" "}
                <a className="underline" href="mailto:support@coreframecloud.com">
                  support@coreframecloud.com
                </a>{" "}
                and we will credit your wallet within one business day.
              </p>
            ) : (
              <>
                <div className="mt-5 flex flex-wrap gap-2">
                  {PRESETS.filter((p) => !config || (p >= config.min_topup_rupees && p <= config.max_topup_rupees)).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAmount(String(p))}
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                        amount === String(p)
                          ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-200"
                          : "border-white/10 bg-white/5 text-white/70 hover:text-white"
                      }`}
                    >
                      ₹{p.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>

                <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-white/40">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(""); }}
                  min={config?.min_topup_rupees ?? 500}
                  max={config?.max_topup_rupees ?? 50000}
                  className="mt-1 h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-cyan-400/50"
                />
                {config && (
                  <p className="mt-1 text-xs text-white/40">
                    ₹{config.min_topup_rupees.toLocaleString("en-IN")} – ₹
                    {config.max_topup_rupees.toLocaleString("en-IN")}. GST included; a tax invoice is issued
                    automatically.
                  </p>
                )}

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/40">
                      Name on the invoice
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-cyan-400/50"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/40">
                      State <span className="text-cyan-300/70">(required)</span>
                    </label>
                    <select
                      value={stateCode}
                      onChange={(e) => { setStateCode(e.target.value); setError(""); }}
                      className="mt-1 h-11 w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-cyan-400/50"
                    >
                      {/* Options carry their own colours: Chrome paints the
                          native dropdown white and would otherwise inherit
                          text-white onto it. */}
                      <option value="" className="bg-slate-900 text-white">
                        Select your state
                      </option>
                      {states.map((s) => (
                        <option key={s.code} value={s.code} className="bg-slate-900 text-white">
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-white/40">
                      Your state decides the GST split on the invoice, so it cannot be guessed.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/40">
                      City
                    </label>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-cyan-400/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/40">
                      PIN code
                    </label>
                    <input
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      inputMode="numeric"
                      className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-cyan-400/50"
                    />
                  </div>
                </div>

                {error && (
                  <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </p>
                )}

                <button
                  onClick={pay}
                  disabled={busy || !config}
                  className="mt-5 w-full rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:opacity-50"
                >
                  {busy ? "Opening payment…" : `Pay ₹${Number(amount || 0).toLocaleString("en-IN")}`}
                </button>
                <p className="mt-3 text-center text-xs text-white/30">
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
