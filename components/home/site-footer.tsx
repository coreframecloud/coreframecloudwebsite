import Link from "next/link";
import { CoreframeWordmarkAtlas } from "@/components/brand/coreframe-wordmark-atlas";
import { COMPANY, COMPANY_ADDRESS_LINE } from "@/lib/company";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#020b16]">
      {/* pb-28 is not decoration. The WhatsApp button is `fixed bottom-6 right-6`
          and ~56px tall, so at full scroll it sits on top of the last ~80px of
          the page. Without this padding it covers the registered address and
          GSTIN — the two lines that are on the page for compliance reasons. */}
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-28 sm:px-6 lg:px-8">

        {/* Main row */}
        <div className="grid gap-8 lg:grid-cols-[1fr_auto_auto_auto]">

          {/* Brand + tagline */}
          <div>
            <Link href="/" aria-label="COREFRAME Home" className="inline-flex">
              <CoreframeWordmarkAtlas iconSize={40} animated={false} />
            </Link>
            <p className="mt-3 max-w-xs text-xs leading-5 text-white/45">
              3D rendering managed workstations and ultra-fast CFD analysis. Hosted in Bengaluru, India.
            </p>
            <Link
              href="https://wa.me/916366889488"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-xs font-medium text-emerald-400 hover:text-emerald-300 transition"
            >
              WhatsApp: +91 6366889488
            </Link>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Product</h3>
            <div className="mt-3 flex flex-col gap-2">
              {[
                { label: "D5 Render", href: "/d5-render-cloud-workstation" },
                { label: "Lumion", href: "/lumion-cloud-gpu" },
                { label: "Enscape", href: "/enscape-cloud-gpu" },
                { label: "Free IFC check", href: "/tools" },
                { label: "Pricing", href: "/#pricing" },
                { label: "Enterprise plans", href: "/enterprise" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-xs text-white/50 hover:text-white transition">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Legal</h3>
            <div className="mt-3 flex flex-col gap-2">
              {[
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms of Service", href: "/terms-of-service" },
                { label: "Refund Policy", href: "/refund-policy" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="text-xs text-white/50 hover:text-white transition">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Contact</h3>
            <div className="mt-3 flex flex-col gap-2">
              <Link href="mailto:admin@coreframecloud.com" className="text-xs text-white/50 hover:text-white transition">admin@coreframecloud.com</Link>
              <Link href="https://wa.me/916366889488" target="_blank" rel="noreferrer" className="text-xs text-white/50 hover:text-white transition">+91 6366889488</Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        {/* Registered identity. Must match the GST certificate exactly — see lib/company.ts */}
        <div className="mt-8 border-t border-white/8 pt-5 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          {/* 10px at white/25 was unreadable on this background — that was the
              specific complaint about small text. 12px at white/45 stays quiet
              without being a squint. */}
          <p className="text-xs leading-5 text-white/45">
            © {new Date().getFullYear()} {COMPANY.displayName} · CIN {COMPANY.cin}
          </p>
          <div className="text-xs leading-5 text-white/45 sm:text-right">
            <p>{COMPANY_ADDRESS_LINE}</p>
            <p className="mt-0.5">GSTIN {COMPANY.gstin} · All prices include GST</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
