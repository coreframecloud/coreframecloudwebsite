import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Poppins } from "next/font/google";

/**
 * Three families, one job each (11 Oct 2026): Poppins carries every heading,
 * Inter carries body copy, the monospace carries fact blocks.
 *
 * next/font self-hosts these at build time, so there is no render-blocking
 * request to fonts.googleapis.com and no layout shift. The CSS variables are
 * consumed by @theme in globals.css (--font-display / --font-sans / --font-mono),
 * which is what turns them into font-display / font-sans / font-mono utilities.
 */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

/** Geometric sans for every heading (the 11 Oct 2026 redesign). */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-poppins",
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
import { WhatsAppClickTracker } from "@/components/analytics/whatsapp-click-tracker";
import { WhatsAppButton } from "@/components/home/whatsapp-button";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { SiteHeader } from "@/components/home/site-header";
import { BareOnLanding } from "@/components/layout/bare-on-landing";
import { SiteFooter } from "@/components/home/site-footer";
import { ScrollReveal } from "@/components/scroll-reveal";
import { IntroStrip } from "@/components/home/intro-strip";
import { getIntroOffer, hoursLabel, getRateCard, planTiers } from "@/lib/rate-card";

/**
 * Ad-platform tags, both optional and both off unless their env var is set at
 * BUILD time (NEXT_PUBLIC_* is inlined by `next build`). Validated to the shape
 * each platform issues, because the value is interpolated into an inline
 * script: a malformed or hostile value loads nothing rather than running.
 *
 * Conversions themselves are sent from lib/analytics.ts (trackConversion).
 */
const META_PIXEL_ID = /^\d{5,20}$/.test(process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "")
  ? process.env.NEXT_PUBLIC_META_PIXEL_ID
  : undefined;
const GOOGLE_ADS_ID = /^AW-\d{5,20}$/.test(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "")
  ? process.env.NEXT_PUBLIC_GOOGLE_ADS_ID
  : undefined;
/**
 * GA4 measurement id. Env-driven since 12 Oct 2026 so a new GA4 property can be
 * swapped in from Vercel without a code change; falls back to the property the
 * site has reported to since launch, so an unset variable never silently
 * switches analytics off. Set NEXT_PUBLIC_GA4_ID="off" to disable GA4 (Google
 * Ads still loads through gtag.js when NEXT_PUBLIC_GOOGLE_ADS_ID is set).
 */
const GA4_ENV = process.env.NEXT_PUBLIC_GA4_ID ?? "G-BX4WY4GBSZ";
const GA4_ID = /^G-[A-Z0-9]{6,16}$/.test(GA4_ENV) ? GA4_ENV : undefined;
/** The id gtag.js is loaded with: GA4 if present, else the Ads tag. */
const GTAG_LOADER_ID = GA4_ID ?? GOOGLE_ADS_ID;

/**
 * Google Consent Mode v2 defaults, set BEFORE any `config` call.
 *
 * Visitors in the EEA, the UK and Switzerland start with every storage type
 * denied: Google then sends cookieless pings only, which is what Google Ads
 * requires for traffic from those regions. Everyone else (India first) starts
 * granted -- India's DPDP Act asks for notice and purpose limitation, which the
 * privacy policy covers, and does not require a cookie-consent banner for
 * analytics. If a consent banner is added later it calls
 * gtag('consent','update',{...}) and nothing here changes.
 */
const CONSENT_DENIED_REGIONS = [
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV",
  "LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","IS","LI","NO","GB","CH",
];

export const metadata: Metadata = {
  metadataBase: new URL("https://www.coreframecloud.com"),
  title: {
    default: "Coreframe Cloud — RTX 5080 cloud workstations, India",
    template: "%s | Coreframe Cloud",
  },
  description:
    "Rent a full Windows RTX 5080 workstation by the minute from Bengaluru for D5 Render, Lumion, Enscape, 3ds Max and Blender. GST included, files persist.",
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
  // Meta Business domain verification (business 1473783351254331, domain id 883377961527807,
  // 12 Oct 2026). Must stay in the server-rendered <head>; removing it un-verifies the domain.
  verification: {
    other: { "facebook-domain-verification": "tl593t712tlvnsxy8dcfr223zas7lt" },
  },
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
  // The share image is app/opengraph-image.tsx (1200x630). It is a file
  // convention, so it reaches every route -- including the pages that set
  // their own `openGraph` object, which used to replace this one and leave
  // them with no image at all.
  openGraph: {
    title: "Coreframe Cloud — RTX GPU Workstations for Design Studios, India",
    description:
      "RTX 5080 GPU workstations on demand for D5 Render, Lumion, Enscape. Pay-as-you-go or committed plans. Hosted in Bengaluru.",
    url: "https://www.coreframecloud.com",
    siteName: "Coreframe Cloud",
    locale: "en_IN",
    type: "website",
  },
  // summary_large_image with no explicit image: X falls back to og:image.
  // The old description ("managed AI infrastructure") described a product
  // Coreframe does not sell.
  twitter: {
    card: "summary_large_image",
    title: "Coreframe Cloud",
    description:
      "Windows RTX 5080 workstations rented by the minute, streamed to the laptop you already own. Hosted in Bengaluru, India.",
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
  const intro = getIntroOffer(rateCard);

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
    // Every published tier, not just the cheapest: "how much is the monthly
    // plan" has as many answers as there are tiers, and an engine given one
    // will quote it for all of them.
    ...tiers.map((t) => ({
      "@type": "Offer",
      name: `Monthly plan — ${t.name}`,
      ...(t.included_gpu_hours
        ? { description: `${t.included_gpu_hours} GPU-hours included per month.` }
        : {}),
      price: String(Math.round(t.monthly_fee_rupees)),
      priceCurrency: "INR",
      valueAddedTaxIncluded: true,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: String(Math.round(t.monthly_fee_rupees)),
        priceCurrency: "INR",
        valueAddedTaxIncluded: true,
        unitText: "month",
      },
    })),
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
    // The intro offer, only while the control plane says it is enabled.
    intro && {
      "@type": "Offer",
      name: `Intro offer — first top-up, ${hoursLabel(intro.hours)}${intro.gpuName ? ` of ${intro.gpuName}` : ""}`,
      description:
        `First wallet top-up of ${intro.priceRupees} INR buys ${hoursLabel(intro.hours)} of GPU time` +
        `${intro.validityDays ? `, valid ${intro.validityDays} days` : ""}. One per customer.`,
      price: String(Math.round(intro.priceRupees)),
      priceCurrency: "INR",
      valueAddedTaxIncluded: true,
    },
  ]
    .filter(Boolean)
    .map((o) => ({ ...(o as object), url: "https://www.coreframecloud.com/pricing" }));

  const serviceDescription =
    "On-demand Windows GPU workstations with NVIDIA RTX 5080 (16 GB GDDR7) for " +
    "D5 Render, Lumion, Enscape, 3ds Max, Blender and Unreal Engine, hosted in Bengaluru. " +
    "Billed per minute of actual use, with 18% GST included in every published rate.";

  return (
    <html
      lang="en-IN"
      className={`${inter.variable} ${plexMono.variable} ${poppins.variable}`}
    >
      <body className="bg-paper text-ink antialiased">
        {/* Google tag (GA4 + Google Ads), with Consent Mode v2 defaults.
            The consent defaults and the dataLayer shim run first, in the same
            inline script, so they precede every config and event call. */}
        {GTAG_LOADER_ID ? (
          <>
            <Script id="google-consent-and-tag" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('consent', 'default', {
                  ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
                  analytics_storage: 'denied', wait_for_update: 500,
                  region: ${JSON.stringify(CONSENT_DENIED_REGIONS)}
                });
                gtag('consent', 'default', {
                  ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted',
                  analytics_storage: 'granted'
                });
                gtag('set', 'url_passthrough', true);
                gtag('js', new Date());${GA4_ID ? `
                gtag('config', '${GA4_ID}');` : ""}${GOOGLE_ADS_ID ? `
                gtag('config', '${GOOGLE_ADS_ID}');` : ""}
              `}
            </Script>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GTAG_LOADER_ID}`}
              strategy="afterInteractive"
            />
          </>
        ) : null}

        {/* Meta pixel — only when NEXT_PUBLIC_META_PIXEL_ID is set.
            lazyOnload (12 Oct 2026): Lighthouse on mobile measured fbevents.js
            blocking the main thread for ~3.2 s on /pricing, the largest single
            cost on the page. Its conversions (sign-up, purchase) fire long
            after load, so waiting for onload loses nothing that matters. The
            Google tag stays afterInteractive: Ads attribution needs the gclid
            read on the landing page view. */}
        {META_PIXEL_ID ? (
          <Script id="meta-pixel" strategy="lazyOnload">
            {`
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
              document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
        ) : null}

        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="lazyOnload">
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
                  // India first, but since 10 Oct 2026 international cards are
                  // accepted and no Indian ID is asked for.
                  areaServed: [
                    { "@type": "Country", name: "India" },
                    { "@type": "Place", name: "Worldwide" },
                  ],
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
                  "@type": "WebSite",
                  "@id": "https://www.coreframecloud.com/#website",
                  url: "https://www.coreframecloud.com",
                  name: "Coreframe Cloud",
                  alternateName: ["Coreframe", "coreframecloud.com"],
                  inLanguage: "en-IN",
                  publisher: { "@id": "https://www.coreframecloud.com/#organization" },
                },
                {
                  "@type": "Service",
                  "@id": "https://www.coreframecloud.com/#gpu-workstation-service",
                  name: "RTX 5080 Cloud GPU Workstation",
                  serviceType: "Cloud GPU workstation rental",
                  category: "Cloud computing",
                  brand: { "@type": "Brand", name: "Coreframe Cloud" },
                  url: "https://www.coreframecloud.com/pricing",
                  provider: { "@id": "https://www.coreframecloud.com/#organization" },
                  description: serviceDescription,
                  areaServed: [
                    { "@type": "Country", name: "India" },
                    { "@type": "Place", name: "Worldwide" },
                  ],
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
          <IntroStrip />
          <SiteHeader />
        </BareOnLanding>
        <AttributionCapture />
        <WhatsAppClickTracker />
        {children}
        <SiteFooter />
        <ScrollReveal />

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
