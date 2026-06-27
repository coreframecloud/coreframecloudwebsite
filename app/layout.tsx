import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://coreframecloud.com"),
  title: {
    default: "Coreframe Cloud | 5× Faster Rendering & CFD in Minutes — GPU Cloud India",
    template: "%s | Coreframe Cloud",
  },
  description:
    "Want renders 5× faster? CFD analysis in minutes instead of days? Coreframe gives you managed RTX GPU workstations for D5 Render, Lumion, Enscape — and H100/RTX 6000 Pro for Ansys CFD. Pay per hour. Hosted in Bengaluru, India.",
  keywords: [
    "faster D5 Render cloud India",
    "5x faster rendering India",
    "CFD simulation faster India",
    "Ansys CFD cloud GPU India",
    "cloud GPU workstation India",
    "RTX rendering cloud India",
    "Lumion cloud GPU India",
    "Enscape cloud rendering India",
    "GPU workstation rent India",
    "cloud render farm India",
    "fast CFD analysis India",
    "GPU accelerated CFD India",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", rel: "icon", sizes: "48x48" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    title: "Coreframe Cloud — RTX GPU Workstations for Design Studios, India",
    description:
      "RTX 5070 Ti GPU workstations on demand for D5 Render, Lumion, Enscape. Pay-as-you-go or committed plans. Hosted in Bengaluru.",
    url: "https://coreframecloud.com",
    siteName: "Coreframe Cloud",
    type: "website",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Coreframe Cloud",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Coreframe Cloud",
    description:
      "Cloud GPU workstations and managed AI infrastructure for professional teams.",
    images: ["/icon.png"],
  },
  other: {
    "contact:email": "admin@coreframecloud.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#030b16] text-white antialiased">
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BX4WY4GBSZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'G-BX4WY4GBSZ');
          `}
        </Script>

        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "wb428x6n53");
          `}
        </Script>

        {/* Structured data — Organisation + LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": ["Organization", "LocalBusiness"],
                  "@id": "https://coreframecloud.com/#organization",
                  name: "Coreframe Compute Labs Private Limited",
                  alternateName: "Coreframe Cloud",
                  url: "https://coreframecloud.com",
                  logo: "https://coreframecloud.com/icon.png",
                  description:
                    "RTX 5070 Ti GPU workstations on demand for D5 Render, Lumion, Enscape, and 3D visualisation studios. Hosted in Bengaluru, India.",
                  telephone: "+916366889488",
                  email: "admin@coreframecloud.com",
                  address: {
                    "@type": "PostalAddress",
                    streetAddress:
                      "Innov8, Prestige Tech Platina, 11th Floor, No. 32/2, 34/1, Kadubeesanahalli",
                    addressLocality: "Bengaluru",
                    addressRegion: "Karnataka",
                    postalCode: "560087",
                    addressCountry: "IN",
                  },
                  areaServed: "IN",
                  sameAs: [],
                  priceRange: "₹₹",
                },
                {
                  "@type": "Service",
                  "@id": "https://coreframecloud.com/#gpu-workstation-service",
                  name: "RTX 5070 Ti Cloud GPU Workstation",
                  provider: { "@id": "https://coreframecloud.com/#organization" },
                  description:
                    "On-demand Windows GPU workstations with NVIDIA RTX 5070 Ti (16 GB GDDR7) for D5 Render, Lumion, Enscape, SolidWorks, and 3ds Max. Pay-as-you-go from ₹400/hr or committed plans from ₹24,000/month.",
                  areaServed: "IN",
                  offers: [
                    {
                      "@type": "Offer",
                      name: "Ad-hoc GPU-hour",
                      price: "400",
                      priceCurrency: "INR",
                      priceSpecification: {
                        "@type": "UnitPriceSpecification",
                        price: "400",
                        priceCurrency: "INR",
                        unitText: "GPU-hour",
                      },
                    },
                    {
                      "@type": "Offer",
                      name: "Committed Monthly — Studio",
                      price: "24000",
                      priceCurrency: "INR",
                      priceSpecification: {
                        "@type": "UnitPriceSpecification",
                        price: "24000",
                        priceCurrency: "INR",
                        unitText: "month",
                      },
                    },
                  ],
                },
              ],
            }),
          }}
        />

        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
