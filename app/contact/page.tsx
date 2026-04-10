"use client";

import { ArrowRight, Cloud, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <Cloud className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight">
              Coreframe Cloud
            </div>
            <div className="text-xs text-slate-400">
              GPU Infrastructure for Design, Render & Compute
            </div>
          </div>
        </a>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 lg:flex">
          <a href="/solutions" className="transition hover:text-white">
            Solutions
          </a>
          <a href="/compute-nodes" className="transition hover:text-white">
            Compute Nodes
          </a>
          <a href="/#pricing" className="transition hover:text-white">
            Pricing
          </a>
          <a href="/contact" className="transition hover:text-white">
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a href="mailto:hi@coreframecloud.com" className="hidden md:inline-flex">
            <Button
              variant="outline"
              className="rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              <Mail className="mr-2 h-4 w-4" />
              hi@coreframecloud.com
            </Button>
          </a>

          <a href="/contact">
            <Button className="rounded-2xl px-5">
              Book a Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}
