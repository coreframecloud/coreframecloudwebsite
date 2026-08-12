import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import { HeroSection } from "@/components/home/hero-section";
import { WorkflowSection } from "@/components/home/workflow-section";
import { PricingSection } from "@/components/home/pricing-section";
import { FaqSection } from "@/components/home/faq-section";
import { ContactSection } from "@/components/home/contact-section";
import { TrialBanner } from "@/components/home/trial-banner";
import { getRateCard, formatHourly, getTrialTerms } from "@/lib/rate-card";
import { storageTerms } from "@/lib/storage-terms";

export const metadata: Metadata = {
  title: "5× Faster Rendering & CFD in Minutes — GPU Cloud India | Coreframe",
  description:
    "Tired of overnight renders and 3-day CFD jobs? Coreframe gives you RTX 5080 GPU workstations for D5 Render, Lumion & Enscape — plus managed per-job Ansys CFD. ₹399/GPU-hour, GST included. No hardware. Bengaluru, India.",

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
  // Same rule as the price: null means say nothing. The banner disappears the
  // moment trials are switched off in the control plane, rather than advertising
  // an offer the platform will refuse after someone has handed over their ID.
  const trial = getTrialTerms(rateCard);
  // Live storage figures, falling back to constants if the fetch failed.
  const storage = storageTerms(rateCard);

  return (
    <div className="min-h-screen text-white">
      <BackgroundGlow />

      <main className="relative">
        <HeroSection />
        <TrialBanner terms={trial} />
        <WorkflowSection />
        <PricingSection adhocRate={adhocRate} storage={storage} />
        <FaqSection />
        <ContactSection />
      </main>

    </div>
  );
}
