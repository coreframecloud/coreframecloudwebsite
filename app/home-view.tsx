import type { Metadata } from "next";
import { PageByline } from "@/components/seo/page-byline";
import { WALKTHROUGH_YOUTUBE_ID } from "@/components/home/landing/walkthrough-section";
import { RedesignHero } from "@/components/home/redesign/hero";
import { Bento } from "@/components/home/redesign/bento";
import { FactsBand, BuiltFor, OfferBand, HowItWorks } from "@/components/home/redesign/bands";
import { Testimonials } from "@/components/home/redesign/testimonials";
import { OfferingBands, offeringPrices } from "@/components/home/redesign/offerings";
import type { Currency } from "@/lib/money";
import {
  getRateCard,
  adhocRate as adhocRateFrom,
  introOfferFor,
  hoursLabel,
  introPrice,
  ladderRanges,
} from "@/lib/rate-card";

/** One metadata for both copies: the description quotes no price. */
export const homeMetadata: Metadata = {
  title: { absolute: "GPU Workstations, CFD & Studio, India | Coreframe Cloud" },
  description:
    "Rent a Windows GPU workstation by the minute, get CFD for your duct or pipe from one STL with no licence, and Studio concept images. From Bengaluru.",
  alternates: { canonical: "/" },
  other: { "contact:email": "admin@coreframecloud.com" },
};

/**
 * The 11 Oct 2026 redesign (owner brief: clean and elegant like
 * world.siteground.com, our own renders behind the sections, then customer
 * words). The order:
 *
 *   1  hero        a real render, the company line, then the THREE services
 *                  as equal cards (GPU workstations · CFD · Studio), 13 Oct 2026
 *   2  the sheet   white page slides up over the hero
 *   3  bands       one band per service, same order as the hero cards
 *   4  bento       the workstation in detail · team plans · per-minute · walkthrough
 *   5  facts       what's in the box, facts only, with the benchmark source
 *   6  built for   who uses it and with what
 *   7  customers   their exact words (renders nothing until there are some)
 *   8  the offer   from the live rate card, on our calendar render
 *
 * Every figure is read from the live rate card; a missing value removes its
 * line. The previous long-form sections (calculator, versus, disciplines)
 * still exist under components/home/landing for other pages.
 *
 * Rendered twice (owner, 18 Oct 2026: one currency per visitor): / in rupees
 * and app/usd/page.tsx in US dollars, which proxy.ts serves to visitors
 * outside India. Each copy shows its own currency's intro offer, the dollar
 * one only while the API publishes usd.intro_offer.
 */
export default async function HomeView({ currency }: { currency: Currency }) {
  const rateCard = await getRateCard();
  // The "from" price: the cheapest public GPU on the ladder (owner, 21 Oct 2026).
  const ladder = ladderRanges(rateCard);
  const adhocBare = adhocRateFrom(rateCard, currency);
  // "from ₹99" once more than one GPU is public; the bare rate with one.
  const adhocRate = adhocBare ? `${ladder && ladder.count > 1 ? "from " : ""}${adhocBare}` : undefined;
  const intro = introOfferFor(rateCard, currency);
  const prices = offeringPrices(rateCard, currency);
  const introLabel = intro ? `${introPrice(intro)} = ${hoursLabel(intro.hours)}` : null;

  return (
    <main className="text-ink">
      <RedesignHero introLabel={introLabel} prices={prices} />
      <div className="cfh-sheet">
        <OfferingBands prices={prices} />
        <Bento youtubeId={WALKTHROUGH_YOUTUBE_ID} ladder={ladder} />
        <HowItWorks />
      </div>
      <FactsBand currency={currency} ladder={ladder} />
      <BuiltFor />
      <Testimonials />
      <OfferBand adhocRate={adhocRate} intro={intro} currency={currency} />
      {/* Who and when (GEO check 18 Oct 2026, G-DATES / G-BYLINE). */}
      <div className="cf-wide px-5 py-6">
        <PageByline path="/" className="text-ink-3" />
      </div>
    </main>
  );
}
