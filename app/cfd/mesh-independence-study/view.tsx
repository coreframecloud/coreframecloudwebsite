import type { Metadata } from "next";
import Link from "next/link";
import { AREA_SERVED_WORLD, ORG_ID, SITE, breadcrumbList, faqPage, regionalOffers } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Fold } from "@/components/visuals/fold";
import { Callout, ExplainFigure, Hl, SectionHead } from "@/components/cfd-explainer";
import { VerifiedCard } from "@/components/cfd-explainer/verified-card";
import { CountUp } from "@/components/cfd-explainer/count-up";
import { BEND_RECORD, PIPE_RECORD, VERIFIED, VERIFIED_INR_ALL_IN, verifiedFrom, verifiedPriceLine } from "@/lib/cfd-verified";
import { getVisiblePost } from "@/lib/blog";
import { VERIFICATION_POST_SLUG } from "@/lib/blog/posts/verification-vs-validation-cfd";
import type { Currency } from "@/lib/money";
import { CLINIC_CASE, HVAC_PAGE, MESH_STUDY } from "@/lib/cfd-pages";
import { PageByline } from "@/components/seo/page-byline";

/**
 * /cfd/mesh-independence-study — the Verified package's landing page (owner,
 * 16 Oct 2026; SEO terms approved the same day: mesh independence study, grid
 * independence study, grid convergence index, GCI calculation, mesh
 * convergence study CFD, CFD verification and validation).
 *
 * Rendered twice like /cfd: INR here, USD at /usd/cfd/mesh-independence-study
 * for visitors outside India (proxy.ts rewrites; the browser and the canonical
 * stay on this URL). Only the prices differ.
 *
 * Facts: lib/cfd-verified.ts and cfd-runner/RUNBOOK.md (Validated section,
 * 16 Oct 2026 validation). The bend example is the live Verified run of 17 Oct
 * 2026 (job CF-MA2WOW), on the site since 18 Oct 2026 in place of the 16 Oct
 * run (12.20 Pa ± 0.85 %, indicative): 12.30 Pa ± 0.13 %, where the band is
 * the solver's own iteration-to-iteration change, larger than its GCI (0.08 %).
 * The running ads quote the same numbers; change both together. Never present
 * a band narrower than the solver's own change as a clean GCI. Convergence rule since
 * 17 Oct 2026 (control plane cfd_validated.convergence_words): residual
 * targets; else dP < 0.5 % over 300 iterations with residuals 3 orders down;
 * else a steady periodic solution (no drift, residuals 2 orders down, half the
 * oscillation in the band). No costs, margins, VM
 * types or competitor names on this page.
 */

export const PATH = VERIFIED.path;
const ART = "/cfd/explainer";

const TITLE = "Mesh Independence Study, GCI Calculation";
const DESCRIPTION =
  "A mesh independence study for duct and pipe CFD: the same case on three meshes, the grid convergence index (GCI) and a plain verdict. Results in 24 hours.";

export const meshStudyMetadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "mesh independence study",
    "grid independence study",
    "grid convergence index",
    "GCI calculation",
    "mesh convergence study CFD",
    "CFD verification and validation",
    "mesh independence study CFD service",
    "Celik GCI",
    "Richardson extrapolation CFD",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    images: [
      {
        url: "/cfd/og-mesh-independence.jpg",
        width: 1200,
        height: 630,
        alt: "Three meshes, one answer: a sketch of the same pipe bend on a coarse, a medium and a fine mesh",
      },
    ],
    title: "Mesh independence study (GCI) for duct and pipe CFD — Coreframe Cloud",
    description:
      "Three meshes, the grid convergence index, and one line that says whether the mesh still moves your pressure drop.",
    url: `${SITE}${PATH}`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Mesh independence study (GCI) for duct and pipe CFD — Coreframe Cloud",
    images: ["/cfd/og-mesh-independence.jpg"],
  },
};

const HERO = {
  src: `${ART}/g-three-meshes-gci.webp`,
  w: 1536,
  h: 640,
  alt: "Sketch of the same pipe bend three times: on a coarse, a medium and a fine mesh",
};

const METHOD: [string, string][] = [
  ["Three meshes", "Coarse, medium (your quoted mesh) and fine, with a refinement ratio r = 1.3 between neighbours. Same geometry, same boundary conditions, same wall-layer rule."],
  ["Solve each one", "Every mesh is run to its residual targets. If its residuals level off first, it still counts as converged when its pressure drop moves less than 0.5 % over the last 300 iterations and every residual has fallen 1,000-fold, or when it has settled into a small, regular oscillation with no drift (residuals down at least 100-fold and not growing); that oscillation then goes into the band. The report says which applied to each mesh."],
  ["Compare the answers", "Static pressure drop from inlet to outlet on each mesh. The changes between them tell us whether the answer converges as the cells get smaller, and how fast."],
  ["Calculate the GCI", "Grid convergence index on the fine mesh, per Celik et al. (2008), with a safety factor Fs = 1.25 and the apparent order limited to the formal order, 2."],
];

const FORMULAS: [string, string][] = [
  ["Meshes", "N₁ > N₂ > N₃ cells (fine, medium, coarse); r = (N₁ / N₂)^⅓ ≈ 1.3"],
  ["Changes", "ε₂₁ = φ₂ − φ₁ and ε₃₂ = φ₃ − φ₂, where φ is the pressure drop"],
  ["Apparent order", "p = | ln |ε₃₂ / ε₂₁| + q(p) | / ln r₂₁, used up to 2"],
  ["Relative change", "eₐ = | (φ₁ − φ₂) / φ₁ |"],
  ["GCI, fine mesh", "1.25 × eₐ / (r₂₁ᵖ − 1)"],
  ["If the answers oscillate", "1.25 × ½ (φmax − φmin) / φ₁ (Stern et al., 2001)"],
];

const NEED: [string, string][] = [
  ["A thesis or a paper", "Reviewers and examiners ask for a grid independence study as a matter of course. You get the three meshes, the numbers and the method in the report."],
  ["A number near a limit", "When the pressure drop decides a fan or a pump, the band around it matters as much as the number."],
  ["Two designs, a small difference", "If two fittings differ by 3 %, you need to know the mesh error is well under 3 % before you pick one."],
  ["A report for a client", "A single line they can read: mesh-independent, the value, and the band, from a stated method."],
];

function faqs(cur: Currency) {
  return [
    {
      q: "What is a mesh independence study?",
      a: "A check that your CFD answer no longer depends on the mesh. The same case is solved on at least three meshes of increasing fineness; if the result of interest, here the pressure drop, stops changing in a consistent way as the cells get smaller, the mesh is no longer a significant source of error. The grid convergence index (GCI) puts a number on the error that is left.",
    },
    {
      q: "Is a grid independence study the same as a mesh convergence study?",
      a: "Yes. Mesh independence study, grid independence study, mesh convergence study and grid convergence study are names for the same check. 'Grid' is the older word for the mesh.",
    },
    {
      q: "What is the grid convergence index (GCI)?",
      a: "A standard way, from Roache and set out step by step by Celik et al. (2008), to report the discretisation error of a CFD result as a percentage band. From three meshes it estimates how fast the answer converges (the apparent order), then scales the change between the two finest meshes by a safety factor of 1.25. We report it on the fine mesh: for example, 'Mesh-independent: static pressure drop = 12.30 Pa ± 0.13 % (fine mesh)'.",
    },
    {
      q: "How many meshes does a GCI calculation need?",
      a: "Three. Two meshes give a change but not a rate, so you cannot tell whether the answer is converging. We use three with a refinement ratio of 1.3 between them, which is the minimum Celik et al. recommend.",
    },
    {
      q: "Does mesh-independent mean the CFD result is right?",
      a: `No. ${VERIFIED.meaning} A mesh independence study is verification: it checks that the equations were solved accurately on your geometry. Whether those equations, the turbulence model above all, describe the real flow is validation, which needs a comparison with measurements or a trusted correlation. On our own straight pipe the result was mesh-independent within 0.63 % and still 4.8 % below the Haaland correlation.`,
    },
    {
      q: "What does a mesh independence study cost?",
      a: `${verifiedPriceLine(cur)} Pre-processing / mesh check is charged separately, as for every package. You pay for the iterations run on the meshes that were solved, never more than the quote; a mesh that fails on our side is not charged.`,
    },
    {
      q: "How long does it take?",
      a: `Results within ${VERIFIED.deliveryHours} hours of payment. The study is not offered as express: three meshes, the finest about 2.2 times your quoted mesh, need the time.`,
    },
    {
      q: "Which models qualify?",
      a: `Internal flow: pipes, ducts, bends, reducers, fittings and manifolds, air or water, steady and isothermal, with a quoted mesh up to about ${VERIFIED.maxMcells} million cells. If your model does not qualify, the quote says why and still offers the single-mesh packages.`,
    },
    {
      q: "What if the meshes do not agree?",
      a: "The report says so in one line, with all three results, so you know the mesh is still part of the answer. Answers that go up and down between meshes are judged on 1.25 times half their spread (Stern et al., 2001); and the band we report is never narrower than the solver's own swing on a mesh whose result was still moving.",
    },
  ];
}

export default async function MeshStudyView({ currency }: { currency: Currency }) {
  const post = getVisiblePost(VERIFICATION_POST_SLUG);
  const faq = faqs(currency);
  const usd = currency === "USD";
  // The same structured data on both copies (SEO review 18 Oct 2026, T2):
  // INR (India, the all-in amount) and USD (elsewhere) Offers, whichever copy a crawler got.
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE}${PATH}#service`,
    name: "Mesh independence study (GCI) for duct and pipe CFD",
    alternateName: ["Verified", "Grid independence study", "Mesh convergence study", "Grid convergence index (GCI) calculation"],
    serviceType: "CFD verification: mesh independence study with the grid convergence index",
    provider: { "@id": ORG_ID },
    url: `${SITE}${PATH}`,
    areaServed: AREA_SERVED_WORLD,
    isRelatedTo: { "@id": `${SITE}/#cfd-service` },
    description:
      "The same internal-flow CFD case (pipes, ducts, fittings, manifolds) solved on three meshes, refinement ratio 1.3, with the grid convergence index per Celik et al. (2008) and a verdict on the static pressure drop in the PDF report. Results within 24 hours.",
    offers: regionalOffers({
      name: "Verified: mesh-independence study (GCI)",
      inr: VERIFIED_INR_ALL_IN.from,
      usd: VERIFIED.fromUsd,
      url: `${SITE}${PATH}`,
      from: true,
      // Text in the page's currency only (owner, 18 Oct 2026); the two
      // regional Offers stay.
      description: `${verifiedPriceLine(currency)} Plus pre-processing / mesh check.`,
    }),
  };

  // The worked example as an article and a dataset (SEO review 18 Oct 2026,
  // 3.2): the 17 Oct live run is the dated, citable record answer engines
  // otherwise invent numbers for.
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${SITE}${PATH}#article`,
    headline: "Mesh independence study for duct and pipe CFD, with a worked GCI example",
    description: DESCRIPTION,
    url: `${SITE}${PATH}`,
    inLanguage: "en-IN",
    about: [
      { "@type": "Thing", name: "Grid convergence index" },
      { "@type": "Thing", name: "Mesh independence study" },
    ],
    datePublished: "2026-10-16",
    dateModified: MESH_STUDY.updated,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    image: `${SITE}/cfd/og-mesh-independence.jpg`,
    mainEntityOfPage: `${SITE}${PATH}`,
  };
  const datasetLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${SITE}${PATH}#bend-dataset`,
    name: "Three-mesh pressure drop of a 90° bend (Coreframe Verified run, 17 October 2026)",
    description: `Static pressure drop of a ${BEND_RECORD.case} on three meshes with refinement ratio 1.3: ${BEND_RECORD.meshes
      .map((m) => `${m.level.toLowerCase()} ${m.mcells.toFixed(2)} M cells, ${m.dp.toFixed(3)} Pa`)
      .join("; ")}. Verdict: ${BEND_RECORD.verdict} (fine mesh); GCI ${BEND_RECORD.gciPct} %, band set by the solver's own iteration-to-iteration change.`,
    url: `${SITE}${PATH}#example`,
    creator: { "@id": ORG_ID },
    datePublished: "2026-10-18",
    dateModified: MESH_STUDY.updated,
    temporalCoverage: "2026-10-17",
    isAccessibleForFree: true,
    variableMeasured: [
      { "@type": "PropertyValue", name: "Cells", unitText: "million cells" },
      { "@type": "PropertyValue", name: "Static pressure drop", unitCode: "PAL", unitText: "Pa" },
    ],
    measurementTechnique: "CFD mesh independence study, grid convergence index (Celik et al. 2008)",
  };

  return (
    <div className="cfx-paper relative min-h-screen text-ink" data-usd-view={usd ? "" : undefined}>
      <JsonLd
        data={breadcrumbList([
          { name: "CFD for ducts and pipes", path: "/cfd" },
          { name: "Mesh independence study", path: PATH },
        ])}
      />
      <JsonLd data={faqPage(faq)} />
      <JsonLd data={serviceLd} />
      <JsonLd data={articleLd} />
      <JsonLd data={datasetLd} />
      <main className="relative">
        {/* ── Hero (paper variant, the three-meshes sketch on the right) ── */}
        <section className="cf-section px-5 cf-pagehero cf-pagehero--paper">
          <div className="cf-wide grid items-center gap-8 min-[900px]:grid-cols-[7fr_5fr]">
            <div className="min-w-0 max-w-[640px]">
              <p className="cf-eyebrow">CFD · Verified · mesh-independence study (GCI)</p>
              <h1 className="cf-display mt-5">Mesh independence study for your duct or pipe CFD.</h1>
              {/* Answer-first, quotable (SEO review 18 Oct 2026, 3.2). Numbers from BEND_RECORD. */}
              <p className="cf-lead mt-5 max-w-[52ch]">
                A mesh independence study solves the same CFD case on three successively finer meshes and checks whether the
                answer still moves. The grid convergence index (GCI, Celik et al. 2008) turns the change into an error band.
                On our 90° bend, three meshes from {BEND_RECORD.meshes[0].mcells} to {BEND_RECORD.meshes[2].mcells} million
                cells gave {BEND_RECORD.meshes.map((m) => m.dp.toFixed(3)).join(", ").replace(/, ([^,]*)$/, " and $1")} Pa:
                reported as mesh-independent, {BEND_RECORD.resultPa.toFixed(2)} Pa ± {BEND_RECORD.bandPct} %.
              </p>
              <p className="mt-4 text-[15px] leading-6">
                {verifiedFrom(currency)} · results within {VERIFIED.deliveryHours} hours · internal flow up to about{" "}
                {VERIFIED.maxMcells} M cells
              </p>
              <PageByline path={MESH_STUDY.path} published="2026-10-16" className="mt-2 text-ink-3" />
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/cfd#start" className="cf-btn-primary">Start a job</Link>
                <a href="#example" className="cf-btn-secondary">See a worked example</a>
              </div>
            </div>
            <ExplainFigure
              src={HERO.src}
              alt={HERO.alt}
              width={HERO.w}
              height={HERO.h}
              sizes="(max-width: 900px) 100vw, 560px"
              caption="Coarse, medium, fine: the same bend on three meshes. Illustration."
            />
          </div>
        </section>

        {/* ── 1. What it is ─────────────────────────────────────────── */}
        <section className="cf-section px-5">
          <div className="cf-wide">
            <SectionHead n={1} tint="teal" eyebrow="The idea" title="What a mesh independence study is.">
              Also called a grid independence study or a mesh convergence study. One case, three meshes, one question: is
              the mesh still part of the answer?
            </SectionHead>
            <div className="grid gap-8 min-[900px]:grid-cols-2">
              <div className="min-w-0 space-y-4 text-[16px] leading-[1.65] text-ink-2">
                <p>
                  A CFD solver works on cells. Cells that are too big smear out the detail of the flow, and the pressure drop
                  you read carries some error from the mesh itself. Make the cells smaller and the answer moves; make them
                  smaller again and, on a well-behaved case, it moves less.
                </p>
                <p>
                  A mesh independence study measures that movement. When the change between the two finest meshes is small
                  and shrinking the way theory says it should, the mesh is no longer what decides your number, and the grid
                  convergence index (GCI) tells you how big a band to put around it.
                </p>
              </div>
              <dl className="grid gap-4">
                {METHOD.map(([k, v], i) => (
                  <div key={k} className="min-w-0 rounded-[6px] border-[1.5px] border-ink bg-paper px-5 py-4">
                    <dt className="cfx-eyebrow">
                      {i + 1} · {k}
                    </dt>
                    <dd className="mt-2 text-[15px] leading-6 text-ink-2">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ── 2. The GCI calculation ────────────────────────────────── */}
        <section id="gci" className="cf-section scroll-mt-20 px-5 pt-0">
          <div className="cf-wide">
            <SectionHead n={2} tint="blue" eyebrow="The method" title="How we do the GCI calculation.">
              The procedure published by Celik et al. (2008) in the Journal of Fluids Engineering, the one most journals ask
              for, applied to the static pressure drop.
            </SectionHead>
            <div className="overflow-hidden rounded-[6px] border-[1.5px] border-ink bg-paper">
              {FORMULAS.map(([k, v], i) => (
                <div key={k} className={`flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:gap-6 ${i ? "border-t border-rule" : ""}`}>
                  <dt className="text-sm font-semibold text-ink sm:w-48 sm:shrink-0">{k}</dt>
                  <dd className="min-w-0 font-mono text-[13.5px] leading-6 break-words text-ink-2">{v}</dd>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="cf-card">
                <h3 className="cf-card-label">Never narrower than the solver</h3>
                <p className="cf-section-copy">
                  When a mesh did not stop on its residual targets, the band is at least half the swing of its pressure drop
                  over the last 300 iterations, or over whole periods when it oscillates (Stern et al. 2001). If the meshes
                  differ by less than that swing, the swing is the band and the verdict says so.
                </p>
              </div>
              <div className="cf-card">
                <h3 className="cf-card-label">One line in the report</h3>
                <p className="cf-section-copy">
                  “Mesh-independent: static pressure drop = X Pa ± Y % (GCI, fine mesh)”, or a plain statement that it was not
                  shown, with all three meshes, their cells and their results in a table, and the plot.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Worked example: our bend ───────────────────────────── */}
        <section id="example" className="cf-section scroll-mt-20 px-5 pt-0">
          <div className="cf-wide">
            <SectionHead n={3} tint="coral" eyebrow="Worked example" title="Our 90° bend on three meshes.">
              A live Verified run of 17 October, through the same code a customer job uses: {BEND_RECORD.case}.
            </SectionHead>
            <div className="grid gap-8 min-[900px]:grid-cols-[7fr_5fr] min-[900px]:items-start">
              <div className="min-w-0">
                <div className="overflow-hidden rounded-[6px] border-[1.5px] border-ink bg-paper">
                  <table className="w-full border-collapse text-[15px] text-ink-2">
                    <thead>
                      <tr className="text-left">
                        <th scope="col" className="px-4 py-3 font-mono text-[12px] font-normal tracking-[0.12em] text-ink-3 uppercase">Mesh</th>
                        <th scope="col" className="px-4 py-3 text-right font-mono text-[12px] font-normal tracking-[0.12em] text-ink-3 uppercase">Cells</th>
                        <th scope="col" className="px-4 py-3 text-right font-mono text-[12px] font-normal tracking-[0.12em] text-ink-3 uppercase">Static ΔP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BEND_RECORD.meshes.map((m) => (
                        <tr key={m.level} className="border-t border-rule">
                          <th scope="row" className="px-4 py-3 text-left font-semibold text-ink">{m.level}</th>
                          <td className="px-4 py-3 text-right">{m.mcells.toFixed(2)} M</td>
                          <td className="px-4 py-3 text-right">{m.dp.toFixed(3)} Pa</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 space-y-4 text-[16px] leading-[1.65] text-ink-2">
                  <p>
                    The medium and fine meshes differ by 0.04 %, and the GCI on the fine mesh is 0.08 %.
                  </p>
                  <p>
                    Each mesh converged under the rule above. The coarse mesh reached its residual targets (663 iterations).
                    The medium mesh met the engineering criterion: its pressure drop moved less than 0.5 % over the last 300
                    iterations, with every residual down 1,000-fold (1,500 iterations). The fine mesh settled into a steady
                    periodic solution, a small, regular oscillation with no drift (2,400 iterations).
                  </p>
                  <p>
                    The solver&apos;s own iteration-to-iteration change on the fine mesh, ± 0.13 %, is larger than the GCI, so
                    it is the band in the verdict: the band is never narrower than the solver&apos;s own change.
                  </p>
                </div>
              </div>
              <div className="min-w-0">
                <div className="cfx-ministat mt-0">
                  <CountUp to={BEND_RECORD.bandPct} decimals={2} prefix="± " suffix=" %" />
                  <span>the band on the fine-mesh pressure drop</span>
                </div>
                <div className="mt-6 rounded-[6px] border-[1.5px] border-ink bg-paper px-5 py-4">
                  <p className="cfx-eyebrow">Verdict in the report</p>
                  <p className="mt-2 font-heading text-[19px] leading-[1.4] text-ink">{BEND_RECORD.verdict} (fine mesh)</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Verification vs validation ─────────────────────────── */}
        <section id="verification" className="cf-section scroll-mt-20 px-5 pt-0">
          <div className="cf-wide">
            <SectionHead n={4} tint="teal" eyebrow="CFD verification and validation" title="Verified is not the same as validated.">
              Verification asks whether the equations were solved right. Validation asks whether they were the right
              equations. A mesh independence study answers the first question only.
            </SectionHead>
            <div className="grid gap-8 min-[900px]:grid-cols-2 min-[900px]:items-center">
              <div className="min-w-0 space-y-4 text-[16px] leading-[1.65] text-ink-2">
                <p>
                  Our straight pipe, {PIPE_RECORD.lengthD} diameters long, gave {PIPE_RECORD.dps.join(", ")} Pa on its three
                  meshes: within {PIPE_RECORD.spreadPct} % of each other. Its developed friction factor carried a GCI of ±{" "}
                  {PIPE_RECORD.frictionGciPct} %. Verified, by any measure.
                </p>
                <p>
                  And it was {Math.abs(PIPE_RECORD.vsHaalandPct)} % below the Haaland correlation, well outside that band. The gap
                  comes from the turbulence model at this low Reynolds number, not from the mesh, so no amount of mesh
                  refinement would show it. Only a comparison with a correlation or a measurement does.
                </p>
                <p>
                  That is why we keep the two words apart. Verified tells you the mesh error is small. Our{" "}
                  <Link href="/cfd#right" className="text-ink underline underline-offset-4">validation cases</Link> tell you how the
                  model compares with the textbook. You get both, labelled for what they are.
                </p>
              </div>
              <Callout source="What Verified means">
                Mesh-independent means the mesh error is small; it <Hl>does not mean the result matches experiments</Hl>.
              </Callout>
            </div>
            <ul className="mt-8 space-y-1.5 text-[15px] leading-6 text-ink-2">
              {post ? (
                <li>
                  Read more:{" "}
                  <Link href={`/blog/${post.slug}`} className="text-ink underline underline-offset-4">
                    {post.title}
                  </Link>
                </li>
              ) : null}
              <li>
                A whole-floor example:{" "}
                <Link href={CLINIC_CASE.path} className="text-ink underline underline-offset-4">
                  HVAC CFD on a clinic floor with 90 diffusers
                </Link>{" "}
                (indicative, and labelled so), and{" "}
                <Link href={HVAC_PAGE.path} className="text-ink underline underline-offset-4">
                  room airflow CFD for HVAC
                </Link>
                .
              </li>
            </ul>
          </div>
        </section>

        {/* ── 5. When you need one ──────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-wide">
            <p className="cf-eyebrow">When it is worth it</p>
            <h2 className="cf-section-title mt-4">When a single mesh is not enough.</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {NEED.map(([t, b]) => (
                <div key={t} className="cf-card">
                  <h3 className="cf-card-label">{t}</h3>
                  <p className="cf-section-copy">{b}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[15px] leading-6 text-ink-2">
              For a quick sizing number, the single-mesh Draft and Standard packages on{" "}
              <Link href="/cfd" className="text-ink underline underline-offset-4">CFD for ducts and pipes</Link> are enough: every
              mesh passes our quality check and has wall layers sized for y+ ≈ 1.
            </p>
          </div>
        </section>

        {/* ── 6. The package ────────────────────────────────────────── */}
        <section id="package" className="cf-section scroll-mt-20 px-5 pt-0">
          <div className="cf-wide">
            <VerifiedCard currency={currency} learnMore={false} />
            <p className="mt-5 text-[14px] leading-6 text-ink-3">
              How to order: start a duct or pipe job on <Link href="/cfd#start" className="underline underline-offset-4">/cfd</Link>.
              After pre-processing / mesh check, Verified appears on your quote next to Draft and Standard whenever your
              model qualifies.
            </p>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────── */}
        <section className="cf-section px-5 pt-0">
          <div className="cf-col">
            <h2 className="cf-section-title">Questions.</h2>
            {faq.map((f) => (
              <Fold key={f.q} title={f.q}>
                <p className="mt-3 text-[15px] leading-6 break-words text-ink-2">{f.a}</p>
              </Fold>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
