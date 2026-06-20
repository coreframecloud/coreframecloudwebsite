import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import { HeroSection } from "@/components/home/hero-section";
import { WorkflowSection } from "@/components/home/workflow-section";
import { AiNodesSection } from "@/components/home/ai-nodes-section";
import { PricingSection } from "@/components/home/pricing-section";
import { FaqSection } from "@/components/home/faq-section";
import { ContactSection } from "@/components/home/contact-section";
import { WhatsAppButton } from "@/components/home/whatsapp-button";

export const metadata: Metadata = {
  title: "Coreframe Cloud | Cloud GPU Workstations and AI Infrastructure",
  description:
    "Launch cloud GPU workstations for RTX rendering, AI workloads, and managed infrastructure with Coreframe Cloud.",

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
        <AiNodesSection />
        <PricingSection />
        <FaqSection />
        <ContactSection />
      </main>

      <WhatsAppButton />
    </div>
  );
}
