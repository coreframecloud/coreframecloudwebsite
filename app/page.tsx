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
  title: "D5 Render Cloud Workstation | RTX GPU Rendering",
  description:
    "Launch D5 Render on RTX GPUs in under 2 minutes. 16GB–48GB VRAM workstations. Start from ₹90/hr.",

  alternates: {
    canonical: "/",
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
