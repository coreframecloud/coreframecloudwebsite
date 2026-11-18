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
import { COMPANY_MAPS_URL, COMPANY_YOUTUBE_URL, COMPANY_INSTAGRAM_URL, COMPANY_LINKEDIN_URL, COMPANY_SAASHUB_URL } from "@/lib/company";
import Script from "next/script";
import { headers } from "next/headers";
import { AttributionCapture } from "@/components/attribution-capture";
import { WhatsAppClickTracker } from "@/components/analytics/whatsapp-click-tracker";
import { WebEvents } from "@/components/analytics/web-events";
import { WhatsAppButton } from "@/components/home/whatsapp-button";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ConsentBanner } from "@/components/consent/consent-banner";
import "./globals.css";
import { SiteHeader } from "@/components/home/site-header";
import { BareOnLanding, FloatOffOnSignup, NoFooterOnAdPages, NoStripOnAppPages } from "@/components/layout/bare-on-landing";
import { SiteFooter } from "@/components/home/site-footer";
import { ScrollReveal } from "@/components/scroll-reveal";
import { IntroStrip } from "@/components/home/intro-strip";
import { getIntroOffer, getUsdIntroOffer, hoursLabel, getRateCard, ladderRanges, planTiers } from "@/lib/rate-card";
import { usdRates } from "@/lib/money";
import { requestCurrency } from "@/lib/display-currency";
import { FREE_PREVIEWS_PER_DAY, inr, studioPrices, usd } from "@/lib/studio-prices";
import { gpuLadderOffers, regionalOffers } from "@/lib/seo";
import { CFD_PREPROCESS_INR } from "@/lib/cfd-prices";

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
 * The EEA, the UK and Switzerland. Since the consent bar (10 Nov 2026) every
 * visitor starts with Consent Mode v2 denied and no tag loaded until Accept;
 * this list now only keeps the first-party beacon anonymous in these regions
 * even after Accept (lib/web-events.ts), as it was before the bar.
 */
const CONSENT_DENIED_REGIONS = [
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV",
  "LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","IS","LI","NO","GB","CH",
];

export const metadata: Metadata = {
  metadataBase: new URL("https://www.coreframecloud.com"),
  title: {
    default: "Coreframe Cloud: Cloud Virtual Workstations with a GPU",
    template: "%s | Coreframe Cloud",
  },
  description:
    "Ready-to-work cloud virtual workstations: Windows, an RTX GPU and your design software preinstalled, billed per minute. Tier III data centre, data in India.",
  keywords: [
    "cloud virtual workstation",
    "ready-to-use Windows cloud workstation",
    "remote GPU workstation",
    "faster D5 Render cloud India",
    "CFD simulation faster India",
    "cloud GPU workstation India",
    "cloud virtual workstation India",
    "virtual workstation with GPU",
    "RTX rendering cloud India",
    "Lumion cloud GPU India",
    "Enscape cloud rendering India",
    "GPU workstation rent India",
    "cloud render farm India",
    "fast CFD analysis India",
    "GPU accelerated CFD India",
    "CFD pressure drop duct",
    "pipe pressure drop CFD India",
    "floor plan to interior render",
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
    title: "Coreframe Cloud: ready-to-work cloud virtual workstations",
    description:
      "A ready-to-work cloud virtual workstation in four clicks: a Windows desktop with a GPU and your design software installed, billed per minute. Hosted in a Tier III data centre in India; customers worldwide.",
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
      "Ready-to-work cloud virtual workstations in four clicks: Windows, a GPU and design software, billed per minute. Tier III data centre in India; customers worldwide.",
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
  // This request's CSP nonce (proxy.ts, lib/csp.ts). The tags below are
  // inline, so they run only because they carry it; what they load runs under
  // 'strict-dynamic'. Reading it makes the page render per request: the
  // deliberate price of a CSP with no 'unsafe-inline' (owner, 17 Oct 2026).
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  // The funnel beacon's consent flag (proxy.ts sets x-cf-country from
  // CF-IPCountry): the same regions the Google tag starts denied for, so a
  // visitor there gets no visitor cookie and no identifying row.
  const visitorCountry = (await headers()).get("x-cf-country") ?? "";
  const consentDenied = CONSENT_DENIED_REGIONS.includes(visitorCountry);
  // The visitor's display currency (proxy.ts): the strip, the footer's tax
  // line and the text fields below show that currency only (owner, 18 Oct 2026).
  const currency = await requestCurrency();
  const usdView = currency === "USD";
  const rateCard = await getRateCard();
  const usdCard = usdRates(rateCard);
  const tiers = planTiers(rateCard);
  const storagePerTb = rateCard?.storage_rate_rupees_per_tb_month ?? null;
  const intro = getIntroOffer(rateCard);
  const introUsd = getUsdIntroOffer(rateCard);
  const studio = studioPrices(rateCard);

  const offers = [
    // One Offer pair (INR in India, USD elsewhere) per public GPU on the
    // ladder (owner, 21 Oct 2026), each with its own dollar rate.
    ...gpuLadderOffers(rateCard, "https://www.coreframecloud.com/pricing"),
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
    // The intro offers, each only while the control plane publishes it: the
    // rupee one for accounts billed in India, the dollar one (usd.intro_offer,
    // owner 18 Oct 2026) everywhere else. The text names an amount only in the
    // page's own currency (one currency per visitor, 18 Oct 2026).
    intro && {
      "@type": "Offer",
      name: `Intro offer — first top-up, ${hoursLabel(intro.hours)}${intro.gpuName ? ` of ${intro.gpuName}` : ""}`,
      description:
        (usdView
          ? `For accounts billed in India: the first wallet top-up buys ${hoursLabel(intro.hours)} of GPU time`
          : `First wallet top-up of ${intro.price} INR buys ${hoursLabel(intro.hours)} of GPU time`) +
        `${intro.validityDays ? `, valid ${intro.validityDays} days` : ""}. One per customer.`,
      eligibleRegion: { "@type": "Country", name: "IN" },
      price: String(Math.round(intro.price)),
      priceCurrency: "INR",
      valueAddedTaxIncluded: true,
    },
    introUsd && {
      "@type": "Offer",
      name: `Intro offer — first top-up, ${hoursLabel(introUsd.hours)}${introUsd.gpuName ? ` of ${introUsd.gpuName}` : ""}`,
      description:
        (usdView
          ? `First wallet top-up of ${introUsd.price} USD buys ${hoursLabel(introUsd.hours)} of GPU time, no GST`
          : `For accounts billed outside India: the first wallet top-up buys ${hoursLabel(introUsd.hours)} of GPU time`) +
        `${introUsd.validityDays ? `, valid ${introUsd.validityDays} days` : ""}. One per customer.`,
      eligibleRegion: { "@type": "Place", name: "Worldwide" },
      ineligibleRegion: { "@type": "Country", name: "IN" },
      price: String(introUsd.price),
      priceCurrency: "USD",
      valueAddedTaxIncluded: false,
    },
  ]
    .filter(Boolean)
    .map((o) => ({ ...(o as object), url: "https://www.coreframecloud.com/pricing" }));

  const ladder = ladderRanges(rateCard);
  const serviceDescription =
    `On-demand Windows GPU workstations${ladder ? ` (${ladder.gpu}, ${ladder.vram} VRAM)` : " with dedicated NVIDIA RTX GPUs"} for ` +
    "D5 Render, Lumion, Enscape, 3ds Max, Blender and Unreal Engine, hosted in a Tier III data centre in India; " +
    "all customer data stays in India. Billed per minute of actual use. Prices in INR with GST for India, in USD " +
    "without GST elsewhere.";

  return (
    <html
      lang="en-IN"
      className={`${inter.variable} ${plexMono.variable} ${poppins.variable}`}
    >
      <head>
        {/* The blog feed (GEO check 18 Oct 2026), on every page so it is found from anywhere. */}
        <link rel="alternate" type="application/rss+xml" title="Coreframe Cloud blog" href="/blog/rss.xml" />
      </head>
      <body className="bg-paper text-ink antialiased">
        {/* The consent bar (10 Nov 2026). First in the DOM so it is the first
            Tab stop on every page; it is fixed to the bottom and the page's
            own fixed controls lift above it (globals.css .cf-consent-lift). */}
        <ConsentBanner />
        {/* Third-party tags: Google (GA4 + Ads), Meta pixel, Microsoft
            Clarity. NONE of them loads before the visitor presses Accept on
            the consent bar (owner decision 10 Nov 2026; lib/consent.ts,
            components/consent/consent-banner.tsx). This one nonced inline
            script sets Google Consent Mode v2 to denied for everyone, then
            waits: if the cf_consent cookie already says "granted" it loads
            the tags at once, otherwise on the cf-consent event. The scripts
            it inserts run under the CSP's 'strict-dynamic' (lib/csp.ts).
            The pixel and Clarity still wait for window load (they cost
            ~3 s of main thread on a phone; 12 Oct 2026). Meta events fired
            before the pixel existed are replayed from the in-memory queue
            (and the stored one, kept only with consent). */}
        <Script id="cf-consented-tags" strategy="afterInteractive" nonce={nonce}>
          {`
            (function () {
              var w = window, d = document;
              w.dataLayer = w.dataLayer || [];
              function gtag(){w.dataLayer.push(arguments);}
              w.gtag = w.gtag || gtag;
              w.gtag('consent', 'default', {
                ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
                analytics_storage: 'denied'
              });
              var loaded = false;
              function granted() { return /(?:^|; )cf_consent=granted(?:;|$)/.test(d.cookie); }
              function add(src) {
                var t = d.createElement('script'); t.async = true; t.src = src;
                d.head.appendChild(t);
              }
              function late(fn) {
                if (d.readyState === 'complete') fn(); else w.addEventListener('load', fn, { once: true });
              }
              function load() {
                if (loaded) return; loaded = true;
                w.gtag('consent', 'update', {
                  ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted',
                  analytics_storage: 'granted'
                });${GTAG_LOADER_ID ? `
                w.gtag('set', 'url_passthrough', true);
                w.gtag('js', new Date());${GA4_ID ? `
                w.gtag('config', '${GA4_ID}');` : ""}${GOOGLE_ADS_ID ? `
                w.gtag('config', '${GOOGLE_ADS_ID}');` : ""}
                add('https://www.googletagmanager.com/gtag/js?id=${GTAG_LOADER_ID}');` : ""}${META_PIXEL_ID ? `
                late(function () {
                  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(w,
                  d,'script','https://connect.facebook.net/en_US/fbevents.js');
                  w.fbq('init', '${META_PIXEL_ID}');
                  w.fbq('track', 'PageView');
                  try {
                    var q = JSON.parse(localStorage.getItem('cf_meta_queue') || '[]');
                    localStorage.removeItem('cf_meta_queue');
                    q = q.concat(w.__cfMetaQueue || []); w.__cfMetaQueue = [];
                    q.forEach(function (e) {
                      if (e && e.event && Date.now() - e.at < 864e5)
                        w.fbq('track', e.event, e.params || {}, e.eventID ? { eventID: e.eventID } : undefined);
                    });
                  } catch (err) {}
                });` : ""}
                late(function () {
                  (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                  })(w, d, "clarity", "script", "wb428x6n53");
                });
              }
              w.__cfLoadTags = load;
              if (granted()) load();
              w.addEventListener('cf-consent', function (e) { if (e && e.detail === 'granted') load(); });
            })();
          `}
        </Script>

        {/* Structured data — Organisation (not LocalBusiness: owner, 1 Nov 2026, AEO plan A3) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  /**
                   * Organization only (AEO plan, 1 Nov 2026, A3). Typed as a
                   * LocalBusiness, with India first in areaServed and a
                   * rupee priceRange, answer engines read a regional shop.
                   * The registered address stays: that is normal for a
                   * company. areaServed is Worldwide only (India is in it).
                   */
                  "@type": "Organization",
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
                    "Coreframe Cloud is the cloud virtual workstation, CFD and floor-plan rendering service operated by Coreframe Compute Labs Private Limited, India (CIN U63119KA2026PTC220789). It is unrelated to CloudFrame, Coreframe Technologies, Coreframe Solutions, CoreFrame Studio, or the coreframe package on PyPI.",
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
                    "Coreframe Cloud provides ready-to-work cloud virtual workstations worldwide: a Windows desktop with an NVIDIA RTX GPU and design software preinstalled, streamed through the Coreframe Connect app and billed per minute. Workstations are hosted in a Tier III data centre in India, and all customer data stays in India. Also CFD for ducts, pipes and HVAC rooms, and Coreframe Studio.",
                  slogan: "Ready-to-work cloud virtual workstations",
                  currenciesAccepted: "INR, USD",
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
                  // Worldwide (India is inside it): international cards since
                  // 10 Oct 2026, USD accounts since 15 Oct 2026.
                  areaServed: [{ "@type": "Place", name: "Worldwide" }],
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
                    "cloud virtual workstation",
                    "cloud GPU workstations",
                    "desktop as a service",
                    "remote GPU workstation",
                    "architectural visualisation",
                    "real-time rendering",
                    "GPU-accelerated CFD",
                    "computational fluid dynamics",
                    "duct and pipe pressure drop",
                    "interior concept rendering from floor plans",
                    "checking DWG drawings for missing dimensions",
                    "IFC model checking before CFD",
                    "NVIDIA RTX workstation GPUs",
                  ],
                  /**
                   * The three services, in the site-wide order. Studio is
                   * listed as a service but carries no Offer until it opens.
                   */
                  hasOfferCatalog: {
                    "@type": "OfferCatalog",
                    name: "Coreframe Cloud services",
                    itemListElement: [
                      { "@id": "https://www.coreframecloud.com/#gpu-workstation-service" },
                      { "@id": "https://www.coreframecloud.com/#cfd-service" },
                      { "@id": "https://www.coreframecloud.com/#studio-service" },
                    ],
                  },
                  /**
                   * Add a profile here only once it exists and resolves. An
                   * URL to a page that 404s is a broken identity claim, which
                   * is worse than an empty list. LinkedIn, YouTube, Crunchbase
                   * and the Google Business Profile go in as they are created.
                   */
                  sameAs: [
                    COMPANY_INSTAGRAM_URL,
                    COMPANY_LINKEDIN_URL,
                    COMPANY_MAPS_URL,
                    COMPANY_YOUTUBE_URL,
                    COMPANY_SAASHUB_URL,
                  ],
                  contactPoint: [
                    {
                      "@type": "ContactPoint",
                      contactType: "sales",
                      email: "admin@coreframecloud.com",
                      telephone: "+916366889488",
                      areaServed: "Worldwide",
                      availableLanguage: ["en", "hi", "te", "kn"],
                    },
                    {
                      "@type": "ContactPoint",
                      contactType: "technical support",
                      email: "support@coreframecloud.com",
                      areaServed: "Worldwide",
                    },
                  ],
                },
                /**
                 * The Connect client as its own entity (AEO plan A3): the
                 * thing "four clicks" happens in, which answer engines can
                 * attach that claim to. Free download, Windows and Mac.
                 */
                {
                  "@type": "SoftwareApplication",
                  "@id": "https://www.coreframecloud.com/#connect-app",
                  name: "Coreframe Connect",
                  applicationCategory: "BusinessApplication",
                  operatingSystem: "Windows 10, Windows 11, macOS",
                  url: "https://www.coreframecloud.com/download",
                  description:
                    "The Mac and Windows app that launches a Coreframe cloud virtual workstation in four clicks and streams its desktop to your own computer.",
                  publisher: { "@id": "https://www.coreframecloud.com/#organization" },
                  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
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
                  name: "GPU Workstations",
                  serviceType: "Cloud virtual workstation (Desktop as a Service)",
                  category: "Cloud computing",
                  brand: { "@type": "Brand", name: "Coreframe Cloud" },
                  url: "https://www.coreframecloud.com/pricing",
                  provider: { "@id": "https://www.coreframecloud.com/#organization" },
                  description: serviceDescription,
                  areaServed: [{ "@type": "Place", name: "Worldwide" }],
                  ...(offers.length ? { offers } : {}),
                },
                {
                  "@type": "Service",
                  "@id": "https://www.coreframecloud.com/#cfd-service",
                  name: "CFD for ducts and pipes",
                  serviceType: "Computational fluid dynamics, internal flow pressure drop",
                  category: "Engineering simulation",
                  brand: { "@type": "Brand", name: "Coreframe Cloud" },
                  url: "https://www.coreframecloud.com/cfd",
                  provider: { "@id": "https://www.coreframecloud.com/#organization" },
                  description:
                    "Automatic CFD internal-flow runs for ducts, pipes, bends, reducers, valves and fittings from one closed STL: a quote by email, then pressure drop, loss coefficient, a PDF report, a 3D results viewer and the data files. No CFD licence needed.",
                  areaServed: [
                    { "@type": "Country", name: "India" },
                    { "@type": "Place", name: "Worldwide" },
                  ],
                  // Both currencies (SEO review 18 Oct 2026, T2): INR for India,
                  // USD (the rate card's) everywhere else.
                  offers: regionalOffers({
                    name: "CFD pre-processing / mesh check",
                    inr: CFD_PREPROCESS_INR.small,
                    usd: usdCard.cfd_quote_fee_small,
                    url: "https://www.coreframecloud.com/cfd",
                    description: usdView
                      ? `For most duct and pipe models; very large models (over 5 million cells) ${usdCard.cfd_quote_fee_large} USD. The run is quoted by email and paid only if you accept.`
                      : `For most duct and pipe models; very large models (over 5 million cells) ${CFD_PREPROCESS_INR.large} INR. The run is quoted by email and paid only if you accept.`,
                  }),
                },
                {
                  "@type": "Service",
                  "@id": "https://www.coreframecloud.com/#studio-service",
                  name: "Coreframe Studio: floor plan to concept images",
                  serviceType: "Interior concept images from a 2D floor plan",
                  category: "Architectural visualisation",
                  brand: { "@type": "Brand", name: "Coreframe Cloud" },
                  url: "https://www.coreframecloud.com/floor-plan-to-render",
                  provider: { "@id": "https://www.coreframecloud.com/#organization" },
                  description:
                    "Pre-sale concept images for interior designers: upload a 2D DXF floor plan and get generated room images in the browser. " +
                    (usdView
                      ? `Free previews (${FREE_PREVIEWS_PER_DAY} a day, then ${usd(studio.usd.extraPreview)} each); 2K download ${usd(studio.usd.k2)}, 4K ${usd(studio.usd.k4)}.`
                      : `Free previews (${FREE_PREVIEWS_PER_DAY} a day, then ${inr(studio.inr.extraPreview)} each); 2K download ${inr(studio.inr.k2)}, 4K ${inr(studio.inr.k4)}.`),
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
          <NoStripOnAppPages>
            <IntroStrip currency={currency} />
          </NoStripOnAppPages>
          <SiteHeader />
        </BareOnLanding>
        <AttributionCapture />
        <WebEvents consentDenied={consentDenied} />
        <WhatsAppClickTracker />
        {children}
        <NoFooterOnAdPages>
          <SiteFooter currency={currency} />
        </NoFooterOnAdPages>
        <ScrollReveal />

        {/* Floating WhatsApp button — every page except /signup, where it
            covers the terms line. The ad landing pages keep it (owner, 20 Oct). */}
        <FloatOffOnSignup>
        <WhatsAppButton />
        </FloatOffOnSignup>
        <SpeedInsights />
      </body>
    </html>
  );
}
