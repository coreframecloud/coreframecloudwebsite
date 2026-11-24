import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";

/* 24 Nov 2026, owner-approved wording (plans/privacy-tracking-drafts-20261124.md, D).
   This is the "User data deletion" URL given to Meta in the app settings:
   https://www.coreframecloud.com/data-deletion. Same layout as /privacy-policy. */
export const metadata: Metadata = {
  title: "Delete your data",
  description:
    "How to ask Coreframe Cloud to delete your account and personal data, what we delete within 30 days, and what the law makes us keep.",
  alternates: { canonical: "/data-deletion" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="cf-section-title">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export default function DataDeletionPage() {
  return (
    <>
    <section className="cf-section cf-pagehero px-5">
      <div className="cf-wide">
            <div className="text-sm font-semibold uppercase tracking-widest text-blue">Legal</div>
            <h1 className="cf-display mt-3">Delete your data</h1>
            <p className="mt-2 text-sm text-ink-3">Last Updated: 24 November 2026</p>
      </div>
    </section>
    <main className="relative min-h-screen border-b border-rule text-ink">
      <BackgroundGlow />

      <div className="relative mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <div className="mt-10 space-y-10 text-base leading-8 text-ink-2">

          <p>You can ask us to delete your Coreframe account and personal data at any time.</p>

          <Section title="How">
            <ul className="list-disc space-y-1.5 pl-6">
              <li>Email <Link href="mailto:admin@coreframecloud.com?subject=Delete%20my%20data" className="text-blue hover:underline">admin@coreframecloud.com</Link> from the address on your account, with the subject &ldquo;Delete my data&rdquo;.</li>
              <li>Or message us on WhatsApp at <Link href="https://wa.me/916366889488" target="_blank" rel="noreferrer" className="text-blue hover:underline">+91 63668 89488</Link> from your verified number.</li>
            </ul>
            <p>We confirm the request within two business days.</p>
          </Section>

          <Section title="What we delete, within 30 days">
            <ul className="list-disc space-y-1.5 pl-6">
              <li>Your account and profile.</li>
              <li>Your files, CFD jobs and results, Studio projects and persistent workstation disks.</li>
              <li>Your analytics and visitor records.</li>
              <li>Our copies of advertising events.</li>
            </ul>
            <p>We also remove you from every customer list we upload to advertising platforms.</p>
          </Section>

          <Section title="What the law makes us keep">
            <ul className="list-disc space-y-1.5 pl-6">
              <li>Tax invoices and billing records, for as long as GST and tax law require.</li>
              <li>The session logs and subscriber records required by the CERT-In directions of 28 April 2022: logs for at least 180 days, subscriber records for five years after your account ends.</li>
            </ul>
          </Section>

          <Section title="Data held by Meta">
            <p>If you signed in with Facebook, or saw our ads, you can remove our access and the activity Meta holds about you. In Facebook or Instagram, go to Settings, Apps and websites, or Activity off Meta technologies.</p>
          </Section>

          <Section title="Questions">
            <p>Contact our Grievance Officer (see section 12 of the <Link href="/privacy-policy" className="text-blue hover:underline">Privacy Policy</Link>).</p>
          </Section>

        </div>

        <div className="mt-12 border-t border-rule pt-8 text-sm text-ink-3">
          <Link href="/privacy-policy" className="text-blue hover:underline">Privacy Policy</Link>
          <span className="mx-3">·</span>
          <Link href="/terms-of-service" className="text-blue hover:underline">Terms of Service</Link>
          <span className="mx-3">·</span>
          <span>© {new Date().getFullYear()} Coreframe Compute Labs Private Limited</span>
        </div>
      </div>
    </main>
    </>
  );
}
