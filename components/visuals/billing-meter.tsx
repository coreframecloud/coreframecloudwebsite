"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import type { Currency } from "@/lib/money";

/**
 * A session meter that starts, runs and stops: one second on screen is one
 * minute of session. It shows elapsed time and the cost at the live per-hour
 * rate (passed in from the rate card), then "Closed · billing stopped".
 * Reduced motion: the same markup, ticking at a calmer pace. Without a rate
 * the money line disappears and only the clock runs.
 */
const RUN = 20; // minutes shown before the session closes

export function BillingMeter({
  ratePerHour,
  currency = "INR",
}: {
  ratePerHour?: number | null;
  /** Display currency of the rate; "USD" on /pricing for a visitor outside India. */
  currency?: Currency;
}) {
  const reduce = usePrefersReducedMotion();
  const [t, setT] = useState(0); // minutes; RUN..RUN+3 = closed

  useEffect(() => {
    const id = setInterval(() => setT((m) => (m >= RUN + 3 ? 0 : m + 1)), reduce ? 1600 : 700);
    return () => clearInterval(id);
  }, [reduce]);

  const mins = Math.min(t, RUN);
  const closed = t > RUN;
  const cost = ratePerHour ? (ratePerHour * mins) / 60 : null;
  return (
    <div className="rounded-[24px] bg-night p-7 text-white" role="img" aria-label="Billing runs per minute while the session is open and stops when you close it">
      <div className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.12em] uppercase">
        <span className={`h-2.5 w-2.5 rounded-full ${closed ? "bg-white/40" : "bg-[#3ddc84] cfv-blink"}`} />
        <span className={closed ? "text-white/60" : "text-[#3ddc84]"}>{closed ? "Closed · billing stopped" : "Session running"}</span>
      </div>
      <div className="mt-5 flex items-end justify-between gap-6">
        <div>
          <p className="text-[12px] text-white/55">Time</p>
          <p className="font-heading text-[40px] leading-none font-medium tabular-nums">
            {String(mins).padStart(2, "0")}:00
          </p>
        </div>
        {cost !== null ? (
          <div className="text-right">
            <p className="text-[12px] text-white/55">Cost so far</p>
            {/* The widest value sits invisibly in the same grid cell, so the
                block never changes width as the cost ticks up (no layout shift). */}
            <p className="grid font-heading text-[40px] leading-none font-medium tabular-nums">
              <span className="invisible col-start-1 row-start-1" aria-hidden="true">
                {currency === "USD" ? "$" : "₹"}{((ratePerHour ?? 0) * RUN / 60).toFixed(2)}
              </span>
              <span className="col-start-1 row-start-1">{currency === "USD" ? "$" : "₹"}{cost.toFixed(2)}</span>
            </p>
          </div>
        ) : null}
      </div>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-blue transition-[width] duration-500" style={{ width: `${(mins / RUN) * 100}%` }} />
      </div>
      <p className="mt-3 text-[12.5px] text-white/55">Charged per minute. Close the window and it stops.</p>
    </div>
  );
}
