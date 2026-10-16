"use client";

/**
 * The CFD job page (see page.tsx and lib/cfd-job.ts).
 *
 * Order on every state: where the job is (the seven-step tracker), the ONE
 * thing to do now (a solid button; everything else is quiet), then what the
 * customer needs to know, then the fine print folded away.
 *
 * Every function of the API page is here: confirm units, confirm the inlet
 * (with the 3D preview), use the stated duct dimensions, upload / replace the
 * STL (chunked, resumable), pay the quote fee, pay the run (package, normal or
 * express, stop-when-settled), a fresh quote after expiry, continue a run,
 * results with the 3D view, PDF and data, and the wallet with Top up.
 */
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  LIVE,
  REUPLOAD_OK,
  STEPS,
  errorText,
  fetchJob,
  fetchWallet,
  fmtDate,
  fmtNumber,
  jobCurrency,
  money,
  moneyValue,
  postJob,
  readJobToken,
  rupeeWords,
  sessionToken,
  stepOf,
  type CfdJob,
  type WalletLine,
} from "@/lib/cfd-job";
import { ActionErrorView, Body, Card, ErrorLine, Fine, More, PrimaryButton, QuietButton, UploadBox, WalletRow, signInHref, type ActionError } from "./parts";
import { isAccountAccess } from "@/lib/cfd-my-jobs";
import { MissingSignedIn } from "@/components/cfd/my-cfd-jobs";
import { QuoteDetails, QuotePanel } from "./quote-panel";
import { BillingLine, ContinuePanel, ResultsPanel } from "./results-panel";

const JobViewer = dynamic(() => import("./job-viewer"), { ssr: false });

const POLL_MS = 20_000;
const noSubscribe = () => () => {};
const WALLET_STATES = new Set(["quote_fee_due", "quoted", "not_converged", "completed"]);

type Load = { kind: "loading" } | { kind: "not_found" } | { kind: "offline" } | { kind: "ok"; job: CfdJob };

export default function CfdJobPage({ refId }: { refId: string }) {
  // Browser-only reads (the job token, the session), as external stores: the
  // server render and the first client render both see `undefined`.
  const token = useSyncExternalStore(noSubscribe, () => readJobToken(refId), () => undefined);
  const hasSession = useSyncExternalStore(noSubscribe, () => !!sessionToken(), () => false);
  const [load, setLoad] = useState<Load>({ kind: "loading" });
  const [wallet, setWallet] = useState<WalletLine | null | "signed_out">(null);
  const [signedOut, setSignedOut] = useState(false);
  const signedIn = hasSession && !signedOut;
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<{ action: string; e: ActionError } | null>(null);

  const refresh = useCallback(
    async (t: string) => {
      try {
        const r = await fetchJob(refId, t);
        if (r.body) setLoad({ kind: "ok", job: r.body });
        else setLoad((prev) => (prev.kind === "ok" && r.status >= 500 ? prev : { kind: "not_found" }));
      } catch {
        setLoad((prev) => (prev.kind === "ok" ? prev : { kind: "offline" }));
      }
    },
    [refId],
  );

  useEffect(() => {
    // Fetching the job is the external system; its state lands after the await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (token) void refresh(token);
  }, [token, refresh]);

  const job = load.kind === "ok" ? load.job : null;
  const status = job?.status ?? "";

  // Live states re-read themselves while the tab is visible.
  useEffect(() => {
    if (!token || !LIVE.has(status)) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void refresh(token);
    }, POLL_MS);
    return () => clearInterval(id);
  }, [token, status, refresh]);

  useEffect(() => {
    if (!WALLET_STATES.has(status)) return;
    let gone = false;
    void fetchWallet().then((w) => {
      if (gone) return;
      setWallet(w);
      if (w === "signed_out") setSignedOut(true);
    });
    return () => {
      gone = true;
    };
  }, [status]);

  const act = useCallback(
    async (action: string, path: string, body?: unknown) => {
      if (!token) return;
      setBusy(action);
      setError(null);
      const r = await postJob(refId, token, path, body);
      setBusy(null);
      if (r.status === 200 && r.body?.status) {
        setLoad({ kind: "ok", job: r.body });
        return;
      }
      if (r.status === 401) setSignedOut(true);
      setError({ action, e: { text: errorText(r), status: r.status } });
    },
    [refId, token],
  );

  const errFor = (a: string): ActionError => (error?.action === a ? error.e : null);

  return (
    <main data-clarity-mask="true">
      <Hero refId={refId} job={job} />
      <div className="mx-auto w-full max-w-[960px] space-y-5 px-4 py-8 sm:px-6 sm:py-12">
        {token === null || load.kind === "not_found" ? <Missing refId={refId} /> : null}
        {token !== null && load.kind === "loading" ? <Fine>Loading your job…</Fine> : null}
        {load.kind === "offline" ? (
          <Card title="We could not reach Coreframe">
            <Body>Check your connection and reload this page.</Body>
          </Card>
        ) : null}
        {job && token ? (
          <JobBody
            job={job}
            token={token}
            wallet={wallet}
            signedIn={signedIn}
            busy={busy}
            errFor={errFor}
            act={act}
            reload={() => void refresh(token)}
          />
        ) : null}
        {job && token && !isAccountAccess(token) ? <PrivateLink refId={refId} token={token} /> : null}
      </div>
    </main>
  );
}

function Hero({ refId, job }: { refId: string; job: CfdJob | null }) {
  const cur = jobCurrency(job);
  return (
    <section
      className="cf-pagehero px-4 sm:px-6"
      style={{ paddingTop: "clamp(40px, 6vw, 72px)", paddingBottom: "clamp(40px, 6vw, 72px)" }}
    >
      <div className="mx-auto w-full max-w-[960px]">
        <p className="cf-eyebrow">CFD job · {refId}</p>
        <h1 className="mt-4 font-heading text-[clamp(28px,4.4vw,39px)] leading-[1.12] font-medium tracking-[-0.015em] break-words">
          {job?.project_name || "Your CFD job"}
        </h1>
        {job ? (
          <>
            <p className="mt-3 max-w-[680px] text-[16px] leading-[1.55]">{rupeeWords(job.status_text)}</p>
            {job.submitted_at ? (
              <p className="mt-2 font-mono text-[12px] tracking-[0.04em] opacity-70">
                Submitted {fmtDate(job.submitted_at, cur)}
                {job.completed_at ? ` · finished ${fmtDate(job.completed_at, cur)}` : ""}
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}

function Stepper({ status }: { status: string }) {
  const { at, stopped } = stepOf(status);
  const done = (i: number) => i < at;
  const current = Math.min(at, STEPS.length - 1);
  return (
    <nav aria-label="Progress" className="rounded-[20px] bg-paper-2 px-5 py-4 sm:px-7 sm:py-5">
      <p className="text-[13px] text-ink-2 sm:hidden">
        Step {Math.min(at + 1, STEPS.length)} of {STEPS.length} ·{" "}
        <span className="font-medium text-ink">{at >= STEPS.length ? "Done" : STEPS[current]}</span>
      </p>
      <ol className="mt-3 flex items-center gap-1 sm:mt-0 sm:gap-0">
        {STEPS.map((s, i) => {
          const isDone = done(i);
          const isNow = i === at && at < STEPS.length;
          const isStop = isNow && stopped;
          return (
            <li key={s} className="flex min-w-0 flex-1 items-center" aria-current={isNow ? "step" : undefined}>
              <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-1">
                <span className="flex w-full items-center">
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${
                      isStop
                        ? "bg-[#b3261e] text-white"
                        : isDone
                          ? "bg-ink text-white"
                          : isNow
                            ? "bg-paper text-ink ring-2 ring-ink"
                            : "bg-paper text-ink-3 ring-1 ring-rule-strong"
                    }`}
                  >
                    {isStop ? "!" : isDone ? "✓" : i + 1}
                  </span>
                  {i < STEPS.length - 1 ? (
                    <span className={`mx-1 h-px flex-1 ${isDone ? "bg-ink" : "bg-rule-strong"}`} />
                  ) : null}
                </span>
                <span
                  className={`hidden pr-2 text-[12px] leading-tight sm:block ${
                    isNow ? "font-medium text-ink" : isDone ? "text-ink-2" : "text-ink-3"
                  }`}
                >
                  {s}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Missing({ refId }: { refId: string }) {
  return (
    <Card title="Open this page from your email">
      <Body>
        We could not open job {refId} here. Use the “Open your job page” link in the latest email about this job:
        the link carries a private key for this job, and this browser keeps it for 30 days.
      </Body>
      <Fine className="mt-3">
        Lost the email? Reply to any email from us, or write to admin@coreframecloud.com with the job number.
      </Fine>
      <MissingSignedIn refId={refId} />
    </Card>
  );
}

function PrivateLink({ refId, token }: { refId: string; token: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col gap-2 pt-2 text-[13px] text-ink-2 sm:flex-row sm:items-center sm:justify-between">
      <p>Questions about this job? Reply to any email from us about {refId}.</p>
      <button
        type="button"
        className="self-start underline underline-offset-2 sm:self-auto"
        onClick={() => {
          void navigator.clipboard
            ?.writeText(`${window.location.origin}/cfd/jobs/${refId}#t=${encodeURIComponent(token)}`)
            .then(() => setCopied(true));
        }}
      >
        {copied ? "Private link copied" : "Copy the private link to this page"}
      </button>
    </div>
  );
}

function JobBody({
  job,
  token,
  wallet,
  signedIn,
  busy,
  errFor,
  act,
  reload,
}: {
  job: CfdJob;
  token: string;
  wallet: WalletLine | null | "signed_out";
  signedIn: boolean;
  busy: string | null;
  errFor: (a: string) => ActionError;
  act: (action: string, path: string, body?: unknown) => Promise<void>;
  reload: () => void;
}) {
  const cur = jobCurrency(job);
  const s = job.status;
  const email = job.payment?.account_email;
  const problems = job.geometry_problems ?? [];
  const noGeometry = problems.some((p) => p.code === "no_geometry");
  const needsUpload = s === "mesh_failed" || s === "rejected" || noGeometry;
  const units = job.units_confirmation;
  const openings = job.openings;
  const confirmCaps = s === "new" && openings?.status === "ok" && !openings.confirmed;
  const otherProblems = problems.filter(
    (p) =>
      !(p.code === "units_unconfirmed" && units) &&
      !(p.code === "caps_unconfirmed" && confirmCaps) &&
      !(p.code === "no_geometry"),
  );

  return (
    <>
      <Stepper status={s} />

      {job.express_notice ? (
        <Card tone="warn">
          <Body className="text-ink">{job.express_notice}</Body>
        </Card>
      ) : null}

      {/* ── 1. The one next action ─────────────────────────────────────── */}

      {s === "new" && units ? (
        <UnitsCard job={job} busy={busy === "units"} error={errFor("units")} onConfirm={(u) => act("units", "/confirm-units", { units: u })} />
      ) : null}

      {confirmCaps && !units ? (
        <InletCard job={job} busy={busy === "caps"} error={errFor("caps")} onConfirm={(id) => act("caps", "/caps", { inlet: id })} />
      ) : null}

      {s === "new" && !units && !confirmCaps && !noGeometry && !otherProblems.length ? (
        <Card eyebrow="In progress" title="Checking your geometry">
          <Body>We check that the model is closed, read its size and find its openings. This page updates by itself.</Body>
        </Card>
      ) : null}

      {needsUpload ? (
        <Card
          tone="action"
          eyebrow="Next step"
          title={noGeometry ? "Upload your model" : "Upload a corrected model"}
        >
          {s === "mesh_failed" && job.mesh_failure ? (
            <div className="mb-4 space-y-2">
              <ErrorLine>{job.mesh_failure.message}</ErrorLine>
              {job.mesh_failure.fix ? <Body>How to fix: {job.mesh_failure.fix}</Body> : null}
              <Fine>{rupeeWords(job.mesh_failure.charge_text) || "You have not been charged."}</Fine>
            </div>
          ) : null}
          {s === "rejected" && job.rejection?.problems?.length ? (
            <ul className="mb-4 space-y-3">
              {job.rejection.problems.map((p) => (
                <li key={p.message}>
                  <ErrorLine>{p.message}</ErrorLine>
                  {p.fix ? <Body className="mt-1">Options: {p.fix}</Body> : null}
                </li>
              ))}
            </ul>
          ) : null}
          {noGeometry ? <Fine className="mb-3">{problems.find((p) => p.code === "no_geometry")?.fix}</Fine> : null}
          <UploadBox refId={job.ref_id} token={token} primary onDone={reload} />
          {job.dimensions_option ? (
            <div className="mt-5 border-t border-rule pt-4">
              <Fine>{rupeeWords(job.dimensions_option.text)}</Fine>
              <div className="mt-3">
                <QuietButton busy={busy === "dims"} onClick={() => act("dims", "/use-dimensions")}>
                  Use my dimensions{job.dimensions_option.dimensions ? `: ${job.dimensions_option.dimensions}` : ""}
                </QuietButton>
              </div>
              <ActionErrorView error={errFor("dims")} refId={job.ref_id} email={email} />
            </div>
          ) : null}
        </Card>
      ) : null}

      {s === "new" && otherProblems.length && !needsUpload ? (
        <Card tone="action" eyebrow="Next step" title="Before we can mesh your geometry">
          <ul className="space-y-3">
            {otherProblems.map((p) => (
              <li key={p.message}>
                <ErrorLine>{p.message}</ErrorLine>
                {p.fix ? <Body className="mt-1">How to fix: {p.fix}</Body> : null}
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <UploadBox refId={job.ref_id} token={token} primary onDone={reload} />
          </div>
        </Card>
      ) : null}

      {s === "quote_fee_due" && job.quote_fee ? (
        <Card tone="action" eyebrow="Next step" title="Pay the quote fee to get your quote">
          <Body>
            We build the mesh for your model and price the run from it. The quote follows automatically, by email
            and on this page.
          </Body>
          {job.size_estimate ? <Fine className="mt-2">{job.size_estimate.text}{job.size_estimate.note ? ` ${job.size_estimate.note}` : ""}</Fine> : null}
          <div className="mt-5">
            {signedIn ? (
              <PrimaryButton busy={busy === "fee"} onClick={() => act("fee", "/pay-quote")}>
                Pay quote fee {money(job.quote_fee.total, cur)}
              </PrimaryButton>
            ) : (
              <Link href={signInHref(job.ref_id)} className="cf-btn-primary w-full sm:w-auto">
                Sign in to pay the quote fee
              </Link>
            )}
          </div>
          <Fine className="mt-3">
            {cur === "USD" ? "No GST (export of services). " : `Includes GST (${money(job.quote_fee.ex_gst, cur)} + GST ${money(job.quote_fee.gst, cur)}). `}
            It is not deducted from the run; if the quote fails on our side, or the mesh turns out larger than our
            limit, it comes back to your wallet.
          </Fine>
          <div className="mt-4">
            <WalletRow wallet={wallet} cur={cur} need={moneyValue(job.quote_fee.total)} refId={job.ref_id} email={email} />
          </div>
          <ActionErrorView error={errFor("fee")} refId={job.ref_id} email={email} />
        </Card>
      ) : null}

      {s === "meshing_queued" || s === "meshing" ? (
        <Card eyebrow="In progress" title={s === "meshing" ? "Building the mesh" : "Waiting to build the mesh"}>
          <Body>Your quote follows automatically. We email you when it is ready, and this page updates by itself.</Body>
          {job.size_estimate ? <Fine className="mt-2">{job.size_estimate.text}</Fine> : null}
        </Card>
      ) : null}

      {s === "quoted" && job.quote ? (
        <QuotePanel
          job={job}
          quote={job.quote}
          cur={cur}
          wallet={wallet}
          signedIn={signedIn}
          busy={busy === "pay" || busy === "requote"}
          error={errFor("pay") ?? errFor("requote")}
          onPay={(b) => act("pay", "/pay", b)}
          onRequote={() => act("requote", "/requote")}
        />
      ) : null}

      {s === "approved" || s === "running" ? <RunCard job={job} /> : null}

      {(s === "completed" || s === "not_converged") ? <ResultsPanel job={job} /> : null}

      {job.continue_option ? (
        <ContinuePanel
          job={job}
          cur={cur}
          wallet={wallet}
          signedIn={signedIn}
          busy={busy === "continue"}
          error={errFor("continue")}
          onContinue={(b) => act("continue", "/continue", b)}
        />
      ) : null}

      {s === "failed" || s === "cancelled" ? (
        <Card title={s === "failed" ? "The run did not finish" : "Cancelled"}>
          <Body>{rupeeWords(job.status_text)}</Body>
        </Card>
      ) : null}

      {job.review_reasons?.length ? (
        <Card tone="warn">
          <Body className="text-ink">
            This needs an engineer: {job.review_reasons.join("; ")}. We will contact you; nothing has been charged.
          </Body>
        </Card>
      ) : null}

      {/* ── 2. What else there is to know ──────────────────────────────── */}

      <BillingLine job={job} cur={cur} />

      {job.quote && s === "quoted" ? <QuoteDetails job={job} quote={job.quote} cur={cur} /> : null}
      {job.quote && s !== "quoted" ? <QuoteDetailsAfter job={job} /> : null}

      {REUPLOAD_OK.has(s) && !needsUpload && !(s === "new" && otherProblems.length) ? (
        <More summary="Upload a new version of the model">
          <Fine>A new file replaces this one and starts again from the geometry check{s === "quoted" ? "; this quote is withdrawn and the next one needs the quote fee again" : ""}.</Fine>
          <UploadBox refId={job.ref_id} token={token} primary={false} onDone={reload} />
        </More>
      ) : null}
    </>
  );
}

function UnitsCard({
  job,
  busy,
  error,
  onConfirm,
}: {
  job: CfdJob;
  busy: boolean;
  error: ActionError;
  onConfirm: (u: string) => void;
}) {
  const u = job.units_confirmation!;
  const [val, setVal] = useState(u.suggested || u.options[0]);
  const msg = job.geometry_problems?.find((p) => p.code === "units_unconfirmed");
  return (
    <Card tone="action" eyebrow="Next step" title="Confirm the units of your model">
      {msg ? <Body>{msg.message}</Body> : null}
      {u.reason ? <Fine className="mt-2">{u.reason}</Fine> : null}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-[14px] text-ink-2">
          My model is drawn in
          <select
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="h-11 rounded-full border border-rule-strong bg-paper px-4 text-ink"
          >
            {u.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        <PrimaryButton busy={busy} onClick={() => onConfirm(val)}>
          Confirm units
        </PrimaryButton>
      </div>
      <Fine className="mt-3">No charge.</Fine>
      <ActionErrorView error={error} refId={job.ref_id} />
    </Card>
  );
}

function InletCard({
  job,
  busy,
  error,
  onConfirm,
}: {
  job: CfdJob;
  busy: boolean;
  error: ActionError;
  onConfirm: (id: string) => void;
}) {
  const caps = job.openings!.caps;
  const [inlet, setInlet] = useState((caps.find((c) => c.role === "inlet") ?? caps[0]).id);
  const capsInfo = useMemo(
    () =>
      caps.map((c) => ({
        id: c.id,
        role: c.id === inlet ? "inlet" : "outlet",
        area: c.area_m2 ? `${(c.area_m2 * 1e4).toFixed(2)} cm²` : "",
      })),
    [caps, inlet],
  );
  return (
    <Card tone="action" eyebrow="Next step" title="Confirm the inlet">
      <Body>
        We found {caps.length} openings. Pick the one the flow comes in through; every other opening becomes an
        outlet at the outlet pressure.
      </Body>
      {job.preview_url ? (
        <div className="mt-4">
          <JobViewer url={job.preview_url} caps={capsInfo} label="3D preview of your model with its openings" />
        </div>
      ) : null}
      <fieldset className="mt-4 grid gap-2 sm:grid-cols-2">
        <legend className="sr-only">Inlet</legend>
        {caps.map((c) => (
          <label
            key={c.id}
            className={`flex cursor-pointer items-start gap-3 rounded-[16px] bg-paper px-4 py-3 text-[14px] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink ${
              c.id === inlet ? "ring-2 ring-ink" : "ring-1 ring-rule-strong"
            }`}
          >
            <input
              type="radio"
              name="inlet"
              checked={c.id === inlet}
              onChange={() => setInlet(c.id)}
              className="mt-1 size-4 shrink-0 accent-ink"
            />
            <span>
              <span className="font-medium text-ink">Opening {c.id} is the inlet</span>
              {c.area_m2 ? (
                <span className="block text-[13px] text-ink-2">
                  Area {(c.area_m2 * 1e4).toFixed(2)} cm²
                  {c.hydraulic_diameter_m ? ` · hydraulic diameter ${(c.hydraulic_diameter_m * 1000).toFixed(1)} mm` : ""}
                </span>
              ) : null}
            </span>
          </label>
        ))}
      </fieldset>
      <div className="mt-5">
        <PrimaryButton busy={busy} onClick={() => onConfirm(inlet)}>
          Confirm inlet {inlet}
        </PrimaryButton>
      </div>
      <Fine className="mt-3">No charge. The quote fee comes next.</Fine>
      <ActionErrorView error={error} refId={job.ref_id} />
    </Card>
  );
}

function RunCard({ job }: { job: CfdJob }) {
  const cur = jobCurrency(job);
  const sc = job.schedule;
  const pkgName = job.billing?.package;
  const pkg = job.quote?.packages?.find((p) => p.package === pkgName);
  const it = job.iteration ?? 0;
  const of = pkg?.iterations ?? 0;
  const pct = of ? Math.min(100, Math.round((it / of) * 100)) : 0;
  const express = job.delivery === "express";
  const stageWords: Record<string, string> = {
    queued: "Queued",
    waiting: "Waiting for the full machine",
    meshing: "Building the mesh",
    solving: "Solving",
    post: "Writing the report",
    packaging: "Packaging the results",
  };
  const running = job.status === "running";
  return (
    <Card eyebrow={express ? "Express" : "Normal delivery"} title={running ? "Your run is in progress" : "Paid, starting soon"}>
      {running && it ? (
        <div>
          <p className="text-[16px] text-ink">
            Iteration {fmtNumber(it)}
            {of ? <span className="text-ink-2"> of up to {fmtNumber(of)}</span> : null}
            {job.stage && stageWords[job.stage] ? <span className="text-ink-2"> · {stageWords[job.stage]}</span> : null}
          </p>
          {of ? (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
              <div className="h-full rounded-full bg-ink" style={{ width: `${pct}%` }} />
            </div>
          ) : null}
          <Fine className="mt-2">Most runs stop before the allowance, once the residuals meet their targets.</Fine>
        </div>
      ) : null}
      {sc ? (
        <Body className={running && it ? "mt-4" : ""}>
          {job.status === "approved" && sc.starts_text ? `${sc.starts_text.charAt(0).toUpperCase()}${sc.starts_text.slice(1)}; ` : ""}
          {sc.results_text}.
        </Body>
      ) : job.turnaround ? (
        <Body className={running && it ? "mt-4" : ""}>
          {job.turnaround.charAt(0).toUpperCase() + job.turnaround.slice(1)} of payment.
        </Body>
      ) : null}
      <Fine className="mt-3">
        {pkg ? `${pkg.label} package. ` : ""}
        {job.stop_when_settled === undefined
          ? ""
          : job.stop_when_settled
            ? "Stops early when the answer has settled. "
            : "Runs until the residual targets or the allowance. "}
        We email you when the results are ready; this page updates by itself.
        {job.billing && Number(job.billing.on_hold_inr) > 0 ? ` ${money(job.billing.on_hold_inr, cur)} is held in your wallet; the unused part comes back when the run ends.` : ""}
      </Fine>
    </Card>
  );
}

/** After payment the quote is history: what was bought, folded away. */
function QuoteDetailsAfter({ job }: { job: CfdJob }) {
  const cur = jobCurrency(job);
  const q = job.quote!;
  const pkg = q.packages.find((p) => p.package === job.billing?.package);
  return (
    <More summary="Your quote">
      {pkg ? (
        <Fine>
          {pkg.label}: {money(pkg.total, cur)}
          {cur === "USD" ? "" : " incl. GST"}, up to {fmtNumber(pkg.iterations)} iterations. {pkg.convergence}
        </Fine>
      ) : null}
      {q.cells ? <Fine>Mesh: {fmtNumber(q.cells)} cells.{q.physics ? ` ${q.physics}` : ""}</Fine> : null}
      <ul className="list-disc space-y-1 pl-5 text-[13px] leading-[1.6] text-ink-2">
        {Object.values(q.outcomes ?? {}).map((t) => (
          <li key={t}>{rupeeWords(t)}</li>
        ))}
      </ul>
    </More>
  );
}

