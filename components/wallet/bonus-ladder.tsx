/**
 * The bulk top-up bonus, drawn rather than listed (owner, 16 Oct 2026: "there's
 * no creative graphics to show the offer on topup. it's text").
 *
 * Every number here comes from the tiers the API sends (`bulk_topup_tiers` on
 * the wallet status and on /payments/config, in the ACCOUNT's currency), so an
 * INR account sees ₹2,000 / ₹5,000 / ₹10,000 and a USD account its own dollar
 * ladder without a single amount typed into this file.
 *
 * Design rules (owner, 15 Oct 2026): calm, never salesy, no urgency; exactly
 * ONE yellow highlight per view, here the best tier's bonus; three type sizes.
 */

import { formatMoney, type Currency } from "@/lib/money";

/** In the account's currency: `min`/`bonus` from 15 Oct 2026, the `_rupees`
 *  names kept for an older control plane. */
export type BulkTier = { min_rupees: number; percent: number; bonus_rupees: number; min?: number; bonus?: number };

export const tierMin = (t: BulkTier) => t.min ?? t.min_rupees;
export const tierBonus = (t: BulkTier) => t.bonus ?? t.bonus_rupees;

/** The bonus a top-up of `amount` earns at the given tiers (0 below the first).
 *  Same rule as the server (topup_bonus.bonus_for): the highest tier reached,
 *  as a percent of the whole amount. */
export function bulkBonusFor(amount: number, tiers: BulkTier[] | null | undefined): number {
  let pct = 0;
  for (const t of tiers ?? []) if (amount >= tierMin(t)) pct = t.percent;
  return Math.round(amount * pct) / 100;
}

/** Whole rupees (₹1,500); cents kept for dollars ($2.50). */
export function bonusMoney(v: number, currency: Currency): string {
  return formatMoney(currency === "USD" ? v : Math.round(v), currency);
}

const sortTiers = (tiers: BulkTier[]) => [...tiers].sort((a, b) => tierMin(a) - tierMin(b));

/**
 * A stack of coins: two plain ones for the money paid, then `level` blue ones
 * for the bonus, so the three tiles read as a staircase at a glance.
 */
function CoinStack({ level, active }: { level: number; active: boolean }) {
  const base = 2;
  const coins = base + level;
  const step = 5;
  const cx = 24;
  const rx = 13;
  const ry = 4;
  const bottom = 40;
  return (
    <svg viewBox="0 0 48 44" width="48" height="44" aria-hidden="true" className="mx-auto block">
      {Array.from({ length: coins }, (_, k) => {
        const y = bottom - ry - k * step - 4;
        const bonus = k >= base;
        const side = bonus ? (active ? "var(--color-blue-ink)" : "#9db6e8") : "#c9ccd1";
        const top = bonus ? (active ? "var(--color-blue)" : "#c6d6f4") : "#eceef0";
        return (
          <g key={k}>
            <ellipse cx={cx} cy={y + step} rx={rx} ry={ry} fill={side} />
            <rect x={cx - rx} y={y} width={rx * 2} height={step} fill={side} />
            <ellipse cx={cx} cy={y} rx={rx} ry={ry} fill={top} stroke={side} strokeWidth="0.75" />
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Three tier tiles: "₹2,000" small, "+₹100" big, "5% extra" micro. The tile
 * the current amount has reached is outlined in blue; with `onPick` each tile
 * is a button that sets the amount to that tier.
 */
export function BonusLadder({
  tiers,
  currency,
  amount,
  onPick,
  dimmed = false,
}: {
  tiers: BulkTier[];
  currency: Currency;
  /** The amount being considered, to mark the tier it reaches. */
  amount?: number | null;
  onPick?: (min: number) => void;
  /** True while the intro offer takes the first top-up instead. */
  dimmed?: boolean;
}) {
  const list = sortTiers(tiers);
  if (!list.length) return null;
  const best = list.length - 1;
  let reached = -1;
  if (!dimmed && amount != null) list.forEach((t, i) => { if (amount >= tierMin(t)) reached = i; });

  return (
    <div className={`grid gap-2 ${list.length === 1 ? "grid-cols-1" : list.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
      {list.map((t, i) => {
        const active = i === reached;
        const body = (
          <>
            <CoinStack level={Math.min(i + 1, 4)} active={active || (reached < 0 && i === best)} />
            <span className="mt-1.5 block text-[12px] leading-4 tabular-nums text-ink-2">
              {formatMoney(tierMin(t), currency)}
            </span>
            <span className="mt-1 block font-display text-[17px] leading-6 font-bold whitespace-nowrap tabular-nums text-ink min-[400px]:text-[19px] sm:text-[24px] sm:leading-7">
              {i === best ? (
                <span className="rounded-[5px] bg-hl px-0.5 sm:px-1">+{bonusMoney(tierBonus(t), currency)}</span>
              ) : (
                <>+{bonusMoney(tierBonus(t), currency)}</>
              )}
            </span>
            <span className="mt-1 block text-[12px] leading-4 text-ink-2">{t.percent}% extra</span>
          </>
        );
        const cls = `block w-full min-w-0 rounded-cf border px-1 pt-2.5 pb-2.5 text-center transition-colors ${
          active ? "border-blue bg-blue-soft" : "border-rule bg-paper"
        }`;
        return onPick ? (
          <button
            key={tierMin(t)}
            type="button"
            onClick={() => onPick(tierMin(t))}
            aria-label={`Top up ${formatMoney(tierMin(t), currency)}, get ${bonusMoney(tierBonus(t), currency)} extra`}
            className={`${cls} cursor-pointer hover:border-blue/60`}
          >
            {body}
          </button>
        ) : (
          <div key={tierMin(t)} className={cls}>
            {body}
          </div>
        );
      })}
    </div>
  );
}

/**
 * What this amount puts in the wallet, as a bar: the money paid in ink, the
 * bonus in blue. Below the first tier (or between tiers with no bonus yet) the
 * bar shows the gap to the next tier and that tier's bonus as an outline, with
 * one plain line: "Add ₹500 more to get ₹100 extra."
 */
export function YouGetBar({
  amount,
  tiers,
  currency,
}: {
  amount: number;
  tiers: BulkTier[];
  currency: Currency;
}) {
  const list = sortTiers(tiers);
  if (!list.length || !(amount > 0)) return null;
  const money = (v: number) => formatMoney(v, currency);
  const bonus = bulkBonusFor(amount, list);
  const next = list.find((t) => tierMin(t) > amount) ?? null;

  if (bonus > 0) {
    const total = amount + bonus;
    const paidPct = (amount / total) * 100;
    return (
      <div className="mt-3 rounded-cf border border-rule bg-paper-2 px-3 py-3" aria-live="polite">
        <div className="flex h-2.5 overflow-hidden rounded-full bg-rule">
          <div className="h-full bg-ink motion-safe:transition-[width] motion-safe:duration-300" style={{ width: `${paidPct}%` }} />
          <div className="h-full min-w-1.5 flex-1 bg-blue" />
        </div>
        <div className="mt-1.5 flex justify-between gap-2 text-[12px] leading-4 tabular-nums text-ink-2">
          <span>You pay {money(amount)}</span>
          <span className="font-semibold text-blue">+{bonusMoney(bonus, currency)} bonus</span>
        </div>
        <p className="mt-2 text-sm leading-5 font-semibold text-ink">
          You&rsquo;ll get {bonusMoney(bonus, currency)} extra: {money(total)} in your wallet.
        </p>
      </div>
    );
  }

  if (!next) return null;
  const nextBonus = tierBonus(next);
  const short = tierMin(next) - amount;
  const span = tierMin(next) + nextBonus;
  return (
    <div className="mt-3 rounded-cf border border-rule bg-paper-2 px-3 py-3" aria-live="polite">
      <div className="flex h-2.5 overflow-hidden rounded-full">
        <div className="h-full bg-ink motion-safe:transition-[width] motion-safe:duration-300" style={{ width: `${(amount / span) * 100}%` }} />
        <div className="h-full bg-rule" style={{ width: `${(short / span) * 100}%` }} />
        <div
          className="h-full min-w-1.5 flex-1"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, color-mix(in srgb, var(--color-blue) 45%, transparent) 0 3px, transparent 3px 6px)",
          }}
        />
      </div>
      <div className="mt-1.5 flex justify-between gap-2 text-[12px] leading-4 tabular-nums text-ink-2">
        <span>You pay {money(amount)}</span>
        <span>{money(tierMin(next))} gets +{bonusMoney(nextBonus, currency)}</span>
      </div>
      <p className="mt-2 text-sm leading-5 font-semibold text-ink">
        Add {money(short)} more to get {bonusMoney(nextBonus, currency)} extra.
      </p>
    </div>
  );
}
