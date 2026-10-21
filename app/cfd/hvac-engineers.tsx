import Link from "next/link";
import { Hl, SectionHead } from "@/components/cfd-explainer";
import { CFD_EXPRESS, CFD_NORMAL_HOURS, preprocessFee, preprocessLarge } from "@/lib/cfd-prices";
import { VERIFIED } from "@/lib/cfd-verified";
import { ROOMS_DELIVERS, ROOMS_VALIDATION } from "@/lib/cfd-rooms";
import { CFD_DEMO } from "@/lib/cfd-pages";
import type { Currency, UsdRateCard } from "@/lib/money";

/**
 * "For HVAC engineers" on /cfd (owner, 21 Oct 2026: "start with the now items").
 * Only what is live today, in an engineer's words. Sources:
 *
 *  - Inputs: one closed binary STL of the fluid volume, at most 3 openings
 *    (control plane cfd_caps_max = 3: one inlet, up to two outlets, one outlet
 *    pressure for all); STEP / IGES / IFC not accepted (NOT_YET_EXTENSIONS);
 *    rooms are one box room described in the form (app/cfd/categories/rooms.tsx,
 *    HvacSpec), steady only (ROOMS_TRANSIENT_OFFERED = false).
 *  - Delivery: the page's constants (CFD_NORMAL_HOURS, CFD_EXPRESS,
 *    VERIFIED.deliveryHours). No per-step durations.
 *  - MACHINE-TIME TABLE: cfd_pricing.build_quote on production, 21 Oct 2026
 *    (control plane 91bece2), duct/pipe, k-omega SST, packages quick (Draft)
 *    and standard, field estimated_compute_hours [lo, hi]:
 *      0.5 M: 0.14–0.26 / 0.21–0.40 h   1 M: 0.27–0.50 / 0.40–0.79 h
 *      2 M:   0.71–1.39 / 1.11–2.25 h   5 M: 2.31–4.70 / 3.70–7.67 h
 *    The engine calls them estimates of machine time, never a completion time,
 *    and the quote shows them as "Compute time (estimate)". Re-query and update
 *    the table if the engine's curves change.
 *  - Your data: apps/api (cfd_jobs.py _job_for_file: owner session or a signed
 *    link valid five minutes; files under LOCAL_STORAGE_ROOT/cfd_uploads and
 *    cfd_results on our server; cfd_express.py: one VM per mesh task and per
 *    run, security group with no inbound rules, deleted when the job ends;
 *    prune_case_archives: a continuable case is kept cfd_express_case_keep_days
 *    = 10 days). There is NO automatic deletion of uploads or results and no
 *    delete-on-request endpoint: do not claim either until one exists.
 * No provider names, no costs, no CPU names.
 */

const TIMES: [string, string, string][] = [
  ["0.5 million cells", "8–16 min", "13–24 min"],
  ["1 million cells", "16–30 min", "24–47 min"],
  ["2 million cells", "43–83 min", "1.1–2.3 h"],
  ["5 million cells", "2.3–4.7 h", "3.7–7.7 h"],
];

export function HvacEngineers({
  currency,
  card,
  post,
}: {
  currency: Currency;
  card: UsdRateCard;
  /** The verification-vs-validation blog post, when it is visible. */
  post?: { slug: string; title: string } | null;
}) {
  const fee = preprocessFee(currency, card);
  const steps: [string, string][] = [
    [
      "Submit and upload",
      "From your Coreframe account. The STL or the room description is checked automatically. Anything out of scope is rejected at once, with the reason, and costs nothing.",
    ],
    [
      `Mesh check: ${fee} for most models`,
      `We build a wall-resolved mesh and check its quality: non-orthogonality, skewness, negative volumes and wall-layer coverage. ${preprocessLarge(currency, card)}`,
    ],
    [
      "Quote by email",
      "A one-page mesh report and the run packages, each with its iteration budget, its convergence targets and an estimate of machine time. Nothing runs until you pay.",
    ],
    [
      "Run",
      `Normal: results within ${CFD_NORMAL_HOURS} hours of payment. Express: results in ${CFD_EXPRESS.hours} hours at ${CFD_EXPRESS.multiple}× the price, where your quote offers it (smaller steady runs; not Verified). Verified: within ${VERIFIED.deliveryHours} hours.`,
    ],
    [
      "Results",
      "The PDF report, the 3D viewer and the data files on your job page, with an email when they are ready. A run that did not converge is delivered marked provisional, and you can continue it.",
    ],
  ];

  return (
    <section id="hvac-engineers" className="cf-section scroll-mt-20 px-5 pt-0">
      <div className="cf-wide">
        <SectionHead n={5} tint="blue" eyebrow="For HVAC engineers" title="What you send, what happens, what comes back.">
          The short version for duct, pipe and room work. Everything here runs today.
        </SectionHead>

        {/* What you can send */}
        <h3 className="cf-card-label mt-2">What you can send</h3>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div className="cf-card">
            <p className="font-semibold text-ink">Ducts, pipes and fittings</p>
            <ul className="mt-3 space-y-2 text-[15px] leading-6 text-ink-2">
              <li>One closed binary STL of the fluid volume: the air or water inside, not the sheet metal or the pipe wall.</li>
              <li>A flat cap on each opening: one inlet and up to two outlets, all at one outlet pressure.</li>
              <li>Air or water, steady and isothermal. You give the units, the fluid and the inlet velocity or flow rate.</li>
              <li>STEP, IGES and IFC are not accepted yet: export an STL. A straight duct with no CAD can be given as length, width and height.</li>
            </ul>
          </div>
          <div className="cf-card">
            <p className="font-semibold text-ink">Rooms</p>
            <ul className="mt-3 space-y-2 text-[15px] leading-6 text-ink-2">
              <li>
                <Hl>One box-shaped room</Hl>, described in the form, with no file to upload. Rooms are box rooms for now:
                other room shapes and imported room geometry are not supported yet.
              </li>
              <li>Length, width and height; supply diffusers with their wall, position, size, airflow and supply air temperature; returns with their wall, position and size.</li>
              <li>Heat loads from people, equipment and lighting.</li>
              <li>Steady analysis only.</li>
            </ul>
          </div>
        </div>

        {/* Timeline */}
        <h3 className="cf-card-label mt-12">From upload to results</h3>
        <ol className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map(([t, b], i) => (
            <li key={t} className="flex gap-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink font-heading text-[15px] text-white">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[16px] leading-6 font-semibold text-ink">{t}</p>
                <p className="mt-1 text-[15px] leading-6 text-ink-2">{b}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 max-w-[44rem]">
          <p className="text-[15px] leading-6 font-semibold text-ink">Machine time the quote engine estimates for a duct or pipe</p>
          <div className="mt-3 overflow-x-auto rounded-[6px] border-[1.5px] border-ink bg-paper">
            <table className="w-full border-collapse text-left text-[14.5px] leading-6 text-ink-2">
              <thead>
                <tr>
                  {["Mesh", "Draft", "Standard"].map((h) => (
                    <th key={h} scope="col" className="px-4 py-2.5 font-mono text-[12px] font-normal tracking-[0.12em] text-ink-3 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIMES.map(([m, d, s]) => (
                  <tr key={m} className="border-t border-rule">
                    <th scope="row" className="px-4 py-2.5 font-semibold whitespace-nowrap text-ink">{m}</th>
                    <td className="px-4 py-2.5 whitespace-nowrap">{d}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{s}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2.5 text-[13px] leading-5 text-ink-3">
            Estimates from our live quote engine (21 Oct 2026, k-ω SST), not delivery times: delivery is as above. Your quote
            shows the estimate for your own mesh.
          </p>
        </div>

        {/* What you get back + trust */}
        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div className="min-w-0">
            <h3 className="cf-card-label">What you get back</h3>
            <ul className="mt-4 space-y-3 text-[15px] leading-6 text-ink-2">
              <li>
                <span className="font-semibold text-ink">PDF report.</span> On the sample, six pages: the summary, the
                convergence verdict and the headline numbers; inputs, boundary conditions, assumptions and mesh quality;
                y+ on the walls and the convergence history; mid-plane velocity and pressure; wall pressure and
                streamlines; the limitations.
              </li>
              <li>
                <span className="font-semibold text-ink">3D viewer</span> in your browser, the same one as the{" "}
                <Link href={CFD_DEMO.path} className="underline underline-offset-4">live demo</Link>.
              </li>
              <li>
                <span className="font-semibold text-ink">Data files.</span> The complete case: mesh, boundary setup, solver
                settings, final fields and the monitor histories, in an open format that free CFD post-processing tools
                can read.
              </li>
              <li>
                <span className="font-semibold text-ink">Rooms:</span> {ROOMS_DELIVERS}.
              </li>
            </ul>
          </div>
          <div className="min-w-0">
            <h3 className="cf-card-label">How far to trust it</h3>
            <ul className="mt-4 space-y-3 text-[15px] leading-6 text-ink-2">
              <li>
                In a straight pipe, our friction factor matched the Haaland/Colebrook correlation to about 1–5 % on our
                validation cases.
              </li>
              <li>The report says CONVERGED only when the residual targets were met; otherwise the run is marked provisional.</li>
              <li>
                Verified runs your case on three meshes and reports the grid convergence index on the pressure drop:{" "}
                <Link href={VERIFIED.path} className="underline underline-offset-4">a worked example on our bend</Link>.
              </li>
              <li>Rooms: {ROOMS_VALIDATION}</li>
              {post ? (
                <li>
                  What each check proves, and what it does not:{" "}
                  <Link href={`/blog/${post.slug}`} className="underline underline-offset-4">{post.title}</Link>.
                </li>
              ) : null}
              <li>Results are design guidance, not certification.</li>
            </ul>
          </div>
        </div>

        {/* Your data */}
        <div className="mt-12 max-w-[46rem]">
          <h3 className="cf-card-label">Your data</h3>
          <ul className="mt-4 space-y-3 text-[15px] leading-6 text-ink-2">
            <li>
              Your STL, the report and the result files are stored on our server under your job. They open only when you are
              signed in to the account that owns the job; download links expire after five minutes. Our team can open a job
              when we support it.
            </li>
            <li>
              Each mesh check and each run is done on a machine started for that job alone, with no inbound network access.
              The results are copied back to our server and the machine is deleted when the job ends.
            </li>
            <li>When a run can be continued, its working case is kept for 10 days for that, then deleted.</li>
          </ul>
        </div>

        <p className="cfx-quiet mt-10">
          <a href="#start">Start a job when you have an STL or a room to describe →</a>
        </p>
      </div>
    </section>
  );
}
