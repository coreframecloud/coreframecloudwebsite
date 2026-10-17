import Link from "next/link";
import { CoreframeWordmarkAtlas } from "@/components/brand/coreframe-wordmark-atlas";
import {
  MailIcon,
  WhatsAppIcon,
  InstagramIcon,
  MapPinIcon,
} from "@/components/brand/contact-icons";
import {
  COMPANY,
  COMPANY_ADDRESS_LINE,
  COMPANY_VISITING_ADDRESS_LINE,
  COMPANY_MAPS_URL,
  COMPANY_INSTAGRAM_URL,
  COMPANY_INSTAGRAM_HANDLE,
} from "@/lib/company";
import { visiblePosts } from "@/lib/blog";
import { NODE } from "@/lib/node-spec";
import { OFFERINGS } from "@/lib/offerings";

export function SiteFooter() {
  return (
    <footer className="cf-footer mt-10 rounded-t-[40px] bg-night text-white sm:rounded-t-[64px]">
      {/* pb-28 is not decoration. The WhatsApp button is `fixed bottom-6 right-6`
          and ~56px tall, so at full scroll it sits on top of the last ~80px of
          the page. Without this padding it covers the registered address and
          GSTIN — the two lines that are on the page for compliance reasons. */}
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-28 sm:px-6 lg:px-8">

        {/* Main row */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[minmax(170px,1fr)_auto_auto_auto_auto_auto]">

          {/* Brand + tagline */}
          <div>
            <Link href="/" aria-label="COREFRAME Home" className="inline-flex min-h-11 items-center">
              <CoreframeWordmarkAtlas variant="light" iconSize={40} animated={false} />
            </Link>
            <p className="mt-3 max-w-xs text-xs leading-5 text-ink-2">
              RTX 5080 GPU workstations, CFD for ducts and pipes, and Studio for floor-plan concept
              images. Hosted in Bengaluru, India.
            </p>
            <Link
              href={COMPANY.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex min-h-11 items-center text-xs font-medium text-blue transition hover:text-blue"
            >
              WhatsApp: {COMPANY.phone}
            </Link>
          </div>

          {/* The three services first, as equals (13 Oct 2026), from the same
              list as the header and the homepage hero. */}
          <div>
            <h2 className="cf-eyebrow">Services</h2>
            <div className="mt-3 flex flex-col gap-0">
              {OFFERINGS.map((o) => (
                <Link key={o.id} href={o.href} className="flex min-h-11 items-center gap-2 text-[13.5px] text-ink-2 transition hover:text-ink">
                  {o.footerName}
                  {o.status !== "Live" ? (
                    <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9.5px] leading-none font-semibold tracking-[0.08em] text-white uppercase">
                      {o.status === "Opening soon" ? "Soon" : o.status}
                    </span>
                  ) : null}
                </Link>
              ))}
              {[
                { label: "Pricing", href: "/pricing" },
                { label: "Team plans", href: "/enterprise" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="flex min-h-11 items-center text-[13.5px] text-ink-2 transition hover:text-ink">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Software pages, free tools and the company. */}
          <div>
            <h2 className="cf-eyebrow">Explore</h2>
            <div className="mt-3 flex flex-col gap-0">
              {[
                { label: "D5 Render", href: "/d5-render-cloud-workstation" },
                { label: "Lumion", href: "/lumion-cloud-gpu" },
                { label: "Enscape", href: "/enscape-cloud-gpu" },
                { label: "Free IFC check", href: "/tools" },
                { label: "About Coreframe", href: "/about" },
                // Only when /blog exists on this build: published posts on the
                // live site, drafts too on a preview. A link to a page that
                // 404s in production is worse than no link.
                ...(visiblePosts().length ? [{ label: "Blog", href: "/blog" }] : []),
              ].map((l) => (
                <Link key={l.href} href={l.href} className="flex min-h-11 items-center text-[13.5px] text-ink-2 transition hover:text-ink">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Guides. The pages that answer a specific search but had few or no
              links pointing at them (GEO/SEO audit, 13 Oct 2026). Anchor text
              says what the page is, so the link itself describes it. */}
          <div>
            <h2 className="cf-eyebrow">Guides</h2>
            <div className="mt-3 flex flex-col gap-0">
              {[
                { label: "Cloud rendering for architects", href: "/cloud-rendering-for-architects" },
                { label: `Rent an ${NODE.gpu} in India`, href: "/software/gpu-workstation-rental-india" },
                { label: "Workstations and storage for studios", href: "/solutions" },
                { label: "Is 8 GB of VRAM enough?", href: "/vram-for-architectural-rendering" },
                { label: "Coreframe vs iRender", href: "/coreframe-vs-irender" },
                { label: "Workstation specs", href: "/compute-nodes" },
                { label: "Free DWG dimension check", href: "/dwg-check" },
                { label: "Book a demo or talk to us", href: "/request-demo" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="flex min-h-11 items-center text-[13.5px] text-ink-2 transition hover:text-ink">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h2 className="cf-eyebrow">Legal</h2>
            <div className="mt-3 flex flex-col gap-0">
              {[
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms of Service", href: "/terms-of-service" },
                { label: "Refund Policy", href: "/refund-policy" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="flex min-h-11 items-center text-[13.5px] text-ink-2 transition hover:text-ink">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h2 className="cf-eyebrow">Contact</h2>
            <div className="mt-3 flex flex-col gap-0">
              {/* Each mark sits beside its own visible label and is aria-hidden,
                  so a screen reader reads the contact once rather than twice.
                  They inherit currentColor, so the hover state comes free and
                  there is nothing to update when the palette moves. */}
              <Link href={`mailto:${COMPANY.email}`} className="flex min-h-11 items-center gap-2 text-[13.5px] text-ink-2 transition hover:text-ink">
                <MailIcon className="h-[15px] w-[15px]" />
                {COMPANY.email}
              </Link>
              <Link href={COMPANY.whatsapp} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-2 text-[13.5px] text-ink-2 transition hover:text-ink">
                <WhatsAppIcon className="h-[15px] w-[15px]" />
                {COMPANY.phone}
              </Link>
              {/* The handle, not the word "Instagram". People search the handle,
                  and it is the only social profile in the Organization schema
                  (layout.tsx sameAs) -- a footer link is what makes that claim
                  verifiable to a crawler instead of an assertion. */}
              <Link href={COMPANY_INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex min-h-11 items-center gap-2 text-[13.5px] text-ink-2 transition hover:text-ink">
                <InstagramIcon className="h-[15px] w-[15px]" />
                {COMPANY_INSTAGRAM_HANDLE}
              </Link>
              {/* The building, linked to the Business Profile — this is the
                  address a visitor navigates to. The registered survey-number
                  address stays in the bottom bar, labelled, so the two read as
                  two facts about one office rather than a contradiction. */}
              <Link
                href={COMPANY_MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-11 max-w-[17rem] items-start gap-2 py-1.5 text-xs leading-5 text-ink-2 transition hover:text-ink"
              >
                <MapPinIcon className="mt-0.5 h-[15px] w-[15px]" />
                <span>{COMPANY_VISITING_ADDRESS_LINE}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        {/* Registered identity. Must match the GST certificate exactly — see lib/company.ts */}
        <div className="mt-8 border-t border-rule pt-5 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          {/* 10px at white/25 was unreadable on this background — that was the
              specific complaint about small text. 12px at white/45 stays quiet
              without being a squint. */}
          <p className="text-xs leading-5 text-ink-2">
            © {new Date().getFullYear()} {COMPANY.displayName} · CIN {COMPANY.cin}
          </p>
          <div className="text-xs leading-5 text-ink-2 sm:text-right">
            <p>Registered office: {COMPANY_ADDRESS_LINE}</p>
            <p className="mt-0.5">GSTIN {COMPANY.gstin} · All prices include GST</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
