"use client";

import Link from "next/link";
import type React from "react";
import type { ComponentProps } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * A next/link that sends one GA4 event on click, for server components that
 * cannot attach an onClick themselves (the homepage hero and bands). Same
 * event names as the rest of the site (nav_click, signup_click, ...), with a
 * `location` param so each CTA is told apart in reports.
 */
export function TrackedLink({
  event,
  params,
  onClick,
  ...props
}: ComponentProps<typeof Link> & {
  event: string;
  params: Record<string, string | number | boolean | undefined>;
}) {
  // /studio is not a page of this app: it is rewritten to the Studio
  // application on the control plane (next.config.ts). A plain <a> makes the
  // browser load it directly instead of the client router asking for a React
  // payload that does not exist there first.
  if (typeof props.href === "string" && /^\/studio(?=$|[/?#])/.test(props.href)) {
    const { href, prefetch: _p, replace: _r, scroll: _s, ...rest } = props;
    void _p; void _r; void _s;
    return (
      <a
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        href={href}
        onClick={(e) => {
          trackEvent(event, params);
          onClick?.(e);
        }}
      />
    );
  }
  return (
    <Link
      {...props}
      onClick={(e) => {
        trackEvent(event, params);
        onClick?.(e);
      }}
    />
  );
}
