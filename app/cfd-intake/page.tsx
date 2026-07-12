import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import CfdIntakeForm from "./cfd-intake-form";

export const metadata: Metadata = {
  title: "Submit a CFD Analysis Job — Coreframe Cloud",
  description:
    "Tell us your geometry, boundary conditions, solver preferences and turbulence model. Our team provisions the GPU workstation and runs your simulation headlessly — results delivered without back-and-forth.",
  alternates: { canonical: "/cfd-intake" },
  openGraph: {
    title: "Submit a CFD Job — Coreframe Cloud",
    description:
      "Fill the intake form: geometry, BCs, physics, solver. We run it headlessly and send you the results.",
    url: "https://coreframecloud.com/cfd-intake",
  },
};

export default function CfdIntakePage() {
  return (
    <div className="relative min-h-screen text-white">
      <BackgroundGlow />

      <main className="relative mx-auto max-w-4xl px-4 pb-24 pt-20 md:pt-28">
        {/* Page header */}
        <div className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            CFD Job Intake
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Submit your CFD analysis.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            Fill in your geometry, boundary conditions, and solver preferences.
            We provision the workstation and run your simulation headlessly —
            no calls, no back-and-forth.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="text-green-400">✓</span> OpenFOAM &amp; ANSYS Fluent
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-green-400">✓</span> Fully headless solver runs
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-green-400">✓</span> Results delivered as PDF + data
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-green-400">✓</span> Quote within 1 business day
            </span>
          </div>
        </div>

        <CfdIntakeForm />
      </main>
    </div>
  );
}
