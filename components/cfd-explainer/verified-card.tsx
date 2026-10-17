import Link from "next/link";
import { StatusBadge } from "@/components/home/redesign/offerings";
import { VERIFIED, verifiedFrom } from "@/lib/cfd-verified";
import { formatMoney, type Currency } from "@/lib/money";
import { verifiedOtherCurrency } from "@/lib/cfd-prices";

/**
 * The Verified package card (owner, 16 Oct 2026): /cfd and
 * /cfd/mesh-independence-study. Prices and facts from lib/cfd-verified.ts.
 * Quiet CTA (owner, 15 Oct): the ask is last and small.
 */
export function VerifiedCard({
  currency,
  id,
  learnMore = true,
  startHref = "/cfd#start",
}: {
  currency: Currency;
  id?: string;
  learnMore?: boolean;
  startHref?: string;
}) {
  const usd = currency === "USD";
  const rows: [string, string][] = [
    ["Three meshes", "Your case on a coarse, a medium and a fine mesh, refinement ratio 1.3 between them."],
    ["Grid convergence index", "GCI per Celik et al. (2008) with a safety factor of 1.25; answers that oscillate between meshes are judged on 1.25 × half their spread (Stern et al., 2001)."],
    ["A verdict in the report", "For example: “Mesh-independent: static pressure drop = 12.30 Pa ± 0.13 % (fine mesh)”, with all three meshes and their numbers."],
    ["Scope", `Internal flow: pipes, ducts, fittings and manifolds, quoted meshes up to about ${VERIFIED.maxMcells} million cells. Results within ${VERIFIED.deliveryHours} hours; not offered as express.`],
  ];
  return (
    <div id={id} className="cfx-panel scroll-mt-20 rounded-[6px] p-6 sm:p-9">
      <div className="flex flex-wrap items-center gap-2.5">
        <p className="cfx-eyebrow">CFD package</p>
        <StatusBadge status="New" />
      </div>
      <div className="mt-4 flex flex-col gap-4 min-[720px]:flex-row min-[720px]:items-end min-[720px]:justify-between">
        <div className="min-w-0">
          <h3 className="font-heading text-[30px] leading-[1.1] font-medium text-ink sm:text-[36px]">{VERIFIED.name}</h3>
          <p className="mt-1.5 font-mono text-[13px] tracking-[0.08em] text-ink-2 uppercase">{VERIFIED.subline}</p>
        </div>
        <div className="min-w-0 min-[720px]:text-right">
          <p className="font-heading text-[24px] leading-[1.2] font-medium text-ink">{verifiedFrom(currency)}</p>
          <p className="mt-1 text-[13px] leading-5 text-ink-3">
            {usd
              ? "No GST (export of services). Scales with the cells in your mesh."
              : `Scales with the cells in your mesh: about ${formatMoney(VERIFIED.inrAt2M, "INR")} + GST at 2 million cells.`}
          </p>
          {/* The other currency too: crawlers only ever see one copy (SEO review 18 Oct 2026, T2). */}
          <p className="mt-1 text-[13px] leading-5 text-ink-3">{verifiedOtherCurrency(currency)}</p>
        </div>
      </div>
      <dl className="mt-7 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="min-w-0 border-t border-dashed border-ink/25 pt-4">
            <dt className="font-semibold text-ink">{k}</dt>
            <dd className="mt-1 text-[15px] leading-6 text-ink-2">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 text-[14.5px] leading-6 text-ink-2">
        <span className="font-semibold text-ink">What it proves, and what it does not.</span> {VERIFIED.meaning} Pre-processing
        / mesh check is charged separately, as for every package.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[14.5px]">
        <Link href={startHref} className="cfh-link text-ink">
          Start a job <span aria-hidden>→</span>
        </Link>
        {learnMore ? (
          <Link href={VERIFIED.path} className="text-ink-2 underline underline-offset-4">
            How a mesh independence study works
          </Link>
        ) : null}
      </div>
    </div>
  );
}
