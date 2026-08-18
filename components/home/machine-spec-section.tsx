/**
 * What you actually get, stated plainly.
 *
 * The storage figures come from the live rate card via `storageTerms()` — the
 * same rule as the price. Everything else here is fixed hardware fact.
 *
 * The last paragraph is not a caveat we could drop. The disk resets between
 * customers, so software a customer installs themselves lasts one session. That
 * is a genuine constraint AND the mechanism that keeps one customer's work away
 * from the next; saying it here, on the page, is far cheaper than a support
 * conversation in week two.
 */

import Link from "next/link";
import type { StorageTerms } from "@/lib/storage-terms";

/** Slugs verified against the built route list, not guessed.
 *  NOTE: /d5-render is 308-redirected to / by next.config.ts, so D5 points at
 *  the live app/[slug] page instead. Twinmotion, Blender, DWG TrueView,
 *  Navisworks, FreeCAD, Krita and Paint.NET have no page yet — they render as
 *  plain chips rather than links to nowhere. */
const APPS: { label: string; href?: string }[] = [
  { label: "D5 Render", href: "/d5-render-cloud-workstation" },
  { label: "Lumion", href: "/lumion-cloud-gpu" },
  { label: "Enscape", href: "/enscape-cloud-gpu" },
  { label: "Twinmotion", href: "/software/twinmotion-cloud-workstation" },
  { label: "3ds Max", href: "/software/3ds-max-cloud-workstation" },
  { label: "Blender", href: "/software/blender-cloud-workstation" },
  { label: "DWG TrueView" },
  { label: "Navisworks Freedom" },
  { label: "FreeCAD" },
  { label: "Krita" },
  { label: "Paint.NET" },
];

export function MachineSpecSection({ storage }: { storage: StorageTerms }) {
  const specs: [string, string][] = [
    ["GPU", "NVIDIA RTX 5080"],
    ["VRAM", "16 GB GDDR7"],
    ["Network", "Dedicated 1 Gbps"],
    ["Location", "Bengaluru, India"],
    ["Storage", `${storage.trialGb} GB free · ${storage.paidGb} GB after top-up`],
    ["Billing", "Per minute · GST included"],
  ];

  return (
    <section id="specs" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">What you actually get</p>
      <h2 className="cf-section-title mt-4">One machine. Fully loaded.</h2>
      <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">
        Every session is a complete Windows workstation — not a render queue, not
        a web app. You see a desktop and you use it.
      </p>

      <dl className="mt-9 grid gap-3.5 sm:grid-cols-2">
        {specs.map(([k, v]) => (
          <div
            key={k}
            className="flex items-baseline justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.035] px-5 py-4"
          >
            <dt className="text-sm font-bold uppercase tracking-[0.06em] text-white/50">{k}</dt>
            <dd className="text-right text-[16px] font-semibold text-white">{v}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-8 flex flex-wrap gap-2.5">
        {APPS.map((a) =>
          a.href ? (
            <li key={a.label}>
              <Link
                href={a.href}
                className="inline-block rounded-xl border border-cyan-300/25 bg-cyan-400/[0.08] px-4 py-2.5 text-[15px] font-semibold text-white transition hover:border-cyan-300/60 hover:bg-cyan-400/[0.16]"
              >
                {a.label}
              </Link>
            </li>
          ) : (
            <li
              key={a.label}
              className="inline-block rounded-xl border border-cyan-300/25 bg-cyan-400/[0.08] px-4 py-2.5 text-[15px] font-semibold text-white"
            >
              {a.label}
            </li>
          ),
        )}
        <li>
          <Link
            href="/apps"
            className="inline-block rounded-xl border border-cyan-300/25 px-4 py-2.5 text-[15px] font-semibold text-cyan-300 transition hover:border-cyan-300/60"
          >
            See all software →
          </Link>
        </li>
      </ul>

      <p className="mt-6 max-w-3xl text-sm leading-6 text-white/55">
        Need something else? Install it during your session — though anything you
        add yourself lasts for that session only, which is how we keep every
        customer&apos;s work separate.
      </p>
    </section>
  );
}
