"use client";

/**
 * One-time identity verification, on the website only.
 *
 * Coreframe Connect never shows this — an account has to be fully verified and
 * approved before it can sign in to the app at all, so putting the flow in the
 * desktop client would mean shipping a screen that only ever appears to people
 * who cannot use the app yet.
 *
 * Round trip:
 *   /verify          -> POST /verification/digilocker/start -> DigiLocker
 *   DigiLocker       -> redirects to /verify/complete
 *   /verify/complete -> POST /verification/digilocker/complete (polled)
 *
 * The bearer token lives in localStorage (set at login), so nothing sensitive
 * travels in the URL across the DigiLocker round trip.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookUser,
  Building2,
  CheckCircle2,
  Clock,
  Fingerprint,
  Landmark,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

const API = "https://control.coreframecloud.com/api";
const POLL_MS = 3000;
const POLL_TIMEOUT_MS = 3 * 60 * 1000;

interface BankState {
  required: boolean;
  verified: boolean;
  status: string | null;
  name_at_bank: string | null;
  account_masked: string | null;
  failure_reason: string | null;
}

interface BusinessState {
  bank?: BankState;
  business_verified: boolean;
  gstin: string | null;
  gstin_status: string | null;
  legal_name: string | null;
  trade_name: string | null;
  constitution: string | null;
  registered_state: string | null;
  failure_reason: string | null;
}

interface VerificationStatus {
  customer_type?: string;
  business?: BusinessState;
  kyc_required: boolean;
  kyc_status: string;
  identity_verified: boolean;
  // Whether the ACCOUNT is usable — distinct from whether the identity checked
  // out. A verified identity with a poor name match is held for review, so
  // `identity_verified` alone must never be treated as approval.
  account_active: boolean;
  mobile_otp_required: boolean;
  mobile_verified: boolean;
  // Is there a mobile-code step in front of this customer right now? Computed
  // on the server, because computing it here is what went wrong: the old
  // `mobile_otp_required && !mobile_verified` ignored kyc_mobile_number, which
  // satisfies the requirement on its own.
  needs_mobile_otp?: boolean;
  mobile_otp_channel?: string;
  phone_masked?: string | null;
  email_verified: boolean;
  has_phone_number: boolean;
  attempts: number;
  max_attempts: number;
  failure_reason: string | null;
  verified_name: string | null;
  // When a spent attempt budget clears itself. null means it will not — the
  // cooldown is off, or this is not a state that retries.
  retry_available_at: string | null;
  // Whether the name on the account matches the one on the document, and
  // whether the customer is in a position to fix it. Deliberately booleans —
  // the API never tells the client what the document says, so correcting it
  // cannot be a copy-paste.
  name_matches_document: boolean | null;
  can_correct_legal_name: boolean;
  // What the CUSTOMER typed at signup. Safe to show — it is their own input,
  // unlike verified_name, which the API withholds while a mismatch is open.
  account_name: string | null;
  // Tries left at the name form today. null means the server could not tell,
  // and the page then shows no number rather than a wrong one.
  legal_name_attempts_remaining: number | null;
}

type Phase = "loading" | "intro" | "gstin" | "bank" | "redirecting" | "polling" | "approved" | "review" | "failed" | "duplicate" | "error";

const FAILURE_COPY: Record<string, string> = {
  expired: "The DigiLocker link expired before it was completed. Links are valid for 10 minutes.",
  consent_denied: "Consent was declined on the DigiLocker screen, so nothing was shared with us.",
  AADHAAR_NOT_LINKED:
    "Your Aadhaar is not linked in DigiLocker yet. Sign in to DigiLocker, link your Aadhaar, then try again.",
  failed: "We could not read your documents from DigiLocker.",
  duplicate_identity:
    "This identity is already registered to another Coreframe account. We allow one account per person.",
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-lg rounded-[1.8rem] border border-white/12 bg-white/6 p-6 backdrop-blur-2xl md:p-8">
      {children}
    </div>
  );
}

function Header({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-white">{title}</p>
        {sub && <p className="mt-1 text-sm text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

export default function VerifyFlow({ resume = false }: { resume?: boolean }) {
  const [phase, setPhase] = useState<Phase>("loading");
  // The name as verified by THIS run, taken from the completion response.
  // `status.verified_name` is fetched when the page loads — before verification
  // has happened — so reading the confirmed name from it shows whatever was on
  // the account beforehand, which is either nothing or a previous attempt.
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [gstin, setGstin] = useState("");
  const [gstinBusy, setGstinBusy] = useState(false);
  const [business, setBusiness] = useState<BusinessState | null>(null);
  const [bank, setBank] = useState<{ upi_link?: string; qr?: string; expected?: string } | null>(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneBusy, setPhoneBusy] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [passportOpen, setPassportOpen] = useState(false);
  // Stored bare and uppercase; shown grouped in fives. Keeping the raw value
  // in state and formatting for display means the submit path never has to
  // guess what the separators meant.
  const [passportFile, setPassportFile] = useState("");
  const [passportDob, setPassportDob] = useState("");
  const [passportBusy, setPassportBusy] = useState(false);
  const [passportError, setPassportError] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [legalName, setLegalName] = useState("");
  const [legalNameBusy, setLegalNameBusy] = useState(false);
  const [legalNameError, setLegalNameError] = useState("");
  const [bankBusy, setBankBusy] = useState(false);
  const [bankHint, setBankHint] = useState("");
  const passportFileLength = passportFile.replace(/[^A-Z0-9]/g, "").length;
  const passportFileGrouped =
    passportFile.replace(/[^A-Z0-9]/g, "").match(/.{1,5}/g)?.join(" ") ?? "";

  const pollStarted = useRef<number>(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const token = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("cf_customer_token");
  }, []);

  const authHeaders = useCallback((): HeadersInit => {
    return { "Content-Type": "application/json", Authorization: `Bearer ${token()}` };
  }, [token]);

  // ── initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token()) {
      window.location.href = "/login?next=/verify";
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API}/verification/status`, { headers: authHeaders() });
        if (res.status === 401) {
          window.location.href = "/login?next=/verify";
          return;
        }
        const data: VerificationStatus = await res.json();
        if (!res.ok) throw new Error("Could not load your verification status.");
        setStatus(data);

        const needsGstin =
          data.customer_type === "b2b" && !data.business?.business_verified;

        if (data.identity_verified || data.kyc_status === "verified") {
          // Identity is done — which is NOT the same as the account being
          // usable. A verified identity with a poor name match is held for a
          // human to look at, and this branch used to jump straight to
          // "approved" on that basis alone, so a held account was told "your
          // account is active" every time it opened this page.
          //
          // A business additionally has to prove the ENTITY before either.
          setPhase(
            needsGstin ? "gstin" : data.account_active ? "approved" : "review",
          );
        } else if (resume) {
          setPhase("polling");
        } else if (needsGstin) {
          // GSTIN first: it is instant and free of a browser round trip, so a
          // wrong GSTIN is caught before we spend a DigiLocker verification.
          setPhase("gstin");
        } else {
          setPhase("intro");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setPhase("error");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── polling after the DigiLocker round trip ───────────────────────────────
  useEffect(() => {
    if (phase !== "polling") return;
    if (!pollStarted.current) pollStarted.current = Date.now();

    async function poll() {
      try {
        const res = await fetch(`${API}/verification/digilocker/complete`, {
          method: "POST",
          headers: authHeaders(),
        });
        const data = await res.json();

        if (res.status === 401) {
          window.location.href = "/login?next=/verify";
          return;
        }
        if (!res.ok) {
          // 502/503 = provider hiccup; keep trying until the timeout.
          if (res.status >= 500) return schedule();
          throw new Error(data.detail ?? "Verification failed.");
        }

        if (data.verified) {
          // The token we used to get here is verification-scoped and works
          // nowhere else. When verification activates the account the API
          // returns a full one — swap it in so the customer is simply logged
          // in, rather than bounced back to the login page.
          if (data.access_token) {
            localStorage.setItem("cf_customer_token", data.access_token);
            if (data.user) localStorage.setItem("cf_customer_user", JSON.stringify(data.user));
          }
          // `account_active` is the authority — it is the server saying the
          // account is usable. The old test was
          // `auto_approved || !awaiting_review`, and when the API omitted
          // `awaiting_review` that read as `!undefined` === true, so a held
          // account was shown "your account is active" and then bounced back
          // here from every page. Never infer success from a missing field.
          setVerifiedName(data.verified_name ?? null);
          setPhase(data.account_active ? "approved" : "review");
          return;
        }
        // Terminal and NOT retryable — a retry button here would invite the
        // customer to burn attempts on something that can never succeed.
        if (data.kyc_status === "duplicate_identity") {
          setReason(FAILURE_COPY.duplicate_identity);
          setPhase("duplicate");
          return;
        }
        if (data.retry_required || ["expired", "consent_denied", "failed"].includes(data.kyc_status)) {
          setReason(FAILURE_COPY[data.reason] ?? FAILURE_COPY[data.kyc_status] ?? "Verification did not complete.");
          setPhase("failed");
          return;
        }
        if (Date.now() - pollStarted.current > POLL_TIMEOUT_MS) {
          setReason("We did not hear back from DigiLocker in time.");
          setPhase("failed");
          return;
        }
        schedule();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setPhase("error");
      }
    }

    function schedule() {
      timer.current = setTimeout(poll, POLL_MS);
    }

    poll();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Google OAuth creates accounts with no phone number — it is the third signup
  // door and carries most of the signups, so most people arriving here have
  // never been asked for one. Verification cannot start without it.
  async function submitPhone(e: React.FormEvent) {
    e.preventDefault();
    setPhoneError("");
    const value = phoneInput.trim();
    // Shape only; the server normalises to E.164 and decides. Same rule as the
    // signup form: 10 digits starting 6-9, however it is spaced.
    if (!/^(?:0091|91)?0?[6-9]\d{9}$/.test(value.replace(/\D/g, ""))) {
      return setPhoneError("Enter a 10-digit Indian mobile number (starting 6, 7, 8 or 9).");
    }
    setPhoneBusy(true);
    try {
      const res = await fetch(`${API}/verification/phone`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ phone_number: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? `Error ${res.status}`);
      setStatus(data);
    } catch (err: unknown) {
      setPhoneError(err instanceof Error ? err.message : "Could not save that number. Try again.");
    } finally {
      setPhoneBusy(false);
    }
  }

  async function submitPassport(e: React.FormEvent) {
    e.preventDefault();
    setPassportError("");
    const file = passportFile.trim().toUpperCase();
    const dob = passportDob.trim();
    // FIFTEEN, EXACTLY AS PRINTED. Proved against production with a real file
    // number, which returned VALID with the holder's name and date of birth.
    // Nothing is added to it - an earlier version prefixed "PA1" on a
    // misreading of the vendor's example, which made 18 and was refused.
    const bare = file.replace(/[^A-Z0-9]/g, "");
    if (bare.length !== 15) {
      return setPassportError(
        bare.length === 8
          ? "That is the passport number from the front page. This check needs " +
            "the \"File No.\" printed on the last page — 15 characters."
          : `That is ${bare.length} character${bare.length === 1 ? "" : "s"}. ` +
            "The \"File No.\" on the last page of your passport is 15 — two " +
            "letters then digits."
      );
    }
    setPassportBusy(true);
    try {
      const res = await fetch(`${API}/verification/passport`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ file_number: bare, dob }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? `Error ${res.status}`);
      setStatus(data);
      if (data.verified) {
        setPhase(data.account_active ? "approved" : "review");
      } else {
        // A wrong file number is not a failed verification in the DigiLocker
        // sense - there is no consent to redo and no link to expire. Keep them
        // on this form with the reason, rather than throwing them to the
        // generic failure screen which would offer "try again with DigiLocker".
        setPassportError(data.reason ?? "Those details did not match a record.");
      }
    } catch (err: unknown) {
      setPassportError(err instanceof Error ? err.message : "Could not check that. Try again.");
    } finally {
      setPassportBusy(false);
    }
  }

  // ── the mobile-code step ──────────────────────────────────────────────────
  //
  // Both calls are authenticated with the bearer token this page already holds.
  // The older /auth/request-mobile-otp takes a bare user_id and no token at
  // all, which is fine for a signup that has not issued one yet and would be a
  // needless widening of that surface here.

  async function sendOtpCode() {
    setOtpError("");
    setOtpBusy(true);
    try {
      const res = await fetch(`${API}/verification/mobile-otp/send`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      // A 503 here is the server saying it could not DELIVER, which is a real
      // answer and must be shown as one. The path this replaces returned 200
      // and an expiry for a code that was never sent.
      if (!res.ok) throw new Error(data.detail ?? `Error ${res.status}`);
      setOtpSent(true);
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : "Could not send the code. Try again.");
    } finally {
      setOtpBusy(false);
    }
  }

  async function submitOtpCode(e: React.FormEvent) {
    e.preventDefault();
    setOtpError("");
    const value = otpCode.replace(/\D/g, "");
    if (value.length !== 6) return setOtpError("Enter the 6-digit code.");

    setOtpBusy(true);
    try {
      const res = await fetch(`${API}/verification/mobile-otp/verify`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ code: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? `Error ${res.status}`);
      setStatus(data);
      setOtpCode("");
      setOtpSent(false);
      // Verifying the number can be the last hold on the account, in which case
      // reconsider_auto_approval has already activated it inside that request.
      if (data.account_active) setPhase("approved");
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : "That code did not work.");
    } finally {
      setOtpBusy(false);
    }
  }

  async function submitLegalName(e: React.FormEvent) {
    e.preventDefault();
    setLegalNameError("");
    const value = legalName.trim();
    if (value.length < 2) return setLegalNameError("Enter your full name as printed on your Aadhaar.");

    setLegalNameBusy(true);
    try {
      const res = await fetch(`${API}/verification/legal-name`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ full_name: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? `Error ${res.status}`);
      setStatus(data);
      // Matching the name clears this hold; it does not necessarily clear the
      // others. An account held for a second reason stays on this screen, now
      // correctly saying there is nothing further for them to do.
      setPhase(data.account_active ? "approved" : "review");
    } catch (err: unknown) {
      setLegalNameError(err instanceof Error ? err.message : "Could not update the name. Try again.");
      // Re-read the status so the tries-left line and the out-of-tries card are
      // right without a reload. A rejected attempt still spends one, and a page
      // that keeps saying "3 tries" while the server counts down is how #113
      // ran out without noticing.
      try {
        const again = await fetch(`${API}/verification/status`, { headers: authHeaders() });
        if (again.ok) setStatus(await again.json());
      } catch { /* the error above is the one that matters */ }
    } finally {
      setLegalNameBusy(false);
    }
  }

  async function submitGstin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const value = gstin.trim().toUpperCase();
    if (value.length !== 15) {
      setError("A GSTIN is 15 characters — 2-digit state code, PAN, then 3 more.");
      return;
    }
    setGstinBusy(true);
    try {
      const res = await fetch(`${API}/verification/gstin`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ gstin: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Could not verify that GSTIN.");

      if (!data.verified) {
        setError(
          data.gstin_status === "not_found"
            ? "That GSTIN is not on the GST register. Check it against your GST certificate."
            : data.reason || "That GST registration is not active."
        );
        return;
      }

      if (data.access_token) {
        localStorage.setItem("cf_customer_token", data.access_token);
        if (data.user) localStorage.setItem("cf_customer_user", JSON.stringify(data.user));
      }
      setBusiness({
        business_verified: true,
        gstin: value,
        gstin_status: data.gstin_status,
        legal_name: data.legal_name,
        trade_name: data.trade_name,
        constitution: data.constitution,
        registered_state: data.registered_state,
        failure_reason: null,
      });
      // GST done. Bank control is next for a business, then identity.
      if (status?.business?.bank?.required && !status?.business?.bank?.verified) {
        setPhase("bank");
      } else if (status?.identity_verified || status?.kyc_status === "verified") {
        setPhase(data.account_active ? "approved" : "review");
      } else {
        setPhase("intro");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not verify that GSTIN.");
    } finally {
      setGstinBusy(false);
    }
  }

  async function startBankCheck() {
    setError("");
    setBankBusy(true);
    try {
      const res = await fetch(`${API}/verification/bank/start`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Could not start the bank check.");
      setBank({ upi_link: data.upi_link, qr: data.qr_code_base64, expected: data.expected_name });
      setBankHint("Send the ₹1 from your company account, then press Check payment.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not start the bank check.");
    } finally {
      setBankBusy(false);
    }
  }

  async function checkBankPayment() {
    setError("");
    setBankBusy(true);
    try {
      const res = await fetch(`${API}/verification/bank/complete`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Could not check the payment.");

      if (data.verified) {
        if (data.access_token) {
          localStorage.setItem("cf_customer_token", data.access_token);
          if (data.user) localStorage.setItem("cf_customer_user", JSON.stringify(data.user));
        }
        if (status?.identity_verified || status?.kyc_status === "verified") {
          setPhase(data.account_active ? "approved" : "review");
        } else {
          setPhase("intro");
        }
        return;
      }
      if (data.pending) {
        setBankHint("No payment received yet. Complete the ₹1 UPI payment, then check again.");
        return;
      }
      setBankHint("");
      setError(data.reason || "That attempt did not complete. Start a new one.");
      setBank(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not check the payment.");
    } finally {
      setBankBusy(false);
    }
  }

  // ── start ─────────────────────────────────────────────────────────────────
  async function startVerification(userFlow: "signup" | "signin") {
    setError("");
    setPhase("redirecting");
    try {
      const res = await fetch(`${API}/verification/digilocker/start?user_flow=${userFlow}`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Could not start verification.");
      if (data.already_verified) {
        // Already verified is not the same as already approved.
        setPhase(data.account_active ? "approved" : "review");
        return;
      }
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not start verification.");
      setPhase("intro");
    }
  }

  // ── render ────────────────────────────────────────────────────────────────

  if (phase === "loading") {
    return (
      <Card>
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading your account…</span>
        </div>
      </Card>
    );
  }

  if (phase === "approved") {
    return (
      <Card>
        <Header
          icon={<CheckCircle2 className="h-5 w-5" />}
          title="You're verified"
          sub={
            (verifiedName ?? status?.verified_name)
              ? `Identity confirmed as ${verifiedName ?? status?.verified_name}. Your account is active.`
              : "Your identity has been confirmed and your account is active."
          }
        />
        <div className="grid gap-3">
          {/* Hard navigation, not a client-side Link. The token was swapped for
              a full one moments ago; a soft transition can carry stale auth
              state into /my-activity, which then 403s and bounces the customer
              straight back here — the loop reported after the first live run. */}
          <Button asChild className="h-auto min-h-12 w-full whitespace-normal rounded-xl bg-cyan-400 px-3 py-2 text-center text-base font-semibold leading-tight text-slate-900 shadow-[0_6px_24px_-6px_rgba(34,211,238,.55)] transition hover:bg-cyan-300 disabled:opacity-60">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages --
                a full page load is the point. The verification-scoped token was
                swapped for a full one moments ago; a client-side <Link/> keeps
                the running JS context, which can carry the old token into
                /my-activity, get a 403 and bounce the customer back here. */}
            <a href="/my-activity">
              <ArrowRight className="mr-2 h-4 w-4" />
              Go to my account
            </a>
          </Button>
          {/* Connect HAS been handed out since 0.3.0 shipped. This line still
              said it had not, and it is the LAST thing a newly verified
              customer reads. User 86 got to this screen, read "we will email
              you as soon as your workstation is ready", and reported that he
              could not proceed — which was accurate: the screen told him to
              stop and wait for an email that was never going to be sent.

              /my-activity has carried the same download permanently and
              unconditionally the whole time. That does not help someone who
              has just been told not to bother looking. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages --
              same reason as the button above: /download reads the bearer token
              out of localStorage when it mounts, and a client-side transition
              can carry the pre-swap verification token into it. */}
          <a
            href="/download"
            className="text-center text-sm font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Download Coreframe Connect →
          </a>
          <p className="text-center text-xs text-slate-500">
            Install it and sign in with the same email you used here.
          </p>
        </div>
      </Card>
    );
  }

  if (phase === "review") {
    // The one hold the customer can clear themselves. Everything else here —
    // age, a duplicate identity, a business check — is genuinely ours to
    // decide, and telling them to wait is the honest answer. A name mismatch
    // is not: their studio name is sitting in the field that has to hold their
    // legal name, and only they can say what that is. Telling them to wait was
    // how #55 sat untouched from the 4th of September.
    // Checked BEFORE the name branch. Both are holds the customer can clear,
    // but this one is thirty mechanical seconds, and clearing it re-renders
    // straight into the name step if that is also outstanding.
    if (status?.needs_mobile_otp) {
      return (
        <Card>
          <Header
            icon={<Fingerprint className="h-5 w-5" />}
            title="One step left — confirm your mobile"
            sub="Your identity checked out. We just need a contact number you have confirmed, which Indian regulations require us to hold."
          />

          <p className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
            Your Aadhaar record did not include a mobile number, so we could not
            take one from DigiLocker. Confirming the number on your account
            takes a few seconds.
          </p>

          {!otpSent ? (
            <div className="grid gap-3">
              <p className="text-sm text-slate-300">
                We will send a 6-digit code on{" "}
                <b className="text-white">WhatsApp</b>
                {status.phone_masked ? (
                  <> to <b className="text-white">{status.phone_masked}</b></>
                ) : null}
                .
              </p>
              <p className="text-[11px] leading-4 text-slate-500">
                It arrives on WhatsApp, not as an SMS — check WhatsApp, not your
                messages app.
              </p>
              {otpError && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {otpError}
                </p>
              )}
              <Button
                onClick={sendOtpCode}
                disabled={otpBusy}
                className="h-auto min-h-12 w-full whitespace-normal rounded-xl bg-cyan-400 px-3 py-2 text-center text-base font-semibold leading-tight text-slate-900 shadow-[0_6px_24px_-6px_rgba(34,211,238,.55)] transition hover:bg-cyan-300 disabled:opacity-60"
              >
                {otpBusy ? "Sending…" : "Send me the code"}
              </Button>
            </div>
          ) : (
            <form onSubmit={submitOtpCode} className="grid gap-3">
              <label className="text-xs text-slate-400">
                Enter the 6-digit code we sent on WhatsApp
              </label>
              <input
                value={otpCode}
                onChange={(e) => { setOtpCode(e.target.value); setOtpError(""); }}
                className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-center text-lg tracking-[0.4em] text-white placeholder:tracking-normal placeholder:text-slate-500"
                placeholder="123456"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                autoFocus
              />
              {otpError && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {otpError}
                </p>
              )}
              <button
                type="submit"
                disabled={otpBusy}
                className="h-auto min-h-12 w-full whitespace-normal rounded-xl bg-cyan-400 px-3 py-2 text-center text-base font-semibold leading-tight text-slate-900 shadow-[0_6px_24px_-6px_rgba(34,211,238,.55)] transition hover:bg-cyan-300 disabled:opacity-60"
              >
                {otpBusy ? "Checking…" : "Confirm my number"}
              </button>
              <button
                type="button"
                onClick={() => { setOtpSent(false); setOtpCode(""); setOtpError(""); }}
                className="text-center text-sm text-slate-400 hover:text-slate-200"
              >
                Didn&apos;t get it? Send another code
              </button>
            </form>
          )}

          <div className="mt-5 text-sm text-slate-500">
            No WhatsApp on that number?{" "}
            <Link href="/contact" className="text-cyan-400 hover:underline">
              Tell us
            </Link>{" "}
            and we will verify you by hand.
          </div>
        </Card>
      );
    }

    if (status?.can_correct_legal_name) {
      const triesLeft = status.legal_name_attempts_remaining;

      // OUT OF TRIES IS ITS OWN SCREEN, not the same form with a refusal on it.
      //
      // Account #113 spent all three attempts here on 20 Sep, was never told
      // there were three, and signed up again four minutes later under another
      // name — which then failed on duplicate identity. Two accounts in the
      // queue, one real customer, and an ad spend to get him there. A form that
      // cannot succeed must stop pretending it can, and must hand over a route
      // that works.
      if (triesLeft === 0) {
        return (
          <Card>
            <Header
              icon={<Clock className="h-5 w-5" />}
              title="Let us sort this one out for you"
              sub="Your Aadhaar was verified. The name on the account still does not match the document, and you have used today's attempts."
            />
            <p className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Email <b>support@coreframecloud.com</b> from this address and a
              person will correct it for you, usually the same day. Please do
              not create a second account — a second signup on the same Aadhaar
              is refused automatically and slows this down.
            </p>
            <p className="text-sm text-slate-400">
              You can also try again yourself tomorrow, when today&apos;s attempts reset.
            </p>
            <div className="mt-5 text-sm text-slate-500">
              <Link href="/contact" className="text-cyan-400 hover:underline">Contact us</Link>
            </div>
          </Card>
        );
      }

      return (
        <Card>
          <Header
            icon={<Clock className="h-5 w-5" />}
            title="One thing does not match"
            sub="Your Aadhaar was verified. The name on your account is not the name on the document, so we cannot activate it yet."
          />
          {/* THEIR OWN NAME, BACK AT THEM. "The name on your account does not
              match" is abstract, and #113 read it three times without acting on
              it. Seeing "Ai Upscale" in the sentence makes the mistake obvious,
              because the customer knows perfectly well that is not their name.
              The document name is never shown — the API withholds it while a
              mismatch is open, so this cannot become a copy-paste. */}
          {status.account_name ? (
            <p className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              You signed up as <b className="text-white">{status.account_name}</b>. That
              needs to be your name as printed on your Aadhaar — you can keep{" "}
              <b className="text-white">{status.account_name}</b> as your display name afterwards.
            </p>
          ) : null}
          <form onSubmit={submitLegalName} className="grid gap-3">
            <label className="text-xs text-slate-400">Your full name, exactly as on your Aadhaar</label>
            <input
              value={legalName}
              onChange={(e) => { setLegalName(e.target.value); setLegalNameError(""); }}
              className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-slate-500"
              placeholder="Rahul Kumar Sharma"
              autoComplete="name"
              autoFocus
            />
            <p className="text-[11px] leading-4 text-slate-500">
              Include every part of it — a middle name or father&apos;s name if your Aadhaar has one.
              If you signed up with a studio or brand name, that is almost certainly what happened;
              you can still use it as your display name afterwards.
            </p>
            {legalNameError && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {legalNameError}
              </p>
            )}
            <button
              type="submit"
              disabled={legalNameBusy}
              className="h-auto min-h-12 w-full whitespace-normal rounded-xl bg-cyan-400 px-3 py-2 text-center text-base font-semibold leading-tight text-slate-900 shadow-[0_6px_24px_-6px_rgba(34,211,238,.55)] transition hover:bg-cyan-300 disabled:opacity-60"
            >
              {legalNameBusy ? "Checking…" : "Check and continue"}
            </button>
            {typeof triesLeft === "number" ? (
              <p className="text-center text-[11px] text-slate-500">
                {triesLeft === 1
                  ? "This is your last try today — after that we will fix it for you by email."
                  : `You have ${triesLeft} tries today.`}
              </p>
            ) : null}
          </form>
          <div className="mt-5 text-sm text-slate-500">
            Not sure? <Link href="/contact" className="text-cyan-400 hover:underline">Contact us</Link>
          </div>
        </Card>
      );
    }

    return (
      <Card>
        <Header
          icon={<Clock className="h-5 w-5" />}
          title="Verification received — under review"
          sub="Your documents came through. Something on the account needs a quick look from our team, so activation is not automatic in this case."
        />
        <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          We usually complete this within one business day. You will get an email as soon as your
          account is active — there is nothing else for you to do.
        </p>
        <div className="mt-5 text-sm text-slate-500">
          Questions? <Link href="/contact" className="text-cyan-400 hover:underline">Contact us</Link>
        </div>
      </Card>
    );
  }

  if (phase === "failed") {
    const outOfAttempts = !!status && status.max_attempts > 0 && status.attempts >= status.max_attempts;
    // Rounded UP and floored at 1: "try again in 0 minutes" is worse than
    // saying nothing, and a customer who reads "1 minute" and comes back at 61
    // seconds should succeed rather than be refused again.
    // Append Z when the API sends a zone-less timestamp. FastAPI serialises
    // naive UTC datetimes without an offset, and JavaScript parses a zone-less
    // string as LOCAL time — in IST that puts the retry 5h30m in the past, so
    // this would always render "1 minute" and refuse the customer who believed
    // it. Same bug that made every node heartbeat read "5h ago" in the admin
    // panel, which is why that file has a utcDate() helper.
    const retryRaw = status?.retry_available_at ?? null;
    const retryAt = retryRaw
      ? new Date(/(?:Z|[+-]\d{2}:?\d{2})$/.test(retryRaw) ? retryRaw : `${retryRaw}Z`)
      : null;
    const retryMinutes = retryAt && !Number.isNaN(retryAt.getTime())
      ? Math.max(1, Math.ceil((retryAt.getTime() - Date.now()) / 60000))
      : null;
    return (
      <Card>
        <Header icon={<XCircle className="h-5 w-5" />} title="Verification did not complete" sub={reason} />
        {outOfAttempts ? (
          // Attempts clear themselves after a cooldown, so telling everyone to
          // contact us spends exactly the support round trip the auto-reset was
          // written to save. Say when instead — and only fall back to asking
          // them to write in when the API says it will NOT clear.
          retryMinutes !== null ? (
            <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              You have used all the attempts we allow in one go. You can try again in about{" "}
              {retryMinutes} minute{retryMinutes === 1 ? "" : "s"} — nothing is wrong with your
              account and there is no need to contact us. Most of the time this just means the
              DigiLocker link expired before it was opened; it is only valid for 10 minutes.
            </p>
          ) : (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              You have used all available attempts. Please{" "}
              <Link href="/contact" className="underline">contact us</Link> and we will reset it for you.
            </p>
          )
        ) : (
          <Button
            onClick={() => startVerification("signin")}
            className="h-auto min-h-12 w-full whitespace-normal rounded-xl bg-cyan-400 px-3 py-2 text-center text-base font-semibold leading-tight text-slate-900 shadow-[0_6px_24px_-6px_rgba(34,211,238,.55)] transition hover:bg-cyan-300 disabled:opacity-60"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        )}
      </Card>
    );
  }

  if (phase === "duplicate") {
    return (
      <Card>
        <Header
          icon={<XCircle className="h-5 w-5" />}
          title="This identity is already registered"
          sub={reason}
        />
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Coreframe allows one account per person. Sign in to your existing
          account instead — or if you have lost access to it,{" "}
          <Link href="/contact" className="underline">contact us</Link> and we
          will help you recover it.
        </p>
        <Button asChild className="mt-4 h-12 w-full rounded-xl bg-cyan-400 text-base font-semibold text-slate-900 shadow-[0_6px_24px_-6px_rgba(34,211,238,.55)] transition hover:bg-cyan-300 disabled:opacity-60">
          <Link href="/login">Sign in to my account</Link>
        </Button>
      </Card>
    );
  }

  if (phase === "error") {
    return (
      <Card>
        <Header icon={<XCircle className="h-5 w-5" />} title="Something went wrong" sub={error} />
        <Button onClick={() => window.location.reload()} className="h-auto min-h-12 w-full whitespace-normal rounded-xl bg-cyan-400 px-3 py-2 text-center text-base font-semibold leading-tight text-slate-900 shadow-[0_6px_24px_-6px_rgba(34,211,238,.55)] transition hover:bg-cyan-300 disabled:opacity-60">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reload
        </Button>
      </Card>
    );
  }

  if (phase === "gstin") {
    return (
      <Card>
        <Header
          icon={<Building2 className="h-5 w-5" />}
          title="Verify your business"
          sub="We check your GSTIN against the GST register. Instant, and it sets your place of supply for invoices."
        />

        {business?.business_verified && (
          <div className="mb-5 rounded-xl border border-green-500/25 bg-green-500/10 px-4 py-3 text-sm text-green-200">
            <b>{business.legal_name || business.trade_name}</b> confirmed
            {business.constitution ? ` · ${business.constitution}` : ""}
            {business.registered_state ? ` · ${business.registered_state}` : ""}
          </div>
        )}

        <form onSubmit={submitGstin} className="grid gap-4">
          <div className="grid gap-1.5">
            <label className="text-xs text-slate-400">GSTIN</label>
            <input
              value={gstin}
              onChange={(e) => { setGstin(e.target.value.toUpperCase()); setError(""); }}
              maxLength={15}
              placeholder="29AAICP2912R1ZR"
              className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 font-mono tracking-widest text-white placeholder:text-slate-600 focus:border-cyan-400/50 focus:outline-none"
              required
            />
            <p className="text-xs text-slate-500">
              15 characters, exactly as printed on your GST certificate.
            </p>
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <Button type="submit" disabled={gstinBusy} className="h-auto min-h-12 w-full whitespace-normal rounded-xl bg-cyan-400 px-3 py-2 text-center text-base font-semibold leading-tight text-slate-900 shadow-[0_6px_24px_-6px_rgba(34,211,238,.55)] transition hover:bg-cyan-300 disabled:opacity-60">
            {gstinBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
            {gstinBusy ? "Checking the GST register…" : "Verify GSTIN"}
          </Button>
        </form>

        <p className="mt-5 text-xs text-slate-500">
          A business account needs two things: this, which proves the company is
          real and GST-active, and a DigiLocker check on you as the signatory,
          which proves a real person is accountable for the account. You will do
          that next.
        </p>
      </Card>
    );
  }

  if (phase === "bank") {
    return (
      <Card>
        <Header
          icon={<Landmark className="h-5 w-5" />}
          title="Confirm your company bank account"
          sub="Send ₹1 by UPI from the company's account. We refund it within 48 hours."
        />

        <p className="mb-5 text-sm text-slate-400">
          A GSTIN is printed on every invoice your company issues, so quoting one
          proves very little. Sending money from the account proves you actually
          control it — which is the point of this step.
        </p>

        {!bank ? (
          <Button
            onClick={startBankCheck}
            disabled={bankBusy}
            className="h-auto min-h-12 w-full whitespace-normal rounded-xl bg-cyan-400 px-3 py-2 text-center text-base font-semibold leading-tight text-slate-900 shadow-[0_6px_24px_-6px_rgba(34,211,238,.55)] transition hover:bg-cyan-300 disabled:opacity-60"
          >
            {bankBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
            {bankBusy ? "Preparing…" : "Start bank verification"}
          </Button>
        ) : (
          <div className="grid gap-4">
            {bank.qr && (
              <div className="flex justify-center rounded-xl border border-white/10 bg-white p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${bank.qr}`}
                  alt="UPI QR code for the ₹1 verification payment"
                  className="h-48 w-48"
                />
              </div>
            )}

            {bank.upi_link && (
              <a
                href={bank.upi_link}
                className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-center text-sm font-medium text-cyan-200 hover:bg-cyan-400/15"
              >
                Open a UPI app on this device →
              </a>
            )}

            <p className="text-xs text-slate-500">
              Pay from the account held by{" "}
              <b className="text-slate-300">{bank.expected || "your company"}</b>.
              A personal account will not match and the check will be held for review.
              The link expires in 10 minutes.
            </p>

            {bankHint && (
              <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                {bankHint}
              </p>
            )}

            <Button
              onClick={checkBankPayment}
              disabled={bankBusy}
              className="h-auto min-h-12 w-full whitespace-normal rounded-xl bg-cyan-400 px-3 py-2 text-center text-base font-semibold leading-tight text-slate-900 shadow-[0_6px_24px_-6px_rgba(34,211,238,.55)] transition hover:bg-cyan-300 disabled:opacity-60"
            >
              {bankBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              {bankBusy ? "Checking…" : "Check payment"}
            </Button>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}
      </Card>
    );
  }

  if (phase === "redirecting" || phase === "polling") {
    return (
      <Card>
        <Header
          icon={<Loader2 className="h-5 w-5 animate-spin" />}
          title={phase === "redirecting" ? "Opening DigiLocker…" : "Confirming with DigiLocker…"}
          sub={
            phase === "redirecting"
              ? "You will be taken to the official DigiLocker page to approve sharing your documents."
              : "This usually takes a few seconds. Please keep this page open."
          }
        />
      </Card>
    );
  }

  // ── intro ─────────────────────────────────────────────────────────────────
  const otpOutstanding = !!status?.mobile_otp_required && !status?.mobile_verified;

  return (
    <Card>
      <Header
        icon={<Fingerprint className="h-5 w-5" />}
        title="Verify your identity"
        sub="A one-time check before your account is activated. It takes about a minute."
      />

      {/* THE BULLETS FOLLOW THE ROUTE THE CUSTOMER IS ON.
          They were written when DigiLocker was the only way through, and they
          stayed fixed at the top of the card — so somebody who had chosen the
          passport was reading "you will be taken to DigiLocker to approve
          sharing your Aadhaar and PAN" above a passport form. The passport
          route touches no DigiLocker account and no Aadhaar at all; telling a
          customer we are about to handle their Aadhaar when we are not is a
          promise about their data that the code does not keep, and it is the
          kind of sentence a DPDP reviewer reads literally. */}
      <ul className="mb-6 grid gap-3 text-sm text-slate-300">
        {passportOpen ? (
          <>
            <li className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
              <span>
                We check the <b className="text-white">&ldquo;File No.&rdquo;</b> from the last page of your
                passport — 15 characters — and your date of birth, against the
                Indian passport record.
              </span>
            </li>
            <li className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
              <span>
                We keep your verified name and date of birth. No Aadhaar and no
                address are involved on this route.
              </span>
            </li>
          </>
        ) : (
          <>
            <li className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
              <span>
                You confirm your identity against an official government record —
                <b className="text-white"> DigiLocker</b> or your{" "}
                <b className="text-white">Indian passport</b>. Either one is enough.
              </span>
            </li>
            <li className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
              <span>
                We never see or store your full Aadhaar number. We keep only the
                last four digits, your verified name and address.
              </span>
            </li>
          </>
        )}
        <li className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
          <span>
            Indian law (CERT-In Direction 20(3)/2022) requires us to hold verified subscriber records
            for anyone renting compute infrastructure.
          </span>
        </li>
      </ul>

      {business?.business_verified && (
        <p className="mb-4 rounded-xl border border-green-500/25 bg-green-500/10 px-4 py-3 text-sm text-green-200">
          Business verified: <b>{business.legal_name || business.trade_name}</b>. One step left —
          confirm your own identity as the signatory.
        </p>
      )}

      {status?.failure_reason && (
        <p className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Your last attempt did not complete ({status.failure_reason}). You can try again below.
        </p>
      )}

      {/* No longer a demand for action. DigiLocker returns the Aadhaar-linked
          mobile — UIDAI has just OTP'd it — so in almost every case the contact
          number requirement is satisfied by the step the customer is about to
          take. Telling them to go and add one first was busywork. */}
      {otpOutstanding && !status?.has_phone_number && (
        <p className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          We will record the mobile number linked to your Aadhaar as your contact
          number — Indian regulations require us to hold a verified one.
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {status && !status.has_phone_number ? (
        <form onSubmit={submitPhone} className="grid gap-3">
          <label className="text-sm text-slate-300">
            First, your mobile number
          </label>
          <input
            value={phoneInput}
            onChange={(e) => { setPhoneInput(e.target.value); setPhoneError(""); }}
            className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-slate-500"
            placeholder="98765 43210"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            autoFocus
          />
          {/* SAY WHAT HAPPENS NEXT, because the old wording promised a code.
              It read "we send sign-in codes there", which alongside a button
              labelled "Save and continue" reads as "a code is on its way". It
              is not: the code is a later step, offered only after the identity
              check, and it only sends when the customer presses for it. One
              account holder waited for a WhatsApp that nothing was ever going
              to send - the OTP table shows no mobile code generated at all. */}
          {/* WHAT ACTUALLY HAPPENS, IN BOTH CASES.
              The previous wording promised a code after the identity check
              full stop, and for most people none ever came: DigiLocker returns
              the Aadhaar-linked mobile, which validated the number outright.
              It was ALSO wrong the other way - it used to validate even when
              the Aadhaar number and the typed number were different, so a
              number nobody had proved sat on the account for good. Both halves
              are fixed; this says which of the two will happen. */}
          <p className="text-[11px] leading-4 text-slate-500">
            You signed in with Google, so we have not asked for one yet. An
            Indian mobile number — it is how we reach you about your account.
            If it is the number linked to your Aadhaar, the identity check
            confirms it. If it is a different number, we will send a code to it
            afterwards. Either way, nothing arrives just yet.
          </p>
          {phoneError && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {phoneError}
            </p>
          )}
          <Button type="submit" disabled={phoneBusy} className="h-auto min-h-12 w-full whitespace-normal rounded-xl bg-cyan-400 px-3 py-2 text-center text-base font-semibold leading-tight text-slate-900 shadow-[0_6px_24px_-6px_rgba(34,211,238,.55)] transition hover:bg-cyan-300 disabled:opacity-60">
            {phoneBusy ? "Saving…" : "Save and continue"}
          </Button>
        </form>
      ) : passportOpen ? (
        /* The passport form takes the whole card once chosen — the same room
           DigiLocker gets, because it is the same kind of decision. */
        <form onSubmit={submitPassport} className="grid gap-3">
          <div className="flex items-center gap-2">
            <BookUser className="h-4 w-4 text-cyan-300" />
            <p className="text-sm font-semibold text-white">Verify with your passport</p>
          </div>
          {/* Said plainly and first. An overseas customer cannot be served
              by this at all - it queries the Indian passport record - and
              finding that out after typing everything in is worse than
              being told now. */}
          <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs leading-5 text-amber-200">
            Only <b>Indian passports</b> can be checked this way — the check
            queries the Indian passport record.
          </p>
          <label className="text-xs text-slate-400">
            File number{" "}
            <span className="text-slate-500">
              — the <b className="text-slate-400">&ldquo;File No.&rdquo;</b> printed on the last page of
              your passport, 15 characters: two letters then digits. Not the
              passport number on the front page.
            </span>
          </label>
          {/* UPPERCASED AS IT IS TYPED, not silently on submit.
              autoCapitalize is a soft-keyboard hint and does nothing on a
              desktop browser, so a file number typed in lower case sat there
              looking wrong while the request went up in caps. Now what is on
              screen is what is sent. */}
          {/* GROUPED IN FIVES AS IT IS TYPED, and counted.
              Fifteen unbroken characters cannot be checked against a document
              by eye - you lose your place, and the only feedback used to come
              after pressing the button and spending one of three attempts a
              day. Three groups of five read straight off the page, and the
              counter says how far along you are before you submit. */}
          <input
            value={passportFileGrouped}
            onChange={(e) => {
              const bare = e.target.value
                .replace(/[^A-Za-z0-9]/g, "")
                .toUpperCase()
                .slice(0, 15);
              setPassportFile(bare);
              setPassportError("");
            }}
            className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 font-mono text-lg tracking-widest text-white placeholder:font-sans placeholder:text-base placeholder:tracking-normal placeholder:text-slate-500"
            placeholder="XX123 45678 90123"
            inputMode="text"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
          />
          <p className="-mt-1 text-right text-[11px] tabular-nums text-slate-500">
            <span className={passportFileLength === 15 ? "text-cyan-300" : ""}>
              {passportFileLength}
            </span>
            {" / 15"}
          </p>
          <label className="text-xs text-slate-400">Date of birth, as on the passport</label>
          <input
            value={passportDob}
            onChange={(e) => { setPassportDob(e.target.value); setPassportError(""); }}
            className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-slate-500"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
          />
          {passportError && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {passportError}
            </p>
          )}
          <Button
            type="submit"
            disabled={passportBusy}
            className="h-auto min-h-12 w-full whitespace-normal rounded-xl bg-cyan-400 px-3 py-2 text-center text-base font-semibold leading-tight text-slate-900 shadow-[0_6px_24px_-6px_rgba(34,211,238,.55)] transition hover:bg-cyan-300 disabled:opacity-60"
          >
            {passportBusy ? "Checking…" : "Validate with my passport"}
          </Button>
          <p className="text-[11px] leading-4 text-slate-500">
            We check the name and date of birth against the passport record.
            You will still confirm your mobile number afterwards, which Indian
            regulations require us to hold.
          </p>
          <button
            type="button"
            onClick={() => setPassportOpen(false)}
            className="text-center text-sm text-slate-400 hover:text-slate-200"
          >
            ← Back to the other options
          </button>
        </form>
      ) : (
      <div className="grid gap-3">
        {/* TWO ROUTES, PRESENTED AS TWO ROUTES.
            The passport used to sit under a grey text link below the fold,
            which is the same mistake that buried "create a DigiLocker
            account": a customer who does not have the thing we are asking for
            reads the page as a dead end and leaves. 35 of 66 held accounts
            opened DigiLocker and never came back. Someone with a passport and
            no DigiLocker should see both doors at once, and neither should
            look like the consolation prize. */}
        <p className="text-sm text-slate-300">
          Choose whichever you already have. Both prove who you are; we only
          need one.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* ── DigiLocker ─────────────────────────────────────────────── */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Landmark className="h-4 w-4 shrink-0 text-cyan-300" />
              <p className="text-sm font-semibold text-white">DigiLocker</p>
            </div>
            <p className="mb-4 flex-1 text-xs leading-5 text-slate-400">
              The Government of India&apos;s own document service. You sign in
              there with the mobile linked to your Aadhaar and approve sharing
              — we never see your full Aadhaar number. Proves your name,
              address and contact number in one step.
            </p>
            <Button
              onClick={() => startVerification("signin")}
              className="h-auto min-h-12 w-full whitespace-normal rounded-xl bg-cyan-400 px-3 py-2 text-center text-base font-semibold leading-tight text-slate-900 shadow-[0_6px_24px_-6px_rgba(34,211,238,.55)] transition hover:bg-cyan-300 disabled:opacity-60"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Use DigiLocker
            </Button>
            {/* A REAL BUTTON, NOT A HINT. Creating an account happens inside
                the same flow, so this is an equal route rather than a
                consolation prize - and for most people it is the route they
                need. */}
            <Button
              variant="outline"
              onClick={() => startVerification("signup")}
              className="mt-2 h-auto min-h-11 w-full whitespace-normal rounded-xl border-white/20 bg-transparent px-3 py-2 text-center text-sm font-semibold leading-tight text-slate-100 transition hover:border-cyan-400/50 hover:bg-white/5"
            >
              Create a DigiLocker account
            </Button>
            <p className="mt-2 text-[11px] leading-4 text-slate-500">
              Creating one takes about two minutes and happens as part of this
              step. You will need your Aadhaar number and the mobile linked to
              it.
            </p>
          </div>

          {/* ── Passport ───────────────────────────────────────────────── */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <BookUser className="h-4 w-4 shrink-0 text-cyan-300" />
              <p className="text-sm font-semibold text-white">Indian passport</p>
            </div>
            <p className="mb-4 flex-1 text-xs leading-5 text-slate-400">
              No DigiLocker account needed. Enter the &ldquo;File No.&rdquo; from the last
              page of your passport — 15 characters — and your date of birth,
              and we check them against the passport record. We will ask you to
              confirm your mobile number with a code afterwards.
            </p>
            <Button
              onClick={() => setPassportOpen(true)}
              className="h-auto min-h-12 w-full whitespace-normal rounded-xl bg-cyan-400 px-3 py-2 text-center text-base font-semibold leading-tight text-slate-900 shadow-[0_6px_24px_-6px_rgba(34,211,238,.55)] transition hover:bg-cyan-300 disabled:opacity-60"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Validate with my passport
            </Button>
            <p className="mt-2 text-[11px] leading-4 text-slate-500">
              Indian passports only — the check queries the Indian passport
              record.
            </p>
          </div>
        </div>
      </div>
      )}

      <p className="mt-5 text-xs text-slate-500">
        Sharing is consent-based and compliant with the Digital Personal Data Protection Act, 2023.
        See our <Link href="/privacy-policy" className="text-cyan-400 hover:underline">privacy policy</Link>.
      </p>
    </Card>
  );
}
