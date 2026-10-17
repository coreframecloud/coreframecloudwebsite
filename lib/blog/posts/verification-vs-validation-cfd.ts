import type { BlogPost } from "../types";

export const VERIFICATION_POST_SLUG = "verification-vs-validation-cfd-mesh-independence";
const SLUG = VERIFICATION_POST_SLUG;
const IMG = `/blog/${SLUG}`;

/**
 * Published 17 Oct 2026 (owner approved), CFD explainer style, written for the Verified package
 * launch (lib/cfd-verified.ts; landing page /cfd/mesh-independence-study).
 * Owner approved it 17 Oct 2026.
 *
 * Numbers are our own 16 Oct 2026 validation runs (cfd-runner/RUNBOOK.md,
 * Validated section): the bend 12.247 / 12.240 / 12.205 Pa on 0.25 / 0.54 /
 * 1.21 M cells, GCI 0.51 % with p capped at 2, reported band ± 0.85 % set by
 * the solver's swing (medium and fine did not reach their residual targets),
 * hence "indicative"; the straight pipe 72 D within 0.63 %, developed friction
 * factor GCI ± 0.6 %, -4.8 % against Haaland (Re 13,300, k-omega SST). No price
 * in the body: prices live on the landing page, which follows the visitor's
 * currency. No costs, machines or competitor names.
 */
export const verificationVsValidationCfd: BlogPost = {
  slug: SLUG,
  title: "Verification vs validation in CFD: what a mesh-independence study does (and doesn't) prove",
  metaTitle: "Verification vs Validation in CFD",
  description:
    "A mesh-independence study shows the mesh error is small, not that CFD matches reality. A worked GCI example on a 90° bend, and the gap it cannot see.",
  targetQueries: [
    "CFD verification and validation",
    "verification vs validation CFD",
    "mesh independence study",
    "grid convergence index example",
    "GCI calculation example",
    "grid independence study",
  ],
  datePublished: "2026-10-17",
  draft: false,
  eyebrow: "CFD · Verification",
  hero: {
    src: `${IMG}/g-three-meshes-gci.webp`,
    alt: "Sketch of the same pipe bend three times: on a coarse, a medium and a fine mesh",
    width: 1536,
    height: 640,
    caption: "One bend, three meshes. If the answer stops moving as the cells shrink, the mesh is no longer part of it. Illustration.",
  },
  answer: () =>
    "Verification asks whether a CFD model's equations were solved accurately; validation asks whether those equations describe the real flow. A mesh-independence study, reported with the grid convergence index (GCI), is verification: it shows that the error from the mesh is small. It cannot show that the turbulence model, the boundary conditions or the physics are right. That takes a comparison with measurements or a trusted correlation, and a good CFD report keeps the two apart.",
  body: () => [
    { type: "sectionHead", n: 1, tint: "teal", eyebrow: "Two questions", title: "Solving the equations right, and solving the right equations" },
    {
      type: "p",
      text: "Every CFD result has two kinds of error. Numerical error comes from turning smooth equations into millions of small cells and iterating until they balance: cells too coarse, iterations stopped too soon. Modelling error comes from the equations themselves: a turbulence model that is an approximation, an inlet profile that is a guess, a wall roughness nobody measured.",
    },
    {
      type: "table",
      head: ["", "Verification", "Validation"],
      rows: [
        ["The question", "Were the equations solved accurately?", "Do the equations describe the real flow?"],
        ["What it measures", "Numerical error: mesh, iterations, round-off", "Modelling error: turbulence model, physics, inputs"],
        ["How it is checked", "Residuals, mesh independence (GCI)", "Measurements, trusted correlations, benchmarks"],
        ["What it needs", "Only the model, run more than once", "Data from outside the model"],
      ],
    },
    {
      type: "p",
      text: "The two are easy to blur, because both end with a percentage. They answer different questions, and a small number on one says nothing about the other.",
    },

    { type: "sectionHead", n: 2, tint: "blue", eyebrow: "Verification", title: "What a mesh-independence study does" },
    {
      type: "p",
      text: "Solve the same case on three meshes, each finer than the last by a fixed ratio (we use 1.3 in each direction). If the result converges as the cells shrink, the change between the two finest meshes, scaled by how fast the result is converging and by a safety factor, is the grid convergence index. Celik et al. (2008) set the procedure out step by step, and it is what most journals ask for.",
    },
    {
      type: "spec",
      label: "The GCI on the fine mesh",
      rows: [
        ["r", "≈ 1.3, mesh to mesh"],
        ["p", "apparent order, capped at 2"],
        ["eₐ", "|φ₁ − φ₂| / φ₁"],
        ["GCI", "1.25 · eₐ / (rᵖ − 1)"],
      ],
    },
    { type: "p", text: "Here φ₁ is the result on the fine mesh and φ₂ on the medium one; the apparent order p comes from all three results." },
    {
      type: "p",
      text: "When the three results go up and down instead of converging in one direction, the GCI formula breaks. A common fallback (Stern et al., 2001) is to take 1.25 times half the spread of the three results as the band.",
    },

    { type: "sectionHead", n: 3, tint: "coral", eyebrow: "Worked example", title: "A 90° bend on three meshes", text: "Our own test: air at 4 m/s through a 50 mm bend with R/D 1.5, solved with OpenFOAM." },
    {
      type: "table",
      head: ["Mesh", "Cells", "ΔP"],
      rows: [
        ["Coarse", "0.25 M", "12.247 Pa"],
        ["Medium", "0.54 M", "12.240 Pa"],
        ["Fine", "1.21 M", "12.205 Pa"],
      ],
    },
    {
      type: "p",
      text: "The refinement ratio from medium to fine is (1.21 / 0.54)^⅓ ≈ 1.31. The relative change between those two meshes is 0.035 / 12.205 ≈ 0.29 %. With the order capped at 2, rᵖ − 1 ≈ 0.71, and the GCI is 1.25 × 0.29 % / 0.71 ≈ 0.5 %.",
    },
    {
      type: "explainFigure",
      src: `${IMG}/c-convergence-funnel.webp`,
      alt: "Sketch of a glass funnel: tangled colourful lines go in at the top, one calm line comes out of the spout",
      width: 1024,
      height: 1024,
      maxWidth: 360,
      caption: "A run is converged when its residuals have settled under their targets. Illustration.",
    },
    {
      type: "p",
      text: "There is a catch, and it is the useful part. The medium and fine runs never quite reached their residual targets: the separated flow downstream of the bend kept moving, and their pressure drop still swung by up to 1.7 % over the last 200 iterations. That swing is larger than the differences between the meshes, so a 0.5 % band would claim more than the runs can support. We report half the swing instead.",
    },
    { type: "statement", big: "0.85 %", caption: "the band we report: 12.20 Pa ± 0.85 % on the fine mesh (indicative)" },
    {
      type: "note",
      text: "Indicative, because two of the three meshes did not reach their residual targets. A band is never narrower than the solver's own swing.",
    },

    { type: "sectionHead", n: 4, tint: "teal", eyebrow: "Validation", title: "What it doesn't prove" },
    {
      type: "p",
      text: "Our second test was a straight pipe, 72 diameters long, at a Reynolds number of about 13,300. Its three meshes gave 19.94, 20.07 and 19.97 Pa, within 0.63 % of each other. The developed friction factor carried a GCI of ± 0.6 %. As verification goes, that is a clean result.",
    },
    {
      type: "callout",
      text: "Then we compared it with the Haaland correlation: 4.8 % low, far outside the ± 0.6 % band.",
      hl: "4.8 % low",
      source: "Our straight-pipe validation run, 16 Oct 2026",
    },
    {
      type: "p",
      text: "Refining the mesh would never have found that gap, because the mesh did not cause it. It comes from the turbulence model at this fairly low Reynolds number. Only a comparison with something outside the model, a correlation or a measurement, shows it. That is the whole difference between the two words in one example.",
    },
    {
      type: "explainFigure",
      src: `${IMG}/h-pretty-vs-converged.webp`,
      alt: "Sketch of the same pipe twice: on the left a chaotic rainbow splash, on the right calm teal flow",
      width: 1536,
      height: 864,
      labels: ["Unchecked", "Converged, checked"],
      caption: "Checks turn a picture into a number you can use. Each check answers one question, and no single check answers them all. Illustration.",
    },

    { type: "sectionHead", n: 5, tint: "blue", eyebrow: "In practice", title: "What to ask of a CFD report" },
    {
      type: "ul",
      items: [
        "Converged residuals, or a clear statement that the run was stopped early and why.",
        "Wall layers fine enough for the wall model used (y+ ≈ 1 for a resolved boundary layer).",
        "A mesh-independence result with its band, if the decision depends on a few per cent.",
        "A validation case for the same kind of flow, against a correlation or measurements, with the gap stated.",
        "Each of these labelled for what it is: a verified number is not called validated.",
      ],
    },
    {
      type: "p",
      text: "Coreframe sells the mesh-independence study as its own package, called Verified: your duct or pipe case on three meshes, the GCI and a one-line verdict in the report. See [how our mesh independence study works](/cfd/mesh-independence-study), or start with [CFD for ducts and pipes](/cfd).",
    },
  ],
  faqs: () => [
    {
      q: "What is the difference between verification and validation in CFD?",
      a: "Verification checks that the equations were solved accurately: converged residuals and a mesh fine enough that refining it no longer changes the answer. Validation checks that the equations describe the real flow, by comparing with measurements or trusted correlations.",
    },
    {
      q: "Does a mesh independence study validate a CFD model?",
      a: "No. It is verification. It shows the error from the mesh is small; it does not show the turbulence model or the boundary conditions are right. Mesh-independent means the mesh error is small; it does not mean the result matches experiments.",
    },
    {
      q: "How do you calculate the grid convergence index?",
      a: "Solve the case on three meshes with a fixed refinement ratio r. From the three results, find the apparent order of convergence p. The GCI on the fine mesh is 1.25 times the relative change between the two finest meshes, divided by r to the power p minus 1 (Celik et al., 2008).",
    },
    {
      q: "What if the three meshes give results that go up and down?",
      a: "That is oscillatory convergence, and the standard GCI formula does not apply. A common practice (Stern et al., 2001) is to report 1.25 times half the spread of the three results as the band.",
    },
  ],
  related: [
    { href: "/cfd/mesh-independence-study", label: "Mesh independence study (GCI)" },
    { href: "/cfd", label: "CFD for ducts and pipes" },
    { href: "/cfd#right", label: "How we know the answer is right" },
  ],
};
