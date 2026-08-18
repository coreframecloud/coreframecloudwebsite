"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, MouseEvent } from "react";
import { Menu, X } from "lucide-react";
import { CoreframeWordmarkAtlas } from "@/components/brand/coreframe-wordmark-atlas";
import { trackEvent } from "@/lib/analytics";

const navLinks = [
  { label: "Render 5× Faster", href: "/d5-render-cloud-workstation" },
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
  user: { full_name: string; email: string; id: string; role?: string; customer_type?: string; status?: string; account_number?: number | null };
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

function UserAvatar({ initials, accountNumber, onSignOut }: { initials: string; accountNumber?: number | null; onSignOut: () => void }) {
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
        <div className="absolute right-0 top-10 z-50 min-w-[220px] rounded-xl border border-white/10 bg-[#03101d] py-1 shadow-xl">
          {/*
            Account number, front and centre. It is the first thing support asks
            for and the reference on every invoice, so it belongs where someone
            can read it out without hunting. Safe to display: it identifies the
            account but authorises nothing — joining an organisation needs a
            join code, never this number.
          */}
          {accountNumber ? (
            <div className="border-b border-white/10 px-4 py-2.5">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                Account number
              </div>
              <div className="mt-0.5 font-mono text-sm text-white/90 select-all">
                {accountNumber}
              </div>
            </div>
          ) : null}
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

    // Decode JWT exp to clear stale token immediately (no flicker)
    function isExpired(tok: string): boolean {
      try {
        const payload = JSON.parse(atob(tok.split(".")[1]));
        return payload.exp * 1000 < Date.now();
      } catch { return true; }
    }
    if (isExpired(token)) {
      localStorage.removeItem("cf_customer_token");
      localStorage.removeItem("cf_customer_user");
      return;
    }

    let cachedUser: AuthState["user"];
    try {
      cachedUser = JSON.parse(userRaw);
    } catch {
      return;
    }

    // Fetch wallet + fresh user info (so role/customer_type are always current)
    Promise.all([
      fetch("https://control.coreframecloud.com/api/me/wallet", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("https://control.coreframecloud.com/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(async ([walletRes, meRes]) => {
        if (walletRes.status === 401 || meRes.status === 401) throw new Error("unauthorized");
        // 403 = a valid but verification-scoped token. The account exists and
        // the person IS signed in — they just cannot use the product yet. Keep
        // the session so "Sign out" works and stays truthful; the header used
        // to say "Sign out" while every page said "please sign in".
        if (walletRes.status === 403 || meRes.status === 403) {
          setAuth({ token, user: { ...cachedUser, status: "pending_approval" }, wallet: null });
          return;
        }
        const wallet: WalletData = walletRes.ok ? await walletRes.json() : null;
        const freshUser = meRes.ok ? await meRes.json() : null;
        // Merge fresh role/customer_type into cached user
        const user = freshUser
          ? { ...cachedUser, role: freshUser.role, customer_type: freshUser.customer_type }
          : cachedUser;
        // Persist updated role so other pages see it
        localStorage.setItem("cf_customer_user", JSON.stringify(user));
        setAuth({ token, user, wallet });
      })
      .catch(() => {
        // Token expired or invalid — clear immediately
        localStorage.removeItem("cf_customer_token");
        localStorage.removeItem("cf_customer_user");
        setAuth(null);
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

  const accountNumber = auth?.user?.account_number ?? null;
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
                /* The chip was inert and captioned "Recharge coming soon".
                   It is the most obvious place a customer clicks to add money,
                   so it now goes where that happens. */
                <Link
                  href="/my-activity#add-funds"
                  title="Add funds"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 px-2.5 py-1 rounded-full transition hover:bg-emerald-400/20 hover:text-emerald-200"
                  onClick={() => trackEvent("wallet_chip_click", { location: "header" })}
                >
                  <WalletIcon />
                  {balance}
                </Link>
              )}
              {/* Account link. A pending account cannot load My Activity — the
                  API refuses it — so the label has to say what the link
                  actually does. The href was already conditional here while the
                  label stayed "My Activity", which sent people to a
                  verification page they had not asked for. The mobile menu got
                  this right; the desktop nav did not. */}
              {auth.user?.status === "pending_approval" ? (
                <Link
                  href="/verify"
                  className="text-sm font-semibold text-amber-300 transition hover:text-amber-200"
                  onClick={() => trackEvent("finish_verification_click", { location: "header_cta" })}
                >
                  Complete verification
                </Link>
              ) : (
                <Link
                  href="/my-activity"
                  className="text-sm font-medium text-white/70 transition hover:text-white"
                  onClick={() => trackEvent("my_activity_click", { location: "header_cta" })}
                >
                  My Activity
                </Link>
              )}
              {/* Org admin link — visible only to org_admin role */}
              {auth.user?.role === "org_admin" && (
                <Link
                  href="/org-admin"
                  className="text-sm font-medium text-cyan-400/80 transition hover:text-cyan-300"
                  onClick={() => trackEvent("org_admin_click", { location: "header_cta" })}
                >
                  Org Portal
                </Link>
              )}
              {/* Avatar + dropdown */}
              <UserAvatar initials={initials} accountNumber={accountNumber} onSignOut={handleSignOut} />
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
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
                onClick={() => trackEvent("signup_click", { location: "header_cta" })}
              >
                Get started
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
                    <Link
                      href="/my-activity#add-funds"
                      onClick={() => { setOpen(false); trackEvent("wallet_chip_click", { location: "mobile_menu" }); }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 px-2.5 py-1 rounded-full"
                    >
                      <WalletIcon />
                      {balance}
                    </Link>
                    <span className="text-sm text-white/60">{auth.user.full_name}</span>
                  </div>
                )}
                {/* An unverified account cannot load My Activity — the API
                    refuses its verification-scoped token — so send it to the
                    step that actually unblocks the person. */}
                <Link
                  href={auth.user?.status === "pending_approval" ? "/verify" : "/my-activity"}
                  onClick={() => { setOpen(false); trackEvent("my_activity_click", { location: "mobile_menu" }); }}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  {auth.user?.status === "pending_approval" ? "Complete verification" : "My Activity"}
                </Link>
                {auth.user?.role === "org_admin" && (
                  <Link
                    href="/org-admin"
                    onClick={() => { setOpen(false); trackEvent("org_admin_click", { location: "mobile_menu" }); }}
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-cyan-400/80 transition hover:bg-white/5 hover:text-cyan-300"
                  >
                    Org Portal
                  </Link>
                )}
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
                  href="/login"
                  onClick={() => { setOpen(false); trackEvent("signup_click", { location: "mobile_menu" }); }}
                  className="flex-1 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-900"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
