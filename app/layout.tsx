import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coreframe Cloud | D5 Render Cloud Workstation",
  description:
    "Run D5 Render on RTX GPUs in the cloud. Launch ready-to-use Windows workstations, render faster, and download results. Start from ₹90/hr.",

  keywords: [
    "D5 render cloud",
    "RTX render workstation",
    "cloud rendering for architects",
    "GPU rendering service India",
    "D5 render GPU server",
  ],

  openGraph: {
    title: "D5 Render Cloud Workstation",
    description:
      "Launch RTX-powered rendering in under 2 minutes. No setup. No commitment.",
    url: "https://coreframecloud.com",
    siteName: "Coreframe Cloud",
    type: "website",
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
