import { CheckCircle2 } from "lucide-react";
import { whyThisWorks } from "@/lib/home-data";

export function WhyThisWorksSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-4 md:py-10">
      <div className="grid gap-8 rounded-[2rem] border border-cyan-400/20 bg-cyan-500/10 p-8 md:grid-cols-[1.05fr_0.95fr] md:p-10">
        <div>
          <div className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-200">
            Why Coreframe Cloud
          </div>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Built differently from traditional cloud and VDI providers.
          </h3>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-100/85">
            Instead of selling generic infrastructure, Coreframe Cloud is
            positioned around rendering, design workflows, and pilot-first
            deployments that make business sense.
          </p>
        </div>

        <div className="grid gap-3">
          {whyThisWorks.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-100"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
