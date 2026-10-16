"use client";

import { Choice, Field, inputCls } from "../form-ui";
import type { CategoryFields } from "./types";

/**
 * Rooms / HVAC (16 Oct 2026): a room is DESCRIBED, not uploaded. The fields
 * build the `hvac` block of POST /cfd-jobs exactly as the API validates it
 * (apps/api/app/services/cfd_hvac.py, HvacSpec) and the runner builds the case
 * (cfd-runner/hvac.py):
 *
 *   room        {length_m, width_m, height_m}        x along the length, y across, z up
 *   supplies[]  {wall, center_m [u, v], size_m [w, h], flow_m3_h | flow_l_s | flow_cfm | velocity_m_s,
 *                temperature_c}
 *   returns[]   {wall, center_m, size_m}
 *   heat_loads[] people {count, w_each, center_m, size_m}; equipment / lighting {watts, box_m}
 *   comfort     {clothing_clo, metabolic_met, relative_humidity_pct}
 *   tier_preference  "steady" | "transient" (only preselects the tier on the quote)
 *
 * An opening's centre (u, v) is in its wall's own plane:
 *   end walls (x-min / x-max): (y, z); side walls (y-min / y-max): (x, z); floor / ceiling: (x, y).
 *
 * The other POST /cfd-jobs fields are the ones the API's HVAC path expects (the
 * same as the control plane's e2e harness): heat + buoyancy on, k-epsilon, no
 * geometry file. The `hvac` block alone makes it a room job (the runner meshes
 * it and reports mode "hvac", which prices it as a room), so the job goes
 * straight to pre-processing, or is rejected at once, free, with the fix, when the
 * description cannot be set up. The API test SITE_ROOM_BODY in
 * apps/api/tests/test_cfd_cloud.py is this form's output: keep them in step.
 *
 * Owner, 16 Oct 2026: steady ships first; the transient (premium) tier is offered
 * on the quote only once it is validated and switched on in the API. Never show
 * prices, the provider or how quotes are priced here.
 */

const WALL_OPTIONS = [
  { value: "ceiling", label: "Ceiling" },
  { value: "floor", label: "Floor" },
  { value: "x-min", label: "End wall at x = 0" },
  { value: "x-max", label: "End wall at x = length" },
  { value: "y-min", label: "Side wall at y = 0" },
  { value: "y-max", label: "Side wall at y = width" },
] as const;

type Wall = (typeof WALL_OPTIONS)[number]["value"];

/** The two in-plane coordinates of a wall, as the API reads center_m. */
function axesOf(wall: Wall): [string, string] {
  if (wall === "x-min" || wall === "x-max") return ["y (across)", "z (up from the floor)"];
  if (wall === "y-min" || wall === "y-max") return ["x (along)", "z (up from the floor)"];
  return ["x (along)", "y (across)"];
}

const FLOW_UNITS = [
  { value: "m3/h", label: "m³/h", key: "flow_m3_h" },
  { value: "l/s", label: "l/s", key: "flow_l_s" },
  { value: "cfm", label: "CFM", key: "flow_cfm" },
  { value: "m/s", label: "m/s face", key: "velocity_m_s" },
] as const;

type FlowUnit = (typeof FLOW_UNITS)[number]["value"];

type Opening = { wall: Wall; u: string; v: string; w: string; h: string };
type Supply = Opening & { flow: string; flowUnit: FlowUnit; temp: string };

export type RoomState = {
  length: string;
  width: string;
  height: string;
  supplies: Supply[];
  returns: Opening[];
  people: string;
  wPerPerson: string;
  equipment: string;
  lighting: string;
  clothing: string;
  met: string;
  rh: string;
  tier: "steady" | "transient";
};

const MAX_OPENINGS = 12;

const num = (s: string): number => Number(String(s).replace(",", ".").trim());
const isPos = (s: string) => Number.isFinite(num(s)) && num(s) > 0;
const isNonNeg = (s: string) => s.trim() === "" || (Number.isFinite(num(s)) && num(s) >= 0);

const newSupply = (): Supply => ({ wall: "ceiling", u: "", v: "", w: "0.6", h: "0.6", flow: "", flowUnit: "m3/h", temp: "16" });
const newReturn = (): Opening => ({ wall: "ceiling", u: "", v: "", w: "0.6", h: "0.6" });

function openingPayload(o: Opening) {
  return { wall: o.wall, center_m: [num(o.u), num(o.v)], size_m: [num(o.w), num(o.h)] };
}

/** The `hvac` block of POST /cfd-jobs (HvacSpec). */
export function hvacBlock(s: RoomState) {
  const L = num(s.length), W = num(s.width), H = num(s.height);
  const loads: Record<string, unknown>[] = [];
  if (isPos(s.people)) {
    // Spread over the floor inside a 0.5 m margin (the occupied zone), 1.2 m high (the runner's default).
    loads.push({
      kind: "people", count: Math.round(num(s.people)), w_each: isPos(s.wPerPerson) ? num(s.wPerPerson) : 75,
      center_m: [L / 2, W / 2], size_m: [Math.max(L - 1, 0.5), Math.max(W - 1, 0.5)],
    });
  }
  if (isPos(s.equipment)) {
    loads.push({ kind: "equipment", watts: num(s.equipment),
                 box_m: [[Math.min(0.5, L / 4), Math.min(0.5, W / 4), 0], [L - Math.min(0.5, L / 4), W - Math.min(0.5, W / 4), Math.min(1.0, H / 2)]] });
  }
  if (isPos(s.lighting)) {
    // A thin layer under the ceiling, over the whole room.
    loads.push({ kind: "lighting", watts: num(s.lighting),
                 box_m: [[Math.min(0.5, L / 4), Math.min(0.5, W / 4), H - 0.3], [L - Math.min(0.5, L / 4), W - Math.min(0.5, W / 4), H - 0.1]] });
  }
  return {
    room: { length_m: L, width_m: W, height_m: H },
    supplies: s.supplies.map((o) => {
      const key = FLOW_UNITS.find((f) => f.value === o.flowUnit)!.key;
      return { ...openingPayload(o), [key]: num(o.flow), temperature_c: num(o.temp) };
    }),
    returns: s.returns.map(openingPayload),
    heat_loads: loads,
    comfort: {
      clothing_clo: isPos(s.clothing) ? num(s.clothing) : 0.6,
      metabolic_met: isPos(s.met) ? num(s.met) : 1.2,
      relative_humidity_pct: s.rh.trim() !== "" && isNonNeg(s.rh) ? num(s.rh) : 50,
    },
    tier_preference: s.tier,
  };
}

function inWall(s: RoomState, o: Opening): boolean {
  const L = num(s.length), W = num(s.width), H = num(s.height);
  const [a, b] = o.wall === "x-min" || o.wall === "x-max" ? [W, H] : o.wall === "y-min" || o.wall === "y-max" ? [L, H] : [L, W];
  const u = num(o.u), v = num(o.v), w = num(o.w), h = num(o.h);
  return u - w / 2 >= -1e-6 && u + w / 2 <= a + 1e-6 && v - h / 2 >= -1e-6 && v + h / 2 <= b + 1e-6;
}

function OpeningRow<T extends Opening>({ label, o, onChange, onRemove, children }: {
  label: string; o: T; onChange: (patch: Partial<T>) => void; onRemove?: () => void; children?: React.ReactNode;
}) {
  const [ua, va] = axesOf(o.wall);
  const id = label.toLowerCase().replace(/\W+/g, "-");
  return (
    <fieldset className="min-w-0 rounded-cf border border-rule bg-paper p-4">
      <div className="flex items-center justify-between gap-3">
        <legend className="text-[13.5px] font-semibold text-ink">{label}</legend>
        {onRemove ? (
          <button type="button" onClick={onRemove} className="min-h-11 px-2 text-[13px] text-ink-3 underline underline-offset-2 hover:text-ink">
            Remove
          </button>
        ) : null}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="col-span-2 flex min-w-0 flex-col gap-1.5 sm:col-span-1">
          <label htmlFor={`${id}-wall`} className="text-[12.5px] text-ink-2">On</label>
          <select id={`${id}-wall`} className={inputCls} value={o.wall} onChange={(e) => onChange({ wall: e.target.value as Wall } as Partial<T>)}>
            {WALL_OPTIONS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
          </select>
        </div>
        {([["u", `Centre ${ua}, m`], ["v", `Centre ${va}, m`], ["w", "Width, m"], ["h", "Height / depth, m"]] as const).map(([k, l]) => (
          <div key={k} className="flex min-w-0 flex-col gap-1.5">
            <label htmlFor={`${id}-${k}`} className="text-[12.5px] text-ink-2">{l}</label>
            <input id={`${id}-${k}`} inputMode="decimal" className={inputCls} value={o[k]} onChange={(e) => onChange({ [k]: e.target.value } as Partial<T>)} />
          </div>
        ))}
      </div>
      {children}
    </fieldset>
  );
}

function RoomFields({ state, set }: { state: RoomState; set: (patch: Partial<RoomState>) => void }) {
  const setSupply = (i: number, patch: Partial<Supply>) =>
    set({ supplies: state.supplies.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const setReturn = (i: number, patch: Partial<Opening>) =>
    set({ returns: state.returns.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  return (
    <>
      <div className="sm:col-span-2">
        <p className="text-[13.5px] leading-5 font-medium text-ink">Room size, in metres</p>
        <p className="mt-1 text-[12.5px] leading-5 text-ink-3">
          A box-shaped room. x runs along its length, y across its width, z up from the floor; the corner at x = 0, y = 0
          is yours to choose. Every position below is measured from it.
        </p>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {([["length", "Length (x)"], ["width", "Width (y)"], ["height", "Height (z)"]] as const).map(([k, l]) => (
            <div key={k} className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor={`cf-room-${k}`} className="text-[12.5px] text-ink-2">{l}</label>
              <input id={`cf-room-${k}`} inputMode="decimal" className={inputCls} placeholder={k === "height" ? "2.8" : "6"} value={state[k]} onChange={(e) => set({ [k]: e.target.value })} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3 sm:col-span-2">
        <p className="text-[13.5px] leading-5 font-medium text-ink">Supply diffusers</p>
        <p className="-mt-2 text-[12.5px] leading-5 text-ink-3">
          Where each one is, its face size, its airflow and the supply air temperature. Centres are in the plane of the
          wall or ceiling it sits on.
        </p>
        {state.supplies.map((s, i) => (
          <OpeningRow key={i} label={`Supply ${i + 1}`} o={s} onChange={(p) => setSupply(i, p)}
            onRemove={state.supplies.length > 1 ? () => set({ supplies: state.supplies.filter((_, j) => j !== i) }) : undefined}>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="col-span-2 flex min-w-0 flex-col gap-1.5">
                <label htmlFor={`supply-${i + 1}-flow`} className="text-[12.5px] text-ink-2">Airflow</label>
                <div className="flex gap-2">
                  <input id={`supply-${i + 1}-flow`} inputMode="decimal" className={`${inputCls} min-w-0 flex-1`} value={s.flow} onChange={(e) => setSupply(i, { flow: e.target.value })} />
                  <select aria-label={`Supply ${i + 1} airflow unit`} className={`${inputCls} !w-[110px] shrink-0`} value={s.flowUnit} onChange={(e) => setSupply(i, { flowUnit: e.target.value as FlowUnit })}>
                    {FLOW_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex min-w-0 flex-col gap-1.5">
                <label htmlFor={`supply-${i + 1}-temp`} className="text-[12.5px] text-ink-2">Supply °C</label>
                <input id={`supply-${i + 1}-temp`} inputMode="decimal" className={inputCls} value={s.temp} onChange={(e) => setSupply(i, { temp: e.target.value })} />
              </div>
            </div>
          </OpeningRow>
        ))}
        {state.supplies.length < MAX_OPENINGS ? (
          <button type="button" className="cf-btn-secondary self-start" onClick={() => set({ supplies: [...state.supplies, newSupply()] })}>
            Add a supply
          </button>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col gap-3 sm:col-span-2">
        <p className="text-[13.5px] leading-5 font-medium text-ink">Return or exhaust grilles</p>
        {state.returns.map((r, i) => (
          <OpeningRow key={i} label={`Return ${i + 1}`} o={r} onChange={(p) => setReturn(i, p)}
            onRemove={state.returns.length > 1 ? () => set({ returns: state.returns.filter((_, j) => j !== i) }) : undefined} />
        ))}
        {state.returns.length < MAX_OPENINGS ? (
          <button type="button" className="cf-btn-secondary self-start" onClick={() => set({ returns: [...state.returns, newReturn()] })}>
            Add a return
          </button>
        ) : null}
      </div>

      <div className="sm:col-span-2">
        <p className="text-[13.5px] leading-5 font-medium text-ink">Heat loads</p>
        <p className="mt-1 text-[12.5px] leading-5 text-ink-3">
          People are spread over the floor, equipment up to desk height, lighting just under the ceiling. Leave a box
          empty when there is none. Solar gain through windows: describe it in the notes below.
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {([["people", "People"], ["wPerPerson", "W per person (sensible)"], ["equipment", "Equipment, W"], ["lighting", "Lighting, W"]] as const).map(([k, l]) => (
            <div key={k} className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor={`cf-load-${k}`} className="text-[12.5px] text-ink-2">{l}</label>
              <input id={`cf-load-${k}`} inputMode="decimal" className={inputCls} value={state[k]} onChange={(e) => set({ [k]: e.target.value })} />
            </div>
          ))}
        </div>
      </div>

      <div className="sm:col-span-2">
        <p className="text-[13.5px] leading-5 font-medium text-ink">Comfort inputs (for PMV / PPD)</p>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {([["clothing", "Clothing, clo"], ["met", "Activity, met"], ["rh", "Relative humidity, %"]] as const).map(([k, l]) => (
            <div key={k} className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor={`cf-comfort-${k}`} className="text-[12.5px] text-ink-2">{l}</label>
              <input id={`cf-comfort-${k}`} inputMode="decimal" className={inputCls} value={state[k]} onChange={(e) => set({ [k]: e.target.value })} />
            </div>
          ))}
        </div>
      </div>

      <Field label="Analysis" full hint={
        state.tier === "steady"
          ? "Room averages (mean air speed, PMV/PPD, ADPI) as numbers; the fastest air and the worst head-ankle temperature difference as a flagged range."
          : "The room run in time until the answer settles, every value one number. Premium. Your quote offers it only for rooms where we run it; otherwise you get the steady analysis to choose."
      }>
        <Choice name="hvac-tier" value={state.tier} onChange={(v) => set({ tier: v as RoomState["tier"] })}
          options={[{ value: "steady", label: "Steady" }, { value: "transient", label: "Transient (premium)" }]} />
      </Field>
    </>
  );
}

export const roomFields: CategoryFields<RoomState> = {
  initial: () => ({
    length: "", width: "", height: "",
    supplies: [newSupply()], returns: [newReturn()],
    people: "", wPerPerson: "75", equipment: "", lighting: "",
    clothing: "0.6", met: "1.2", rh: "50",
    tier: "steady",
  }),

  validate: (s) => {
    const errs: string[] = [];
    const L = num(s.length), W = num(s.width), H = num(s.height);
    if (!(L >= 1 && L <= 100 && W >= 1 && W <= 100)) errs.push("The room's length and width, 1–100 m");
    if (!(H >= 2 && H <= 20)) errs.push("The room's height, 2–20 m");
    const roomOk = errs.length === 0;
    s.supplies.forEach((o, i) => {
      if (![o.u, o.v, o.w, o.h].every((x) => x.trim() !== "" && Number.isFinite(num(x))) || !isPos(o.w) || !isPos(o.h)) {
        errs.push(`Supply ${i + 1}: its centre and size`);
      } else if (roomOk && !inWall(s, o)) {
        errs.push(`Supply ${i + 1}: it does not fit on that wall (check its centre and size)`);
      }
      if (!isPos(o.flow)) errs.push(`Supply ${i + 1}: its airflow`);
      const t = num(o.temp);
      if (!(t >= 5 && t <= 60)) errs.push(`Supply ${i + 1}: a supply temperature of 5–60 °C`);
    });
    s.returns.forEach((o, i) => {
      if (![o.u, o.v, o.w, o.h].every((x) => x.trim() !== "" && Number.isFinite(num(x))) || !isPos(o.w) || !isPos(o.h)) {
        errs.push(`Return ${i + 1}: its centre and size`);
      } else if (roomOk && !inWall(s, o)) {
        errs.push(`Return ${i + 1}: it does not fit on that wall (check its centre and size)`);
      }
    });
    for (const [k, l] of [["people", "People"], ["equipment", "Equipment"], ["lighting", "Lighting"]] as const) {
      if (!isNonNeg(s[k])) errs.push(`${l}: a number of zero or more`);
    }
    if (isPos(s.people) && !(num(s.wPerPerson) >= 20 && num(s.wPerPerson) <= 300)) errs.push("W per person: 20–300");
    return errs;
  },

  toPayload: (s) => ({
    modelUnits: "Metres (m)",
    dimensions: "",
    bcRows: [],
    flowRegime: "Steady-state",
    fluidType: "Air",
    compressibility: "Incompressible",
    turbulenceModel: "k-epsilon",
    physicsHeat: true,
    physicsBuoyancy: true,
    outVelocity: true,
    outTemperature: true,
    outReport: true,
    reportFormat: "PDF",
    hvac: hvacBlock(s),
  }),

  file: () => null,

  nextFirstStep:
    "Check your job page: the room description was checked when you submitted, and anything we cannot set up is listed there with the fix, free.",
  skippedNote: "Your room description was received; there is no file to upload for a room.",

  Fields: RoomFields,
};
