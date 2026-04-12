import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://coreframecloud.com"),

  title: {
    default: "Coreframe Cloud | D5 Render Cloud Workstation",
    template: "%s | Coreframe Cloud",
  },

  description:
    "Run D5 Render on RTX GPUs in the cloud. Launch ready-to-use workstations, render faster, and download results. Start from ₹90/hr.",

  keywords: [
    "D5 render cloud",
    "RTX render workstation",
    "cloud rendering for architects",
    "GPU rendering India",
  ],

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "Coreframe Cloud",
    description:
      "D5 Render Ready Workstations with RTX GPUs. Launch in minutes.",
    url: "https://coreframecloud.com",
    siteName: "Coreframe Cloud",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Coreframe Cloud",
    description:
      "RTX-powered D5 Render workstations in the cloud. Start rendering instantly.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
