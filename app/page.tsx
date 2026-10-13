import type { Metadata } from "next";
import { WALKTHROUGH_YOUTUBE_ID } from "@/components/home/landing/walkthrough-section";
import { RedesignHero } from "@/components/home/redesign/hero";
import { Bento } from "@/components/home/redesign/bento";
import { FactsBand, BuiltFor, OfferBand, HowItWorks } from "@/components/home/redesign/bands";
import { Testimonials } from "@/components/home/redesign/testimonials";
import { CfdSpotlight } from "@/components/home/redesign/cfd-spotlight";
import {
  getRateCard,
  formatHourly,
  getIntroOffer,
  hoursLabel,
  rupees,
} from "@/lib/rate-card";

export const metadata: Metadata = {
  title: "RTX 5080 Cloud Workstations, India — Coreframe Cloud",
  description:
    "Rent a Windows RTX 5080 workstation by the minute and stream it in 4K to the laptop you own. GST included, hosted in Bengaluru, nothing to cancel.",
  alternates: { canonical: "/" },
  other: { "contact:email": "admin@coreframecloud.com" },
};

/**
 * The 11 Oct 2026 redesign (owner brief: clean and elegant like
 * world.siteground.com, our own renders behind the sections, then customer
 * words). The order:
 *
 *   1  hero        a real render, the promise, Sign up
 *   2  the sheet   white page slides up over the hero
 *   3  bento       workstation · Studio · studio plans · per-minute · walkthrough
 *   4  facts       what's in the box, facts only, with the benchmark source
 *   5  built for   who uses it and with what
 *   6  customers   their exact words (renders nothing until there are some)
 *   7  the offer   from the live rate card, on our calendar render
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
        <CfdSpotlight />
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
