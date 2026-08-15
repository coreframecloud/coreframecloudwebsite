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
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/8 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm text-center">
        {/* Logo */}
        <a href="/" className="mb-10 inline-block text-2xl font-extrabold tracking-tight">
          <span className="text-white">CORE</span>
          <span className="text-cyan-400">FRAME</span>
        </a>

        <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          {status === "loading" && (
            <>
              <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-cyan-400" />
              <p className="font-semibold text-white">Signing you in…</p>
              <p className="mt-1 text-sm text-slate-400">Verifying your sign-in link.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="mx-auto mb-4 h-10 w-10 text-green-400" />
              <p className="font-semibold text-white">You're in!</p>
              <p className="mt-1 text-sm text-slate-400">Redirecting to your dashboard…</p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="mx-auto mb-4 h-10 w-10 text-red-400" />
              <p className="font-semibold text-white">Link invalid or expired</p>
              <p className="mt-2 text-sm text-slate-400">{errorMsg}</p>
              <a
                href="/login"
                className="mt-5 inline-block rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400"
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
    <div className="min-h-screen bg-[#080e1a] text-white">
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      }>
        <MagicLinkVerifier />
      </Suspense>
    </div>
  );
}
