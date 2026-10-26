import type { Metadata } from "next";
import Link from "next/link";
import { BackgroundGlow } from "@/components/home/background-glow";
import { MailIcon, WhatsAppIcon } from "@/components/brand/contact-icons";
import { COMPANY } from "@/lib/company";

/**
 * Support (owner, 26 Oct 2026: "we don't have a dedicated support page ... email as
 * hello@coreframecloud.com and WhatsApp direct message, simple as it is"). This is the
 * support URL the Microsoft Store and Apple listings point at, so keep it plain and stable.
 */

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with Coreframe Connect, your workstation, wallet, CFD or Studio: email or WhatsApp us.",
  alternates: { canonical: "/support" },
};

const WHATSAPP = `${COMPANY.whatsapp}?text=${encodeURIComponent("Hi Coreframe, I need help with ")}`;

export default function SupportPage() {
  return (
    <>
      <section className="cf-section cf-pagehero px-5">
        <div className="cf-wide">
          <div className="cf-eyebrow">Support</div>
          <h1 className="cf-display mt-4">How can we help?</h1>
          <p className="mt-4 max-w-[60ch] text-[17px] leading-7 text-ink-2">
            Questions about Coreframe Connect, a workstation, your wallet, a CFD job or Studio:
            message us and a person replies.
          </p>
        </div>
      </section>
      <main className="relative border-b border-rule text-ink">
        <BackgroundGlow />
        <div className="relative mx-auto grid max-w-4xl gap-4 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:px-8">
          <Link
            href={`mailto:${COMPANY.supportEmail}`}
            className="rounded-cf border border-rule bg-paper-2 px-6 py-6 transition hover:border-blue/40"
          >
            <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <MailIcon className="h-[18px] w-[18px]" /> Email
            </span>
            <span className="mt-2 block text-[17px] text-blue">{COMPANY.supportEmail}</span>
            <span className="mt-2 block text-[14px] leading-6 text-ink-2">
              Include your account email, and a screenshot if something looks wrong.
            </span>
          </Link>
          <Link
            href={WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="rounded-cf border border-rule bg-paper-2 px-6 py-6 transition hover:border-blue/40"
          >
            <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <WhatsAppIcon className="h-[18px] w-[18px]" /> WhatsApp
            </span>
            <span className="mt-2 block text-[17px] text-blue">{COMPANY.phone}</span>
            <span className="mt-2 block text-[14px] leading-6 text-ink-2">
              Message us directly; quickest for a session that is running now.
            </span>
          </Link>
        </div>
      </main>
    </>
  );
}
