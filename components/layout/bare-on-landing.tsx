"use client";

import { usePathname } from "next/navigation";

/**
 * The paid-ad landing pages (owner, 20 Oct 2026: "send ad traffic to a page
 * with ONE job — clear promise, short video, one button; no menu/blog/careers").
 * They lose the strip, the header and the floating button like /signup, and
 * the site footer as well (NoFooterOnAdPages): their own footer carries only
 * the legal links. /signup keeps the site footer, as before.
 */
const AD_LANDING_PATHS = new Set(["/go/gpu", "/go/cfd"]);

/**
 * Hides the site chrome on paid landing pages.
 *
 * On 20 Sep 2026 a campaign put 87 people on /signup and not one of them
 * submitted an email — `magic_link_tokens` recorded zero rows for the day, so
 * nobody even reached the ask. Measured on the live page, the email input sat
 * 673px down a 657px viewport: below the fold, behind a promo strip, a
 * seven-link nav, an offer box, a logo, a headline, a Google button and two
 * tabs.
 *
 * A nav bar is navigation. On a page someone arrived at because we paid for
 * their click, every link in it is an exit, and together they push the one
 * control that matters off the screen. So /signup gets no strip and no header;
 * the logo inside the form is the only way back into the site, which is the
 * point.
 *
 * It takes its children rather than importing them, because IntroStrip is an
 * async server component and cannot be imported into a client module. Rendered
 * on the server, passed in as a node, dropped here.
 *
 * Keep BARE short. Anything listed stops being reachable by the ordinary
 * browsing path, so it only makes sense for a page whose entire job is one
 * action.
 */
const BARE = new Set(["/signup", ...AD_LANDING_PATHS]);

export function BareOnLanding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname && BARE.has(pathname)) return null;
  return <>{children}</>;
}

/**
 * The promo strip ("Get started", "First top-up ...") sells sign-up. A customer on their own job page,
 * account or Studio is already signed up, and the strip's moving links sit right above working
 * controls (UI test, 17 Oct 2026: a click meant for the quote landed on it). So no strip there.
 */
const NO_STRIP_PREFIXES = ["/cfd/jobs", "/my-activity", "/studio"];

export function NoStripOnAppPages({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname && NO_STRIP_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;
  return <>{children}</>;
}

/** Drops the site footer (menus, guides, blog) on the paid-ad landing pages only. */
export function NoFooterOnAdPages({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname && AD_LANDING_PATHS.has(pathname)) return null;
  return <>{children}</>;
}
