import { adhocRate, introOfferFor, introPrice, hoursLabel, ladderRanges, publicGpus, shortGpuName, type RateCard } from "@/lib/rate-card";
import { startGpus } from "@/lib/gpu-start-server";
import type { Currency } from "@/lib/money";
import type { StartGpu } from "@/components/go/gpu-start";
import { softwareFit, type SoftwareFit } from "@/lib/software-fit";

/**
 * Everything a software page's price-first hero needs, from the live rate
 * card in the page's currency only (owner, 18 Oct 2026: one currency per
 * visitor; 15 Oct 2026: lead with the lowest price; 10 Nov 2026: price first,
 * account at Start).
 *
 * The recommended card is the cheapest public, priced card with at least the
 * software's minimum VRAM (lib/software-fit.ts), or its preferred slug when
 * that is live and big enough. It is the picker's default, so the one big
 * button reads "Start on <that card>". Null when the rate card is unreachable:
 * the page then shows no price rather than a stale one.
 */
export type SoftwareStartData = {
  fit: SoftwareFit | undefined;
  gpus: StartGpu[];
  amount: number | null;
  introHours: number | null;
  /** The picker's default: the recommended card when there is one. */
  defaultSlug: string | null;
  rec: StartGpu | null;
  /** "₹99" / "$1.49": the lowest public hourly price. */
  from: string | null;
  /** More than one priced card, so "from" is honest. */
  many: boolean;
  /** "₹1,000 = 8 hours", or null without an intro offer. */
  intro: string | null;
  /** The intro offer's card ("RTX 5080"), for "on the …" wording. */
  introGpu: string | null;
  tax: string;
  perMinute: boolean;
};

export function softwareStart(slug: string, card: RateCard | null, currency: Currency): SoftwareStartData {
  const fit = softwareFit(slug);
  const pick = startGpus(card, currency);
  const priced = pick.gpus.filter((g) => g.rate != null);
  let rec: StartGpu | null = null;
  if (fit) {
    const preferred = fit.gpu.prefer ? priced.find((g) => g.slug === fit.gpu.prefer && g.vram >= fit.gpu.minVram) : undefined;
    // pick.gpus is already cheapest first (publicGpus order).
    rec = preferred ?? priced.find((g) => g.vram >= fit.gpu.minVram) ?? null;
  }
  const offer = introOfferFor(card, currency);
  return {
    fit,
    gpus: pick.gpus,
    amount: pick.amount,
    introHours: pick.introHours,
    defaultSlug: rec?.slug ?? pick.defaultSlug,
    rec,
    from: adhocRate(card, currency),
    many: (ladderRanges(card)?.count ?? publicGpus(card).length) > 1,
    intro: offer ? `${introPrice(offer)} = ${hoursLabel(offer.hours)}` : null,
    introGpu: offer?.gpuName ? shortGpuName(offer.gpuName) : null,
    tax: currency === "USD" ? "no GST" : "incl. GST",
    perMinute: card?.billing_granularity === "per_minute",
  };
}
