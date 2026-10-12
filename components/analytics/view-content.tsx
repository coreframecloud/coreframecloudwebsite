"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/analytics";

/**
 * Fires one ViewContent (Meta) / view_item (GA4) per product page view.
 * The pixel and gtag load after hydration, so the call waits briefly for
 * either to appear; if neither does (blocked), nothing happens.
 */
export function ViewContent({ name, category }: { name: string; category: string }) {
  useEffect(() => {
    let tries = 0;
    let sent = false;
    const id = window.setInterval(() => {
      tries += 1;
      if (!sent && (typeof window.fbq === "function" || typeof window.gtag === "function")) {
        // Give the lazily loaded pixel a little longer than gtag before sending.
        if (typeof window.fbq === "function" || tries >= 10) {
          sent = true;
          trackViewContent(name, category);
        }
      }
      if (sent || tries >= 20) window.clearInterval(id);
    }, 500);
    return () => window.clearInterval(id);
  }, [name, category]);
  return null;
}
