                                                                               import { BackgroundGlow } from "@/components/home/background-glow";
import { AiNodesSection } from "@/components/home/ai-nodes-section";
import { ContactSection } from "@/components/home/contact-section";
import { HeroSection } from "@/components/home/hero-section";
import { LaunchCardsSection } from "@/components/home/launch-cards-section";
import { PricingSection } from "@/components/home/pricing-section";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { WhatsAppButton } from "@/components/home/whatsapp-button";

export default function Page() {
  return (
    <div className="min-h-screen text-white">
      <BackgroundGlow />
      <SiteHeader />

      <main className="relative">
        <HeroSection />
        <LaunchCardsSection />
        <AiNodesSection />
        <PricingSection />
        <ContactSection />
      </main>

      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}
