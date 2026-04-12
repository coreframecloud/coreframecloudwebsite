import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://coreframecloud.com"),

  title: {
    default: "Coreframe Cloud | D5 Render Cloud Workstation",
    template: "%s | Coreframe Cloud",
  },

  description:
    "Run D5 Render on RTX GPUs in the cloud. Launch ready-to-use workstations, render faster, and download results. Start from ₹90/hr.",

  applicationName: "Coreframe Cloud",

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
      "D5 Render Ready Workstations with RTX GPUs. Launch in minutes.",
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
      "RTX-powered D5 Render workstations in the cloud. Start rendering instantly.",
    images: ["/icon.png"],
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
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
