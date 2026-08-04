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
  CheckCircle2,
  Clock,
  Fingerprint,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

const API = "https://control.coreframecloud.com/api";
const POLL_MS = 3000;
const POLL_TIMEOUT_MS = 3 * 60 * 1000;

interface VerificationStatus {
  kyc_required: boolean;
  kyc_status: string;
  identity_verified: boolean;
  mobile_otp_required: boolean;
  mobile_verified: boolean;
  email_verified: boolean;
  has_phone_number: boolean;
  attempts: number;
  max_attempts: number;
  failure_reason: string | null;
  verified_name: string | null;
}

type Phase = "loading" | "intro" | "redirecting" | "polling" | "approved" | "review" | "failed" | "error";

const FAILURE_COPY: Record<string, string> = {
  expired: "The DigiLocker link expired before it was completed. Links are valid for 10 minutes.",
  consent_denied: "Consent was declined on the DigiLocker screen, so nothing was shared with us.",
  AADHAAR_NOT_LINKED:
    "Your Aadhaar is not linked in DigiLocker yet. Sign in to DigiLocker, link your Aadhaar, then try again.",
  failed: "We could not read your documents from DigiLocker.",
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
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
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

        if (data.identity_verified || data.kyc_status === "verified") {
          setPhase("approved");
        } else if (resume) {
          setPhase("polling");
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
          setPhase(data.auto_approved || !data.awaiting_review ? "approved" : "review");
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
        setPhase("approved");
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
            status?.verified_name
              ? `Identity confirmed as ${status.verified_name}. Your account is active.`
              : "Your identity has been confirmed and your account is active."
          }
        />
        <div className="grid gap-3">
          <Button asChild className="h-12 rounded-xl text-base font-semibold">
            <Link href="/download">
              <ArrowRight className="mr-2 h-4 w-4" />
              Download Coreframe Connect
            </Link>
          </Button>
          <Link href="/my-activity" className="text-center text-sm text-cyan-400 hover:underline">
            Go to my account →
          </Link>
        </div>
      </Card>
    );
  }

  if (phase === "review") {
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
    return (
      <Card>
        <Header icon={<XCircle className="h-5 w-5" />} title="Verification did not complete" sub={reason} />
        {outOfAttempts ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            You have used all available attempts. Please{" "}
            <Link href="/contact" className="underline">contact us</Link> and we will reset it for you.
          </p>
        ) : (
          <Button
            onClick={() => startVerification("signin")}
            className="h-12 w-full rounded-xl text-base font-semibold"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        )}
      </Card>
    );
  }

  if (phase === "error") {
    return (
      <Card>
        <Header icon={<XCircle className="h-5 w-5" />} title="Something went wrong" sub={error} />
        <Button onClick={() => window.location.reload()} className="h-12 w-full rounded-xl">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reload
        </Button>
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

      <ul className="mb-6 grid gap-3 text-sm text-slate-300">
        <li className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
          <span>
            You will be taken to <b className="text-white">DigiLocker</b>, the Government of India&apos;s
            official document service, to approve sharing your Aadhaar and PAN.
          </span>
        </li>
        <li className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
          <span>
            We never see or store your full Aadhaar number. We keep only the last four digits, your
            verified name and address.
          </span>
        </li>
        <li className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
          <span>
            Indian law (CERT-In Direction 20(3)/2022) requires us to hold verified subscriber records
            for anyone renting compute infrastructure.
          </span>
        </li>
      </ul>

      {status?.failure_reason && (
        <p className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Your last attempt did not complete ({status.failure_reason}). You can try again below.
        </p>
      )}

      {otpOutstanding && (
        <p className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {status?.has_phone_number
            ? "You will also need to confirm your mobile number with an OTP before activation."
            : "Add a mobile number to your account before verifying — we need it for your subscriber record."}
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="grid gap-3">
        <Button
          onClick={() => startVerification("signin")}
          className="h-12 rounded-xl text-base font-semibold"
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Verify with DigiLocker
        </Button>
        <button
          type="button"
          onClick={() => startVerification("signup")}
          className="text-center text-sm text-slate-400 hover:text-slate-200"
        >
          I don&apos;t have a DigiLocker account yet →
        </button>
      </div>

      <p className="mt-5 text-xs text-slate-500">
        Sharing is consent-based and compliant with the Digital Personal Data Protection Act, 2023.
        See our <Link href="/privacy-policy" className="text-cyan-400 hover:underline">privacy policy</Link>.
      </p>
    </Card>
  );
}
