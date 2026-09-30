import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Coreframe Cloud GPU workstations and compute resources.",
  alternates: {
    canonical: "/terms-of-service",
  },
};

const permittedUses = [
  "Architectural visualization",
  "D5 Render",
  "Revit",
  "Twinmotion",
  "AutoCAD",
  "Blender",
  "Unreal Engine",
  "Engineering workloads",
  "AI training and inference",
  "Professional rendering and simulation workloads",
];

const prohibitedUses = [
  "Cryptocurrency mining",
  "Blockchain mining or validation nodes",
  "Malware creation or distribution",
  "Hacking or unauthorized access attempts",
  "Password cracking",
  "Spam operations",
  "Hosting illegal content",
  "Copyright infringement",
  "Adult content distribution",
  "Activities violating applicable law",
];

export default function TermsOfServicePage() {
  return (
    <main className="relative min-h-screen border-b border-rule text-ink">
      <BackgroundGlow />

      <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-sm font-medium uppercase tracking-[0.25em] text-blue">
          Legal
        </div>
        <h1 className="cf-display mt-4">
          Terms of Service
        </h1>
        <p className="mt-4 text-sm font-medium uppercase tracking-[0.18em] text-ink-2">
          Last Updated: June 2026
        </p>

        <div className="mt-10 space-y-10 text-base leading-8 text-ink-2">
          <section>
            <p>
              Coreframe Cloud provides cloud-hosted GPU workstations and compute
              resources.
            </p>
          </section>

          <section>
            <h2 className="cf-section-title">
              Permitted Uses
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              {permittedUses.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="cf-section-title">
              Prohibited Uses
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              {prohibitedUses.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="cf-section-title">
              Service Availability
            </h2>
            <p className="mt-3">
              Coreframe Cloud provides services on a commercially reasonable
              basis but does not guarantee uninterrupted availability.
            </p>
          </section>

          <section>
            <h2 className="cf-section-title">
              Data Responsibility
            </h2>
            <p className="mt-3">
              Customers are solely responsible for maintaining backups of their
              data and project files.
            </p>
          </section>

          <section>
            <h2 className="cf-section-title">
              Limitation of Liability
            </h2>
            <p className="mt-3">
              Coreframe Cloud shall not be liable for indirect, incidental,
              special, or consequential damages arising from use of the service.
            </p>
          </section>

          <section>
            <h2 className="cf-section-title">
              Account Suspension
            </h2>
            <p className="mt-3">
              Coreframe Cloud may suspend or terminate accounts involved in
              prohibited activities.
            </p>
          </section>

          <section>
            <h2 className="cf-section-title">Contact</h2>
            <Link
              href="mailto:admin@coreframecloud.com"
              className="mt-3 inline-flex text-blue transition hover:text-blue"
            >
              admin@coreframecloud.com
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
