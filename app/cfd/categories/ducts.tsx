"use client";

import { Choice, Field, inputCls } from "../form-ui";
import type { CategoryFields } from "./types";

/**
 * Ducts and pipes (live 13 Oct 2026): the fields the automatic service
 * actually uses.
 *
 * What the duct flow does not ask is filled with values the API's scope rules
 * (services/cfd_rules.py) and the runner's case generator (cfd-runner/
 * case_gen.py) accept; the fixed ones are in lib/cfd-categories.ts:
 *   - domainType contains "internal"  -> internal flow, caps from the STL;
 *   - applicationType has no "hvac"/"room"/"indoor" keyword, which would
 *     apply the 2-50 m room size check to a 50 mm pipe;
 *   - one "Velocity Inlet" row and one "Pressure Outlet" row (0 Pa);
 *   - a flow rate is sent in m3/s. The API's Mach check reads the first
 *     number of the inlet value as m/s, so "500 m3/h" would be rejected as
 *     compressible; 0.139 m3/s is not. The runner reads m3/s as a flow rate.
 *   - turbulenceModel "Recommend for my case" -> k-omega SST.
 */

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

type FlowUnit = (typeof FLOW_UNITS)[number]["value"];

export type DuctState = {
  fluid: string;
  flow: string;
  flowUnit: FlowUnit;
  units: string;
  noStl: boolean;
  dims: string;
  file: File | null;
};

function formatM3s(q: number): string {
  // Plain decimal with 4 significant figures, e.g. 0.1389 or 0.0007833.
  return `${Number(q.toPrecision(4))} m3/s`;
}

function inletValue(s: DuctState): string | null {
  const n = Number(s.flow.replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  const u = FLOW_UNITS.find((f) => f.value === s.flowUnit)!;
  return u.toM3s === null ? `${n} m/s` : formatM3s(n * u.toM3s);
}

function DuctFields({ state, set }: { state: DuctState; set: (patch: Partial<DuctState>) => void }) {
  return (
    <>
      <Field label="Fluid">
        <Choice name="fluid" value={state.fluid} onChange={(v) => set({ fluid: v })} options={[{ value: "Air", label: "Air" }, { value: "Water", label: "Water" }]} />
      </Field>
      <Field label="Inlet flow" htmlFor="cf-flow" hint="Mean inlet velocity, or a flow rate.">
        <div className="flex gap-2">
          <input id="cf-flow" inputMode="decimal" className={`${inputCls} min-w-0 flex-1`} placeholder="e.g. 4" value={state.flow} onChange={(e) => set({ flow: e.target.value })} />
          <select
            aria-label="Flow unit"
            className={`${inputCls} !w-[104px] shrink-0`}
            value={state.flowUnit}
            onChange={(e) => set({ flowUnit: e.target.value as FlowUnit })}
          >
            {FLOW_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>
      </Field>

      <Field label="Units your STL was exported in" full>
        <Choice name="units" value={state.units} onChange={(v) => set({ units: v })} options={UNITS} />
      </Field>

      <div className="sm:col-span-2">
        {!state.noStl ? (
          <Field label="Your STL (the fluid volume, one closed solid, flat end caps)" htmlFor="cf-file" hint="Binary STL up to 200 MB. Files over 80 MB are uploaded on your job page after you submit.">
            <label className="flex min-h-[88px] cursor-pointer flex-col items-center justify-center rounded-cf border-2 border-dashed border-rule bg-paper p-4 text-center transition hover:border-blue">
              <input
                id="cf-file"
                type="file"
                accept=".stl"
                className="sr-only"
                onChange={(e) => set({ file: e.target.files?.[0] ?? null })}
              />
              {state.file ? (
                <span className="text-sm break-all text-ink">
                  {state.file.name} <span className="text-ink-3">· {(state.file.size / 1024 / 1024).toFixed(1)} MB</span>
                </span>
              ) : (
                <span className="text-sm text-ink-2">Choose an .stl file</span>
              )}
            </label>
          </Field>
        ) : (
          <Field label="Straight duct: length × width × height, with units" htmlFor="cf-dims" hint="Rectangular straight duct only, e.g. 3 m x 0.4 m x 0.25 m.">
            <input id="cf-dims" className={inputCls} value={state.dims} onChange={(e) => set({ dims: e.target.value })} />
          </Field>
        )}
        <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-2.5 text-[14px] text-ink-2">
          <input type="checkbox" className="h-4 w-4 accent-[var(--color-blue)]" checked={state.noStl} onChange={(e) => set({ noStl: e.target.checked })} />
          Straight duct, no STL: I&rsquo;ll give its dimensions instead
        </label>
      </div>
    </>
  );
}

export const ductFields: CategoryFields<DuctState> = {
  initial: () => ({ fluid: "Air", flow: "", flowUnit: "m/s", units: "Millimetres (mm)", noStl: false, dims: "", file: null }),

  validate: (s) => {
    const errs: string[] = [];
    if (!inletValue(s)) errs.push("The inlet flow, as a number above zero");
    if (s.flowUnit === "m/s" && Number(s.flow) > 100) errs.push("An inlet speed below 100 m/s (we run incompressible flow)");
    if (s.noStl) {
      if ((s.dims.match(/\d*\.?\d+/g) || []).length < 3) errs.push("The duct's length, width and height");
    } else if (!s.file) {
      errs.push("Your STL file");
    } else {
      if (!s.file.name.toLowerCase().endsWith(".stl")) errs.push("An .stl file (STEP, IGES and IFC are not accepted yet)");
      if (s.file.size > STL_MAX) errs.push("An STL under 200 MB (export it with a coarser tolerance)");
    }
    return errs;
  },

  toPayload: (s) => ({
    cadFormat: s.noStl ? "" : "STL",
    modelUnits: s.units,
    dimensions: s.noStl ? s.dims.trim() : "",
    bcRows: [
      { name: "Inlet", type: "Velocity Inlet", value: inletValue(s)!, temp: "", turb: "" },
      { name: "Outlet", type: "Pressure Outlet", value: "0 Pa", temp: "", turb: "" },
    ],
    refPressure: "0 Pa",
    flowRegime: "Steady-state",
    fluidType: s.fluid,
    compressibility: "Incompressible",
    turbulenceModel: "Recommend for my case",
    outVelocity: true,
    outPressure: true,
    outStreamlines: true,
    outPressureDrop: true,
    outReport: true,
    reportFormat: "PDF",
  }),

  file: (s) => (s.noStl ? null : s.file),

  Fields: DuctFields,
};
