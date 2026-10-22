"use client";

import { useEffect } from "react";
import { isWhatsAppUrl, trackWhatsAppLead } from "@/lib/analytics";
import { flush as flushWebEvents, track as trackWebEvent } from "@/lib/web-events";

/**
 * Counts every click on a WhatsApp link as a lead (GA4 generate_lead, Meta
 * Contact), site-wide, from one listener.
 *
 * Delegated rather than an onClick per link because the links are spread over
 * a dozen pages, most of them server components that cannot take an onClick,
 * and each builds the URL its own way (COMPANY.whatsapp, a whatsapp() helper,
 * a literal wa.me string). A per-link handler is the one somebody forgets on
 * the next page. Capture phase, so a link that stops propagation is still
 * counted. Middle-click and Ctrl/Cmd-click open the chat too, so auxclick is
 * listened to as well.
 *
 * window.open() calls are not clicks on an anchor; those call
 * trackWhatsAppLead themselves (contact-section, request-demo-form).
 */
export function WhatsAppClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.type === "auxclick" && e.button !== 1) return;
      const target = e.target as Element | null;
      const a = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || !isWhatsAppUrl(a.getAttribute("href"))) return;
      trackWhatsAppLead(window.location.pathname);
      trackWebEvent("whatsapp_click", { where: window.location.pathname });
      flushWebEvents();
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
    };
  }, []);
  return null;
}
