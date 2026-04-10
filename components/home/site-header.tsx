"use client";

import { ArrowRight, Cloud, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/45 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/8 backdrop-blur-xl">
            <Cloud className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight text-white">
              Coreframe Cloud
            </div>
            <div className="text-xs text-slate-400">
              Launch RTX Workstations & AI Compute
            </div>
          </div>
        </a>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 lg:flex">
          <a href="/#launch-gpus" className="transition hover:text-white">
            Launch GPUs
          </a>
          <a href="/#ai-nodes" className="transition hover:text-white">
            AI Nodes
          </a>
          <a href="/#pricing" className="transition hover:text-white">
            Pricing
          </a>
          <a href="/request-demo" className="transition hover:text-white">
            Reserve Access
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a href="mailto:hi@coreframecloud.com" className="hidden md:inline-flex">
            <Button
              variant="outline"
              className="rounded-2xl border-white/12 bg-white/6 text-white backdrop-blur-xl hover:bg-white/10"
            >
              <Mail className="mr-2 h-4 w-4" />
              hi@coreframecloud.com
            </Button>
          </a>

          <a href="/request-demo">
            <Button className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-5 text-white hover:bg-cyan-400/15">
              Reserve Access
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}
