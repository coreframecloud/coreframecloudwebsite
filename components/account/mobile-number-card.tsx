"use client";

import { useCallback, useEffect, useState } from "react";

import { FORM } from "@/components/ui/form-field";
import { OtpInput } from "@/components/ui/otp-input";
import { API_BASE } from "@/lib/api-base";
import { apiFetch } from "@/lib/session";

/**
 * "Change mobile number" (owner, 22 Oct 2026: "in the profile we talked about
 * editing the mobile number -- I don't see it"). Same card in Coreframe
 * Connect's Profile (src/components/mobile-number.js).
 *
 * New number -> a one-time code to the NEW number -> confirmed, it replaces the
 * old one. Everything about the code is the verification step's: the same
 * limits, the same WhatsApp/SMS channels and wording as /verify. The server
 * keeps the history (CERT-In), allows three changes in 30 days, refuses a
 * number another account holds, and emails the account about the change.
 */

type Channel = "whatsapp" | "sms";
interface OtpChannels {
  default: Channel;
  available: Channel[];
}

interface ChangeState {
  phone_number_masked: string | null;
  mobile_verified: boolean;
  changes_left: number;
  changes_per_window: number;
  window_days: number;
  next_change_at?: string | null;
}

interface SendResult {
  channel?: Channel;
  fallback_from?: Channel | null;
  otp_channels?: OtpChannels;
  new_number_masked?: string;
  changes_left?: number;
  detail?: unknown;
}

const API = API_BASE;
const JSON_HEADERS: HeadersInit = { "Content-Type": "application/json" };

function channelName(c: Channel): string {
  return c === "sms" ? "SMS" : "WhatsApp";
}
function viaChannel(c: Channel): string {
  return c === "sms" ? "by SMS" : "on WhatsApp";
}

function detailOf(data: unknown, fallback: string): string {
  const d = (data as { detail?: unknown } | null)?.detail;
  if (typeof d === "string" && d) return d;
  const m = (d as { message?: unknown } | null)?.message;
  return typeof m === "string" && m ? m : fallback;
}

const inputCls =
  "h-11 w-full min-w-0 rounded-cf border border-rule bg-paper px-3 text-base text-ink outline-none transition placeholder:text-ink-3 focus:border-blue focus:ring-2 focus:ring-blue/20 md:h-10 md:text-sm";
const errorBox =
  "rounded-cf border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm leading-6 break-words text-destructive";
const btnPrimary = "cf-btn-primary min-h-11 px-4 disabled:opacity-60";
const btnQuiet =
  "rounded-cf border border-rule-strong px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper-2 disabled:opacity-60";
const linkBtn = "inline-flex min-h-11 items-center text-[13px] text-ink-3 hover:text-ink-2 disabled:opacity-60";

export default function MobileNumberCard() {
  const [info, setInfo] = useState<ChangeState | null>(null);
  const [step, setStep] = useState<"idle" | "enter" | "code" | "done">("idle");
  const [number, setNumber] = useState("");
  const [code, setCode] = useState("");
  const [sentVia, setSentVia] = useState<Channel | null>(null);
  const [fallbackFrom, setFallbackFrom] = useState<Channel | null>(null);
  const [channels, setChannels] = useState<OtpChannels | null>(null);
  const [newMasked, setNewMasked] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`${API}/verification/phone-change`, { headers: JSON_HEADERS });
      if (res.ok) setInfo((await res.json()) as ChangeState);
    } catch {
      /* the card stays hidden on a network blip */
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function send(which?: Channel) {
    setError(null);
    setFallbackFrom(null);
    if (number.replace(/\D/g, "").length < 7) {
      setError("Enter the new mobile number with its country code.");
      return;
    }
    setBusy(true);
    try {
      const res = await apiFetch(`${API}/verification/phone-change/send`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(which ? { phone_number: number, channel: which } : { phone_number: number }),
      });
      const data = (await res.json().catch(() => ({}))) as SendResult;
      if (!res.ok) throw new Error(detailOf(data, "We could not send a code just now. Please try again."));
      setSentVia(data.channel ?? which ?? "whatsapp");
      setFallbackFrom(data.fallback_from ?? null);
      setChannels(data.otp_channels ?? null);
      setNewMasked(data.new_number_masked ?? "");
      setCode("");
      setStep("code");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "We could not send a code just now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const value = code.replace(/\D/g, "");
    if (value.length !== 6) return setError("Enter the 6-digit code.");
    setBusy(true);
    try {
      const res = await apiFetch(`${API}/verification/phone-change/verify`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ code: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(detailOf(data, "That code did not work. Check it and try again."));
      setInfo(data as ChangeState);
      setStep("done");
      setNumber("");
      setCode("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "That code did not work. Check it and try again.");
    } finally {
      setBusy(false);
    }
  }

  function cancel() {
    setStep("idle");
    setNumber("");
    setCode("");
    setError(null);
  }

  if (!info) return null;

  const current: Channel = sentVia ?? channels?.default ?? "whatsapp";
  const other: Channel | null = channels?.available.find((c) => c !== current) ?? null;
  const capped = info.changes_left <= 0;

  return (
    <section className="cf-glass p-5 sm:p-6" aria-labelledby="mobile-number">
      <h2 id="mobile-number" className="cf-section-title">
        Mobile number
      </h2>
      <p className="mt-2 text-[15px] leading-7 text-ink-2">
        <span className="font-medium whitespace-nowrap text-ink">{info.phone_number_masked ?? "Not added"}</span>
        {info.phone_number_masked && info.mobile_verified ? " · verified" : ""}
      </p>

      {step === "done" ? (
        <p className="mt-2 text-sm leading-6 text-ink-2">
          Your mobile number is now <span className="font-medium text-ink">{info.phone_number_masked}</span>. We
          emailed you a note of the change.
        </p>
      ) : null}

      {step === "idle" || step === "done" ? (
        capped ? (
          <p className="mt-3 text-sm leading-6 text-ink-2">
            You have changed your number {info.changes_per_window} times in the last {info.window_days} days. To
            change it again, contact support@coreframecloud.com.
          </p>
        ) : (
          <button type="button" onClick={() => setStep("enter")} className={`mt-4 ${btnQuiet}`}>
            Change mobile number
          </button>
        )
      ) : null}

      {step === "enter" ? (
        <form
          className={`mt-6 max-w-md ${FORM.stack}`}
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <div className={FORM.control}>
          <label className={`${FORM.field} text-sm text-ink-2`}>
            New mobile number
            <input
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="+91 98765 43210"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className={inputCls}
              autoFocus
            />
          </label>
          <p className="text-xs leading-5 text-ink-3">
            Include the country code. We send a one-time code to the new number; your current number stays until it
            is confirmed.
          </p>
          {error ? <p role="alert" className={errorBox}>{error}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={busy} className={btnPrimary}>
              {busy ? "Sending…" : "Send code"}
            </button>
            <button type="button" onClick={cancel} disabled={busy} className={linkBtn}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {step === "code" ? (
        <form className={`mt-6 max-w-md ${FORM.stack}`} onSubmit={confirm}>
          <div className={FORM.fields}>
          <p className="text-sm leading-6 text-ink-2">
            We sent a 6-digit code {viaChannel(current)} to{" "}
            <span className="font-medium whitespace-nowrap text-ink">{newMasked || "your new number"}</span>. It works
            for ten minutes.
          </p>
          {fallbackFrom ? (
            <p className="cf-glass-inset border-l-2 border-l-blue px-4 py-3 text-sm leading-6 text-ink-2">
              {channelName(fallbackFrom)} did not go through to that number, so we sent the code {viaChannel(current)}{" "}
              instead.
            </p>
          ) : null}
          <div className={FORM.control}>
          <OtpInput
            value={code}
            onChange={(v) => {
              setCode(v);
              setError(null);
            }}
            autoFocus
          />
          {error ? <p role="alert" className={errorBox}>{error}</p> : null}
          </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <button type="submit" disabled={busy || code.length < 6} className={btnPrimary}>
              {busy ? "Checking…" : "Confirm new number"}
            </button>
            <button type="button" onClick={() => void send(current)} disabled={busy} className={linkBtn}>
              Send a new code {viaChannel(current)}
            </button>
            {other ? (
              <button
                type="button"
                onClick={() => void send(other)}
                disabled={busy}
                className="inline-flex min-h-11 items-center text-[13px] text-blue hover:underline disabled:opacity-60"
              >
                Send {viaChannel(other)} instead
              </button>
            ) : null}
            <button type="button" onClick={cancel} disabled={busy} className={linkBtn}>
              Cancel
            </button>
          </div>
          <p className="text-xs leading-5 text-ink-3">
            {current === "sms"
              ? "Nothing after a minute? Check the number, then try the other way."
              : "Nothing after a minute? Check that this number has WhatsApp, or try the other way."}
          </p>
        </form>
      ) : null}
    </section>
  );
}
