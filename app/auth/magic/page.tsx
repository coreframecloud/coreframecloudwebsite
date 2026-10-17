"use client";

import { takeReturnPath } from "@/lib/return-path";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Suspense } from "react";
import { trackSignupIfNew } from "@/lib/analytics";
import { API_BASE } from "@/lib/api-base";
import { goAfterSignIn } from "@/lib/session-cookie";
import { SESSION_MODE_HEADERS, rememberUser } from "@/lib/session";

const API = API_BASE;

/**
 * The sign-in token arrives in the FRAGMENT, #t=... (security review
 * 17 Oct 2026): a fragment is never sent to a server, so it is not in Vercel's
 * or our access logs, nor in a Referer. Links emailed before that change carry
 * ?t=; both are read, once, and the URL is cleaned at once so the token does
 * not stay in the address bar or history, or reach an analytics tool.
 */
const noopSubscribe = () => () => {};

function takeLinkToken(): string | null {
  if (typeof window === "undefined") return null;
  const fromHash = new URLSearchParams(window.location.hash.slice(1)).get("t");
  const fromQuery = new URLSearchParams(window.location.search).get("t");
  const token = fromHash || fromQuery;
  if (token) {
    try {
      window.history.replaceState(null, "", "/auth/magic");
    } catch {
      /* the token is still read; only the cleanup failed */
    }
  }
  return token;
}

function MagicLinkVerifier() {
  // Read once, on the client, before anything else on the page runs.
  const [token] = useState<string | null>(() => takeLinkToken());
  // Rendered on the server without a token: decide only once in the browser.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [fetchStatus, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [fetchError, setErrorMsg] = useState("");
  const missing = mounted && !token;
  const status = missing ? "error" : fetchStatus;
  const errorMsg = missing ? "Missing sign-in token. Please request a new link." : fetchError;

  // Fire EXACTLY once per token. useSearchParams() returns a fresh object on
  // some re-renders and React StrictMode invokes effects twice in development;
  // either one sends a second POST carrying a token the first call already
  // consumed. The server then answers "Invalid or already used sign-in link"
  // and that second response is what the user sees - even though their account
  // was created, they were signed in, and the welcome email is already on its
  // way. An error screen arriving just before the welcome email is the tell.
  const attempted = useRef<string | null>(null);

  useEffect(() => {
    if (!token) return;
    if (attempted.current === token) return;
    attempted.current = token;

    fetch(`${API}/auth/verify-magic-link`, {
      method: "POST",
      // Keep the HttpOnly cf_session cookie this sets on control (the CFD job
      // page signs in with nothing else). Google sign-in also ends here.
      credentials: "include",
      headers: { "Content-Type": "application/json", ...SESSION_MODE_HEADERS },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setErrorMsg(data.detail ?? "Invalid or expired link. Please request a new one.");
          setStatus("error");
          return;
        }
        // The session is the HttpOnly cookie the API just set; the response
        // carries no token (lib/session.ts). Only the user record is kept.
        rememberUser(data.user);
        // THE sign-up conversion. verify-magic-link is the call that creates
        // the account for a new email; this fires only when this browser asked
        // for that new account (or the API says is_new_user), once per account.
        trackSignupIfNew(data, "magic_link");
        setStatus("success");
        // pending_approval now means only that the email or mobile is not
        // confirmed yet — /verify asks for that one step, then on to add funds.
        // Back to the page that sent them to sign up (lib/return-path.ts),
        // once there is nothing left to verify.
        const next = data.user?.status === "pending_approval" ? "/verify" : (takeReturnPath() ?? "/my-activity");
        setTimeout(() => {
          void goAfterSignIn(next);
        }, 1200);
      })
      .catch(() => {
        setErrorMsg("Something went wrong. Please try again.");
        setStatus("error");
      });
  }, [token]);

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue/8 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm text-center">
        {/* Logo */}
        <Link href="/" className="mb-10 inline-block text-2xl font-extrabold tracking-tight">
          <span className="text-ink">CORE</span>
          <span className="text-blue">FRAME</span>
        </Link>

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
