import type { BlogPost } from "../types";

const SLUG = "pressure-drop-calculation-hand-calc-vs-cfd";
const IMG = `/blog/${SLUG}`;

/**
 * DRAFT (16 Oct 2026): the first post in the CFD explainer style, from the
 * design agent's template (marketing-20261016-cfd-style/blog-pressure-drop.html).
 * Not approved for publishing: `draft: true` keeps it off production.
 *
 * Numbers: the worked example is textbook arithmetic (water at 20 °C, 4 m/s,
 * 50 mm commercial steel): Re = 998 × 4 × 0.05 / 0.001 ≈ 199,600; Haaland
 * with ε/D = 0.0009 gives f ≈ 0.0205; ρv²/2 ≈ 7.98 kPa. The elbow K = 0.3 is an
 * assumed table value and is labelled so; never present it as our result.
 * Coreframe claims are the /cfd ones only (RUNBOOK): 1–5 % vs
 * Haaland/Colebrook in a straight pipe, y+ ≈ 1 wall layers by default, the
 * residual target. No bend/fitting K accuracy figure.
 */
export const pressureDropHandCalcVsCfd: BlogPost = {
  slug: SLUG,
  title: "Pressure drop calculation for ducts and pipes: hand calc vs CFD",
  metaTitle: "Pressure Drop Calculation: Hand Calc vs CFD",
  description:
    "Darcy–Weisbach and K factors get you most of the way. Where the hand calculation runs out, and the three checks a CFD pressure drop has to pass before you trust it.",
  targetQueries: [
    "pressure drop calculation",
    "pipe pressure drop calculation",
    "duct pressure drop calculation",
    "darcy weisbach pressure drop example",
    "pressure drop cfd vs hand calculation",
  ],
  datePublished: "2026-10-16",
  draft: true,
  eyebrow: "CFD · Ducts and pipes",
  hero: {
    src: `${IMG}/j-pressure-drop-gauges.webp`,
    alt: "Sketch of a pipe with a valve and an elbow, and a pressure gauge on each side of the valve",
    width: 1536,
    height: 864,
    caption: "Every fitting costs pressure: the gauge after it reads lower than the one before. Illustration.",
  },
  answer: () =>
    "Pressure drop in a duct or pipe is the friction loss along the straight runs, from the Darcy–Weisbach equation, plus a loss for every fitting, from a loss coefficient K. For straight runs and standard fittings that hand calculation is fast and good enough. When a fitting is not in any table, or fittings sit close together, the hand calculation can only guess the biggest loss in the system, and a CFD run of the actual geometry is the better route, provided it shows converged residuals, a resolved wall layer and a mesh that no longer changes the answer.",
  body: () => [
    { type: "sectionHead", n: 1, tint: "teal", eyebrow: "The basics", title: "What pressure drop is made of" },
    {
      type: "p",
      text: "Fluid loses pressure in two ways. Along every metre of straight pipe or duct, friction at the wall takes a steady toll (the major loss). At every bend, tee, reducer, damper or valve, the flow separates and swirls and loses a lump more (the minor loss, which is often not minor at all).",
    },
    {
      type: "spec",
      label: "Darcy–Weisbach plus fittings",
      rows: [
        ["ΔP", "f · (L / D) · ρv²/2  +  ΣK · ρv²/2"],
        ["f", "Moody chart, Colebrook or Haaland"],
        ["K", "handbook tables, one per fitting"],
      ],
    },

    { type: "sectionHead", n: 2, tint: "blue", eyebrow: "Worked example", title: "The hand calculation", text: "Water at 4 m/s in a 50 mm pipe, about 20 °C." },
    {
      type: "table",
      head: ["Step", "Value", "How"],
      rows: [
        ["Reynolds number", "Re ≈ 199,600", "ρvD/μ with ρ = 998 kg/m³, μ = 1.0 mPa·s: fully turbulent"],
        ["Friction factor", "f ≈ 0.0205", "Haaland, commercial steel ε = 0.045 mm (Colebrook gives 0.0206)"],
        ["Dynamic pressure", "ρv²/2 ≈ 7.98 kPa", "998 × 4² / 2"],
        ["Straight pipe", "≈ 3.3 kPa per metre", "f / D × ρv²/2"],
        ["One 90° elbow", "≈ 2.4 kPa", "K = 0.3 taken as an example; handbook values vary widely with radius and make"],
      ],
    },
    { type: "note", text: "Worked example with textbook inputs. The elbow K is an assumed table value, not a Coreframe result." },

    { type: "sectionHead", n: 3, tint: "coral", eyebrow: "The limit", title: "Where the hand calc runs out" },
    {
      type: "p",
      text: "K tables are measured on standard fittings, one at a time, with long straight runs before and after. Real systems break those assumptions:",
    },
    {
      type: "ul",
      items: [
        "fittings that are not in any table: custom transitions, offsets, plenums, odd branch angles;",
        "fittings bolted close together, where the swirl from one changes the loss in the next;",
        "a quoted range so wide (a factor of two is common) that the total is a guess.",
      ],
    },
    {
      type: "callout",
      text: "When the fitting is not in the table, the hand calc can only guess the biggest loss in your system.",
      hl: "the biggest loss in your system",
      source: "Why engineers reach for CFD",
    },

    { type: "sectionHead", n: 4, tint: "teal", eyebrow: "The CFD route", title: "Geometry, mesh, solve, then check" },
    {
      type: "explainFigure",
      src: `${IMG}/b-process-geometry-mesh-solve.webp`,
      alt: "Sketch of the same pipe elbow three times: plain geometry, then covered in mesh, then with coloured flow",
      width: 1536,
      height: 640,
      caption: "Geometry, mesh, solve. The fluid volume becomes millions of small cells; the solver balances flow in every one. Illustration.",
    },
    {
      type: "p",
      text: "A CFD number is only as good as three checks. The residuals must fall below their target, so the answer has stopped changing. The cells at the wall must be thin enough (y+ ≈ 1) to resolve the boundary layer where the friction is made. And the answer must not move when the mesh is refined.",
    },
    { type: "statement", big: "y+ ≈ 1", caption: "wall layers on every Coreframe mesh by default" },
    {
      type: "explainFigure",
      src: `${IMG}/d-residuals-falling.webp`,
      alt: "Sketch of a chart: wavy coloured lines falling and settling from left to right",
      width: 1536,
      height: 864,
      caption: "Residuals falling. Each line is one equation's error; when all are under the target, the run is converged. Illustration, not data.",
    },
    {
      type: "p",
      text: "On our own validation cases, the friction factor in a straight pipe matched the Haaland/Colebrook correlation to about 1–5 %. That is the check to ask of any CFD provider: show the straight-pipe case against the textbook before you trust the fitting.",
    },

    { type: "sectionHead", n: 5, tint: "blue", eyebrow: "Choosing", title: "Hand calc or CFD: which one when" },
    {
      type: "table",
      head: ["", "Hand calc", "CFD"],
      rows: [
        ["Straight runs, standard fittings", "Yes: fast and good enough", "Rarely worth it"],
        ["Fitting not in any table", "A guess", "Yes"],
        ["Fittings close together", "Underestimates the interaction", "Yes, modelled together"],
        ["You need to see why", "No", "Flow paths, separation, hot spots"],
        ["Time", "Minutes", "Hours, plus checks"],
      ],
    },
    {
      type: "explainFigure",
      src: `${IMG}/e-accuracy-vs-time-scale.webp`,
      alt: "Sketch of a brass balance scale with an hourglass on one pan and an archery target on the other",
      width: 1536,
      height: 864,
      maxWidth: 520,
      caption: "Accuracy against time. Pick the cheapest method that answers the question. Illustration.",
    },
    {
      type: "p",
      text: "Coreframe runs [pressure drop CFD for duct and pipe STLs](/cfd): pre-processing and mesh validation first, then a quote, then the run and a report.",
    },
  ],
  faqs: () => [
    {
      q: "How do you calculate pressure drop in a pipe?",
      a: "Add the friction loss along the straight runs, f · (L/D) · ρv²/2 from the Darcy–Weisbach equation with f from Colebrook or Haaland, to a loss K · ρv²/2 for each fitting, with K from handbook tables.",
    },
    {
      q: "When is CFD better than a hand calculation for pressure drop?",
      a: "When a fitting is not in any K table, when fittings sit close enough together to affect each other, or when you need to see where the loss is made. For straight runs and standard fittings, the hand calculation is usually good enough.",
    },
    {
      q: "How do I know a CFD pressure drop is right?",
      a: "Ask for three things: residuals under their target (a converged run), wall layers fine enough to resolve the boundary layer (y+ ≈ 1), and evidence that refining the mesh no longer changes the answer. A straight-pipe case checked against Colebrook or Haaland is a good first test of any provider.",
    },
  ],
  related: [
    { href: "/cfd", label: "CFD for ducts and pipes" },
    { href: "/cfd#right", label: "How we know the answer is right" },
  ],
};
