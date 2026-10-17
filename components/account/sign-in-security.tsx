"use client";

import { useState } from "react";

import { forgetLocalSession, signOutEverywhere } from "@/lib/session-cookie";

/**
 * "Sign out of all devices" (security review 17 Oct 2026, #4).
 *
 * The API has had POST /auth/sign-out-everywhere since September; no page
 * called it, so a customer who left a session open on a shared computer, or
 * lost a laptop, had no way to end it. This is that button. It ends every
 * session: this browser, other browsers, Studio and Coreframe Connect.
 * Asks once before doing it, because a running GPU session in Connect is
 * signed out too.
 */
export default function SignInSecurity() {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function endEverywhere() {
    setBusy(true);
    setError(null);
    const ok = await signOutEverywhere();
    if (!ok) {
      setBusy(false);
      setError("That didn't go through. Sign in again and retry, or contact support@coreframecloud.com.");
      return;
    }
    forgetLocalSession();
    window.location.href = "/login?signed_out=everywhere";
  }

  return (
    <section className="cf-glass p-5 sm:p-6" aria-labelledby="sign-in-security">
      <h2 id="sign-in-security" className="cf-section-title">
        Sign-in and security
      </h2>
      <p className="mt-2 text-[15px] leading-7 text-ink-2">
        Signed in on a computer you no longer use, or lost a device? End every session at once:
        this browser, other browsers, Studio and Coreframe Connect.
      </p>
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-4 rounded-cf border border-rule-strong px-3 py-2 text-sm font-semibold text-ink transition hover:bg-paper-2"
        >
          Sign out of all devices
        </button>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-sm text-ink-2">
            A running GPU session in Connect will be signed out too. Continue?
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void endEverywhere()}
            className="rounded-cf bg-ink px-3 py-2 text-sm font-semibold text-paper transition disabled:opacity-60"
          >
            {busy ? "Signing out…" : "Yes, sign out everywhere"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirming(false)}
            className="rounded-cf px-3 py-2 text-sm font-semibold text-ink-2 hover:text-ink"
          >
            Cancel
          </button>
        </div>
      )}
      {error ? (
        <p role="alert" className="mt-3 text-[14px] leading-6 text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  );
}
