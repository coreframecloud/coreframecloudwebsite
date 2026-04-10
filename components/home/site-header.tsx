"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-slate-950/70 shadow-[0_10px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
          : "border-b border-white/6 bg-slate-950/35 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-horizontal.png"
            alt="Coreframe Cloud"
            width={160}
            height={40}
            priority
            className="h-8 w-auto md:h-9"
          />
        </Link>

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
              className={`rounded-2xl text-white transition-all ${
                scrolled
                  ? "border-white/12 bg-white/8 backdrop-blur-xl hover:bg-white/12"
                  : "border-white/10 bg-white/6 backdrop-blur-xl hover:bg-white/10"
              }`}
            >
              <Mail className="mr-2 h-4 w-4" />
              hi@coreframecloud.com
            </Button>
          </a>

          <a href="/request-demo">
            <Button
              className={`rounded-2xl px-5 text-white transition-all ${
                scrolled
                  ? "border border-cyan-300/25 bg-cyan-400/12 shadow-[0_0_28px_rgba(34,211,238,0.14)] hover:bg-cyan-400/18"
                  : "border border-cyan-300/20 bg-cyan-400/10 hover:bg-cyan-400/15"
              }`}
            >
              Reserve Access
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}
