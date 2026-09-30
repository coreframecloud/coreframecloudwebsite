"use client";

import { useMemo, useState } from "react";

/**
 * "What is the waiting costing you?"
 *
 * The centre of the value narrative, and the one section that argues by
 * getting out of the way. We assert no figure here — not an average studio
 * rate, not a typical render time, not a saving. Every number on screen is
 * derived from the three the visitor typed, and the only value we contribute
 * is the live GPU rate.
 *
 * That is not modesty, it is the strongest form the argument can take. A
 * claimed "studios save 40%" invites the reader to argue with our number.
 * Their own arithmetic is not arguable, and it is also the only version that
 * survives our claims rules, which forbid inventing a statistic.
 *
 * `ratePerHour` comes from adhocRateValue(rateCard) — the live rate card,
 * never a typed constant. If it is null the GPU cost line disappears rather
 * than falling back to a stale figure: the same "null means say nothing" rule
 * the rest of the pricing surface follows.
 */

const WEEKS_PER_YEAR = 48;

export function WaitingCalculator({ ratePerHour }: { ratePerHour: number | null }) {
  const [rate, setRate] = useState(1200);
  const [hours, setHours] = useState(12);
  const [recovered, setRecovered] = useState(70);

  const inr = useMemo(
    () => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }),
    [],
  );

  const hoursBack = Math.max(0, hours) * (Math.min(100, Math.max(0, recovered)) / 100) * WEEKS_PER_YEAR;
  const value = hoursBack * Math.max(0, rate);
  const gpuCost = ratePerHour === null ? null : hoursBack * ratePerHour;

  return (
    <div className="rounded-cf border border-rule bg-blue-soft p-[clamp(22px,3.4vw,34px)]">
      <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
        <Field
          id="cf-calc-rate"
          label="Your billing rate (₹ / hour)"
          value={rate}
          step={50}
          onChange={setRate}
        />
        <Field
          id="cf-calc-hours"
          label="Hours a week spent waiting on renders"
          value={hours}
          step={1}
          onChange={setHours}
        />
        <Field
          id="cf-calc-recovered"
          label="Share of that you'd get back"
          value={recovered}
          step={5}
          max={100}
          onChange={setRecovered}
        />
      </div>

      <div className="mt-[26px] border-t border-rule pt-6">
        <p
          className="text-[clamp(32px,6vw,50px)] leading-[1.05] font-bold tracking-[-0.03em] text-blue tabular-nums"
          aria-live="polite"
        >
          ₹{inr.format(Math.round(value))}
        </p>
        <p className="mt-2.5 text-[14.5px] leading-[1.6] text-ink-2">
          {hoursBack < 1
            ? "Nothing, on these numbers. Which is a fine answer."
            : `${inr.format(Math.round(hoursBack))} hours a year, back in front of you.`}
        </p>
        {hoursBack >= 1 && gpuCost !== null ? (
          <p className="mt-4 font-mono text-[13px] leading-[1.7] text-ink-3">
            GPU time to cover those hours at ₹{inr.format(ratePerHour!)}/hr: ₹
            {inr.format(Math.round(gpuCost))}
            {"  ·  net ₹"}
            {inr.format(Math.round(value - gpuCost))}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  step,
  max,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  step: number;
  max?: number;
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-2.5 block font-mono text-[11px] leading-none font-medium tracking-[0.14em] text-ink-3 uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        className="w-full rounded-cf border border-rule bg-paper px-3.5 py-3 text-[22px] leading-none font-semibold text-ink tabular-nums outline-none focus-visible:border-blue focus-visible:ring-2 focus-visible:ring-blue/25"
      />
    </div>
  );
}
