import Link from "next/link";
import { CoreframeWordmarkAtlas } from "@/components/brand/coreframe-wordmark-atlas";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#020b16]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" aria-label="COREFRAME CLOUD Home" className="inline-flex">
            <CoreframeWordmarkAtlas iconSize={84} animated={false} />
          </Link>

          <p className="mt-8 max-w-xl text-lg leading-9 text-white/65">
            Cloud GPU infrastructure for D5 Render, Revit, AI workloads, and high-performance visual computing.
          </p>

          <div className="mt-6">
            <Link
              href="https://wa.me/916366889488"
              target="_blank"
              rel="noreferrer"
              className="text-xl font-medium text-emerald-400 transition hover:text-emerald-300"
            >
              Chat on WhatsApp: +91 6366889488
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
            Navigation
          </h3>
          <div className="mt-4 flex flex-col gap-3">
            <Link href="#launch-gpus" className="text-sm text-white/65 transition hover:text-white">
              Launch GPUs
            </Link>
            <Link href="#ai-nodes" className="text-sm text-white/65 transition hover:text-white">
              AI Nodes
            </Link>
            <Link href="#pricing" className="text-sm text-white/65 transition hover:text-white">
              Pricing
            </Link>
            <Link href="#reserve-access" className="text-sm text-white/65 transition hover:text-white">
              Reserve Access
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
            Contact
          </h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/65">
            <p>COREFRAME CLOUD</p>
            <p>GPU Infrastructure for Design & AI</p>
            <Link
              href="https://wa.me/916366889488"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              +91 6366889488
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
