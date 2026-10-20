import type { Currency } from "@/lib/money";
import { limitPercent, money } from "@/lib/team";

/**
 * "₹2,550 of ₹5,000" with a thin bar, or "₹920 · No limit". Blue below 80%,
 * dark blue from 80%, red at the limit.
 */
export default function SpendBar({
  spend,
  limit,
  currency,
  className = "",
}: {
  spend: number | null | undefined;
  limit: number | null | undefined;
  currency: Currency;
  className?: string;
}) {
  const pct = limitPercent(spend, limit);
  if (pct === null) {
    return (
      <div className={className}>
        <span className="text-sm tabular-nums text-ink">{money(spend, currency)}</span>
        <span className="text-xs text-ink-3"> · No limit</span>
      </div>
    );
  }
  const tone = pct >= 100 ? "bg-destructive" : pct >= 80 ? "bg-blue-ink" : "bg-blue";
  return (
    <div className={className}>
      <p className="text-sm tabular-nums whitespace-nowrap text-ink">
        {money(spend, currency)} <span className="text-ink-3">of {money(limit, currency)}</span>
      </p>
      <div
        className="mt-1.5 h-1.5 w-full max-w-[12rem] overflow-hidden rounded-full bg-ink/10"
        role="progressbar"
        aria-label="Spend this month against the monthly limit"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
      >
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max(2, pct)}%` }} />
      </div>
    </div>
  );
}
