import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://coreframecloud.com"),
  title: {
    default: "Coreframe Cloud | Cloud GPU Workstations and AI Infrastructure",
    template: "%s | Coreframe Cloud",
  },
  description:
    "Coreframe Cloud provides cloud GPU workstations, RTX rendering capacity, and managed AI infrastructure for professional teams.",
  keywords: [
    "D5 render cloud",
    "RTX render workstation",
    "cloud rendering for architects",
    "GPU rendering India",
    "D5 render ready workstation",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.ico", rel: "icon" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    title: "Coreframe Cloud",
    description:
      "Cloud GPU workstations, RTX rendering capacity, and managed AI infrastructure for professional teams.",
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

        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
