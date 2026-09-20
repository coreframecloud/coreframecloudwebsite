"use client";

import { usePathname } from "next/navigation";

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
 * It takes its children rather than importing them, because TrialStrip is an
 * async server component and cannot be imported into a client module. Rendered
 * on the server, passed in as a node, dropped here.
 *
 * Keep BARE short. Anything listed stops being reachable by the ordinary
 * browsing path, so it only makes sense for a page whose entire job is one
 * action.
 */
const BARE = new Set(["/signup"]);

export function BareOnLanding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname && BARE.has(pathname)) return null;
  return <>{children}</>;
}
