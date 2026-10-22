"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/analytics";

/**
 * Fires one ViewContent (Meta) / view_item (GA4) per product page view.
 *
 * FUNNEL AUDIT, 22 Oct 2026. The old version waited up to five seconds for
 * the pixel and then sent anyway. gtag (afterInteractive) is there within a
 * second; the pixel (lazyOnload) is not there within five on a phone on 4G,
 * so the event went to GA4 only and Meta recorded 2 ViewContents against
 * 3,657 landing-page views in 30 days. Now the GA4 half goes straight away
 * and the Meta half is parked in the pixel's replay queue (lib/analytics.ts),
 * which the pixel snippet in app/layout.tsx flushes right after init, on
 * this page or the next. Nothing is dropped for being early.
 */
export function ViewContent({ name, category }: { name: string; category: string }) {
  useEffect(() => {
    // One short wait so gtag, which is nearly always present by then, gets
    // the view_item directly instead of being missed on a fast navigation.
    const id = window.setTimeout(() => trackViewContent(name, category), 800);
    return () => window.clearTimeout(id);
  }, [name, category]);
  return null;
}
