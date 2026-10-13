import type { Metadata } from "next";
import { WALKTHROUGH_YOUTUBE_ID } from "@/components/home/landing/walkthrough-section";
import { RedesignHero } from "@/components/home/redesign/hero";
import { Bento } from "@/components/home/redesign/bento";
import { FactsBand, BuiltFor, OfferBand, HowItWorks } from "@/components/home/redesign/bands";
import { Testimonials } from "@/components/home/redesign/testimonials";
import { OfferingBands } from "@/components/home/redesign/offerings";
import {
  getRateCard,
  formatHourly,
  getIntroOffer,
  hoursLabel,
  rupees,
} from "@/lib/rate-card";

export const metadata: Metadata = {
  title: "RTX 5080 Workstations, CFD and Studio, India — Coreframe Cloud",
  description:
    "Three services from Bengaluru: rent a Windows RTX 5080 workstation by the minute, get CFD for your duct or pipe from one STL with no licence, and Studio for pre-sale concept images (opening soon).",
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
 *   4  bento       the workstation in detail · studio plans · per-minute · walkthrough
 *   5  facts       what's in the box, facts only, with the benchmark source
 *   6  built for   who uses it and with what
 *   7  customers   their exact words (renders nothing until there are some)
 *   8  the offer   from the live rate card, on our calendar render
 *
 * Every figure is read from the live rate card; a missing value removes its
 * line. The previous long-form sections (calculator, versus, disciplines)
 * still exist under components/home/landing for other pages.
 */
export default async function Page() {
  const rateCard = await getRateCard();
  const entry = rateCard?.gpus.find((g) => !g.quote_on_request);
  const adhocRate = entry ? formatHourly(entry).replace("/hr", "") : undefined;
  const intro = getIntroOffer(rateCard);
  const introLabel = intro ? `${rupees(intro.priceRupees)} = ${hoursLabel(intro.hours)}` : null;

  return (
    <main className="text-ink">
      <RedesignHero introLabel={introLabel} />
      <div className="cfh-sheet">
        <OfferingBands />
        <Bento youtubeId={WALKTHROUGH_YOUTUBE_ID} />
        <HowItWorks />
      </div>
      <FactsBand />
      <BuiltFor />
      <Testimonials />
      <OfferBand adhocRate={adhocRate} intro={intro} />
    </main>
  );
}
