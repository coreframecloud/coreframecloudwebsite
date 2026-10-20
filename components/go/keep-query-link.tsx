"use client";

import { useSyncExternalStore } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * The one button on a paid landing page (/go/*), carrying the page's own
 * query string (utm_*, fbclid, gclid, ?currency=) to its destination.
 *
 * AttributionCapture has already stored the campaign in cf_attribution by the
 * time anyone clicks, and that record is what the sign-up posts. Passing the
 * query along as well costs nothing and keeps the campaign visible in the
 * next page's URL, in GA's page_location and in Meta's PageView, so a blocked
 * localStorage does not turn a paid click into "direct".
 *
 * The server renders the bare href; the browser fills the query in after
 * hydration (useSyncExternalStore, so server and client markup agree).
 */
const noop = () => () => {};

function withQuery(href: string, search: string): string {
  if (!search || search === "?") return href;
  const hashAt = href.indexOf("#");
  const path = hashAt >= 0 ? href.slice(0, hashAt) : href;
  const hash = hashAt >= 0 ? href.slice(hashAt) : "";
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}${search.replace(/^\?/, "")}${hash}`;
}

export function KeepQueryLink({
  href,
  event,
  className,
  children,
}: {
  href: string;
  /** GA4 event name sent on click (no-op when gtag is absent). */
  event: string;
  className?: string;
  children: React.ReactNode;
}) {
  const search = useSyncExternalStore(
    noop,
    () => window.location.search,
    () => "",
  );
  return (
    <a
      href={withQuery(href, search)}
      className={className}
      onClick={() => trackEvent(event, { link_url: href })}
    >
      {children}
    </a>
  );
}
