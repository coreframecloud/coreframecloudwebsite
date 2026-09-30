import type { Metadata } from "next";
import { Inter, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";

/**
 * Three families, one job each: the serif carries display headings, Inter
 * carries body copy, the monospace carries every label, control and hard fact.
 *
 * next/font self-hosts these at build time, so there is no render-blocking
 * request to fonts.googleapis.com and no layout shift. The CSS variables are
 * consumed by @theme in globals.css (--font-display / --font-sans / --font-mono),
 * which is what turns them into font-display / font-sans / font-mono utilities.
 */
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-source-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});
import { COMPANY_MAPS_URL, COMPANY_YOUTUBE_URL, COMPANY_INSTAGRAM_URL } from "@/lib/company";
import Script from "next/script";
import { AttributionCapture } from "@/components/attribution-capture";
import { WhatsAppButton } from "@/components/home/whatsapp-button";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { SiteHeader } from "@/components/home/site-header";
import { BareOnLanding } from "@/components/layout/bare-on-landing";
import { SiteFooter } from "@/components/home/site-footer";
import { TrialStrip } from "@/components/home/trial-strip";
import { getRateCard, planTiers } from "@/lib/rate-card";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.coreframecloud.com"),
  title: {
    default: "Coreframe Cloud — RTX 5080 GPU workstations by the hour, India",
    template: "%s | Coreframe Cloud",
  },
  description:
    "Coreframe Cloud rents full Windows RTX 5080 workstations by the minute from Bengaluru, India, for D5 Render, Lumion, Enscape, 3ds Max, Blender and GPU CFD. INR billing with GST included, persistent project storage, no hardware to buy.",
  keywords: [
    "faster D5 Render cloud India",
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
  // No canonical here on purpose. A layout-level canonical of "/" is inherited
  // by every page that does not set its own, which told Google that /solutions
  // and /request-demo were copies of the homepage. Each page sets its own.
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
    url: "https://www.coreframecloud.com",
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

/**
 * Async because the Service node's offers must come from the live rate card.
 *
 * They used to be three hardcoded Offer nodes — ₹399/GPU-hour, ₹19,000/month
 * and ₹1,999/TB — emitted on EVERY page of the site. Structured data is the
 * worst place to carry a stale price: Google reads it as a machine-readable
 * commitment, shows it in results, and answer engines quote it verbatim, so a
 * price change in the admin panel would have left the rest of the internet
 * repeating the old number long after the pages themselves were corrected.
 *
 * When the control plane is unreachable the Service node is emitted with no
 * `offers` at all. A service without a published price is ordinary and valid;
 * a service with the wrong published price is a quote we might not honour.
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const rateCard = await getRateCard();
  const adhoc = rateCard?.gpus.find((g) => !g.quote_on_request && g.hourly_rate_rupees != null);
  const tiers = planTiers(rateCard);
  const storagePerTb = rateCard?.storage_rate_rupees_per_tb_month ?? null;

  const offers = [
    adhoc?.hourly_rate_rupees != null && {
      "@type": "Offer",
      name: "Ad-hoc GPU-hour",
      price: String(Math.round(adhoc.hourly_rate_rupees)),
      priceCurrency: "INR",
      valueAddedTaxIncluded: true,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: String(Math.round(adhoc.hourly_rate_rupees)),
        priceCurrency: "INR",
        valueAddedTaxIncluded: true,
        unitText: "GPU-hour",
      },
    },
    tiers[0] && {
      "@type": "Offer",
      name: `Committed Monthly — ${tiers[0].name}`,
      price: String(Math.round(tiers[0].monthly_fee_rupees)),
      priceCurrency: "INR",
      valueAddedTaxIncluded: true,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: String(Math.round(tiers[0].monthly_fee_rupees)),
        priceCurrency: "INR",
        valueAddedTaxIncluded: true,
        unitText: "month",
      },
    },
    storagePerTb != null && storagePerTb > 0 && {
      "@type": "Offer",
      name: "Persistent NAS storage",
      price: String(Math.round(storagePerTb)),
      priceCurrency: "INR",
      valueAddedTaxIncluded: true,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: String(Math.round(storagePerTb)),
        priceCurrency: "INR",
        valueAddedTaxIncluded: true,
        unitText: "TB per month",
      },
    },
  ].filter(Boolean);

  const serviceDescription =
    "On-demand Windows GPU workstations with NVIDIA RTX 5080 (16 GB GDDR7) for " +
    "D5 Render, Lumion, Enscape, SolidWorks and 3ds Max, hosted in Bengaluru. " +
    "Billed per minute of actual use, with 18% GST included in every published rate.";

  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${inter.variable} ${plexMono.variable}`}
    >
      <body className="bg-paper text-ink antialiased">
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
                  "@id": "https://www.coreframecloud.com/#organization",
                  /**
                   * BRAND NAME FIRST, legal name beside it.
                   *
                   * "Coreframe Cloud" is what people type and what assistants
                   * are asked about; the Pvt Ltd name is what the GSTIN and the
                   * invoices carry. Schema has slots for both, and a GEO check
                   * on 20 Sep 2026 found "what is Coreframe Cloud" returning
                   * CloudFrame, Coreframe Technologies, Coreframesolutions,
                   * CoreFrame Studio and a PyPI package -- five other entities
                   * and not us. disambiguatingDescription exists for exactly
                   * that, and the identifiers below are the part no
                   * same-named company can copy.
                   */
                  name: "Coreframe Cloud",
                  legalName: "Coreframe Compute Labs Private Limited",
                  alternateName: ["Coreframe", "Coreframe Compute Labs"],
                  disambiguatingDescription:
                    "Coreframe Cloud is the cloud GPU workstation service operated by Coreframe Compute Labs Private Limited of Bengaluru, India (CIN U63119KA2026PTC220789). It is unrelated to CloudFrame, Coreframe Technologies, Coreframe Solutions, CoreFrame Studio, or the coreframe package on PyPI.",
                  url: "https://www.coreframecloud.com",
                  logo: "https://www.coreframecloud.com/icon.png",
                  /**
                   * hasMap is what actually TAGS the Google Business Profile.
                   * The same URL is in sameAs below, but sameAs only says
                   * "this profile is also us" — it is an identity claim about
                   * a page. hasMap says "this is the map of this place",
                   * which is what a local result, a map pack and an assistant
                   * answering "where are they" read.
                   *
                   * No `geo` block: latitude and longitude would have to be
                   * measured, and a coordinate guessed from an address is
                   * worse than none — it puts a pin on the wrong building
                   * with full confidence.
                   */
                  hasMap: COMPANY_MAPS_URL,
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
                  foundingDate: "2026",
                  founder: { "@type": "Person", name: "Sowjanya Pandala" },
                  /**
                   * Statutory identifiers. These are the strongest
                   * disambiguation signal available: a CIN resolves to exactly
                   * one company in the MCA register, so anything quoting it is
                   * unambiguously us.
                   */
                  identifier: [
                    { "@type": "PropertyValue", propertyID: "CIN", value: "U63119KA2026PTC220789" },
                    { "@type": "PropertyValue", propertyID: "GSTIN", value: "29AANCC8401D1ZO" },
                  ],
                  knowsAbout: [
                    "cloud GPU workstations",
                    "architectural visualisation",
                    "real-time rendering",
                    "GPU-accelerated CFD",
                    "NVIDIA RTX 5080",
                  ],
                  /**
                   * Add a profile here only once it exists and resolves. An
                   * URL to a page that 404s is a broken identity claim, which
                   * is worse than an empty list. LinkedIn, YouTube, Crunchbase
                   * and the Google Business Profile go in as they are created.
                   */
                  sameAs: [
                    COMPANY_INSTAGRAM_URL,
                    COMPANY_MAPS_URL,
                    COMPANY_YOUTUBE_URL,
                  ],
                  contactPoint: [
                    {
                      "@type": "ContactPoint",
                      contactType: "sales",
                      email: "admin@coreframecloud.com",
                      telephone: "+916366889488",
                      areaServed: "IN",
                      availableLanguage: ["en", "hi", "te", "kn"],
                    },
                    {
                      "@type": "ContactPoint",
                      contactType: "technical support",
                      email: "support@coreframecloud.com",
                      areaServed: "IN",
                    },
                  ],
                  priceRange: "₹₹",
                },
                {
                  "@type": "Service",
                  "@id": "https://www.coreframecloud.com/#gpu-workstation-service",
                  name: "RTX 5080 Cloud GPU Workstation",
                  provider: { "@id": "https://www.coreframecloud.com/#organization" },
                  description: serviceDescription,
                  areaServed: "IN",
                  ...(offers.length ? { offers } : {}),
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
        <BareOnLanding>
          <TrialStrip />
          <SiteHeader />
        </BareOnLanding>
        <AttributionCapture />
        {children}
        <SiteFooter />

        {/* Floating WhatsApp button — every page except the paid landing
            pages, where it covers the terms line and offers a way out. */}
        <BareOnLanding>
        <WhatsAppButton />
        </BareOnLanding>
        <SpeedInsights />
      </body>
    </html>
  );
}
