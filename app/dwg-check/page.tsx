import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { PageByline } from "@/components/seo/page-byline";
import { breadcrumbList, faqPage, OG_IMAGE, ORG_ID, SITE } from "@/lib/seo";
import { pageUpdated } from "@/lib/page-dates";
import { DwgChecker } from "./dwg-checker";

/**
 * /dwg-check: the free DWG dimension checker.
 *
 * Moved into the site with /tools (owner, 6 Nov 2026): page, copy, metadata,
 * FAQ and schema here; the read-only check stays on the control plane behind
 * the same-origin /api/tools/:path* rewrite (./dwg-checker.tsx). No price on
 * the page, so no /usd copy.
 */

const PATH = "/dwg-check";
const PAGE_URL = `${SITE}${PATH}`;

export const metadata: Metadata = {
  // Snippet rewrite 9 Nov 2026 (AEO week): "dimensions dwg" at 8.4 with no
  // clicks; the title and description now carry "check DWG dimensions online"
  // and "without AutoCAD", the two searches the backlog asked us to answer.
  title: { absolute: "Free DWG Dimension Checker Online: Find Missing Dimensions" },
  description:
    "Check DWG dimensions online, free and without AutoCAD: upload a DWG or DXF to find missing dimensions and overridden dimension text. No signup.",
  alternates: { canonical: PATH },
  openGraph: {
    images: [OG_IMAGE],
    title: "Free DWG dimension checker — Coreframe",
    description: "Find missing dimensions and dimensions that disagree with the geometry in a DWG or DXF. Free, no signup, read-only.",
    url: PAGE_URL,
    type: "website",
  },
};

const FAQ: { q: string; a: string }[] = [
  // Answer-first entries added 9 Nov 2026 (AEO week: promote the DWG checker).
  {
    q: "How do I check DWG dimensions online for free?",
    a: "Upload the DWG or DXF on this page. In a few seconds you get a free report of wall positions that no dimension measures, dimensions whose typed-over text disagrees with the length they span, dimensions printed at a length scale factor and exploded dimensions that will never update. There is no account, email or card, and the file is deleted once it has been read.",
  },
  {
    q: "Can I check a DWG without AutoCAD?",
    a: "Yes. You upload the file from a web browser and our service reads the DWG itself, so you need no AutoCAD, no DWG viewer and no plug-in, on Windows, macOS or Linux. It reads AutoCAD 2000 to 2018 DWG files and DXF. To view the drawing and measure single distances yourself, Autodesk's DWG TrueView viewer opens DWG files.",
  },
  {
    q: "How do I find missing dimensions in a DWG file?",
    a: "Upload the DWG to this page. It reads every axis-aligned wall face in the drawing, reads the interval every existing dimension measures, and reports each gap between two wall faces that no dimension locates. A sheet holding several plans is split first, so a dimension string is never measured from one building to another, and an evenly spaced run inside one overall dimension, such as stair treads, louvres or parking bays, counts as dimensioned.",
  },
  {
    q: "Does it change my drawing?",
    a: "No. The free check is read-only, and no module that can modify a drawing is present in the service. The file is deleted as soon as it has been read. Nothing about it is kept except anonymous counts: the DWG version, how many objects and dimensions it held, and which checks fired. The file name is never recorded, because in this trade a file name is routinely a client's name.",
  },
  {
    q: "Is it free, and do I need AutoCAD or an account?",
    a: "It is free, and you need neither AutoCAD nor an account, email address or card. The full report is shown on the first pass. Reading is verified for AutoCAD 2000, 2004, 2007, 2010, 2013 and 2018 DWG files, plus DXF. 2021 and 2025 files are untested: the checker identifies the version and tells you before it tries.",
  },
  {
    q: "What will it miss?",
    a: "It measures axis-aligned geometry, so curved and angled walls are not checked for missing dimensions. It cannot read Revit (.rvt) or MicroStation (.dgn) files: export a DWG. And it reports what a drawing does not measure, not whether the building is right, buildable or compliant with any code.",
  },
  {
    q: "Can I get the drawing back with the missing dimensions added?",
    a: "Not from this page. Adding them would be a separate paid service, and it is not open. This check is free while we find out how common the problem actually is. If you want it, email hello@coreframecloud.com and we will come back to you if it opens.",
  },
];

const APP_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${PAGE_URL}#app`,
  name: "Coreframe DWG dimension checker",
  url: PAGE_URL,
  applicationCategory: "DesignApplication",
  applicationSubCategory: "CAD drawing quality check",
  operatingSystem: "Any (runs in a web browser, nothing to install)",
  browserRequirements: "A current web browser",
  inLanguage: "en",
  isAccessibleForFree: true,
  audience: { "@type": "Audience", audienceType: "Architects, drafters, CAD managers and contractors" },
  offers: [
    { "@type": "Offer", price: "0", priceCurrency: "INR" },
    { "@type": "Offer", price: "0", priceCurrency: "USD" },
  ],
  featureList: [
    "Finds wall positions that no dimension in the drawing measures",
    "Finds dimensions whose typed-over text disagrees with the geometry",
    "Finds dimensions printed at a length scale factor",
    "Finds plain text on a dimension layer left by an exploded dimension",
    "Finds duplicate and zero-length lines, empty layers, unused blocks and styles",
    "Finds geometry on layers that are turned off or frozen",
    "Reports whether the drawing's unit settings agree with each other",
    "Reads DWG (AutoCAD 2000 to 2018) and DXF without AutoCAD installed",
  ],
  dateModified: pageUpdated(PATH),
  publisher: { "@id": ORG_ID },
  provider: { "@id": ORG_ID },
};

const LOOKS_FOR: { t: string; body: ReactNode }[] = [
  {
    t: "Wall positions nothing measures",
    body: (
      <>
        The one worth running it for. Every axis-aligned wall face in the drawing is found, every existing dimension is
        reduced to the interval it measures, and any gap between two faces that no dimension locates is reported. A sheet
        holding several plans is split first, so a dimension string is never measured from one building to another, and
        an evenly spaced run inside one overall dimension (stair treads, louvres, parking bays) counts as dimensioned,
        because that is how a drafter gives them.
      </>
    ),
  },
  {
    t: "Dimensions that print a different number from the one they measure",
    body: (
      <>
        A dimension can carry a literal text that replaces the measured value, so a drawing can read <code>9&quot;</code>{" "}
        over geometry that measures 36.00. The override is parsed and reconciled against the geometry first (feet and
        inches, fractions, and repeat annotations like <code>11 no.of Treads At 10.5&quot; Each</code>, which measures
        115.50 and is correct), so only genuine disagreements are raised, with both numbers shown. It is reported as a
        question, not a verdict: the checker does not know which number is right, only that they differ.
      </>
    ),
  },
  {
    t: "Dimensions that no longer update",
    body: (
      <>
        Plain text sitting on a dimension layer and reading like a measurement is usually an exploded dimension. Once
        exploded, the number is frozen: the wall can move and the drawing keeps printing the old figure. Length scale
        factors are reported for the same reason: they print a number the geometry does not hold.
      </>
    ),
  },
  {
    t: "Dead weight, and things you cannot see",
    body: (
      <>
        Duplicate lines stacked on each other, lines with no length, empty layers, block definitions never placed,
        dimension and text styles nothing uses. Plus geometry sitting on layers that are turned off or frozen, which
        anyone taking quantities off the file should know is there.
      </>
    ),
  },
  {
    t: "Units that contradict each other",
    body: (
      <>
        A drawing declares its units in one place and implies them in two others. The checker reports what the file
        declares and whether its length formatting and hatch library agree, and says nothing at all when they do not: a
        confidently wrong unit in a report is worse than silence.
      </>
    ),
  },
];

export default function DwgCheckPage() {
  return (
    <div className="relative min-h-screen text-ink">
      <JsonLd data={APP_SCHEMA} />
      <JsonLd data={breadcrumbList([{ name: "Free DWG dimension checker", path: PATH }])} />
      <JsonLd data={faqPage(FAQ)} />

      <main className="relative">
        <section className="cf-pagehero cf-pagehero--paper px-5">
          <div className="cf-wide">
            <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-ink-3">
              <Link href="/">Coreframe</Link> / <span>Free DWG dimension checker</span>
            </nav>
            {/* No "TOOL" here: the Inter build has no T-O kerning pair, so the tracked caps read "T OOL" at 390 px (tester, 9 Nov 2026). */}
            <p className="cf-eyebrow mb-5">Free · read-only · no signup</p>
            <h1 className="cf-display max-w-[20ch]">
              Free DWG dimension checker: <span className="cf-hl-marker">find missing dimensions</span>
            </h1>
            <p className="cf-lead mt-6 max-w-[62ch]">
              Upload a DWG (AutoCAD 2000 to 2018) or a DXF of up to 95 MB and get a free list of wall positions no
              dimension measures, dimensions whose printed value disagrees with the geometry, and dead weight you can
              purge. The file is read and deleted, never modified, and there is nothing to sign up for.
            </p>
            <PageByline path={PATH} className="mt-4 text-ink-3" />
          </div>
        </section>

        <section className="px-5 pt-10 pb-4">
          <div className="cf-wide">
            <DwgChecker />
          </div>
        </section>

        <section className="cf-section px-5">
          <div className="cf-wide">
            <h2 className="cf-section-title">What it looks for</h2>
            <p className="mt-3 text-[15px] text-ink-2">Ordered by who has to act on it.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {LOOKS_FOR.map((x) => (
                <div key={x.t} className="cf-card-sm">
                  <h3 className="mb-1.5 text-[16px] font-semibold text-ink">{x.t}</h3>
                  <p>{x.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="cf-rule" />

        <section className="cf-section px-5">
          <div className="cf-wide">
            <h2 className="cf-section-title">Questions</h2>
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

            <div className="cf-note mt-10 text-[14px] leading-6 text-ink-2">
              <b className="text-ink">Re-verify everything in this report.</b> Coreframe signs off nothing. A clean result
              is not an approval, and findings may be wrong in either direction: raised where the drawing is fine, silent
              where it is not. Responsibility for the drawing stays with the person who seals it. This report must not be
              attached to, or cited in, any submission to a building authority, fire department or certifying body.
            </div>

            <p className="mt-8 text-[15px] text-ink-2">
              Guide:{" "}
              <Link href="/blog/check-dwg-dimensions-without-autocad" className="text-blue underline underline-offset-2">
                how to check DWG dimensions without AutoCAD
              </Link>
              , with the AutoCAD commands for each check and real questions from drafting forums.
            </p>

            <p className="mt-4 text-[15px] text-ink-2">
              Also free: the{" "}
              <Link href="/tools" className="text-blue underline underline-offset-2">
                no-install IFC model checker
              </Link>
              , for what will break a BIM model on the way into a{" "}
              <Link href="/cfd" className="text-blue underline underline-offset-2">
                CFD
              </Link>{" "}
              conversion. Questions about adding dimensions:{" "}
              <a href="mailto:hello@coreframecloud.com?subject=DWG%20dimension%20check" className="text-blue underline underline-offset-2">
                hello@coreframecloud.com
              </a>
              .
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
