import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import { HeroSection } from "@/components/home/hero-section";
import { WorkflowSection } from "@/components/home/workflow-section";
import { PricingSection } from "@/components/home/pricing-section";
import { FaqSection } from "@/components/home/faq-section";
import { ContactSection } from "@/components/home/contact-section";
import { WhatsAppButton } from "@/components/home/whatsapp-button";

export const metadata: Metadata = {
  title: "5× Faster Rendering & CFD in Hours — GPU Cloud India | Coreframe",
  description:
    "Tired of overnight renders and 3-day CFD jobs? Coreframe gives you RTX 5070 Ti for D5 Render, Lumion & Enscape — and H100/RTX 6000 Pro for Ansys CFD. Pay per hour. No hardware. Bengaluru, India.",

  alternates: {
    canonical: "/",
  },
  other: {
    "contact:email": "admin@coreframecloud.com",
  },
};

export default function Page() {
  return (
    <div className="min-h-screen text-white">
      <BackgroundGlow />

      <main className="relative">
        <HeroSection />
        <WorkflowSection />
        <PricingSection />
        <FaqSection />
        <ContactSection />
      </main>

      <WhatsAppButton />
    </div>
  );
}
