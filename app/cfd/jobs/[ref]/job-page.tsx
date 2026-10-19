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
 * STL (chunked, resumable), pay for pre-processing (quote_fee), pay the run (package, normal or
 * express, stop-when-settled), a fresh quote after expiry, continue a run,
 * results with the 3D view, PDF and data, and the wallet with Top up.
 */
import dynamic from "next/dynamic";
import Link from "next/link";
import { PageHeroBg, type HeroImage } from "@/components/page-hero-bg";
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
  rupeeWords,
  sessionToken,
  stepOf,
  type CfdJob,
  type WalletLine,
} from "@/lib/cfd-job";
import { ActionErrorView, Body, Card, ErrorLine, Fine, Fold, More, PrimaryButton, QuietButton, UploadBox, WalletRow, signInHref, type ActionError } from "./parts";
import { QuoteDetails, QuotePanel, packageLine } from "./quote-panel";
import { BillingLine, ContinuePanel, ResultsPanel } from "./results-panel";
import { CancelLink, Cancelled, RunCard } from "./run-card";

const JobViewer = dynamic(() => import("./job-viewer"), { ssr: false });

const POLL_MS = 20_000;
// Under the API's 5-minute file-link lifetime (cfd_jobs.FILE_LINK_SECONDS).
const FILE_LINK_REFRESH_MS = 4 * 60_000;
const noSubscribe = () => () => {};
const WALLET_STATES = new Set(["quote_fee_due", "quoted", "not_converged", "completed"]);

type Load =
  | { kind: "loading" }
  | { kind: "signed_out" }
  | { kind: "not_found" }
  | { kind: "offline" }
  | { kind: "ok"; job: CfdJob };

export default function CfdJobPage({ refId }: { refId: string }) {
  // Browser-only reads, as external stores: the server render and the first
  // client render both see `false`. The job opens only for its signed-in
  // account (17 Oct 2026): there is no job token, and the API answers 401
  // signed out, 404 for anyone else's job.
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);
  const hasSession = useSyncExternalStore(noSubscribe, () => !!sessionToken(), () => false);
  const [load, setLoad] = useState<Load>({ kind: "loading" });
  const [wallet, setWallet] = useState<WalletLine | null | "signed_out">(null);
  const [signedOut, setSignedOut] = useState(false);
  const signedIn = hasSession && !signedOut;
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<{ action: string; e: ActionError } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetchJob(refId);
      if (r.body) setLoad({ kind: "ok", job: r.body });
      else if (r.status === 401) setLoad({ kind: "signed_out" });
      else setLoad((prev) => (prev.kind === "ok" && r.status >= 500 ? prev : { kind: "not_found" }));
    } catch {
      setLoad((prev) => (prev.kind === "ok" ? prev : { kind: "offline" }));
    }
  }, [refId]);

  useEffect(() => {
    // Fetching the job is the external system; its state lands after the await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (mounted) void refresh();
  }, [mounted, refresh]);

  const job = load.kind === "ok" ? load.job : null;
  const status = job?.status ?? "";

  // Live states re-read themselves while the tab is visible.
  useEffect(() => {
    if (!LIVE.has(status)) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [status, refresh]);

  // File links (report, results, 3D views) are signed for 5 minutes (security
  // review 17 Oct 2026). Keep them fresh on a page left open, and on return
  // to the tab, so a download button never hands out an expired link.
  const hasFiles = Boolean(
    job && (job.report_url || job.results_url || job.view3d_url || job.mesh_report_url || job.preview_url),
  );
  useEffect(() => {
    if (!hasFiles) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, FILE_LINK_REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [hasFiles, refresh]);

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
      setBusy(action);
      setError(null);
      const r = await postJob(refId, path, body);
      setBusy(null);
      if (r.status === 200 && r.body?.status) {
        setLoad({ kind: "ok", job: r.body });
        return;
      }
      if (r.status === 401) setSignedOut(true);
      setError({ action, e: { text: errorText(r), status: r.status } });
    },
    [refId],
  );

  const errFor = (a: string): ActionError => (error?.action === a ? error.e : null);

  return (
    <main data-clarity-mask="true" className="cfx-paper">
      <Hero refId={refId} job={job} />
      <div className="mx-auto w-full max-w-[960px] space-y-5 px-4 py-8 sm:px-6 sm:py-12">
        {load.kind === "signed_out" ? <SignInFirst refId={refId} /> : null}
        {load.kind === "not_found" ? <Missing refId={refId} /> : null}
        {load.kind === "loading" ? <Fine>Loading your job…</Fine> : null}
        {load.kind === "offline" ? (
          <Card title="We could not reach Coreframe">
            <Body>Check your connection and reload this page.</Body>
          </Card>
        ) : null}
        {job ? (
          <JobBody
            job={job}
            wallet={wallet}
            signedIn={signedIn}
            busy={busy}
            errFor={errFor}
            act={act}
            reload={() => void refresh()}
          />
        ) : null}
        {job ? (
          <p className="pt-2 text-[13px] text-ink-2">Questions about this job? Reply to any email from us about {refId}.</p>
        ) : null}
      </div>
    </main>
  );
}

/** An explainer sketch (residuals falling as a run converges), decorative
 *  here (alt ""), hidden below 900px so a phone gets straight to the job.
 *  Not the /cfd hero: a sub-page never reuses the main page's picture
 *  (owner, 16 Oct 2026). */
const JOB_HERO_ART: HeroImage = {
  src: "/cfd/explainer/d-residuals-falling.webp",
  w: 1536,
  h: 864,
  alt: "",
  pos: "right 40%",
};

function Hero({ refId, job }: { refId: string; job: CfdJob | null }) {
  const cur = jobCurrency(job);
  return (
    <section
      className="cf-pagehero cf-pagehero--paper cf-pagehero--noart-m cf-pagehero--job px-4 sm:px-6"
      style={{ paddingTop: "clamp(40px, 6vw, 72px)", paddingBottom: "clamp(40px, 6vw, 72px)" }}
    >
      <PageHeroBg image={JOB_HERO_ART} sizes="(max-width: 899px) 1px, 50vw" />
      <div className="mx-auto w-full max-w-[960px]">
        <div className="min-w-0 min-[900px]:max-w-[56%]">
        <p className="cf-eyebrow">CFD job · {refId}</p>
        <h1 className="mt-4 font-heading text-[clamp(28px,4.4vw,39px)] leading-[1.12] font-medium tracking-[-0.015em] break-words">
          {job?.project_name || "Your CFD job"}
        </h1>
        {job ? (
          <>
            <p className="mt-3 max-w-[680px] text-[16px] leading-[1.55]">{rupeeWords(job.status_text)}</p>
            {job.submitted_at ? (
              <p className="mt-2 font-mono text-[12px] tracking-[0.04em] text-ink-3">
                Submitted {fmtDate(job.submitted_at, cur)}
                {job.completed_at ? ` · finished ${fmtDate(job.completed_at, cur)}` : ""}
              </p>
            ) : null}
          </>
        ) : null}
        </div>
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

/** Signed out (or an old emailed link): sign in first; the job is never shown without it. */
function SignInFirst({ refId }: { refId: string }) {
  return (
    <Card title="Sign in to see this job">
      <Body>
        CFD job pages open only for the Coreframe account that submitted the job. Sign in and you come straight
        back to job {refId}.
      </Body>
      <div className="mt-4">
        <Link href={signInHref(refId)} className="cf-btn-primary w-full sm:w-auto">
          Sign in
        </Link>
      </div>
      <Fine className="mt-3">
        Opened a link from an older email? Those links no longer open a job on their own. Sign in with the email
        address the job was sent to.
      </Fine>
    </Card>
  );
}

/** Signed in, but not this account's job (or no such job: the API says the same). */
function Missing({ refId }: { refId: string }) {
  return (
    <Card title="This job is not in your account">
      <Body>
        We could not find job {refId} in the account you are signed in with. A job page opens only for the account
        that submitted it. Your own jobs are under{" "}
        <Link href="/my-activity#cfd-jobs" className="font-medium text-ink underline underline-offset-2">
          CFD jobs
        </Link>
        .
      </Body>
      <Fine className="mt-3">
        Submitted it from another account?{" "}
        <Link href={signInHref(refId)} className="underline underline-offset-2">
          Sign in with that account
        </Link>
        . Lost track of it? Reply to any email from us, or write to admin@coreframecloud.com with the job number.
      </Fine>
    </Card>
  );
}

function JobBody({
  job,
  wallet,
  signedIn,
  busy,
  errFor,
  act,
  reload,
}: {
  job: CfdJob;
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
          <UploadBox refId={job.ref_id} primary onDone={reload} />
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
            <UploadBox refId={job.ref_id} primary onDone={reload} />
          </div>
        </Card>
      ) : null}

      {s === "quote_fee_due" && job.quote_fee ? (
        <Card tone="action" eyebrow="Next step" title="Pay for pre-processing to get your quote">
          <Body>
            Pre-processing / mesh check: we check your geometry, build a wall-resolved mesh and verify its quality; your exact run price comes with it. The mesh report and the quote follow
            automatically, by email and on this page.
          </Body>
          {job.size_estimate ? <Fine className="mt-2">{job.size_estimate.text}{job.size_estimate.note ? ` ${job.size_estimate.note}` : ""}</Fine> : null}
          <div className="mt-5">
            {signedIn ? (
              <PrimaryButton busy={busy === "fee"} onClick={() => act("fee", "/pay-quote")}>
                Pay {money(job.quote_fee.total, cur)} for pre-processing
              </PrimaryButton>
            ) : (
              <Link href={signInHref(job.ref_id)} className="cf-btn-primary w-full sm:w-auto">
                Sign in to pay for pre-processing
              </Link>
            )}
          </div>
          <Fine className="mt-3">
            {cur === "USD" ? "No GST (export of services). " : `Includes GST (${money(job.quote_fee.ex_gst, cur)} + GST ${money(job.quote_fee.gst, cur)}). `}
            A separate charge for the pre-processing work, not deducted from the run. If pre-processing fails on our
            side, or the mesh turns out larger than our limit, it comes back to your wallet.
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

      {job.mesh_report_url && job.quote ? <MeshReportRow job={job} url={job.mesh_report_url} /> : null}

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

      {s === "failed" ? (
        <Card title="The run did not finish">
          <Body>{rupeeWords(job.status_text)}</Body>
        </Card>
      ) : null}

      {s === "cancelled" ? <Cancelled job={job} /> : null}

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

      {job.cancel_option ? (
        <CancelLink
          job={job}
          busy={busy === "cancel"}
          error={errFor("cancel")}
          onCancel={() => act("cancel", "/cancel")}
        />
      ) : null}
      {job.quote && s !== "quoted" ? <QuoteDetailsAfter job={job} /> : null}

      {REUPLOAD_OK.has(s) && !needsUpload && !(s === "new" && otherProblems.length) ? (
        <More summary="Upload a new version of the model">
          <Fine>A new file replaces this one and starts again from the geometry check{s === "quoted" ? "; this quote is withdrawn and the new file needs pre-processing again" : ""}.</Fine>
          <UploadBox refId={job.ref_id} primary={false} onDone={reload} />
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
      <Fine className="mt-3">No charge. Pre-processing comes next.</Fine>
      <ActionErrorView error={error} refId={job.ref_id} />
    </Card>
  );
}

/** Pre-processing / mesh check is done: what was checked, and the one-page Mesh report. */
function MeshReportRow({ job, url }: { job: CfdJob; url: string }) {
  const q = job.quote!;
  const wl = q.mesh_quality?.wall_layers;
  const layers = wl?.used && wl.used !== "off" && wl.coverage_pct ? `, wall layers on ${fmtNumber(wl.coverage_pct)}% of the wall` : "";
  return (
    <Card eyebrow="Pre-processing / mesh check · done" title="Your mesh is checked">
      <Body>
        Geometry checked, {wl?.used === "lowre" ? "wall-resolved " : ""}mesh built and quality-checked:{" "}
        {q.cells ? `${fmtNumber(q.cells)} cells` : "mesh ready"}
        {layers}
        {q.mesh_quality?.mesh_ok ? ", all mesh checks passed" : ""}.
      </Body>
      <div className="mt-4">
        <QuietButton onClick={() => window.open(url, "_blank", "noopener,noreferrer")}>Mesh report (PDF)</QuietButton>
      </div>
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
          {cur === "USD" ? "" : " incl. GST"}, up to {fmtNumber(pkg.iterations)} iterations; {packageLine(pkg)}
        </Fine>
      ) : null}
      {q.cells ? <Fine>Mesh: {fmtNumber(q.cells)} cells.{q.physics ? ` ${q.physics}` : ""}</Fine> : null}
      <Fold>
        {pkg ? <p>{pkg.convergence}</p> : null}
        <ul className="list-disc space-y-1 pl-5">
          {Object.values(q.outcomes ?? {}).map((t) => (
            <li key={t}>{rupeeWords(t)}</li>
          ))}
        </ul>
      </Fold>
    </More>
  );
}

