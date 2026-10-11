import type { Metadata } from "next";
import { OG_IMAGE } from "@/lib/seo";
import { GenImage } from "@/components/visuals/media";
import { StreamDiagram } from "@/components/visuals/diagrams";
import { Fold } from "@/components/visuals/fold";
import { NODE } from "@/lib/node-spec";
import CfdIntakeForm from "./cfd-intake-form";

export const metadata: Metadata = {
  title: "Submit a CFD Analysis Job",
  description:
    "Send your geometry, boundary conditions and solver choice. We provision a GPU workstation sized to the case and hand it to you. You bring the solver licence.",
  alternates: { canonical: "/cfd-intake" },
  openGraph: {
    images: [OG_IMAGE],
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
      <main className="relative">
        <section className="cf-section px-5 cf-pagehero">
          <div className="cf-wide grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
            <div className="min-w-0">
              <p className="cf-eyebrow">CFD job intake</p>
              <h1 className="cf-display mt-3">Send us your CFD case.</h1>
              <p className="cf-lead mt-5">
                Tell us the geometry and the solver. We&rsquo;ll size a GPU workstation and tell you if it fits,
                before you book.
              </p>
              <ul className="mt-7 flex flex-wrap gap-2.5">
                {INTAKE_FACTS.map((fact) => (
                  <li key={fact} className="rounded-full bg-white/10 px-3.5 py-1.5 text-[13px]">
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
            <GenImage
              src="/visuals/gen-engineer-simulation-16x9.webp"
              alt="An engineer studying an airflow simulation on a large monitor"
              width={1600}
              height={914}
              sizes="(max-width: 1024px) 100vw, 480px"
              parallax
              priority
            />
          </div>
        </section>

        <section className="cf-section px-5 pb-0">
          <div className="cf-wide grid items-center gap-8 rounded-[28px] bg-tint-blue p-6 sm:p-10 lg:grid-cols-[0.85fr_1.15fr]">
            <ol className="space-y-4">
              {["Send the case", "We size the machine and say if it fits", "You run your solver on it"].map((t, i) => (
                <li key={t} className="flex items-center gap-4 text-[16px] text-ink">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink font-heading text-[15px] text-white">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
            <div className="min-w-0 rounded-[20px] bg-paper p-5">
              <StreamDiagram />
            </div>
          </div>
        </section>

        <section className="cf-section px-5">
          {/* Above the form on purpose: a model that will not convert should
              find out now, not after we quote it. */}
          <div className="cf-wide">
            <div className="cf-note flex flex-wrap items-center justify-between gap-4">
              <p className="text-[15px] text-ink">
                <span className="font-semibold">From Revit or ArchiCAD?</span> Run the free IFC check first. It takes
                seconds and needs no sign-up.
              </p>
              <a href="/tools" className="cf-btn-secondary">Open the IFC check</a>
            </div>
            <div className="mt-10">
              <CfdIntakeForm />
            </div>
            <div className="mx-auto max-w-[680px]">
              <Fold title="* How big a mesh fits on our card?">
                <p className="mt-3 text-[14.5px] leading-6 break-words text-ink-2">
                  Our card is an {NODE.gpu} with {NODE.vram}. Ansys publishes roughly 1.0-1.9 GB of GPU memory
                  per million tet/hex cells and 1.8-2.8 GB per million polyhedral cells, which puts a practical
                  ceiling around 8 million tet or 5 million polyhedral cells here, and less for a
                  mesh-independence study. A bigger mesh needs a bigger card than we have, and we&rsquo;ll tell
                  you before you book. Solve times depend on the physics, so we quote them per case. We supply
                  the compute; you bring the solver licence and the engineer of record.
                </p>
              </Fold>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
