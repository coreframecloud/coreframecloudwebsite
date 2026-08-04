import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import VerifyFlow from "./verify-flow";

export const metadata: Metadata = {
  title: "Verify Your Identity — Coreframe Cloud",
  description:
    "Complete a one-time identity check with DigiLocker to activate your Coreframe Cloud account.",
  alternates: { canonical: "/verify" },
  robots: { index: false, follow: false },
};

export default function VerifyPage() {
  return (
    <div className="relative min-h-screen text-white">
      <BackgroundGlow />
      <main className="relative flex min-h-screen items-center justify-center px-4 py-24">
        <VerifyFlow />
      </main>
    </div>
  );
}
