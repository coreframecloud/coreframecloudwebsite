import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";

export const metadata: Metadata = {
  title: "Privacy Policy — Coreframe Cloud",
  description: "How Coreframe Cloud collects, stores, and protects your personal data.",
  alternates: { canonical: "/privacy-policy" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <main className="relative min-h-screen border-b border-white/10 text-white">
      <BackgroundGlow />

      <div className="relative mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <div className="text-sm font-semibold uppercase tracking-widest text-cyan-300">Legal</div>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-white/40">Effective from June 28, 2026</p>

        <div className="mt-10 space-y-10 text-base leading-8 text-white/70">

          <Section title="Our commitment">
            <p>Coreframe Compute Labs Private Limited (&ldquo;Coreframe&rdquo;) follows these principles to protect your privacy:</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>We collect only information necessary to deliver our services.</li>
              <li>We do not use your data for purposes beyond what is stated here.</li>
              <li>We do not sell or share your data with third parties for marketing.</li>
              <li>We retain data only as long as required.</li>
            </ul>
          </Section>

          <Section title="1. Information we collect">
            <p>When you create an account or contact us, we collect:</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>Full name, email address, phone number (optional)</li>
              <li>Company or studio name</li>
              <li>Payment information (processed by Razorpay — we never store raw card numbers)</li>
              <li>GPU session logs (session start/end times, hours consumed)</li>
              <li>Device identifiers (for desktop client authentication)</li>
            </ul>
            <p>When you visit our website without signing in, we may collect anonymised traffic data (browser type, approximate IP location, pages visited) to improve our service.</p>
          </Section>

          <Section title="2. How we use your information">
            <ul className="list-disc space-y-1.5 pl-6">
              <li>Provisioning and managing your GPU workstation sessions</li>
              <li>Billing, invoicing (GST-compliant), and wallet management</li>
              <li>Sending transactional emails (sign-in links, OTPs, session alerts, low balance warnings)</li>
              <li>Responding to support requests</li>
              <li>Improving our platform and detecting abuse</li>
            </ul>
          </Section>

          <Section title="3. Email communications">
            <p>We send transactional emails related to your account (sign-in links, session receipts, low balance alerts, invoices). We do not send unsolicited marketing without your consent. Contact us to opt out of non-essential communications.</p>
          </Section>

          <Section title="4. Data sharing">
            <p>We do not sell your data. We share it only with service providers strictly necessary to operate the platform:</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li><strong className="text-white">Razorpay</strong> — payment processing (<Link href="https://razorpay.com/privacy/" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">Privacy Policy</Link>)</li>
              <li><strong className="text-white">Resend</strong> — transactional email delivery</li>
              <li><strong className="text-white">Google</strong> — if you use &ldquo;Sign in with Google&rdquo;, your Google profile email and name are shared with us via OAuth</li>
              <li>Government or regulatory authorities, if legally required</li>
            </ul>
          </Section>

          <Section title="5. Payment data">
            <p>All payment processing is handled by <strong className="text-white">Razorpay</strong>, a PCI-DSS compliant payment gateway. Coreframe stores only the last 4 digits of a card and a payment token reference — never full card numbers or CVV codes.</p>
          </Section>

          <Section title="6. Data security">
            <p>We use TLS 1.2+ encryption for all data in transit. Sensitive credentials and tokens are stored encrypted at rest. In the event of a data breach, affected users will be notified within 72 hours of our becoming aware of the incident.</p>
          </Section>

          <Section title="7. Data retention">
            <p>Account data is retained while your account is active. If you request account deletion, we will delete your personal data within 30 days, except where retention is required by law (e.g., GST invoices must be retained for 7 years under Indian tax law).</p>
          </Section>

          <Section title="8. Your rights">
            <p>You have the right to:</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for optional communications</li>
            </ul>
            <p>To exercise any of these rights, email us at <Link href="mailto:admin@coreframecloud.com" className="text-cyan-400 hover:underline">admin@coreframecloud.com</Link>.</p>
          </Section>

          <Section title="9. Customer data responsibility">
            <p>Customers are responsible for maintaining backups of their own project files and data stored on Coreframe workstations. Coreframe provides NAS storage as a convenience but does not guarantee data availability beyond active session periods.</p>
          </Section>

          <Section title="10. Changes to this policy">
            <p>We may update this policy from time to time. Material changes will be notified via email. Continued use of our services after the effective date constitutes acceptance.</p>
          </Section>

          <Section title="11. Contact">
            <p>
              <strong className="text-white">Coreframe Compute Labs Private Limited</strong><br />
              Innov8, Prestige Tech Platina, 11th Floor, Kadubeesanahalli, Bengaluru 560087, Karnataka, India<br />
              GSTIN: 29AANCC8401D1ZO
            </p>
            <p>
              <Link href="mailto:admin@coreframecloud.com" className="text-cyan-400 hover:underline">admin@coreframecloud.com</Link>
              {" · "}
              <Link href="https://wa.me/916366889488" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">WhatsApp +91 63668 89488</Link>
            </p>
          </Section>

        </div>

        <div className="mt-12 border-t border-white/8 pt-8 text-sm text-white/40">
          <Link href="/refunds" className="text-cyan-400 hover:underline">Refunds and chargebacks</Link>
          <span className="mx-3">·</span>
          <Link href="/login" className="text-cyan-400 hover:underline">Sign in</Link>
          <span className="mx-3">·</span>
          <span>© {new Date().getFullYear()} Coreframe Compute Labs Private Limited</span>
        </div>
      </div>
    </main>
  );
}
