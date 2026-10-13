"use client";

import { useRef, useState } from "react";
import { API_BASE } from "@/lib/api-base";
import { trackConversion, trackEvent } from "@/lib/analytics";

/**
 * The duct/pipe CFD intake (13 Oct 2026): the fields the automatic service
 * actually uses, posted to POST /cfd-jobs with the CfdJobCreate field names,
 * then the STL to POST /cfd-jobs/{ref}/upload.
 *
 * Everything the duct flow does not ask the customer is filled with values the
 * API's scope rules (services/cfd_rules.py) and the runner's case generator
 * (cfd-runner/case_gen.py) accept:
 *   - domainType contains "internal"  -> internal flow, caps from the STL;
 *   - applicationType has no "hvac"/"room"/"indoor" keyword, which would
 *     apply the 2-50 m room size check to a 50 mm pipe;
 *   - one "Velocity Inlet" row and one "Pressure Outlet" row (0 Pa);
 *   - a flow rate is sent in m3/s. The API's Mach check reads the first
 *     number of the inlet value as m/s, so "500 m3/h" would be rejected as
 *     compressible; 0.139 m3/s is not. The runner reads m3/s as a flow rate.
 *   - turbulenceModel "Recommend for my case" -> k-omega SST.
 *
 * The single-request upload takes up to 80 MB. A bigger STL (up to 200 MB)
 * goes through the chunked upload on the job page, which we link to.
 */

const SINGLE_UPLOAD_MAX = 80 * 1024 * 1024;
const STL_MAX = 200 * 1024 * 1024;

const UNITS = [
  { value: "Millimetres (mm)", label: "mm" },
  { value: "Centimetres (cm)", label: "cm" },
  { value: "Metres (m)", label: "m" },
  { value: "Inches (in)", label: "inches" },
];

const FLOW_UNITS = [
  { value: "m/s", label: "m/s", toM3s: null },
  { value: "l/s", label: "l/s", toM3s: 1e-3 },
  { value: "m3/h", label: "m³/h", toM3s: 1 / 3600 },
  { value: "m3/s", label: "m³/s", toM3s: 1 },
  { value: "cfm", label: "CFM", toM3s: 0.000471947 },
] as const;

const fieldBase =
  "w-full min-w-0 rounded-cf border border-rule bg-paper px-3 text-base text-ink outline-none transition placeholder:text-ink-3 focus:border-blue focus:ring-2 focus:ring-blue/20 md:text-sm";
const inputCls = `${fieldBase} h-11 md:h-10`;
const textareaCls = `${fieldBase} min-h-[80px] resize-y py-2.5 leading-6`;

function Field({ label, hint, htmlFor, children, full }: {
  label: string; hint?: string; htmlFor?: string; children: React.ReactNode; full?: boolean;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <label htmlFor={htmlFor} className="text-[13.5px] leading-5 font-medium text-ink">{label}</label>
      {children}
      {hint ? <p className="text-[12.5px] leading-5 text-ink-3">{hint}</p> : null}
    </div>
  );
}

function Choice({ name, value, options, onChange }: {
  name: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((o) => (
        <label
          key={o.value}
          className={`flex min-h-11 cursor-pointer items-center rounded-cf border px-4 text-sm transition ${
            value === o.value ? "border-blue bg-blue-soft font-semibold text-ink" : "border-rule text-ink-2 hover:border-rule-strong"
          }`}
        >
          <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="sr-only" />
          {o.label}
        </label>
      ))}
    </div>
  );
}

type Validation = { status?: string; issues?: { severity: string; message: string; fix?: string }[]; message?: string };

function formatM3s(q: number): string {
  // Plain decimal with 4 significant figures, e.g. 0.1389 or 0.0007833.
  return `${Number(q.toPrecision(4))} m3/s`;
}

export default function CfdDuctForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [project, setProject] = useState("");
  const [fluid, setFluid] = useState("Air");
  const [flow, setFlow] = useState("");
  const [flowUnit, setFlowUnit] = useState<(typeof FLOW_UNITS)[number]["value"]>("m/s");
  const [units, setUnits] = useState("Millimetres (mm)");
  const [noStl, setNoStl] = useState(false);
  const [dims, setDims] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState<"" | "submitting" | "uploading">("");
  const [submitError, setSubmitError] = useState("");

  const [refId, setRefId] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [uploadState, setUploadState] = useState<"" | "done" | "too_big" | "failed" | "skipped">("");
  const [uploadError, setUploadError] = useState("");
  const [validation, setValidation] = useState<Validation | null>(null);

  const inletValue = (): string | null => {
    const n = Number(flow.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return null;
    const u = FLOW_UNITS.find((f) => f.value === flowUnit)!;
    return u.toM3s === null ? `${n} m/s` : formatM3s(n * u.toM3s);
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!name.trim()) errs.push("Your name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.push("A valid email (the quote goes there)");
    if (!project.trim()) errs.push("A job name");
    const v = inletValue();
    if (!v) errs.push("The inlet flow, as a number above zero");
    if (flowUnit === "m/s" && Number(flow) > 100) errs.push("An inlet speed below 100 m/s (we run incompressible flow)");
    if (noStl) {
      if ((dims.match(/\d*\.?\d+/g) || []).length < 3) errs.push("The duct's length, width and height");
    } else if (!file) {
      errs.push("Your STL file");
    } else {
      if (!file.name.toLowerCase().endsWith(".stl")) errs.push("An .stl file (STEP, IGES and IFC are not accepted yet)");
      if (file.size > STL_MAX) errs.push("An STL under 200 MB (export it with a coarser tolerance)");
    }
    return errs;
  };

  const pollValidation = (ref: string) => {
    let attempts = 0;
    const poll = async () => {
      if (attempts++ > 30) return;
      try {
        const r = await fetch(`${API_BASE}/cfd-jobs/${ref}/validation`);
        if (r.ok) {
          const data = await r.json();
          const v = (data.validation || {}) as Validation;
          if (!v.status || v.status === "pending") {
            setTimeout(poll, 2000);
          } else {
            setValidation(v);
          }
          return;
        }
      } catch {
        /* keep polling */
      }
      setTimeout(poll, 3000);
    };
    setTimeout(poll, 1500);
  };

  const upload = async (ref: string, f: File) => {
    if (f.size > SINGLE_UPLOAD_MAX) {
      setUploadState("too_big");
      return;
    }
    setBusy("uploading");
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch(`${API_BASE}/cfd-jobs/${ref}/upload`, { method: "POST", body: fd });
      if (!res.ok) {
        let msg = "The upload did not go through.";
        try {
          const j = await res.json();
          if (typeof j.detail === "string") msg = j.detail;
        } catch { /* keep default */ }
        throw new Error(msg);
      }
      setUploadState("done");
      trackEvent("cfd_stl_uploaded", { location: "cfd_intake" });
      pollValidation(ref);
    } catch (err: unknown) {
      setUploadState("failed");
      setUploadError(err instanceof Error ? err.message : "The upload did not go through.");
    } finally {
      setBusy("");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (errs.length) return;
    setSubmitError("");
    setBusy("submitting");
    try {
      const outletRow = { name: "Outlet", type: "Pressure Outlet", value: "0 Pa", temp: "", turb: "" };
      const inletRow = { name: "Inlet", type: "Velocity Inlet", value: inletValue()!, temp: "", turb: "" };
      const payload = {
        company: company.trim() || "Individual",
        projectName: project.trim(),
        contactName: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        applicationType: "Duct / pipe internal flow (pressure drop)",
        solverSoftware: "OpenFOAM (Coreframe)",
        deadline: "",
        description: notes.trim() || "Duct / pipe pressure drop, submitted from /cfd-intake",
        cadFormat: noStl ? "" : "STL",
        modelUnits: units,
        dimensions: noStl ? dims.trim() : "",
        domainType: "Internal flow (duct / pipe)",
        bcRows: [inletRow, outletRow],
        refPressure: "0 Pa",
        flowRegime: "Steady-state",
        fluidType: fluid,
        compressibility: "Incompressible",
        turbulenceModel: "Recommend for my case",
        outVelocity: true,
        outPressure: true,
        outStreamlines: true,
        outPressureDrop: true,
        outReport: true,
        reportFormat: "PDF",
        kpi: "Pressure drop and loss coefficient",
      };
      const res = await fetch(`${API_BASE}/cfd-jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 429) throw new Error("Too many jobs from this connection in the last hour. Try again later, or WhatsApp us.");
        throw new Error("That did not send. Check the fields and try again, or WhatsApp us.");
      }
      const data = (await res.json()) as { ref_id: string; access_token?: string };
      setRefId(data.ref_id);
      if (data.access_token) {
        setJobUrl(`${API_BASE}/cfd-jobs/${data.ref_id}/view?token=${encodeURIComponent(data.access_token)}`);
      }
      // A submitted CFD job is a lead (Meta "Lead"). No form fields go with it.
      trackConversion("generate_lead", { method: "cfd_duct_job", location: "cfd_intake" });
      // Its own GA4 key event too, so Google Ads can bid on CFD jobs apart from WhatsApp taps.
      trackEvent("cfd_job_submit", { location: "cfd_intake" });
      setBusy("");
      if (noStl || !file) {
        setUploadState("skipped");
      } else {
        await upload(data.ref_id, file);
      }
    } catch (err: unknown) {
      setBusy("");
      setSubmitError(err instanceof Error ? err.message : "That did not send. Try again, or WhatsApp us.");
    }
  };

  // ── After submit ────────────────────────────────────────────────────────
  if (refId) {
    const errorsFound = (validation?.issues || []).filter((i) => i.severity === "error");
    return (
      <div className="rounded-[24px] border border-rule bg-paper-2 p-6 sm:p-8" aria-live="polite">
        <p className="cf-card-label">Job received</p>
        <p className="font-mono text-2xl font-bold tracking-widest break-words text-blue">{refId}</p>

        {busy === "uploading" && <p className="mt-4 text-[15px] text-ink-2">Uploading your STL…</p>}

        {uploadState === "done" && (
          <p className="mt-4 text-[15px] leading-6 text-ink-2">
            STL received.
            {!validation && " The geometry check is running now."}
            {validation && validation.status === "complete" && !errorsFound.length && (
              <span className="text-ink"> The geometry check passed.</span>
            )}
            {validation && errorsFound.length > 0 && (
              <span className="text-ink"> The check found something to fix: {errorsFound[0].message}</span>
            )}
          </p>
        )}
        {uploadState === "too_big" && (
          <p className="mt-4 text-[15px] leading-6 text-ink-2">
            Your STL is over 80 MB, so upload it on your job page, which takes files up to 200 MB and resumes if the
            connection drops.
          </p>
        )}
        {uploadState === "failed" && (
          <p className="mt-4 text-[15px] leading-6 text-destructive">
            {uploadError} You can upload the STL again on your job page.
          </p>
        )}
        {uploadState === "skipped" && (
          <p className="mt-4 text-[15px] leading-6 text-ink-2">
            On your job page, choose &ldquo;use my dimensions&rdquo; to mesh the straight duct you described.
          </p>
        )}

        <div className="mt-6 space-y-2 text-[15px] leading-6 text-ink-2">
          <p className="font-semibold text-ink">Next, on your job page:</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Confirm which opening is the inlet (and the units, if we ask).</li>
            <li>Sign in and pay the ₹499 + GST quote fee from your wallet.</li>
            <li>We build the mesh and email you the quote.</li>
          </ol>
        </div>

        {jobUrl ? (
          <a href={jobUrl} target="_blank" rel="noreferrer" className="cf-btn-primary mt-7">
            Open your job page
          </a>
        ) : null}
        <p className="mt-4 text-[13.5px] leading-5 text-ink-3">
          The same link is on its way to {email.trim()}. Keep it private: it also opens your results.
        </p>
      </div>
    );
  }

  // ── The form ────────────────────────────────────────────────────────────
  return (
    <form onSubmit={submit} noValidate className="rounded-[24px] border border-rule bg-paper-2 p-5 sm:p-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="cf-name">
          <input id="cf-name" className={inputCls} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Email" htmlFor="cf-email" hint="The quote and your results link come here.">
          <input id="cf-email" type="email" className={inputCls} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="WhatsApp number (optional)" htmlFor="cf-phone">
          <input id="cf-phone" type="tel" className={inputCls} autoComplete="tel" placeholder="+91" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label="Company or college (optional)" htmlFor="cf-company">
          <input id="cf-company" className={inputCls} autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} />
        </Field>
        <Field label="Job name" htmlFor="cf-project" full hint="Anything that tells you which run this is, e.g. “AHU-2 supply duct, level 3”.">
          <input id="cf-project" className={inputCls} value={project} onChange={(e) => setProject(e.target.value)} />
        </Field>

        <Field label="Fluid">
          <Choice name="fluid" value={fluid} onChange={setFluid} options={[{ value: "Air", label: "Air" }, { value: "Water", label: "Water" }]} />
        </Field>
        <Field label="Inlet flow" htmlFor="cf-flow" hint="Mean inlet velocity, or a flow rate.">
          <div className="flex gap-2">
            <input id="cf-flow" inputMode="decimal" className={`${inputCls} min-w-0 flex-1`} placeholder="e.g. 4" value={flow} onChange={(e) => setFlow(e.target.value)} />
            <select
              aria-label="Flow unit"
              className={`${inputCls} !w-[104px] shrink-0`}
              value={flowUnit}
              onChange={(e) => setFlowUnit(e.target.value as (typeof FLOW_UNITS)[number]["value"])}
            >
              {FLOW_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
        </Field>

        <Field label="Units your STL was exported in" full>
          <Choice name="units" value={units} onChange={setUnits} options={UNITS} />
        </Field>

        <div className="sm:col-span-2">
          {!noStl ? (
            <Field label="Your STL (the fluid volume, one closed solid, flat end caps)" htmlFor="cf-file" hint="Binary STL up to 200 MB. Files over 80 MB are uploaded on your job page after you submit.">
              <label className="flex min-h-[88px] cursor-pointer flex-col items-center justify-center rounded-cf border-2 border-dashed border-rule bg-paper p-4 text-center transition hover:border-blue">
                <input
                  id="cf-file"
                  ref={fileRef}
                  type="file"
                  accept=".stl"
                  className="sr-only"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                {file ? (
                  <span className="text-sm break-all text-ink">
                    {file.name} <span className="text-ink-3">· {(file.size / 1024 / 1024).toFixed(1)} MB</span>
                  </span>
                ) : (
                  <span className="text-sm text-ink-2">Choose an .stl file</span>
                )}
              </label>
            </Field>
          ) : (
            <Field label="Straight duct: length × width × height, with units" htmlFor="cf-dims" hint="Rectangular straight duct only, e.g. 3 m x 0.4 m x 0.25 m.">
              <input id="cf-dims" className={inputCls} value={dims} onChange={(e) => setDims(e.target.value)} />
            </Field>
          )}
          <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-2.5 text-[14px] text-ink-2">
            <input type="checkbox" className="h-4 w-4 accent-[var(--color-blue)]" checked={noStl} onChange={(e) => setNoStl(e.target.checked)} />
            Straight duct, no STL: I&rsquo;ll give its dimensions instead
          </label>
        </div>

        <Field label="Anything we should know (optional)" htmlFor="cf-notes" full>
          <textarea id="cf-notes" className={textareaCls} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
      </div>

      {errors.length > 0 && (
        <div role="alert" className="mt-6 rounded-cf border border-destructive/30 bg-destructive/5 p-4 text-[14px] leading-6 text-ink">
          <p className="font-semibold">Please add:</p>
          <ul className="list-disc pl-5">
            {errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </div>
      )}
      {submitError && (
        <p role="alert" className="mt-6 text-[14px] leading-6 text-destructive">{submitError}</p>
      )}

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] leading-5 text-ink-3">
          Nothing is charged when you submit. The ₹499 + GST quote fee is paid later, on your job page, from your Coreframe wallet. By
          submitting you agree to our <a href="/terms-of-service" className="underline underline-offset-2">terms</a>.
        </p>
        <button type="submit" disabled={busy !== ""} className="cf-btn-primary shrink-0 disabled:opacity-60">
          {busy === "submitting" ? "Sending…" : busy === "uploading" ? "Uploading…" : "Submit job"}
        </button>
      </div>
    </form>
  );
}
