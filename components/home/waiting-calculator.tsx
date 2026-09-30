"use client";

import { useMemo, useState } from "react";

/**
 * "What is the waiting costing you?"
 *
 * WHAT THIS MEASURES, AND WHY IT CHANGED. The first version priced one
 * person's waiting and produced a number that looked small, because it was
 * measuring the wrong thing. The pain in a studio is not that a render takes
 * an hour — it is that FOUR PEOPLE QUEUE FOR ONE MACHINE. Contention is the
 * cost, and it multiplies.
 *
 * So the middle input is headcount, not a percentage. That also removed the
 * "share you'd get back" slider, which was the weakest input on the page: an
 * abstract percentage invites the reader to argue with an assumption we made
 * up on their behalf, and people discount a number they had to guess at.
 * Headcount is something they know exactly.
 *
 * We still assert nothing. Every figure on screen comes from the three the
 * visitor typed; the only value we contribute is the live GPU rate, read from
 * adhocRateValue(rateCard) and never typed. If that fetch fails the cost line
 * disappears rather than quoting a stale price.
 *
 * NUMERIC INPUT STATE IS A STRING, ON PURPOSE. It used to hold a number and
 * parse on change, which let the DOM and React disagree: clearing the field
 * set state to 0, React rendered "0", and typing "20" left "020" in the box —
 * visible in the field while the arithmetic silently used 20. A controlled
 * numeric input has to own the raw string and parse only when it calculates.
 */

const WEEKS_PER_YEAR = 48;

function toNumber(raw: string): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function WaitingCalculator({ ratePerHour }: { ratePerHour: number | null }) {
  const [rate, setRate] = useState("1200");
  const [people, setPeople] = useState("4");
  const [hours, setHours] = useState("6");

  const inr = useMemo(
    () => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }),
    [],
  );

  const hoursBack = toNumber(hours) * toNumber(people) * WEEKS_PER_YEAR;
  const value = hoursBack * toNumber(rate);
  const gpuCost = ratePerHour === null ? null : hoursBack * ratePerHour;

  return (
    <div className="rounded-cf border border-rule bg-blue-soft p-[clamp(22px,3.4vw,34px)]">
      <div className="grid items-stretch gap-5 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
        <Field id="cf-calc-rate" label="What you bill an hour (₹)" value={rate} onChange={setRate} />
        <Field id="cf-calc-people" label="People sharing the render machine" value={people} onChange={setPeople} />
        <Field id="cf-calc-hours" label="Hours a week each one loses to it" value={hours} onChange={setHours} />
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
            : `${inr.format(Math.round(hoursBack))} billable hours a year, spent queueing.`}
        </p>
        {hoursBack >= 1 && gpuCost !== null ? (
          <p className="mt-4 font-mono text-[13px] leading-[1.7] text-ink-3">
            Giving all {toNumber(people)} of them their own machine for those hours: ₹
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
}: {
  id: string;
  label: string;
  value: string;
  onChange: (raw: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <label
        htmlFor={id}
        className="mb-2.5 flex-1 font-mono text-[11px] leading-[1.45] font-medium tracking-[0.14em] text-ink-3 uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
        className="w-full rounded-cf border border-rule bg-paper px-3.5 py-3 text-[22px] leading-none font-semibold text-ink tabular-nums outline-none focus-visible:border-blue focus-visible:ring-2 focus-visible:ring-blue/25"
      />
    </div>
  );
}
