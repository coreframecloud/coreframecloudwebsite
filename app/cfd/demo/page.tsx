import type { Metadata } from "next";
import Link from "next/link";
import { SITE, breadcrumbList } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { PageByline } from "@/components/seo/page-byline";
import { CFD_DEMO, CFD_HOME } from "@/lib/cfd-pages";
import { DemoViewer, type DemoCase } from "./demo-viewer";

/**
 * /cfd/demo — the customer 3D results viewer on the sample runs, public, no
 * sign-in (owner, 21 Oct 2026: "start with the now items").
 *
 * DATA. The two models are the runner's own view.glb from the 12 Oct 2026
 * end-to-end runs behind the published sample (the same runs as every image
 * in /public/cfd and /cfd/sample-report.pdf):
 *   - bend:    job CF-8T90FM (overnight run A1), 913,825 cells, 5,294 Pa, K 0.663;
 *   - reducer: job CF-BZ7ENO (overnight run A2), 1,490,703 cells.
 * They were repacked by scripts/cfd-demo-pack.py (int16 positions, uint16
 * indices, gzip): field colours, legends, units and ranges are unchanged.
 * The headline numbers below are copied from each run's PDF report. The
 * reducer's 50 mm -> 25 mm is measured from the run's own wall geometry, and
 * its mean outlet speed (about 16 m/s) is the report's flow rate over that area.
 *
 * No prices on this page, so it has no /usd copy and is not in proxy.ts PAGES.
 * The viewer shows what the GLB carries: wall pressure, mid-plane velocity and
 * streamlines. Mid-plane pressure is only in the PDF report.
 */

const TITLE = "CFD Results in 3D: Live Demo of the Viewer";
const DESCRIPTION =
  "Rotate and zoom real CFD results in your browser: wall pressure, mid-plane velocity and streamlines for a 90° bend and a reducer. No sign-in.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CFD_DEMO.path },
  openGraph: {
    title: "CFD results in 3D: a live demo — Coreframe Cloud",
    description: DESCRIPTION,
    url: `${SITE}${CFD_DEMO.path}`,
    // The CFD share card (a JPEG: not every network reads a WebP card).
    images: [{ url: "/cfd/og-cfd.jpg", width: 1200, height: 630, alt: "Pressure drop you can check: a sketch of a duct bend under a magnifying glass" }],
  },
  twitter: { card: "summary_large_image", title: "CFD results in 3D: a live demo — Coreframe Cloud", images: ["/cfd/og-cfd.jpg"] },
};

const CASES: DemoCase[] = [
  {
    id: "bend",
    tab: "90° bend",
    url: "/cfd/demo/bend.glb.gz",
    sizeLabel: "1.7 MB",
    show: ["pressure"],
    // Opens on the elbow (the run is 1.1 m long; the whole of it is a thin line at first).
    view: { target: [-0.02, 0.08, 0], radius: 0.26, dir: [0.3, -0.2, 1] },
    poster: {
      desktop: "/cfd/demo/bend-poster.webp",
      phone: "/cfd/demo/bend-poster-m.webp",
      alt: "Wall pressure on the 90° bend: high on the outer wall of the turn, low on the inner wall",
    },
    label: "3D results of the 90° bend sample: wall pressure, mid-plane velocity and streamlines",
  },
  {
    id: "reducer",
    tab: "Reducer",
    url: "/cfd/demo/reducer.glb.gz",
    sizeLabel: "1.5 MB",
    show: ["velocity"],
    // Opens on the contraction, 50 mm to 25 mm, looking square onto the mid-plane slice.
    view: { target: [0.45, 0, 0], radius: 0.16, dir: [0.12, 1, 0.3] },
    poster: {
      desktop: "/cfd/demo/reducer-poster.webp",
      phone: "/cfd/demo/reducer-poster-m.webp",
      alt: "Flow speed on the mid-plane of the reducer: slow in the 50 mm pipe, fast in the 25 mm pipe",
    },
    label: "3D results of the reducer sample: wall pressure, mid-plane velocity and streamlines",
  },
];

const RESULTS: { title: string; rows: [string, string][]; note?: string }[] = [
  {
    title: "90° bend, 50 mm",
    rows: [
      ["Flow", "Water, 4 m/s at the inlet (0.007832 m³/s)"],
      ["Mesh", "913,825 cells, wall layers at y+ ≈ 1 (average 1.04)"],
      ["Static pressure drop", "5,294 Pa"],
      ["Loss coefficient K", "0.663, on the inlet velocity"],
      ["Convergence", "Converged at iteration 226"],
    ],
  },
  {
    title: "Reducer, 50 mm to 25 mm",
    rows: [
      ["Flow", "Water, 4 m/s at the inlet (0.007832 m³/s)"],
      ["Mesh", "1,490,703 cells, wall layers at y+ ≈ 1 (average 1.33)"],
      ["Static pressure drop", "152,899 Pa"],
      ["Total pressure drop", "33,139 Pa"],
      ["Loss coefficient K", "4.151 on the inlet velocity, 0.259 on the outlet velocity"],
      ["Convergence", "Converged at iteration 173"],
    ],
    note: "Most of the static drop is the water speeding up from 4 m/s to about 16 m/s in the smaller pipe. The total pressure drop is the energy the fitting actually loses.",
  },
];

const FIELDS: [string, string][] = [
  ["Wall pressure", "Static pressure on the pipe wall, in pascals, relative to the outlet (set to 0 Pa)."],
  ["Velocity slice", "Flow speed on the mid-plane through the pipe axis, in metres per second."],
  ["Streamlines", "Paths the water takes, coloured by its speed, in metres per second."],
  ["Colour scale", "Each legend runs from the lowest to the highest value of that field in this run."],
];

export default function CfdDemoPage() {
  return (
    <div className="cfx-paper relative min-h-screen text-ink">
      <JsonLd
        data={breadcrumbList([
          { name: CFD_HOME.name, path: CFD_HOME.path },
          { name: "3D results demo", path: CFD_DEMO.path },
        ])}
      />
      <main className="relative">
        <section className="cf-section px-5 pb-0">
          <div className="cf-wide">
            <p className="cf-eyebrow">CFD results · 3D demo</p>
            <h1 className="cf-display mt-5 max-w-[18ch]">The sample results, in the viewer you get with every run.</h1>
            <p className="cf-lead mt-5 max-w-[56ch]">
              Two real runs from our sample report: a 90° bend and a reducer, 50 mm pipe, water at 4 m/s. Rotate them, zoom
              in, and switch the wall pressure, the mid-plane velocity and the streamlines on and off. No sign-in.
            </p>
            <PageByline path={CFD_DEMO.path} className="mt-4 text-ink-3" />
          </div>
        </section>

        <section className="cf-section px-5 pt-10">
          <div className="cf-wide">
            <DemoViewer cases={CASES} />
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide grid gap-10 lg:grid-cols-2">
            {RESULTS.map((r) => (
              <div key={r.title} className="min-w-0">
                <h2 className="cf-section-title">{r.title}</h2>
                <dl className="mt-5 overflow-hidden rounded-cf border border-rule bg-paper-2">
                  {r.rows.map(([k, v], i) => (
                    <div key={k} className={`flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:gap-6 ${i ? "border-t border-rule" : ""}`}>
                      <dt className="text-sm font-semibold text-ink sm:w-40 sm:shrink-0">{k}</dt>
                      <dd className="min-w-0 text-sm break-words text-ink-2">{v}</dd>
                    </div>
                  ))}
                </dl>
                {r.note ? <p className="mt-3 text-[14px] leading-6 text-ink-3">{r.note}</p> : null}
              </div>
            ))}
          </div>
        </section>

        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <p className="cf-eyebrow">What you are looking at</p>
            <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              {FIELDS.map(([k, v]) => (
                <div key={k} className="min-w-0 border-t border-rule pt-4">
                  <dt className="font-semibold text-ink">{k}</dt>
                  <dd className="mt-1 text-[15px] leading-6 text-ink-2">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 max-w-[60ch] text-[14px] leading-6 text-ink-3">
              Both are end-to-end test runs on our own geometry (12 Oct 2026), solved and reported through the same steps as
              a customer job. The models here are the files those jobs produced, compressed for the web; the colours and
              ranges are unchanged. Pressure on the mid-plane is in the PDF report. Results are design guidance, not
              certification.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/cfd/sample-report.pdf" target="_blank" rel="noopener" className="cf-btn-secondary">
                The bend&apos;s sample report (PDF, 6 pages)
              </a>
            </div>
            <p className="cfx-quiet mt-8">
              <Link href={`${CFD_HOME.path}#start`}>Run your own duct or pipe →</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
