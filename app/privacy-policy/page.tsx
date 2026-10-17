import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";
import { COMPANY, COMPANY_ADDRESS_FULL } from "@/lib/company";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Coreframe Cloud collects, stores, and protects your personal data.",
  alternates: { canonical: "/privacy-policy" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="cf-section-title">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <>
    <section className="cf-section cf-pagehero px-5">
      <div className="cf-wide">
            <div className="text-sm font-semibold uppercase tracking-widest text-blue">Legal</div>
            <h1 className="cf-display mt-3">Privacy Policy</h1>
            <p className="mt-2 text-sm text-ink-3">Last Updated: 18 October 2026 · Effective: 18 October 2026</p>
      </div>
    </section>
    <main className="relative min-h-screen border-b border-rule text-ink">
      <BackgroundGlow />

      <div className="relative mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <div className="mt-10 space-y-10 text-base leading-8 text-ink-2">

          {/* 18 Oct 2026: rewritten with the Terms of Service to cover every service
              (workstations, CFD, Studio, free tools), the WhatsApp-verified mobile,
              CERT-In records, the DPDP Act 2023 and a grievance officer. Retention
              wording matches the terms: content is kept until the customer deletes
              it or closes the account. Never name infrastructure or AI vendors here;
              Razorpay, Resend, Google and WhatsApp are named because customers deal
              with them directly. */}
          <Section title="Our commitment">
            <p>Coreframe Compute Labs Private Limited (&ldquo;Coreframe&rdquo;, &ldquo;we&rdquo;) is the data fiduciary for the personal data described here, under India&rsquo;s Digital Personal Data Protection Act, 2023 (&ldquo;DPDP Act&rdquo;). We follow these principles:</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>We collect only information necessary to deliver our services.</li>
              <li>We do not use your data for purposes beyond what is stated here.</li>
              <li>We do not sell or share your data with third parties for their marketing.</li>
              <li>We do not use your files to train AI models unless you choose to let us.</li>
              <li>We retain data only as long as stated here or required by law.</li>
            </ul>
          </Section>

          <Section title="1. Information we collect">
            <p>When you create an account, use our services or contact us, we collect:</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>Your name, email address, country (and state, in India) and company or studio name, and your organisation&rsquo;s GSTIN if you give it</li>
              <li>Your mobile number. It is required, and we verify it with a one-time code sent on WhatsApp, because Indian regulations (CERT-In) require a verified contact number for anyone using our compute services</li>
              <li>Payment information (processed by Razorpay; we never store raw card numbers) and your wallet, top-up and invoice history</li>
              <li>GPU session records: start and end times, minutes used, the workstation used and the IP address you connected from</li>
              <li>Device identifiers (for desktop client authentication)</li>
              <li><strong className="text-ink">CFD:</strong> the geometry (STL) and case details you submit, and the meshes, results, reports and case files we produce</li>
              <li><strong className="text-ink">Studio:</strong> the floor plans (DXF), reference images and prompts you upload or type, and the images we generate for you</li>
              <li><strong className="text-ink">Free tools:</strong> the file you upload is read and then deleted; if you create a share link, we keep the report (not the file) and any email you give for 90 days</li>
              <li>Records of the choices you make, such as WhatsApp marketing consent, with the time and IP address</li>
            </ul>
            <p>When you visit our website without signing in, we may collect anonymised traffic data (browser type, approximate IP location, pages visited) to improve our service.</p>
          </Section>

          <Section title="2. How we use your information">
            <ul className="list-disc space-y-1.5 pl-6">
              <li>Providing our services: running your GPU workstation sessions, CFD jobs and Studio images, and showing your results in your account</li>
              <li>Billing, invoicing (GST-compliant), wallet management and checking your billing country</li>
              <li>Sending transactional messages by email and WhatsApp (sign-in codes, OTPs, quotes, results, session alerts, low balance warnings)</li>
              <li>Meeting legal obligations, including CERT-In record keeping and tax law</li>
              <li>Responding to support requests</li>
              <li>Improving our platform and detecting fraud and abuse</li>
            </ul>
            <p>We do not use your files, drawings or results to train or improve AI models, unless you opt in for a particular file (for example, the optional &ldquo;let Coreframe learn from this file&rdquo; box in Studio). Where you opt in, the file is used internally only.</p>
          </Section>

          <Section title="3. Email and WhatsApp communications">
            <p>We send transactional messages related to your account and jobs. Marketing messages on WhatsApp (for example Studio tips and offers) are sent only if you tick the optional box to receive them, and you can turn them off at any time in your account or from the link in the message. We do not send unsolicited marketing email without your consent. Contact us to opt out of non-essential communications.</p>
          </Section>

          <Section title="4. Data sharing">
            <p>We do not sell your data. We share it only with service providers strictly necessary to operate the platform, under contract and only for that purpose:</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li><strong className="text-ink">Razorpay</strong>: payment processing (<Link href="https://razorpay.com/privacy/" target="_blank" rel="noreferrer" className="text-blue hover:underline">Privacy Policy</Link>)</li>
              <li><strong className="text-ink">Resend</strong>: transactional email delivery</li>
              <li><strong className="text-ink">WhatsApp</strong>: delivery of verification codes and messages to your mobile</li>
              <li><strong className="text-ink">Google</strong>: if you use &ldquo;Sign in with Google&rdquo;, your Google profile email and name are shared with us via OAuth</li>
              <li><strong className="text-ink">Computing infrastructure providers</strong>: the machines that run CFD jobs. Each job runs on a machine started for it alone and deleted when the job ends</li>
              <li><strong className="text-ink">An outside AI service</strong>: for Studio Plus and Pro ray-traced renders only, the plan, prompt and any reference image needed to make that image. All other Studio images are made on our own machines</li>
              <li>Government or regulatory authorities, if legally required</li>
            </ul>
          </Section>

          <Section title="5. Payment data">
            <p>All payment processing is handled by <strong className="text-ink">Razorpay</strong>, a PCI-DSS compliant payment gateway. Coreframe stores only the last 4 digits of a card and a payment token reference, never full card numbers or CVV codes.</p>
          </Section>

          <Section title="6. Data security">
            <p>We use TLS 1.2+ encryption for all data in transit. Sensitive credentials and tokens are stored encrypted at rest. Your CFD jobs and Studio projects open only when you are signed in to your account. GPU workstations are wiped and restored to a clean image after every session. In the event of a personal data breach, we will notify affected users and the Data Protection Board of India as the DPDP Act requires, and in any case tell affected users within 72 hours of our becoming aware of the incident.</p>
          </Section>

          <Section title="7. Data retention">
            <ul className="list-disc space-y-1.5 pl-6">
              <li>Account data is kept while your account is active.</li>
              <li>Your content (workstation project files, CFD uploads and results, Studio projects) is kept in your account until you delete it or close your account. We do not delete it on a timer. You can delete a Studio project yourself; for anything else, ask us.</li>
              <li>If you ask us to delete your data or close your account, we delete your personal data and content within 30 days of the request, except what the law requires us to keep.</li>
              <li>Tax invoices and billing records are kept for as long as GST and tax law require.</li>
              <li>Records of who used our compute services, when and from where (session logs and the subscriber details CERT-In requires) are kept for the periods set by the CERT-In directions: logs for at least 180 days, and subscriber records for five years after your account ends.</li>
              <li>Files uploaded to our free tools are deleted as soon as they are read; shared reports are kept for 90 days.</li>
            </ul>
          </Section>

          <Section title="8. Your rights">
            <p>Under the DPDP Act and other applicable law, you have the right to:</p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>Access a summary of the personal data we hold about you and how we use it</li>
              <li>Correct, complete or update inaccurate information</li>
              <li>Request erasure of your data, subject to what the law requires us to keep</li>
              <li>Withdraw consent you have given, such as for marketing messages</li>
              <li>Nominate another person to exercise your rights if you die or become incapacitated</li>
              <li>Have a grievance about your data handled by our Grievance Officer (section 12)</li>
            </ul>
            <p>To exercise any of these rights, email us at <Link href="mailto:admin@coreframecloud.com" className="text-blue hover:underline">admin@coreframecloud.com</Link>.</p>
          </Section>

          <Section title="9. Children">
            <p>Our services are for people aged 18 and over. We do not knowingly collect personal data from children.</p>
          </Section>

          <Section title="10. Customer data responsibility">
            <p>We keep your files while your account is active, but no storage is immune to failure. Please keep your own backups of important project files and results. Anything saved only on a workstation, outside your persistent drive, is wiped at the end of the session.</p>
          </Section>

          <Section title="11. Changes to this policy">
            <p>We may update this policy from time to time. Material changes will be notified by email or in the app at least 15 days before they take effect. Continued use of our services after the effective date constitutes acceptance.</p>
          </Section>

          <Section title="12. Grievance Officer and contact">
            <p>For any question or complaint about your personal data, contact our Grievance Officer. We acknowledge complaints within two business days and aim to resolve them within 15 days. If you are not satisfied with our response, you may complain to the Data Protection Board of India.</p>
            <p>
              <strong className="text-ink">Grievance Officer, Coreframe Compute Labs Private Limited</strong><br />
              {/* The GST-registered wording, not the building name. This block
                  is matched against the certificate; see lib/company.ts. */}
              {COMPANY_ADDRESS_FULL}<br />
              GSTIN: {COMPANY.gstin}
            </p>
            <p>
              <Link href="mailto:admin@coreframecloud.com" className="text-blue hover:underline">admin@coreframecloud.com</Link>
              {" · "}
              <Link href="https://wa.me/916366889488" target="_blank" rel="noreferrer" className="text-blue hover:underline">WhatsApp +91 63668 89488</Link>
            </p>
            <p>This policy forms part of our <Link href="/terms-of-service" className="text-blue hover:underline">Terms of Service</Link>.</p>
          </Section>

        </div>

        <div className="mt-12 border-t border-rule pt-8 text-sm text-ink-3">
          <Link href="/refund-policy" className="text-blue hover:underline">Refund Policy</Link>
          <span className="mx-3">·</span>
          <Link href="/terms-of-service" className="text-blue hover:underline">Terms of Service</Link>
          <span className="mx-3">·</span>
          <Link href="/login" className="text-blue hover:underline">Sign in</Link>
          <span className="mx-3">·</span>
          <span>© {new Date().getFullYear()} Coreframe Compute Labs Private Limited</span>
        </div>
      </div>
    </main>
    </>
  );
}
