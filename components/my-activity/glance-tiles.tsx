"use client";

/**
 * My Activity at a glance (owner, 23 Nov 2026): the session the customer is in
 * (or their last one), the month so far, recent sessions as cards, and the N:
 * drive. Everything here is read from data the page already loads; nothing is
 * fetched twice.
 */

import { useEffect, useState } from "react";
import { formatMoney, type Currency } from "@/lib/money";

export interface GlanceSession {
  id: string | number;
  status: string;
  login_time: string;
  logout_time: string | null;
  billable_minutes: number;
  billed_amount_rupees: number;
  stream_started_at?: string | null;
  gpu_name?: string | null;
}

const ENDED = new Set(["ended", "cancelled", "canceled", "failed", "expired"]);

export function isLive(s: GlanceSession): boolean {
  return !s.logout_time && !ENDED.has(String(s.status).toLowerCase());
}

function money(x: number, cur: Currency): string {
  if (cur === "USD") return formatMoney(Math.abs(x), "USD");
  const whole = Math.abs(x - Math.round(x)) < 0.005;
  return `₹${Math.abs(x).toLocaleString("en-IN", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  })}`;
}

export function duration(mins: number): string {
  const m = Math.max(0, Math.round(mins));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} h ${r} m` : `${h} h`;
}

function when(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const y = new Date();
  y.setDate(today.getDate() - 1);
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  if (d.toDateString() === today.toDateString()) return `Today, ${time}`;
  if (d.toDateString() === y.toDateString()) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${time}`;
}

const label = (s: GlanceSession) => s.gpu_name?.replace(/^NVIDIA\s+/, "") || "GPU workstation";

/** The live session, or the last one. */
export function NowTile({ sessions, currency }: { sessions: GlanceSession[]; currency: Currency }) {
  const live = sessions.find(isLive);
  const last = sessions.find((s) => !isLive(s));
  // A clock for the live timer, ticked every 30 s (never read during render).
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!live) return;
    const tick = () => setNow(Date.now());
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, [live]);
  return (
    <section className="cf-glass flex flex-col p-5">
      <h2 className="cf-eyebrow">{live ? "Right now" : "Last session"}</h2>
      {live ? (
        <>
          <p className="mt-3 flex items-center gap-2 font-display text-lg leading-6 font-semibold text-ink">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue/60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue" />
            </span>
            {label(live)}
          </p>
          <p className="mt-1 text-sm tabular-nums text-ink-2">
            {live.stream_started_at && now != null
              ? `Streaming for ${duration((now - new Date(live.stream_started_at).getTime()) / 60000)}`
              : "Getting ready"}
          </p>
          <p className="mt-auto pt-3 text-xs text-ink-3">Billed per minute while you stream.</p>
        </>
      ) : last ? (
        <>
          <p className="mt-3 font-display text-lg leading-6 font-semibold text-ink">{label(last)}</p>
          <p className="mt-1 text-sm tabular-nums text-ink-2">
            {duration(last.billable_minutes)} · {money(last.billed_amount_rupees, currency)}
          </p>
          <p className="mt-auto pt-3 text-xs text-ink-3">{when(last.login_time)}</p>
        </>
      ) : (
        <>
          <p className="mt-3 font-display text-lg leading-6 font-semibold text-ink">No sessions yet</p>
          <p className="mt-1 text-sm leading-6 text-ink-2">Launch a workstation from the Connect app.</p>
        </>
      )}
    </section>
  );
}

/** Sessions started this calendar month. */
export function MonthTile({ sessions, currency }: { sessions: GlanceSession[]; currency: Currency }) {
  const now = new Date();
  const mine = sessions.filter((s) => {
    const d = new Date(s.login_time);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const minutes = mine.reduce((a, s) => a + (s.billable_minutes || 0), 0);
  const spent = mine.reduce((a, s) => a + (s.billed_amount_rupees || 0), 0);
  return (
    <section className="cf-glass flex flex-col p-5">
      <h2 className="cf-eyebrow">This month</h2>
      <p className="mt-3 font-display text-2xl leading-none font-semibold tabular-nums text-ink">{duration(minutes)}</p>
      <p className="mt-2 text-sm tabular-nums text-ink-2">
        {mine.length} {mine.length === 1 ? "session" : "sessions"} · {money(spent, currency)}
      </p>
      <p className="mt-auto pt-3 text-xs text-ink-3">
        {now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
      </p>
    </section>
  );
}

/** The N: drive: what survives a session, and how full it is. */
export function FilesTile({ usedBytes, quotaGb }: { usedBytes: number; quotaGb: number | null }) {
  const usedGb = usedBytes / 1024 ** 3;
  const pct = quotaGb && quotaGb > 0 ? Math.min(100, (usedGb / quotaGb) * 100) : null;
  return (
    <section className="cf-glass flex flex-col p-5">
      <h2 className="cf-eyebrow">Your files</h2>
      <p className="mt-3 font-display text-2xl leading-none font-semibold tabular-nums text-ink">
        {usedGb < 0.1 ? `${Math.round(usedBytes / 1024 ** 2)} MB` : `${usedGb.toFixed(usedGb < 10 ? 1 : 0)} GB`}
        {quotaGb ? <span className="text-base font-normal text-ink-3"> of {quotaGb} GB</span> : null}
      </p>
      {pct != null && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
          <div className="h-full rounded-full bg-blue" style={{ width: `${Math.max(2, pct)}%` }} />
        </div>
      )}
      <p className="mt-auto pt-3 text-xs leading-5 text-ink-3">
        Save to <span className="font-mono text-ink">N:</span> inside a session. Everything else is wiped.{" "}
        <a href="#where-work-is-saved" className="text-blue underline-offset-2 hover:underline">How</a>
      </p>
    </section>
  );
}

/** The last few sessions as small cards; the full history stays in Activity below. */
export function RecentSessions({ sessions, currency }: { sessions: GlanceSession[]; currency: Currency }) {
  const done = sessions.filter((s) => !isLive(s) && (s.billable_minutes > 0 || s.billed_amount_rupees > 0)).slice(0, 4);
  if (done.length === 0) return null;
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="cf-eyebrow">Recent sessions</h2>
        <a href="#activity" className="text-sm text-blue underline-offset-2 hover:underline">All activity</a>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {done.map((s) => (
          <div key={s.id} className="cf-glass-inset flex flex-col gap-1 p-4">
            <p className="text-sm font-semibold text-ink">{label(s)}</p>
            <p className="text-xs text-ink-3">{when(s.login_time)}</p>
            <p className="mt-1 text-sm tabular-nums text-ink-2">
              {duration(s.billable_minutes)} · {money(s.billed_amount_rupees, currency)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
