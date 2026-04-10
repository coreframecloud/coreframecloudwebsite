"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { CoreframeWordmarkAtlas } from "@/components/brand/coreframe-wordmark-atlas";

const navItems = [
  { label: "Launch GPUs", href: "/#launch-gpus" },
  { label: "AI Nodes", href: "/#ai-nodes" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Reserve Access", href: "/#reserve-access" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#03101d]/88 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="COREFRAME CLOUD Home" className="shrink-0">
          <CoreframeWordmarkAtlas iconSize={52} compact />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-10 xl:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[15px] font-medium text-white/80 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 xl:flex">
          <Link
            href="/#reserve-access"
            className="inline-flex items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-5 py-2.5 text-sm font-semibold text-white transition hover:border-emerald-300/35 hover:bg-emerald-400/[0.1]"
          >
            Reserve Access
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white xl:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#03101d] xl:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6">
            <div className="mb-4">
              <CoreframeWordmarkAtlas iconSize={44} compact />
            </div>

            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-white/85 transition hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/#reserve-access"
              className="mt-3 inline-flex items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-5 py-3 text-sm font-semibold text-white"
            >
              Reserve Access
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
