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
    "Coreframe Cloud refund policy for workstations, CFD and Studio. Wallet credits are non-refundable; failures on our side come back automatically.",
  alternates: {
    canonical: "/refund-policy",
  },
};

/**
 * 18 Oct 2026: extended from workstation-only to every service, in step with
 * the Terms of Service (/terms-of-service). The CFD and Studio rules below are
 * what the control plane does (cfd_billing / cfd_pricing settle-and-release;
 * Studio refunds only when our side failed). Keep the two pages consistent.
 */
const policySections: { title: string; body: string }[] = [
  {
    title: "Wallet credits are non-refundable",
    body:
      "A recharge is a purchase of prepaid credit for our services, and the supply is complete when the payment is received. We issue a full tax invoice at that moment (a GST invoice in India; an invoice in US dollars for accounts billed outside India), and any tax is discharged on that invoice. Credits are therefore not refundable to your bank account, in whole or in part, except in the cases on this page.",
  },
  {
    title: "Credit is valid for one year",
    body:
      "Credit expires twelve months from the date you buy it, and the expiry date appears on the tax invoice for that recharge. Your oldest credit is always spent first, so a later top-up never causes an earlier one to lapse while you are still using the platform. We will tell you in the app when credit is within sixty days of expiring. There is no dormancy fee and no other charge for holding a balance.",
  },
  {
    title: "Promotional credit",
    body:
      "Bonus credit on larger top-ups and any new-customer offer are promotional. They have no cash value, are never refunded or transferred, and are spent according to the rules stated with the offer, which can include a shorter validity and limits on what they can be spent on. For example, the new-customer offer is for GPU workstation time only and must be used within 30 days, and promotional credit cannot pay for CFD.",
  },
  {
    title: "GPU workstations",
    body:
      "Session time and storage you have used are non-refundable. Sessions are billed per minute from when you connect; preparing the workstation is never charged. If you don't connect within 10 minutes of your workstation being ready, it shuts down and those 10 minutes are charged. If a connection fails on our side, nothing is charged. If a workstation fails through a fault on our side, we credit the affected session time back to your wallet. Where an outage is significant we may issue additional service credit at our discretion.",
  },
  {
    title: "CFD: pre-processing / mesh check",
    body:
      "If your case is rejected as out of scope before meshing, nothing is charged. The pre-processing fee is refunded to your wallet if pre-processing fails because of a problem on our side, or if you cancel before the mesh is delivered. It is not refunded once the mesh and quote have been delivered, or if meshing fails because of the geometry you supplied. The fee is a separate charge and is not deducted from the run.",
  },
  {
    title: "CFD: runs",
    body:
      "When you accept a quote, the full quoted amount is held from your wallet. When the run ends, you are charged for what it used under the rules on your quote, never more than the quote, and the rest is released to your wallet straight away. You can cancel until the run starts and the whole hold is released. If a run fails, diverges or cannot start because of a problem on our side, the whole hold is released. Normal delivery is within 24 hours of payment, or the run is free: if we miss it because of a problem on our side, the run charge is returned to your wallet in full (time spent waiting for you, such as for corrected geometry, does not count).",
  },
  {
    title: "Studio",
    body:
      "A paid Studio action (an extra preview, an edit, a 2K or 4K download, or a ray-traced render) is charged when it starts. If it fails because of a problem on our side, the charge comes back to your wallet automatically. An image you do not like is not a failure. If you think something went wrong, tell us.",
  },
  {
    title: "Duplicate and failed payments",
    body:
      "This is the exception, and it is unconditional. If you are charged twice for the same recharge, or money leaves your account without the credit appearing, we refund it in full to the original payment method. Contact us and we will resolve it. You should never have to raise a chargeback for our error.",
  },
  {
    title: "If we close your account",
    body:
      "If we close your account without any fault on your part, we refund the unused paid balance in your wallet (not promotional credit) to the original payment method. If you choose to close your account, unused credit is not refunded, so please use it first.",
  },
  {
    title: "Refunds go to your wallet",
    body:
      "Unless this page says otherwise, refunds for service failures, CFD holds and Studio failures are credited to your Coreframe wallet, not paid out in cash. Service credits are added to your wallet balance.",
  },
  {
    title: "Chargebacks",
    body:
      "Raising a chargeback against a legitimate, consumed charge suspends the account while we investigate. Please contact us first. A duplicate charge or a service failure is something we will fix directly, and far faster than your bank will.",
  },
  {
    title: "Team plans and agreements",
    body:
      "Monthly Team plans and any committed plan are governed by the plan terms and any service agreement signed for that account, which take precedence over this page where the two differ. This page forms part of our Terms of Service.",
  },
];

export default function RefundPolicyPage() {
  return (
    <>
    <section className="cf-section cf-pagehero px-5">
      <div className="cf-wide">
            <div className="cf-eyebrow">
              Legal
            </div>
            <h1 className="cf-display mt-4">
              Refund Policy
            </h1>
            <p className="mt-4 cf-eyebrow">
              Last Updated: 18 October 2026
            </p>
      </div>
    </section>
    <main className="relative min-h-screen border-b border-rule text-ink">
      <BackgroundGlow />

      <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        {/* Stated plainly and up front. A non-refundable term buried three
            sections down is the kind of thing that gets a charge disputed. */}
        <div className="mt-8 rounded-cf border border-rule bg-paper-2 border-l-2 border-l-blue px-6 py-5">
          <p className="text-base leading-7 text-ink-2">
            <span className="font-semibold">In short:</span>{" "}
            money you add to your wallet is not refundable, because we issue a tax invoice
            the moment you recharge, and it is valid for one year from purchase. Your oldest
            credit is always spent first. When something fails on our side (a workstation,
            a CFD run, a Studio image) the charge comes back to your wallet, and a CFD run
            we deliver late is free. Duplicate charges and payment failures are always
            refunded in full.
          </p>
        </div>

        <div className="mt-10 space-y-10 text-base leading-8 text-ink-2">
          {policySections.map((section) => (
            <section key={section.title}>
              <h2 className="cf-section-title">
                {section.title}
              </h2>
              <p className="mt-3">{section.body}</p>
            </section>
          ))}

          <section>
            <h2 className="cf-section-title">How to reach us</h2>
            <p className="mt-3">
              Email us and we respond within two business days.
            </p>
            <Link
              href={`mailto:${COMPANY.email}`}
              className="mt-3 inline-flex text-blue transition hover:text-blue"
            >
              {COMPANY.email}
            </Link>
            <p className="mt-6 text-sm leading-6 text-ink-2">
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
    </>
  );
}
