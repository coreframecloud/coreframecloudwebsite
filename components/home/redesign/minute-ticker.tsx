"use client";

import { useRef, useState } from "react";
import { bubbleFont } from "@/lib/fonts-bubble";
import type { Currency } from "@/lib/money";
import { Odometer, runTimeline, useReducedMotionFlag, useRollOnView } from "@/components/home/redesign/odometer";

/** The clock runs 0:00 -> 1:00 (one hour) in this long, after a short rest. */
const LEAD_MS = 250;
const RUN_MS = 3200;

const sym = (c: Currency) => (c === "USD" ? "$" : "₹");

/** "₹1.65" / "$0.025": two places, three for a rate under one cent-ish so it is not rounded to a lie. */
export function perMinuteLabel(hourly: number, currency: Currency): string {
  const m = hourly / 60;
  const places = m < 0.1 ? 3 : 2;
  return `${sym(currency)}${m.toFixed(places)}`;
}

/**
 * The "By the minute" tile's ticker (owner, 31 Oct 2026; replaced the old
 * billing screenshot). A session clock counting up (00:00 -> 01:00) beside
 * the amount charged, which climbs in step at the lowest live rate from the
 * rate card (₹99/hr incl. GST in India, $1.49/hr abroad). The amount is the
 * same odometer as the hero's memory counter, in yellow (#ffd43b): the tile
 * sits in the dark cinema panel (.cf-cine), where yellow text is allowed.
 *
 * Runs once ~700 ms after the tile is in view and the page has loaded, and
 * again when it scrolls back in. Server HTML and reduced motion: the clock at
 * 01:00, the hour's amount, and "1 min = ₹1.65" in plain text.
 */
export function MinuteTicker({ hourly, currency, taxNote }: { hourly: number; currency: Currency; taxNote?: string }) {
  const [minutes, setMinutes] = useState(60);
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionFlag();

  useRollOnView(
    ref,
    !reduce,
    (cancelled) => {
      setMinutes(0);
      runTimeline(
        LEAD_MS + RUN_MS,
        (e) => (e <= LEAD_MS ? 0 : (60 * (e - LEAD_MS)) / RUN_MS),
        setMinutes,
        cancelled,
      );
    },
    () => setMinutes(60),
    { threshold: 0.5 },
  );

  const whole = Math.floor(minutes + 1e-9);
  const clock = `${String(Math.floor(whole / 60)).padStart(2, "0")}:${String(whole % 60).padStart(2, "0")}`;
  // In step with the clock: the amount for the whole minutes shown, then
  // glides through the current minute.
  const amount = (minutes * hourly) / 60;
  const finalAmount = `${sym(currency)}${hourly.toFixed(2)}`;
  const intPlaces = Math.max(1, String(Math.floor(hourly)).length);

  return (
    <div ref={ref} className={`${bubbleFont.variable} mt-5`}>
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <div>
          <p className="text-[13px] font-semibold tracking-[0.1em] text-white/75 uppercase">Session time</p>
          <p className="mt-1 font-[family-name:var(--font-bubble)] text-[26px] leading-none font-bold text-white tabular-nums sm:text-[28px]">
            {clock}
            <span className="ml-1.5 text-[13px] font-semibold tracking-[0.06em] text-white/70 uppercase">hh:mm</span>
          </p>
        </div>
        <div>
          <p className="text-[13px] font-semibold tracking-[0.1em] text-white/75 uppercase">Charged</p>
          <p className="mt-1 font-[family-name:var(--font-bubble)] cf-ticker-amount text-[48px] leading-none font-bold tracking-[-0.02em] text-hl sm:text-[52px]">
            <span className="sr-only">
              {finalAmount} for one hour
            </span>
            <span
              aria-hidden
              className="inline-flex items-baseline"
            >
              {sym(currency)}
              <Odometer value={amount} intPlaces={intPlaces} decimals={2} />
            </span>
          </p>
        </div>
      </div>
      <p className="mt-4 text-[14px] leading-[1.5] text-white/80">
        <span className="font-semibold text-white">1 min = {perMinuteLabel(hourly, currency)}</span>
        {" "}at {sym(currency)}
        {currency === "USD" ? hourly.toFixed(2) : Math.round(hourly).toLocaleString("en-IN")}/hr
        {taxNote ? ` ${taxNote}` : ""}, on the lowest-priced card.
      </p>
    </div>
  );
}
