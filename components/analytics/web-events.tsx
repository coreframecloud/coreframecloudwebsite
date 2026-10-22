"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { readIntroVariant } from "@/lib/attribution";
import { flush, init, track } from "@/lib/web-events";

/**
 * The site's funnel beacon, mounted once in the root layout (lib/web-events.ts).
 *
 * Per route change: one page_view (path + referrer: the external referrer on
 * the first page, the previous path after that), the page's own view event
 * (pricing_view, go_page_view with the A/B arm, signup_view, login_code_view,
 * verify_view), section_seen once per tagged section (`data-cf-section`,
 * 40 % visible) and cta_click for every primary button or sign-up link,
 * delegated so server components need no handler.
 *
 * Renders nothing. The browser's own location is used for paths (never
 * usePathname's value, which is the /usd rewrite on a dollar visitor); the
 * hook only tells us the route changed. `consentDenied` comes from the
 * layout (Cloudflare's country on the request): no visitor cookie there.
 */
export function WebEvents({ consentDenied }: { consentDenied: boolean }) {
  const pathname = usePathname();
  const prev = useRef<string | null>(null);

  useEffect(() => {
    init(consentDenied);
  }, [consentDenied]);

  useEffect(() => {
    let path = "/";
    try {
      path = window.location.pathname || "/";
    } catch {
      return;
    }
    let ref: string | undefined = prev.current ?? undefined;
    if (ref === undefined) {
      try {
        const r = document.referrer;
        if (r && new URL(r).host !== window.location.host) ref = r.slice(0, 120);
      } catch {
        /* malformed referrer */
      }
    }
    prev.current = path;
    track("page_view", { ref, title: (document.title || "").slice(0, 80) });

    // The page's own view event, derived here so a page needs no code.
    const isGo = path === "/go" || path.startsWith("/go/");
    if (isGo) {
      track("go_page_view", { arm: readIntroVariant() ?? undefined, page: path.split("/")[2] || "" });
    } else if (path === "/pricing") {
      track("pricing_view");
    } else if (path === "/signup") {
      track("signup_view");
    } else if (path === "/login") {
      track("login_code_view");
    } else if (path === "/verify" || path.startsWith("/verify/")) {
      track("verify_view", { step: path.split("/")[2] || "" });
    }

    // Sections, once each per page. Rescanned once after the client-rendered
    // parts (rate card ladders, dialogs) have had time to appear.
    const seen = new Set<string>();
    const io = typeof IntersectionObserver === "function"
      ? new IntersectionObserver(
          (entries) => {
            for (const en of entries) {
              if (!en.isIntersecting) continue;
              const el = en.target as HTMLElement;
              const name = el.dataset.cfSection || el.id;
              io?.unobserve(el);
              if (!name || seen.has(name)) continue;
              seen.add(name);
              track("section_seen", { section: name });
              if (name === "ladder") track("catalog_view", { where: path });
            }
          },
          { threshold: 0.4 },
        )
      : null;
    const scan = () => {
      if (!io) return;
      document.querySelectorAll<HTMLElement>("[data-cf-section]").forEach((el) => {
        const name = el.dataset.cfSection || el.id;
        if (name && !seen.has(name)) io.observe(el);
      });
    };
    scan();
    const rescan = window.setTimeout(scan, 1500);

    // Primary buttons and sign-up links, wherever they are.
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const el = target?.closest?.(
        "[data-cf-cta], a.cf-btn-primary, button.cf-btn-primary, a[href='/signup'], a[href^='/signup?'], a[href^='/signup#']",
      ) as HTMLElement | null;
      if (!el) return;
      const href = el.getAttribute("href") || undefined;
      const cta = (el.dataset.cfCta || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
      track("cta_click", { cta, href: href?.slice(0, 120), where: path });
      if (href && !href.startsWith("#")) flush();
    };
    document.addEventListener("click", onClick, true);

    return () => {
      window.clearTimeout(rescan);
      io?.disconnect();
      document.removeEventListener("click", onClick, true);
    };
    // pathname is the trigger; the path itself is read from the browser.
  }, [pathname]);

  return null;
}
