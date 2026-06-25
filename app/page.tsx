import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import { HeroSection } from "@/components/home/hero-section";
import { WorkflowSection } from "@/components/home/workflow-section";
import { PricingSection } from "@/components/home/pricing-section";
import { FaqSection } from "@/components/home/faq-section";
import { ContactSection } from "@/components/home/contact-section";
import { WhatsAppButton } from "@/components/home/whatsapp-button";

export const metadata: Metadata = {
  title: "Coreframe Cloud | RTX GPU Workstations for Design & Visualisation",
  description:
    "Launch RTX 5070 Ti GPU workstations for D5 Render, Lumion, Enscape and 3D visualisation. Pay-as-you-go or committed monthly plans. Hosted in India.",

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
