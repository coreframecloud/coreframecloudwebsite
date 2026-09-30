import type { Metadata } from "next";
import { BackgroundGlow } from "@/components/home/background-glow";
import { NODE } from "@/lib/node-spec";
import CfdIntakeForm from "./cfd-intake-form";

export const metadata: Metadata = {
  title: "Submit a CFD Analysis Job",
  description:
    "Tell us your geometry, boundary conditions, solver preferences and turbulence model. We provision a GPU workstation sized to your case and hand it to you ready to run. You bring your own solver licence.",
  alternates: { canonical: "/cfd-intake" },
  openGraph: {
    title: "Submit a CFD Job — Coreframe Cloud",
    description:
      "Fill the intake form: geometry, BCs, physics, solver. We size and provision the GPU workstation. You bring your own solver licence.",
    url: "https://www.coreframecloud.com/cfd-intake",
  },
};

/**
 * The four things someone checks before they start filling in twenty fields.
 *
 * A one-column list on a phone, two from `sm:` up. It was a wrapping flex row
 * of tick glyphs in raw `text-green-400` and `text-blue-300`, which are not
 * colours this design has.
 */
const INTAKE_FACTS = [
  "OpenFOAM and ANSYS Fluent",
  "You bring your own solver licence",
  "Results come back as a PDF and the data files",
  "Sized before you book *",
];

export default function CfdIntakePage() {
  return (
    <div className="relative min-h-screen text-ink">
      <BackgroundGlow />

      <main className="relative">
        <section className="cf-section px-5">
          {/* Page header */}
          <div className="cf-col">
            <p className="cf-eyebrow">CFD job intake</p>

            <h1 className="cf-display mt-3">Submit your CFD analysis.</h1>

            <p className="cf-lead mt-5">
              Fill in the geometry, the boundary conditions and the solver you run. We size a GPU
              workstation for the case and tell you before you book whether it fits on the card we
              have. You bring your own solver licence, and your engineer stays the engineer of
              record.
            </p>

            <ul className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {INTAKE_FACTS.map((fact) => (
                <li
                  key={fact}
                  className="border-t border-rule pt-3 font-mono text-[12.5px] leading-[1.5] break-words text-ink-2"
                >
                  {fact}
                </li>
              ))}
            </ul>
          </div>

          {/* Placed ABOVE the form on purpose. Someone about to fill in twenty
              fields for a model that will not convert should find that out now,
              not after we quote it. It costs us a submission occasionally and
              saves the relationship every time it fires. */}
          <div className="cf-col mt-9">
            <div className="cf-note">
              <p className="text-sm leading-[1.6] text-ink">
                <span className="font-semibold">If this came out of Revit or ArchiCAD, run it through the free IFC check first.</span>{" "}
                It takes seconds, needs no signup, and names the documented reasons a model fails
                conversion &mdash; doors that lost their openings, missing spaces, the wrong units.
                The file is deleted as soon as it is read.
              </p>
              <p className="mt-3">
                <a
                  href="/tools"
                  className="font-mono text-[12.5px] tracking-[0.08em] text-blue uppercase underline underline-offset-4"
                >
                  Open the IFC check
                </a>
              </p>
            </div>
          </div>

          <div className="cf-wide mt-10">
            <CfdIntakeForm />
          </div>

          {/* Footnote */}
          <div className="cf-col">
            <p className="mt-10 border-t border-rule pt-6 text-xs leading-[1.7] break-words text-ink-3">
              * Our current card is an {NODE.gpu} with {NODE.vram}. Ansys publishes roughly 1.0-1.9 GB
              of GPU memory per million tet/hex cells and 1.8-2.8 GB per million polyhedral cells,
              which puts a practical ceiling around 8 million tet or 5 million polyhedral cells on
              this hardware &mdash; less if you are running a mesh-independence study. A larger mesh
              needs a bigger card than we currently have, and we say so before you book rather than
              after. Solve times depend on the physics, the turbulence model and the convergence
              criteria, so we quote them per case instead of publishing a number. Coreframe supplies
              the compute; you supply the solver licence and the engineer of record.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
