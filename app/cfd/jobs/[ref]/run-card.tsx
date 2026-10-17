"use client";

/**
 * A paid run, its times and the cancel option (owner, 16 Oct 2026).
 *
 * Times are separate labelled rows, never one sentence: Status, Estimated
 * start, Estimated results, Guaranteed by — each in the viewer's own zone
 * (lib/cfd-job.ts fmtDate). A customer may cancel before paying and after
 * paying until the solver starts; once it runs there is no cancel link.
 */
import { useRef } from "react";
import { type Currency } from "@/lib/money";
import { fmtDate, fmtNumber, jobCurrency, money, type CfdJob } from "@/lib/cfd-job";
import { ActionErrorView, Body, Card, Fine, When, type ActionError } from "./parts";

function Rows({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="divide-y divide-rule">
      {rows.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-6">
          <dt className="text-[14px] text-ink-2 sm:w-[180px] sm:shrink-0">{k}</dt>
          <dd className="text-[16px] text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

const STAGE_WORDS: Record<string, string> = {
  solving: "Solving",
  packaging: "Packaging the results",
  uploading: "Uploading the results",
};

export function RunCard({ job }: { job: CfdJob }) {
  const cur = jobCurrency(job);
  const sc = job.schedule ?? null;
  const pkgName = job.billing?.package;
  const pkg = job.quote?.packages?.find((p) => p.package === pkgName);
  const it = job.iteration ?? 0;
  const of = pkg?.iterations ?? 0;
  const pct = of ? Math.min(100, Math.round((it / of) * 100)) : 0;
  const express = job.delivery === "express";
  const state = job.run_state ?? (job.status === "running" ? "running" : "queued");

  const status =
    state === "running"
      ? `Running${job.stage && STAGE_WORDS[job.stage] ? ` · ${STAGE_WORDS[job.stage]}` : ""}`
      : state === "starting"
        ? "Starting · preparing the machine for your run"
        : express
          ? "Starting a machine for your job now"
          : "In the queue";

  const rows: [string, React.ReactNode][] = [["Status", status]];
  if (sc?.start_at) {
    rows.push([
      state === "running" || sc.started ? "Started" : "Estimated start",
      !sc.started && state === "queued" ? <When iso={sc.start_at} /> : <When iso={sc.start_at} hint={false} />,
    ]);
  }
  if (sc?.results_at) rows.push(["Estimated results", <When key="r" iso={sc.results_at} />]);
  else if (job.turnaround) rows.push(["Results", `${job.turnaround.charAt(0).toUpperCase()}${job.turnaround.slice(1)} of payment`]);
  if (sc?.promise_at)
    rows.push([
      "Guaranteed by",
      <span key="p">
        <When iso={sc.promise_at} hint={false} />
        <span className="text-ink-2"> (or the run is free)</span>
      </span>,
    ]);

  return (
    <Card eyebrow={express ? "Express" : "Normal delivery"} title={state === "running" ? "Your run is in progress" : "Paid"}>
      {state === "running" && it ? (
        <div className="mb-3">
          <p className="text-[16px] text-ink">
            Iteration {fmtNumber(it)}
            {of ? <span className="text-ink-2"> of up to {fmtNumber(of)}</span> : null}
          </p>
          {of ? (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
              <div className="h-full rounded-full bg-ink" style={{ width: `${pct}%` }} />
            </div>
          ) : null}
          <Fine className="mt-2">Most runs stop before the allowance, once the residuals meet their targets.</Fine>
        </div>
      ) : null}
      <Rows rows={rows} />
      <Fine className="mt-3">
        {pkg ? `${pkg.label} package. ` : ""}
        {job.stop_when_settled === undefined
          ? ""
          : job.stop_when_settled
            ? "Stops early when the answer has settled. "
            : "Runs until the residual targets or the allowance. "}
        We email you when the results are ready; this page updates by itself.
        {job.billing && Number(job.billing.on_hold_inr) > 0
          ? ` ${money(job.billing.on_hold_inr, cur)} is held in your wallet; you pay only for the iterations run and the rest comes back.`
          : ""}
      </Fine>
      {job.cancel_closed_text ? <Fine className="mt-1">{job.cancel_closed_text}</Fine> : null}
    </Card>
  );
}

/** What a cancel does, in the page's money words (amounts from the API). */
function cancelWords(job: CfdJob, cur: Currency): string[] {
  const c = job.cancel_option!;
  const out: string[] = [];
  if (c.release && Number(c.release) > 0) {
    out.push(`${money(c.release, cur)} comes back to your wallet: the whole amount held for the run. Nothing is charged for it.`);
  } else {
    out.push("The job is closed and nothing more is charged.");
  }
  if (c.quote_fee_refund && Number(c.quote_fee_refund) > 0) {
    out.push(`The pre-processing charge (${money(c.quote_fee_refund, cur)}) comes back too: the mesh and quote have not been delivered.`);
  } else if (c.quote_fee_kept && Number(c.quote_fee_kept) > 0) {
    out.push(`The ${money(c.quote_fee_kept, cur)} pre-processing charge paid for the mesh and quote you received and isn't refunded.`);
  }
  out.push("This can't be undone. To run it later, submit the job again.");
  return out;
}

/** A quiet "Cancel this job" link and its confirm dialog. */
export function CancelLink({
  job,
  busy,
  error,
  onCancel,
}: {
  job: CfdJob;
  busy: boolean;
  error: ActionError;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const cur = jobCurrency(job);
  const paid = job.cancel_option?.when === "before_start";
  return (
    <div className="px-1 text-right">
      <button
        type="button"
        className="text-[13px] text-ink-2 underline underline-offset-2 hover:text-ink"
        onClick={() => ref.current?.showModal()}
      >
        Cancel this job
      </button>
      <dialog
        ref={ref}
        aria-labelledby="cf-cancel-title"
        className="m-auto w-[min(92vw,460px)] rounded-[24px] bg-paper p-0 text-left text-ink shadow-[0_24px_60px_-20px_rgb(16_17_19/0.45)] backdrop:bg-ink/40"
      >
        <div className="p-6 sm:p-7">
          <h2 id="cf-cancel-title" className="font-heading text-[20px] leading-[1.3] font-medium">
            {paid ? "Cancel this run before it starts?" : "Cancel this job?"}
          </h2>
          <div className="mt-3 space-y-2">
            {cancelWords(job, cur).map((t) => (
              <Body key={t} className="text-[15px]">
                {t}
              </Body>
            ))}
          </div>
          <ActionErrorView error={error} refId={job.ref_id} email={job.payment?.account_email} />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" className="cf-btn-secondary w-full sm:w-auto" onClick={() => ref.current?.close()}>
              Keep the job
            </button>
            <button
              type="button"
              disabled={busy}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#b3261e] px-6 py-3 text-[14px] leading-none font-semibold tracking-[0.02em] text-white uppercase disabled:opacity-50 sm:w-auto"
              onClick={onCancel}
            >
              {busy ? "Working…" : "Cancel the job"}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

/** The cancelled state, with what happened to the money. */
export function Cancelled({ job }: { job: CfdJob }) {
  const cur = jobCurrency(job);
  const c = job.cancellation;
  const rows: [string, React.ReactNode][] = [];
  if (c?.at) rows.push(["Cancelled", fmtDate(c.at)]);
  if (c?.released && Number(c.released) > 0) rows.push(["Back in your wallet", `${money(c.released, cur)} (the whole run hold)`]);
  if (c?.quote_fee_refunded && Number(c.quote_fee_refunded) > 0)
    rows.push(["Pre-processing", `${money(c.quote_fee_refunded, cur)}, refunded (the mesh and quote were not delivered)`]);
  else if (c?.quote_fee_kept && Number(c.quote_fee_kept) > 0)
    rows.push(["Pre-processing", `${money(c.quote_fee_kept, cur)}, not refunded (it paid for the mesh and quote you received)`]);
  if (c && !(c.released && Number(c.released) > 0)) rows.push(["Charged for the run", "Nothing"]);
  return (
    <Card title="Cancelled">
      {rows.length ? <Rows rows={rows} /> : <Body>{job.status_text}</Body>}
      <Fine className="mt-3">To run this model later, submit it again. Questions? Reply to any email from us about {job.ref_id}.</Fine>
    </Card>
  );
}
