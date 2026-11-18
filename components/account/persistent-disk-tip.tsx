import { HardDrive } from "lucide-react";

/**
 * Persistent-disk tip (owner, 18 Nov 2026): customers did not know they can
 * keep their own disk on the RTX 5080, and one asked how to set it up.
 *
 * An inline tip, part of the page's normal flow, on two pages only: /download
 * (after the installer steps) and My Activity (with the storage cards). No
 * popup, no highlight, no price (the site shows ₹ or $ per visitor; this
 * text would have to know which). No hooks, so server and client pages can
 * both use it.
 *
 * `className` carries the host page's own surface (.cf-note on /download,
 * .cf-glass on My Activity) so it looks native in each. No link: /download is
 * the page itself, and My Activity already has the Download button at the top.
 */
export function PersistentDiskTip({ className = "" }: { className?: string }) {
  return (
    <section aria-labelledby="persistent-disk-tip-heading" className={className}>
      <div className="flex items-start gap-3">
        <HardDrive aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-blue" strokeWidth={1.75} />
        <div className="min-w-0">
          <h2 id="persistent-disk-tip-heading" className="text-base leading-6 font-semibold text-ink">
            Keep your setup on the RTX 5080
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-2">
            A persistent disk keeps your apps, settings and files between sessions. In the Connect
            app, open Disk in the menu and pick a size.
          </p>
        </div>
      </div>
    </section>
  );
}
