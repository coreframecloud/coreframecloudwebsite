"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, MouseEvent } from "react";
import { Menu, X } from "lucide-react";
import { CoreframeWordmarkAtlas } from "@/components/brand/coreframe-wordmark-atlas";
import { trackEvent } from "@/lib/analytics";

const navLinks = [
  { label: "Render 5× Faster", href: "/d5-render" },
  { label: "CFD in Minutes", href: "/ansys-cfd-gpu" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Enterprise", href: "/enterprise" },
];

interface WalletData {
  wallet_balance_rupees: number;
  hourly_rate_rupees_per_hour: number;
  trial_credit_hours: number;
}

interface AuthState {
  token: string;
  user: { full_name: string; email: string; id: string };
  wallet: WalletData | null;
}

function WalletIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <path d="M2 10h20" />
      <circle cx="17" cy="15" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function UserAvatar({ initials, onSignOut }: { initials: string; onSignOut: () => void }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: globalThis.MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setDropdownOpen((p) => !p)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-white transition hover:border-white/40 hover:bg-white/20"
        aria-label="User menu"
      >
        {initials}
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 top-10 z-50 min-w-[160px] rounded-xl border border-white/10 bg-[#03101d] py-1 shadow-xl">
          <button
            type="button"
            onClick={onSignOut}
            className="flex w-full items-center px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("cf_customer_token");
    const userRaw = localStorage.getItem("cf_customer_user");
    if (!token || !userRaw) return;

    let user: AuthState["user"];
    try {
      user = JSON.parse(userRaw);
    } catch {
      return;
    }

    fetch("https://control.coreframecloud.com/api/me/wallet", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("unauthorized");
        return res.json();
      })
      .then((wallet: WalletData) => {
        setAuth({ token, user, wallet });
      })
      .catch(() => {
        // Token expired or invalid — clear and fall back to sign-in
        localStorage.removeItem("cf_customer_token");
        localStorage.removeItem("cf_customer_user");
      });
  }, []);

  function handleSignOut() {
    localStorage.removeItem("cf_customer_token");
    localStorage.removeItem("cf_customer_user");
    setAuth(null);
    window.location.reload();
  }

  function handleLogoClick(e: MouseEvent<HTMLAnchorElement>) {
    trackEvent("logo_click", { location: "header", path: pathname });
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.replaceState({}, "", "/");
      setOpen(false);
    }
  }

  const initials = auth?.user?.full_name
    ? auth.user.full_name.trim().charAt(0).toUpperCase()
    : "?";

  const balance =
    auth?.wallet != null
      ? `₹${auth.wallet.wallet_balance_rupees.toFixed(0)}`
      : null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#03101d]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" aria-label="COREFRAME Home" className="shrink-0" onClick={handleLogoClick}>
          <CoreframeWordmarkAtlas iconSize={44} compact />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center justify-center gap-8 xl:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition hover:text-white ${
                pathname === item.href ? "text-white" : "text-white/70"
              }`}
              onClick={() => trackEvent("nav_click", { label: item.label, location: "header_nav" })}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          {mounted && auth ? (
            <>
              {/* Wallet chip — display only until Razorpay payment page is live */}
              {balance && (
                <span
                  title="Recharge coming soon"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 px-2.5 py-1 rounded-full cursor-default"
                >
                  <WalletIcon />
                  {balance}
                </span>
              )}
              {/* My Activity link */}
              <Link
                href="/my-activity"
                className="text-sm font-medium text-white/70 transition hover:text-white"
                onClick={() => trackEvent("my_activity_click", { location: "header_cta" })}
              >
                My Activity
              </Link>
              {/* Avatar + dropdown */}
              <UserAvatar initials={initials} onSignOut={handleSignOut} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-white/55 transition hover:text-white"
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
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => {
            setOpen((p) => !p);
            trackEvent("mobile_menu_toggle", { open: !open });
          }}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white xl:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-[#03101d] xl:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setOpen(false);
                  trackEvent("nav_click", { label: item.label, location: "mobile_menu" });
                }}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            {mounted && auth ? (
              <div className="mt-3 flex flex-col gap-2">
                {balance && (
                  <div className="flex items-center gap-2 px-3 py-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 px-2.5 py-1 rounded-full">
                      <WalletIcon />
                      {balance}
                    </span>
                    <span className="text-sm text-white/60">{auth.user.full_name}</span>
                  </div>
                )}
                <Link
                  href="/my-activity"
                  onClick={() => { setOpen(false); trackEvent("my_activity_click", { location: "mobile_menu" }); }}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  My Activity
                </Link>
                <button
                  type="button"
                  onClick={() => { setOpen(false); handleSignOut(); }}
                  className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="mt-3 flex gap-3">
                <Link
                  href="/login"
                  onClick={() => { setOpen(false); trackEvent("signin_click", { location: "mobile_menu" }); }}
                  className="flex-1 inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white/70"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => { setOpen(false); trackEvent("signup_click", { location: "mobile_menu" }); }}
                  className="flex-1 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-900"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
