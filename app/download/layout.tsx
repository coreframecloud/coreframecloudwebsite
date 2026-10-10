import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbList } from "@/lib/seo";

/**
 * /download is a client component, so its metadata lives here. Until 10 Oct
 * 2026 it had none: the homepage title, the homepage description and no
 * canonical, on the page people search for by name ("coreframe connect").
 *
 * SoftwareApplication describes the Connect client only. It is free to
 * download; what costs money is the workstation it connects to, which is the
 * Service node in the root layout -- so the Offer here is 0 and says so.
 * Windows only: the download page states "Windows 10 or 11, 64-bit" and no
 * other client is published, so no other OS is listed.
 */
export const metadata: Metadata = {
  title: "Download Coreframe Connect for Windows",
  description:
    "Coreframe Connect is the free Windows 10/11 app that streams your rented RTX 5080 workstation to your own PC. Sign in to download.",
  alternates: { canonical: "/download" },
};

const connectApp = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Coreframe Connect",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Windows 10, Windows 11 (64-bit)",
  description:
    "Desktop client that signs in to Coreframe Cloud and streams a rented Windows RTX 5080 workstation to your own computer.",
  url: "https://www.coreframecloud.com/download",
  publisher: { "@id": "https://www.coreframecloud.com/#organization" },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    description: "The client is free. Workstation time is billed separately from a prepaid wallet.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={connectApp} />
      <JsonLd data={breadcrumbList([{ name: "Download Coreframe Connect", path: "/download" }])} />
      {children}
    </>
  );
}
