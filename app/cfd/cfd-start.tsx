"use client";

import { COOKIE_SESSION, apiFetch, sessionMarker } from "@/lib/session";
import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "@/lib/api-base";
import { trackEvent } from "@/lib/analytics";
import { rememberReturnPath } from "@/lib/return-path";
import CfdJobForm from "./cfd-job-form";
import { useSelectedService } from "./service-tiles";
import type { Currency } from "@/lib/money";

/**
 * The "Start a job" area of /cfd. Account first (owner, 13 Oct 2026):
 * CFD customers register like every Coreframe customer, with a verified email
 * and a WhatsApp-verified mobile, and pay from the same wallet as GPU
 * workstations and Studio. POST /cfd-jobs refuses anything else.
 *
 *   signed out  -> why an account, and Sign up / Sign in that come back here;
 *   incomplete  -> finish verification at /verify, which comes back here;
 *   complete    -> the form, without name, email or phone.
 *
 * Signed-in state is the site's usual one: the HttpOnly session cookie
 * (lib/session.ts). Completeness is asked of GET /verification/status,
 * which takes both the full and the verification-scoped token and answers
 * with `next_step` ("email" | "mobile" | "done") and `account_active`.
 */

const LEGACY_TOKEN_KEY = "cf_customer_token";
const USER_KEY = "cf_customer_user";
const HERE = "/cfd#start";

type Gate =
  | { kind: "loading" }
  | { kind: "signed_out"; note?: string }
  | { kind: "incomplete"; step: string }
  | { kind: "ready"; token: string; email: string | null };

function storedEmail(): string | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? ((JSON.parse(raw) as { email?: string }).email ?? null) : null;
  } catch {
    return null;
  }
}

export default function CfdStart({ currency = "INR" }: { currency?: Currency } = {}) {
  const [gate, setGate] = useState<Gate>({ kind: "loading" });
  // The tile chosen above (app/cfd/service-tiles.tsx); null until one is picked.
  const service = useSelectedService();

  const check = useCallback(async () => {
    const token = sessionMarker();
    if (!token && !localStorage.getItem(LEGACY_TOKEN_KEY)) {
      setGate({ kind: "signed_out" });
      return;
    }
    try {
      const res = await apiFetch(`${API_BASE}/verification/status`);
      if (res.status === 401 || res.status === 403) {
        setGate({ kind: "signed_out" });
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const s = (await res.json()) as { next_step?: string; account_active?: boolean; email_verified?: boolean; mobile_verified?: boolean };
      const step = s.next_step ?? (!s.email_verified ? "email" : !s.mobile_verified ? "mobile" : "done");
      if (step !== "done" || !s.account_active) {
        setGate({ kind: "incomplete", step });
        return;
      }
      setGate({ kind: "ready", token: token ?? COOKIE_SESSION, email: storedEmail() });
    } catch {
      // Could not reach the API. Show the sign-in path rather than a form that cannot submit.
      setGate({ kind: "signed_out", note: "We could not check your sign-in just now. Reload the page, or sign in again." });
    }
  }, []);

  useEffect(() => {
    // Reading localStorage and the API can only happen in the browser, after mount.
    void check();
  }, [check]);

  if (gate.kind === "loading") {
    return (
      <div className="rounded-[24px] border border-rule bg-paper-2 p-6 sm:p-8" aria-busy="true">
        <div className="h-5 w-48 animate-pulse rounded bg-ink/10" />
        <div className="mt-4 h-4 w-full animate-pulse rounded bg-ink/5" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-ink/5" />
      </div>
    );
  }

  if (gate.kind === "signed_out") {
    const next = encodeURIComponent("/cfd");
    return (
      <div className="rounded-[24px] border border-rule bg-paper-2 p-6 sm:p-8">
        <p className="cf-card-label">Account first</p>
        <p className="font-heading text-[20px] leading-snug font-medium text-ink sm:text-[22px]">
          Create your Coreframe account to start a CFD job: one account and one wallet for GPU workstations, CFD and
          Studio.
        </p>
        <p className="mt-3 text-[15px] leading-6 text-ink-2">
          Sign-up is your email and a WhatsApp code to your mobile, no paperwork. You come straight back here to submit
          your job, and pre-processing is paid from the same wallet.
        </p>
        {gate.note ? <p className="mt-3 text-[14px] leading-6 text-destructive">{gate.note}</p> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={`/signup?next=${next}`}
            className="cf-btn-primary"
            onClick={() => { rememberReturnPath(HERE); trackEvent("signup_click", { location: "cfd_intake" }); }}
          >
            Sign up
          </a>
          <a
            href={`/login?next=${next}`}
            className="cf-btn-secondary"
            onClick={() => { rememberReturnPath(HERE); trackEvent("signin_click", { location: "cfd_intake" }); }}
          >
            Sign in
          </a>
        </div>
      </div>
    );
  }

  if (gate.kind === "incomplete") {
    const what = gate.step === "email" ? "confirm your email" : gate.step === "mobile" ? "verify your WhatsApp number" : "finish verifying your email and WhatsApp number";
    return (
      <div className="rounded-[24px] border border-rule bg-paper-2 p-6 sm:p-8">
        <p className="cf-card-label">Almost there</p>
        <p className="font-heading text-[20px] leading-snug font-medium text-ink sm:text-[22px]">
          Finish setting up your Coreframe account to start a CFD job.
        </p>
        <p className="mt-3 text-[15px] leading-6 text-ink-2">
          One step left: {what}. It takes a minute, and you come straight back here.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/verify"
            className="cf-btn-primary"
            onClick={() => { rememberReturnPath(HERE); trackEvent("finish_signup_click", { location: "cfd_intake" }); }}
          >
            Finish verification
          </a>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="rounded-[24px] border border-dashed border-rule-strong bg-paper-2 p-6 sm:p-8">
        <p className="text-[15px] leading-6 text-ink-2">
          Choose Standard, Verified or Comfort study above, and its form opens here.
        </p>
      </div>
    );
  }

  return (
    <CfdJobForm
      service={service}
      token={gate.token}
      accountEmail={gate.email}
      currency={currency}
      onSignedOut={(reason) =>
        setGate(reason === "incomplete" ? { kind: "incomplete", step: "verify" } : { kind: "signed_out", note: "Your sign-in has ended. Sign in again to submit." })
      }
    />
  );
}
