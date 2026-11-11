"use client";

import { COOKIE_SESSION, apiFetch, sessionMarker } from "@/lib/session";
import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "@/lib/api-base";
import { trackEvent } from "@/lib/analytics";
import { track as trackWebEvent } from "@/lib/web-events";
import { rememberReturnPath } from "@/lib/return-path";
import CfdJobForm from "./cfd-job-form";
import DraftPanel from "./draft-panel";
import { useSelectedService } from "./service-tiles";
import type { Currency } from "@/lib/money";
import { getDraft, type DraftView } from "@/lib/cfd-draft";

/**
 * The "Start a job" area of /cfd.
 *
 * FORM FIRST, ACCOUNT AT PAYMENT (owner, 10 Nov 2026; was "account first",
 * 13 Oct 2026). Evidence: ~390 CFD visitors in 30 days, the form shown 0 times,
 * because sign-up and WhatsApp came before the form, the upload and the price.
 * Now:
 *
 *   anyone          -> the form at once, on the chosen tile (Standard unless
 *                      another was picked); signed out it saves a DRAFT
 *                      (lib/cfd-draft.ts) and shows the check and the price;
 *   "Pay" on a draft -> signed in and complete: the draft becomes a job and
 *                      its page opens at the payment step; otherwise the
 *                      sign-up / verify wall, which comes back to
 *                      /cfd?resume=1#start and continues to payment by itself;
 *   complete account, no draft -> the form submits a job as before.
 *
 * Every account still registers like every Coreframe customer (verified email
 * and WhatsApp mobile, one wallet); POST /cfd-jobs and the draft claim both
 * refuse anything else. Signed-in state is the site's usual one (lib/session.ts),
 * completeness from GET /verification/status.
 */
const LEGACY_TOKEN_KEY = "cf_customer_token";
const USER_KEY = "cf_customer_user";

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
  // undefined: not asked yet; null: this browser has no draft.
  const [draft, setDraft] = useState<DraftView | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [resume, setResume] = useState(false);
  // The tile chosen above (app/cfd/service-tiles.tsx); Standard until another is picked.
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
      // Could not reach the API: the visitor can still fill the form as a draft.
      setGate({ kind: "signed_out", note: "We could not check your sign-in just now." });
    }
  }, []);

  useEffect(() => {
    // Reading localStorage, the URL and the API can only happen in the browser, after mount.
    try {
      setResume(new URLSearchParams(window.location.search).get("resume") === "1");
    } catch {
      /* no resume */
    }
    void check();
    getDraft()
      .then((d) => setDraft(d && d.status === "open" ? d : null))
      .catch(() => setDraft(null));
  }, [check]);

  // The sign-up wall (funnel debug 10 Nov 2026: visitors stopped here left no
  // trace). One cfd_gate_view per state shown: signed_out, incomplete, or
  // choose_tile (signed in, no study picked yet).
  const gateState =
    gate.kind === "signed_out" ? "signed_out"
      : gate.kind === "incomplete" ? "incomplete"
        : gate.kind === "ready" && !service ? "choose_tile" : null;
  useEffect(() => {
    if (gateState) trackWebEvent("cfd_gate_view", { state: gateState });
  }, [gateState]);

  if (gate.kind === "loading" || draft === undefined) {
    return (
      <div className="rounded-[24px] border border-rule bg-paper-2 p-6 sm:p-8" aria-busy="true">
        <div className="h-5 w-48 animate-pulse rounded bg-ink/10" />
        <div className="mt-4 h-4 w-full animate-pulse rounded bg-ink/5" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-ink/5" />
      </div>
    );
  }

  const ready = gate.kind === "ready";
  if (draft && !editing) {
    return (
      <DraftPanel
        key={draft.expires_at + (draft.file?.uploaded_at ?? "")}
        draft={draft}
        gate={ready ? "ready" : gate.kind === "incomplete" ? "incomplete" : "signed_out"}
        autoClaim={resume}
        onEdit={() => setEditing(true)}
        onDiscarded={() => setDraft(null)}
      />
    );
  }

  // A complete account with no draft submits a job as before; everyone else fills a draft.
  const draftMode = !ready || Boolean(draft);
  return (
    <CfdJobForm
      key={draftMode ? "draft" : "account"}
      service={service}
      token={ready ? gate.token : null}
      accountEmail={ready ? gate.email : null}
      currency={currency}
      mode={draftMode ? "draft" : "account"}
      prefill={editing ? draft?.job : null}
      onDraft={(d) => {
        setDraft(d);
        setEditing(false);
      }}
      onSignedOut={() => {
        // The session ended mid-form: keep what they typed as a draft instead.
        setGate({ kind: "signed_out" });
      }}
    />
  );
}
