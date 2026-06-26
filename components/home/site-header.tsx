"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, MouseEvent } from "react";
import { Menu, X } from "lucide-react";
import { CoreframeWordmarkAtlas } from "@/components/brand/coreframe-wordmark-atlas";
import { InPageLink } from "@/components/ui/in-page-link";
import { trackEvent } from "@/lib/analytics";

const navItems = [
  { label: "How it works", targetId: "how-it-works" },
  { label: "Pricing", targetId: "pricing" },
  { label: "FAQ", targetId: "faq" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function handleLogoClick(e: MouseEvent<HTMLAnchorElement>) {
    trackEvent("logo_click", { location: "header", path: pathname });

    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.replaceState({}, "", "/");
      setOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#03101d]/88 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="COREFRAME Home"
          className="shrink-0"
          onClick={handleLogoClick}
        >
          <CoreframeWordmarkAtlas iconSize={52} compact />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-10 xl:flex">
          {navItems.map((item) => (
            <InPageLink
              key={item.label}
              targetId={item.targetId}
              className="text-[15px] font-medium text-white/80 transition hover:text-white"
              onClick={() =>
                trackEvent("nav_click", {
                  label: item.label,
                  location: "header_nav",
                })
              }
            >
              {item.label}
            </InPageLink>
          ))}
        </nav>

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
            className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
            onClick={() => trackEvent("signup_click", { location: "header_cta" })}
          >
            Sign up
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => {
            setOpen((prev) => !prev);
            trackEvent("mobile_menu_toggle", { open: !open });
          }}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white xl:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#03101d] xl:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6">
            <div className="mb-4">
              <Link href="/" onClick={handleLogoClick}>
                <CoreframeWordmarkAtlas iconSize={44} compact />
              </Link>
            </div>

            {navItems.map((item) => (
              <InPageLink
                key={item.label}
                targetId={item.targetId}
                onClick={() => {
                  setOpen(false);
                  trackEvent("nav_click", {
                    label: item.label,
                    location: "mobile_menu",
                  });
                }}
                className="rounded-lg px-3 py-3 text-sm font-medium text-white/85 transition hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </InPageLink>
            ))}

            <div className="mt-3 flex gap-3">
              <Link
                href="https://control.coreframecloud.com/customer/"
                onClick={() => { setOpen(false); trackEvent("signin_click", { location: "mobile_menu" }); }}
                className="flex-1 inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-white/70"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => { setOpen(false); trackEvent("signup_click", { location: "mobile_menu" }); }}
                className="flex-1 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-900"
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
