import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import VerifyFlow from "../verify-flow";

export const metadata: Metadata = {
  title: "Finishing Verification — Coreframe Cloud",
  robots: { index: false, follow: false },
};

/**
 * DigiLocker redirects here after the customer approves (or declines) consent.
 * `resume` makes the flow poll the control plane immediately instead of showing
 * the "start verification" button again.
 */
export default function VerifyCompletePage() {
  return (
    <div className="relative min-h-screen text-white">
      <BackgroundGlow />
      <main className="relative flex min-h-screen items-center justify-center px-4 py-24">
        <VerifyFlow resume />
      </main>
    </div>
  );
}
