/**
 * The two-card ad-hoc / committed price block, shared by the SEO landing pages.
 *
 * It exists because /lumion-cloud-gpu and /enscape-cloud-gpu each carried their
 * own copy of the same block with the same four numbers typed in by hand, and
 * /cloud-rendering-for-architects carried a third variant. Three copies of a
 * price is three chances to be wrong, and on 18 Aug 2026 all three were: they
 * quoted ₹399 "charged per full hour" against an API that has always billed per
 * minute. One component, one source, one place to be right.
 *
 * A server component on purpose — the rate card is fetched on the server and
 * these pages are static, so the numbers are baked at build and revalidated
 * hourly like every other price on the site.
 */

import Link from "next/link";
import {
  adhocRate,
  bestOverageRate,
  entryPlanFee,
  storageRatePerTb,
  billingSentence,
  type RateCard,
} from "@/lib/rate-card";

export function PricingCards({
  card,
  adhocNote,
}: {
  card: RateCard | null;
  /** Page-specific extra sentence for the ad-hoc card, e.g. storage terms. */
  adhocNote?: string;
}) {
  const adhoc = adhocRate(card);
  const overage = bestOverageRate(card);
  const fromFee = entryPlanFee(card);
  const storage = storageRatePerTb(card);

  return (
    <div className="mt-14 grid gap-4 md:grid-cols-2">
      <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-3 text-xs uppercase tracking-wider text-white/40">Ad-hoc</div>
        <div className="text-4xl font-bold text-white">
          {adhoc ?? "—"} <span className="text-lg font-normal text-white/40">/ GPU-hr</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-white/50">
          No commitment. {billingSentence(card)}
          {adhocNote ? ` ${adhocNote}` : ""}
        </p>
      </div>

      <div className="rounded-[20px] border border-cyan-400/20 bg-cyan-400/[0.04] p-6">
        <div className="mb-3 text-xs uppercase tracking-wider text-cyan-300/60">
          Committed plans from
        </div>
        <div className="text-4xl font-bold text-white">
          {overage ?? "—"} <span className="text-lg font-normal text-white/40">/ GPU-hr</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-white/50">
          Cheaper per hour than ad-hoc at every tier
          {fromFee ? `, from ${fromFee}/month` : ""}. Persistent project storage and
          named seats for your studio.
          {storage ? ` Extra NAS storage ${storage}/TB/month.` : ""}
        </p>
        <Link href="/enterprise" className="mt-4 inline-block text-sm text-cyan-400 hover:underline">
          See plans →
        </Link>
      </div>
    </div>
  );
}
