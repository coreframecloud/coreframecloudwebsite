"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Persistent-disk notice (owner, 18 Nov 2026): customers did not know they can
 * keep their own disk on the RTX 5080, and one asked how to set it up.
 *
 * A small card, not a modal: bottom-left from `sm:` up (the WhatsApp pill owns
 * bottom-right), a bottom sheet above the WhatsApp circle on a phone. It
 * appears after ~3 s, closes with the × or Esc, and stays closed for that
 * visitor (localStorage, every access in try/catch: a blocked store just means
 * it shows again next visit). `.cf-consent-lift` puts it above the consent bar
 * while that is open.
 *
 * GPU pages only. Not on CFD, Studio / floor-plan-to-render, blog, legal, or
 * the paid /go/* landing pages (one job, one big button, and their own phone
 * sticky bar already sits at the bottom). No price anywhere: the site shows ₹
 * or $ per visitor, and this card would have to know which.
 */
const STORAGE_KEY = "cf_notice_persistent_disk_v1";
const DELAY_MS = 3000;

const SHOW_EXACT = new Set([
  "/",
  "/pricing",
  "/download",
  "/apps",
  "/how-to-use",
  "/compute-nodes",
  "/d5-render-cloud-workstation",
  "/enscape-cloud-gpu",
  "/lumion-cloud-gpu",
]);
const SHOW_PREFIXES = ["/software/", "/download/"];

function showsOn(pathname: string | null): boolean {
  if (!pathname) return false;
  // USD visitors are rewritten to /usd/<route>; the URL stays public, but be
  // safe if the rewritten path ever surfaces here.
  let p = pathname === "/usd" ? "/" : pathname.startsWith("/usd/") ? pathname.slice(4) : pathname;
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return SHOW_EXACT.has(p) || SHOW_PREFIXES.some((x) => p.startsWith(x));
}

function wasDismissed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberDismissed(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* storage blocked: it closes for this page view only */
  }
}

export function PersistentDiskNotice() {
  const pathname = usePathname();
  const eligible = showsOn(pathname);
  const [open, setOpen] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (!eligible || closed || wasDismissed()) return;
    const t = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(t);
  }, [eligible, closed]);

  const close = useCallback(() => {
    rememberDismissed();
    setClosed(true);
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!eligible || !open) return null;

  const onDownload = pathname === "/download" || pathname === "/usd/download";

  return (
    <aside
      role="region"
      aria-label="Persistent disk on the RTX 5080"
      className="cf-notice cf-consent-lift fixed inset-x-3 bottom-[calc(max(1rem,env(safe-area-inset-bottom))+4.25rem)] z-50 rounded-[20px] border border-rule bg-paper p-1.5 shadow-[0_12px_32px_-8px_rgba(16,17,19,0.22)] sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[360px]"
    >
      <div className="relative rounded-[14px] border border-rule bg-paper-2 py-4 pr-12 pl-4">
        <p className="font-display text-[17px] leading-snug font-semibold tracking-[-0.01em]">
          <span className="cf-hl-marker cf-notice-hl">Keep your setup on the RTX 5080</span>
        </p>
        <p className="mt-2 text-[14px] leading-[1.5] text-ink-2">
          A persistent disk keeps your apps, settings and files between sessions. Open Disk in the
          Connect app and pick a size.
        </p>
        {onDownload ? null : (
          <Link
            href="/download"
            className="mt-5 inline-flex text-[14px] font-semibold text-blue-ink underline underline-offset-4 hover:text-blue focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            Get the Connect app
          </Link>
        )}
        <button
          type="button"
          onClick={close}
          aria-label="Close notice"
          className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-[8px] text-ink-2 transition-colors hover:bg-ink/[0.06] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
