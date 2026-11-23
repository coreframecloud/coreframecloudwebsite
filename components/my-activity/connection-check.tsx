"use client";

/**
 * "Your connection" on My Activity (owner, 23 Nov 2026). A customer streaming
 * from Colombia (~250-300 ms to India) found the cursor laggy only after paying.
 * This tells a visitor what to expect BEFORE they work: delay to our servers in
 * India, download speed, and one plain rating.
 *
 * HOW THE DELAY IS MEASURED (interim, until a direct test host exists):
 * control.coreframecloud.com sits behind Cloudflare, so a request to it first
 * reaches the Cloudflare server nearest the visitor.
 *   - edge  = /cdn-cgi/trace, answered by that nearest Cloudflare server.
 *   - full  = /api/health, which Cloudflare forwards to our server in India.
 * Abroad, `full` is close to the real stream delay (visitor -> nearby edge ->
 * India). Inside India Cloudflare sometimes routes via Singapore (measured from
 * Bengaluru, 23 Nov: full 140 ms against a 29 ms direct ping), so an Indian
 * account is rated on `edge`, which is already an overestimate there.
 * When the direct test host (the mini PC beside the GPU nodes) is live, set
 * NEXT_PUBLIC_STREAM_CHECK_URL to its ping URL and it is used for everyone.
 *
 * Speed: two downloads of a 4 MB CDN-cached block (/api/speed-sample), best of two.
 * The last result is kept in this browser only.
 */

import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "@/lib/api-base";

type Level = 0 | 1 | 2 | 3; // poor, fair, good, excellent

interface Result {
  delayMs: number;
  jitterMs: number;
  mbps: number | null;
  level: Level;
  at: number;
  method: "direct" | "edge" | "full";
}

const STORE = "cf_conn_check_v1";
const DIRECT = (process.env.NEXT_PUBLIC_STREAM_CHECK_URL || "").trim();

const LEVELS: { name: string; line: string }[] = [
  { name: "Poor", line: "Expect noticeable cursor lag. Not recommended for interactive modelling; rendering and batch work are fine." },
  { name: "Fair", line: "A slight delay when you orbit or draw. Fine for rendering and batch work." },
  { name: "Good", line: "Fine for modelling, viewport work and rendering." },
  { name: "Excellent", line: "Feels local. Smooth for modelling, viewport work and rendering." },
];

function delayLevel(ms: number): Level {
  if (ms < 60) return 3;
  if (ms < 120) return 2;
  if (ms < 200) return 1;
  return 0;
}

function speedLevel(mbps: number | null): Level {
  if (mbps == null) return 3; // unknown speed never lowers the rating
  if (mbps >= 50) return 3;
  if (mbps >= 25) return 2;
  if (mbps >= 10) return 1;
  return 0;
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

async function timeOnce(url: string, init: RequestInit): Promise<number> {
  const sep = url.includes("?") ? "&" : "?";
  const t0 = performance.now();
  await fetch(`${url}${sep}r=${Math.random().toString(36).slice(2)}`, { cache: "no-store", ...init });
  return performance.now() - t0;
}

async function sample(url: string, init: RequestInit, n: number): Promise<{ med: number; jitter: number }> {
  await timeOnce(url, init); // warm-up: opens the connection, not counted
  const xs: number[] = [];
  for (let i = 0; i < n; i++) xs.push(await timeOnce(url, init));
  const s = [...xs].sort((a, b) => a - b);
  return { med: median(xs), jitter: s[Math.floor(s.length * 0.8)] - s[Math.floor(s.length * 0.2)] };
}

async function measureSpeed(): Promise<number | null> {
  let best: number | null = null;
  for (let i = 0; i < 2; i++) {
    try {
      const t0 = performance.now();
      const r = await fetch(`/api/speed-sample?r=${Math.random().toString(36).slice(2)}`, { cache: "no-store" });
      const bytes = (await r.arrayBuffer()).byteLength;
      const secs = (performance.now() - t0) / 1000;
      if (bytes > 0 && secs > 0) {
        const mbps = (bytes * 8) / secs / 1e6;
        best = best == null ? mbps : Math.max(best, mbps);
      }
    } catch {
      /* keep what we have */
    }
  }
  return best;
}

function readStored(): Result | null {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return null;
    const r = JSON.parse(raw) as Result;
    return typeof r?.delayMs === "number" ? r : null;
  } catch {
    return null;
  }
}

function ago(at: number): string {
  const m = Math.round((Date.now() - at) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

export default function ConnectionCheck({ inIndia, className = "" }: { inIndia: boolean; className?: string }) {
  const [result, setResult] = useState<Result | null>(null);
  const [running, setRunning] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setResult(readStored());
  }, []);

  const run = useCallback(async () => {
    setRunning(true);
    setFailed(false);
    try {
      let delay: { med: number; jitter: number };
      let method: Result["method"];
      if (DIRECT) {
        delay = await sample(DIRECT, { mode: "no-cors" }, 8);
        method = "direct";
      } else {
        const origin = new URL(API_BASE).origin;
        if (inIndia) {
          delay = await sample(`${origin}/cdn-cgi/trace`, { mode: "no-cors" }, 8);
          method = "edge";
        } else {
          delay = await sample(`${API_BASE}/health`, { credentials: "omit" }, 8);
          method = "full";
        }
      }
      const mbps = await measureSpeed();
      const level = Math.min(delayLevel(delay.med), speedLevel(mbps)) as Level;
      const r: Result = {
        delayMs: Math.round(delay.med),
        jitterMs: Math.round(delay.jitter),
        mbps: mbps == null ? null : Math.round(mbps),
        level,
        at: Date.now(),
        method,
      };
      setResult(r);
      try {
        localStorage.setItem(STORE, JSON.stringify(r));
      } catch {
        /* private window: show it, just don't keep it */
      }
    } catch {
      setFailed(true);
    } finally {
      setRunning(false);
    }
  }, [inIndia]);

  const lvl = result ? LEVELS[result.level] : null;
  const tone =
    result == null ? "text-ink-3" : result.level === 0 ? "text-destructive" : result.level === 1 ? "text-ink" : "text-blue";

  return (
    <section className={`cf-glass flex flex-col p-5 sm:p-6 ${className}`} aria-live="polite">
      <h2 className="cf-eyebrow">Your connection</h2>

      {result && lvl ? (
        <>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex gap-1" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-2.5 w-5 rounded-full ${
                    i <= result.level
                      ? result.level === 0
                        ? "bg-destructive"
                        : "bg-blue"
                      : "bg-ink/10"
                  }`}
                />
              ))}
            </span>
            <p className={`font-display text-2xl leading-none font-semibold ${tone}`}>{lvl.name}</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-ink-2">{lvl.line}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="cf-glass-inset px-3 py-2">
              <dt className="text-xs text-ink-3">Delay to India</dt>
              <dd className="font-semibold tabular-nums text-ink">
                {result.delayMs} ms{result.jitterMs >= 15 ? <span className="font-normal text-ink-3"> ±{result.jitterMs}</span> : null}
              </dd>
            </div>
            <div className="cf-glass-inset px-3 py-2">
              <dt className="text-xs text-ink-3">Download</dt>
              <dd className="font-semibold tabular-nums text-ink">
                {result.mbps == null ? "n/a" : `${result.mbps} Mbps`}
              </dd>
            </div>
          </dl>
          {result.mbps != null && result.mbps < 25 && (
            <p className="mt-3 text-xs leading-5 text-ink-2">A sharp 1080p stream needs about 25 Mbps; 4K about 50.</p>
          )}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
            <span className="text-xs text-ink-3">Checked {ago(result.at)} · estimate</span>
            <button type="button" onClick={() => void run()} disabled={running} className="cf-btn-secondary">
              {running ? "Checking…" : "Test again"}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm leading-6 text-ink-2">
            Your workstation streams from India. Check how smooth it will feel from where you are: it takes about
            ten seconds.
          </p>
          <div className="mt-auto pt-4">
            <button type="button" onClick={() => void run()} disabled={running} className="cf-btn-primary w-full sm:w-auto">
              {running ? "Checking…" : "Check my connection"}
            </button>
          </div>
        </>
      )}
      {failed && (
        <p className="mt-3 text-xs leading-5 text-destructive">The check could not finish. Please try again.</p>
      )}
    </section>
  );
}
