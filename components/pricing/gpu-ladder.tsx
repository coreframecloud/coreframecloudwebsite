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
import { TrackedLink } from "@/components/analytics/tracked-link";

export function GpuLadder({
  card,
  currency = "INR",
  title,
  compact = false,
  launch,
}: {
  card: RateCard | null;
  /** The visitor's display currency (proxy.ts): one currency per page. */
  currency?: Currency;
  /** Optional heading above the list. */
  title?: string;
  /** Tighter rows for a page section that is not the pricing table. */
  compact?: boolean;
  /**
   * A big "Launch" button on every live, priced card (owner, 31 Oct 2026,
   * GPU workstations page). It goes to /signup, the same start as the hero
   * CTA; the GPU is picked in the Connect app after sign-in, because /signup
   * takes no GPU parameter. `location` tells the clicks apart in GA4.
   */
  launch?: { location: string };
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
                  {g.badge ? (
                    // The card's tag from the control plane (Entry / More
                    // memory / Fast rendering / Big scenes), the same word
                    // Connect shows on the tile (owner, 22 Oct 2026).
                    <span className="rounded-full border border-rule bg-paper px-2.5 py-0.5 font-sans text-[13px] font-semibold tracking-[0.02em] text-ink-2">
                      {g.badge}
                    </span>
                  ) : null}
                  {introApplies ? (
                    <span className="rounded-full bg-tint-blue px-2.5 py-0.5 font-sans text-[13px] font-semibold tracking-[0.02em] text-blue-ink">
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
              {/* With Launch: price and button share one row on phones, the
                  button filling the rest of the row (52 px tall). */}
              <div className={launch ? "flex items-center gap-4 sm:flex-col sm:items-end sm:gap-3" : "sm:text-right"}>
                <div className={launch ? "shrink-0 sm:text-right" : undefined}>
                  <p className={`font-semibold text-ink ${compact ? "text-[19px]" : "text-[24px]"} leading-none`}>
                    {onRequest ? "On request" : price.replace("/hr", "")}
                  </p>
                  {!onRequest ? <p className="mt-1 text-[13px] text-ink-3">per GPU-hour, {tax}</p> : null}
                </div>
                {launch ? (
                  onRequest ? (
                    // Not live: a neutral label, never a button.
                    <span className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-rule px-6 sm:flex-none text-[14px] font-semibold tracking-[0.04em] text-ink-3 uppercase sm:w-auto" aria-disabled="true">
                      On request
                    </span>
                  ) : (
                    <TrackedLink
                      href="/signup"
                      event="signup_click"
                      params={{ location: launch.location, label: "Launch", gpu: g.slug }}
                      className="cf-launch flex-1 sm:flex-none"
                      aria-label={`Launch ${g.name}`}
                    >
                      Launch <span aria-hidden>→</span>
                    </TrackedLink>
                  )
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
