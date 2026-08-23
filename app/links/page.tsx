/**
 * The one link in the Instagram bio.
 *
 * Kept as a SERVER component. It exports `metadata`, which a client component
 * may not do, and the price below is read from the live rate card — the same
 * rule as every other page on this site. The draft version of this file used
 * inline `onMouseOver`/`onMouseOut` handlers, which a server component cannot
 * pass ("Event handlers cannot be passed to Client Component props") and which
 * would have failed the build outright. The hover is CSS instead, which also
 * works before hydration — worth having on a page whose whole audience arrives
 * through the Instagram in-app browser on a phone.
 */

import type { Metadata } from "next";
import { getRateCard, adhocRate, billingSentence } from "@/lib/rate-card";

export const metadata: Metadata = {
  title: "Coreframe Cloud — Links",
  // NO PRICE in the metadata. A description is cached by search engines and
  // quoted by answer engines for months, and it is the one string on the page
  // that cannot read the live rate card without making metadata generation do a
  // network call. The draft carried "₹399/hr" here, twice, while billing had
  // been ₹299 for days.
  description:
    "RTX 5080 GPU workstations for architects and creative studios. Billed per minute, GST included. Hosted in Bengaluru, India.",
  alternates: { canonical: "/links" },
  openGraph: {
    title: "Coreframe Cloud",
    description:
      "GPU workstations for architects. RTX 5080 · billed per minute · free trial, no card.",
    url: "https://www.coreframecloud.com/links",
    siteName: "Coreframe Cloud",
    // public/og-image.png does not exist — the draft pointed at it, which would
    // have shipped a broken preview card on exactly the surface that matters
    // most here: the WhatsApp and Instagram share sheet.
    images: [{ url: "https://www.coreframecloud.com/logo-horizontal.png", width: 1200, height: 630 }],
  },
};

type BioLink = {
  label: string;
  href: string;
  primary?: boolean;
  icon: string;
  badge?: string;
};

/**
 * Every href is a route that exists. The draft pointed at /cfd and /pricing,
 * neither of which is a route: pricing is an anchor on the homepage (`/#pricing`,
 * which is what the footer uses) and the CFD page is /ansys-cfd-gpu. Two of the
 * five links in the Instagram bio would have 404'd.
 *
 * /tools is real but is NOT a Next route — next.config.ts rewrites it to the
 * control plane. It resolves; do not "fix" it by pointing somewhere else.
 */
function bioLinks(rate: string | null): BioLink[] {
  return [
    {
      label: "Start Free — 200 GPU minutes, no card",
      href: "https://www.coreframecloud.com/?utm_source=instagram&utm_medium=bio&utm_content=start_free",
      primary: true,
      icon: "⚡",
    },
    {
      label: "IFC Checker — free, no signup",
      href: "https://www.coreframecloud.com/tools?utm_source=instagram&utm_medium=bio&utm_content=ifc_tool",
      icon: "🔧",
    },
    {
      label: "CFD on GPU — talk to us",
      href: "https://www.coreframecloud.com/ansys-cfd-gpu?utm_source=instagram&utm_medium=bio&utm_content=cfd",
      icon: "🌊",
    },
    {
      label: "WhatsApp us",
      href: "https://wa.me/916366889488?text=Hi%2C+I+saw+your+Instagram+and+want+to+know+more+about+Coreframe+Cloud.",
      icon: "💬",
    },
    {
      // The rate is live or it is absent. Never a number billing does not charge.
      label: rate ? `Pricing — ${rate}/hr, per-minute billing` : "Pricing — per-minute billing",
      // Query BEFORE the fragment. `/#pricing?utm_source=...` puts the whole
      // query string inside the fragment, where it never reaches analytics —
      // the link still works, so the tracking silently measures nothing.
      href: "https://www.coreframecloud.com/?utm_source=instagram&utm_medium=bio&utm_content=pricing#pricing",
      icon: "₹",
    },
  ];
}

export default async function LinksPage() {
  const card = await getRateCard();
  const rate = adhocRate(card);

  return (
    <>
      {/* Hover without JavaScript, so a server component can own this page and
          the effect works before hydration. */}
      <style>{`
        .cf-bio-link { transition: opacity .2s ease, transform .2s ease; }
        .cf-bio-link:hover { opacity: .85; transform: translateY(-1px); }
        .cf-bio-link:focus-visible { outline: 2px solid #2D7FF9; outline-offset: 3px; }
      `}</style>

      <main
        style={{
          minHeight: "100vh",
          background: "#07090F",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "48px 20px 80px",
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 8, fontSize: 28, fontWeight: 900, letterSpacing: 2 }}>
          <span style={{ color: "#fff" }}>CORE</span>
          <span style={{ color: "#2D7FF9" }}>FRAME</span>
          <span
            style={{
              color: "#2D7FF9",
              fontSize: 14,
              fontWeight: 300,
              letterSpacing: 2,
              marginLeft: 8,
              verticalAlign: "middle",
            }}
          >
            CLOUD
          </span>
        </div>

        {/* Tagline */}
        <p style={{ color: "#7A9CC0", fontSize: 14, marginBottom: 8, letterSpacing: 0.5, textAlign: "center" }}>
          RTX 5080 GPU workstations for architects &amp; creative studios
        </p>
        <p style={{ color: "#8FA3BC", fontSize: 13, marginBottom: 40, textAlign: "center" }}>
          {rate ? `${rate}/hr · ` : ""}Billed per minute · Bengaluru, India
        </p>

        {/* Link buttons */}
        <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 14 }}>
          {bioLinks(rate).map((link) => (
            <a
              key={link.href}
              className="cf-bio-link"
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 20px",
                borderRadius: 12,
                background: link.primary ? "#2D7FF9" : "rgba(255,255,255,0.03)",
                border: `1px solid ${link.primary ? "#2D7FF9" : "rgba(45,127,249,0.2)"}`,
                color: "#fff",
                textDecoration: "none",
                fontSize: 15,
                fontWeight: link.primary ? 700 : 500,
                boxShadow: link.primary ? "0 0 24px rgba(45,127,249,0.35)" : "none",
                position: "relative",
              }}
            >
              <span style={{ fontSize: 20 }} aria-hidden>
                {link.icon}
              </span>
              <span style={{ flex: 1 }}>{link.label}</span>
              {link.badge ? (
                <span
                  style={{
                    background: "#F59E0B",
                    color: "#000",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 10px",
                    borderRadius: 20,
                    letterSpacing: 1,
                  }}
                >
                  {link.badge}
                </span>
              ) : null}
              <span aria-hidden style={{ color: link.primary ? "rgba(255,255,255,0.6)" : "#8FA3BC" }}>
                →
              </span>
            </a>
          ))}
        </div>

        {/* One honest line about how billing works, from the rate card itself. */}
        <p style={{ marginTop: 28, maxWidth: 420, color: "#7A9CC0", fontSize: 12, lineHeight: 1.6, textAlign: "center" }}>
          {billingSentence(card)}
        </p>

        {/* Instagram handle */}
        <div style={{ marginTop: 40, color: "#8FA3BC", fontSize: 13, letterSpacing: 1 }}>@coreframecloud</div>
      </main>
    </>
  );
}
