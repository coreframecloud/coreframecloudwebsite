"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchMyCfdJobs, type MyCfdJob } from "@/lib/cfd-my-jobs";
import { formatMoney, parseCurrency } from "@/lib/money";

/**
 * "CFD jobs" on /my-activity (16 Oct 2026). Owner: "where can the user see his
 * job when logged in, i don't see the job anywhere tagged to profile".
 *
 * The signed-in account's jobs from GET /me/cfd-jobs, newest first: name,
 * reference, status, the one next step when the customer has something to do
 * (the only yellow on the section), the date and what has been charged so far.
 * Each row opens /cfd/jobs/<ref>, which loads with the session (no email link).
 */

const PAGE = 10;

const TONE: Record<MyCfdJob["tone"], string> = {
  attention: "border-ink/30 text-ink",
  active: "border-blue/30 text-blue-ink",
  done: "border-[#1d6b43]/30 text-[#1d6b43]",
  ended: "border-rule-strong text-ink-3",
};

function day(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(/[zZ]|[+-]\d\d:\d\d$/.test(iso) ? iso : `${iso}Z`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function amount(v: string, cur: string): string {
  return formatMoney(Number(v) || 0, parseCurrency(cur) ?? "INR");
}

export function JobRow({ job }: { job: MyCfdJob }) {
  const spent = Number(job.spent) || 0;
  const held = Number(job.held) || 0;
  const dp = job.headline?.pressure_drop_pa;
  return (
    <li>
      <Link
        href={`/cfd/jobs/${encodeURIComponent(job.ref)}`}
        className="flex items-start justify-between gap-4 px-4 py-3.5 transition hover:bg-paper-2 focus-visible:bg-paper-2 sm:px-6"
      >
        <div className="min-w-0">
          <p className="text-[15px] leading-6 font-medium break-words text-ink">
            {job.name}
            <span
              className={`ml-2 inline-block rounded-full border bg-paper px-2 py-0.5 align-[1px] text-[11px] leading-4 font-medium whitespace-nowrap ${TONE[job.tone] ?? TONE.active}`}
            >
              {job.status_label}
            </span>
          </p>
          <p className="mt-0.5 text-xs leading-5 text-ink-2">
            <span className="font-mono text-[11px] tracking-[0.08em] text-ink-3 uppercase">{job.ref}</span>
            <span className="text-ink-3"> · </span>
            <span className="whitespace-nowrap">{day(job.created_at)}</span>
            {dp != null ? (
              <>
                <span className="text-ink-3"> · </span>
                <span className="whitespace-nowrap">Pressure drop {dp.toLocaleString("en-IN", { maximumFractionDigits: 1 })} Pa</span>
              </>
            ) : null}
          </p>
          {job.needs_action ? (
            <p className="mt-1.5 text-[13px] leading-5 font-medium text-ink">
              <span className="rounded-[3px] bg-hl px-1 py-px">{job.needs_action.label}</span>
              <span aria-hidden="true" className="ml-1 text-ink-3">→</span>
            </p>
          ) : null}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[15px] leading-6 font-medium whitespace-nowrap tabular-nums text-ink">
            {spent > 0 ? amount(job.spent, job.currency) : "—"}
          </p>
          <p className="mt-0.5 text-xs whitespace-nowrap tabular-nums text-ink-3">
            {held > 0 ? `${amount(job.held, job.currency)} on hold` : spent > 0 ? "charged" : "nothing charged"}
          </p>
        </div>
      </Link>
    </li>
  );
}

export function CfdJobsList({
  jobs,
  more,
  loadingMore,
  onMore,
  state = "ok",
}: {
  jobs: MyCfdJob[];
  more?: boolean;
  loadingMore?: boolean;
  onMore?: () => void;
  state?: "loading" | "error" | "ok";
}) {
  return (
    <section id="cfd-jobs" className="cf-glass scroll-mt-24 overflow-hidden" aria-labelledby="cfd-jobs-title">
      <div className="border-b border-rule px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="cfd-jobs-title" className="cf-section-title">CFD jobs.</h2>
          <p className="text-xs text-ink-3">Your simulations, newest first.</p>
        </div>
      </div>
      {state === "loading" ? (
        <p className="px-4 py-8 text-sm text-ink-3 sm:px-6">Loading your CFD jobs…</p>
      ) : state === "error" ? (
        <p className="px-4 py-8 text-sm text-ink-2 sm:px-6">We could not load your CFD jobs. Reload the page to try again.</p>
      ) : jobs.length === 0 ? (
        <p className="px-4 py-8 text-sm text-ink-2 sm:px-6">
          No CFD jobs yet —{" "}
          <Link href="/cfd#start" className="font-medium text-blue underline-offset-2 hover:text-blue-ink hover:underline">
            Start one
          </Link>
        </p>
      ) : (
        <>
          <ul className="divide-y divide-rule">
            {jobs.map((j) => (
              <JobRow key={j.ref} job={j} />
            ))}
          </ul>
          {more ? (
            <div className="border-t border-rule px-4 py-3 sm:px-6">
              <button
                type="button"
                onClick={onMore}
                disabled={loadingMore}
                className="min-h-9 text-[13px] font-medium text-ink-2 transition hover:text-ink disabled:opacity-60"
              >
                {loadingMore ? "Loading…" : "Show more"}
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

/** The live section on /my-activity: `token` is the page's signed-in bearer. */
export default function MyCfdJobs({ token }: { token: string | null }) {
  const [jobs, setJobs] = useState<MyCfdJob[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "error" | "ok">("loading");
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!token) return;
    let gone = false;
    void fetchMyCfdJobs(token, { limit: PAGE }).then((r) => {
      if (gone) return;
      if (r === null || r === "signed_out") {
        setState("error");
        return;
      }
      setJobs(r.jobs);
      setCursor(r.next_cursor);
      setState("ok");
      // Arrived from the header's "CFD jobs" link: the section exists only now.
      if (window.location.hash === "#cfd-jobs") {
        requestAnimationFrame(() => document.getElementById("cfd-jobs")?.scrollIntoView());
      }
    });
    return () => {
      gone = true;
    };
  }, [token]);

  const more = useCallback(async () => {
    if (!token || !cursor) return;
    setLoadingMore(true);
    const r = await fetchMyCfdJobs(token, { limit: PAGE, cursor });
    setLoadingMore(false);
    if (r && r !== "signed_out") {
      setJobs((prev) => [...prev, ...r.jobs.filter((j) => !prev.some((p) => p.ref === j.ref))]);
      setCursor(r.next_cursor);
    }
  }, [token, cursor]);

  if (!token) return null;
  return <CfdJobsList jobs={jobs} more={!!cursor} loadingMore={loadingMore} onMore={() => void more()} state={state} />;
}
