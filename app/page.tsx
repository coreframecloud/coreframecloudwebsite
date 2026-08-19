import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import { ExplainerHero } from "@/components/home/explainer-hero";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { BenefitsSection } from "@/components/home/benefits-section";
import { MachineSpecSection } from "@/components/home/machine-spec-section";
import { PricingSection } from "@/components/home/pricing-section";
import { ExplainerFaq } from "@/components/home/explainer-faq";
import { ContactSection } from "@/components/home/contact-section";
import { ClosingCta } from "@/components/home/closing-cta";
import {
  getRateCard,
  formatHourly,
  getTrialTerms,
  billingSentence,
  bestOverageRate,
  entryPlanFee,
  storageRatePerTb,
  perMinuteRate,
  sessionCostExample,
  commitmentIsCheaper,
} from "@/lib/rate-card";
import { storageTerms } from "@/lib/storage-terms";

export const metadata: Metadata = {
  title: "RTX 5080 workstations by the hour — Coreframe Cloud",
  description:
    "A ₹5,00,000 workstation, rented by the hour. Full Windows machines with an RTX 5080 and D5 Render, Lumion, Enscape, Twinmotion, 3ds Max and Blender pre-installed. Per-minute billing, GST included. Hosted in Bengaluru, India.",
  alternates: {
    canonical: "/",
  },
  other: {
    "contact:email": "admin@coreframecloud.com",
  },
};

export default async function Page() {
  // Published price comes from the control-plane rate card, so the homepage can
  // never advertise a number billing does not charge. Cheapest active GPU is the
  // "starting at" figure. Revalidated hourly — see lib/rate-card.ts.
  const rateCard = await getRateCard();
  const entry = rateCard?.gpus.find((g) => !g.quote_on_request);
  const adhocRate = entry ? formatHourly(entry).replace("/hr", "") : undefined;
  // Same rule as the price: null means say nothing. Every trial figure on this
  // page disappears the moment trials are switched off in the control plane,
  // rather than advertising an offer the platform will refuse after someone has
  // handed over their ID.
  const trial = getTrialTerms(rateCard);
  // Live storage figures, falling back to constants if the fetch failed.
  const storage = storageTerms(rateCard);

  return (
    <div className="min-h-screen text-white">
      <BackgroundGlow />

      <main className="relative">
        {/* Order is the argument: what it costs → what it IS → why it helps →
            what you get → what it costs in detail → objections → decide.
            "How it works" sits second because the feedback that prompted this
            rebuild was that people did not understand the concept, and no
            benefit lands before that. */}
        <ExplainerHero adhocRate={adhocRate} trial={trial} />
        <HowItWorksSection />
        <BenefitsSection storage={storage} />
        <MachineSpecSection storage={storage} />
        <PricingSection
          adhocRate={adhocRate}
          storage={storage}
          billingNote={billingSentence(rateCard)}
          bestOverage={bestOverageRate(rateCard)}
          entryPlanFee={entryPlanFee(rateCard)}
          storageRate={storageRatePerTb(rateCard)}
          perMinute={perMinuteRate(rateCard)}
          example={sessionCostExample(rateCard)}
          commitmentCheaper={commitmentIsCheaper(rateCard)}
        />
        <ExplainerFaq storage={storage} trial={trial} adhocRate={adhocRate} />
        <ContactSection />
        <ClosingCta trial={trial} />
      </main>
    </div>
  );
}
