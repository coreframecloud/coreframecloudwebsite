"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Rocket, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function HeroSection() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-16 pt-20 md:grid-cols-[1fr_0.95fr] md:pb-24 md:pt-28">
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <div className="mb-6 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200 backdrop-blur-xl">
          <Rocket className="mr-2 h-4 w-4" />
          Launch GPU instances fast
        </div>

        <h1 className="max-w-2xl text-4xl font-semibold leading-[0.98] tracking-tight text-white md:text-6xl xl:text-7xl">
          Launch RTX GPU workstations in minutes.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 md:text-lg">
          Hourly RTX instances for 3D rendering and visualization. Monthly Linux
          GPU nodes for AI training and inference. Reserve access while we open
          availability in phases.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a href="/request-demo">
            <Button className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-6 text-base text-white hover:bg-cyan-400/15">
              Launch Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>

          <a href="/request-demo">
            <Button
              variant="outline"
              className="rounded-2xl border-white/12 bg-white/6 px-6 text-white backdrop-blur-xl hover:bg-white/10"
            >
              Reserve Access
            </Button>
          </a>
        </div>

        <div className="mt-6 flex max-w-2xl items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-400/8 p-4 text-sm text-amber-100/90 backdrop-blur-xl">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            No availability for now — we’re currently opening access in phases.
            Submit your requirement to reserve priority access.
          </span>
        </div>

        <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            "RTX 4000 Ada from ₹99/hr",
            "RTX A4000 from ₹75/hr",
            "Quick reserve flow via WhatsApp",
            "AI / Linux nodes available on request",
            "Hosted in Tier III / Tier IV data center environments",
            "Enterprise-grade physical security, controlled access, and high-availability infrastructure",
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/6 p-4 text-sm text-slate-200 backdrop-blur-xl"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.15, duration: 0.6 }}
        className="rounded-[2rem] border border-white/12 bg-white/6 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.22)] backdrop-blur-2xl"
      >
        <div className="text-sm uppercase tracking-[0.25em] text-cyan-300">
          Featured Launches
        </div>
        <div className="mt-4 grid gap-4">
          {[
            ["RTX 4000 Ada 20GB", "From ₹99/hr", "Great for under-₹100/hr entry"],
            ["RTX A4000 16GB", "From ₹75/hr", "Best budget 3D launch option"],
            ["RTX A5000 24GB", "From ₹129/hr", "Balanced visual compute"],
            ["RTX 6000 Ada 48GB", "From ₹499/hr", "Premium high-end rendering"],
          ].map(([name, price, note]) => (
            <div
              key={name}
              className="rounded-2xl border border-white/10 bg-white/6 p-5 backdrop-blur-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xl font-semibold text-white">{name}</div>
                  <div className="mt-1 text-sm text-slate-400">{note}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400">Starting at</div>
                  <div className="text-lg font-semibold text-cyan-300">{price}</div>
                </div>
              </div>
              <div className="mt-4 text-xs text-amber-200/80">
                No availability for now
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
