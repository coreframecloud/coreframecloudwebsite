"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, MouseEvent } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { CoreframeWordmarkAtlas } from "@/components/brand/coreframe-wordmark-atlas";
import { InPageLink } from "@/components/ui/in-page-link";
import { trackEvent } from "@/lib/analytics";

const services = [
  {
    label: "3D Rendering",
    sub: "D5 Render · Lumion · Enscape",
    href: "/d5-render",
    icon: "🖥️",
  },
  {
    label: "CFD / Ansys Simulation",
    sub: "RTX 6000 Pro · H100 · Per-job",
    href: "/ansys-cfd-gpu",
    icon: "🔬",
  },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close services dropdown on outside click
  useEffect(() => {
    function handler(e: Event) {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleLogoClick(e: MouseEvent<HTMLAnchorElement>) {
    trackEvent("logo_click", { location: "header", path: pathname });
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.replaceState({}, "", "/");
      setMenuOpen(false);
    }
  }

  const pricingLink = pathname === "/"
    ? null // rendered as InPageLink below
    : { href: "/#pricing" };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#03101d]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" aria-label="COREFRAME Home" className="shrink-0" onClick={handleLogoClick}>
          <CoreframeWordmarkAtlas iconSize={44} compact />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center justify-center gap-8 xl:flex">

          {/* Services dropdown */}
          <div ref={servicesRef} className="relative">
            <button
              type="button"
              onClick={() => setServicesOpen((v) => !v)}
              className="flex items-center gap-1 text-sm font-medium text-white/80 transition hover:text-white"
              aria-expanded={servicesOpen}
            >
              Services
              <ChevronDown size={14} className={`transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
            </button>

            {servicesOpen && (
              <div className="absolute left-1/2 top-full mt-3 w-72 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#07121e] p-2 shadow-xl shadow-black/40">
                {services.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    onClick={() => {
                      setServicesOpen(false);
                      trackEvent("nav_click", { label: s.label, location: "services_dropdown" });
                    }}
                    className="flex items-start gap-3 rounded-xl px-4 py-3 transition hover:bg-white/5"
                  >
                    <span className="mt-0.5 text-lg">{s.icon}</span>
                    <span>
                      <span className="block text-sm font-semibold text-white">{s.label}</span>
                      <span className="block text-xs text-white/45 mt-0.5">{s.sub}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Pricing — anchor on home, link on other pages */}
          {pathname === "/" ? (
            <InPageLink
              targetId="pricing"
              className="text-sm font-medium text-white/80 transition hover:text-white"
              onClick={() => trackEvent("nav_click", { label: "Pricing", location: "header_nav" })}
            >
              Pricing
            </InPageLink>
          ) : (
            <Link
              href="/#pricing"
              className="text-sm font-medium text-white/80 transition hover:text-white"
              onClick={() => trackEvent("nav_click", { label: "Pricing", location: "header_nav" })}
            >
              Pricing
            </Link>
          )}

          <Link
            href="/enterprise"
            className="text-sm font-medium text-white/80 transition hover:text-white"
            onClick={() => trackEvent("nav_click", { label: "Enterprise", location: "header_nav" })}
          >
            Enterprise
          </Link>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          <Link
            href="https://control.coreframecloud.com/customer/"
            className="text-sm font-medium text-white/60 transition hover:text-white"
            onClick={() => trackEvent("signin_click", { location: "header_cta" })}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
            onClick={() => trackEvent("signup_click", { location: "header_cta" })}
          >
            Sign up
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => {
            setMenuOpen((prev) => !prev);
            trackEvent("mobile_menu_toggle", { open: !menuOpen });
          }}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white xl:hidden"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-[#03101d] xl:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">

            {/* Services label */}
            <div className="px-3 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
              Services
            </div>
            {services.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                onClick={() => {
                  setMenuOpen(false);
                  trackEvent("nav_click", { label: s.label, location: "mobile_menu" });
                }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/5 hover:text-white"
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </Link>
            ))}

            <div className="my-1 border-t border-white/8" />

            <Link
              href="/#pricing"
              onClick={() => { setMenuOpen(false); trackEvent("nav_click", { label: "Pricing", location: "mobile_menu" }); }}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/5 hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="/enterprise"
              onClick={() => { setMenuOpen(false); trackEvent("nav_click", { label: "Enterprise", location: "mobile_menu" }); }}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/5 hover:text-white"
            >
              Enterprise
            </Link>

            <div className="mt-3 flex gap-3">
              <Link
                href="https://control.coreframecloud.com/customer/"
                onClick={() => { setMenuOpen(false); trackEvent("signin_click", { location: "mobile_menu" }); }}
                className="flex-1 inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white/70"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => { setMenuOpen(false); trackEvent("signup_click", { location: "mobile_menu" }); }}
                className="flex-1 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-900"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
