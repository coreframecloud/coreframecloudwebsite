import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { PageByline } from "@/components/seo/page-byline";
import { breadcrumbList, faqPage, OG_IMAGE, ORG_ID, SITE } from "@/lib/seo";
import { pageUpdated } from "@/lib/page-dates";
import { IfcChecker } from "./ifc-checker";

/**
 * /tools: the free IFC pre-CFD checker.
 *
 * THE PAGE LIVES HERE, THE WORK DOES NOT (owner, 6 Nov 2026: clear control of
 * the page's content and SEO in this repo). Until then www rewrote /tools to
 * the control plane's apps/tools/web/tools.html. Now the copy, H1, metadata,
 * FAQ and schema are this file, and only the upload goes to the control plane,
 * through the same-origin /api/tools/:path* rewrite in next.config.ts (it holds
 * a whole IFC in memory, ~200 MB and ~6 s for a 100 MB model: no fit for
 * Vercel's function limits). See ./ifc-checker.tsx for the API contract.
 *
 * Shared reports (/r/:token) are still rendered by the control plane: each one
 * is a database row there, with no read API, and the page it serves is the old
 * tools.html with the report embedded. That is why /r/:token and
 * /tools/app.js are still rewritten.
 *
 * FREE ON PURPOSE: the IFC checker is one of the only two free things
 * Coreframe offers (owner, 12 Oct 2026). No price on this page, so it has no
 * /usd copy.
 *
 * "No-install IFC model checker" is in the H1 because Search Console had the
 * page at position 14 for it (6 Nov 2026).
 */

const PATH = "/tools";
const PAGE_URL = `${SITE}${PATH}`;

export const metadata: Metadata = {
  title: "No-install IFC model checker: free pre-CFD check",
  description:
    "Free IFC model checker in your browser, nothing to install: finds doors that cut no opening, missing spaces and units before CFD. No sign-up; file deleted.",
  keywords: [
    "no-install IFC model checker",
    "online IFC checker",
    "IFC model checker free",
    "IFC validation before CFD",
    "Revit IFC export CFD problems",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    images: [OG_IMAGE],
    title: "No-install IFC model checker, free before CFD",
    description:
      "Upload an IFC export and see what will break a CFD conversion. Free, no sign-up, and your file is deleted once it is read.",
    url: PAGE_URL,
    type: "website",
  },
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "Do I need to install anything to check an IFC model?",
    a: "No. The checker runs in your web browser: drop an .ifc file on this page and the report comes back in a few seconds. There is no plug-in, desktop viewer or Revit add-in to install, and it works on Windows, macOS and Linux.",
  },
  {
    q: "Is the IFC checker free, and do I need an account?",
    a: "It is free and needs no account, email address or card. The full report is shown on the first pass. Creating a share link is optional; an email address there is optional too.",
  },
  {
    q: "What happens to my IFC file?",
    a: "It is written to a temporary file, read once and deleted as soon as the check finishes, whether it passes or fails. If you create a share link, we keep the report (not your model) for 90 days.",
  },
  {
    q: "Which files can it read?",
    a: "IFC exports in the STEP text format (.ifc), up to 95 MB. A whole-building model is often larger than that; export a single level or a single discipline instead, which is all a CFD study of one area needs. Revit .rvt files are not read: export an IFC from Revit first.",
  },
  {
    q: "Is this an IFC viewer?",
    a: "No. It does not draw your model. It reads the relationships in the file and reports the known conversion failures, with the names and counts of the elements involved, so you can find them in your own BIM tool.",
  },
  {
    q: "Does a clean result mean my model is ready for CFD?",
    a: "No. It means these specific, documented failure modes were not found. Geometry is not evaluated, and what to keep or drop for an analysis is the engineer's decision. Re-verify every finding in your own model before acting on it.",
  },
  {
    q: "Can Coreframe run the CFD for me?",
    a: "Yes, for two kinds of job. Coreframe CFD calculates the pressure drop of a duct or pipe from one STL file, and room airflow and comfort for a box-shaped room you describe in a form. It does not take IFC files yet. Results are design guidance, not certification.",
  },
];

const CHECKS: { t: string; d: string }[] = [
  {
    t: "Doors and windows with no opening.",
    d: "A door or window that fills no opening leaves its wall solid, so air and smoke cannot pass the doorway in the simulation, though the model looks right in every viewer. This is a blocker.",
  },
  { t: "Openings that void nothing.", d: "An opening element attached to no wall subtracts from nothing and may appear as a stray solid or vanish." },
  {
    t: "Spaces, the air you want simulated.",
    d: "CFD solves the air volume. A model with no spaces leaves the fluid domain undefined, which is a blocker; spaces exported without space boundaries make a watertight volume much harder to build.",
  },
  {
    t: "Units.",
    d: "The declared length unit, or a warning when no SI length unit is declared, the usual cause of a model arriving 25.4 or 1000 times too big.",
  },
  { t: "Walls, slabs and roofs.", d: "A model with none of them bounds no fluid volume at all, often a services-only export." },
  {
    t: "Level of detail.",
    d: "Furniture, fittings and accessories counted against the walls, slabs and roofs. A count, not a recommendation: what affects the flow is the engineer's call.",
  },
  {
    t: "Storeys and wall types.",
    d: "Building storeys, which let a single level be isolated, and walls exported as general walls rather than standard-case walls, which may be curved or tapered.",
  },
];

const NOT_CHECKED = [
  "Geometry. Non-manifold shells, tiny interferences, zero-thickness faces and self-intersections are not evaluated.",
  "Whether an object matters to the airflow. That is an engineering decision; the checker only counts.",
  "Whether the model is right. A clean result means these failure modes were not found, nothing more.",
  "It is not a viewer: it does not draw the model.",
];

const APP_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${PAGE_URL}#app`,
  name: "Coreframe no-install IFC model checker (pre-CFD)",
  url: PAGE_URL,
  applicationCategory: "DesignApplication",
  applicationSubCategory: "BIM model quality check before CFD",
  operatingSystem: "Any (runs in a web browser, nothing to install)",
  browserRequirements: "A current web browser",
  isAccessibleForFree: true,
  // Invisible regional Offers in both currencies are allowed (one-currency rule, 18 Oct 2026).
  offers: [
    { "@type": "Offer", price: "0", priceCurrency: "INR" },
    { "@type": "Offer", price: "0", priceCurrency: "USD" },
  ],
  featureList: [
    "Finds doors and windows that do not cut an opening in their host wall",
    "Finds openings that void no element",
    "Checks that spaces (the fluid domain) and their space boundaries were exported",
    "Reports the declared length unit, or its absence",
    "Checks that walls, slabs or roofs exist, and counts detail elements against them",
    "Lists building storeys and walls that are not standard-case",
  ],
  dateModified: pageUpdated(PATH),
  publisher: { "@id": ORG_ID },
  provider: { "@id": ORG_ID },
};

const H2 = "cf-section-title";

export default function ToolsPage() {
  return (
    <div className="relative min-h-screen text-ink">
      <JsonLd data={APP_SCHEMA} />
      <JsonLd data={breadcrumbList([{ name: "No-install IFC model checker", path: PATH }])} />
      <JsonLd data={faqPage(FAQ)} />

      <main className="relative">
        <section className="cf-pagehero cf-pagehero--paper px-5">
          <div className="cf-wide">
            <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-ink-3">
              <Link href="/">Coreframe</Link> / <span>Free IFC checker</span>
            </nav>
            {/* No "TOOL": see app/dwg-check (no T-O kerning pair in Inter, tracked caps read "T OOL"). */}
            <p className="cf-eyebrow mb-5">Free · nothing to install</p>
            <h1 className="cf-display max-w-[20ch]">
              No-install IFC model checker: <span className="cf-hl-marker">find what breaks a CFD conversion</span>
            </h1>
            <p className="cf-lead mt-6 max-w-[62ch]">
              Drop an IFC export of up to 95 MB into your browser and get a free list of what will break a CFD
              conversion: doors and windows that cut no opening, missing spaces or space boundaries, undeclared units,
              missing walls or storeys, and heavy detail. Nothing to install or sign up for, and your file is deleted as
              soon as it is read.
            </p>
            <PageByline path={PATH} className="mt-4 text-ink-3" />
          </div>
        </section>

        <section className="px-5 pt-10 pb-4">
          <div className="cf-wide">
            <IfcChecker />
            <div className="cf-note mt-6 text-[15px] leading-6 text-ink-2">
              <b className="text-ink">What this is.</b> It reports specific, documented conversion failures. It is not an
              engineering review, it does not judge whether your model suits any particular analysis, and it is no
              substitute for the engineer responsible for the study.
            </div>
          </div>
        </section>

        <section className="cf-section px-5">
          <div className="cf-wide">
            <h2 className={H2}>What it checks</h2>
            <p className="mt-3 max-w-[68ch] text-[15px] text-ink-2">
              Each check is a lookup in the relationships the IFC file already holds. Findings come back as blockers,
              warnings or information.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {CHECKS.map((c) => (
                <li key={c.t} className="cf-card-sm">
                  <b className="text-ink">{c.t}</b> {c.d}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-wide grid gap-10 lg:grid-cols-2">
            <div className="min-w-0">
              <h2 className={H2}>What a result looks like</h2>
              <p className="mt-3 text-[15px] text-ink-2">An illustration of the report format, not a customer&apos;s model.</p>
              <div aria-label="Example report" className="mt-5 rounded-[20px] border border-rule bg-paper-2 p-5">
                <div className="mb-3 rounded-[12px] border border-[#e8c9c6] bg-[#fdf3f2] px-4 py-3">
                  <div className="font-semibold">Will not convert cleanly</div>
                  <div className="text-[13px] text-ink-2">1 blocker · 1 warning</div>
                </div>
                <div className="my-2 border-l-2 border-l-[#b3322f] py-2 pl-4">
                  <div className="font-semibold text-[#a32c29]">3 door/window(s) do not cut an opening in their host</div>
                  <div className="text-[14px] text-ink-2">The host wall stays solid and the door becomes a second solid block.</div>
                </div>
                <div className="my-2 border-l-2 border-l-[#8a6a00] py-2 pl-4">
                  <div className="font-semibold text-[#7a5d00]">No space boundaries exported for any of 12 spaces</div>
                  <div className="text-[14px] text-ink-2">Enable &quot;Export space boundaries&quot; in the IFC export settings.</div>
                </div>
                <div className="my-2 border-l-2 border-l-ink-3 py-2 pl-4 font-semibold text-ink-2">Length unit: millimetres</div>
              </div>
              <p className="mt-4 text-[15px] text-ink-2">
                Each finding names the elements involved and says what to change in the export. You can turn the report
                into a link and send it to whoever owns the model.
              </p>
            </div>
            <div className="min-w-0">
              <h2 className={H2}>What it does not check</h2>
              <ul className="mt-5 space-y-3">
                {NOT_CHECKED.map((x) => (
                  <li key={x} className="cf-card-sm">
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-wide">
            <h2 className={H2}>Need the CFD done?</h2>
            <p className="mt-3 max-w-[68ch] text-[15px] text-ink-2">
              Coreframe CFD calculates the pressure drop of a duct or pipe from one STL file, and room airflow and comfort
              for a box-shaped room you describe. It does not take IFC files yet.
            </p>
            <div className="cf-note mt-5 text-[15px] leading-6 text-ink-2">
              <b className="text-ink">Design guidance, not certification.</b> We are not the engineer of record and we do
              not sign off any submission to a building authority, fire department or certifying body.
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/cfd" className="cf-btn-secondary">
                See Coreframe CFD
              </Link>
              <span className="text-[14px] text-ink-3">Model clean? Get the pressure drop.</span>
            </div>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-wide">
            <h2 className={H2}>Questions</h2>
            <div className="mt-6 space-y-3">
              {FAQ.map((f) => (
                <details key={f.q} className="group rounded-cf border border-rule bg-paper-2 px-5 py-4 transition open:border-blue/25">
                  <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-4 text-[15.5px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span aria-hidden className="shrink-0 text-xl leading-none font-light text-blue">
                      <span className="group-open:hidden">+</span>
                      <span className="hidden group-open:inline">−</span>
                    </span>
                  </summary>
                  <p className="mt-3 max-w-[68ch] text-[14.5px] leading-6 text-ink-2">{f.a}</p>
                </details>
              ))}
            </div>

            <p className="mt-10 text-[15px] text-ink-2">
              Working from a DWG? The free{" "}
              <Link href="/dwg-check" className="text-blue underline underline-offset-2">
                DWG dimension checker
              </Link>{" "}
              finds walls no dimension measures. Rendering the model instead? See{" "}
              <Link href="/pricing" className="text-blue underline underline-offset-2">
                cloud GPU workstations
              </Link>{" "}
              or turn a floor plan into a concept render with{" "}
              <Link href="/floor-plan-to-render" className="text-blue underline underline-offset-2">
                Studio
              </Link>
              .
            </p>
            <p className="mt-4 text-[13px] text-ink-3">
              The door-opening check is based on the documented Revit → IFC → FDS failure discussed on the{" "}
              <a href="https://groups.google.com/g/fds-smv/c/bQ8G-bAmvNI" className="underline underline-offset-2" rel="noopener">
                FDS-SMV list
              </a>
              .
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
