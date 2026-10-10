import type { Metadata } from "next";
import VerifyFlow from "../verify-flow";

export const metadata: Metadata = {
  title: "Finish Sign-up",
  robots: { index: false, follow: false },
};

/**
 * Was DigiLocker's return URL. Identity checks are retired (10 Oct 2026), but
 * a consent link opened before the switch still lands here, so it shows the
 * same finish-sign-up flow as /verify rather than a 404.
 */
export default function VerifyCompletePage() {
  return (
    <div className="relative min-h-screen text-ink">
      <div className="cf-aurora" />
      <main className="relative flex min-h-screen items-center justify-center px-4 py-16 sm:py-24">
        <VerifyFlow />
      </main>
    </div>
  );
}
