import { BackgroundGlow } from "@/components/home/background-glow";
import { AiNodesSection } from "@/components/home/ai-nodes-section";
import { ContactSection } from "@/components/home/contact-section";
import { HeroSection } from "@/components/home/hero-section";
import { PricingSection } from "@/components/home/pricing-section";
import { WhatsAppButton } from "@/components/home/whatsapp-button";
import { WorkflowSection } from "@/components/home/workflow-section";

export default function Page() {
  return (
	<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "D5 Render Cloud Workstation",
      description:
        "Run D5 Render on RTX GPUs in the cloud. Launch ready-to-use Windows workstations and render faster without setup.",
      brand: {
        "@type": "Brand",
        name: "Coreframe Cloud",
      },
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "90",
        highPrice: "299",
        priceCurrency: "INR",
        offerCount: "4",
      },
      category: "Cloud GPU Rendering",
    }),
  }}
/>
	<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: [
        {
          "@type": "Product",
          name: "D5 Render Server 16GB VRAM",
          offers: {
            "@type": "Offer",
            price: "90",
            priceCurrency: "INR",
          },
        },
        {
          "@type": "Product",
          name: "D5 Render Server 20GB VRAM",
          offers: {
            "@type": "Offer",
            price: "119",
            priceCurrency: "INR",
          },
        },
        {
          "@type": "Product",
          name: "D5 Render Server 24GB VRAM",
          offers: {
            "@type": "Offer",
            price: "155",
            priceCurrency: "INR",
          },
        },
        {
          "@type": "Product",
          name: "D5 Render Server 48GB VRAM",
          offers: {
            "@type": "Offer",
            price: "299",
            priceCurrency: "INR",
          },
        },
      ],
    }),
  }}
/>
    <div className="min-h-screen text-white">
      <BackgroundGlow />

      <main className="relative">
        <HeroSection />
        <WorkflowSection />
        <AiNodesSection />
        <PricingSection />
        <ContactSection />
      </main>

      <WhatsAppButton />
    </div>
  );
}
