import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { TrialStrip } from "@/components/home/trial-strip";

export const metadata: Metadata = {
  metadataBase: new URL("https://coreframecloud.com"),
  title: {
    default: "Coreframe Cloud | 5× Faster Rendering & CFD in Minutes — GPU Cloud India",
    template: "%s | Coreframe Cloud",
  },
  description:
    "Want renders 5× faster? CFD analysis in minutes instead of days? Coreframe gives you managed RTX 5080 GPU workstations for D5 Render, Lumion, Enscape — plus managed per-job Ansys CFD. Pay per hour. Hosted in Bengaluru, India.",
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
      "RTX 5080 GPU workstations on demand for D5 Render, Lumion, Enscape. Pay-as-you-go or committed plans. Hosted in Bengaluru.",
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
                    "RTX 5080 GPU workstations on demand for D5 Render, Lumion, Enscape, and 3D visualisation studios. Hosted in Bengaluru, India.",
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
                  name: "RTX 5080 Cloud GPU Workstation",
                  provider: { "@id": "https://coreframecloud.com/#organization" },
                  description:
                    "On-demand Windows GPU workstations with NVIDIA RTX 5080 (16 GB GDDR7) for D5 Render, Lumion, Enscape, SolidWorks, and 3ds Max. Pay-as-you-go from ₹399/hr or committed plans from ₹19,000/month. All prices include 18% GST.",
                  areaServed: "IN",
                  offers: [
                    {
                      "@type": "Offer",
                      name: "Ad-hoc GPU-hour",
                      price: "399",
                      priceCurrency: "INR",
                      valueAddedTaxIncluded: true,
                      priceSpecification: {
                        "@type": "UnitPriceSpecification",
                        price: "399",
                        priceCurrency: "INR",
                        valueAddedTaxIncluded: true,
                        unitText: "GPU-hour",
                      },
                    },
                    {
                      "@type": "Offer",
                      name: "Committed Monthly — Studio",
                      price: "19000",
                      priceCurrency: "INR",
                      valueAddedTaxIncluded: true,
                      priceSpecification: {
                        "@type": "UnitPriceSpecification",
                        price: "19000",
                        priceCurrency: "INR",
                        valueAddedTaxIncluded: true,
                        unitText: "month",
                      },
                    },
                    {
                      "@type": "Offer",
                      name: "Persistent NAS storage",
                      price: "1999",
                      priceCurrency: "INR",
                      valueAddedTaxIncluded: true,
                      priceSpecification: {
                        "@type": "UnitPriceSpecification",
                        price: "1999",
                        priceCurrency: "INR",
                        valueAddedTaxIncluded: true,
                        unitText: "TB per month",
                      },
                    },
                  ],
                },
              ],
            }),
          }}
        />

        {/*
          Above the header, so it is the first thing on every page — including
          the SEO landing pages (/d5-render, /enscape-cloud-gpu) that a search
          visitor arrives on without ever seeing the homepage. Those carry the
          highest intent, and until now the offer was only on the front page.
        */}
        <TrialStrip />
        <SiteHeader />
        {children}
        <SiteFooter />

        {/* Floating WhatsApp button — visible on all pages */}
        <a
          href="https://wa.me/916366889488"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#25D366",
            color: "#fff",
            borderRadius: "999px",
            padding: "12px 20px 12px 14px",
            boxShadow: "0 4px 20px rgba(37,211,102,0.4)",
            textDecoration: "none",
            fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            fontWeight: 600,
            fontSize: "14px",
            lineHeight: 1,
          }}
        >
          {/* WhatsApp SVG icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "11px", fontWeight: 400, opacity: 0.85 }}>Chat with us</span>
            <span>WhatsApp</span>
          </span>
        </a>
      </body>
    </html>
  );
}
