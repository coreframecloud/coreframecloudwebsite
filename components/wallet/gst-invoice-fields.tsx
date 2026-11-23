"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "@/lib/api-base";
import { apiFetch } from "@/lib/session";

/**
 * "GST invoice" in Add funds (owner, 23 Nov 2026). An individual account that
 * pays for a company adds the company's GSTIN, verified the same way a business
 * account's is, and it goes on this and every later invoice:
 *   1. GSTIN, looked up in the GST register (must be Active);
 *   2. the company's bank account, by a Rs 1 penny drop: the holder's name must
 *      match the GST name.
 * Three tries a day for each check. Any failure is shown under its field and
 * blocks payment until it passes or the box is unticked. The server
 * (/payments/gst-profile, services/billing_gst.py) decides everything; the
 * full account number is sent once and never kept.
 */

type GstState = {
  available: boolean;
  unavailable_reason: string | null;
  ready: boolean;
  gstin: string | null;
  gstin_verified: boolean;
  legal_name: string | null;
  trade_name: string | null;
  state: string | null;
  gstin_reason: string | null;
  bank_verified: boolean;
  bank_account_masked: string | null;
  bank_name_at_bank: string | null;
  bank_reason: string | null;
  gst_tries_left: number;
  bank_tries_left: number;
};

type Answer = GstState & { ok?: boolean; reason?: string };

const API = API_BASE;

export function GstInvoiceFields({
  fieldCls,
  labelCls,
  helperCls,
  onChange,
}: {
  fieldCls: string;
  labelCls: string;
  helperCls: string;
  /** wanted = the box is ticked; ready = both checks passed. */
  onChange: (v: { wanted: boolean; ready: boolean }) => void;
}) {
  const [st, setSt] = useState<GstState | null>(null);
  const [wanted, setWanted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [gstin, setGstin] = useState("");
  const [account, setAccount] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [busy, setBusy] = useState<"" | "gstin" | "bank">("");
  const [gstErr, setGstErr] = useState("");
  const [bankErr, setBankErr] = useState("");

  useEffect(() => {
    let alive = true;
    apiFetch(`${API}/payments/gst-profile`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: GstState | null) => {
        if (!alive || !d) return;
        setSt(d);
        // Already verified: GST invoice on by default, as the owner chose (a).
        if (d.ready) setWanted(true);
        if (d.gstin) setGstin(d.gstin);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    onChange({ wanted, ready: Boolean(st?.ready) && !editing });
  }, [wanted, st?.ready, editing, onChange]);

  const post = useCallback(async (path: string, body: object): Promise<Answer | null> => {
    const r = await apiFetch(`${API}/payments/gst-profile/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json().catch(() => null);
    if (!r.ok) {
      const msg = typeof d?.detail === "string" ? d.detail : "That did not go through. Please try again.";
      return { ...(st as GstState), ok: false, reason: msg };
    }
    return d as Answer;
  }, [st]);

  async function checkGstin() {
    setGstErr("");
    setBusy("gstin");
    try {
      const a = await post("gstin", { gstin });
      if (!a) return;
      setSt(a);
      if (!a.ok) setGstErr(a.reason ?? "We could not verify this GSTIN.");
      else setEditing(false);
    } catch {
      setGstErr("We could not reach the server. Check your connection and try again.");
    } finally {
      setBusy("");
    }
  }

  async function checkBank() {
    setBankErr("");
    setBusy("bank");
    try {
      const a = await post("bank", { bank_account: account, ifsc });
      if (!a) return;
      setSt(a);
      if (!a.ok) setBankErr(a.reason ?? "We could not verify this account.");
      else setAccount("");
    } catch {
      setBankErr("We could not reach the server. Check your connection and try again.");
    } finally {
      setBusy("");
    }
  }

  if (!st || !st.available) return null;

  const name = st.legal_name || st.trade_name;
  const gstDone = st.gstin_verified && !editing;
  const errCls = "mt-1.5 text-[13px] leading-5 text-destructive";
  const okCls = "mt-1.5 text-[13px] leading-5 text-ink-2";
  const btn =
    "inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-rule-strong px-5 text-[13px] font-semibold tracking-[0.02em] text-ink uppercase transition hover:bg-paper-2 disabled:opacity-50";

  return (
    <div className="mt-5">
      <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-5 text-ink">
        <input
          type="checkbox"
          checked={wanted}
          onChange={(e) => setWanted(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-blue)]"
        />
        <span>
          <span className="font-medium">GST invoice for my company</span>
          <span className="block text-[13px] text-ink-2">Your GSTIN on the invoice, to claim input tax credit</span>
        </span>
      </label>

      {wanted && st.ready && !editing ? (
        <div className="mt-3 rounded-cf border border-rule bg-paper-2 px-4 py-3 text-sm leading-6">
          <p className="font-medium text-ink">{name}</p>
          <p className="text-[13px] text-ink-2 tabular-nums">
            GSTIN {st.gstin} · {st.state} · bank account {st.bank_account_masked} verified
          </p>
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setGstin("");
            }}
            className="mt-1 text-[13px] font-medium text-blue hover:underline"
          >
            Use a different GSTIN
          </button>
        </div>
      ) : null}

      {wanted && (!st.ready || editing) ? (
        <div className="mt-3 space-y-5 rounded-cf border border-rule p-4">
          {/* Step 1: GSTIN */}
          <div>
            <label htmlFor="cf-gstin" className={labelCls}>
              1. Company GSTIN
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="cf-gstin"
                value={gstin}
                onChange={(e) => {
                  setGstin(e.target.value.toUpperCase());
                  setGstErr("");
                }}
                maxLength={15}
                autoComplete="off"
                placeholder="29ABCDE1234F1Z5"
                aria-invalid={Boolean(gstErr)}
                className={`${fieldCls} min-w-0 font-mono uppercase`}
              />
              <button
                type="button"
                onClick={() => void checkGstin()}
                disabled={busy !== "" || gstin.trim().length < 15 || st.gst_tries_left <= 0}
                className={btn}
              >
                {busy === "gstin" ? "Checking…" : "Verify"}
              </button>
            </div>
            {gstErr ? (
              <p role="alert" className={errCls}>
                {gstErr}
                {st.gst_tries_left > 0 ? ` ${st.gst_tries_left} ${st.gst_tries_left === 1 ? "try" : "tries"} left today.` : ""}
              </p>
            ) : gstDone ? (
              <p className={okCls}>
                <span className="font-medium text-ink">{name}</span> · Active · {st.state}
              </p>
            ) : (
              <p className={helperCls}>We check it in the GST register. 3 tries a day.</p>
            )}
          </div>

          {/* Step 2: the company bank account */}
          <div className={gstDone ? "" : "opacity-50"}>
            <p className={labelCls}>2. Company bank account</p>
            {st.bank_verified && !editing ? (
              <p className={okCls}>Verified: {st.bank_account_masked}</p>
            ) : (
              <>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[1.4fr_1fr_auto]">
                  <input
                    aria-label="Account number"
                    value={account}
                    onChange={(e) => {
                      setAccount(e.target.value.replace(/[^\d]/g, ""));
                      setBankErr("");
                    }}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Account number"
                    disabled={!gstDone}
                    className={`${fieldCls} min-w-0 tabular-nums`}
                  />
                  <input
                    aria-label="IFSC"
                    value={ifsc}
                    onChange={(e) => {
                      setIfsc(e.target.value.toUpperCase());
                      setBankErr("");
                    }}
                    maxLength={11}
                    autoComplete="off"
                    placeholder="IFSC"
                    disabled={!gstDone}
                    className={`${fieldCls} min-w-0 font-mono uppercase`}
                  />
                  <button
                    type="button"
                    onClick={() => void checkBank()}
                    disabled={!gstDone || busy !== "" || account.length < 6 || ifsc.trim().length !== 11 || st.bank_tries_left <= 0}
                    className={btn}
                  >
                    {busy === "bank" ? "Checking…" : "Verify"}
                  </button>
                </div>
                {bankErr ? (
                  <p role="alert" className={errCls}>
                    {bankErr}
                    {st.bank_tries_left > 0 ? ` ${st.bank_tries_left} ${st.bank_tries_left === 1 ? "try" : "tries"} left today.` : ""}
                  </p>
                ) : (
                  <p className={helperCls}>
                    We send ₹1 to it; the account must be in the name on the GST register. 3 tries a day.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
