"use client";

/**
 * Finish sign-up: the one or two contact checks left before an account is
 * active. Website only.
 *
 * PAID-FIRST ONBOARDING (10 Oct 2026). This used to be a 1,900-line identity
 * flow — DigiLocker, Indian passport file numbers, legal-name correction, GSTIN
 * and a bank-account penny check. The owner retired all of it: paying is the
 * filter now, and the only checks left are the ones CERT-In requires of us —
 * a confirmed email and a confirmed mobile number. So this page asks for
 * exactly the step the server says is left, and then sends the customer to add
 * funds.
 *
 * Driven by `next_step` from GET /verification/status ("email" | "mobile" |
 * "done"). A control plane from before that field existed is still handled:
 * the mobile step is shown whenever the number is not yet verified, and an
 * account that is neither active nor missing a contact check gets an honest
 * "we are finishing your account" screen instead of a redirect loop.
 *
 * The session is the API's HttpOnly cookie (lib/session.ts). While sign-up is
 * unfinished it is verification-scoped; when the account becomes active the
 * API re-issues the cookie with full scope in the same response (it used to
 * hand back a new token for this page to store), because /me/wallet refuses
 * the scoped one with a 403 — the loop reported on 26 Sep.
 */

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";
import { CheckCircle2, Clock, Loader2, Mail, MessageCircle, Phone } from "lucide-react";
import {
  COUNTRIES,
  INDIA,
  INDIAN_MOBILE_HINT,
  fetchCountries,
  validatePhone,
  type Country,
} from "@/lib/validation";
import { API_BASE } from "@/lib/api-base";
import { peekReturnPath, takeReturnPath } from "@/lib/return-path";
import { goAfterSignIn } from "@/lib/session-cookie";
import { apiFetch, isSignedIn, rememberUser } from "@/lib/session";

const API = API_BASE;
const DONE_URL = "/my-activity?topup=1";

/* 44px and a 16px font on a phone: anything smaller and iOS Safari zooms the
   page when the field takes focus, and does not zoom back. */
const inputCls =
  "h-11 w-full min-w-0 rounded-cf border border-rule bg-paper px-3 text-base text-ink outline-none transition placeholder:text-ink-3 focus:border-blue focus:ring-2 focus:ring-blue/20 md:h-10 md:text-sm";
const btnPrimary = "cf-btn-primary min-h-11 w-full disabled:opacity-60";
const errorBox =
  "rounded-cf border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm leading-6 break-words text-destructive";

type NextStep = "email" | "mobile" | "done";

interface VerificationStatus {
  next_step?: NextStep;
  account_status?: string;
  account_active: boolean;
  email_verified: boolean;
  mobile_verified: boolean;
  needs_mobile_otp?: boolean;
  has_phone_number: boolean;
  phone_masked?: string | null;
  // The declared country (null for a Google sign-up that has not chosen one).
  country_code?: string | null;
  access_token?: string;
  user?: unknown;
}

type Phase = "loading" | "email" | "phone" | "otp" | "done" | "held" | "error";

/** Which screen the status calls for. Pure, so the fallback is easy to read. */
function phaseFor(s: VerificationStatus): Phase {
  if (s.account_active) return "done";
  const mobileStep: Phase = s.has_phone_number ? "otp" : "phone";
  switch (s.next_step) {
    case "email":
      return "email";
    case "mobile":
      return mobileStep;
    case "done":
      // Done by the server's count but not active yet — activation is a
      // moment behind, or a person is looking. Never loop back to /my-activity.
      return "held";
  }
  // Older control plane: no next_step. Ask for what is visibly missing.
  if (!s.email_verified) return "email";
  if (!s.mobile_verified) return mobileStep;
  return "held";
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="cf-glass w-full max-w-lg p-5 sm:p-7 md:p-8">{children}</div>;
}

function Header({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue/10 text-blue">
        {icon}
      </div>
      <p className="cf-eyebrow mb-2">Finish sign-up</p>
      <h1 className="font-display text-[27px] leading-[1.14] tracking-[-0.01em] text-ink sm:text-[32px]">
        {title}
      </h1>
      {sub && <p className="mt-2 text-[15px] leading-6 break-words text-ink-2">{sub}</p>}
    </div>
  );
}

export default function VerifyFlow() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [countries, setCountries] = useState<Country[]>(COUNTRIES);
  const [phoneCountry, setPhoneCountry] = useState<Country>(INDIA);
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [emailResent, setEmailResent] = useState(false);
  // Where "done" goes: the page that sent them to sign up, if any. Only read
  // once the done card renders, which is always after the status fetch.
  const [returnTo] = useState<string | null>(() => (typeof window === "undefined" ? null : peekReturnPath()));

  // No token here: the cookie travels with apiFetch (credentials: "include").
  const authHeaders = useCallback((): HeadersInit => ({ "Content-Type": "application/json" }), []);

  /** Keep the cached user record current when the API returns it (the account
   *  just became active: the API has already upgraded the session cookie). */
  const adoptToken = useCallback((data: { access_token?: string; user?: unknown }) => {
    if (data?.user) rememberUser(data.user);
  }, []);

  const apply = useCallback(
    (data: VerificationStatus) => {
      adoptToken(data);
      setStatus(data);
      const next = phaseFor(data);
      setPhase(next);
      if (next === "done") {
        // A beat on the confirmation, then straight on to adding funds.
        // Back to the page that sent them to sign up (e.g. /cfd),
        // otherwise on to adding funds.
        setTimeout(() => {
          void goAfterSignIn(takeReturnPath() ?? DONE_URL);
        }, 1200);
      }
    },
    [adoptToken],
  );

  const loadStatus = useCallback(async () => {
    const res = await apiFetch(`${API}/verification/status`, { headers: authHeaders() });
    if (res.status === 401) {
      window.location.href = "/login?next=/verify";
      return;
    }
    const data = (await res.json()) as VerificationStatus;
    if (!res.ok) throw new Error("Could not load your account status.");
    apply(data);
  }, [apply, authHeaders]);

  // ── initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    let hasToken = false;
    try {
      hasToken = isSignedIn() || Boolean(localStorage.getItem("cf_customer_token"));
    } catch {
      /* treated as signed out */
    }
    if (!hasToken) {
      window.location.href = "/login?next=/verify";
      return;
    }
    loadStatus().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("error");
    });
    fetchCountries(API).then((list) => {
      setCountries(list);
      // Default the dial code to the country they signed up from, if known.
      let home: string | undefined;
      try {
        const raw = localStorage.getItem("cf_customer_user");
        home = raw ? (JSON.parse(raw) as { country_code?: string }).country_code : undefined;
      } catch {
        /* India it is */
      }
      const pick = list.find((c) => c.iso === (home ?? "IN").toUpperCase());
      if (pick) setPhoneCountry(pick);
    });
  }, [loadStatus]);

  // ── mobile number (Google sign-ups arrive without one) ─────────────────────
  async function submitPhone(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const check = validatePhone(phone, phoneCountry);
    if (!check.ok) return setError(check.error);
    // Indian (rupee) accounts verify a +91 number; the API says the same.
    if (status?.country_code === "IN" && phoneCountry.dial_code !== "91") {
      return setError(INDIAN_MOBILE_HINT);
    }
    setBusy(true);
    try {
      const res = await apiFetch(`${API}/verification/phone`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ phone_number: check.value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : `Error ${res.status}`);
      // The response is a status; keep any next_step it carries, and if it is
      // an older shape without the phone flag, the number is now on file.
      apply({ ...data, has_phone_number: data.has_phone_number ?? true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not save that number. Try again.");
    } finally {
      setBusy(false);
    }
  }

  // ── WhatsApp code ─────────────────────────────────────────────────────────
  async function sendCode() {
    setError("");
    setBusy(true);
    try {
      const res = await apiFetch(`${API}/verification/mobile-otp/send`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      // A 503 is the server saying it could not DELIVER — a real answer.
      if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : `Error ${res.status}`);
      setOtpSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not send the code. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const value = otpCode.replace(/\D/g, "");
    if (value.length !== 6) return setError("Enter the 6-digit code.");
    setBusy(true);
    try {
      const res = await apiFetch(`${API}/verification/mobile-otp/verify`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ code: value }),
      });
      const data = await res.json();
      // 429 is the server's attempt cap, not a wrong digit (funnel audit, 22
      // Oct 2026: one customer sent eight codes and typed nine, got rate
      // limited, and the page kept saying the code was wrong).
      if (res.status === 429) {
        throw new Error("Too many tries for now. Wait ten minutes, then press \"Send a new code\" and type the newest code WhatsApp shows you.");
      }
      if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : `Error ${res.status}`);
      setOtpCode("");
      setOtpSent(false);
      apply({ ...data, mobile_verified: data.mobile_verified ?? true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "That code did not work. Each new code replaces the last one, so type the newest message.");
    } finally {
      setBusy(false);
    }
  }

  // ── email ─────────────────────────────────────────────────────────────────
  async function resendEmail() {
    setError("");
    let email = "";
    try {
      const raw = localStorage.getItem("cf_customer_user");
      email = raw ? ((JSON.parse(raw) as { email?: string }).email ?? "") : "";
    } catch {
      /* fall through to the error below */
    }
    if (!email) return setError("We could not tell which email to use. Sign in again from /login.");
    setBusy(true);
    try {
      const res = await fetch(`${API}/auth/request-magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(typeof data.detail === "string" ? data.detail : `Error ${res.status}`);
      }
      setEmailResent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not send the link. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function recheck() {
    setError("");
    setBusy(true);
    try {
      await loadStatus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "loading") {
    return (
      <Card>
        <div className="flex items-center gap-3 text-ink-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue" />
          Checking your account…
        </div>
      </Card>
    );
  }

  if (phase === "error") {
    return (
      <Card>
        <Header icon={<Clock className="h-5 w-5" />} title="We couldn't load your account." />
        <p className={errorBox}>{error}</p>
        <Button onClick={() => window.location.reload()} className={`${btnPrimary} mt-5`}>
          Try again
        </Button>
      </Card>
    );
  }

  if (phase === "done") {
    return (
      <Card>
        <Header
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="You're all set."
          sub={returnTo ? "Taking you back to where you were." : "Taking you to add funds. Your first session starts from there."}
        />
        <a href={returnTo ?? DONE_URL} className={btnPrimary}>
          {returnTo ? "Continue" : "Add funds"}
        </a>
      </Card>
    );
  }

  if (phase === "held") {
    return (
      <Card>
        <Header
          icon={<Clock className="h-5 w-5" />}
          title="Your email and mobile are confirmed."
          sub="We're switching your account on, which usually takes a moment. Check again, or message us on WhatsApp with the button on this page if nothing changes."
        />
        {error && <p className={`${errorBox} mb-4`}>{error}</p>}
        <Button onClick={recheck} disabled={busy} className={btnPrimary}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Check again
        </Button>
      </Card>
    );
  }

  if (phase === "email") {
    return (
      <Card>
        <Header
          icon={<Mail className="h-5 w-5" />}
          title="Confirm your email."
          sub="Open the sign-in link we emailed you. That confirms the address and brings you back here for the last step."
        />
        {emailResent && (
          <p className="cf-glass-inset mb-4 border-l-2 border-l-blue px-4 py-3 text-sm leading-6 text-ink-2">
            A new link is on its way. It expires in 15 minutes.
          </p>
        )}
        {error && <p className={`${errorBox} mb-4`}>{error}</p>}
        <div className="grid gap-3">
          <Button onClick={resendEmail} disabled={busy} className={btnPrimary}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send the link again
          </Button>
          <button
            type="button"
            onClick={recheck}
            disabled={busy}
            className="cf-btn-secondary min-h-11 w-full disabled:opacity-60"
          >
            I have opened it
          </button>
        </div>
      </Card>
    );
  }

  if (phase === "phone") {
    return (
      <Card>
        <Header
          icon={<Phone className="h-5 w-5" />}
          title="Add your mobile number."
          sub={
            status?.country_code === "IN"
              ? `We'll send a code on WhatsApp, because Indian regulations (CERT-In) require a verified contact number for compute rental. ${INDIAN_MOBILE_HINT}`
              : "We'll send a code on WhatsApp, because Indian regulations (CERT-In) require a verified contact number for compute rental. Any country code works."
          }
        />
        <form onSubmit={submitPhone} className="grid gap-4">
          <div className="flex gap-2">
            <select
              value={phoneCountry.iso}
              onChange={(e) => {
                const next = countries.find((c) => c.iso === e.target.value);
                if (next) setPhoneCountry(next);
                setError("");
              }}
              className={`${inputCls} w-[112px] shrink-0 cursor-pointer sm:w-36`}
              aria-label="Country dialling code"
            >
              {countries.map((c) => (
                <option key={c.iso} value={c.iso} className="bg-paper text-ink">
                  +{c.dial_code} {c.country}
                </option>
              ))}
            </select>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError("");
              }}
              className={inputCls}
              placeholder={phoneCountry.dial_code === "91" ? "98765 43210" : "mobile number"}
              autoComplete="tel-national"
              aria-label="Mobile number"
              autoFocus
              required
            />
          </div>
          {error && <p className={errorBox}>{error}</p>}
          <Button type="submit" disabled={busy} className={btnPrimary}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save number
          </Button>
        </form>
      </Card>
    );
  }

  // phase === "otp"
  return (
    <Card>
      <Header
        icon={<MessageCircle className="h-5 w-5" />}
        title="Confirm your mobile."
        sub={
          <>
            We&apos;ll send a 6-digit code on WhatsApp to{" "}
            <span className="font-medium text-ink">{status?.phone_masked ?? "the number on your account"}</span>.
          </>
        }
      />
      {!otpSent ? (
        <div className="grid gap-4">
          {error && <p className={errorBox}>{error}</p>}
          <Button onClick={sendCode} disabled={busy} className={btnPrimary}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send code on WhatsApp
          </Button>
        </div>
      ) : (
        <form onSubmit={submitCode} className="grid gap-4">
          <OtpInput
            value={otpCode}
            onChange={(v) => {
              setOtpCode(v);
              setError("");
            }}
            autoFocus
          />
          {error && <p className={errorBox}>{error}</p>}
          <Button type="submit" disabled={busy || otpCode.length < 6} className={btnPrimary}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Confirm
          </Button>
          <button
            type="button"
            onClick={sendCode}
            disabled={busy}
            className="inline-flex min-h-11 items-center self-start text-[13px] text-ink-3 hover:text-ink-2"
          >
            Send a new code
          </button>
        </form>
      )}
    </Card>
  );
}
