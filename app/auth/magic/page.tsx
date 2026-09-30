"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Suspense } from "react";

const API = "https://control.coreframecloud.com/api";

function MagicLinkVerifier() {
  const params = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  // Fire EXACTLY once per token. useSearchParams() returns a fresh object on
  // some re-renders and React StrictMode invokes effects twice in development;
  // either one sends a second POST carrying a token the first call already
  // consumed. The server then answers "Invalid or already used sign-in link"
  // and that second response is what the user sees - even though their account
  // was created, they were signed in, and the welcome email is already on its
  // way. An error screen arriving just before the welcome email is the tell.
  const attempted = useRef<string | null>(null);

  useEffect(() => {
    const token = params.get("t");
    if (!token) {
      setErrorMsg("Missing sign-in token. Please request a new link.");
      setStatus("error");
      return;
    }
    if (attempted.current === token) return;
    attempted.current = token;

    fetch(`${API}/auth/verify-magic-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setErrorMsg(data.detail ?? "Invalid or expired link. Please request a new one.");
          setStatus("error");
          return;
        }
        localStorage.setItem("cf_customer_token", data.access_token);
        localStorage.setItem("cf_customer_user", JSON.stringify(data.user));
        setStatus("success");
        // An account still awaiting approval has identity verification left to
        // do — send it there rather than to a dashboard it cannot use.
        const next = data.user?.status === "pending_approval" ? "/verify" : "/my-activity";
        setTimeout(() => {
          window.location.href = next;
        }, 1200);
      })
      .catch(() => {
        setErrorMsg("Something went wrong. Please try again.");
        setStatus("error");
      });
  }, [params]);

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue/8 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm text-center">
        {/* Logo */}
        <a href="/" className="mb-10 inline-block text-2xl font-extrabold tracking-tight">
          <span className="text-ink">CORE</span>
          <span className="text-blue">FRAME</span>
        </a>

        <div className="rounded-cf border border-rule bg-paper-2 p-6 sm:p-8">
          {status === "loading" && (
            <>
              <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-blue" />
              <p className="font-semibold text-ink">Signing you in…</p>
              <p className="mt-1 text-sm text-ink-2">Verifying your sign-in link.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="mx-auto mb-4 h-10 w-10 text-blue" />
              <p className="font-semibold text-ink">You&apos;re in.</p>
              <p className="mt-1 text-sm text-ink-2">Taking you to your dashboard.</p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
              <p className="font-semibold text-ink">That link will not work.</p>
              <p className="mt-2 text-sm break-words text-ink-2">{errorMsg}</p>
              <a
                href="/login"
                className="cf-btn-primary mt-5 min-h-11 w-full sm:w-auto"
              >
                Request a new link
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue" />
        </div>
      }>
        <MagicLinkVerifier />
      </Suspense>
    </div>
  );
}
