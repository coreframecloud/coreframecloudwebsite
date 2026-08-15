import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";
import { COMPANY, COMPANY_ADDRESS_FULL } from "@/lib/company";

/**
 * Single source of truth for refund terms.
 *
 * Rewritten after our CA confirmed the tax treatment: a wallet recharge is the
 * SUPPLY, not an advance against one. A full tax invoice is issued at the moment
 * of recharge and GST is discharged then, which is why the credit cannot be
 * refunded on request — the supply is complete when the money arrives.
 *
 * `/refunds` used to state a contradictory 14-day window while this page said
 * 7 days. It now redirects here so there is exactly one statement of the terms.
 */

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Coreframe Cloud refund policy. Wallet credits are non-refundable; a GST tax invoice is issued at the time of recharge.",
  alternates: {
    canonical: "/refund-policy",
  },
};

const policySections = [
  {
    title: "Wallet credits are non-refundable",
    body:
      "A recharge is a purchase of prepaid GPU compute credit, and the supply is complete when the payment is received. We issue a full GST tax invoice at that moment, and the tax is discharged to the government on that invoice. Credits are therefore not refundable to your bank account, in whole or in part.",
  },
  {
    title: "Credit is valid for one year",
    body:
      "Credit expires twelve months from the date you buy it, and the expiry date appears on the tax invoice for that recharge. Your oldest credit is always spent first, so a later top-up never causes an earlier one to lapse while you are still using the platform. We will tell you in the app when credit is within sixty days of expiring. There is no dormancy fee and no other charge for holding a balance.",
  },
  {
    title: "Consumed usage",
    body:
      "GPU session time, persistent NAS storage and any other service you have used are non-refundable. Sessions are billed per minute from the moment your workstation starts streaming — provisioning time and failed connections are never charged.",
  },
  {
    title: "Duplicate and failed payments",
    body:
      "This is the exception, and it is unconditional. If you are charged twice for the same recharge, or money leaves your account without the credit appearing, we refund it in full to the original payment method. Contact us and we will resolve it — you should never have to raise a chargeback for our error.",
  },
  {
    title: "Service failures",
    body:
      "If a workstation fails through a fault on our side, we credit back the affected session time. Where an outage is significant we may issue additional service credit at our discretion. Service credits are added to your wallet balance and are not paid out in cash.",
  },
  {
    title: "Chargebacks",
    body:
      "Raising a chargeback against a legitimate, consumed charge suspends the account while we investigate. Please contact us first — a duplicate charge or a service failure is something we will fix directly, and far faster than your bank will.",
  },
  {
    title: "Committed and enterprise plans",
    body:
      "Monthly committed plans are governed by the service agreement signed for that account, which takes precedence over this page where the two differ.",
  },
];

export default function RefundPolicyPage() {
  return (
    <main className="relative min-h-screen border-b border-white/10 text-white">
      <BackgroundGlow />

      <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
          Legal
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
          Refund Policy
        </h1>
        <p className="mt-4 text-sm font-medium uppercase tracking-[0.18em] text-white/45">
          Last Updated: August 2026
        </p>

        {/* Stated plainly and up front. A non-refundable term buried three
            sections down is the kind of thing that gets a charge disputed. */}
        <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-6 py-5">
          <p className="text-base leading-7 text-amber-100/90">
            <span className="font-semibold">In short:</span> money you add to your
            wallet is not refundable, because we issue a GST tax invoice and pay the
            tax the moment you recharge, and it is valid for one year from purchase.
            Your oldest credit is always spent first, so a top-up never causes an
            earlier one to lapse. Please add only what you expect to use within the
            year. Duplicate charges and payment failures are always refunded in full.
          </p>
        </div>

        <div className="mt-10 space-y-10 text-base leading-8 text-white/70">
          {policySections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-white">
                {section.title}
              </h2>
              <p className="mt-3">{section.body}</p>
            </section>
          ))}

          <section>
            <h2 className="text-xl font-semibold text-white">How to reach us</h2>
            <p className="mt-3">
              Email us and we respond within two business days.
            </p>
            <Link
              href={`mailto:${COMPANY.email}`}
              className="mt-3 inline-flex text-cyan-300 transition hover:text-cyan-200"
            >
              {COMPANY.email}
            </Link>
            <p className="mt-6 text-sm leading-6 text-white/45">
              {COMPANY.legalName}
              <br />
              {COMPANY_ADDRESS_FULL}
              <br />
              GSTIN {COMPANY.gstin} · CIN {COMPANY.cin}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
