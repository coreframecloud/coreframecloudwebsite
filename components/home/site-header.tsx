"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useSyncExternalStore, MouseEvent } from "react";
import { Menu, X } from "lucide-react";
import { CoreframeWordmarkAtlas } from "@/components/brand/coreframe-wordmark-atlas";
import { trackEvent } from "@/lib/analytics";
import { getIntroOffer, hoursLabel, rupees } from "@/lib/rate-card";
import { useRateCard } from "@/lib/use-rate-card";
import { API_BASE } from "@/lib/api-base";
import { OFFERINGS, type OfferingStatus } from "@/lib/offerings";

// True on the client after hydration, false during SSR — without a setState
// in an effect (react-hooks/set-state-in-effect).
const noopSubscribe = () => () => {};
function useMounted(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/**
 * The nav leads with the THREE services, as equals (owner, 13 Oct 2026: "Our
 * 3 service offering must be on hero and highlighted"): GPU workstations, CFD
 * and Studio, each with its status, then Pricing and Enterprise. Names,
 * order, links and status come from lib/offerings.ts, the same list the
 * homepage hero cards and the footer read.
 *
 * The per-application SEO pages (D5, Lumion, Enscape) stay out of the nav;
 * they are reached from the body, the footer and search.
 */
/**
 * Pages that open on a dark full-bleed hero. There the header starts
 * transparent with white text over the image and turns solid white once the
 * page scrolls (the SiteGround pattern, 11 Oct 2026). Everywhere else it
 * starts solid. Add a path here only if its first section is a dark hero.
 */
const DARK_HERO = new Set(["/"]);

type NavLink = { label: string; href: string; status?: OfferingStatus; blurb?: string };

const serviceLinks: NavLink[] = OFFERINGS.map((o) => ({
  label: o.name,
  href: o.href,
  // "Live" goes unsaid in the bar; the two newer services carry a tag.
  status: o.status === "Live" ? undefined : o.status,
  blurb: o.blurb,
}));

const navLinks: NavLink[] = [
  ...serviceLinks,
  { label: "Pricing", href: "/pricing" },
  { label: "Enterprise", href: "/enterprise" },
];

function NavTag({ status, overHero }: { status: OfferingStatus; overHero: boolean }) {
  const tone =
    status === "New"
      ? "bg-[#2f6be0] text-white"
      : overHero
        ? "bg-white/15 text-white"
        : "bg-[#fff1c7] text-[#6b4e00]";
  return (
    <span className={`rounded-full px-1.5 py-0.5 text-[9.5px] leading-none font-semibold tracking-[0.08em] uppercase ${tone}`}>
      {status === "Opening soon" ? "Soon" : status}
    </span>
  );
}

interface WalletData {
  wallet_balance_rupees: number;
  hourly_rate_rupees_per_hour: number;
  // Paid-first onboarding (10 Oct 2026); absent on an older control plane,
  // in which case the header shows the plain "My Activity" link.
  paid_access?: boolean;
  intro_offer_available?: boolean;
  min_topup_rupees_now?: number;
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
        className="flex h-11 w-11 items-center justify-center rounded-full border border-rule-strong bg-paper-2 text-xs font-semibold text-ink transition hover:border-rule-strong hover:bg-paper-2"
        aria-label="User menu"
      >
        {initials}
      </button>
      {dropdownOpen && (
        <div className="absolute top-10 right-0 z-50 w-[220px] max-w-[calc(100vw-2rem)] rounded-cf border border-rule bg-paper py-1 shadow-xl">
          {/*
            Account number, front and centre. It is the first thing support asks
            for and the reference on every invoice, so it belongs where someone
            can read it out without hunting. Safe to display: it identifies the
            account but authorises nothing — joining an organisation needs a
            join code, never this number.
          */}
          {accountNumber ? (
            <div className="border-b border-rule px-4 py-2.5">
              <div className="cf-eyebrow">
                Account number
              </div>
              <div className="mt-0.5 font-mono text-sm break-all text-ink select-all">
                {accountNumber}
              </div>
            </div>
          ) : null}
          <button
            type="button"
            onClick={onSignOut}
            className="flex w-full items-center px-4 py-2.5 text-sm text-ink-2 transition hover:bg-paper-2 hover:text-ink"
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
  const mounted = useMounted();
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
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
      fetch(`${API_BASE}/me/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE}/me`, {
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

  // What the account CTA should be. Pending: finish sign-up. Active but never
  // paid: the first top-up, with the intro offer's hours when it is still
  // claimable — all numbers from the wallet status and the rate card.
  const pending = auth?.user?.status === "pending_approval";
  const needsTopup = !pending && auth?.wallet?.paid_access === false;
  // Only fetched for the one visitor who will see the offer.
  const card = useRateCard(needsTopup && auth?.wallet?.intro_offer_available === true);
  const intro = getIntroOffer(card);
  const topupAmount = auth?.wallet?.min_topup_rupees_now ?? intro?.priceRupees ?? null;
  const topupLabel = topupAmount
    ? `Add ${rupees(topupAmount)}${intro && intro.priceRupees === topupAmount ? ` · ${hoursLabel(intro.hours, true)}` : ""}`
    : "Add funds to start";

  const balance =
    auth?.wallet != null
      ? `₹${auth.wallet.wallet_balance_rupees.toFixed(0)}`
      : null;

  const overHero = DARK_HERO.has(pathname) && !scrolled && !open;
  const linkTone = overHero ? "text-white/80 hover:text-white" : "text-ink-2 hover:text-ink";

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        DARK_HERO.has(pathname) ? "-mb-16" : ""
      } ${
        overHero
          ? "border-transparent bg-transparent"
          : "border-rule bg-white/95 shadow-[0_1px_12px_rgba(16,17,19,0.06)] backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" aria-label="COREFRAME Home" className="flex min-h-11 shrink-0 items-center" onClick={handleLogoClick}>
          <CoreframeWordmarkAtlas iconSize={44} compact variant={overHero ? "light" : "dark"} />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main" className="hidden flex-1 items-center justify-center gap-7 xl:flex">
          {navLinks.map((item, i) => (
            <span key={item.href} className="flex items-center gap-7">
              {/* A hairline between the three services and Pricing/Enterprise. */}
              {i === serviceLinks.length ? (
                <span aria-hidden className={`h-4 w-px ${overHero ? "bg-white/30" : "bg-rule-strong"}`} />
              ) : null}
              <Link
                href={item.href}
                className={`inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap transition ${
                  overHero ? linkTone : pathname === item.href ? "text-ink" : "text-ink-2 hover:text-ink"
                }`}
                onClick={() => trackEvent("nav_click", { label: item.label, location: "header_nav" })}
              >
                {item.label}
                {item.status ? <NavTag status={item.status} overHero={overHero} /> : null}
              </Link>
            </span>
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
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue/10 text-blue border border-blue/20 px-2.5 py-1 rounded-full transition hover:bg-blue/20 hover:text-blue"
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
              {pending ? (
                <Link
                  href="/verify"
                  className="text-sm font-semibold text-blue transition hover:text-blue-ink"
                  onClick={() => trackEvent("finish_signup_click", { location: "header_cta" })}
                >
                  Finish sign-up
                </Link>
              ) : needsTopup ? (
                <Link
                  href="/my-activity?topup=1"
                  className="inline-flex items-center justify-center rounded-cf bg-blue px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue"
                  onClick={() => trackEvent("first_topup_click", { location: "header_cta" })}
                >
                  {topupLabel}
                </Link>
              ) : (
                <Link
                  href="/my-activity"
                  className={`text-sm font-medium transition ${linkTone}`}
                  onClick={() => trackEvent("my_activity_click", { location: "header_cta" })}
                >
                  My Activity
                </Link>
              )}
              {/* Org admin link — visible only to org_admin role */}
              {auth.user?.role === "org_admin" && (
                <Link
                  href="/org-admin"
                  className="text-sm font-medium text-blue/80 transition hover:text-blue"
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
                className={`text-sm font-medium transition ${linkTone}`}
                onClick={() => trackEvent("signin_click", { location: "header_cta" })}
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition ${
                  overHero ? "bg-white text-ink hover:bg-white/90" : "bg-ink text-white hover:bg-[#2a2d33]"
                }`}
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
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full border xl:hidden ${
            overHero ? "border-white/30 bg-white/10 text-white" : "border-rule bg-paper-2 text-ink"
          }`}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-rule bg-paper-2 xl:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            <p className="px-3 pt-1 pb-1 text-[11px] font-semibold tracking-[0.12em] text-ink-3 uppercase">Services</p>
            {serviceLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setOpen(false);
                  trackEvent("nav_click", { label: item.label, location: "mobile_menu" });
                }}
                className="flex flex-col rounded-cf px-3 py-2.5 transition hover:bg-paper"
              >
                <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                  {item.label}
                  {item.status ? <NavTag status={item.status} overHero={false} /> : null}
                </span>
                <span className="text-[13px] text-ink-2">{item.blurb}</span>
              </Link>
            ))}
            <div className="my-2 h-px bg-rule" aria-hidden />
            {navLinks.slice(serviceLinks.length).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setOpen(false);
                  trackEvent("nav_click", { label: item.label, location: "mobile_menu" });
                }}
                className="rounded-cf px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-paper-2 hover:text-ink"
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
                      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue/10 text-blue border border-blue/20 px-2.5 py-1 rounded-full"
                    >
                      <WalletIcon />
                      {balance}
                    </Link>
                    <span className="text-sm text-ink-2">{auth.user.full_name}</span>
                  </div>
                )}
                {/* An unverified account cannot load My Activity — the API
                    refuses its verification-scoped token — so send it to the
                    step that actually unblocks the person. */}
                {needsTopup && (
                  <Link
                    href="/my-activity?topup=1"
                    onClick={() => { setOpen(false); trackEvent("first_topup_click", { location: "mobile_menu" }); }}
                    className="rounded-cf bg-blue px-3 py-2.5 text-sm font-semibold text-white"
                  >
                    {topupLabel}
                  </Link>
                )}
                <Link
                  href={pending ? "/verify" : "/my-activity"}
                  onClick={() => { setOpen(false); trackEvent(pending ? "finish_signup_click" : "my_activity_click", { location: "mobile_menu" }); }}
                  className="rounded-cf px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-paper-2 hover:text-ink"
                >
                  {pending ? "Finish sign-up" : "My Activity"}
                </Link>
                {auth.user?.role === "org_admin" && (
                  <Link
                    href="/org-admin"
                    onClick={() => { setOpen(false); trackEvent("org_admin_click", { location: "mobile_menu" }); }}
                    className="rounded-cf px-3 py-2.5 text-sm font-medium text-blue/80 transition hover:bg-paper-2 hover:text-blue"
                  >
                    Org Portal
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => { setOpen(false); handleSignOut(); }}
                  className="rounded-cf px-3 py-2.5 text-left text-sm font-medium text-ink-2 transition hover:bg-paper-2 hover:text-ink"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="mt-3 flex gap-3">
                <Link
                  href="/login"
                  onClick={() => { setOpen(false); trackEvent("signin_click", { location: "mobile_menu" }); }}
                  className="flex-1 inline-flex items-center justify-center rounded-cf border border-rule px-5 py-2.5 text-sm font-medium text-ink-2"
                >
                  Sign in
                </Link>
                <Link
                  href="/login"
                  onClick={() => { setOpen(false); trackEvent("signup_click", { location: "mobile_menu" }); }}
                  className="flex-1 inline-flex items-center justify-center rounded-cf bg-blue px-5 py-2.5 text-sm font-semibold text-white"
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
