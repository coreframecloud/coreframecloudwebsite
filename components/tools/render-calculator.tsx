"use client";

import { useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { formatMoney, type Currency } from "@/lib/money";
import {
  ANCHOR,
  SOFTWARE,
  USER_GPUS,
  anchorSecondsOn,
  costFor,
  formatDuration,
  parseFrameTime,
  scaleSeconds,
  type SoftwareId,
} from "@/lib/render-calc";

/** One public GPU from the live rate card, already priced in the page's currency. */
export type OurGpu = { name: string; vramGb: number; hourly: number | null; score: number };

const GROUPS = ["Laptop", "Desktop", "Pro", "Apple"] as const;
const GROUP_LABEL: Record<(typeof GROUPS)[number], string> = {
  Laptop: "Laptop GPUs",
  Desktop: "Desktop GPUs",
  Pro: "Workstation GPUs",
  Apple: "Apple (Blender only)",
};
const FRAME_PRESETS = [
  { n: 1, label: "1 still" },
  { n: 10, label: "10 stills" },
  { n: 240, label: "10 s video" },
  { n: 1440, label: "1 min video" },
];

/** "About 2.8× as fast as yours", "About 40% faster than yours", honest both ways. */
function speedWords(x: number): string {
  if (x < 0.95) return "Slower than your GPU on this benchmark";
  if (x < 1.05) return "About the same speed as yours";
  if (x < 1.95) return `About ${Math.round((x - 1) * 100)}% faster than yours`;
  return `About ${x.toFixed(1)}× as fast as yours`;
}

/**
 * The calculator itself (see lib/render-calc.ts for every number's source).
 * Pure arithmetic in the browser: nothing is sent anywhere except one
 * analytics event the first time someone changes an input.
 */
export function RenderCalculator({ ours, currency }: { ours: OurGpu[]; currency: Currency }) {
  const [software, setSoftware] = useState<SoftwareId>("blender");
  const [gpuId, setGpuId] = useState("rtx4060m");
  const [framesRaw, setFramesRaw] = useState("1");
  const [timeRaw, setTimeRaw] = useState("");
  const [unit, setUnit] = useState<"s" | "min">("min");
  const tracked = useRef(false);

  const touched = () => {
    if (tracked.current) return;
    tracked.current = true;
    trackEvent("render_calc_used", { currency });
  };

  const sw = SOFTWARE.find((s) => s.id === software) ?? SOFTWARE[0];
  const userGpus = sw.appleOk ? USER_GPUS : USER_GPUS.filter((g) => g.group !== "Apple");
  const gpu = userGpus.find((g) => g.id === gpuId) ?? userGpus.find((g) => g.id === "rtx4060m")!;
  const frames = Math.min(100000, Math.max(1, Math.floor(Number(framesRaw) || 1)));
  const ownTime = parseFrameTime(timeRaw, unit);
  const usingOwnTime = ownTime != null;
  // Seconds per frame on the visitor's GPU: their own number, or our measured
  // reference scene scaled to their GPU.
  const perFrameYours = usingOwnTime ? ownTime : anchorSecondsOn(gpu.score);
  const totalYours = perFrameYours * frames;

  const rows = ours.map((g) => {
    const total = scaleSeconds(perFrameYours, gpu.score, g.score) * frames;
    return { ...g, total, cost: g.hourly != null ? costFor(total, g.hourly) : null, speedup: g.score / gpu.score };
  });
  const fastest = rows.reduce<(typeof rows)[number] | null>((a, b) => (!a || b.total < a.total ? b : a), null);
  const fmt = (v: number) => formatMoney(v, currency);
  // A job estimate in rupees reads as whole rupees; dollars keep cents.
  const fmtJob = (v: number) => formatMoney(currency === "INR" ? Math.round(v) : v, currency);

  return (
    <div className="grid gap-5">
      <form
        className="grid gap-5 rounded-[20px] border border-rule bg-paper-2 p-4 sm:p-6"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Render-time calculator"
      >
        <fieldset className="min-w-0">
          <legend className="text-[13px] font-semibold tracking-[0.04em] text-ink-3 uppercase">Software</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SOFTWARE.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={software === s.id}
                onClick={() => {
                  setSoftware(s.id);
                  touched();
                }}
                className={`min-h-11 rounded-[12px] border px-3 py-2 text-left text-[14px] leading-tight font-medium transition ${
                  software === s.id ? "border-ink bg-ink text-white" : "border-rule bg-paper text-ink hover:border-ink/40"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="grid gap-1.5">
          <span className="text-[13px] font-semibold tracking-[0.04em] text-ink-3 uppercase">Your GPU now</span>
          <select
            value={gpu.id}
            onChange={(e) => {
              setGpuId(e.target.value);
              touched();
            }}
            className="min-h-12 w-full rounded-[12px] border border-rule bg-paper px-3 text-[16px] text-ink"
          >
            {GROUPS.filter((grp) => userGpus.some((g) => g.group === grp)).map((grp) => (
              <optgroup key={grp} label={GROUP_LABEL[grp]}>
                {userGpus
                  .filter((g) => g.group === grp)
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>

        <div className="grid gap-1.5">
          <label htmlFor="rc-frames" className="text-[13px] font-semibold tracking-[0.04em] text-ink-3 uppercase">
            Frames
          </label>
          <div className="flex flex-wrap gap-2">
            {FRAME_PRESETS.map((p) => (
              <button
                key={p.n}
                type="button"
                aria-pressed={frames === p.n}
                onClick={() => {
                  setFramesRaw(String(p.n));
                  touched();
                }}
                className={`min-h-10 rounded-full border px-3.5 text-[13.5px] font-medium transition ${
                  frames === p.n ? "border-ink bg-ink text-white" : "border-rule bg-paper text-ink hover:border-ink/40"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <input
            id="rc-frames"
            inputMode="numeric"
            pattern="[0-9]*"
            value={framesRaw}
            onChange={(e) => {
              setFramesRaw(e.target.value.replace(/[^0-9]/g, "").slice(0, 6));
              touched();
            }}
            className="mt-1 min-h-12 w-full rounded-[12px] border border-rule bg-paper px-3 text-[16px] text-ink sm:max-w-[200px]"
            aria-describedby="rc-frames-help"
          />
          <p id="rc-frames-help" className="text-[13px] text-ink-3">
            Stills or animation frames. 24 frames = 1 second of video.
          </p>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="rc-time" className="text-[13px] font-semibold tracking-[0.04em] text-ink-3 uppercase">
            One frame takes you now <span className="font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              id="rc-time"
              inputMode="decimal"
              placeholder={unit === "min" ? "e.g. 6 or 6:30" : "e.g. 45"}
              value={timeRaw}
              onChange={(e) => {
                setTimeRaw(e.target.value.slice(0, 10));
                touched();
              }}
              className="min-h-12 w-full min-w-0 rounded-[12px] border border-rule bg-paper px-3 text-[16px] text-ink sm:max-w-[200px]"
              aria-describedby="rc-time-help"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value === "s" ? "s" : "min")}
              aria-label="Unit"
              className="min-h-12 shrink-0 rounded-[12px] border border-rule bg-paper px-3 text-[16px] text-ink"
            >
              <option value="min">minutes</option>
              <option value="s">seconds</option>
            </select>
          </div>
          <p id="rc-time-help" className="text-[13px] leading-5 text-ink-3">
            {timeRaw && !usingOwnTime
              ? "We couldn't read that time. Try 6, 6:30 or 45."
              : `Blank = our reference frame (${ANCHOR.scene}), which takes ${formatDuration(
                  ANCHOR.seconds,
                )} on our ${ANCHOR.gpu}.`}
          </p>
        </div>
      </form>

      <section aria-live="polite" className="grid gap-3" data-cf-section="result">
        <h2 className="font-heading text-[22px] leading-tight font-medium text-ink">Estimated render time</h2>
        <div className="rounded-[16px] border border-rule bg-paper px-4 py-3">
          <p className="text-[14px] text-ink-2">On your {gpu.label}</p>
          <p className="font-heading text-[26px] leading-tight font-semibold text-ink">≈ {formatDuration(totalYours)}</p>
          <p className="text-[13px] text-ink-3">
            {frames.toLocaleString("en-US")} {frames === 1 ? "frame" : "frames"} × {formatDuration(perFrameYours)}
            {usingOwnTime ? " (your time)" : " (reference frame)"}
          </p>
        </div>

        <ul className="grid gap-2.5">
          {rows.map((r) => {
            const slower = r.speedup < 0.95;
            return (
              <li key={r.name} className="rounded-[16px] border border-rule bg-paper-2 px-4 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="text-[14.5px] font-semibold text-ink">
                    {r.name} <span className="font-normal text-ink-3">· {r.vramGb} GB</span>
                  </p>
                  {r.hourly != null ? <p className="text-[13px] text-ink-3">{fmt(r.hourly)}/hr</p> : null}
                </div>
                <p className="mt-0.5 font-heading text-[22px] leading-tight font-semibold text-ink">
                  {r === fastest && !slower ? (
                    <span className="cfx-hl">≈ {formatDuration(r.total)}</span>
                  ) : (
                    <>≈ {formatDuration(r.total)}</>
                  )}
                </p>
                <p className="text-[13.5px] text-ink-2">
                  {speedWords(r.speedup)}
                  {r.cost != null ? ` · ≈ ${fmtJob(r.cost)} for the job` : ""}
                </p>
              </li>
            );
          })}
        </ul>

        {sw.note ? <p className="rounded-[12px] bg-paper-2 px-4 py-3 text-[13.5px] leading-5 text-ink-2">{sw.note}</p> : null}
      </section>
    </div>
  );
}
