import type { Metadata } from "next";
import "./globals.css";
import { ParticleBackground } from "@/components/home/particle-background";

export const metadata: Metadata = {
  title: "Coreframe Cloud",
  description:
    "Launch RTX GPU workstations and reserve AI compute nodes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="relative overflow-x-hidden bg-slate-950 text-white">
        <ParticleBackground />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
