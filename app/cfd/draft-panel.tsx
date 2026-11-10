"use client";

import { useEffect, useRef, useState } from "react";
import { formatMoney, type Currency } from "@/lib/money";
import { trackEvent } from "@/lib/analytics";
import { track as trackWebEvent } from "@/lib/web-events";
import { rememberReturnPath } from "@/lib/return-path";
import {
  DRAFT_RETURN,
  DraftError,
  claimDraft,
  discardDraft,
  getDraft,
  payDraft,
  type DraftView,
} from "@/lib/cfd-draft";

/**
 * A CFD draft on /cfd (owner, 10 Nov 2026: form first, account at payment).
 *
 * What the visitor gets with no account: the geometry check, the size
 * estimate, the pre-processing fee for THIS model and an estimate of the run
 * price, all from the control plane's own rules (api/cfd_drafts.py). "Pay"
 * is where the account comes in: signed in with a complete account, the draft
 * becomes a job and they go to its page (the payment step); otherwise the
 * sign-up wall, which brings them back here (DRAFT_RETURN) to the same draft.
 *
 * One currency per visitor: every amount is in the draft's currency, which is
 * the page's. No form value, file name or amount goes to analytics.
 */

const SERVICE_LABEL: Record<string, string> = {
  standard: "Ducts & pipes · Standard",
  verified: "Ducts & pipes · Verified",
  rooms: "Rooms & HVAC · Comfort study",
};

/** Whole rupees (as everywhere on the site); dollars keep their cents. */
function money(v: string | undefined, cur: Currency): string {
  if (v === undefined) return "";
  const n = Number(v);
  return formatMoney(cur === "INR" ? Math.round(n) : n, cur);
}

function range(lo: string, hi: string, cur: Currency): string {
  const a = money(lo, cur);
  const b = money(hi, cur);
  return a === b ? a : `${a} – ${b}`;
}

type Gate = "signed_out" | "incomplete" | "ready";

function sizeLabel(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DraftPanel({
  draft: initial,
  gate,
  autoClaim,
  onEdit,
  onDiscarded,
}: {
  draft: DraftView;
  gate: Gate;
  /** Back from sign-up with a complete account: continue to payment at once. */
  autoClaim: boolean;
  onEdit: () => void;
  onDiscarded: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [wall, setWall] = useState<"" | "sign_in" | "verify">("");
  const [busy, setBusy] = useState<"" | "pay" | "discard">("");
  const [error, setError] = useState("");
  const shown = useRef(false);
  const claimed = useRef(false);
  const cur = draft.currency;

  // Poll while the check runs (a few seconds for a normal STL).
  useEffect(() => {
    if (draft.check.status !== "pending") return;
    let live = true;
    const t = setTimeout(async () => {
      try {
        const d = await getDraft();
        if (live && d) setDraft(d);
      } catch {
        /* keep the last state; the next render polls again */
        if (live) setDraft((d) => ({ ...d }));
      }
    }, 2000);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [draft]);

  const est = draft.run_estimate;
  const pick =
    est?.packages.find((p) => p.package === (draft.service === "verified" ? "validated" : est.default_package)) ??
    est?.packages[0];

  useEffect(() => {
    if (pick && !shown.current) {
      shown.current = true;
      trackWebEvent("cfd_quote_shown", { package: pick.package });
    }
  }, [pick]);

  const goToJob = (ref: string) => {
    window.location.assign(`/cfd/jobs/${encodeURIComponent(ref)}`);
  };

  const pay = async () => {
    setError("");
    setBusy("pay");
    trackWebEvent("cfd_pay_start", { what: "preprocessing", package: pick?.package });
    try {
      const r = await payDraft();
      if (r.next === "claim") {
        const { ref_id } = await claimDraft();
        trackEvent("cfd_job_submit", { location: "cfd_draft" });
        goToJob(ref_id);
        return;
      }
      setWall(r.next === "verify" ? "verify" : "sign_in");
      rememberReturnPath(DRAFT_RETURN);
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not go through. Try again.");
    } finally {
      setBusy("");
    }
  };

  // Back from sign-up / sign-in (?resume=1) with a complete account: straight on.
  useEffect(() => {
    if (!autoClaim || gate !== "ready" || claimed.current || !draft.can_pay || draft.check.status === "pending") return;
    claimed.current = true;
    setBusy("pay");
    claimDraft()
      .then(({ ref_id }) => {
        trackEvent("cfd_job_submit", { location: "cfd_draft" });
        goToJob(ref_id);
      })
      .catch((e: unknown) => {
        setBusy("");
        setError(e instanceof DraftError ? e.message : "That did not go through. Press Pay again.");
      });
  }, [autoClaim, gate, draft]);

  const discard = async () => {
    setBusy("discard");
    try {
      await discardDraft();
      onDiscarded();
    } catch {
      setBusy("");
    }
  };

  const job = draft.job as { projectName?: string };
  const fee = draft.quote_fee;
  const checking = draft.check.status === "pending";
  const problems = [...(draft.rejection ?? []), ...(draft.check.status === "problem" ? draft.check.problems : [])];

  return (
    <div className="rounded-[24px] border border-rule bg-paper-2 p-5 sm:p-8" aria-live="polite">
      <p className="cf-card-label">{SERVICE_LABEL[draft.service] ?? "CFD"}</p>
      <p className="font-heading text-[20px] leading-snug font-medium text-ink sm:text-[22px]">
        {job.projectName || "Your CFD job"}
      </p>
      <p className="mt-1 text-[13.5px] leading-5 text-ink-3">
        {draft.file ? `${draft.file.name} · ${sizeLabel(draft.file.size_bytes)}` : "No file: built from your dimensions"}
        {" · "}
        <button type="button" onClick={onEdit} className="underline underline-offset-2">
          Edit details
        </button>
      </p>

      {/* The check */}
      <div className="mt-6">
        {checking ? (
          <p className="text-[15px] leading-6 text-ink-2">Checking your geometry. This takes a few seconds…</p>
        ) : problems.length ? (
          <div className="rounded-cf border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-[15px] leading-6 font-semibold text-ink">
              {draft.rejection ? "We can't run this case automatically yet." : "The check found something to fix."}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] leading-6 text-ink-2">
              {problems.map((p) => (
                <li key={p.code + p.message}>
                  {p.message}
                  {p.fix ? <span className="text-ink-3"> {p.fix}</span> : null}
                </li>
              ))}
            </ul>
            {!draft.rejection && draft.can_pay ? (
              <p className="mt-2 text-[13.5px] leading-5 text-ink-3">
                Units and the inlet can be confirmed on your job page after sign-in, free, before you pay.
              </p>
            ) : null}
          </div>
        ) : draft.file ? (
          <p className="text-[15px] leading-6 text-ink-2">
            <span className="text-ink">Geometry check passed.</span> {draft.size_estimate?.text ?? ""}
          </p>
        ) : null}
        {draft.size_estimate?.note ? <p className="mt-2 text-[13.5px] leading-5 text-ink-3">{draft.size_estimate.note}</p> : null}
        {!checking && !problems.length && draft.check.confirm_after_sign_in?.length ? (
          <p className="mt-2 text-[13.5px] leading-5 text-ink-3">
            After sign-in you confirm{" "}
            {draft.check.confirm_after_sign_in
              .map((p) => (p.code === "caps_unconfirmed" ? "which opening is the inlet" : "the units"))
              .join(" and ")}{" "}
            on your job page, free, before you pay.
          </p>
        ) : null}
      </div>

      {/* The price */}
      {fee && !checking ? (
        <dl className="mt-6 divide-y divide-rule rounded-cf border border-rule bg-paper">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3">
            <dt className="text-[15px] text-ink">Pre-processing / mesh check</dt>
            <dd className="font-heading text-[20px] font-medium text-ink">
              {fee.total ? money(fee.total, cur) : `${money(fee.small, cur)} or ${money(fee.large, cur)}`}
            </dd>
            <p className="w-full text-[13px] leading-5 text-ink-3">
              {fee.tier_text ?? "The smaller fee for most models; the larger for very large ones."} Paid first; we build and
              check the mesh, then your exact run price comes with it.
            </p>
          </div>
          {pick ? (
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3">
              <dt className="text-[15px] text-ink">{pick.label} run, estimated</dt>
              <dd className="font-heading text-[20px] font-medium text-ink">{range(pick.low, pick.high, cur)}</dd>
              <p className="w-full text-[13px] leading-5 text-ink-3">
                {est?.note} You pay only for the iterations run, never more than the quote.
              </p>
            </div>
          ) : null}
        </dl>
      ) : null}

      {error ? (
        <p role="alert" className="mt-4 text-[14px] leading-6 text-destructive">
          {error}
        </p>
      ) : null}

      {/* Pay, or the account wall at Pay */}
      {wall ? (
        <div className="mt-6 rounded-cf border border-rule bg-paper p-5">
          <p className="text-[15px] leading-6 font-semibold text-ink">
            {wall === "verify" ? "One step left: verify your WhatsApp number." : "Create your Coreframe account to pay."}
          </p>
          <p className="mt-1 text-[14px] leading-6 text-ink-2">
            {wall === "verify"
              ? "It takes a minute. You come straight back to this job, ready to pay."
              : "Your email and a WhatsApp code, no paperwork. You come straight back to this job, ready to pay; nothing to fill in again. One account and one wallet for GPU workstations, CFD and Studio."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {wall === "verify" ? (
              <a href="/verify" className="cf-btn-primary" onClick={() => rememberReturnPath(DRAFT_RETURN)}>
                Verify WhatsApp
              </a>
            ) : (
              <>
                <a
                  href={`/signup?next=${encodeURIComponent("/cfd?resume=1")}`}
                  className="cf-btn-primary"
                  onClick={() => {
                    rememberReturnPath(DRAFT_RETURN);
                    trackEvent("signup_click", { location: "cfd_pay" });
                  }}
                >
                  Sign up
                </a>
                <a
                  href={`/login?next=${encodeURIComponent("/cfd?resume=1")}`}
                  className="cf-btn-secondary"
                  onClick={() => {
                    rememberReturnPath(DRAFT_RETURN);
                    trackEvent("signin_click", { location: "cfd_pay" });
                  }}
                >
                  Sign in
                </a>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={pay}
            disabled={busy !== "" || checking || !draft.can_pay}
            className="cf-btn-primary shrink-0 disabled:opacity-60"
          >
            {busy === "pay" ? "One moment…" : fee?.total ? `Pay ${money(fee.total, cur)} and get my quote` : "Pay pre-processing and get my quote"}
          </button>
          <button
            type="button"
            onClick={discard}
            disabled={busy !== ""}
            className="text-[13.5px] text-ink-3 underline underline-offset-2"
          >
            Start over
          </button>
        </div>
      )}
      <p className="mt-4 text-[13px] leading-5 text-ink-3">
        {gate === "ready"
          ? "Paid from your Coreframe wallet on your job page; you can top up there."
          : "You sign up at this step: email and a WhatsApp code. Paid from your Coreframe wallet."}{" "}
        Your file stays private and is deleted after 7 days if you don&rsquo;t continue.
      </p>
    </div>
  );
}
