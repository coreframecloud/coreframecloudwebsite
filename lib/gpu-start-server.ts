import { gpuIntroEligible, hourlyValue, introCredit, introOfferFor, publicGpus, shortGpuName, type RateCard } from "@/lib/rate-card";
import type { Currency } from "@/lib/money";
import type { StartGpu } from "@/components/go/gpu-start";

/**
 * The cards and defaults for the GPU Start picker (components/go/gpu-start.tsx),
 * from the live rate card, in the page's currency only. The default card is the
 * one the first top-up's hours are counted on (the offer the page leads with),
 * else the cheapest priced card; the default amount is the first top-up.
 */
export function startGpus(card: RateCard | null, currency: Currency): {
  gpus: StartGpu[];
  defaultSlug: string | null;
  amount: number | null;
  introHours: number | null;
} {
  const intro = introOfferFor(card, currency);
  const credit = intro ? introCredit(intro) : null;
  const gpus: StartGpu[] = publicGpus(card).map((g) => {
    const rate = hourlyValue(g, currency, card);
    const eligible = Boolean(intro) && gpuIntroEligible(g, card, currency);
    // What the first top-up buys on THIS card: the offer's hours on its own card; on the other
    // eligible cards the same credit at their rate (floored, as lib/rate-card does); elsewhere
    // the amount at the card's rate. Never rounded up.
    let hours: number | null = null;
    if (intro && rate) {
      if (g.name === intro.gpuName) hours = intro.hours;
      else if (eligible && credit) hours = Math.floor(credit / rate + 1e-9);
      else hours = Math.floor((intro.price / rate) * 10) / 10;
    }
    return {
      slug: g.slug,
      name: shortGpuName(g.name),
      vram: g.vram_gb,
      ram: g.ram_gb ?? null,
      badge: g.badge ?? null,
      rate,
      intro: eligible,
      hours,
    };
  });
  const byIntro = intro?.gpuName ? publicGpus(card).find((g) => g.name === intro.gpuName)?.slug : undefined;
  const defaultSlug = byIntro ?? gpus.find((g) => g.rate != null)?.slug ?? null;
  return { gpus, defaultSlug, amount: intro ? intro.price : null, introHours: intro ? intro.hours : null };
}
