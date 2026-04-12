import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "D5 Render Cloud Workstation | RTX GPU Rendering",
  description:
    "Run D5 Render on RTX GPUs in the cloud. Choose 16GB–48GB VRAM workstations and render faster without upgrading hardware.",
};

export default function Page() {
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "D5 Render RTX Cloud Workstation",
      description:
        "High-performance RTX GPU workstation for D5 Render with 16GB to 48GB VRAM options.",
      brand: {
        "@type": "Brand",
        name: "Coreframe Cloud",
      },
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "90",
        highPrice: "299",
        priceCurrency: "INR",
      },
    }),
  }}
/>  
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Do I need to install D5 Render?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. The workstation is pre-configured. You can start rendering immediately.",
          },
        },
        {
          "@type": "Question",
          name: "How is pricing calculated?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You are charged hourly based on GPU configuration. No upfront cost.",
          },
        },
        {
          "@type": "Question",
          name: "Is my data secure?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Files are transferred to the provisioned server only and removed after termination.",
          },
        },
      ],
    }),
  }}
/>

return (
    <div className="max-w-5xl mx-auto px-6 py-20 text-white">

      <h1 className="text-4xl font-semibold">
        D5 Render Cloud Workstation (RTX GPU)
      </h1>

      <p className="mt-6 text-white/70">
        Run D5 Render on high-performance RTX GPUs without upgrading your local system.
      </p>

      {/* INTERNAL LINKS */}
      <div className="mt-8 text-emerald-300 space-y-2">
        <a href="/" className="block hover:underline">
          ← Back to Home
        </a>

        <a href="/#pricing" className="block hover:underline">
          View pricing
        </a>

        <a href="/#reserve-access" className="block hover:underline">
          Reserve access
        </a>
      </div>

    </div>
  );
}
