import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Coreframe Cloud GPU workstation and cloud computing services.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

const collectedInformation = [
  "Name",
  "Email address",
  "Phone number",
  "Company name",
  "Billing information",
  "Support communications",
  "Usage and session information",
  "Device and browser information",
];

const informationUses = [
  "Create and manage accounts",
  "Process payments",
  "Provide customer support",
  "Improve service reliability and security",
  "Comply with legal obligations",
];

const sharingPartners = [
  "Payment processors",
  "Cloud infrastructure providers",
  "Legal or regulatory authorities where required",
];

export default function PrivacyPolicyPage() {
  return (
    <main className="relative min-h-screen border-b border-white/10 text-white">
      <BackgroundGlow />

      <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
          Legal
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm font-medium uppercase tracking-[0.18em] text-white/45">
          Last Updated: June 2026
        </p>

        <div className="mt-10 space-y-10 text-base leading-8 text-white/70">
          <section>
            <h2 className="text-xl font-semibold text-white">Company</h2>
            <p className="mt-3">COREFRAME COMPUTE LABS PRIVATE LIMITED</p>
          </section>

          <section>
            <p>
              Coreframe Cloud collects information necessary to provide GPU
              workstation and cloud computing services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Information We May Collect
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              {collectedInformation.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              How We Use Information
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              {informationUses.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <p>We do not sell personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Information Sharing
            </h2>
            <p className="mt-3">We may share information with:</p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              {sharingPartners.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Customer Data Responsibility
            </h2>
            <p className="mt-3">
              Customers are responsible for maintaining backups of their own
              project files and data.
            </p>
          </section>

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
