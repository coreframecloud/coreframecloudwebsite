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

const STEPS = ["Project", "Geometry", "Boundaries", "Physics", "Solver", "Sign-off"];

const BC_TYPES = [
  "Velocity Inlet", "Mass Flow Inlet", "Pressure Inlet",
  "Pressure Outlet", "Outflow", "No-slip Wall", "Moving Wall",
  "Symmetry", "Periodic", "Interior",
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function Panel({ icon, title, subtitle, children }: {
  icon: string; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
      <div className="mb-5 flex items-start gap-3 border-b border-white/8 pb-4">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="font-semibold text-white">{title}</div>
          {subtitle && <div className="mt-0.5 text-xs text-slate-400">{subtitle}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}{required && <span className="ml-1 text-amber-400">✱</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition";
const selectCls =
  "w-full rounded-xl border border-white/10 bg-[#0d1626] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition";

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
          className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
            value === o.value
              ? "border-blue-500/60 bg-blue-500/10 text-blue-200"
              : "border-white/10 bg-white/4 text-slate-300 hover:border-white/20"
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
      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
        checked
          ? "border-blue-500/60 bg-blue-500/10 text-blue-200"
          : "border-white/10 bg-white/4 text-slate-300 hover:border-white/20"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className={`h-3.5 w-3.5 rounded border ${checked ? "border-blue-400 bg-blue-500" : "border-slate-600"} flex items-center justify-center`}>
        {checked && <span className="text-[9px] text-white">✓</span>}
      </span>
      {label}
    </label>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CfdIntakeForm() {
  const [page, setPage] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [bcRows, setBcRows] = useState<BCRow[]>(DEFAULT_BC_ROWS);
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

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
      if (!form.company)        errs.push("Company / Organisation");
      if (!form.projectName)    errs.push("Project Name");
      if (!form.contactName)    errs.push("Your Name");
      if (!form.email)          errs.push("Email");
      if (!form.applicationType) errs.push("CFD Application Type");
      if (!form.solverSoftware) errs.push("Preferred Solver");
      if (!form.deadline)       errs.push("Results Needed By");
      if (!form.description)    errs.push("Project Description");
    }
    if (p === 1) {
      if (!form.domainType) errs.push("Domain Type");
    }
    if (p === 3) {
      if (!form.flowRegime)      errs.push("Flow Regime");
      if (!form.fluidType)       errs.push("Fluid Type");
      if (!form.turbulenceModel) errs.push("Turbulence Modelling");
    }
    if (p === 5) {
      if (!form.authName) errs.push("Authorising Name");
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

  const handleSubmit = () => {
    const errs = validatePage(5);
    if (errs.length) { setErrors(errs); return; }
    const ref = "CF-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    setRefId(ref);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="mb-6 text-6xl">🚀</div>
        <h2 className="text-3xl font-bold tracking-tight">Job submitted!</h2>
        <p className="mt-4 text-slate-300">
          Our engineering team will review your inputs and send you a quote within 1 business day.
          Email your CAD files to{" "}
          <a href="mailto:cfd@coreframecloud.com" className="text-blue-400 underline">
            cfd@coreframecloud.com
          </a>{" "}
          with the reference ID below in the subject line.
        </p>
        <div className="my-8 inline-block rounded-2xl border border-blue-500/30 bg-blue-500/10 px-8 py-4 font-mono text-2xl font-bold tracking-widest text-blue-300">
          {refId}
        </div>
        <p className="mb-8 text-sm text-slate-500">Save this ID — use it for all future correspondence about this job.</p>
        <button
          onClick={() => { setSubmitted(false); setForm(INITIAL); setBcRows(DEFAULT_BC_ROWS); setPage(0); }}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition"
        >
          Submit another job
        </button>
      </div>
    );
  }

  // ── Step indicator ──────────────────────────────────────────────────────────
  const StepBar = () => (
    <div className="mb-8 flex gap-1 overflow-x-auto pb-1">
      {STEPS.map((s, i) => (
        <button
          key={s}
          onClick={() => { setErrors([]); setPage(i); }}
          className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-semibold transition ${
            i === page
              ? "bg-blue-600 text-white"
              : i < page
              ? "bg-green-500/15 text-green-300"
              : "bg-white/5 text-slate-500"
          }`}
        >
          <span className={`text-base font-bold ${i < page ? "text-green-400" : ""}`}>
            {i < page ? "✓" : i + 1}
          </span>
          {s}
        </button>
      ))}
    </div>
  );

  // ── Error banner ────────────────────────────────────────────────────────────
  const ErrorBanner = () =>
    errors.length ? (
      <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
        <strong>Please fill in:</strong> {errors.join(", ")}
      </div>
    ) : null;

  // ── Nav buttons ─────────────────────────────────────────────────────────────
  const NavRow = ({ onNext, nextLabel = "Next →", isLast = false }: {
    onNext: () => void; nextLabel?: string; isLast?: boolean;
  }) => (
    <div className="mt-6 flex justify-between">
      <button
        type="button"
        onClick={prevPage}
        className={`rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 ${page === 0 ? "invisible" : ""}`}
      >
        ← Back
      </button>
      <button
        type="button"
        onClick={onNext}
        className={`rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition ${
          isLast
            ? "bg-green-600 hover:bg-green-500"
            : "bg-blue-600 hover:bg-blue-500"
        }`}
      >
        {nextLabel}
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
          <Panel icon="🏢" title="Client & Project Details" subtitle="Used on your final report and invoice">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company / Organisation" required>
                <input className={inputCls} placeholder="e.g. Acme HVAC Pvt. Ltd." value={form.company} onChange={(e) => set("company", e.target.value)} />
              </Field>
              <Field label="Project Name" required>
                <input className={inputCls} placeholder="e.g. Office Building HVAC Study" value={form.projectName} onChange={(e) => set("projectName", e.target.value)} />
              </Field>
              <Field label="Your Name" required>
                <input className={inputCls} placeholder="Full name" value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
              </Field>
              <Field label="Designation">
                <input className={inputCls} placeholder="e.g. CFD Engineer" value={form.designation} onChange={(e) => set("designation", e.target.value)} />
              </Field>
              <Field label="Email" required>
                <input type="email" className={inputCls} placeholder="you@company.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </Field>
              <Field label="Phone / WhatsApp">
                <input className={inputCls} placeholder="+91 98765 43210" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </Field>
            </div>
          </Panel>

          <Panel icon="📋" title="Project Scope & Timeline">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="CFD Application Type" required>
                <select className={selectCls} value={form.applicationType} onChange={(e) => set("applicationType", e.target.value)}>
                  <option value="">— Select —</option>
                  {["HVAC / Indoor Thermal Comfort","External Aerodynamics","Electronics Cooling","Process / Industrial Fluid Flow","Automotive / Vehicle Aerodynamics","Combustion / Reacting Flow","Hydraulics / Pipe Network","Wind Engineering / Building Facade","Biomedical / Hemodynamics","Other"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Preferred Solver Software" required>
                <select className={selectCls} value={form.solverSoftware} onChange={(e) => set("solverSoftware", e.target.value)}>
                  <option value="">— Select —</option>
                  {["ANSYS Fluent","OpenFOAM","STAR-CCM+","ANSYS CFX","Simcenter FLOEFD","Autodesk CFD","No preference — recommend one"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Results Needed By" required>
                <input type="date" className={inputCls} value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
              </Field>
              <Field label="Budget Range (₹)">
                <select className={selectCls} value={form.budget} onChange={(e) => set("budget", e.target.value)}>
                  <option value="">— Optional —</option>
                  {["Under ₹10,000","₹10,000 – ₹25,000","₹25,000 – ₹50,000","₹50,000 – ₹1,00,000","Above ₹1,00,000"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Brief Project Description" required>
                <textarea className={`${inputCls} min-h-[80px] resize-y sm:col-span-2`} placeholder="What is the objective of this simulation? What decisions will the results drive?" value={form.description} onChange={(e) => set("description", e.target.value)} />
              </Field>
            </div>
          </Panel>
          <NavRow onNext={nextPage} nextLabel="Next: Geometry →" />
        </div>
      )}

      {/* PAGE 1 — Geometry */}
      {page === 1 && (
        <div className="space-y-5">
          <Panel icon="📐" title="CAD Geometry" subtitle="Attach files via email after submission using your reference ID">
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/8 p-3.5 text-sm text-blue-200">
              <span className="mt-0.5 text-base">ℹ️</span>
              <span>After submitting you'll receive a reference ID. Send your CAD files (STEP, IGES, STL) to <strong>cfd@coreframecloud.com</strong> with the ID in the subject line.</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="CAD File Format">
                <select className={selectCls} value={form.cadFormat} onChange={(e) => set("cadFormat", e.target.value)}>
                  <option value="">— Select —</option>
                  {["STEP (.step / .stp)","IGES (.igs / .iges)","STL (.stl)","Parasolid (.x_t / .x_b)","SolidWorks (.sldprt / .sldasm)","CATIA (.CATProduct / .CATPart)","SpaceClaim / ANSYS Discovery","No CAD — I need geometry creation"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Model Units">
                <select className={selectCls} value={form.modelUnits} onChange={(e) => set("modelUnits", e.target.value)}>
                  {["Millimetres (mm)","Metres (m)","Inches (in)","Centimetres (cm)","Unknown — please verify"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Overall Dimensions (L × W × H)">
                <input className={inputCls} placeholder="e.g. 50m × 30m × 10m" value={form.dimensions} onChange={(e) => set("dimensions", e.target.value)} />
              </Field>
              <Field label="Approx. No. of Components">
                <select className={selectCls} value={form.componentCount} onChange={(e) => set("componentCount", e.target.value)}>
                  <option value="">— Select —</option>
                  {["1 – 5","6 – 20","21 – 100","100+"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Symmetry / Periodicity">
                <RadioGroup name="symmetry" value={form.symmetry} onChange={(v) => set("symmetry", v)}
                  options={[{value:"none",label:"None"},{value:"1-plane",label:"1-plane"},{value:"periodic",label:"Periodic"},{value:"axisymmetric",label:"Axisymmetric"}]} />
              </Field>
              <Field label="CAD Simplification Needed?">
                <RadioGroup name="simplification" value={form.simplification} onChange={(v) => set("simplification", v)}
                  options={[{value:"no",label:"CFD-ready"},{value:"yes",label:"Needs defeaturing"},{value:"unsure",label:"Unsure"}]} />
              </Field>
              <Field label="Features to Retain / Suppress">
                <textarea className={`${inputCls} min-h-[64px] resize-y sm:col-span-2`} placeholder="e.g. Retain diffuser louvres; suppress bolts and fillets < 2mm" value={form.geometryNotes} onChange={(e) => set("geometryNotes", e.target.value)} />
              </Field>
            </div>
          </Panel>

          <Panel icon="🔲" title="Computational Domain">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Domain Type" required>
                <select className={selectCls} value={form.domainType} onChange={(e) => set("domainType", e.target.value)}>
                  <option value="">— Select —</option>
                  {["Internal flow (inside geometry)","External flow (around geometry)","Both internal + external"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Target Mesh Size">
                <select className={selectCls} value={form.meshSize} onChange={(e) => set("meshSize", e.target.value)}>
                  <option value="">— Estimate / unsure —</option>
                  {["< 1 Million","1 – 5 Million","5 – 20 Million","20 – 50 Million","50 – 100 Million","100 Million+"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Wall y⁺ Requirement">
                <select className={selectCls} value={form.yplus} onChange={(e) => set("yplus", e.target.value)}>
                  <option value="">— Not sure —</option>
                  {["y⁺ ≈ 1 (wall-resolved)","y⁺ 30–300 (wall functions)","Solver default"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="External Domain Extents">
                <input className={`${inputCls} sm:col-span-3`} placeholder="e.g. 10D upstream, 20D downstream, 5D lateral" value={form.domainExtents} onChange={(e) => set("domainExtents", e.target.value)} />
              </Field>
            </div>
          </Panel>
          <NavRow onNext={nextPage} nextLabel="Next: Boundary Conditions →" />
        </div>
      )}

      {/* PAGE 2 — Boundary Conditions */}
      {page === 2 && (
        <div className="space-y-5">
          <Panel icon="🌀" title="Boundary Conditions" subtitle="Define each inlet, outlet, and wall — add rows as needed">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                    <th className="pb-2 text-left">Boundary Name</th>
                    <th className="pb-2 pl-2 text-left">Type</th>
                    <th className="pb-2 pl-2 text-left">Value</th>
                    <th className="pb-2 pl-2 text-left">Temp (°C)</th>
                    <th className="pb-2 pl-2 text-left">Turbulence</th>
                    <th className="pb-2 pl-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bcRows.map((row) => (
                    <tr key={row.id}>
                      <td className="py-1.5">
                        <input className={inputCls} value={row.name} onChange={(e) => updateBCRow(row.id, "name", e.target.value)} placeholder="e.g. Inlet 1" />
                      </td>
                      <td className="py-1.5 pl-2">
                        <select className={selectCls} value={row.type} onChange={(e) => updateBCRow(row.id, "type", e.target.value)}>
                          {BC_TYPES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="py-1.5 pl-2">
                        <input className={inputCls} value={row.value} onChange={(e) => updateBCRow(row.id, "value", e.target.value)} placeholder="velocity / pressure" />
                      </td>
                      <td className="py-1.5 pl-2" style={{ width: 80 }}>
                        <input className={inputCls} value={row.temp} onChange={(e) => updateBCRow(row.id, "temp", e.target.value)} placeholder="—" />
                      </td>
                      <td className="py-1.5 pl-2">
                        <input className={inputCls} value={row.turb} onChange={(e) => updateBCRow(row.id, "turb", e.target.value)} placeholder="5% / length scale" />
                      </td>
                      <td className="py-1.5 pl-2">
                        <button type="button" onClick={() => removeBCRow(row.id)} className="text-slate-600 hover:text-red-400 transition text-base">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={addBCRow} className="mt-3 rounded-xl border border-dashed border-white/15 px-4 py-2 text-xs font-semibold text-slate-500 hover:border-blue-500/40 hover:text-blue-400 transition">
              ＋ Add boundary
            </button>

            <div className="mt-5 grid gap-4 border-t border-white/8 pt-5 sm:grid-cols-2">
              <Field label="Reference Pressure">
                <input className={inputCls} placeholder="e.g. 101325 Pa (atmospheric)" value={form.refPressure} onChange={(e) => set("refPressure", e.target.value)} />
              </Field>
              <Field label="Gravity Direction">
                <select className={selectCls} value={form.gravity} onChange={(e) => set("gravity", e.target.value)}>
                  {["−Y (standard)","−Z","No gravity / microgravity","Custom — I'll specify"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Additional BC Notes">
                <textarea className={`${inputCls} min-h-[64px] resize-y sm:col-span-2`} placeholder="Heat fluxes, rotating walls, porous regions, custom profiles, etc." value={form.bcNotes} onChange={(e) => set("bcNotes", e.target.value)} />
              </Field>
            </div>
          </Panel>
          <NavRow onNext={nextPage} nextLabel="Next: Flow Physics →" />
        </div>
      )}

      {/* PAGE 3 — Flow Physics */}
      {page === 3 && (
        <div className="space-y-5">
          <Panel icon="⚛️" title="Flow Physics & Fluid Properties">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Flow Regime" required>
                <select className={selectCls} value={form.flowRegime} onChange={(e) => set("flowRegime", e.target.value)}>
                  <option value="">— Select —</option>
                  {["Steady-state","Transient (time-varying)","Quasi-steady (time-averaged)"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Fluid Type" required>
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

            <div className="mt-4 grid gap-4 border-t border-white/8 pt-5 sm:grid-cols-2">
              <Field label="Turbulence Modelling" required>
                <select className={selectCls} value={form.turbulenceModel} onChange={(e) => set("turbulenceModel", e.target.value)}>
                  <option value="">— Select —</option>
                  {["k-ε Realizable","k-ε Standard","k-ω SST","Spalart-Allmaras","LES (Large Eddy Simulation)","DES / DDES","Laminar (no turbulence)","Recommend for my case"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Reynolds Number (approx.)">
                <input className={inputCls} placeholder="e.g. ~5×10⁵ or 'unknown'" value={form.reynolds} onChange={(e) => set("reynolds", e.target.value)} />
              </Field>
            </div>

            <div className="mt-5 border-t border-white/8 pt-5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Additional Physics — select all that apply</div>
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

            <div className="mt-5 grid gap-4 border-t border-white/8 pt-5 sm:grid-cols-2">
              <Field label="Fluid Temperature (°C)">
                <input type="number" className={inputCls} placeholder="e.g. 25" value={form.fluidTemp} onChange={(e) => set("fluidTemp", e.target.value)} />
              </Field>
              <Field label="Operating Pressure (Pa)">
                <input type="number" className={inputCls} placeholder="e.g. 101325" value={form.operatingPressure} onChange={(e) => set("operatingPressure", e.target.value)} />
              </Field>
              <Field label="Custom Fluid Properties">
                <textarea className={`${inputCls} min-h-[60px] resize-y sm:col-span-2`} placeholder="Density, viscosity, thermal conductivity, Cp — or paste material data sheet reference" value={form.fluidProps} onChange={(e) => set("fluidProps", e.target.value)} />
              </Field>
            </div>
          </Panel>
          <NavRow onNext={nextPage} nextLabel="Next: Solver & Outputs →" />
        </div>
      )}

      {/* PAGE 4 — Solver */}
      {page === 4 && (
        <div className="space-y-5">
          <Panel icon="⚙️" title="Solver Settings">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Convergence Target">
                <select className={selectCls} value={form.convergence} onChange={(e) => set("convergence", e.target.value)}>
                  {["10⁻³ (standard)","10⁻⁴","10⁻⁵","10⁻⁶ (high accuracy)","Monitor-based (mass flux / force)"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Max Iterations / Time Steps">
                <input className={inputCls} placeholder="e.g. 2000 or 5000 × 0.01s" value={form.iterations} onChange={(e) => set("iterations", e.target.value)} />
              </Field>
              <Field label="Time Step (transient only)">
                <input className={inputCls} placeholder="e.g. 0.01 s" value={form.timestep} onChange={(e) => set("timestep", e.target.value)} />
              </Field>
            </div>
            <div className="mt-5 border-t border-white/8 pt-5">
              <Field label="Pressure–Velocity Coupling">
                <RadioGroup name="coupling" value={form.coupling} onChange={(v) => set("coupling", v)}
                  options={[{value:"simple",label:"SIMPLE"},{value:"simplec",label:"SIMPLEC"},{value:"piso",label:"PISO (transient)"},{value:"coupled",label:"Coupled"},{value:"auto",label:"Auto-select"}]} />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Additional solver / HPC notes">
                <textarea className={`${inputCls} min-h-[64px] resize-y`} placeholder="MPI core count target, memory limit, UDF files, etc." value={form.solverNotes} onChange={(e) => set("solverNotes", e.target.value)} />
              </Field>
            </div>
          </Panel>

          <Panel icon="📊" title="Post-processing & Deliverables" subtitle="What results do you need from us?">
            <div className="mb-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Required Output — select all that apply</div>
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
            <div className="grid gap-4 border-t border-white/8 pt-4 sm:grid-cols-2">
              <Field label="Report Format">
                <select className={selectCls} value={form.reportFormat} onChange={(e) => set("reportFormat", e.target.value)}>
                  {["PDF report with figures","Raw data files (.csv) only","ParaView / CFD-Post project files","ANSYS Fluent case + data files","All of the above"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Key Performance Metric (KPI)">
                <input className={inputCls} placeholder="e.g. Minimise pressure drop across heat exchanger" value={form.kpi} onChange={(e) => set("kpi", e.target.value)} />
              </Field>
              <Field label="Specific quantities / planes / probe points">
                <textarea className={`${inputCls} min-h-[60px] resize-y sm:col-span-2`} placeholder="e.g. Velocity profile at x=5m; pressure at outlet faces; temp map at 1.2m height" value={form.postprocNotes} onChange={(e) => set("postprocNotes", e.target.value)} />
              </Field>
            </div>
          </Panel>
          <NavRow onNext={nextPage} nextLabel="Next: Sign-off →" />
        </div>
      )}

      {/* PAGE 5 — Sign-off */}
      {page === 5 && (
        <div className="space-y-5">
          <Panel icon="✅" title="Client Declaration & Sign-off">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Authorising Name" required>
                <input className={inputCls} placeholder="Name of person authorising this job" value={form.authName} onChange={(e) => set("authName", e.target.value)} />
              </Field>
              <Field label="Date" required>
                <input type="date" className={inputCls} value={form.authDate} onChange={(e) => set("authDate", e.target.value)} />
              </Field>
              <Field label="Final Notes / Special Requests">
                <textarea className={`${inputCls} min-h-[80px] resize-y sm:col-span-2`} placeholder="NDA requirements, confidentiality, invoicing preferences, etc." value={form.finalNotes} onChange={(e) => set("finalNotes", e.target.value)} />
              </Field>
            </div>

            <div className="mt-5 space-y-3 border-t border-white/8 pt-5">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/8 bg-white/3 p-3.5 text-sm text-slate-300 hover:border-white/15 transition">
                <div className={`mt-0.5 h-5 w-5 flex-shrink-0 rounded border ${form.confirmAccuracy ? "border-blue-400 bg-blue-500" : "border-slate-600"} flex items-center justify-center`}>
                  {form.confirmAccuracy && <span className="text-[11px] text-white font-bold">✓</span>}
                </div>
                <input type="checkbox" className="sr-only" checked={form.confirmAccuracy} onChange={(e) => set("confirmAccuracy", e.target.checked)} />
                <span>
                  I confirm the information in this form is accurate and complete. I understand Coreframe Cloud will prepare a quote based on these inputs, and that significant changes post-quote may affect cost and schedule.{" "}
                  <span className="text-amber-400">✱</span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/8 bg-white/3 p-3.5 text-sm text-slate-300 hover:border-white/15 transition">
                <div className={`mt-0.5 h-5 w-5 flex-shrink-0 rounded border ${form.confirmData ? "border-blue-400 bg-blue-500" : "border-slate-600"} flex items-center justify-center`}>
                  {form.confirmData && <span className="text-[11px] text-white font-bold">✓</span>}
                </div>
                <input type="checkbox" className="sr-only" checked={form.confirmData} onChange={(e) => set("confirmData", e.target.checked)} />
                <span>I consent to Coreframe Cloud storing this project data for job execution and account management.</span>
              </label>
            </div>

            <div className="mt-4">
              <Field label="Digital Signature (type full name)">
                <input className={inputCls} placeholder="Type your full name as digital signature" value={form.signature} onChange={(e) => set("signature", e.target.value)} />
              </Field>
            </div>
          </Panel>
          <NavRow onNext={handleSubmit} nextLabel="Submit CFD Job Request ✓" isLast />
        </div>
      )}
    </div>
  );
}
