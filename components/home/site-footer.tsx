import Link from "next/link";
import { CoreframeWordmarkAtlas } from "@/components/brand/coreframe-wordmark-atlas";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#020b16]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.35fr_0.75fr_1.25fr] lg:px-8">
        <div>
          <Link href="/" aria-label="COREFRAME Home" className="inline-flex">
            <CoreframeWordmarkAtlas iconSize={84} animated={false} />
          </Link>

          <p className="mt-8 max-w-xl text-lg leading-9 text-white/65">
            D5 Render Ready Workstations, managed file transfer workflow, and dedicated Linux GPU nodes for AI workloads.
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
            <Link href="/#launch-gpus" className="text-sm text-white/65 transition hover:text-white">
              D5 Workstations
            </Link>
            <Link href="/#ai-nodes" className="text-sm text-white/65 transition hover:text-white">
              AI Nodes
            </Link>
            <Link href="/#pricing" className="text-sm text-white/65 transition hover:text-white">
              Pricing
            </Link>
            <Link href="/#reserve-access" className="text-sm text-white/65 transition hover:text-white">
              Reserve Access
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
            Company
          </h3>
          <div className="mt-4 flex flex-col gap-3 text-sm leading-6 text-white/65">
            <p className="font-medium text-white/80">
              COREFRAME COMPUTE LABS PRIVATE LIMITED
            </p>
            <p>CIN: U63119KA2026PTC220789</p>
            <p>
              Registered Office: Innov8 Prestige Tech Platina, 11th Floor, No.
              32/2, 34/1, Kadubeesanahalli, Bangalore, Karnataka – 560087
            </p>
            <Link href="mailto:admin@coreframecloud.com" className="transition hover:text-white">
              Email: admin@coreframecloud.com
            </Link>
            <Link
              href="https://wa.me/916366889488"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              Phone: +91 6366889488
            </Link>
            <Link href="https://coreframecloud.com" className="transition hover:text-white">
              Website: coreframecloud.com
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
