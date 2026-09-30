import type { Metadata } from "next";
import VerifyFlow from "../verify-flow";

export const metadata: Metadata = {
  title: "Finishing Verification",
  robots: { index: false, follow: false },
};

/**
 * DigiLocker redirects here after the customer approves (or declines) consent.
 * `resume` makes the flow poll the control plane immediately instead of showing
 * the "start verification" button again.
 */
export default function VerifyCompletePage() {
  return (
    /* NO BACKGROUND FILL HERE. `.cf-aurora` is fixed at z-index -1 and body is
       already `bg-paper`; painting a colour on this wrapper would sit on top of
       the wash and leave the glass panel floating over flat white. The wrapper
       only establishes the stacking context and the page gutter. */
    <div className="relative min-h-screen text-ink">
      <div className="cf-aurora" />
      <main className="relative flex min-h-screen items-center justify-center px-4 py-16 sm:py-24">
        <VerifyFlow resume />
      </main>
    </div>
  );
}
