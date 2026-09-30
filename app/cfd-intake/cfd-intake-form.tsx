"use client";

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BCRow {
  id: number;
  name: string;
  type: string;
  value: string;
  temp: string;
  turb: string;
}

interface FormData {
  // Page 1
  company: string;
  projectName: string;
  contactName: string;
  designation: string;
  email: string;
  phone: string;
  applicationType: string;
  solverSoftware: string;
  deadline: string;
  budget: string;
  description: string;
  // Page 2
  cadFormat: string;
  modelUnits: string;
  dimensions: string;
  componentCount: string;
  symmetry: string;
  simplification: string;
  geometryNotes: string;
  domainType: string;
  meshSize: string;
  yplus: string;
  domainExtents: string;
  // Page 4
  flowRegime: string;
  fluidType: string;
  compressibility: string;
  turbulenceModel: string;
  reynolds: string;
  physicsHeat: boolean;
  physicsBuoyancy: boolean;
  physicsRadiation: boolean;
  physicsCombustion: boolean;
  physicsParticles: boolean;
  physicsMultiphase: boolean;
  physicsMoving: boolean;
  physicsPorous: boolean;
  physicsFsi: boolean;
  fluidTemp: string;
  operatingPressure: string;
  fluidProps: string;
  // Page 3 BC extras
  refPressure: string;
  gravity: string;
  bcNotes: string;
  // Page 5
  convergence: string;
  iterations: string;
  timestep: string;
  coupling: string;
  solverNotes: string;
  outVelocity: boolean;
  outPressure: boolean;
  outTemperature: boolean;
  outStreamlines: boolean;
  outTurbulence: boolean;
  outForces: boolean;
  outPressureDrop: boolean;
  outMassFlow: boolean;
  outResidence: boolean;
  outIso: boolean;
  outAnimation: boolean;
  outReport: boolean;
  reportFormat: string;
  kpi: string;
  postprocNotes: string;
  // Page 6
  authName: string;
  authDate: string;
  finalNotes: string;
  confirmAccuracy: boolean;
  confirmData: boolean;
  signature: string;
}

const DEFAULT_BC_ROWS: BCRow[] = [
  { id: 1, name: "Supply Air Inlet 1",  type: "Velocity Inlet",  value: "1.5 m/s",    temp: "18", turb: "5% intensity, 0.01 m L_t" },
  { id: 2, name: "Return Air Outlet 1", type: "Pressure Outlet", value: "0 Pa gauge", temp: "",   turb: "Backflow 5%" },
  { id: 3, name: "Walls / Ceiling",     type: "No-slip Wall",    value: "—",           temp: "25", turb: "—" },
  { id: 4, name: "Floor",               type: "No-slip Wall",    value: "—",           temp: "28", turb: "—" },
];

const INITIAL: FormData = {
  company: "", projectName: "", contactName: "", designation: "",
  email: "", phone: "", applicationType: "", solverSoftware: "",
  deadline: "", budget: "", description: "",
  cadFormat: "", modelUnits: "Millimetres (mm)", dimensions: "",
  componentCount: "", symmetry: "none", simplification: "no",
  geometryNotes: "", domainType: "", meshSize: "", yplus: "", domainExtents: "",
  flowRegime: "", fluidType: "", compressibility: "Incompressible (Ma < 0.3)",
  turbulenceModel: "", reynolds: "",
  physicsHeat: false, physicsBuoyancy: false, physicsRadiation: false,
  physicsCombustion: false, physicsParticles: false, physicsMultiphase: false,
  physicsMoving: false, physicsPorous: false, physicsFsi: false,
  fluidTemp: "", operatingPressure: "", fluidProps: "",
  refPressure: "", gravity: "−Y (standard)", bcNotes: "",
  convergence: "10⁻³ (standard)", iterations: "", timestep: "",
  coupling: "simple", solverNotes: "",
  outVelocity: false, outPressure: false, outTemperature: false,
  outStreamlines: false, outTurbulence: false, outForces: false,
  outPressureDrop: false, outMassFlow: false, outResidence: false,
  outIso: false, outAnimation: false, outReport: true,
  reportFormat: "PDF report with figures", kpi: "", postprocNotes: "",
  authName: "", authDate: "", finalNotes: "",
  confirmAccuracy: false, confirmData: false, signature: "",
};

// ─── Domain-aware CAD checklist ──────────────────────────────────────────────

const CHECKLIST_COMMON = [
  "Geometry must be fully watertight — no open edges or missing faces",
  "No self-intersecting surfaces",
  "Consistent face normals (all pointing uniformly outward or inward)",
  "Remove features smaller than your target mesh cell size",
  "Export as STEP (.step), IGES (.iges), or binary STL — avoid ASCII STL for files > 10 MB",
];

const CHECKLIST_BY_TYPE: Record<string, string[]> = {
  "HVAC": [
    "Remove all doors and windows not part of the ventilation study",
    "Delete furniture, cubicle partitions, shelving, and decorative objects",
    "Remove embedded text labels, dimension arrows, and annotation geometry",
    "Repair broken or disconnected duct sections — all ductwork must be continuous",
    "Confirm supply diffusers and return grilles are correctly positioned and oriented",
    "Suppress bolts, screws, and details smaller than your mesh target (< 2 mm)",
    "Ensure floor, walls, and ceiling form a fully closed volume with no gaps",
  ],
  "External Aerodynamics": [
    "Keep only the external shell — remove all interior rooms, partitions, and services",
    "Close any surface gaps on the vehicle or building envelope",
    "Remove floating elements (antennas, small projections) unless specifically studied",
    "Suppress window frames, grooves, and details < 5 mm unless studying surface roughness",
    "Model orientation: approaching flow must align with +X axis",
  ],
  "Wind Engineering": [
    "Keep only the external building envelope — strip all interior",
    "Close any surface gaps on facade, roof, and soffit",
    "Suppress facade details < 5 mm unless key to the study",
    "Wind approach direction must align with +X axis; use flat ground plane",
    "Remove terrain geometry if providing it separately",
  ],
  "Automotive": [
    "Keep only external body panels — remove all interior components and trim",
    "Close all surface gaps (doors, hood, trunk fit lines, grille openings)",
    "Remove underfloor clutter not critical to underbody flow",
    "Wheel geometry must be solid — no open hollow spokes",
    "Model orientation: vehicle nose pointing in +X direction",
  ],
  "Electronics Cooling": [
    "All component and heatsink bodies must be solid — not hollow shells",
    "Heatsink fins must contact the component case with no gaps",
    "Remove PCB assembly hardware (standoffs, screws) unless critical to airflow",
    "Enclosure must be fully closed — ICs sit inside a sealed box",
    "Confirm accurate board height, component heights, and fin pitch",
  ],
};

function getChecklistItems(applicationType: string): string[] {
  const key = Object.keys(CHECKLIST_BY_TYPE).find((k) =>
    applicationType.toLowerCase().includes(k.toLowerCase().split(" ")[0])
  );
  return [...(key ? CHECKLIST_BY_TYPE[key] : []), ...CHECKLIST_COMMON];
}

const STEPS = ["Project", "Geometry", "Boundaries", "Physics", "Solver", "Sign-off"];

const BC_TYPES = [
  "Velocity Inlet", "Mass Flow Inlet", "Pressure Inlet",
  "Pressure Outlet", "Outflow", "No-slip Wall", "Moving Wall",
  "Symmetry", "Periodic", "Interior",
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function Panel({ title, subtitle, children }: {
  title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-cf border border-rule bg-paper-2 p-4 sm:p-6">
      <div className="mb-5 border-b border-rule pb-4">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {subtitle && <p className="mt-1 text-[13px] leading-5 text-ink-2">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, required, full, children }: {
  label: string; required?: boolean; full?: boolean; children: React.ReactNode;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${full ? "sm:col-span-full" : ""}`}>
      <label className="text-[13px] leading-5 font-medium text-ink">
        {label}
        {required && (
          <span className="ml-1 text-destructive" aria-hidden="true">*</span>
        )}
      </label>
      {children}
    </div>
  );
}

const fieldBase =
  "w-full min-w-0 rounded-cf border border-rule bg-paper px-3 text-base text-ink outline-none transition placeholder:text-ink-3 focus:border-blue focus:ring-2 focus:ring-blue/20 md:text-sm";
const inputCls = `${fieldBase} h-11 md:h-10`;
const selectCls = `${fieldBase} h-11 md:h-10`;
const textareaCls = `${fieldBase} min-h-[88px] resize-y py-2.5 leading-6`;

function RadioGroup({ name, value, onChange, options }: {
  name: string; value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label
          key={o.value}
          className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-cf border px-4 py-2 text-sm transition ${
            value === o.value
              ? "border-blue bg-paper font-medium text-blue"
              : "border-rule bg-paper text-ink-2 hover:border-rule-strong"
          }`}
        >
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="sr-only"
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}

function CheckChip({ checked, onChange, label }: {
  checked: boolean; onChange: (v: boolean) => void; label: string;
}) {
  return (
    <label
      className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-cf border px-4 py-2 text-sm transition ${
        checked
          ? "border-blue bg-paper font-medium text-blue"
          : "border-rule bg-paper text-ink-2 hover:border-rule-strong"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-cf border ${checked ? "border-blue bg-blue" : "border-rule-strong"}`}>
        {checked && <span className="text-[10px] leading-none text-white">✓</span>}
      </span>
      {label}
    </label>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const API_BASE = "https://control.coreframecloud.com/api";

export default function CfdIntakeForm() {
  const [page, setPage] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [bcRows, setBcRows] = useState<BCRow[]>(DEFAULT_BC_ROWS);
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  // File upload state (shown on success screen)
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [validationResult, setValidationResult] = useState<Record<string, unknown> | null>(null);

  const set = useCallback(<K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
  }, []);

  const addBCRow = () =>
    setBcRows((rows) => [...rows, { id: Date.now(), name: "", type: "Velocity Inlet", value: "", temp: "", turb: "" }]);

  const updateBCRow = (id: number, field: keyof BCRow, val: string) =>
    setBcRows((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: val } : r)));

  const removeBCRow = (id: number) =>
    setBcRows((rows) => rows.filter((r) => r.id !== id));

  // Required field validation per page
  const validatePage = (p: number): string[] => {
    const errs: string[] = [];
    if (p === 0) {
      if (!form.company)        errs.push("Company or organisation");
      if (!form.projectName)    errs.push("Project name");
      if (!form.contactName)    errs.push("Your name");
      if (!form.email)          errs.push("Email");
      if (!form.applicationType) errs.push("CFD application type");
      if (!form.solverSoftware) errs.push("Preferred solver software");
      if (!form.deadline)       errs.push("Results needed by");
      if (!form.description)    errs.push("Brief project description");
    }
    if (p === 1) {
      if (!form.domainType) errs.push("Domain type");
    }
    if (p === 3) {
      if (!form.flowRegime)      errs.push("Flow regime");
      if (!form.fluidType)       errs.push("Fluid type");
      if (!form.turbulenceModel) errs.push("Turbulence modelling");
    }
    if (p === 5) {
      if (!form.authName) errs.push("Authorising name");
      if (!form.authDate) errs.push("Date");
      if (!form.confirmAccuracy) errs.push("Accuracy declaration (must tick)");
    }
    return errs;
  };

  const nextPage = () => {
    const errs = validatePage(page);
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    setPage((p) => Math.min(p + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevPage = () => {
    setErrors([]);
    setPage((p) => Math.max(p - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    const errs = validatePage(5);
    if (errs.length) { setErrors(errs); return; }
    setSubmitError("");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        bcRows: bcRows.map(({ id: _id, ...rest }) => rest),
      };
      const res = await fetch(`${API_BASE}/cfd-jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "Unknown error");
        throw new Error(msg);
      }
      const data = await res.json();
      setRefId(data.ref_id);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "That did not send. Try again, or WhatsApp us."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", uploadFile);
      const res = await fetch(`${API_BASE}/cfd-jobs/${refId}/upload`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "Upload failed");
        throw new Error(msg);
      }
      setUploadDone(true);
      // Poll for validation result (trimesh runs in background ~1-5s)
      let attempts = 0;
      const poll = async () => {
        if (attempts++ > 20) return; // give up after ~40s
        try {
          const r = await fetch(`${API_BASE}/cfd-jobs/${refId}/validation`);
          if (!r.ok) return;
          const data = await r.json();
          const status = (data.validation as Record<string, unknown>)?.status;
          if (status === "pending") {
            setTimeout(poll, 2000);
          } else {
            setValidationResult(data.validation as Record<string, unknown>);
          }
        } catch {
          // ignore poll errors
        }
      };
      setTimeout(poll, 1500);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-1 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="cf-section-title">Job submitted.</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-2">
            Upload your CAD file below and we start the solver. You get a PDF
            report and the data files back.
          </p>
          <div className="my-6 inline-block max-w-full rounded-cf border border-rule bg-paper-2 px-5 py-4 font-mono text-xl font-bold tracking-widest break-words text-blue sm:px-8 sm:text-2xl">
            {refId}
          </div>
          <p className="text-xs text-ink-3">
            Save this ID. Quote it in anything you send us about this job.
          </p>
        </div>

        {/* CAD file upload */}
        <div className="mb-6 rounded-cf border border-rule bg-paper-2 p-4 sm:p-6">
          <div className="mb-4 border-b border-rule pb-4">
            <h3 className="text-base font-semibold text-ink">Upload your CAD file.</h3>
            <p className="mt-1 text-[13px] leading-5 text-ink-2">
              STL files are checked automatically. STEP and IGES go to an
              engineer. Max 80 MB.
            </p>
          </div>

          {!uploadDone ? (
            <div className="space-y-4">
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start">
                <label className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-cf border-2 border-dashed border-rule p-4 text-center transition hover:border-blue">
                  <input
                    type="file"
                    accept=".stl,.step,.stp,.iges,.igs,.x_t,.x_b"
                    className="sr-only"
                    onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  />
                  {uploadFile ? (
                    <span className="text-sm font-medium break-words text-blue">
                      {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  ) : (
                    <span className="text-sm break-words text-ink-3">
                      Tap to choose a CAD file (.stl, .step, .iges, .stp, .x_t)
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  disabled={!uploadFile || uploading}
                  onClick={handleFileUpload}
                  className="cf-btn-primary min-h-11 w-full disabled:opacity-40 sm:w-auto"
                >
                  {uploading ? "Uploading…" : "Upload"}
                </button>
              </div>
              {uploadError && (
                <div className="rounded-cf border border-destructive/30 bg-destructive/5 p-3 text-sm break-words text-destructive">
                  {uploadError}
                </div>
              )}
              <p className="text-xs leading-5 break-words text-ink-3">
                Or email the files to{" "}
                <a href="mailto:cfd@coreframecloud.com" className="break-all text-blue underline underline-offset-2">
                  cfd@coreframecloud.com
                </a>{" "}
                with <span className="font-mono break-all text-ink-2">{refId}</span> in
                the subject line.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {validationResult === null ? (
                <div className="flex items-center gap-3 text-sm text-ink-2">
                  <span className="animate-spin text-base leading-none">⟳</span>
                  Validating geometry…
                </div>
              ) : validationResult.status === "complete" ? (
                <>
                  <div className={`text-sm font-semibold ${validationResult.ready_for_meshing ? "text-ink" : "text-destructive"}`}>
                    {validationResult.ready_for_meshing
                      ? "Geometry looks good. It is ready for meshing."
                      : "Issues found. Fix these before your job starts."}
                  </div>
                  {(validationResult.issues as Array<{ severity: string; message: string; fix: string }>).map((issue, i) => (
                    <div
                      key={i}
                      className={`flex gap-2.5 rounded-cf border p-3 text-sm ${
                        issue.severity === "error"
                          ? "border-destructive/30 bg-destructive/5"
                          : "border-rule bg-paper"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${issue.severity === "error" ? "bg-destructive" : "bg-blue"}`}
                      />
                      <div className="min-w-0">
                        <div className="font-medium break-words text-ink">
                          <span className={issue.severity === "error" ? "text-destructive" : "text-blue"}>
                            {issue.severity === "error" ? "Error" : "Warning"}
                          </span>
                          {" — "}
                          {issue.message}
                        </div>
                        <div className="mt-1 text-xs break-words text-ink-2">Fix: {issue.fix}</div>
                      </div>
                    </div>
                  ))}
                  {!(validationResult.issues as unknown[]).length && (
                    <p className="text-sm text-ink-2">No issues found. Your geometry is mesh-ready.</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-ink-2">
                  {(validationResult.message as string) || "File received. An engineer will look at the geometry."}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              setSubmitted(false); setForm(INITIAL); setBcRows(DEFAULT_BC_ROWS); setPage(0);
              setUploadFile(null); setUploadDone(false); setValidationResult(null); setUploadError("");
            }}
            className="cf-btn-secondary min-h-11 w-full sm:w-auto"
          >
            Submit another job
          </button>
        </div>
      </div>
    );
  }

  // ── Step indicator ──────────────────────────────────────────────────────────
  const StepBar = () => (
    <div className="mb-8">
      <div className="flex gap-1">
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => { setErrors([]); setPage(i); }}
            aria-current={i === page ? "step" : undefined}
            aria-label={`Step ${i + 1}: ${s}`}
            className={`flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-cf border px-1 py-2 text-[11px] font-medium transition sm:px-2 sm:text-xs ${
              i === page
                ? "border-blue bg-blue text-white"
                : i < page
                ? "border-rule bg-paper-2 text-ink"
                : "border-rule bg-paper text-ink-3"
            }`}
          >
            <span className="text-sm leading-none font-semibold sm:text-base">
              {i < page ? "✓" : i + 1}
            </span>
            <span className="hidden truncate sm:block">{s}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-[13px] text-ink-2 sm:hidden">
        Step {page + 1} of {STEPS.length} — {STEPS[page]}
      </p>
    </div>
  );

  // ── Error banner ────────────────────────────────────────────────────────────
  const ErrorBanner = () => (
    <>
      {errors.length > 0 && (
        <div className="mb-5 rounded-cf border border-destructive/30 bg-destructive/5 p-4 text-sm break-words text-destructive">
          <strong>Fill these in first:</strong> {errors.join(", ")}
        </div>
      )}
      {submitError && (
        <div className="mb-5 rounded-cf border border-destructive/30 bg-destructive/5 p-4 text-sm break-words text-destructive">
          <strong>That did not send:</strong> {submitError}
        </div>
      )}
    </>
  );

  // ── Nav buttons ─────────────────────────────────────────────────────────────
  const NavRow = ({ onNext, nextLabel = "Next", isLast = false }: {
    onNext: () => void; nextLabel?: string; isLast?: boolean;
  }) => (
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
      {page > 0 ? (
        <button
          type="button"
          onClick={prevPage}
          className="cf-btn-secondary min-h-11 w-full sm:w-auto"
        >
          ← Back
        </button>
      ) : (
        <span aria-hidden="true" className="hidden sm:block" />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={isLast && submitting}
        className="cf-btn-primary min-h-11 w-full disabled:opacity-60 sm:w-auto"
      >
        {isLast && submitting ? "Submitting…" : nextLabel}
      </button>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div>
      <StepBar />
      <ErrorBanner />

      {/* PAGE 0 — Project */}
      {page === 0 && (
        <div className="space-y-5">
          <Panel title="Client and project details." subtitle="Used on your final report and invoice.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company or organisation" required>
                <input className={inputCls} placeholder="e.g. Acme HVAC Pvt. Ltd." value={form.company} onChange={(e) => set("company", e.target.value)} />
              </Field>
              <Field label="Project name" required>
                <input className={inputCls} placeholder="e.g. Office Building HVAC Study" value={form.projectName} onChange={(e) => set("projectName", e.target.value)} />
              </Field>
              <Field label="Your name" required>
                <input className={inputCls} placeholder="Full name" value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
              </Field>
              <Field label="Designation">
                <input className={inputCls} placeholder="e.g. CFD Engineer" value={form.designation} onChange={(e) => set("designation", e.target.value)} />
              </Field>
              <Field label="Email" required>
                <input type="email" className={inputCls} placeholder="you@company.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </Field>
              <Field label="Phone or WhatsApp">
                <input className={inputCls} placeholder="+91 98765 43210" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </Field>
            </div>
          </Panel>

          <Panel title="Project scope and timeline.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="CFD application type" required>
                <select className={selectCls} value={form.applicationType} onChange={(e) => set("applicationType", e.target.value)}>
                  <option value="">— Select —</option>
                  {["HVAC / Indoor Thermal Comfort","External Aerodynamics","Electronics Cooling","Process / Industrial Fluid Flow","Automotive / Vehicle Aerodynamics","Combustion / Reacting Flow","Hydraulics / Pipe Network","Wind Engineering / Building Facade","Biomedical / Hemodynamics","Other"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Preferred solver software" required>
                <select className={selectCls} value={form.solverSoftware} onChange={(e) => set("solverSoftware", e.target.value)}>
                  <option value="">— Select —</option>
                  {["ANSYS Fluent","OpenFOAM","STAR-CCM+","ANSYS CFX","Simcenter FLOEFD","Autodesk CFD","No preference — recommend one"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Results needed by" required>
                <input type="date" className={inputCls} value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
              </Field>
              <Field label="Budget range (₹)">
                <select className={selectCls} value={form.budget} onChange={(e) => set("budget", e.target.value)}>
                  <option value="">— Optional —</option>
                  {["Under ₹10,000","₹10,000 – ₹25,000","₹25,000 – ₹50,000","₹50,000 – ₹1,00,000","Above ₹1,00,000"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Brief project description" required full>
                <textarea className={textareaCls} placeholder="What is the objective of this simulation? What decisions will the results drive?" value={form.description} onChange={(e) => set("description", e.target.value)} />
              </Field>
            </div>
          </Panel>
          <NavRow onNext={nextPage} nextLabel="Next: geometry" />
        </div>
      )}

      {/* PAGE 1 — Geometry */}
      {page === 1 && (
        <div className="space-y-5">
          <Panel title="CAD geometry." subtitle="Send the files by email after you submit, quoting your reference ID.">
            <div className="cf-note mb-5">
              <p className="text-sm leading-6 break-words text-ink">
                When you submit, you get a reference ID. Send your CAD files
                (STEP, IGES, STL) to{" "}
                <strong className="break-all">cfd@coreframecloud.com</strong> with
                that ID in the subject line.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="CAD file format">
                <select className={selectCls} value={form.cadFormat} onChange={(e) => set("cadFormat", e.target.value)}>
                  <option value="">— Select —</option>
                  {["STEP (.step / .stp)","IGES (.igs / .iges)","STL (.stl)","Parasolid (.x_t / .x_b)","SolidWorks (.sldprt / .sldasm)","CATIA (.CATProduct / .CATPart)","SpaceClaim / ANSYS Discovery","No CAD — I need geometry creation"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Model units">
                <select className={selectCls} value={form.modelUnits} onChange={(e) => set("modelUnits", e.target.value)}>
                  {["Millimetres (mm)","Metres (m)","Inches (in)","Centimetres (cm)","Unknown — please verify"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Overall dimensions (L × W × H)">
                <input className={inputCls} placeholder="e.g. 50m × 30m × 10m" value={form.dimensions} onChange={(e) => set("dimensions", e.target.value)} />
              </Field>
              <Field label="Approximate number of components">
                <select className={selectCls} value={form.componentCount} onChange={(e) => set("componentCount", e.target.value)}>
                  <option value="">— Select —</option>
                  {["1 – 5","6 – 20","21 – 100","100+"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Symmetry or periodicity">
                <RadioGroup name="symmetry" value={form.symmetry} onChange={(v) => set("symmetry", v)}
                  options={[{value:"none",label:"None"},{value:"1-plane",label:"1-plane"},{value:"periodic",label:"Periodic"},{value:"axisymmetric",label:"Axisymmetric"}]} />
              </Field>
              <Field label="Does the CAD need simplifying?">
                <RadioGroup name="simplification" value={form.simplification} onChange={(v) => set("simplification", v)}
                  options={[{value:"no",label:"CFD-ready"},{value:"yes",label:"Needs defeaturing"},{value:"unsure",label:"Unsure"}]} />
              </Field>
              <Field label="Features to retain or suppress" full>
                <textarea className={textareaCls} placeholder="e.g. Retain diffuser louvres; suppress bolts and fillets < 2mm" value={form.geometryNotes} onChange={(e) => set("geometryNotes", e.target.value)} />
              </Field>
            </div>
          </Panel>

          {form.applicationType && (
            <Panel title="CAD pre-submission checklist." subtitle={`What we need for ${form.applicationType}.`}>
              <div className="mb-4 rounded-cf border border-rule bg-paper px-4 py-3 text-[13px] leading-5 text-ink-2">
                Anything on this list that is wrong delays your quote. Fix it in
                your CAD tool before you upload.
              </div>
              <ul className="space-y-2">
                {getChecklistItems(form.applicationType).map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm break-words text-ink-2">
                    <span className="mt-0.5 shrink-0 font-mono text-xs font-bold text-blue">{i + 1}.</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel title="Computational domain.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Domain type" required>
                <select className={selectCls} value={form.domainType} onChange={(e) => set("domainType", e.target.value)}>
                  <option value="">— Select —</option>
                  {["Internal flow (inside geometry)","External flow (around geometry)","Both internal + external"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Target mesh size">
                <select className={selectCls} value={form.meshSize} onChange={(e) => set("meshSize", e.target.value)}>
                  <option value="">— Estimate / unsure —</option>
                  {["< 1 Million","1 – 5 Million","5 – 20 Million","20 – 50 Million","50 – 100 Million","100 Million+"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Wall y⁺ requirement">
                <select className={selectCls} value={form.yplus} onChange={(e) => set("yplus", e.target.value)}>
                  <option value="">— Not sure —</option>
                  {["y⁺ ≈ 1 (wall-resolved)","y⁺ 30–300 (wall functions)","Solver default"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="External domain extents" full>
                <input className={inputCls} placeholder="e.g. 10D upstream, 20D downstream, 5D lateral" value={form.domainExtents} onChange={(e) => set("domainExtents", e.target.value)} />
              </Field>
            </div>
          </Panel>
          <NavRow onNext={nextPage} nextLabel="Next: boundary conditions" />
        </div>
      )}

      {/* PAGE 2 — Boundary Conditions */}
      {page === 2 && (
        <div className="space-y-5">
          <Panel title="Boundary conditions." subtitle="Define each inlet, outlet and wall. Add as many as you need.">
            <div className="space-y-4">
              {bcRows.map((row, idx) => (
                <div key={row.id} className="rounded-cf border border-rule bg-paper p-4">
                  <div className="mb-3 flex items-center justify-between gap-2 border-b border-rule pb-2">
                    <span className="cf-eyebrow">Boundary {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeBCRow(row.id)}
                      aria-label={`Remove boundary ${idx + 1}`}
                      className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-cf text-ink-3 transition hover:text-destructive"
                    >
                      <span aria-hidden="true" className="text-base leading-none">✕</span>
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <Field label="Name">
                      <input className={inputCls} value={row.name} onChange={(e) => updateBCRow(row.id, "name", e.target.value)} placeholder="e.g. Inlet 1" />
                    </Field>
                    <Field label="Type">
                      <select className={selectCls} value={row.type} onChange={(e) => updateBCRow(row.id, "type", e.target.value)}>
                        {BC_TYPES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </Field>
                    <Field label="Value">
                      <input className={inputCls} value={row.value} onChange={(e) => updateBCRow(row.id, "value", e.target.value)} placeholder="velocity or pressure" />
                    </Field>
                    <Field label="Temp (°C)">
                      <input className={inputCls} value={row.temp} onChange={(e) => updateBCRow(row.id, "temp", e.target.value)} placeholder="—" />
                    </Field>
                    <Field label="Turbulence">
                      <input className={inputCls} value={row.turb} onChange={(e) => updateBCRow(row.id, "turb", e.target.value)} placeholder="5% / length scale" />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addBCRow}
              className="mt-3 flex min-h-11 w-full items-center justify-center rounded-cf border border-dashed border-rule px-4 text-sm font-semibold text-ink-2 transition hover:border-blue hover:text-blue sm:w-auto"
            >
              Add a boundary
            </button>

            <div className="mt-5 grid gap-4 border-t border-rule pt-5 sm:grid-cols-2">
              <Field label="Reference pressure">
                <input className={inputCls} placeholder="e.g. 101325 Pa (atmospheric)" value={form.refPressure} onChange={(e) => set("refPressure", e.target.value)} />
              </Field>
              <Field label="Gravity direction">
                <select className={selectCls} value={form.gravity} onChange={(e) => set("gravity", e.target.value)}>
                  {["−Y (standard)","−Z","No gravity / microgravity","Custom — I'll specify"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Additional boundary notes" full>
                <textarea className={textareaCls} placeholder="Heat fluxes, rotating walls, porous regions, custom profiles, etc." value={form.bcNotes} onChange={(e) => set("bcNotes", e.target.value)} />
              </Field>
            </div>
          </Panel>
          <NavRow onNext={nextPage} nextLabel="Next: flow physics" />
        </div>
      )}

      {/* PAGE 3 — Flow Physics */}
      {page === 3 && (
        <div className="space-y-5">
          <Panel title="Flow physics and fluid properties.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Flow regime" required>
                <select className={selectCls} value={form.flowRegime} onChange={(e) => set("flowRegime", e.target.value)}>
                  <option value="">— Select —</option>
                  {["Steady-state","Transient (time-varying)","Quasi-steady (time-averaged)"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Fluid type" required>
                <select className={selectCls} value={form.fluidType} onChange={(e) => set("fluidType", e.target.value)}>
                  <option value="">— Select —</option>
                  {["Air (incompressible)","Air (compressible)","Water (liquid)","Oil / Lubricant","Multi-phase (air + water)","Non-Newtonian","Custom / mixed"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Compressibility">
                <select className={selectCls} value={form.compressibility} onChange={(e) => set("compressibility", e.target.value)}>
                  {["Incompressible (Ma < 0.3)","Weakly compressible","Compressible (Ma > 0.3)","Supersonic / hypersonic"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>

            <div className="mt-4 grid gap-4 border-t border-rule pt-5 sm:grid-cols-2">
              <Field label="Turbulence modelling" required>
                <select className={selectCls} value={form.turbulenceModel} onChange={(e) => set("turbulenceModel", e.target.value)}>
                  <option value="">— Select —</option>
                  {["k-ε Realizable","k-ε Standard","k-ω SST","Spalart-Allmaras","LES (Large Eddy Simulation)","DES / DDES","Laminar (no turbulence)","Recommend for my case"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Reynolds number (approximate)">
                <input className={inputCls} placeholder="e.g. ~5×10⁵ or 'unknown'" value={form.reynolds} onChange={(e) => set("reynolds", e.target.value)} />
              </Field>
            </div>

            <div className="mt-5 border-t border-rule pt-5">
              <div className="mb-2 text-[13px] font-medium text-ink">Additional physics. Select all that apply.</div>
              <div className="flex flex-wrap gap-2">
                <CheckChip checked={form.physicsHeat} onChange={(v) => set("physicsHeat", v)} label="Heat Transfer" />
                <CheckChip checked={form.physicsBuoyancy} onChange={(v) => set("physicsBuoyancy", v)} label="Buoyancy / Natural Convection" />
                <CheckChip checked={form.physicsRadiation} onChange={(v) => set("physicsRadiation", v)} label="Thermal Radiation" />
                <CheckChip checked={form.physicsCombustion} onChange={(v) => set("physicsCombustion", v)} label="Combustion / Species" />
                <CheckChip checked={form.physicsParticles} onChange={(v) => set("physicsParticles", v)} label="Particle / DPM Tracking" />
                <CheckChip checked={form.physicsMultiphase} onChange={(v) => set("physicsMultiphase", v)} label="Multiphase (VOF / Eulerian)" />
                <CheckChip checked={form.physicsMoving} onChange={(v) => set("physicsMoving", v)} label="Moving Mesh / Rotating Zones" />
                <CheckChip checked={form.physicsPorous} onChange={(v) => set("physicsPorous", v)} label="Porous Media" />
                <CheckChip checked={form.physicsFsi} onChange={(v) => set("physicsFsi", v)} label="Fluid-Structure Interaction" />
              </div>
            </div>

            <div className="mt-5 grid gap-4 border-t border-rule pt-5 sm:grid-cols-2">
              <Field label="Fluid temperature (°C)">
                <input type="number" className={inputCls} placeholder="e.g. 25" value={form.fluidTemp} onChange={(e) => set("fluidTemp", e.target.value)} />
              </Field>
              <Field label="Operating pressure (Pa)">
                <input type="number" className={inputCls} placeholder="e.g. 101325" value={form.operatingPressure} onChange={(e) => set("operatingPressure", e.target.value)} />
              </Field>
              <Field label="Custom fluid properties" full>
                <textarea className={textareaCls} placeholder="Density, viscosity, thermal conductivity, Cp — or paste material data sheet reference" value={form.fluidProps} onChange={(e) => set("fluidProps", e.target.value)} />
              </Field>
            </div>
          </Panel>
          <NavRow onNext={nextPage} nextLabel="Next: solver and outputs" />
        </div>
      )}

      {/* PAGE 4 — Solver */}
      {page === 4 && (
        <div className="space-y-5">
          <Panel title="Solver settings.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Convergence target">
                <select className={selectCls} value={form.convergence} onChange={(e) => set("convergence", e.target.value)}>
                  {["10⁻³ (standard)","10⁻⁴","10⁻⁵","10⁻⁶ (high accuracy)","Monitor-based (mass flux / force)"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Max iterations or time steps">
                <input className={inputCls} placeholder="e.g. 2000 or 5000 × 0.01s" value={form.iterations} onChange={(e) => set("iterations", e.target.value)} />
              </Field>
              <Field label="Time step (transient only)">
                <input className={inputCls} placeholder="e.g. 0.01 s" value={form.timestep} onChange={(e) => set("timestep", e.target.value)} />
              </Field>
            </div>
            <div className="mt-5 border-t border-rule pt-5">
              <Field label="Pressure–velocity coupling">
                <RadioGroup name="coupling" value={form.coupling} onChange={(v) => set("coupling", v)}
                  options={[{value:"simple",label:"SIMPLE"},{value:"simplec",label:"SIMPLEC"},{value:"piso",label:"PISO (transient)"},{value:"coupled",label:"Coupled"},{value:"auto",label:"Auto-select"}]} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Additional solver or HPC notes" full>
                <textarea className={textareaCls} placeholder="MPI core count target, memory limit, UDF files, etc." value={form.solverNotes} onChange={(e) => set("solverNotes", e.target.value)} />
              </Field>
            </div>
          </Panel>

          <Panel title="Post-processing and deliverables." subtitle="What results do you need back?">
            <div className="mb-4">
              <div className="mb-2 text-[13px] font-medium text-ink">Required output. Select all that apply.</div>
              <div className="flex flex-wrap gap-2">
                <CheckChip checked={form.outVelocity} onChange={(v) => set("outVelocity", v)} label="Velocity contours / vectors" />
                <CheckChip checked={form.outPressure} onChange={(v) => set("outPressure", v)} label="Pressure distribution" />
                <CheckChip checked={form.outTemperature} onChange={(v) => set("outTemperature", v)} label="Temperature contours" />
                <CheckChip checked={form.outStreamlines} onChange={(v) => set("outStreamlines", v)} label="Streamlines / pathlines" />
                <CheckChip checked={form.outTurbulence} onChange={(v) => set("outTurbulence", v)} label="Turbulence intensity / TKE" />
                <CheckChip checked={form.outForces} onChange={(v) => set("outForces", v)} label="Lift / drag / force coefficients" />
                <CheckChip checked={form.outPressureDrop} onChange={(v) => set("outPressureDrop", v)} label="Pressure drop" />
                <CheckChip checked={form.outMassFlow} onChange={(v) => set("outMassFlow", v)} label="Mass flow balance" />
                <CheckChip checked={form.outResidence} onChange={(v) => set("outResidence", v)} label="Residence time / age of air" />
                <CheckChip checked={form.outIso} onChange={(v) => set("outIso", v)} label="Iso-surfaces" />
                <CheckChip checked={form.outAnimation} onChange={(v) => set("outAnimation", v)} label="Transient animation (video)" />
                <CheckChip checked={form.outReport} onChange={(v) => set("outReport", v)} label="Engineering report (PDF)" />
              </div>
            </div>
            <div className="grid gap-4 border-t border-rule pt-4 sm:grid-cols-2">
              <Field label="Report format">
                <select className={selectCls} value={form.reportFormat} onChange={(e) => set("reportFormat", e.target.value)}>
                  {["PDF report with figures","Raw data files (.csv) only","ParaView / CFD-Post project files","ANSYS Fluent case + data files","All of the above"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Key performance metric">
                <input className={inputCls} placeholder="e.g. Minimise pressure drop across heat exchanger" value={form.kpi} onChange={(e) => set("kpi", e.target.value)} />
              </Field>
              <Field label="Specific quantities, planes or probe points" full>
                <textarea className={textareaCls} placeholder="e.g. Velocity profile at x=5m; pressure at outlet faces; temp map at 1.2m height" value={form.postprocNotes} onChange={(e) => set("postprocNotes", e.target.value)} />
              </Field>
            </div>
          </Panel>
          <NavRow onNext={nextPage} nextLabel="Next: sign-off" />
        </div>
      )}

      {/* PAGE 5 — Sign-off */}
      {page === 5 && (
        <div className="space-y-5">
          <Panel title="Client declaration and sign-off.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Authorising name" required>
                <input className={inputCls} placeholder="Name of person authorising this job" value={form.authName} onChange={(e) => set("authName", e.target.value)} />
              </Field>
              <Field label="Date" required>
                <input type="date" className={inputCls} value={form.authDate} onChange={(e) => set("authDate", e.target.value)} />
              </Field>
              <Field label="Final notes or special requests" full>
                <textarea className={textareaCls} placeholder="NDA requirements, confidentiality, invoicing preferences, etc." value={form.finalNotes} onChange={(e) => set("finalNotes", e.target.value)} />
              </Field>
            </div>

            <div className="mt-5 space-y-3 border-t border-rule pt-5">
              <label className="flex cursor-pointer items-start gap-3 rounded-cf border border-rule bg-paper p-4 text-sm leading-6 text-ink-2 transition hover:border-rule-strong">
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-cf border ${form.confirmAccuracy ? "border-blue bg-blue" : "border-rule-strong"}`}>
                  {form.confirmAccuracy && <span className="text-[11px] leading-none font-bold text-white">✓</span>}
                </div>
                <input type="checkbox" className="sr-only" checked={form.confirmAccuracy} onChange={(e) => set("confirmAccuracy", e.target.checked)} />
                <span>
                  I confirm what I have put in this form is accurate and
                  complete. Coreframe Cloud quotes from these inputs, and a
                  big change after the quote can move the price and the
                  schedule.{" "}
                  <span className="text-destructive" aria-hidden="true">*</span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-cf border border-rule bg-paper p-4 text-sm leading-6 text-ink-2 transition hover:border-rule-strong">
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-cf border ${form.confirmData ? "border-blue bg-blue" : "border-rule-strong"}`}>
                  {form.confirmData && <span className="text-[11px] leading-none font-bold text-white">✓</span>}
                </div>
                <input type="checkbox" className="sr-only" checked={form.confirmData} onChange={(e) => set("confirmData", e.target.checked)} />
                <span>I consent to Coreframe Cloud storing this project data for job execution and account management.</span>
              </label>
            </div>

            <div className="mt-4">
              <Field label="Digital signature (type your full name)">
                <input className={inputCls} placeholder="Type your full name as digital signature" value={form.signature} onChange={(e) => set("signature", e.target.value)} />
              </Field>
            </div>
          </Panel>
          <NavRow onNext={handleSubmit} nextLabel="Submit CFD job request" isLast />
        </div>
      )}
    </div>
  );
}
