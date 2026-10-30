"use client";

/**
 * Finish sign-up: the checks left before an account is active. Website only.
 *
 * PAID-FIRST ONBOARDING (10 Oct 2026). This used to be a 1,900-line identity
 * flow. The owner retired the PERSONAL identity checks — DigiLocker, Indian
 * passport file numbers, legal-name correction — because paying is the filter
 * now. Every account still confirms its email and mobile number (CERT-In).
 *
 * BUSINESS ACCOUNTS STILL VERIFY THE ENTITY (restored 30 Oct 2026). The 10 Oct
 * rewrite dropped the GSTIN and bank steps from this page too, but the owner
 * only retired identity KYC: the API never stopped requiring them, so a b2b
 * sign-up sat in pending_approval with nothing on screen to do about it. A
 * business (customer_type "b2b") now does two more steps after email + mobile:
 *   1. GSTIN, checked against the GST register (POST /verification/gstin);
 *   2. the company bank account. Two ways, picked on the server by
 *      `business.bank.method` (BUSINESS_BANK_CHECK_METHOD, 30 Oct 2026):
 *      - "bav" (default): penny drop. They type the account number (twice) and
 *        IFSC, we send Rs 1 to it and the bank tells us whose name it is in
 *        (POST /verification/bank/verify, one synchronous call);
 *      - "rpd": reverse penny drop. They send Rs 1 by UPI from the company
 *        account and it is refunded (POST /verification/bank/start, then
 *        /verification/bank/complete). A control plane that does not send
 *        `method` only knows this one.
 * Both are Cashfree lookups on the server. Individuals never see them.
 *
 * Driven by `next_step` from GET /verification/status ("email" | "mobile" |
 * "done"), which counts the contact checks only, then — for a business — by
 * the `customer_type` and `business` block the same response carries (GST and
 * bank state, the GSTIN given at sign-up, attempts used) and `max_attempts`.
 * A control plane from before `next_step` existed is still handled:
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
import {
  Building2,
  CheckCircle2,
  Circle,
  Clock,
  Landmark,
  Loader2,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
} from "lucide-react";
import {
  COUNTRIES,
  INDIA,
  INDIAN_MOBILE_HINT,
  fetchCountries,
  validateBankAccount,
  validateGstin,
  validateIfsc,
  validatePhone,
  type Country,
} from "@/lib/validation";
import { API_BASE } from "@/lib/api-base";
import { peekReturnPath, takeReturnPath } from "@/lib/return-path";
import { goAfterSignIn } from "@/lib/session-cookie";
import { apiFetch, isSignedIn, rememberUser } from "@/lib/session";
import { apiErrorText, caughtErrorText } from "@/lib/api-error";

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

/* How a mobile code can travel (22 Oct 2026). The API decides what is on
   offer for the number on file: outside India SMS is the default and WhatsApp
   the alternative; in India WhatsApp stays the default and SMS is offered after
   the first send, and automatically when a WhatsApp send fails. A control
   plane from before this field existed is still handled: WhatsApp only. */
type Channel = "whatsapp" | "sms";
interface OtpChannels {
  default: Channel;
  available: Channel[];
}
const WHATSAPP_ONLY: OtpChannels = { default: "whatsapp", available: ["whatsapp"] };

function channelName(c: Channel): string {
  return c === "sms" ? "SMS" : "WhatsApp";
}
function viaChannel(c: Channel): string {
  return c === "sms" ? "by SMS" : "on WhatsApp";
}

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
  otp_channels?: OtpChannels;
  // Business accounts (b2b) also verify the entity: GSTIN, then the bank.
  customer_type?: string;
  business?: BusinessState;
  // Per-check attempt cap shared by GST and bank (0 = unlimited).
  max_attempts?: number;
  access_token?: string;
  user?: unknown;
}

/* `business` from GET /verification/status (business_verification_state on
   the API). `gstin` is what they typed at sign-up until the register confirms
   it; `attempts` counts paid lookups against `max_attempts`. */
interface BankState {
  required: boolean;
  verified: boolean;
  // Which check to show. Missing = an older API, which only has "rpd".
  method?: "bav" | "rpd";
  // CREATED | SUCCESS | FAILURE | EXPIRED (rpd), INVALID (bav), grandfathered
  status: string | null;
  attempts_left?: number | null;
  account_masked?: string | null;
  name_at_bank?: string | null;
  attempts?: number | null;
  failure_reason?: string | null;
}
interface BusinessState {
  gstin_required?: boolean;
  business_verified: boolean;
  gstin?: string | null;
  gstin_status?: string | null;
  legal_name?: string | null;
  trade_name?: string | null;
  registered_state?: string | null;
  attempts?: number | null;
  failure_reason?: string | null;
  bank?: BankState;
}

/* POST /verification/bank/start: a Rs 1 UPI collect, valid ten minutes. */
interface BankRequest {
  upi_link?: string | null;
  qr_code_base64?: string | null;
  hosted_url?: string | null;
  expected_name?: string | null;
  expires_in_seconds?: number;
  already_verified?: boolean;
}

/** Tries left on a capped check, or null when uncapped/unknown. */
function triesLeft(used: number | null | undefined, max: number | undefined): number | null {
  if (!max || max <= 0) return null;
  return Math.max(0, max - (used ?? 0));
}

/** Which business step is outstanding, if any. Individuals: none. */
function businessStep(s: VerificationStatus): "gstin" | "bank" | null {
  if (s.customer_type !== "b2b" || !s.business || s.business.gstin_required === false) return null;
  if (!s.business.business_verified) return "gstin";
  if (s.business.bank?.required && !s.business.bank.verified) return "bank";
  return null;
}

interface SendResult {
  sent?: boolean;
  channel?: Channel;
  fallback_from?: Channel | null;
  otp_channels?: OtpChannels;
  detail?: unknown;
}

type Phase = "loading" | "email" | "phone" | "otp" | "gstin" | "bank" | "done" | "held" | "error";

/** Which screen the status calls for. Pure, so the fallback is easy to read. */
function phaseFor(s: VerificationStatus): Phase {
  if (s.account_active) return "done";
  const mobileStep: Phase = s.has_phone_number ? "otp" : "phone";
  // Contacts are done by the server's count. A business then proves the
  // entity; anything else not yet active is a moment behind, or a person is
  // looking. Never loop back to /my-activity.
  const afterContacts: Phase = businessStep(s) ?? "held";
  switch (s.next_step) {
    case "email":
      return "email";
    case "mobile":
      return mobileStep;
    case "done":
      return afterContacts;
  }
  // Older control plane: no next_step. Ask for what is visibly missing.
  if (!s.email_verified) return "email";
  if (!s.mobile_verified) return mobileStep;
  return afterContacts;
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

/** Where a business is in sign-up: contacts done, then GST, then bank. */
function BusinessProgress({ status, current }: { status: VerificationStatus | null; current: "gstin" | "bank" }) {
  const b = status?.business;
  const bankRequired = b?.bank?.required !== false;
  const steps: Array<{ label: string; done: boolean; active: boolean }> = [
    { label: "Email and mobile confirmed", done: true, active: false },
    { label: "GST registration", done: Boolean(b?.business_verified), active: current === "gstin" },
  ];
  if (bankRequired) {
    steps.push({ label: "Company bank account", done: Boolean(b?.bank?.verified), active: current === "bank" });
  }
  return (
    <ol className="mb-6 grid gap-2 text-sm" aria-label="Sign-up progress">
      {steps.map((s) => (
        <li
          key={s.label}
          className={`flex items-center gap-2.5 ${s.active ? "font-medium text-ink" : s.done ? "text-ink-2" : "text-ink-3"}`}
          aria-current={s.active ? "step" : undefined}
        >
          {s.done ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-blue" aria-hidden />
          ) : (
            <Circle className={`h-4 w-4 shrink-0 ${s.active ? "text-blue" : "text-ink-3"}`} aria-hidden />
          )}
          {s.label}
        </li>
      ))}
    </ol>
  );
}

function whatNext(s: VerificationStatus | null): string {
  return s?.business?.bank?.required === false
    ? "Once this check passes, your account is ready. Then add funds to start."
    : "Once both checks pass, your account is ready. Then add funds to start.";
}
const NO_TRIES_LEFT =
  "You have used all the tries for this check. Message us on WhatsApp with the button on this page and we will clear it for you.";

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
  // The channel the customer picked (null = the API's default for the number),
  // the one that actually carried the last code, and the one that failed first
  // when the API fell back to the other.
  const [channel, setChannel] = useState<Channel | null>(null);
  const [sentVia, setSentVia] = useState<Channel | null>(null);
  const [fallbackFrom, setFallbackFrom] = useState<Channel | null>(null);
  const [emailResent, setEmailResent] = useState(false);
  // Business steps: the GSTIN field (prefilled from sign-up), the live Rs 1
  // UPI request, and a non-error note while we wait for that payment.
  const [gstin, setGstin] = useState("");
  const [bankReq, setBankReq] = useState<BankRequest | null>(null);
  const [bankNote, setBankNote] = useState("");
  // Penny drop (method "bav"): the account number, typed twice, and the IFSC.
  // Never stored anywhere but these fields; the API keeps the last 4 digits.
  const [bankAccount, setBankAccount] = useState("");
  const [bankAccount2, setBankAccount2] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankJustVerified, setBankJustVerified] = useState(false);
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
      // The GSTIN they gave at sign-up, until they type their own.
      const given = data.business?.gstin;
      if (given) setGstin((g) => g || given);
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
      setError(caughtErrorText(err, "Something went wrong."));
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
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(apiErrorText(res.status, data));
      // The response is a status; keep any next_step it carries, and if it is
      // an older shape without the phone flag, the number is now on file.
      apply({ ...data, has_phone_number: data.has_phone_number ?? true });
    } catch (err: unknown) {
      setError(caughtErrorText(err, "Could not save that number. Try again."));
    } finally {
      setBusy(false);
    }
  }

  // ── the mobile code (WhatsApp or SMS) ─────────────────────────────────────
  const channels: OtpChannels = status?.otp_channels ?? WHATSAPP_ONLY;
  const chosen: Channel = channel ?? channels.default;
  const otherChannel: Channel | null = channels.available.find((c) => c !== (sentVia ?? chosen)) ?? null;

  async function sendCode(which?: Channel) {
    const want = which ?? chosen;
    setChannel(want);
    setError("");
    setFallbackFrom(null);
    setBusy(true);
    try {
      const res = await apiFetch(`${API}/verification/mobile-otp/send`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ channel: want }),
      });
      const data = (await res.json().catch(() => null)) as SendResult | null;
      // A 503 is the server saying it could not DELIVER — a real answer. A 429
      // is the resend cooldown, and the other channel is still on offer.
      if (!res.ok) throw new Error(apiErrorText(res.status, data));
      setOtpSent(true);
      setSentVia(data?.channel ?? want);
      setFallbackFrom(data?.fallback_from ?? null);
      const channels = data?.otp_channels;
      if (channels) setStatus((s) => (s ? { ...s, otp_channels: channels } : s));
    } catch (err: unknown) {
      setError(caughtErrorText(err, "Could not send the code. Try again."));
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
      const data = await res.json().catch(() => null);
      // 429 is the server's attempt cap, not a wrong digit (funnel audit, 22
      // Oct 2026: one customer sent eight codes and typed nine, got rate
      // limited, and the page kept saying the code was wrong).
      if (res.status === 429) {
        throw new Error("Too many tries for now. Wait ten minutes, then press \"Send a new code\" and type the newest code you receive.");
      }
      if (!res.ok) throw new Error(apiErrorText(res.status, data));
      setOtpCode("");
      setOtpSent(false);
      apply({ ...data, mobile_verified: data.mobile_verified ?? true });
    } catch (err: unknown) {
      setError(caughtErrorText(err, "That code did not work. Type the newest code you received."));
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
        throw new Error(apiErrorText(res.status, data));
      }
      setEmailResent(true);
    } catch (err: unknown) {
      setError(caughtErrorText(err, "Could not send the link. Try again."));
    } finally {
      setBusy(false);
    }
  }

  // ── business: GSTIN ───────────────────────────────────────────────────────
  async function submitGstin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    // Each try is a paid lookup that counts against the cap: catch typos here.
    const check = validateGstin(gstin);
    if (!check.ok) return setError(check.error);
    setBusy(true);
    try {
      const res = await apiFetch(`${API}/verification/gstin`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ gstin: check.value }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(apiErrorText(res.status, data));
      if (data?.account_active) return apply({ ...(status as VerificationStatus), ...data });
      if (data && data.verified === false && !data.already_verified) {
        // A real answer from the register, not a fault. Refresh the attempt
        // count, then say what it was.
        await loadStatus().catch(() => undefined);
        setError(
          data.gstin_status === "not_found"
            ? "That GSTIN is not on the GST register. Check it against your GST certificate."
            : `That GST registration is not active (${data.gstin_status || "unknown"}). A business account needs an active one.`,
        );
        return;
      }
      // Verified (or already was): the status decides the next step.
      await loadStatus();
    } catch (err: unknown) {
      setError(caughtErrorText(err, "Could not check that GSTIN. Try again."));
    } finally {
      setBusy(false);
    }
  }

  // ── business: Rs 1 from the company bank account ──────────────────────────
  async function startBank() {
    setError("");
    setBankNote("");
    setBusy(true);
    try {
      const res = await apiFetch(`${API}/verification/bank/start`, { method: "POST", headers: authHeaders() });
      const data = (await res.json().catch(() => null)) as BankRequest | null;
      if (!res.ok) throw new Error(apiErrorText(res.status, data));
      if (data?.already_verified) {
        await loadStatus();
        return;
      }
      setBankReq(data ?? {});
      // The attempt count moved; keep the "tries left" line honest.
      setStatus((s) =>
        s?.business?.bank
          ? {
              ...s,
              business: {
                ...s.business,
                bank: { ...s.business.bank, status: "CREATED", attempts: (s.business.bank.attempts ?? 0) + 1, failure_reason: null },
              },
            }
          : s,
      );
    } catch (err: unknown) {
      setError(caughtErrorText(err, "Could not start the bank check. Try again."));
    } finally {
      setBusy(false);
    }
  }

  // ── business: penny drop (we send Rs 1 to the account they type) ──────────
  async function submitBav(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    // Each answer from the bank uses a try: catch typos and mismatches here.
    const acct = validateBankAccount(bankAccount, bankAccount2);
    if (!acct.ok) return setError(acct.error);
    const code = validateIfsc(ifsc);
    if (!code.ok) return setError(code.error);
    setBusy(true);
    try {
      const res = await apiFetch(`${API}/verification/bank/verify`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ bank_account: acct.value, ifsc: code.value }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(apiErrorText(res.status, data));
      if (data?.verified) {
        setBankAccount("");
        setBankAccount2("");
        setBankJustVerified(true);
        if (data.account_active) apply({ ...(status as VerificationStatus), ...data });
        else await loadStatus();
        return;
      }
      // The bank's answer, not a fault: refresh the tries count, then say why.
      await loadStatus().catch(() => undefined);
      setError(data?.reason || "The bank could not confirm this account. Check the number and IFSC.");
    } catch (err: unknown) {
      setError(caughtErrorText(err, "Could not check the account. Try again."));
    } finally {
      setBusy(false);
    }
  }

  const checkBank = useCallback(
    async (quiet = false) => {
      if (!quiet) {
        setError("");
        setBusy(true);
      }
      try {
        const res = await apiFetch(`${API}/verification/bank/complete`, { method: "POST", headers: authHeaders() });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(apiErrorText(res.status, data));
        if (data?.verified) {
          setBankReq(null);
          setBankNote("");
          if (data.account_active) apply({ ...(status as VerificationStatus), ...data });
          else await loadStatus();
          return;
        }
        if (data?.pending) {
          if (!quiet) setBankNote("No payment has reached us yet. Send the ₹1, then check again.");
          return;
        }
        // Expired or failed: this request is spent, start a new one.
        setBankReq(null);
        setBankNote("");
        await loadStatus().catch(() => undefined);
        setError(`${data?.reason || "That payment did not go through."} Start a new check to try again.`);
      } catch (err: unknown) {
        if (!quiet) setError(caughtErrorText(err, "Could not check the payment. Try again."));
      } finally {
        if (!quiet) setBusy(false);
      }
    },
    [apply, authHeaders, loadStatus, status],
  );

  // While the UPI request is open, look for the payment every 10 s (the API
  // allows 90 checks an hour; the request lives 10 minutes).
  useEffect(() => {
    if (phase !== "bank" || !bankReq) return;
    const started = Date.now();
    const life = (bankReq.expires_in_seconds ?? 600) * 1000;
    const id = window.setInterval(() => {
      if (Date.now() - started > life + 30_000) {
        window.clearInterval(id);
        return;
      }
      void checkBank(true);
    }, 10_000);
    return () => window.clearInterval(id);
  }, [phase, bankReq, checkBank]);

  async function recheck() {
    setError("");
    setBusy(true);
    try {
      await loadStatus();
    } catch (err: unknown) {
      setError(caughtErrorText(err, "Something went wrong."));
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
          title={bankJustVerified ? "Bank account confirmed." : "You're all set."}
          sub={
            bankJustVerified
              ? "Your account is ready. Add funds to start."
              : returnTo
                ? "Taking you back to where you were."
                : "Taking you to add funds. Your first session starts from there."
          }
        />
        <a href={returnTo ?? DONE_URL} className={btnPrimary}>
          {returnTo ? "Continue" : "Add funds"}
        </a>
      </Card>
    );
  }

  if (phase === "held") {
    const isBusiness = status?.customer_type === "b2b";
    return (
      <Card>
        <Header
          icon={<Clock className="h-5 w-5" />}
          title={isBusiness ? "Your business checks are done." : "Your email and mobile are confirmed."}
          sub={
            isBusiness
              ? "We're switching your account on. If the name at your bank or on the GST register differs from the company name you gave, someone at Coreframe takes a quick look first. Check again, or message us on WhatsApp with the button on this page if nothing changes."
              : "We're switching your account on, which usually takes a moment. Check again, or message us on WhatsApp with the button on this page if nothing changes."
          }
        />
        {error && <p className={`${errorBox} mb-4`}>{error}</p>}
        <Button onClick={recheck} disabled={busy} className={btnPrimary}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Check again
        </Button>
      </Card>
    );
  }

  if (phase === "gstin") {
    const b = status?.business;
    const left = triesLeft(b?.attempts, status?.max_attempts);
    const lastTry = b?.gstin_status && b.gstin_status !== "Active" ? b.failure_reason : null;
    return (
      <Card>
        <Header
          icon={<Building2 className="h-5 w-5" />}
          title="Verify your business."
          sub="Business accounts need a quick check of the company before the first invoice. First, we look up your GSTIN on the GST register. It takes a few seconds and sets the place of supply on your invoices."
        />
        <BusinessProgress status={status} current="gstin" />
        {left === 0 ? (
          <p className={errorBox}>{NO_TRIES_LEFT}</p>
        ) : (
          <form onSubmit={submitGstin} className="grid gap-4">
            <div className="grid gap-1.5">
              <label htmlFor="cf-gstin" className="text-sm font-medium text-ink">
                GSTIN
              </label>
              <input
                id="cf-gstin"
                value={gstin}
                onChange={(e) => {
                  setGstin(e.target.value.toUpperCase().replace(/\s/g, ""));
                  setError("");
                }}
                maxLength={15}
                placeholder="29ABCDE1234F1Z5"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                className={`${inputCls} font-mono tracking-[0.12em]`}
                required
              />
              <p className="text-xs leading-5 text-ink-3">
                {b?.gstin ? "This is the GSTIN you gave when you signed up. Correct it if it is wrong. " : ""}
                15 characters, exactly as printed on your GST certificate.
              </p>
            </div>
            {lastTry && !error && (
              <p className="cf-glass-inset border-l-2 border-l-blue px-4 py-3 text-sm leading-6 text-ink-2">
                Last check: {lastTry}
              </p>
            )}
            {error && <p className={errorBox}>{error}</p>}
            <Button type="submit" disabled={busy} className={btnPrimary}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {busy ? "Checking the GST register…" : "Check GSTIN"}
            </Button>
            {left !== null && (
              <p className="text-xs leading-5 text-ink-3">
                {left === 1 ? "1 try left." : `${left} tries left.`} {whatNext(status)}
              </p>
            )}
            {left === null && <p className="text-xs leading-5 text-ink-3">{whatNext(status)}</p>}
          </form>
        )}
      </Card>
    );
  }

  if (phase === "bank" && status?.business?.bank?.method === "bav") {
    const b = status.business;
    const bank = b.bank;
    const left =
      typeof bank?.attempts_left === "number" ? bank.attempts_left : triesLeft(bank?.attempts, status.max_attempts);
    const company = b.legal_name || b.trade_name || "your company";
    const lastTry = bank?.status === "INVALID" ? bank.failure_reason : null;
    return (
      <Card>
        <Header
          icon={<Landmark className="h-5 w-5" />}
          title="Confirm your company bank account."
          sub={
            <>
              We&apos;ll send ₹1 to this account to confirm it belongs to{" "}
              <span className="font-medium text-ink">{company}</span>. Use the company&apos;s current account, not a
              personal one.
            </>
          }
        />
        <BusinessProgress status={status} current="bank" />
        {left === 0 ? (
          <p className={errorBox}>{NO_TRIES_LEFT}</p>
        ) : (
          <form onSubmit={submitBav} className="grid gap-4" autoComplete="off">
            <div className="grid gap-1.5">
              <label htmlFor="cf-bank-account" className="text-sm font-medium text-ink">
                Company bank account number
              </label>
              <input
                id="cf-bank-account"
                value={bankAccount}
                onChange={(e) => {
                  setBankAccount(e.target.value.replace(/\D/g, "").slice(0, 18));
                  setError("");
                }}
                inputMode="numeric"
                autoComplete="off"
                spellCheck={false}
                maxLength={18}
                placeholder="Digits only"
                className={`${inputCls} font-mono tracking-[0.08em]`}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="cf-bank-account-2" className="text-sm font-medium text-ink">
                Type the account number again
              </label>
              <input
                id="cf-bank-account-2"
                value={bankAccount2}
                onChange={(e) => {
                  setBankAccount2(e.target.value.replace(/\D/g, "").slice(0, 18));
                  setError("");
                }}
                onPaste={(e) => e.preventDefault()}
                inputMode="numeric"
                autoComplete="off"
                spellCheck={false}
                maxLength={18}
                placeholder="Same number, to be sure"
                className={`${inputCls} font-mono tracking-[0.08em]`}
                required
              />
              {bankAccount2.length > 0 && bankAccount2.length >= bankAccount.length && bankAccount2 !== bankAccount && (
                <p className="text-xs leading-5 text-destructive">The two numbers do not match yet.</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="cf-ifsc" className="text-sm font-medium text-ink">
                IFSC
              </label>
              <input
                id="cf-ifsc"
                value={ifsc}
                onChange={(e) => {
                  setIfsc(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11));
                  setError("");
                }}
                maxLength={11}
                placeholder="HDFC0001234"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                className={`${inputCls} font-mono tracking-[0.12em]`}
                required
              />
              <p className="text-xs leading-5 text-ink-3">
                11 characters, on a cheque leaf or in net banking. The fifth is a zero.
              </p>
            </div>
            {lastTry && !error && (
              <p className="cf-glass-inset border-l-2 border-l-blue px-4 py-3 text-sm leading-6 text-ink-2">
                Last check: {lastTry}
              </p>
            )}
            {error && <p className={errorBox}>{error}</p>}
            <Button type="submit" disabled={busy} className={btnPrimary}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {busy ? "Checking with your bank…" : "Send ₹1 and confirm"}
            </Button>
            <p className="text-xs leading-5 text-ink-3">
              We match the name your bank holds against the GST register.
              {left !== null ? ` ${left === 1 ? "1 try left." : `${left} tries left.`}` : ""} {whatNext(status)}
            </p>
          </form>
        )}
      </Card>
    );
  }

  if (phase === "bank") {
    const b = status?.business;
    const bank = b?.bank;
    const left = triesLeft(bank?.attempts, status?.max_attempts);
    const company = bankReq?.expected_name || b?.legal_name || b?.trade_name || "your company";
    // A request opened before a reload may already be paid: let them check it.
    const openBefore = !bankReq && bank?.status === "CREATED";
    const qr = bankReq?.qr_code_base64
      ? bankReq.qr_code_base64.startsWith("data:")
        ? bankReq.qr_code_base64
        : `data:image/png;base64,${bankReq.qr_code_base64}`
      : null;
    return (
      <Card>
        <Header
          icon={<Landmark className="h-5 w-5" />}
          title="Confirm your company bank account."
          sub={
            <>
              Send ₹1 by UPI from the bank account of{" "}
              <span className="font-medium text-ink">{company}</span>. It proves you can operate the account, and
              the rupee comes back to the same account within 48 hours.
            </>
          }
        />
        <BusinessProgress status={status} current="bank" />
        {b?.business_verified && (b.legal_name || b.trade_name) && (
          <p className="cf-glass-inset mb-4 border-l-2 border-l-blue px-4 py-3 text-sm leading-6 text-ink-2">
            GST confirmed: <span className="font-medium text-ink">{b.legal_name || b.trade_name}</span>
            {b.registered_state ? `, ${b.registered_state}` : ""}.
          </p>
        )}
        {!bankReq ? (
          <div className="grid gap-3">
            {error && <p className={errorBox}>{error}</p>}
            {left === 0 && !openBefore ? (
              <p className={errorBox}>{NO_TRIES_LEFT}</p>
            ) : (
              <>
                {openBefore && (
                  <Button onClick={() => checkBank()} disabled={busy} className={btnPrimary}>
                    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    I have sent the ₹1, check it
                  </Button>
                )}
                {bankNote && (
                  <p className="cf-glass-inset border-l-2 border-l-blue px-4 py-3 text-sm leading-6 text-ink-2">
                    {bankNote}
                  </p>
                )}
                {left !== 0 && (
                  <Button
                    onClick={startBank}
                    disabled={busy}
                    className={openBefore ? "cf-btn-secondary min-h-11 w-full disabled:opacity-60" : btnPrimary}
                  >
                    {busy && !openBefore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {openBefore ? "Start a new ₹1 request" : "Get the ₹1 UPI request"}
                  </Button>
                )}
              </>
            )}
            <p className="text-xs leading-5 text-ink-3">
              Use the company&apos;s own bank account, not a personal one: we match the name at the bank against
              the GST register.
              {left !== null && left > 0 ? ` ${left === 1 ? "1 try left." : `${left} tries left.`}` : ""} {whatNext(status)}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {qr && (
              <div className="flex flex-col items-center gap-2 rounded-cf border border-rule bg-paper p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="UPI QR code for the ₹1 verification payment" className="h-48 w-48" />
                <p className="text-xs text-ink-3">Scan with any UPI app signed in to the company account.</p>
              </div>
            )}
            {bankReq.upi_link && (
              <a href={bankReq.upi_link} className="cf-btn-secondary min-h-11 w-full md:hidden">
                Open a UPI app on this phone
              </a>
            )}
            {!qr && bankReq.hosted_url && (
              <a href={bankReq.hosted_url} target="_blank" rel="noopener noreferrer" className="cf-btn-secondary min-h-11 w-full">
                Open the payment page
              </a>
            )}
            <p className="text-xs leading-5 text-ink-3">
              The request works for ten minutes. We look for the payment every few seconds, so you can leave this page
              open.
            </p>
            {bankNote && (
              <p className="cf-glass-inset border-l-2 border-l-blue px-4 py-3 text-sm leading-6 text-ink-2">{bankNote}</p>
            )}
            {error && <p className={errorBox}>{error}</p>}
            <Button onClick={() => checkBank()} disabled={busy} className={btnPrimary}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {busy ? "Checking…" : "I have sent it, check now"}
            </Button>
            <p className="text-xs leading-5 text-ink-3">{whatNext(status)}</p>
          </div>
        )}
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
              ? `We'll send a one-time code to confirm it, because Indian regulations (CERT-In) require a verified contact number for compute rental. ${INDIAN_MOBILE_HINT}`
              : "We'll send a one-time code to confirm it, because Indian regulations (CERT-In) require a verified contact number for compute rental. Any country code works."
          }
        />
        <form onSubmit={submitPhone} className="grid gap-4">
          {/* Fixed columns (26 Oct 2026, customer on a phone: the number box was squeezed off-screen
              because the select's w-full beat its w-[112px]). The select never takes the width. */}
          <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-2 sm:grid-cols-[9rem_minmax(0,1fr)]">
            <select
              value={phoneCountry.iso}
              onChange={(e) => {
                const next = countries.find((c) => c.iso === e.target.value);
                if (next) setPhoneCountry(next);
                setError("");
              }}
              className={`${inputCls.replace("w-full ", "")} w-full cursor-pointer truncate`}
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
  const current: Channel = sentVia ?? chosen;
  const number = <span className="font-medium text-ink">{status?.phone_masked ?? "the number on your account"}</span>;
  const switchLabel = otherChannel ? `Send ${viaChannel(otherChannel)} instead` : null;
  return (
    <Card>
      <Header
        icon={current === "sms" ? <MessageSquare className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        title="Confirm your mobile."
        sub={
          otpSent ? (
            <>
              We sent a 6-digit code {viaChannel(current)} to {number}. It works for ten minutes.
            </>
          ) : (
            <>
              We&apos;ll send a 6-digit code {viaChannel(current)} to {number}.
            </>
          )
        }
      />
      {!otpSent ? (
        <div className="grid gap-3">
          {error && <p className={errorBox}>{error}</p>}
          <Button onClick={() => sendCode(chosen)} disabled={busy} className={btnPrimary}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send code {viaChannel(chosen)}
          </Button>
          {/* The alternative is always one tap away before the first send,
              and after a failed send it is the obvious next thing to try. */}
          {otherChannel && (
            <button
              type="button"
              onClick={() => sendCode(otherChannel)}
              disabled={busy}
              className="cf-btn-secondary min-h-11 w-full disabled:opacity-60"
            >
              {switchLabel}
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={submitCode} className="grid gap-4">
          {fallbackFrom && (
            <p className="cf-glass-inset border-l-2 border-l-blue px-4 py-3 text-sm leading-6 text-ink-2">
              {channelName(fallbackFrom)} did not go through to that number, so we sent the code{" "}
              {viaChannel(current)} instead.
            </p>
          )}
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
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <button
              type="button"
              onClick={() => sendCode(current)}
              disabled={busy}
              className="inline-flex min-h-11 items-center text-[13px] text-ink-3 hover:text-ink-2"
            >
              Send a new code {viaChannel(current)}
            </button>
            {otherChannel && (
              <button
                type="button"
                onClick={() => sendCode(otherChannel)}
                disabled={busy}
                className="inline-flex min-h-11 items-center text-[13px] text-blue hover:underline"
              >
                {switchLabel}
              </button>
            )}
          </div>
          <p className="text-xs leading-5 text-ink-3">
            {current === "sms"
              ? "Nothing after a minute? Check the number above, then try the other way."
              : "Nothing after a minute? Check that this number has WhatsApp, or try the other way."}
          </p>
        </form>
      )}
    </Card>
  );
}
