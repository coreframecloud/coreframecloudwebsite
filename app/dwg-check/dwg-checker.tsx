"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Upload box and report for the free DWG dimension checker (moved into the
 * site 6 Nov 2026; it was the control plane's apps/tools/web/dwgcheck.html).
 *
 * The check itself stays on the control plane: one POST of the drawing as
 * multipart "file" to /api/tools/dwg-check (same-origin, rewritten in
 * next.config.ts), answered with the report JSON. No polling. A 429 means the
 * checker is busy with another drawing (one at a time); a 400 carries
 * {detail: {detail, error}}.
 *
 * 95 MB is checked here before sending, because Cloudflare refuses bodies over
 * 100 MB at the edge with its own error page. The server enforces 95 MB too
 * (apps/tools/app/dwgcheck.py MAX_UPLOAD_BYTES).
 */

const API = "/api/tools/dwg-check";
const MAX_BYTES = 95 * 1024 * 1024;

type Finding = { severity: string; count: number; title: string; detail: string; items?: string[]; more?: number };
type Drawing = { label: string; size: string; dimensions: number; covered: number; overall: number; missing: number };
type DwgReport = {
  file: string;
  format: { version_name?: string; note?: string };
  objects: number;
  dimensions: number;
  drawings: Drawing[];
  seconds: number;
  spans: { missing: number; covered: number; overall: number };
  findings: Finding[];
  units: { verdict: string; size_note: string };
};

const SEV: Record<string, [string, string]> = {
  measure: ["Someone needs to look at this", "text-[#b3322f]"],
  hidden: ["In the file, not on the drawing", "text-[#8a6a00]"],
  clean: ["Safe to remove", "text-[#1f7a4d]"],
  standard: ["Worth knowing", "text-ink-2"],
};

const n = (x: number | undefined) => Number(x || 0).toLocaleString();

export function DwgChecker() {
  const input = useRef<HTMLInputElement>(null);
  const out = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [hot, setHot] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [report, setReport] = useState<DwgReport | null>(null);

  useEffect(() => {
    if (report) out.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [report]);

  function pick(f: File | undefined) {
    if (!f) return;
    if (f.size > MAX_BYTES) {
      setErr(
        `That file is ${Math.round(f.size / 1048576)} MB. The limit is 95 MB: anything larger is refused by our network provider before it reaches us.`,
      );
      return;
    }
    setFile(f);
    setErr(null);
    setReport(null);
  }

  function clear() {
    setFile(null);
    setReport(null);
    setErr(null);
    if (input.current) input.current.value = "";
  }

  async function go() {
    if (!file) return;
    setBusy(true);
    setErr(null);
    const fd = new FormData();
    fd.append("file", file, file.name);
    try {
      const r = await fetch(API, { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) {
        let m = d && d.detail;
        if (m && typeof m === "object") m = m.detail || m.message;
        setErr(m || "That drawing could not be read.");
      } else {
        setReport(d as DwgReport);
      }
    } catch {
      setErr(
        "The check did not come back. If the drawing is very large, try the single sheet you want checked rather than the whole model.",
      );
    }
    setBusy(false);
  }

  return (
    <div>
      <div className="rounded-[24px] border border-rule bg-paper p-5 sm:p-7">
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault();
            setHot(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setHot(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setHot(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setHot(false);
            pick(e.dataTransfer.files[0]);
          }}
          className={`block w-full cursor-pointer rounded-[16px] border-[1.5px] border-dashed px-4 py-10 text-center transition-colors ${
            hot ? "border-blue bg-blue-soft text-ink" : "border-rule-strong text-ink-2 hover:border-blue hover:bg-blue-soft"
          }`}
        >
          <span className="mb-1 block text-[17px] font-semibold text-ink">Drop a DWG or DXF here</span>
          <span className="block text-[14px]">or tap to choose a file</span>
          <span className="mt-2 block text-[13px] text-ink-3">AutoCAD 2000–2018 and DXF · up to 95 MB · deleted as soon as it is read</span>
        </button>
        <input ref={input} type="file" accept=".dwg,.dxf" hidden onChange={(e) => pick(e.target.files?.[0])} data-testid="dwg-file" />
        {file ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" className="cf-btn-primary disabled:opacity-40" disabled={busy} onClick={go}>
              Check this drawing
            </button>
            <button type="button" className="cf-btn-secondary" onClick={clear}>
              Choose another
            </button>
            <span className="text-[14px] break-all text-ink-2">
              {file.name} · {(file.size / 1048576).toFixed(1)} MB
            </span>
          </div>
        ) : null}
        {busy ? <p className="mt-4 text-ink-2">Reading the drawing…</p> : null}
        {err ? <p className="mt-4 text-[#b3322f]">{err}</p> : null}
      </div>

      <div ref={out} aria-live="polite" className="scroll-mt-24">
        {report ? <DwgReportView r={report} /> : null}
      </div>
    </div>
  );
}

function Head({ value, label, bad }: { value: number; label: string; bad: boolean }) {
  return (
    <div className="rounded-[14px] border border-rule bg-paper-2 px-4 py-3.5">
      <b className={`block font-heading text-[28px] leading-tight font-medium tabular-nums ${bad ? "text-[#b3322f]" : ""}`}>{n(value)}</b>
      <span className="mt-1 block text-[13px] text-ink-2">{label}</span>
    </div>
  );
}

function DwgReportView({ r }: { r: DwgReport }) {
  return (
    <div className="mt-10" data-testid="dwg-report">
      <h2 className="cf-section-title break-all">{r.file}</h2>
      <p className="mt-2 text-[15px] text-ink-2">
        {r.format.version_name || "DXF"} · {n(r.objects)} objects · {n(r.dimensions)} dimensions · {r.drawings.length} separate
        drawing{r.drawings.length === 1 ? "" : "s"} on the sheet · read in {r.seconds}s
      </p>
      {r.format.note ? <p className="mt-2 text-[13px] text-ink-3">{r.format.note}</p> : null}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Head value={r.spans.missing} label="wall positions nothing measures" bad={r.spans.missing > 0} />
        <Head value={r.spans.covered} label="spans already dimensioned" bad={false} />
        <Head value={r.spans.overall} label="covered only by an overall dimension" bad={false} />
        <Head value={r.dimensions} label="dimensions in the drawing" bad={false} />
      </div>

      <div className="mt-5 rounded-[14px] border border-rule border-l-[3px] border-l-[#1f7a4d] bg-paper-2 px-4 py-4 text-[14.5px] text-ink-2">
        <b className="text-ink">Nothing in your drawing was changed.</b> This check is read-only (the service holds no code
        that can modify a drawing) and your file was deleted as soon as it had been read. Nothing was kept but anonymous
        counts, and not the file name.
      </div>

      {!r.findings.length ? <p className="mt-4">Nothing to report. That is rare enough to be worth checking twice.</p> : null}
      <div className="mt-4 space-y-2.5">
        {r.findings.map((f, i) => {
          const sev = SEV[f.severity] ?? ["", ""];
          return (
            <details key={i} className="group overflow-hidden rounded-[14px] border border-rule">
              <summary className="flex min-h-11 cursor-pointer flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 hover:bg-paper-2 [&::-webkit-details-marker]:hidden">
                <span className={`min-w-[2.4em] text-right font-bold tabular-nums ${sev[1]}`}>{n(f.count)}</span>
                <span className="min-w-0 flex-1 font-semibold">{f.title}</span>
                {sev[0] ? (
                  <span className={`rounded-full border border-current px-2 py-0.5 text-[11px] tracking-[0.07em] whitespace-nowrap uppercase ${sev[1]}`}>
                    {sev[0]}
                  </span>
                ) : null}
                <span aria-hidden className="text-lg leading-none text-ink-3">
                  <span className="group-open:hidden">+</span>
                  <span className="hidden group-open:inline">−</span>
                </span>
              </summary>
              <div className="border-t border-rule px-4 pb-4">
                <p className="my-3 text-[14.5px] text-ink-2">{f.detail}</p>
                {f.items && f.items.length ? (
                  <ul className="font-mono text-[13px] leading-normal">
                    {f.items.map((it, j) => (
                      <li key={j} className="mb-1 border-l-2 border-rule px-2 py-1 break-words">
                        {it}
                      </li>
                    ))}
                    {f.more ? <li className="mb-1 border-l-2 border-rule px-2 py-1">and {n(f.more)} more</li> : null}
                  </ul>
                ) : null}
              </div>
            </details>
          );
        })}
      </div>

      {r.drawings.length ? (
        <>
          <h2 className="cf-section-title mt-10">Drawing by drawing</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-[14px] tabular-nums">
              <thead>
                <tr className="text-[12px] tracking-[0.06em] text-ink-2 uppercase">
                  {["Drawing", "Size (units)", "Dimensions", "Spans covered", "Overall only", "Not measured"].map((h, i) => (
                    <th key={h} className={`border-b border-rule px-2 py-2 ${i ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {r.drawings.map((d, i) => (
                  <tr key={i}>
                    <td className="border-b border-rule px-2 py-2 text-left">{d.label}</td>
                    <td className="border-b border-rule px-2 py-2 text-right">{d.size}</td>
                    <td className="border-b border-rule px-2 py-2 text-right">{n(d.dimensions)}</td>
                    <td className="border-b border-rule px-2 py-2 text-right">{n(d.covered)}</td>
                    <td className="border-b border-rule px-2 py-2 text-right">{n(d.overall)}</td>
                    <td className="border-b border-rule px-2 py-2 text-right">{n(d.missing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      <h2 className="cf-section-title mt-10">Units</h2>
      <p className="mt-2 text-[15px] text-ink-2">
        {r.units.verdict} {r.units.size_note}.
      </p>
    </div>
  );
}
