/**
 * Day, week and month passes on /pricing (gpu-product-1110, item 5).
 *
 * Drawn only from the rate card's optional `block_bookings` block, in the
 * page's currency only (owner, 18 Oct 2026: one currency per visitor). No
 * block, or no offers in this currency: nothing at all is rendered, so the
 * page is unchanged while the API flag is off.
 *
 * A server component. Passes are bought signed in, from My Activity.
 */

import Link from "next/link";
import { effectiveHourly, passHours, rateCardOffers, windowLabel } from "@/lib/block-bookings";
import { formatMoney, type Currency } from "@/lib/money";
import { taxWords, type RateCard } from "@/lib/rate-card";

export function BlockPasses({ card, currency }: { card: RateCard | null; currency: Currency }) {
  const offers = rateCardOffers(card?.block_bookings, currency);
  if (!offers.length) return null;
  const terms = card?.block_bookings?.terms ?? [];

  return (
    <section className="cf-section px-5 pt-0" data-cf-section="passes" aria-labelledby="passes-title">
      <div className="cf-wide">
        <p className="text-[13px] font-semibold tracking-[0.12em] text-ink-2 uppercase">Passes</p>
        <h2 id="passes-title" className="cf-section-title mt-3">Day, week and month passes.</h2>
        <p className="cf-section-copy mt-3 max-w-[40rem]">
          A block of hours on one GPU, paid up front at a lower hourly price. Prices {taxWords(currency)}.
        </p>

        <div className="mt-7 grid gap-4">
          {offers.map((o) => (
            <div key={o.profile_slug} className="min-w-0 rounded-[20px] border border-rule bg-paper-2 p-5 sm:p-6">
              <p className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="font-heading text-[19px] font-medium text-ink">{o.profile_name}</span>
                <span className="text-[13px] text-ink-3">Normal rate {formatMoney(o.hourly_rate, currency)}/hr</span>
              </p>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {o.packs.map((p) => (
                  <li key={p.key} className="min-w-0 rounded-[16px] border border-rule bg-paper px-4 py-4">
                    <p className="text-[13px] font-semibold tracking-[0.04em] text-ink-2 uppercase">{p.label}</p>
                    <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
                      <span className="text-[24px] leading-none font-semibold text-ink">{formatMoney(p.price, currency)}</span>
                      {p.list_price > p.price ? (
                        <s className="text-[14px] text-ink-3">{formatMoney(p.list_price, currency)}</s>
                      ) : null}
                    </p>
                    <p className="mt-2 text-[14px] leading-5 text-ink-2">
                      {passHours(p.hours)} within {windowLabel(p.window_hours)}
                    </p>
                    <p className="mt-1 text-[14px] leading-5 text-ink-2">
                      {effectiveHourly(p, currency)}/hr
                      {p.discount_pct > 0 ? <span className="font-semibold text-ink"> · save {p.discount_pct}%</span> : null}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {terms.length ? (
          <ul className="mt-5 list-disc space-y-1 pl-5 text-[14px] leading-6 text-ink-2">
            {terms.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        ) : null}
        <p className="mt-3 text-[14px] leading-6 text-ink-2">
          Signed in? Passes are in{" "}
          <Link href="/my-activity#passes" className="inline-flex min-h-[44px] items-center text-ink underline underline-offset-4">
            My Activity
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
