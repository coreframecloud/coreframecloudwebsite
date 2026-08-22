import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import CfdIntakeForm from "./cfd-intake-form";

export const metadata: Metadata = {
  title: "Submit a CFD Analysis Job — Coreframe Cloud",
  description:
    "Tell us your geometry, boundary conditions, solver preferences and turbulence model. We provision a GPU workstation sized to your case and hand it to you ready to run. You bring your own solver licence.",
  alternates: { canonical: "/cfd-intake" },
  openGraph: {
    title: "Submit a CFD Job — Coreframe Cloud",
    description:
      "Fill the intake form: geometry, BCs, physics, solver. We size and provision the GPU workstation. You bring your own solver licence.",
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
            We size and provision a GPU workstation for the case and tell you,
            before you book, whether it will actually fit. You bring your own
            solver licence, and your engineer stays the engineer of record.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="text-green-400">✓</span> OpenFOAM &amp; ANSYS Fluent
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-green-400">✓</span> Bring your own licence
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-green-400">✓</span> Results as PDF + data files
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-cyan-400">⚡</span> Sized before you book
              <span className="text-white/30 text-xs">*</span>
            </span>
          </div>
        </div>

        <CfdIntakeForm />

        {/* Footnote */}
        <p className="mt-10 text-xs text-slate-600 border-t border-white/5 pt-6">
          * Our current card is a 16 GB RTX 5080. Ansys publishes roughly 1.0-1.9 GB of GPU memory per million tet/hex cells
          and 1.8-2.8 GB per million polyhedral cells, which puts a practical ceiling around 8 million tet or 5 million polyhedral
          cells on this hardware — less if you are running a mesh-independence study. Larger meshes need a bigger card than we
          currently offer, and we will tell you that before you book rather than after. Solve times depend on physics, turbulence
          model and convergence criteria, so we quote them per case instead of publishing a number. Coreframe supplies compute;
          you supply the solver licence and the engineer of record.
        </p>
      </main>
    </div>
  );
}
