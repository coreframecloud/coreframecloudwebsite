import { SectionHeading } from "@/components/home/section-heading";
import { processSteps } from "@/lib/home-data";

export function ProcessSection() {
  return (
    <section id="process" className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <div className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 md:grid-cols-[1fr_1.05fr] md:p-10">
        <div>
          <SectionHeading
            eyebrow="How it works"
            title="From first call to production deployment in 4 steps."
            text="This section reduces uncertainty and gives prospects a simple path to evaluate fit before scaling."
          />
        </div>

        <div className="grid gap-4">
          {processSteps.map((step, idx) => (
            <div
              key={step}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-900/80 p-4"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-400/20">
                {idx + 1}
              </div>
              <div className="pt-1 text-sm leading-7 text-slate-200 md:text-base">
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
