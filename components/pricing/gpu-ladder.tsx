/**
 * The GPU ladder (owner, 21 Oct 2026): every public GPU workstation profile
 * from the live rate card, cheapest first, with its spec line and its hourly
 * price in the visitor's currency and only that currency.
 *
 * Nothing here is typed. The rows are whatever /public/rate-card returns,
 * which is one GPU on the day this ships and five once the others are made
 * public, so the layout has to look right with one row and with five: a
 * stacked list, name and price on the first line, spec chips underneath.
 *
 * A server component: the page fetches the card once and passes it in, like
 * every other price on the site.
 */

import {
  formatHourly,
  gpuIntroEligible,
  gpuSpecChips,
  publicGpus,
  taxWords,
  type RateCard,
} from "@/lib/rate-card";
import type { Currency } from "@/lib/money";

export function GpuLadder({
  card,
  currency = "INR",
  title,
  compact = false,
}: {
  card: RateCard | null;
  /** The visitor's display currency (proxy.ts): one currency per page. */
  currency?: Currency;
  /** Optional heading above the list. */
  title?: string;
  /** Tighter rows for a page section that is not the pricing table. */
  compact?: boolean;
}) {
  const gpus = publicGpus(card);
  if (!gpus.length) {
    return (
      <p className="text-sm leading-6 text-ink-2">
        Live GPU prices are briefly unavailable. Email{" "}
        <a href="mailto:admin@coreframecloud.com" className="text-blue underline underline-offset-4">
          admin@coreframecloud.com
        </a>{" "}
        and we will send the current rate card.
      </p>
    );
  }
  const tax = taxWords(currency);
  return (
    <div data-gpu-ladder="" className="min-w-0">
      {title ? <p className="cf-eyebrow mb-4">{title}</p> : null}
      <ul className="divide-y divide-rule overflow-hidden rounded-[20px] border border-rule bg-paper-2">
        {gpus.map((g) => {
          const price = formatHourly(g, currency, card);
          const onRequest = price === "On request";
          // Owner, 21 Oct 2026: the intro hours apply on the reference GPU and
          // every cheaper card; a dearer card says nothing.
          const introApplies = gpuIntroEligible(g, card, currency);
          return (
            <li
              key={g.slug}
              className={`grid min-w-0 gap-x-6 gap-y-2 ${compact ? "px-5 py-4" : "px-5 py-5 sm:px-6"} sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center`}
            >
              <div className="min-w-0">
                <p className={`flex flex-wrap items-center gap-2 font-heading font-medium text-ink ${compact ? "text-[17px]" : "text-[19px]"}`}>
                  <span>
                    {g.gpu_count > 1 ? `${g.gpu_count}× ` : ""}
                    {g.name}
                  </span>
                  {introApplies ? (
                    <span className="rounded-full bg-tint-blue px-2.5 py-0.5 font-sans text-[11.5px] font-semibold tracking-[0.04em] text-blue-ink">
                      Intro hours apply
                    </span>
                  ) : null}
                </p>
                <ul className="mt-1.5 flex flex-wrap gap-x-1.5 gap-y-1 text-[13.5px] leading-5 text-ink-2">
                  {gpuSpecChips(g).map((c, i) => (
                    <li key={c} className="flex items-center gap-1.5">
                      {i > 0 ? <span aria-hidden="true" className="text-ink-3">·</span> : null}
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="sm:text-right">
                <p className={`font-semibold text-ink ${compact ? "text-[19px]" : "text-[24px]"} leading-none`}>
                  {onRequest ? "On request" : price.replace("/hr", "")}
                </p>
                {!onRequest ? <p className="mt-1 text-[12.5px] text-ink-3">per GPU-hour, {tax}</p> : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
