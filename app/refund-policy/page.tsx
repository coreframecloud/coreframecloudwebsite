import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Refund Policy for Coreframe Cloud wallet credits, GPU workstation usage, and service credits.",
  alternates: {
    canonical: "/refund-policy",
  },
};

const policySections = [
  {
    title: "Wallet Credits",
    body: "Unused wallet balances may be eligible for refund requests within 7 days of purchase.",
  },
  {
    title: "Consumed Usage",
    body: "GPU workstation usage, compute hours, storage consumption, and other consumed services are non-refundable.",
  },
  {
    title: "Service Credits",
    body: "In the event of service interruptions, Coreframe Cloud may issue service credits at its discretion.",
  },
  {
    title: "Payment Processing Fees",
    body: "Any payment gateway charges, foreign exchange fees, or processing fees may be deducted from refundable amounts.",
  },
  {
    title: "Abuse",
    body: "Refund requests associated with misuse, fraud, chargeback abuse, or prohibited activities may be denied.",
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
          Last Updated: June 2026
        </p>

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
            <h2 className="text-xl font-semibold text-white">Contact</h2>
            <Link
              href="mailto:admin@coreframecloud.com"
              className="mt-3 inline-flex text-cyan-300 transition hover:text-cyan-200"
            >
              admin@coreframecloud.com
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
