import { formatMoney, type Currency } from "@/lib/money";
import {
  gpuIntroEligible,
  hourlyValue,
  publicGpus,
  shortGpuName,
  type RateCard,
} from "@/lib/rate-card";

/**
 * The GPU ladder as cards, for a paid landing page (owner, 22 Oct 2026:
 * "most of the ads lack the context of other GPU options; show the biggest
 * capability first and then list all the others as cards at the end").
 *
 * The page's headline carries the biggest capability (the most VRAM on the
 * card); this list is the "others as cards", smallest to largest, so a reader
 * finds their own scene size on the way down. Every number is read from the
 * live rate card: name, VRAM, the badge the control plane publishes for the
 * card (Entry / More memory / Fast rendering / Big scenes), the per-hour
 * price in the page's currency, and whether the intro hours apply. Nothing
 * here types a price or a GPU, so a card the owner retires disappears on
 * the next rate-card fetch and a staff-only card never shows.
 */
export function GpuCards({ card, currency }: { card: RateCard | null; currency: Currency }) {
  // publicGpus() is cheapest first, which is also the order Connect and
  // /pricing use (16 GB entry, 24 GB, 16 GB fast, 48 GB); the reader climbs
  // the price, not the memory, and the VRAM is bold on every card.
  const gpus = publicGpus(card);
  if (!gpus.length) return null;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {gpus.map((g) => {
        const rate = hourlyValue(g, currency, card);
        const intro = gpuIntroEligible(g, card, currency);
        return (
          <li key={g.slug} className="rounded-cf border border-rule bg-paper-2 px-4 py-3.5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-heading text-[17px] font-medium text-ink">{shortGpuName(g.name)}</p>
              {g.badge ? (
                <span className="shrink-0 rounded-full bg-tint-blue px-2.5 py-0.5 text-[11.5px] font-semibold tracking-[0.04em] text-blue-ink">
                  {g.badge}
                </span>
              ) : null}
            </div>
            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-[13.5px] leading-5 text-ink-2">
                <b className="font-semibold text-ink">{g.vram_gb} GB</b> VRAM
                {g.ram_gb ? ` · ${g.ram_gb} GB RAM` : ""}
              </p>
              {rate != null ? (
                <p className="text-[15px] leading-5 text-ink">
                  <b className="font-semibold">{formatMoney(rate, currency)}</b>
                  <span className="text-ink-3">/hr</span>
                </p>
              ) : null}
            </div>
            {intro ? <p className="mt-1.5 text-[12.5px] leading-5 text-blue-ink">Intro hours apply</p> : null}
          </li>
        );
      })}
    </ul>
  );
}
