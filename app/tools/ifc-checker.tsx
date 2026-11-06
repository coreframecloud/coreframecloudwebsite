"use client";

import { useRef, useState, type ReactNode } from "react";

/**
 * The upload box and report for the free IFC checker (moved into the site
 * 6 Nov 2026; it was the control plane's apps/tools/web/tools.html).
 *
 * THE WORK STAYS ON THE CONTROL PLANE. This component only posts the file to
 * /api/tools/ifc-check, which next.config.ts rewrites (same origin, so no CORS
 * and no extra CSP host) to control.coreframecloud.com, where the checker reads
 * it in a temporary file and deletes it. The API contract is unchanged:
 *   POST /api/tools/ifc-check        multipart "file"  -> report JSON
 *   POST /api/tools/ifc-check/share  {report, email?}  -> {url, expires_in_days}
 * One request each, no polling: the check answers in a few seconds.
 *
 * 95 MB IN THE BROWSER: Cloudflare refuses bodies over 100 MB at the edge, in
 * front of the control plane, and the visitor would see its error page rather
 * than ours. So the size is checked here first, where it can be explained. The
 * server refuses above 95 MB too (apps/tools/app/ifccheck.py MAX_BYTES); do not
 * raise one without the other.
 */

const MAX_MB = 95;

type Finding = {
  severity: "blocker" | "warning" | "info" | string;
  title: string;
  detail: string;
  examples: string[];
  fix: string;
  reference: string;
};

export type IfcReport = {
  file: string;
  schema: string;
  exported_by: string;
  entities: number;
  blockers: number;
  warnings: number;
  findings: Finding[];
  limits: string[];
  verify_independently?: string[];
  disclaimer: string;
};

/** "**x**" becomes <strong>x</strong>; everything else stays text (React escapes it). */
function bold(s: string): ReactNode[] {
  return s.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i} className="font-semibold text-ink">{part}</strong> : part));
}

const SEV_BORDER: Record<string, string> = {
  blocker: "border-l-[#b3322f]",
  warning: "border-l-[#8a6a00]",
  info: "border-l-ink-3",
};
const SEV_TITLE: Record<string, string> = {
  blocker: "text-[#a32c29]",
  warning: "text-[#7a5d00]",
  info: "text-ink-2",
};

function Spinner() {
  return (
    <span
      aria-hidden
      className="mr-2 inline-block size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white align-[-2px]"
    />
  );
}

export function IfcChecker() {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [tooBig, setTooBig] = useState<{ name: string; mb: number } | null>(null);
  const [hot, setHot] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<IfcReport | null>(null);

  function pick(f: File | undefined) {
    if (!f) return;
    const mb = f.size / 1048576;
    if (mb > MAX_MB) {
      setFile(null);
      setTooBig({ name: f.name, mb });
      return;
    }
    setTooBig(null);
    setFile(f);
  }

  async function run() {
    if (!file) return;
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await fetch("/api/tools/ifc-check", { method: "POST", body: fd });
      const d = await r.json().catch(() => ({ detail: `The checker answered ${r.status}.` }));
      if (!r.ok) throw new Error(typeof d.detail === "string" ? d.detail : JSON.stringify(d.detail));
      setReport(d as IfcReport);
    } catch (e) {
      setReport(null);
      setError(e instanceof Error ? e.message : String(e));
    }
    setBusy(false);
  }

  return (
    <div>
      <div className="rounded-[24px] border border-rule bg-paper p-5 sm:p-7">
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setHot(true);
          }}
          onDragLeave={() => setHot(false)}
          onDrop={(e) => {
            e.preventDefault();
            setHot(false);
            pick(e.dataTransfer.files[0]);
          }}
          className={`block w-full cursor-pointer rounded-[16px] border-[1.5px] border-dashed px-4 py-10 text-center transition-colors ${
            hot ? "border-blue bg-blue-soft text-ink" : "border-rule-strong text-ink-2 hover:border-blue hover:bg-blue-soft"
          }`}
        >
          <span className="mb-1 block text-[17px] font-semibold text-ink">Drop an .ifc file here</span>
          {tooBig ? (
            <span className="block text-[14px]">
              <span className="text-[#b3322f]">
                {tooBig.name} is {tooBig.mb.toFixed(0)} MB: too large to upload (limit {MAX_MB} MB).
              </span>
              <br />
              <span className="text-ink-3">
                Export a single level or a single discipline from Revit. A whole-building model is more than any CFD
                study needs anyway.
              </span>
            </span>
          ) : (
            <span className="block text-[14px]">
              {file ? `${file.name} · ${(file.size / 1048576).toFixed(1)} MB` : `or tap to choose · up to ${MAX_MB} MB`}
            </span>
          )}
        </button>
        <input
          ref={input}
          type="file"
          accept=".ifc,.ifcxml"
          hidden
          onChange={(e) => pick(e.target.files?.[0])}
          data-testid="ifc-file"
        />
        <div className="mt-4">
          <button type="button" className="cf-btn-primary disabled:cursor-not-allowed disabled:opacity-40" disabled={!file || busy} onClick={run}>
            {busy ? (
              <>
                <Spinner />
                Reading…
              </>
            ) : (
              "Check the model"
            )}
          </button>
        </div>
      </div>

      <div aria-live="polite">
        {error ? (
          <div className="mt-4 rounded-[20px] border border-rule bg-paper p-5">
            <b className="text-[#b3322f]">Could not read that file</b>
            <p className="mt-2 text-[14px] text-ink-3">{error}</p>
          </div>
        ) : null}
        {report ? <IfcReportView report={report} shareable /> : null}
      </div>
    </div>
  );
}

export function IfcReportView({ report: d, shareable }: { report: IfcReport; shareable: boolean }) {
  const cls = d.blockers ? "blocked" : d.warnings ? "attention" : "clean";
  const word = d.blockers ? "Will not convert cleanly" : d.warnings ? "Convertible, with caveats" : "No known issues found";
  const tone = {
    blocked: "bg-[#fdf3f2] border-[#e8c9c6]",
    attention: "bg-[#fdf8ec] border-[#e6d5a8]",
    clean: "bg-[#f1f8f3] border-[#c3e0cd]",
  }[cls];

  return (
    <>
      <div className="mt-4 rounded-[24px] border border-rule bg-paper p-5 sm:p-7" data-testid="ifc-report">
        <div className={`mb-4 rounded-[14px] border px-4 py-3.5 ${tone}`}>
          <div className="text-[17px] font-semibold">{word}</div>
          <div className="text-[13px] text-ink-2">
            {d.blockers} blocker{d.blockers === 1 ? "" : "s"} · {d.warnings} warning{d.warnings === 1 ? "" : "s"}
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {[d.file, d.schema, `${d.entities.toLocaleString()} entities`, `exported by ${d.exported_by}`].map((m) => (
            <span key={m} className="max-w-full rounded-md border border-rule bg-paper-2 px-2.5 py-1 font-mono text-[13px] break-all text-ink-2">
              {m}
            </span>
          ))}
        </div>
        {d.findings.map((f, i) => (
          <div key={i} className={`my-3.5 border-l-2 py-3 pl-4 ${SEV_BORDER[f.severity] ?? "border-l-rule-strong"}`}>
            <div className={`mb-1 font-semibold ${SEV_TITLE[f.severity] ?? "text-ink"}`}>{f.title}</div>
            <div className="text-[15px] text-ink-2">{f.detail}</div>
            {f.examples.length ? (
              <ul className="mt-2 list-disc pl-5 text-[13.5px] break-words text-ink-3">
                {f.examples.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            ) : null}
            {f.fix ? (
              <div className="mt-2.5 rounded-[10px] border border-rule bg-paper-2 px-3.5 py-2.5 text-[14px] text-ink">
                <b className="text-blue-ink">What to do:</b> {f.fix}
              </div>
            ) : null}
            {f.reference ? (
              <div className="mt-2">
                <a href={f.reference} target="_blank" rel="noopener" className="text-[13px] text-blue underline underline-offset-2">
                  reference
                </a>
              </div>
            ) : null}
          </div>
        ))}
        <div className="mt-5 border-t border-rule pt-4 text-[13px] leading-6 text-ink-3">
          <b className="text-ink-2">Limits of this check</b>
          <ul className="mt-1">
            {d.limits.map((l) => (
              <li key={l}>· {l}</li>
            ))}
          </ul>
        </div>
        <div className="mt-5 rounded-[14px] border border-[#e6d5a8] bg-[#fdf8ec] px-4 py-4">
          <b className="text-[13px] tracking-[0.08em] text-[#7a5d00] uppercase">Before you act on this</b>
          <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-[14px] leading-6 text-ink-2">
            {(d.verify_independently ?? []).map((v) => (
              <li key={v}>{bold(v)}</li>
            ))}
          </ul>
          <p className="mt-3 border-t border-[#e6d5a8] pt-3 text-[13px] leading-6 text-ink-3">{d.disclaimer}</p>
        </div>
      </div>
      {shareable ? <ShareBox report={d} /> : null}
    </>
  );
}

function ShareBox({ report }: { report: IfcReport }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [made, setMade] = useState<{ url: string; days: number } | null>(null);

  async function share() {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/tools/ifc-check/share", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ report, email: email || null }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(typeof d.detail === "string" ? d.detail : "Could not create the link");
      setMade({ url: d.url, days: d.expires_in_days });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
    setBusy(false);
  }

  return (
    <div className="mt-4 rounded-[24px] bg-tint-blue p-5 sm:p-7">
      <b>Send this to whoever has to fix it</b>
      <p className="mt-1.5 text-[14px] text-ink-2">
        Usually that is not the person who ran the check: the model owner has to re-export. This makes a link you can
        paste into an email. Optional; the report above is yours either way.
      </p>
      {made ? (
        <p className="mt-3 text-[14px] break-all" data-testid="share-link">
          <span className="text-[#1f7a4d]">Link created</span>:{" "}
          <a href={made.url} className="text-blue underline underline-offset-2">
            {made.url}
          </a>
          <br />
          <span className="text-ink-3">Kept for {made.days} days.</span>
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2.5">
          <label className="sr-only" htmlFor="shareemail">
            Your email (optional)
          </label>
          <input
            id="shareemail"
            type="email"
            placeholder="your email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 min-w-[200px] flex-1 rounded-full border border-rule-strong bg-paper px-4 text-[15px] outline-none focus:border-blue"
          />
          <button type="button" className="cf-btn-secondary bg-paper disabled:opacity-40" disabled={busy} onClick={share}>
            {busy ? "Creating…" : "Create link"}
          </button>
        </div>
      )}
      {err ? <p className="mt-2 text-[14px] text-[#b3322f]">{err}</p> : null}
    </div>
  );
}
