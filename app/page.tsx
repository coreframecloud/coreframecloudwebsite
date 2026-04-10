import { BackgroundGlow } from "@/components/home/background-glow";
import { AiNodesSection } from "@/components/home/ai-nodes-section";
import { ContactSection } from "@/components/home/contact-section";
import { HeroSection } from "@/components/home/hero-section";
import { LaunchCardsSection } from "@/components/home/launch-cards-section";
import { PricingSection } from "@/components/home/pricing-section";
import { WhatsAppButton } from "@/components/home/whatsapp-button";

export default function Page() {
  return (
    <div className="min-h-screen text-white">
      <BackgroundGlow />

      <main className="relative">
        <HeroSection />
        <LaunchCardsSection />
        <AiNodesSection />
        <PricingSection />
        <ContactSection />
      </main>

      <WhatsAppButton />
    </div>
  );
}
