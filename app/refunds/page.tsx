import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";

export const metadata: Metadata = {
  title: "Refunds and Chargebacks — Coreframe Cloud",
  description: "Refund policy and chargeback information for Coreframe Cloud GPU workstation services.",
  alternates: { canonical: "/refunds" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export default function RefundsPage() {
  return (
    <main className="relative min-h-screen border-b border-white/10 text-white">
      <BackgroundGlow />

      <div className="relative mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <div className="text-sm font-semibold uppercase tracking-widest text-cyan-300">Legal</div>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Refunds &amp; Chargebacks</h1>
        <p className="mt-2 text-sm text-white/40">Effective from June 28, 2026</p>

        <div className="mt-10 space-y-10 text-base leading-8 text-white/70">

          <Section title="Wallet credits">
            <p>
              Coreframe operates on a prepaid wallet model. When you add funds to your Coreframe wallet, those credits are used to pay for GPU hours as you consume them. Credits are non-expiring while your account is active.
            </p>
          </Section>

          <Section title="Refund eligibility">
            <p>
              You may request a refund of <strong className="text-white">unused wallet balance</strong> within <strong className="text-white">14 days</strong> of the top-up date, provided no GPU sessions have been consumed against that top-up.
            </p>
            <p>
              If GPU sessions have already been consumed, only the remaining unused balance may be eligible for refund, at Coreframe&rsquo;s discretion.
            </p>
            <p>
              Refunds can only be made via the same payment method used for the original top-up (Razorpay UPI, credit/debit card, or net banking). Refunds will be processed within <strong className="text-white">14 calendar days</strong> of an approved request.
            </p>
          </Section>

          <Section title="Non-refundable items">
            <ul className="list-disc space-y-1.5 pl-6">
              <li>
                <strong className="text-white">Account setup fee</strong> — a one-time ₹350 platform onboarding fee charged on your first top-up is non-refundable.
              </li>
              <li>
                <strong className="text-white">Consumed GPU hours</strong> — sessions that have already run are billed per-minute and cannot be reversed.
              </li>
              <li>
                <strong className="text-white">NAS storage fees</strong> — storage charges for committed monthly plans are non-refundable once the billing period has started.
              </li>
              <li>
                <strong className="text-white">Promotional credits</strong> — free trial hours or bonus credits are non-refundable and have no cash value.
              </li>
            </ul>
          </Section>

          <Section title="How to request a refund">
            <p>
              Email <Link href="mailto:admin@coreframecloud.com" className="text-cyan-400 hover:underline">admin@coreframecloud.com</Link> with your registered email address, the top-up amount, and the date of the transaction. You will receive a response within 2 business days.
            </p>
            <p>
              You can also reach us on <Link href="https://wa.me/916366889488" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">WhatsApp +91 63668 89488</Link>.
            </p>
          </Section>

          <Section title="Chargebacks">
            <p>
              A chargeback occurs when a buyer contacts their card issuer or bank to dispute a charge. Chargebacks may be raised for reasons including:
            </p>
            <ul className="list-disc space-y-1.5 pl-6">
              <li>Expired card authorisation or bank processing error</li>
              <li>Duplicate billing or incorrect amount charged</li>
              <li>Unauthorised use of the buyer&rsquo;s card or identity theft</li>
            </ul>
            <p>
              Before initiating a chargeback, we strongly encourage you to contact us directly at <Link href="mailto:admin@coreframecloud.com" className="text-cyan-400 hover:underline">admin@coreframecloud.com</Link> — we resolve billing disputes quickly and a chargeback will result in immediate account suspension pending investigation.
            </p>
            <p>
              If a chargeback is filed and determined to be fraudulent or without merit, Coreframe reserves the right to permanently suspend the account and recover losses through available legal means.
            </p>
          </Section>

          <Section title="Enterprise and committed plans">
            <p>
              For customers on committed monthly or annual enterprise plans, refund terms are governed by the individual service agreement. Contact <Link href="mailto:admin@coreframecloud.com" className="text-cyan-400 hover:underline">admin@coreframecloud.com</Link> for plan-specific terms.
            </p>
          </Section>

          <Section title="Contact">
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
          <Link href="/privacy-policy" className="text-cyan-400 hover:underline">Privacy Policy</Link>
          <span className="mx-3">·</span>
          <Link href="/login" className="text-cyan-400 hover:underline">Sign in</Link>
          <span className="mx-3">·</span>
          <span>© {new Date().getFullYear()} Coreframe Compute Labs Private Limited</span>
        </div>
      </div>
    </main>
  );
}
