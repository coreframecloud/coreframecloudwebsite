"use client";

/**
 * Results: the lead number first (the page's one yellow highlight), the other
 * headline values as quiet tiles, the PDF report as the one primary action,
 * then the 3D view and the full case. Downloads are buttons that open the
 * tokenised API URL on click, so those URLs are never in the DOM.
 */
import dynamic from "next/dynamic";
import { useState } from "react";
import { type Currency } from "@/lib/money";
import {
  HEADLINE_LABELS,
  LEAD_HEADLINE,
  fmtNumber,
  money,
  type CfdJob,
  type ValidatedResults,
  type WalletLine,
} from "@/lib/cfd-job";
import { ActionErrorView, Card, Fine, QuietButton, WalletRow, signInHref, type ActionError } from "./parts";
import Link from "next/link";

const JobViewer = dynamic(() => import("./job-viewer"), { ssr: false });

function open(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function value(v: number | string): string {
  return typeof v === "string" ? v : fmtNumber(v);
}

export function ResultsPanel({ job }: { job: CfdJob }) {
  const h = job.headline ?? {};
  const keys = Object.keys(h);
  const lead = LEAD_HEADLINE.find((k) => h[k] != null) ?? keys[0];
  const rest = keys.filter((k) => k !== lead);
  const provisional = job.status === "not_converged";
  return (
    <Card tone="action" eyebrow="Results" title={provisional ? "Results, not converged" : "Your results are ready"}>
      {provisional ? (
        <p className="rounded-[14px] bg-tint-sand px-4 py-3 text-[14px] leading-[1.55] text-ink">
          The run ended without meeting the residual targets. Treat these numbers as provisional, or continue the
          run below.
        </p>
      ) : null}
      {lead ? (
        <div className="mt-4">
          <p className="text-[13px] text-ink-2">{(HEADLINE_LABELS[lead] ?? [lead])[0]}</p>
          <p className="mt-1 font-heading text-[31px] leading-tight font-medium text-ink">
            <span className={provisional ? "" : "rounded bg-hl px-1.5"}>
              {value(h[lead])}
              {HEADLINE_LABELS[lead]?.[1] ? ` ${HEADLINE_LABELS[lead][1]}` : ""}
            </span>
          </p>
        </div>
      ) : null}
      {rest.length ? (
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {rest.map((k) => (
            <div key={k} className="min-w-0 rounded-[16px] bg-paper-2 px-4 py-3">
              <dt className="text-[13px] leading-[1.45] text-ink-2">{(HEADLINE_LABELS[k] ?? [k])[0]}</dt>
              <dd className="mt-1 text-[20px] font-medium text-ink">
                {value(h[k])}
                {HEADLINE_LABELS[k]?.[1] ? <span className="text-[14px] text-ink-2"> {HEADLINE_LABELS[k][1]}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {job.validated ? <MeshIndependence v={job.validated} /> : null}
      {job.stop_basis ? <Fine className="mt-4">How the run ended: {job.stop_basis}</Fine> : null}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {job.report_url ? (
          <button type="button" className="cf-btn-primary w-full sm:w-auto" onClick={() => open(job.report_url!)}>
            Download the PDF report
          </button>
        ) : null}
        {job.results_url ? (
          <QuietButton onClick={() => open(job.results_url!)}>Full case (OpenFOAM, zip)</QuietButton>
        ) : null}
      </div>
      {!job.results_url && job.results_available === false ? (
        <Fine className="mt-3">
          The full case package is too large to download here; we send it to you separately.
        </Fine>
      ) : null}
      {job.view3d_url ? (
        <div className="mt-6">
          <JobViewer url={job.view3d_url} show={["pressure"]} label="3D view of the results" />
          <Fine className="mt-2">
            Drag to rotate, scroll or pinch to zoom. The buttons switch the wall pressure, the mid-plane velocity
            and the streamlines.
          </Fine>
        </div>
      ) : null}
    </Card>
  );
}

export function ContinuePanel({
  job,
  cur,
  wallet,
  signedIn,
  busy,
  error,
  onContinue,
}: {
  job: CfdJob;
  cur: Currency;
  wallet: WalletLine | null | "signed_out";
  signedIn: boolean;
  busy: boolean;
  error: ActionError;
  onContinue: (body: { iterations: number; express: boolean }) => void;
}) {
  const c = job.continue_option!;
  const [n, setN] = useState("1000");
  const [express, setExpress] = useState(false);
  const iters = Math.max(1, Math.min(c.max_iterations, parseInt(n, 10) || 0));
  return (
    <Card title="Run it longer">
      <Fine>{c.note.replace(/plus GST/, cur === "USD" ? "no GST" : "plus GST")}</Fine>
      {c.express ? (
        <label className="mt-3 flex cursor-pointer items-start gap-3 text-[14px] text-ink-2">
          <input
            type="checkbox"
            checked={express}
            onChange={(e) => setExpress(e.target.checked)}
            className="mt-1 size-4 shrink-0 accent-ink"
          />
          <span>{c.express.text}</span>
        </label>
      ) : null}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-[14px] text-ink-2">
          Continue for
          <input
            type="number"
            min={1}
            max={c.max_iterations}
            value={n}
            onChange={(e) => setN(e.target.value)}
            className="h-11 w-28 rounded-full border border-rule-strong bg-paper px-4 text-ink"
          />
          more iterations
        </label>
        {signedIn ? (
          <QuietButton busy={busy} onClick={() => onContinue({ iterations: iters, express })}>
            Pay from wallet and continue
          </QuietButton>
        ) : (
          <Link href={signInHref(job.ref_id)} className="cf-btn-secondary w-full sm:w-auto">
            Sign in to continue
          </Link>
        )}
      </div>
      <Fine className="mt-2">Up to {fmtNumber(c.max_iterations)} more iterations. The price is held from your wallet and only the iterations run are charged.</Fine>
      <div className="mt-3">
        <WalletRow wallet={wallet} cur={cur} refId={job.ref_id} email={job.payment?.account_email} />
      </div>
      <ActionErrorView error={error} refId={job.ref_id} email={job.payment?.account_email} />
    </Card>
  );
}

/** What has moved on this job so far. */
export function BillingLine({ job, cur }: { job: CfdJob; cur: Currency }) {
  const b = job.billing;
  if (!b) return null;
  const usd = cur === "USD";
  const items: [string, string][] = [];
  if (b.quote_fee?.amount_inr)
    items.push([
      "Quote fee",
      `${money(b.quote_fee.amount_inr, cur)}${usd ? "" : " incl. GST"}${b.quote_fee.state === "refunded" ? " (refunded)" : ""}`,
    ]);
  if (Number(b.on_hold_inr) > 0) items.push(["On hold for the run", money(b.on_hold_inr, cur)]);
  if (Number(b.charged_inr) > 0) items.push(["Charged for the run", money(b.charged_inr, cur)]);
  if (Number(b.credited_inr) > 0) items.push(["Credited back", money(b.credited_inr, cur)]);
  if (!items.length) return null;
  return (
    <div className="rounded-[20px] bg-paper-2 px-5 py-4 sm:px-7">
      <p className="font-mono text-[12px] tracking-[0.14em] text-ink-3 uppercase">Payments on this job</p>
      <dl className="mt-2 grid gap-x-6 gap-y-1 text-[14px] sm:grid-cols-2">
        {items.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 border-b border-rule py-1.5 last:border-0 sm:[&:nth-last-child(2)]:border-0">
            <dt className="text-ink-2">{k}</dt>
            <dd className="text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Validated package: the three meshes and the GCI verdict (cfd_validated.results_view). */
function MeshIndependence({ v }: { v: ValidatedResults }) {
  const q = v.quantities?.pressure_drop_pa;
  const n = (x: number | null | undefined, sig = 4) => (x == null ? "–" : fmtNumber(Number(x.toPrecision(sig))));
  const solved = (s?: string | null) => s === "completed" || s === "not_converged";
  return (
    <section className="mt-6 rounded-[16px] bg-paper-2 px-4 py-4 sm:px-5" aria-label="Mesh independence">
      <p className="font-mono text-[12px] tracking-[0.14em] text-ink-3 uppercase">Mesh independence (GCI)</p>
      {v.verdict ? <p className="mt-2 text-[15px] leading-[1.55] font-medium text-ink">{v.verdict}</p> : null}
      <table className="mt-3 w-full border-collapse text-[13px] text-ink-2">
        <thead>
          <tr className="text-left text-[12px] text-ink-3">
            <th scope="col" className="py-1 pr-2 font-normal">Mesh</th>
            <th scope="col" className="py-1 pr-2 text-right font-normal">Cells</th>
            <th scope="col" className="py-1 pr-2 text-right font-normal">Static ΔP (Pa)</th>
            <th scope="col" className="hidden py-1 pr-2 text-right font-normal sm:table-cell">Total ΔP (Pa)</th>
            <th scope="col" className="py-1 text-right font-normal">K</th>
          </tr>
        </thead>
        <tbody>
          {v.levels.map((l) => (
            <tr key={l.level} className="border-t border-rule">
              <th scope="row" className="py-1.5 pr-2 text-left font-normal text-ink capitalize">
                {l.level}
                {l.level === v.delivered_level ? <span className="text-ink-3"> · report</span> : null}
              </th>
              <td className="py-1.5 pr-2 text-right">{l.cells ? fmtNumber(l.cells) : "–"}</td>
              {solved(l.status) ? (
                <>
                  <td className="py-1.5 pr-2 text-right">{n(l.pressure_drop_pa)}</td>
                  <td className="hidden py-1.5 pr-2 text-right sm:table-cell">{n(l.total_pressure_drop_pa)}</td>
                  <td className="py-1.5 text-right">{n(l.loss_coefficient_k)}</td>
                </>
              ) : (
                <td colSpan={3} className="py-1.5 text-right text-ink-3">
                  not solved
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {v.computed && q ? (
        <Fine className="mt-3">
          Apparent order p = {n(q.apparent_order, 3)}
          {q.order_used != null && q.apparent_order != null && q.order_used < q.apparent_order
            ? ` (limited to ${n(q.order_used, 2)} for the band)`
            : ""}
          ; extrapolated ΔP {n(q.extrapolated)} Pa; GCI on the fine mesh {n(q.gci_fine_pct, 2)} %
          {v.threshold_pct != null ? ` (limit ${v.threshold_pct} %)` : ""}. The method and the plot are in the PDF report.
        </Fine>
      ) : null}
      {v.levels
        .filter((l) => !solved(l.status) && l.reason)
        .map((l) => (
          <Fine key={l.level} className="mt-2">
            <span className="capitalize">{l.level}</span> mesh: {l.reason}. Not charged.
          </Fine>
        ))}
    </section>
  );
}
