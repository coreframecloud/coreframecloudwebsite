"use client";

import Link from "next/link";
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
